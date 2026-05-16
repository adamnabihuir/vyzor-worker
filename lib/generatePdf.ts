import { jsPDF } from 'jspdf';
import type { ScanRow } from './supabase';

// ── Palette ────────────────────────────────────────────────────────────────────
type RGB = [number, number, number];

const WHITE: RGB  = [255, 255, 255];
const NAVY: RGB   = [15,  23,  42];   // slate-900
const DARK: RGB   = [30,  41,  59];   // slate-800
const BODY: RGB   = [51,  65,  85];   // slate-700
const MUTED: RGB  = [100, 116, 139];  // slate-500
const RULE: RGB   = [226, 232, 240];  // slate-200
const BG2: RGB    = [248, 250, 252];  // slate-50

const SEV: Record<string, { pill: RGB; text: RGB; row: RGB; label: string }> = {
  critical: { pill: [185, 28, 28],  text: WHITE, row: [254, 242, 242], label: 'CRITICAL' },
  high:     { pill: [194, 65, 12],  text: WHITE, row: [255, 247, 237], label: 'HIGH'     },
  medium:   { pill: [29,  78, 216], text: WHITE, row: [239, 246, 255], label: 'MEDIUM'   },
  low:      { pill: [21, 128, 61],  text: WHITE, row: [240, 253, 244], label: 'LOW'      },
  info:     { pill: [100, 116, 139], text: WHITE, row: [248, 250, 252], label: 'INFO'    },
};

const TOOL_COLOR: Record<string, RGB> = {
  nmap:   [30,  78, 216],
  nuclei: [124, 58, 237],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function grade(score: number): { g: string; color: RGB } {
  if (score <= 20) return { g: 'A', color: [21, 128,  61] };
  if (score <= 40) return { g: 'B', color: [29,  78, 216] };
  if (score <= 60) return { g: 'C', color: [194, 65,  12] };
  if (score <= 80) return { g: 'D', color: [185, 28,  28] };
  return             { g: 'F', color: [127,  29,  29] };
}

function riskLabel(score: number) {
  if (score <= 20) return 'Low Risk';
  if (score <= 40) return 'Medium Risk';
  if (score <= 60) return 'Elevated Risk';
  if (score <= 80) return 'High Risk';
  return 'Critical Risk';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function rgb(doc: jsPDF, c: RGB, fill = true) {
  if (fill) doc.setFillColor(c[0], c[1], c[2]);
  else      doc.setTextColor(c[0], c[1], c[2]);
}

function box(doc: jsPDF, x: number, y: number, w: number, h: number, color: RGB, r = 0) {
  rgb(doc, color);
  if (r > 0) doc.roundedRect(x, y, w, h, r, r, 'F');
  else       doc.rect(x, y, w, h, 'F');
}

function hRule(doc: jsPDF, y: number, x1 = 18, x2 = 192) {
  doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
  doc.setLineWidth(0.25);
  doc.line(x1, y, x2, y);
}

function addWatermark(doc: jsPDF) {
  doc.saveGraphicsState?.();
  rgb(doc, [226, 232, 240], false);   // very light gray
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.text('STRICTLY CONFIDENTIAL', 105, 148.5, { angle: 45, align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.restoreGraphicsState?.();
}

// ── Main export ────────────────────────────────────────────────────────────────

export function generateScanPdf(scan: ScanRow): void {
  const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W     = 210;
  const MX    = 18;   // margin x
  const CW    = W - MX * 2;

  const stats    = (scan.stats as { vulnerabilities?: { critical: number; high: number; medium: number; low: number }; riskScore?: number; assetsDiscovered?: number; portsScanned?: number }) ?? {};
  const v        = stats.vulnerabilities ?? { critical: 0, high: 0, medium: 0, low: 0 };
  const score    = stats.riskScore ?? 0;
  const { g, color: gColor } = grade(score);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findings = ((scan.findings ?? []) as any[]).filter(f => f.severity !== 'info');

  // ────────────────────────────────────────────────────────────────────────────
  // PAGE 1 — COVER
  // ────────────────────────────────────────────────────────────────────────────
  box(doc, 0, 0, W, 297, WHITE);

  // Dark header band
  box(doc, 0, 0, W, 52, NAVY);

  // Logo — left
  rgb(doc, WHITE, false);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('VYZOR', MX, 24);

  rgb(doc, [148, 163, 184] as RGB, false);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('ATTACK SURFACE MANAGEMENT', MX, 31);

  // Report label — right
  rgb(doc, [148, 163, 184] as RGB, false);
  doc.setFontSize(8);
  doc.text('SECURITY ASSESSMENT REPORT', W - MX, 20, { align: 'right' });
  rgb(doc, WHITE, false);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(fmtDate(scan.created_at ?? new Date().toISOString()), W - MX, 28, { align: 'right' });

  // STRICTLY CONFIDENTIAL stamp — red box top-right
  box(doc, W - MX - 52, 36, 52, 10, [185, 28, 28] as RGB, 2);
  rgb(doc, WHITE, false);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('STRICTLY CONFIDENTIAL', W - MX - 26, 42.5, { align: 'center' });

  // Domain title
  let y = 72;
  rgb(doc, NAVY, false);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(scan.domain ?? '—', MX, y);

  y += 8;
  rgb(doc, MUTED, false);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('External Attack Surface Assessment  ·  subfinder + nmap + nuclei', MX, y);

  // Thin rule
  y += 8;
  hRule(doc, y);

  // Risk score block
  y += 14;
  // Score card
  box(doc, MX, y, 56, 34, BG2, 4);
  doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(MX, y, 56, 34, 4, 4, 'S');

  // Grade circle
  box(doc, MX + 6, y + 6, 22, 22, gColor, 11);
  rgb(doc, WHITE, false);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(g, MX + 17, y + 20, { align: 'center' });

  // Score number
  rgb(doc, gColor, false);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${score}`, MX + 36, y + 16);
  rgb(doc, MUTED, false);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('/ 100', MX + 36, y + 23);
  rgb(doc, gColor, false);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(riskLabel(score).toUpperCase(), MX + 36, y + 30);

  // Stats row
  const statCols = [
    { label: 'Assets',        value: String(stats.assetsDiscovered ?? 0), color: DARK  },
    { label: 'Open Ports',    value: String(stats.portsScanned ?? 0),     color: DARK  },
    { label: 'Critical',      value: String(v.critical),  color: [185, 28, 28] as RGB  },
    { label: 'High',          value: String(v.high),      color: [194, 65, 12] as RGB  },
    { label: 'Medium',        value: String(v.medium),    color: [29, 78, 216] as RGB  },
    { label: 'Low',           value: String(v.low),       color: [21, 128, 61] as RGB  },
  ];
  const statW = (CW - 62) / 6;
  statCols.forEach((s, i) => {
    const sx = MX + 62 + i * statW;
    box(doc, sx, y, statW - 2, 34, BG2, 3);
    doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(sx, y, statW - 2, 34, 3, 3, 'S');
    rgb(doc, s.color, false);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(s.value, sx + (statW - 2) / 2, y + 16, { align: 'center' });
    rgb(doc, MUTED, false);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(s.label.toUpperCase(), sx + (statW - 2) / 2, y + 26, { align: 'center' });
  });

  // Executive Summary
  y += 44;
  hRule(doc, y);
  y += 10;
  rgb(doc, NAVY, false);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Executive Summary', MX, y);

  y += 7;
  rgb(doc, BODY, false);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const summary = `This automated security assessment details the external attack surface and exposed vulnerabilities of ${scan.domain ?? 'the target domain'}. The scan was performed using industry-standard open-source tools (subfinder for subdomain enumeration, nmap for port and service detection, and nuclei for vulnerability identification). A total of ${findings.length} security finding${findings.length !== 1 ? 's' : ''} were identified across ${stats.assetsDiscovered ?? 0} discovered assets. ${v.critical + v.high > 0 ? `Immediate remediation is strongly recommended for the ${v.critical + v.high} critical and high severity finding${v.critical + v.high !== 1 ? 's' : ''} detailed in this report.` : 'No critical or high severity findings were detected.'}`;
  const summaryLines = doc.splitTextToSize(summary, CW) as string[];
  summaryLines.forEach((line: string, i: number) => {
    doc.text(line, MX, y + i * 5.5);
  });

  y += summaryLines.length * 5.5 + 8;
  hRule(doc, y);

  // Metadata table
  y += 9;
  const meta = [
    ['Scan ID',    scan.id],
    ['Domain',     scan.domain ?? '—'],
    ['Started',    scan.created_at ? fmtDateTime(scan.created_at) : '—'],
    ['Completed',  scan.completed_at ? fmtDateTime(scan.completed_at) : '—'],
    ['Status',     (scan.status ?? '').toUpperCase()],
    ['Report Date', fmtDate(new Date().toISOString())],
  ];
  meta.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const mx  = MX + col * (CW / 2);
    rgb(doc, MUTED, false);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(label, mx, y + row * 12);
    rgb(doc, DARK, false);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const valLines = doc.splitTextToSize(value ?? '—', CW / 2 - 4) as string[];
    doc.text(valLines[0], mx, y + row * 12 + 5.5);
  });

  // Page footer
  rgb(doc, MUTED, false);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Generated by Vyzor Security Platform  ·  vyzor.io', MX, 286);
  doc.text('Page 1', W - MX, 286, { align: 'right' });
  hRule(doc, 283, MX, W - MX);

  // ────────────────────────────────────────────────────────────────────────────
  // PAGES 2+  — FINDINGS
  // ────────────────────────────────────────────────────────────────────────────

  if (findings.length === 0) {
    doc.addPage();
    box(doc, 0, 0, W, 297, WHITE);
    addWatermark(doc);
    addFindingsHeader(doc, scan.domain ?? '', 2);
    rgb(doc, MUTED, false);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('No security findings were detected in this scan.', MX, 60);
    addPageFooter(doc, 2, scan.domain ?? '');
    doc.save(`vyzor-report-${scan.domain}-${new Date().toISOString().slice(0, 10)}.pdf`);
    return;
  }

  let pageY   = 0;
  let pageNum = 1;

  const newPage = () => {
    doc.addPage();
    pageNum++;
    box(doc, 0, 0, W, 297, WHITE);
    addWatermark(doc);
    addFindingsHeader(doc, scan.domain ?? '', pageNum);
    addPageFooter(doc, pageNum, scan.domain ?? '');
    pageY = 44;
  };

  newPage();

  // Section title
  rgb(doc, NAVY, false);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Security Findings', MX, pageY);
  rgb(doc, MUTED, false);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`${findings.length} issue${findings.length !== 1 ? 's' : ''} identified — sorted by severity`, MX, pageY + 6.5);
  pageY += 16;

  hRule(doc, pageY);
  pageY += 8;

  findings.forEach((f, idx) => {
    const sev     = (f.severity ?? 'low').toLowerCase();
    const S       = SEV[sev] ?? SEV.low;
    const source  = (f.source ?? '').toLowerCase() as 'nmap' | 'nuclei';
    const toolClr = TOOL_COLOR[source] ?? MUTED;

    // Build text lines
    const titleLines = doc.splitTextToSize(f.title ?? 'Unnamed Finding', CW - 50) as string[];
    const assetStr   = f.asset ? `${f.asset}${f.port ? ` · Port ${f.port}/tcp` : ''}` : '';
    const assetLines = doc.splitTextToSize(assetStr, CW - 10) as string[];

    const rawDesc  = (f.description ?? '').replace(/\s+/g, ' ').trim();
    const descLines = rawDesc ? doc.splitTextToSize(rawDesc, CW - 10) as string[] : [];

    // Evidence line
    let evidence = '';
    if (source === 'nmap' && f.port) {
      const svcMatch = rawDesc.match(/Detected service:\s*(.+?)\.?\s*$/i);
      evidence = svcMatch ? svcMatch[1] : (assetStr || '');
    } else if (f.matched_at) {
      evidence = f.matched_at;
    } else if (f.template) {
      evidence = `Template: ${f.template}`;
    }
    const evLines = evidence ? doc.splitTextToSize(`Evidence: ${evidence}`, CW - 10) as string[] : [];

    const rawFix  = (f.remediation ?? '').replace(/\s+/g, ' ').trim();
    const fixLines = rawFix ? doc.splitTextToSize(rawFix, CW - 24) as string[] : [];

    // Row height estimation
    const innerH =
      titleLines.length * 5
      + (assetLines.length > 0 ? assetLines.length * 4 + 3 : 0)
      + (descLines.length  > 0 ? Math.min(descLines.length, 3) * 4.5 + 4 : 0)
      + (evLines.length    > 0 ? evLines.length * 4.5 + 3 : 0)
      + (fixLines.length   > 0 ? Math.min(fixLines.length, 2) * 4.5 + 5 : 0)
      + 14;  // padding top + bottom

    if (pageY + innerH > 268) newPage();

    // Row background
    if (idx % 2 === 0) box(doc, MX - 2, pageY - 2, CW + 4, innerH, S.row, 3);

    // Left severity bar
    box(doc, MX - 2, pageY - 2, 3, innerH, S.pill, 0);

    let ry = pageY + 4;

    // Severity pill
    box(doc, MX + 5, ry - 3.5, 20, 6.5, S.pill, 2);
    rgb(doc, S.text, false);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(S.label, MX + 15, ry + 0.5, { align: 'center' });

    // Tool badge
    box(doc, MX + 28, ry - 3.5, source ? 14 : 0, 6.5, toolClr, 2);
    if (source) {
      rgb(doc, WHITE, false);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.text(source.toUpperCase(), MX + 35, ry + 0.5, { align: 'center' });
    }

    // CVE tag
    if (f.cve) {
      box(doc, MX + 45, ry - 3.5, 36, 6.5, [243, 232, 255] as RGB, 2);
      rgb(doc, [124, 58, 237] as RGB, false);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.text(f.cve, MX + 63, ry + 0.5, { align: 'center' });
    }

    ry += 5;

    // Title
    rgb(doc, NAVY, false);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    titleLines.forEach((line: string, li: number) => doc.text(line, MX + 5, ry + li * 5));
    ry += titleLines.length * 5 + 2;

    // Asset + port
    if (assetLines.length > 0) {
      rgb(doc, MUTED, false);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      assetLines.forEach((line: string, li: number) => doc.text(line, MX + 5, ry + li * 4));
      ry += assetLines.length * 4 + 3;
    }

    // Description
    if (descLines.length > 0) {
      rgb(doc, BODY, false);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const showLines = descLines.slice(0, 3);
      showLines.forEach((line: string, li: number) => doc.text(line, MX + 5, ry + li * 4.5));
      ry += showLines.length * 4.5 + 3;
    }

    // Evidence
    if (evLines.length > 0) {
      rgb(doc, [71, 85, 105] as RGB, false);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('Evidence:', MX + 5, ry);
      rgb(doc, MUTED, false);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      const evText = evLines.join(' ');
      const evFormatted = doc.splitTextToSize(evText.replace(/^Evidence:\s*/, ''), CW - 30) as string[];
      evFormatted.slice(0, 2).forEach((line: string, li: number) => doc.text(line, MX + 22, ry + li * 4.5));
      ry += Math.min(evFormatted.length, 2) * 4.5 + 2;
    }

    // Remediation
    if (fixLines.length > 0) {
      // Tinted band
      box(doc, MX + 3, ry + 1, CW - 6, Math.min(fixLines.length, 2) * 4.5 + 7, [240, 253, 244] as RGB, 2);
      rgb(doc, [21, 128, 61] as RGB, false);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('Fix:', MX + 7, ry + 5.5);
      rgb(doc, BODY, false);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      fixLines.slice(0, 2).forEach((line: string, li: number) => {
        doc.text(line, MX + 17, ry + 5.5 + li * 4.5);
      });
      ry += Math.min(fixLines.length, 2) * 4.5 + 9;
    }

    pageY = ry + 6;

    // Separator
    if (idx < findings.length - 1) {
      hRule(doc, pageY - 3);
    }
  });

  doc.save(`vyzor-report-${scan.domain}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Sub-helpers ────────────────────────────────────────────────────────────────

function addFindingsHeader(doc: jsPDF, domain: string, page: number) {
  const W = 210, MX = 18;
  box(doc, 0, 0, W, 28, [15, 23, 42] as RGB);
  rgb(doc, [255, 255, 255] as RGB, false);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('VYZOR', MX, 13);
  rgb(doc, [148, 163, 184] as RGB, false);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Security Assessment — ${domain}`, W / 2, 13, { align: 'center' });
  doc.text(`Page ${page}`, W - MX, 13, { align: 'right' });
  rgb(doc, [100, 116, 139] as RGB, false);
  doc.setFontSize(7);
  doc.text('STRICTLY CONFIDENTIAL', W / 2, 22, { align: 'center' });
}

function addPageFooter(doc: jsPDF, page: number, domain: string) {
  const W = 210, MX = 18;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.25);
  doc.line(MX, 283, W - MX, 283);
  rgb(doc, [148, 163, 184] as RGB, false);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Vyzor Security Report — ${domain}`, MX, 288);
  doc.text(`Page ${page}  ·  STRICTLY CONFIDENTIAL`, W - MX, 288, { align: 'right' });
  void page; // used above
}
