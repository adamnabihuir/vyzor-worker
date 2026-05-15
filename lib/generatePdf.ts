import { jsPDF } from 'jspdf';
import type { ScanRow } from './supabase';

const C = {
  bg: [2, 26, 18] as [number, number, number],
  accent: [52, 211, 153] as [number, number, number],
  text: [240, 253, 244] as [number, number, number],
  muted: [100, 160, 130] as [number, number, number],
  critical: [239, 68, 68] as [number, number, number],
  high: [245, 158, 11] as [number, number, number],
  medium: [59, 130, 246] as [number, number, number],
  low: [52, 211, 153] as [number, number, number],
  panel: [15, 40, 28] as [number, number, number],
  border: [30, 60, 45] as [number, number, number],
};

const SEV_COLOR: Record<string, [number, number, number]> = {
  critical: C.critical, high: C.high, medium: C.medium, low: C.low, info: C.muted,
};

function setColor(doc: jsPDF, rgb: [number, number, number], fill = true) {
  if (fill) doc.setFillColor(...rgb);
  else doc.setTextColor(...rgb);
}

function rect(doc: jsPDF, x: number, y: number, w: number, h: number, color: [number, number, number], radius = 0) {
  setColor(doc, color);
  if (radius) doc.roundedRect(x, y, w, h, radius, radius, 'F');
  else doc.rect(x, y, w, h, 'F');
}

export function generateScanPdf(scan: ScanRow): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const MARGIN = 18;
  const CW = W - MARGIN * 2;

  // ── Page 1: Cover ──────────────────────────────────────────────────────────
  rect(doc, 0, 0, W, 297, C.bg);

  // Header bar
  rect(doc, 0, 0, W, 48, C.panel);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(0, 48, W, 48);

  // Logo
  setColor(doc, C.accent, false);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('VYZOR', MARGIN, 28);

  setColor(doc, C.muted, false);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Attack Surface Management', MARGIN, 35);

  // Report label top-right
  setColor(doc, C.muted, false);
  doc.setFontSize(8);
  doc.text('SECURITY REPORT', W - MARGIN, 24, { align: 'right' });
  setColor(doc, C.text, false);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), W - MARGIN, 31, { align: 'right' });

  // Domain title
  let y = 72;
  setColor(doc, C.accent, false);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(scan.domain, MARGIN, y);

  y += 10;
  setColor(doc, C.muted, false);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Deep Scan  ·  nmap + nuclei + subfinder', MARGIN, y);

  // Risk score badge
  const riskScore = scan.stats?.riskScore ?? 0;
  const riskColor: [number, number, number] = riskScore >= 75 ? C.critical : riskScore >= 50 ? C.high : riskScore >= 25 ? C.medium : C.low;
  const riskLabel = riskScore >= 75 ? 'Critical Risk' : riskScore >= 50 ? 'High Risk' : riskScore >= 25 ? 'Medium Risk' : 'Low Risk';
  y += 14;
  rect(doc, MARGIN, y, 48, 22, C.panel, 4);
  doc.setDrawColor(...riskColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, y, 48, 22, 4, 4, 'S');
  setColor(doc, riskColor, false);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(String(riskScore), MARGIN + 14, y + 13);
  doc.setFontSize(8);
  doc.text(riskLabel, MARGIN + 14 + 10, y + 13, { align: 'left' });

  // Stats grid
  y += 34;
  const stats = scan.stats ?? {};
  const v = stats.vulnerabilities ?? { critical: 0, high: 0, medium: 0, low: 0 };
  const statItems = [
    { label: 'Assets', value: String(stats.assetsDiscovered ?? 0) },
    { label: 'Open Ports', value: String(stats.portsScanned ?? 0) },
    { label: 'Critical', value: String(v.critical), color: C.critical },
    { label: 'High', value: String(v.high), color: C.high },
    { label: 'Medium', value: String(v.medium), color: C.medium },
    { label: 'Low', value: String(v.low), color: C.low },
  ];
  const cardW = (CW - 10) / 3;
  statItems.forEach((s, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = MARGIN + col * (cardW + 5);
    const cy = y + row * 28;
    rect(doc, cx, cy, cardW, 24, C.panel, 3);
    const valColor = s.color ?? C.text;
    setColor(doc, valColor, false);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(s.value, cx + cardW / 2, cy + 11, { align: 'center' });
    setColor(doc, C.muted, false);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(s.label.toUpperCase(), cx + cardW / 2, cy + 18, { align: 'center' });
  });

  // Divider
  y += 66;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, W - MARGIN, y);

  // Scan metadata
  y += 10;
  const metaItems = [
    ['Scan ID', scan.id.slice(0, 8) + '...'],
    ['Started', scan.created_at ? new Date(scan.created_at).toLocaleString('en-GB') : '—'],
    ['Completed', scan.completed_at ? new Date(scan.completed_at).toLocaleString('en-GB') : '—'],
    ['Status', scan.status.toUpperCase()],
  ];
  metaItems.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    setColor(doc, C.muted, false);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(label, MARGIN + col * (CW / 2), y + row * 12);
    setColor(doc, C.text, false);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(value, MARGIN + col * (CW / 2), y + row * 12 + 5);
  });

  // Footer
  setColor(doc, C.muted, false);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Generated by Vyzor — vyzor.io', MARGIN, 288);
  doc.text('CONFIDENTIAL', W - MARGIN, 288, { align: 'right' });

  // ── Page 2+: Findings ──────────────────────────────────────────────────────
  const findings = (scan.findings ?? []).filter((f: { severity?: string }) => f.severity !== 'info');
  if (findings.length === 0) {
    doc.addPage();
    rect(doc, 0, 0, W, 297, C.bg);
    rect(doc, 0, 0, W, 18, C.panel);
    setColor(doc, C.accent, false);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('VYZOR', MARGIN, 12);
    setColor(doc, C.muted, false);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('No findings detected.', MARGIN, 40);
    doc.save(`vyzor-report-${scan.domain}-${new Date().toISOString().slice(0, 10)}.pdf`);
    return;
  }

  let pageY = 0;
  const addFindingsPage = () => {
    doc.addPage();
    rect(doc, 0, 0, W, 297, C.bg);
    // Page header
    rect(doc, 0, 0, W, 18, C.panel);
    setColor(doc, C.accent, false);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('VYZOR', MARGIN, 11);
    setColor(doc, C.muted, false);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`${scan.domain} — Security Report`, W / 2, 11, { align: 'center' });
    doc.text(`Page ${doc.getNumberOfPages()}`, W - MARGIN, 11, { align: 'right' });
    pageY = 26;
  };

  addFindingsPage();

  // Findings section title
  setColor(doc, C.text, false);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Findings', MARGIN, pageY);
  setColor(doc, C.muted, false);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${findings.length} issues detected`, MARGIN, pageY + 7);
  pageY += 16;

  // Column headers
  rect(doc, MARGIN, pageY, CW, 8, C.panel);
  setColor(doc, C.muted, false);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('SEVERITY', MARGIN + 2, pageY + 5.5);
  doc.text('FINDING', MARGIN + 28, pageY + 5.5);
  doc.text('ASSET', MARGIN + 115, pageY + 5.5);
  doc.text('CVSS', MARGIN + 157, pageY + 5.5);
  pageY += 10;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findings.forEach((f: any) => {
    const sev = (f.severity ?? 'low').toLowerCase();
    const sevColor = SEV_COLOR[sev] ?? C.muted;

    // Estimate row height
    const titleLines = doc.splitTextToSize(f.title ?? '', 82) as string[];
    const descLines = doc.splitTextToSize(f.description ?? '', CW - 4) as string[];
    const rowH = Math.max(18, titleLines.length * 5 + descLines.slice(0, 2).length * 4 + 10);

    if (pageY + rowH > 278) addFindingsPage();

    // Row background
    rect(doc, MARGIN, pageY, CW, rowH, C.panel, 2);

    // Severity pill
    rect(doc, MARGIN + 2, pageY + 3, 22, 6, sevColor, 2);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(sev.toUpperCase(), MARGIN + 13, pageY + 7.5, { align: 'center' });

    // Title
    setColor(doc, C.text, false);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    titleLines.slice(0, 2).forEach((line: string, li: number) => {
      doc.text(line, MARGIN + 28, pageY + 7 + li * 5);
    });

    // CVE tag
    if (f.cve) {
      setColor(doc, [167, 139, 250] as [number, number, number], false);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.text(f.cve, MARGIN + 28, pageY + 7 + titleLines.slice(0, 2).length * 5 + 1);
    }

    // Asset
    setColor(doc, C.muted, false);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    const assetText = doc.splitTextToSize(f.asset ?? '', 38) as string[];
    doc.text(assetText[0] ?? '', MARGIN + 115, pageY + 7);

    // CVSS
    const cvss = typeof f.cvss === 'number' ? f.cvss.toFixed(1) : '—';
    setColor(doc, sevColor, false);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(cvss, MARGIN + 162, pageY + 7);

    // Description
    if (f.description) {
      setColor(doc, C.muted, false);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      const dLines = doc.splitTextToSize(f.description, CW - 4) as string[];
      dLines.slice(0, 2).forEach((line: string, li: number) => {
        doc.text(line, MARGIN + 2, pageY + titleLines.slice(0, 2).length * 5 + 7 + li * 4);
      });
    }

    // Remediation
    if (f.remediation) {
      const remY = pageY + rowH - 5;
      setColor(doc, C.accent, false);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('Fix: ', MARGIN + 2, remY);
      setColor(doc, C.muted, false);
      doc.setFont('helvetica', 'normal');
      const remLines = doc.splitTextToSize(f.remediation, CW - 12) as string[];
      doc.text(remLines[0] ?? '', MARGIN + 10, remY);
    }

    pageY += rowH + 3;
  });

  // Footer on last page
  setColor(doc, C.muted, false);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Generated by Vyzor — vyzor.io', MARGIN, 292);
  doc.text('CONFIDENTIAL', W - MARGIN, 292, { align: 'right' });

  doc.save(`vyzor-report-${scan.domain}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
