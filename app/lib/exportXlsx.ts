// Helper export Excel (.xlsx) — data rapi per sel memakai exceljs.
// Dipanggil dari sisi klien via dynamic import agar tidak membebani bundle utama.

export type XlsxValue = string | number | boolean | null | undefined;

export interface XlsxCol {
  header: string;
  width?: number;
  numFmt?: string;
  align?: 'left' | 'center' | 'right';
  wrap?: boolean;
  hidden?: boolean;   // sembunyiin kolom (bisa di-unhide manual di Excel)
}

export interface XlsxSheet {
  name: string;
  cols: XlsxCol[];
  rows: XlsxValue[][];
  freeze?: boolean;      // kunci baris header (default true)
  banded?: boolean;      // selang-seling warna baris (default true)
  autoFilter?: boolean;  // filter otomatis di header (default true)
  rowHeights?: number[]; // tinggi tiap baris data (px), paralel dgn rows
}

const HEADER_BG = 'FF23262D';
const HEADER_FG = 'FFFFFFFF';
const BAND_BG = 'FFEFF2F7';
const BORDER = 'FFD9DEE7';
const FONT = 'Calibri';

const clampWidth = (w: number) => Math.max(9, Math.min(60, Math.round(w)));

export async function downloadXlsx(filename: string, sheets: XlsxSheet[]): Promise<void> {
  const mod = await import('exceljs');
  // exceljs = CJS; di webpack bisa muncul sebagai `.default` atau langsung object
  const ExcelJS = (mod.default ?? mod) as typeof import('exceljs');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'DLI Tambun WMS';
  wb.created = new Date();

  sheets.forEach((sheet, si) => {
    const safeName = (sheet.name || `Sheet${si + 1}`).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31);
    const ws = wb.addWorksheet(safeName, {
      views: [{ state: 'frozen', ySplit: sheet.freeze === false ? 0 : 1 }],
    });

    const colCount = sheet.cols.length;
    const rows = sheet.rows.map(r => {
      const padded = [...r];
      while (padded.length < colCount) padded.push('');
      return padded.slice(0, colCount);
    });

    // ── header ──
    const headerRow = ws.addRow(sheet.cols.map(c => c.header));
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.font = { name: FONT, bold: true, color: { argb: HEADER_FG }, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = { bottom: { style: 'thin', color: { argb: HEADER_BG } } };
    });

    // ── data ──
    let dataRowCount = 0;
    rows.forEach((vals, ri) => {
      const row = ws.addRow(vals.map(v => (v === null || v === undefined ? '' : v)));
      const banded = sheet.banded !== false;
      row.eachCell((cell, col) => {
        const meta = sheet.cols[col - 1];
        const numLike = typeof cell.value === 'number';
        const align = meta?.align
          ?? (numLike || !!meta?.numFmt ? 'right' : 'left');

        cell.font = { name: FONT, size: 11, color: { argb: numLike ? 'FF1F3864' : 'FF20242C' } };
        cell.alignment = {
          vertical: 'middle',
          horizontal: align,
          wrapText: !!meta?.wrap,
        };
        if (meta?.numFmt && numLike) cell.numFmt = meta.numFmt;
        cell.border = {
          top: { style: 'hair', color: { argb: BORDER } },
          bottom: { style: 'hair', color: { argb: BORDER } },
          left: { style: 'hair', color: { argb: BORDER } },
          right: { style: 'hair', color: { argb: BORDER } },
        };
        if (banded && ri % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BAND_BG } };
        }
      });
      row.height = sheet.rowHeights?.[ri] ?? 20;
      dataRowCount += 1;
    });

    // ── lebar kolom (estimasi dari isi terpanjang) ──
    sheet.cols.forEach((meta, i) => {
      const ci = i + 1;
      let longest = meta.header.length;
      rows.forEach(r => {
        const cellText = String(r[i] ?? '');
        // baris berisi '\n' dianggap panjang 1 baris untuk estimasi
        const width = Math.max(...cellText.split('\n').map(l => l.length));
        longest = Math.max(longest, width);
      });
      let colWidth = meta.width ?? clampWidth(longest * 1.05 + 3);
      if (meta.wrap) colWidth = Math.max(meta.width ?? 40, colWidth);
      ws.getColumn(ci).width = colWidth;
      if (meta.hidden) ws.getColumn(ci).hidden = true;
    });

    // ── filter otomatis ──
    if (sheet.autoFilter !== false && dataRowCount > 0) {
      ws.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1 + dataRowCount, column: colCount },
      };
    }
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
