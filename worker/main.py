#!/usr/bin/env python3
"""
Vyzor Deep Scan Worker
----------------------
Polls Supabase for queued scans, runs subfinder → nmap → nuclei,
and writes structured results back to the database.

Requirements: subfinder, nmap, nuclei must be installed on the host.
See Dockerfile for installation.

Usage:
    cp .env.example .env   # fill in your Supabase credentials
    pip install -r requirements.txt
    python main.py
"""

import os
import json
import time
import subprocess
import logging
import xml.etree.ElementTree as ET
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# ─── Config ─────────────────────────────────────────────────────────────────────

SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY: str = os.environ["SUPABASE_SERVICE_KEY"]
VERCEL_URL: str = os.environ.get("VERCEL_URL", "").rstrip("/")
NOTIFY_SECRET: str = os.environ.get("NOTIFY_SECRET", "")

POLL_INTERVAL_IDLE = 3        # seconds between polls when no jobs
MAX_TARGETS_NMAP = 10         # nmap cap (more = slower)
MAX_TARGETS_NUCLEI = 15       # nuclei cap
MAX_SUBDOMAINS = 25           # subfinder output cap

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("vyzor-worker")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ─── Notify helper ───────────────────────────────────────────────────────────────

def notify_scan_done(scan_id: str) -> None:
    """Ping the Vercel notify endpoint so it sends the result email."""
    if not VERCEL_URL or not NOTIFY_SECRET:
        return
    try:
        payload = json.dumps({"scanId": scan_id}).encode()
        req = urllib.request.Request(
            f"{VERCEL_URL}/api/scan/notify",
            data=payload,
            headers={"Content-Type": "application/json", "x-notify-secret": NOTIFY_SECRET},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            log.info(f"[notify] {resp.status} — email queued for scan {scan_id}")
    except urllib.error.URLError as exc:
        log.warning(f"[notify] failed to send notification: {exc}")


# ─── DB helpers ─────────────────────────────────────────────────────────────────

def update_scan(scan_id: str, **fields) -> None:
    supabase.table("scans").update(fields).eq("id", scan_id).execute()


def fail_scan(scan_id: str, reason: str) -> None:
    log.error(f"Scan {scan_id} failed: {reason}")
    update_scan(scan_id, status="failed", error_message=reason[:2000])


# ─── Tool: subfinder ────────────────────────────────────────────────────────────

def run_subfinder(domain: str) -> list[str]:
    """Enumerate subdomains passively using subfinder."""
    log.info(f"[subfinder] {domain}")
    try:
        result = subprocess.run(
            ["subfinder", "-d", domain, "-silent", "-json"],
            capture_output=True, text=True, timeout=120,
        )
        subdomains: set[str] = {domain}
        for line in result.stdout.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                host = data.get("host", "").strip()
                if host:
                    subdomains.add(host)
            except json.JSONDecodeError:
                if "." in line:
                    subdomains.add(line)
        found = list(subdomains)[:MAX_SUBDOMAINS + 1]
        log.info(f"[subfinder] found {len(found)} hosts")
        return found
    except subprocess.TimeoutExpired:
        log.warning("[subfinder] timed out after 120s, continuing with domain only")
        return [domain]
    except FileNotFoundError:
        log.warning("[subfinder] binary not found, skipping")
        return [domain]


# ─── Tool: nmap ─────────────────────────────────────────────────────────────────

def run_nmap(targets: list[str]) -> list[dict]:
    """Port scan with service detection; returns list of open port dicts."""
    log.info(f"[nmap] scanning {len(targets)} targets")
    selected = targets[:MAX_TARGETS_NMAP]
    try:
        result = subprocess.run(
            ["nmap", "-sV", "--top-ports", "1000", "--open", "-T4", "-oX", "-"] + selected,
            capture_output=True, text=True, timeout=300,
        )
        ports = _parse_nmap_xml(result.stdout)
        log.info(f"[nmap] found {len(ports)} open ports")
        return ports
    except subprocess.TimeoutExpired:
        log.warning("[nmap] timed out after 300s")
        return []
    except FileNotFoundError:
        log.warning("[nmap] binary not found, skipping")
        return []


def _parse_nmap_xml(xml_str: str) -> list[dict]:
    ports = []
    try:
        root = ET.fromstring(xml_str)
    except ET.ParseError:
        return ports

    for host_el in root.findall("host"):
        addr_el = host_el.find("address[@addrtype='ipv4']")
        name_el = host_el.find("hostnames/hostname[@type='user']") or \
                  host_el.find("hostnames/hostname")
        ip = addr_el.get("addr", "") if addr_el is not None else ""
        hostname = name_el.get("name", ip) if name_el is not None else ip

        ports_el = host_el.find("ports")
        if ports_el is None:
            continue
        for port_el in ports_el.findall("port"):
            state_el = port_el.find("state")
            if state_el is None or state_el.get("state") != "open":
                continue
            svc = port_el.find("service")
            ports.append({
                "host": hostname,
                "ip": ip,
                "port": int(port_el.get("portid", 0)),
                "protocol": port_el.get("protocol", "tcp"),
                "service": svc.get("name", "unknown") if svc is not None else "unknown",
                "product": svc.get("product", "") if svc is not None else "",
                "version": svc.get("version", "") if svc is not None else "",
            })
    return ports


# ─── Tool: nuclei ────────────────────────────────────────────────────────────────

def run_nuclei(targets: list[str]) -> list[dict]:
    """
    Run Nuclei against targets using community templates.
    Targets must be domain names; we prefix with https://.
    """
    log.info(f"[nuclei] scanning {len(targets)} targets")
    urls = [f"https://{t}" for t in targets[:MAX_TARGETS_NUCLEI]]
    url_input = "\n".join(urls)
    try:
        result = subprocess.run(
            [
                "nuclei",
                "-json",                          # JSONL output
                "-severity", "critical,high,medium",
                "-t", "vulnerabilities/",
                "-t", "exposures/",
                "-t", "misconfiguration/",
                "-t", "technologies/",
                "-silent",
                "-no-color",
                "-rl", "50",                      # rate limit: 50 req/s
            ],
            input=url_input,
            capture_output=True, text=True, timeout=600,
        )
        findings = []
        for line in result.stdout.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                findings.append(json.loads(line))
            except json.JSONDecodeError:
                continue
        log.info(f"[nuclei] found {len(findings)} issues")
        return findings
    except subprocess.TimeoutExpired:
        log.warning("[nuclei] timed out after 600s")
        return []
    except FileNotFoundError:
        log.warning("[nuclei] binary not found, skipping")
        return []


# ─── Result compilation ──────────────────────────────────────────────────────────

SEVERITY_RANK = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}

DANGEROUS_PORTS = {
    21:    ("high",     "FTP Exposed — Plaintext Credentials"),
    22:    ("medium",   "SSH Port Publicly Accessible"),
    23:    ("critical", "Telnet Exposed — Cleartext Protocol"),
    25:    ("medium",   "SMTP Open — Potential Open Relay"),
    3306:  ("critical", "MySQL Database Exposed to Internet"),
    3389:  ("critical", "RDP Exposed — Prime Ransomware Target"),
    5432:  ("critical", "PostgreSQL Exposed to Internet"),
    5900:  ("critical", "VNC Remote Desktop Exposed"),
    6379:  ("critical", "Redis Exposed — Likely Unauthenticated"),
    9200:  ("critical", "Elasticsearch Exposed — No Auth"),
    27017: ("critical", "MongoDB Exposed — No Auth"),
}

DANGEROUS_PORT_DESC = {
    21:    "FTP transmits all data including credentials in plaintext.",
    22:    "SSH is open to the internet, inviting brute-force and credential stuffing attacks.",
    23:    "Telnet is severely deprecated. All data including passwords is sent in cleartext.",
    25:    "An open SMTP relay can be abused to send spam and phishing emails at scale.",
    3306:  "Exposing MySQL directly to the internet enables unauthenticated database access.",
    3389:  "RDP is the #1 ransomware attack vector. BlueKeep (CVSS 9.8) targets this port.",
    5432:  "PostgreSQL exposed to internet can allow unauthenticated data exfiltration.",
    5900:  "VNC is typically weakly authenticated and easily exploitable for full desktop access.",
    6379:  "Redis has no authentication by default. Full data read/write is trivially achievable.",
    9200:  "Elasticsearch with no auth exposes all indexed data to any internet user.",
    27017: "Unauthenticated MongoDB has caused some of the largest data breaches ever recorded.",
}


def compile_findings(
    ports: list[dict],
    nuclei_results: list[dict],
    domain: str,
    subdomains: list[str],
) -> list[dict]:
    findings = []
    idx = 0

    # Port-based findings
    seen_port_findings: set[str] = set()
    for p in ports:
        port_num = p["port"]
        if port_num not in DANGEROUS_PORTS:
            continue
        key = f"{p['host']}:{port_num}"
        if key in seen_port_findings:
            continue
        seen_port_findings.add(key)
        severity, title = DANGEROUS_PORTS[port_num]
        svc_detail = f"{p['product']} {p['version']}".strip()
        findings.append({
            "id": f"nmap_{idx}",
            "title": title,
            "severity": severity,
            "asset": p["host"],
            "port": port_num,
            "description": DANGEROUS_PORT_DESC.get(port_num, "")
                + (f" Detected service: {svc_detail}." if svc_detail else ""),
            "remediation": "Restrict this port via firewall rules. It must not be accessible from the public internet.",
            "source": "nmap",
        })
        idx += 1

    # Nuclei-based findings
    for n in nuclei_results:
        info = n.get("info", {})
        classification = info.get("classification", {}) or {}
        severity = info.get("severity", "info").lower()
        if severity not in SEVERITY_RANK:
            severity = "info"

        cve_ids: list[str] = classification.get("cve-id", []) or []
        cve = cve_ids[0] if cve_ids else None
        cvss = classification.get("cvss-score")

        asset = (
            n.get("host", domain)
            .replace("https://", "")
            .replace("http://", "")
            .split("/")[0]
        )

        findings.append({
            "id": f"nuclei_{idx}",
            "title": info.get("name", "Unnamed Finding"),
            "severity": severity,
            "asset": asset,
            "cve": cve,
            "cvss": round(float(cvss), 1) if cvss else None,
            "description": info.get("description", ""),
            "remediation": info.get("remediation", "Review the nuclei template for guidance."),
            "template": n.get("template-id", ""),
            "matched_at": n.get("matched-at", ""),
            "source": "nuclei",
        })
        idx += 1

    # Sort by severity
    findings.sort(key=lambda f: SEVERITY_RANK.get(f["severity"], 5))
    return findings


def compute_stats(subdomains: list[str], ports: list[dict], findings: list[dict]) -> dict:
    counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in findings:
        sev = f.get("severity", "low")
        if sev in counts:
            counts[sev] += 1

    risk = min(40, counts["critical"] * 20) \
         + min(30, counts["high"] * 10) \
         + min(20, counts["medium"] * 5) \
         + min(10, counts["low"] * 2)

    return {
        "assetsDiscovered": len(subdomains),
        "portsScanned": len(ports),
        "vulnerabilities": counts,
        "riskScore": min(100, risk),
    }


# ─── Scan orchestrator ───────────────────────────────────────────────────────────

def process_scan(scan_id: str, domain: str) -> None:
    log.info(f"═══ Starting deep scan: {domain} (id={scan_id}) ═══")
    now = lambda: datetime.now(timezone.utc).isoformat()

    try:
        # ── Phase 1: Subdomain discovery ──────────────────────────────────────
        update_scan(
            scan_id,
            status="running",
            progress=5,
            current_step="Discovering subdomains (subfinder)...",
            started_at=now(),
        )
        subdomains = run_subfinder(domain)
        all_targets = list(dict.fromkeys([domain] + subdomains))  # dedupe, order preserved

        update_scan(
            scan_id,
            progress=25,
            current_step=f"{len(all_targets)} targets found. Port scanning (nmap --top-ports 1000)...",
            subdomains=subdomains,
        )

        # ── Phase 2: Port scanning ────────────────────────────────────────────
        ports = run_nmap(all_targets)
        update_scan(
            scan_id,
            progress=55,
            current_step=f"{len(ports)} open ports found. Running Nuclei vulnerability scanner...",
            ports=ports,
        )

        # ── Phase 3: Nuclei ───────────────────────────────────────────────────
        nuclei_results = run_nuclei(all_targets)
        update_scan(scan_id, progress=88, current_step="Compiling and scoring results...")

        # ── Phase 4: Compile & save ───────────────────────────────────────────
        findings = compile_findings(ports, nuclei_results, domain, all_targets)
        stats = compute_stats(all_targets, ports, findings)

        update_scan(
            scan_id,
            status="completed",
            progress=100,
            current_step="Scan complete.",
            completed_at=now(),
            findings=findings,
            stats=stats,
        )
        log.info(
            f"═══ Done: {domain} — "
            f"{stats['vulnerabilities']['critical']} critical, "
            f"{stats['vulnerabilities']['high']} high, "
            f"{len(findings)} total findings ═══"
        )
        notify_scan_done(scan_id)

    except subprocess.TimeoutExpired as exc:
        fail_scan(scan_id, f"Phase timed out: {exc}")
        notify_scan_done(scan_id)
    except Exception as exc:
        log.exception("Unexpected error during scan")
        fail_scan(scan_id, str(exc))
        notify_scan_done(scan_id)


# ─── Event loop ──────────────────────────────────────────────────────────────────

def main() -> None:
    log.info("Vyzor Deep Scan Worker initialised.")
    log.info(f"Supabase: {SUPABASE_URL}")
    log.info("Waiting for scan jobs...")

    while True:
        try:
            resp = (
                supabase.table("scans")
                .select("id, domain")
                .eq("status", "queued")
                .order("created_at")
                .limit(1)
                .execute()
            )
            if resp.data:
                row = resp.data[0]
                scan_id: str = row["id"]
                domain: str = row["domain"]

                # Optimistic lock: only proceed if we successfully claimed it
                claim = (
                    supabase.table("scans")
                    .update({"status": "running", "current_step": "Worker picked up scan..."})
                    .eq("id", scan_id)
                    .eq("status", "queued")   # guard: only if still queued
                    .execute()
                )
                if claim.data:
                    process_scan(scan_id, domain)
                else:
                    log.info(f"Scan {scan_id} already claimed, skipping.")
            else:
                time.sleep(POLL_INTERVAL_IDLE)

        except KeyboardInterrupt:
            log.info("Worker stopped by user.")
            break
        except Exception as exc:
            log.error(f"Worker loop error: {exc}", exc_info=True)
            time.sleep(5)


if __name__ == "__main__":
    main()
