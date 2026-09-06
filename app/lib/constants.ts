// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────

export const statusDOLabel: Record<string, string> = {
  draft: 'Draft', proses: 'Proses', selesai: 'Selesai', batal: 'Batal',
};
export const statusDOBadge: Record<string, string> = {
  draft: 'b-gray', proses: 'b-yellow', selesai: 'b-green', batal: 'b-red',
};
export const statusAngkutanLabel: Record<string, string> = {
  tersedia: 'Ready', dalam_perjalanan: 'Sedang Jalan', maintenance: 'Maintenance', tidak_aktif: 'Off / Absen',
};
export const statusAngkutanBadge: Record<string, string> = {
  tersedia: 'b-green', dalam_perjalanan: 'b-yellow', maintenance: 'b-red', tidak_aktif: 'b-gray',
};
export const statusPengirimanLabel: Record<string, string> = {
  persiapan: 'Persiapan', jalan: 'Dalam Perjalanan', tiba: 'Sudah Tiba',
};

// ─── CSS ───────────────────────────────────────────────────────────────────────

export const CSS = `
  :root, [data-theme="dark"] {
    --bg: #0b0d14; --surface: #13151f; --card: #1a1d2b; --card2: #1f2235;
    --border: #252840; --border2: #2e3150;
    --accent: #e8a045; --accent2: #5b8af5; --accent3: #a259f7;
    --danger: #e05252; --success: #4caf7d; --warn: #f0c040;
    --text: #e8eaf0; --muted: #6b7090; --faint: #3a3f60;
    --font: 'Segoe UI', system-ui, sans-serif;
  }
  [data-theme="light"] {
    --bg: #f3f4f6; --surface: #ffffff; --card: #ffffff; --card2: #f9fafb;
    --border: #e5e7eb; --border2: #d1d5db;
    --accent: #d97706; --accent2: #2563eb; --accent3: #7c3aed;
    --danger: #dc2626; --success: #059669; --warn: #d97706;
    --text: #111827; --muted: #6b7280; --faint: #f3f4f6;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: var(--font); font-size: 13.5px; }
  label { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; display: block; }
  input, select, textarea { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; color: var(--text); padding: 8px 11px; font-size: 13px; outline: none; width: 100%; }
  input:focus, select:focus, textarea:focus { border-color: var(--accent); }
  textarea { resize: vertical; min-height: 60px; }

  .shell { display: flex; min-height: 100vh; }
  .sidebar { width: 230px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 20; overflow-y: auto; }
  .sidebar-logo { padding: 18px 16px 14px; border-bottom: 1px solid var(--border); }
  .logo-badge { font-size: 11px; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; }
  .logo-sub { font-size: 10px; color: var(--muted); margin-top: 2px; }
  nav { padding: 10px 8px; flex: 1; }
  .nav-group { margin-bottom: 6px; }
  .nav-label { font-size: 9.5px; color: var(--muted); padding: 10px 10px 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
  .nav-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 6px; cursor: pointer; color: var(--muted); font-size: 13px; border: none; background: none; width: 100%; text-align: left; transition: 0.12s; }
  .nav-item:hover { background: var(--card); color: var(--text); }
  .nav-item.active { background: rgba(232,160,69,0.13); color: var(--accent); font-weight: 600; }
  .sidebar-footer { padding: 12px 14px; border-top: 1px solid var(--border); }
  .user-chip { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--accent); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; flex-shrink: 0; }
  .main { margin-left: 230px; flex: 1; min-height: 100vh; }
  .topbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 13px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
  .content { padding: 22px 24px; }

  .card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; }
  .card-title { font-size: 10.5px; font-weight: 700; text-transform: uppercase; color: var(--muted); letter-spacing: 0.07em; margin-bottom: 14px; }
  .page-grid { display: grid; gap: 18px; }

  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 20px; }
  .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 15px 17px; position: relative; overflow: hidden; }
  .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .stat-card.orange::before { background: var(--accent); }
  .stat-card.blue::before   { background: var(--accent2); }
  .stat-card.green::before  { background: var(--success); }
  .stat-card.red::before    { background: var(--danger); }
  .stat-card.pink::before   { background: #ec4899; }
  .stat-card.purple::before { background: var(--accent3); }
  .stat-card.yellow::before { background: var(--warn); }
  .stat-card.white::before  { background: var(--text); }
  .stat-label { font-size: 10px; color: var(--muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .stat-val { font-size: 24px; font-weight: 800; color: var(--text); margin-top: 5px; line-height: 1; }
  .stat-sub { font-size: 11px; color: var(--muted); margin-top: 4px; }

  .table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid var(--border); background: var(--card); }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { background: var(--surface); border-bottom: 1px solid var(--border); }
  th { text-align: left; padding: 9px 14px; font-size: 10.5px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
  td { padding: 10px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.015); }

  .badge { display: inline-block; font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 20px; white-space: nowrap; }
  .b-masuk   { background: rgba(76,175,125,0.15);  color: var(--success); }
  .b-keluar  { background: rgba(224,82,82,0.15);   color: var(--danger); }
  .b-warn    { background: rgba(232,160,69,0.15);  color: var(--accent); }
  .b-blue    { background: rgba(91,138,245,0.15);  color: var(--accent2); }
  .b-purple  { background: rgba(162,89,247,0.15);  color: var(--accent3); }
  .b-gray    { background: rgba(107,112,144,0.15); color: var(--muted); }
  .b-yellow  { background: rgba(240,192,64,0.15);  color: var(--warn); }
  .b-red     { background: rgba(224,82,82,0.18);   color: var(--danger); }
  .b-green   { background: rgba(76,175,125,0.18);  color: var(--success); }

  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 15px; border-radius: 6px; font-size: 12.5px; font-weight: 700; cursor: pointer; border: none; white-space: nowrap; transition: opacity 0.12s; }
  .btn:hover { opacity: 0.88; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-sm      { padding: 5px 10px; font-size: 11.5px; }
  .btn-primary { background: var(--accent);  color: #000; }
  .btn-danger  { background: var(--danger);  color: #fff; }
  .btn-blue    { background: var(--accent2); color: #fff; }
  .btn-purple  { background: var(--accent3); color: #fff; }
  .btn-success { background: var(--success); color: #fff; }
  .btn-ghost   { background: transparent; color: var(--muted); border: 1px solid var(--border); }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }
  .form-group { display: flex; flex-direction: column; }
  .form-group.full { grid-column: 1 / -1; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal { background: var(--card); border: 1px solid var(--border2); border-radius: 12px; width: 100%; max-width: 560px; padding: 24px; max-height: 90vh; overflow-y: auto; }
  .modal-lg { max-width: 720px; }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
  .modal-title { font-size: 15px; font-weight: 700; }
  .modal-close { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 18px; padding: 2px 6px; }

  .divider { border: none; border-top: 1px solid var(--border); margin: 16px 0; }
  .flex-row     { display: flex; align-items: center; gap: 10px; }
  .flex-between { display: flex; align-items: center; justify-content: space-between; }
  .gap-12 { gap: 12px; }
  .mb-12  { margin-bottom: 12px; }
  .mb-16  { margin-bottom: 16px; }
  .mb-20  { margin-bottom: 20px; }
  .mt-14  { margin-top: 14px; }
  .text-muted   { color: var(--muted); }
  .text-sm      { font-size: 12px; }
  .text-xs      { font-size: 11px; }
  .font-bold    { font-weight: 700; }
  .text-success { color: var(--success); }
  .text-danger  { color: var(--danger); }
  .text-accent  { color: var(--accent); }
  .text-blue    { color: var(--accent2); }
  .text-purple  { color: var(--accent3); }
  .text-center  { text-align: center; }
  .w-full { width: 100%; }
  .empty-row td { text-align: center; color: var(--muted); padding: 28px !important; }

  .pbar-wrap { background: var(--surface); height: 7px; border-radius: 4px; overflow: hidden; margin-top: 5px; }
  .pbar { height: 100%; border-radius: 4px; transition: width 0.4s; }

  .timeline { display: flex; flex-direction: column; gap: 0; }
  .timeline-item { display: flex; gap: 14px; }
  .timeline-left { display: flex; flex-direction: column; align-items: center; width: 28px; flex-shrink: 0; }
  .tl-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--border); background: var(--surface); flex-shrink: 0; margin-top: 3px; }
  .tl-dot.done   { background: var(--success); border-color: var(--success); }
  .tl-dot.active { background: var(--accent);  border-color: var(--accent); animation: pulse 1.5s infinite; }
  .tl-line { flex: 1; width: 2px; background: var(--border); margin: 3px 0; min-height: 24px; }
  .timeline-body { padding-bottom: 16px; flex: 1; }

  .alert { padding: 10px 14px; border-radius: 7px; font-size: 12.5px; display: flex; align-items: center; gap: 8px; }
  .alert-danger  { background: rgba(224,82,82,0.1);  border: 1px solid rgba(224,82,82,0.22);  color: var(--danger); }
  .alert-success { background: rgba(76,175,125,0.1); border: 1px solid rgba(76,175,125,0.22); color: var(--success); }
  .alert-warn    { background: rgba(232,160,69,0.1); border: 1px solid rgba(232,160,69,0.22); color: var(--accent); }

  .toast { position: fixed; bottom: 22px; right: 22px; background: var(--card2); border: 1px solid var(--border2); border-radius: 8px; padding: 11px 16px; font-size: 13px; font-weight: 600; z-index: 999; box-shadow: 0 4px 24px rgba(0,0,0,0.5); max-width: 340px; }
  .toast.success { border-color: var(--success); color: var(--success); }
  .toast.error   { border-color: var(--danger);  color: var(--danger); }

  .live-dot { width: 7px; height: 7px; background: var(--success); border-radius: 50%; display: inline-block; animation: pulse 2s infinite; margin-right: 5px; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }

  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 16px; }
  .section-title  { font-size: 14px; font-weight: 700; }
  .section-subtitle { font-size: 12.5px; color: var(--muted); margin-top: 4px; }

  .note-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
  .filter-pill { min-width: max-content; border-color: transparent; color: var(--muted); transition: background 0.2s, color 0.2s, border-color 0.2s; }
  .filter-pill.active { background: rgba(255,255,255,0.08); color: var(--text); border-color: var(--border); }

  .note-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; }
  .note-card { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; box-shadow: 0 18px 45px rgba(0,0,0,0.04); display: flex; flex-direction: column; }
  .note-card-strip { width: 100%; height: 6px; }
  .note-card-content { position: relative; padding: 20px 20px 18px 18px; display: flex; flex-direction: column; min-height: 340px; }
  .note-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
  .note-card-title { font-size: 15px; font-weight: 800; line-height: 1.2; color: var(--text); }
  .note-card-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
  .note-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; background: rgba(255,255,255,0.92); color: var(--text); }
  .note-tag { display: inline-flex; align-items: center; padding: 5px 10px; border-radius: 999px; font-size: 11px; color: var(--muted); background: rgba(0,0,0,0.05); }
  .note-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
  .note-card-body { color: var(--text-sub); font-size: 13px; line-height: 1.7; white-space: pre-wrap; min-height: 90px; }
  .note-meta { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; font-size: 11px; color: var(--muted); align-items: center; }
  .note-comments { display: grid; gap: 10px; }
  .comment-item { background: rgba(255,255,255,0.8); border-radius: 14px; padding: 12px 14px; border: 1px solid rgba(0,0,0,0.04); }
  .comment-author { font-size: 12px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .comment-body { font-size: 12px; line-height: 1.5; white-space: pre-wrap; color: var(--text-sub); }
  .comment-meta { margin-top: 8px; font-size: 10px; color: var(--muted); }
  .note-comment-input { display: flex; gap: 10px; align-items: flex-end; margin-top: auto; }
  .comment-input { min-height: 38px; max-height: 96px; border-radius: 12px; border: 1px solid var(--border); background: var(--card); padding: 10px 12px; color: var(--text); font-size: 13px; resize: vertical; width: 100%; }
  .note-empty-state { padding: 32px 18px; text-align: center; color: var(--muted); border: 1px dashed var(--border); border-radius: 16px; background: var(--card); }

  .chart-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 18px; }
  .chart-card-title { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
  .chart-legend { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--muted); margin-bottom: 14px; }
  .chart-legend span { display: inline-flex; align-items: center; gap: 8px; }
  .chart-legend-dot { width: 10px; height: 10px; border-radius: 999px; display: inline-block; }
  .chart-area { display: grid; gap: 12px; }
  .chart-row { display: grid; grid-template-columns: minmax(120px, 1fr) 4fr; gap: 12px; align-items: center; }
  .chart-label { font-size: 12px; color: var(--muted); }
  .chart-bars { display: grid; gap: 8px; }
  .chart-bar-group { display: grid; gap: 6px; }
  .chart-bar-track { background: rgba(255,255,255,0.08); border-radius: 999px; height: 12px; overflow: hidden; }
  .chart-bar { height: 100%; border-radius: 999px; }
  .chart-bar-meta { font-size: 11px; color: var(--muted); }

  .tabs { display: flex; gap: 4px; background: var(--surface); border-radius: 8px; padding: 3px; border: 1px solid var(--border); margin-bottom: 18px; }
  .tab { padding: 7px 14px; border-radius: 6px; font-size: 12.5px; font-weight: 600; cursor: pointer; border: none; background: none; color: var(--muted); }
  .tab.active { background: var(--card); color: var(--text); }

  .info-row { display: flex; align-items: flex-start; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--border); }
  .info-row:last-child { border-bottom: none; }
  .info-key { font-size: 11px; color: var(--muted); font-weight: 600; width: 130px; flex-shrink: 0; text-transform: uppercase; padding-top: 1px; }
  .info-val { font-size: 13px; }

  .do-item-row { display: flex; gap: 10px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .do-item-row:last-child { border: none; }

  .detail-header { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--border); margin-bottom: 14px; }
  .detail-icon  { font-size: 28px; }
  .detail-title { font-size: 16px; font-weight: 800; }
  .detail-sub   { font-size: 12px; color: var(--muted); margin-top: 2px; }

  /* Pallet balance bar */
  .balance-row { display: flex; height: 12px; border-radius: 6px; overflow: hidden; gap: 2px; margin: 8px 0 4px; }
  .balance-seg { height: 100%; border-radius: 3px; transition: width 0.4s; }

  /* --- NEW DASHBOARD STYLES --- */
  .dash-header { margin-bottom: 24px; }
  .dash-title { font-size: 28px; font-weight: 700; color: var(--text); letter-spacing: -0.02em; margin-bottom: 4px; }
  .dash-subtitle { font-size: 14px; color: var(--muted); }

  .dash-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
  .dash-card-stat { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 20px; display: flex; flex-direction: column; position: relative; }
  .dash-card-stat.primary { background: #116c4c; border-color: #116c4c; color: #fff; }
  .dash-card-stat.primary .stat-title, .dash-card-stat.primary .stat-sub { color: rgba(255,255,255,0.8); }
  .dash-card-stat.primary .stat-val { color: #fff; }
  .dash-card-stat .stat-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
  .dash-card-stat .stat-val { font-size: 36px; font-weight: 700; line-height: 1.1; margin-bottom: 8px; }
  .dash-card-stat .stat-sub { font-size: 12px; color: var(--muted); font-weight: 500; display: flex; align-items: center; gap: 4px; }
  .dash-icon-circle { width: 32px; height: 32px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .dash-card-stat.primary .dash-icon-circle { border-color: rgba(255,255,255,0.3); }

  .dash-grid-bento { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px; }
  .dash-grid-bento-bottom { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  
  .dash-panel { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 24px; display: flex; flex-direction: column; }
  .dash-panel-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
  
  .dash-bar-chart { display: flex; align-items: flex-end; gap: 12px; height: 160px; margin-top: auto; padding-top: 20px; }
  .dash-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; justify-content: flex-end; height: 100%; }
  .dash-bar-fill { width: 100%; max-width: 48px; border-radius: 24px; transition: height 0.5s ease; position: relative; }
  .dash-bar-fill.striped { background: repeating-linear-gradient( 45deg, transparent, transparent 4px, rgba(17, 108, 76, 0.2) 4px, rgba(17, 108, 76, 0.2) 8px ); border: 2px solid rgba(17, 108, 76, 0.2); }
  .dash-bar-fill.solid { background: #116c4c; }
  .dash-bar-fill.light { background: #4caf7d; }
  .dash-bar-label { font-size: 12px; font-weight: 600; color: var(--muted); }

  .dash-list-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .dash-list-item:last-child { border-bottom: none; padding-bottom: 0; }
  .dash-avatar { width: 36px; height: 36px; border-radius: 50%; background: #f0fdf4; color: #116c4c; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
  .dash-list-info { flex: 1; }
  .dash-list-title { font-size: 14px; font-weight: 600; color: var(--text); }
  .dash-list-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .dash-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .dash-badge.green { background: #f0fdf4; color: #116c4c; }
  .dash-badge.yellow { background: #fefce8; color: #b45309; }

  .dash-doughnut { position: relative; width: 140px; height: 140px; margin: 0 auto; }
  .dash-doughnut-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .dash-doughnut-bg { fill: none; stroke: var(--border); stroke-width: 12; }
  .dash-doughnut-val { fill: none; stroke: #116c4c; stroke-width: 12; stroke-linecap: round; stroke-dasharray: 283; transition: stroke-dashoffset 1s ease; }
  .dash-doughnut-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .dash-doughnut-pct { font-size: 32px; font-weight: 700; color: var(--text); line-height: 1; }
  .dash-doughnut-lbl { font-size: 11px; color: var(--muted); margin-top: 4px; }

  @media (max-width: 1100px) {
    .dash-grid-4 { grid-template-columns: repeat(2, 1fr); }
    .dash-grid-bento { grid-template-columns: 1fr; }
    .dash-grid-bento-bottom { grid-template-columns: 1fr; }
  }

  @media print {
    .sidebar,.topbar,.btn,.card-title,input,select { display: none !important; }
    .main { margin-left: 0 !important; }
    table { color: #000 !important; }
  }
`;
