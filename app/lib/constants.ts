// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────

export const absenStatusLabel: Record<string, string> = {
  hadir: 'Hadir',
  tidak: 'Tidak Hadir',
};

export const absenPalletLabel: Record<string, string> = {
  gudang_kita: 'Dari gudang kita',
  gudang_lain: 'Dibawa dari gudang lain',
  tidak_ada: 'Tidak bawa pallet',
};

export const DEFAULT_PALLET_SUPIR = 4;

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

// ── Buku Tanda Terima DO ──
export const statusKirimLabel: Record<string, string> = {
  belum: 'Belum', tunggu_info: 'Tunggu Info', terkirim: 'Terkirim', batal: 'Batal',
};
export const statusKirimBadge: Record<string, string> = {
  belum: 'b-gray', tunggu_info: 'b-yellow', terkirim: 'b-green', batal: 'b-red',
};
export const statusSetoranLabel: Record<string, string> = {
  belum: 'Belum', disetor: 'Disetor',
};
export const statusSetoranBadge: Record<string, string> = {
  belum: 'b-yellow', disetor: 'b-green',
};
export const statusCekLabel: Record<string, string> = {
  belum: 'Perlu Dicek', sudah: 'Sudah Dicek',
};
export const statusCekBadge: Record<string, string> = {
  belum: 'b-yellow', sudah: 'b-green',
};
// Label status kirim dalam bentuk Inggris untuk export Excel (match format user).
export const statusKirimLabelEn: Record<string, string> = {
  belum: 'PENDING', tunggu_info: 'WAITING INFO', terkirim: 'DELIVERED', batal: 'CANCELLED',
};
export const ALASAN_TUNGU = [
  'Sales belum atur tanggal',
  'Sales lupa mundurin jadwal',
  'Tunggu konfirmasi toko',
  'Lainnya',
];
export const SETORAN_DEFAULT_NOTE = 'SURAT JALAN SUDAH DI SETOR KE GUDANG';

// ─── CSS ───────────────────────────────────────────────────────────────────────
// Industrial claymorphism design system — soft extruded "clay" surfaces mixed
// with concrete-grey, safety-amber accents & hazard stripes. Two themes:
// dark ("night shift") & light ("cast concrete").

export const CSS = `
  /* ════════════════════════════════════════════════════════════════════════
     INDUSTRIAL CLAY — TOKENS
     ════════════════════════════════════════════════════════════════════════ */

  /* ── DARK (default) "NIGHT SHIFT" ── */
  :root, [data-theme="dark"] {
    /* concrete graphite layers */
    --bg:      #14161b;
    --bg-soft: #181b22;
    --surface: #1c1f27;
    --card:    #21252e;   /* raised clay   */
    --card2:   #191c24;   /* embedded well */
    --card3:   #2a2f3b;   /* deeper layer  */
    --border:  rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.13);
    --seam:    rgba(0,0,0,0.35);

    /* safety palette */
    --accent:  #f6a60a;   /* safety amber  */
    --accent2: #4b8dff;   /* steel blue    */
    --accent3: #a07bff;   /* weld purple   */
    --danger:  #ff5c5c;
    --success: #35cf7a;
    --warn:    #ffc233;

    --text:     #eef1f6;
    --text-sub: #b9bfcd;
    --muted:    #7c8498;
    --faint:    #232733;

    --radius:   16px;
    --radius-lg: 24px;
    --font: 'Inter', 'Segoe UI', system-ui, sans-serif;

    /* clay emboss */
    --sh-raise:  6px 6px 14px rgba(0,0,0,0.55), -6px -6px 14px rgba(255,255,255,0.045);
    --sh-raise-lg: 14px 14px 34px rgba(0,0,0,0.62), -10px -10px 26px rgba(255,255,255,0.05);
    --sh-press:  inset 4px 4px 10px rgba(0,0,0,0.62), inset -4px -4px 9px rgba(255,255,255,0.04);
    --sh-well:   inset 3px 3px 9px rgba(0,0,0,0.5);
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.4);
    --shadow-md: var(--sh-raise);
    --shadow-lg: var(--sh-raise-lg);

    /* hazard stripe colours */
    --hz-a: #f6a60a;
    --hz-b: rgba(10,11,14,0.9);
  }

  /* ── LIGHT "CAST CONCRETE" ── */
  [data-theme="light"] {
    --bg:      #e3e6ec;
    --bg-soft: #e9ecf2;
    --surface: #edf0f5;
    --card:    #f4f6fa;
    --card2:   #e5e8ef;
    --card3:   #fbfcfe;
    --border:  #d6dae3;
    --border2: #bfc6d4;
    --seam:    rgba(20,23,28,0.14);

    --accent:  #ed9608;
    --accent2: #2f6fed;
    --accent3: #8b5cf6;
    --danger:  #e5484d;
    --success: #219d60;
    --warn:    #d97706;

    --text:     #20242c;
    --text-sub: #4a515d;
    --muted:    #7a8291;
    --faint:    #eceff4;

    --radius:   16px;
    --radius-lg: 24px;
    --font: 'Inter', 'Segoe UI', system-ui, sans-serif;

    --sh-raise:   6px 6px 14px rgba(150,157,171,0.40), -6px -6px 14px rgba(255,255,255,0.85);
    --sh-raise-lg: 14px 14px 30px rgba(146,153,168,0.42), -10px -10px 24px rgba(255,255,255,0.9);
    --sh-press:   inset 4px 4px 10px rgba(150,157,171,0.38), inset -4px -4px 10px rgba(255,255,255,0.75);
    --sh-well:    inset 3px 3px 9px rgba(150,157,171,0.30);
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
    --shadow-md: var(--sh-raise);
    --shadow-lg: var(--sh-raise-lg);

    --hz-a: #f2a60b;
    --hz-b: #23262d;
  }

  /* ── RESET & BASE ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scrollbar-color: var(--border2) transparent; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 14px;
    line-height: 1.5;
    min-height: 100dvh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  ::selection { background: rgba(246,166,10,0.3); }
  h1,h2,h3,h4 { letter-spacing: -0.02em; }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; border: 2px solid var(--bg); }

  /* inputs / selects — font-size 16px prevents iOS zoom */
  input, select, textarea {
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    padding: 10px 14px;
    font-size: 16px;
    font-family: var(--font);
    outline: none;
    width: 100%;
    box-shadow: var(--sh-well);
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    -webkit-appearance: none;
  }
  input:focus, select:focus, textarea:focus {
    border-color: var(--accent);
    background: var(--card);
    box-shadow: 0 0 0 3px rgba(246,166,10,0.16), var(--sh-well);
  }
  input::placeholder, textarea::placeholder { color: var(--muted); opacity: 0.65; }
  textarea { resize: vertical; min-height: 72px; }
  label {
    font-size: 10.5px;
    font-weight: 800;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.09em;
    margin-bottom: 6px;
    display: block;
  }

  /* ════════════════════════════════════════════════════════════════════════
     SHELL / LAYOUT
     ════════════════════════════════════════════════════════════════════════ */
  .shell { display: flex; min-height: 100dvh; background:
    radial-gradient(1200px 500px at 85% -10%, var(--bg-soft), transparent 60%),
    var(--bg); }

  /* ── Sidebar : industrial control rail ── */
  .sidebar {
    width: 258px;
    background: linear-gradient(180deg, var(--surface), var(--bg));
    border-right: 1px solid var(--border);
    box-shadow: 8px 0 26px rgba(0,0,0,0.12);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 40;
    overflow-y: auto;
    overflow-x: hidden;
    transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
  }
  /* hazard tick on rail top edge */
  .sidebar::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 5px;
    background: repeating-linear-gradient(-45deg, var(--hz-a) 0 10px, var(--hz-b) 10px 20px);
    opacity: 0.85;
    z-index: 2;
  }

  .sidebar-logo {
    padding: 26px 18px 18px;
    display: flex;
    align-items: center;
    gap: 13px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 4px;
  }
  .sidebar-logo-icon {
    width: 46px; height: 46px;
    border-radius: 15px;
    background: linear-gradient(145deg, #f8b02a, #dd8b04);
    color: #211500;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 4px 4px 10px rgba(0,0,0,0.3), -3px -3px 8px rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.25);
  }
  .sidebar-logo-icon svg { width: 22px; height: 22px; }
  .logo-badge {
    font-size: 15px;
    font-weight: 900;
    color: var(--text);
    letter-spacing: -0.01em;
    line-height: 1.15;
    text-transform: uppercase;
  }
  .logo-sub {
    font-size: 10px;
    color: var(--muted);
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-top: 3px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .logo-sub::before {
    content: '';
    width: 14px; height: 3px;
    border-radius: 99px;
    background: repeating-linear-gradient(-45deg, var(--hz-a) 0 4px, var(--hz-b) 4px 8px);
    display: inline-block;
  }

  nav { padding: 10px 12px 16px; flex: 1; }
  .nav-group { margin-bottom: 4px; }
  .nav-label {
    font-size: 9.5px;
    color: var(--muted);
    padding: 13px 10px 7px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .nav-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--border2), transparent);
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 14px;
    cursor: pointer;
    color: var(--muted);
    font-size: 13.5px;
    font-weight: 600;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    position: relative;
    margin-bottom: 2px;
    transition: background 0.16s, color 0.16s, box-shadow 0.16s, transform 0.08s;
    white-space: nowrap;
  }
  .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; opacity: 0.85; }
  .nav-item:hover { background: var(--card2); color: var(--text); }
  .nav-item:active { transform: translateY(1px); }
  .nav-item.active {
    background: linear-gradient(135deg, rgba(246,166,10,0.20), rgba(246,166,10,0.07));
    color: var(--accent);
    font-weight: 800;
    box-shadow: var(--sh-press);
  }
  .nav-item.active::before {
    content: '';
    position: absolute; left: -12px; top: 50%;
    transform: translateY(-50%);
    width: 4px; height: 60%;
    border-radius: 0 6px 6px 0;
    background: repeating-linear-gradient(-45deg, var(--hz-a) 0 5px, var(--hz-b) 5px 10px);
  }
  .nav-item.active svg { opacity: 1; color: var(--accent); }

  .sidebar-footer {
    padding: 14px 16px 20px;
    border-top: 1px solid var(--border);
    background: linear-gradient(0deg, var(--bg), transparent);
  }
  .user-chip {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 12px;
    border-radius: 16px;
    background: var(--card2);
    box-shadow: var(--sh-press);
    border: 1px solid var(--border);
    margin-bottom: 12px;
  }
  .avatar {
    width: 38px; height: 38px;
    border-radius: 13px;
    background: linear-gradient(145deg, #f8b02a, #dd8b04);
    color: #211500;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900;
    font-size: 15px;
    flex-shrink: 0;
    box-shadow: 2px 2px 6px rgba(0,0,0,0.3);
  }

  /* ── Main content ── */
  .main { margin-left: 258px; flex: 1; min-height: 100dvh; display: flex; flex-direction: column; }

  /* ── Topbar : command strip ── */
  .topbar {
    background: color-mix(in srgb, var(--surface) 88%, transparent);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 6px 18px rgba(0,0,0,0.06);
    padding: 0 22px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 30;
    gap: 12px;
  }
  .topbar-left { display: flex; align-items: center; gap: 13px; min-width: 0; flex: 1; }
  .topbar-title {
    font-size: 16px;
    font-weight: 900;
    color: var(--text);
    letter-spacing: -0.01em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.25;
  }
  .topbar-title-sub {
    font-size: 10.5px;
    color: var(--muted);
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-top: 1px;
  }
  .tb-icon-chip {
    width: 40px; height: 40px;
    border-radius: 14px;
    background: var(--card);
    color: var(--accent);
    box-shadow: var(--sh-raise);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .tb-icon-chip svg { width: 19px; height: 19px; }
  .topbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .tb-pill {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: 99px;
    padding: 6px 12px;
    font-size: 11.5px;
    font-weight: 700;
    color: var(--muted);
    white-space: nowrap;
    box-shadow: var(--sh-well);
  }
  .tb-pill svg { width: 13px; height: 13px; }
  .topbar-datetime { font-size: 11px; color: var(--text-sub); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .topbar-datetime b { color: var(--accent); }
  .topbar-live { color: var(--success); }

  .content { padding: 24px; flex: 1; }

  /* Sidebar overlay backdrop */
  .sidebar-overlay {
    display: none;
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 35;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }

  /* Hamburger: hidden desktop, shown mobile */
  .hamburger-btn { display: none !important; }

  /* ── PAGE HEADERS ── */
  .page-head { margin-bottom: 20px; }
  .page-title {
    font-size: 22px; font-weight: 900; color: var(--text); letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 10px; line-height: 1.2;
  }
  .page-sub { font-size: 13px; color: var(--muted); margin-top: 4px; }

  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
  .section-title {
    font-size: 17px; font-weight: 900; color: var(--text);
    display: flex; align-items: center; gap: 10px; letter-spacing: -0.01em;
  }
  .section-title::before {
    content: '';
    width: 5px; height: 20px;
    border-radius: 6px;
    background: repeating-linear-gradient(-45deg, var(--hz-a) 0 6px, var(--hz-b) 6px 12px);
  }
  .section-subtitle { font-size: 12.5px; color: var(--muted); margin-top: 3px; }

  /* ════════════════════════════════════════════════════════════════════════
     SURFACES & CARDS
     ════════════════════════════════════════════════════════════════════════ */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--sh-raise);
  }
  .card-title {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--muted);
    margin-bottom: 14px;
  }
  .page-grid { display: grid; gap: 16px; }

  /* ── STAT CARDS (generic small tiles) ── */
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 20px; }
  .stat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 16px;
    position: relative;
    overflow: hidden;
    box-shadow: var(--sh-raise);
    transition: transform 0.16s, box-shadow 0.16s;
  }
  .stat-card:hover { transform: translateY(-3px); box-shadow: var(--sh-raise-lg); }
  .stat-card::after {
    content: '';
    position: absolute;
    top: 10px; bottom: 10px; left: 0;
    width: 4px;
    border-radius: 0 6px 6px 0;
    background: var(--accent);
  }
  .stat-card.orange::after { background: var(--accent); }
  .stat-card.blue::after   { background: var(--accent2); }
  .stat-card.green::after  { background: var(--success); }
  .stat-card.red::after    { background: var(--danger); }
  .stat-card.purple::after { background: var(--accent3); }
  .stat-card.yellow::after { background: var(--warn); }
  .stat-card.pink::after   { background: #ec4899; }
  .stat-card.white::after  { background: var(--text); }
  .stat-label { font-size: 10px; color: var(--muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; }
  .stat-val { font-size: 28px; font-weight: 900; color: var(--text); margin-top: 6px; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
  .stat-sub { font-size: 11.5px; color: var(--muted); margin-top: 6px; }

  /* ════════════════════════════════════════════════════════════════════════
     BUTTONS
     ════════════════════════════════════════════════════════════════════════ */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    border: 1px solid transparent;
    white-space: nowrap;
    transition: transform 0.08s, box-shadow 0.16s, opacity 0.12s, background 0.16s;
    -webkit-tap-highlight-color: transparent;
    min-height: 42px;
    letter-spacing: 0.01em;
  }
  .btn:active { transform: translateY(2px); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-sm  { padding: 7px 13px; font-size: 12px; min-height: 34px; border-radius: 11px; }
  .btn-primary {
    background: linear-gradient(145deg, #f8b02a, var(--accent));
    color: #211500;
    border-color: rgba(255,255,255,0.18);
    box-shadow: 5px 5px 12px rgba(0,0,0,0.25), -3px -3px 8px rgba(255,255,255,0.08);
  }
  .btn-primary:hover:not(:disabled) { box-shadow: 7px 7px 16px rgba(0,0,0,0.28), -3px -3px 8px rgba(255,255,255,0.08); transform: translate(-1px,-1px); }
  .btn-primary:active:not(:disabled) { box-shadow: var(--sh-press); transform: translateY(2px); }
  .btn-danger  { background: linear-gradient(145deg, #ff6b6b, var(--danger)); color: #fff; border-color: rgba(255,255,255,0.15); box-shadow: 5px 5px 12px rgba(229,72,77,0.3), -3px -3px 8px rgba(255,255,255,0.06); }
  .btn-danger:hover:not(:disabled)  { box-shadow: 7px 7px 16px rgba(229,72,77,0.34); transform: translate(-1px,-1px); }
  .btn-blue    { background: linear-gradient(145deg, #6aa4ff, var(--accent2)); color: #fff; border-color: rgba(255,255,255,0.15); box-shadow: 5px 5px 12px rgba(47,111,237,0.28), -3px -3px 8px rgba(255,255,255,0.06); }
  .btn-blue:hover:not(:disabled)    { box-shadow: 7px 7px 16px rgba(47,111,237,0.32); transform: translate(-1px,-1px); }
  .btn-purple  { background: linear-gradient(145deg, #b795ff, var(--accent3)); color: #fff; border-color: rgba(255,255,255,0.15); box-shadow: 5px 5px 12px rgba(139,92,246,0.28), -3px -3px 8px rgba(255,255,255,0.06); }
  .btn-success { background: linear-gradient(145deg, #4bd989, var(--success)); color: #fff; border-color: rgba(255,255,255,0.15); box-shadow: 5px 5px 12px rgba(33,157,96,0.28), -3px -3px 8px rgba(255,255,255,0.06); }
  .btn-ghost {
    background: var(--card);
    color: var(--text-sub);
    border-color: var(--border);
    box-shadow: var(--sh-raise);
  }
  .btn-ghost:hover:not(:disabled) { background: var(--card3); color: var(--text); box-shadow: var(--sh-raise-lg); }
  .btn-ghost:active:not(:disabled) { background: var(--card2); box-shadow: var(--sh-press); }

  /* ════════════════════════════════════════════════════════════════════════
     BADGES & CHIPS
     ════════════════════════════════════════════════════════════════════════ */
  .badge {
    display: inline-flex; align-items: center; font-size: 11px; font-weight: 800;
    padding: 4px 11px; border-radius: 99px; white-space: nowrap;
    border: 1px solid transparent; letter-spacing: 0.02em;
  }
  .badge svg { width: 11px; height: 11px; }
  .b-masuk   { background: rgba(53,207,122,0.14); color: var(--success); border-color: rgba(53,207,122,0.3); }
  .b-keluar  { background: rgba(255,92,92,0.12);  color: var(--danger);  border-color: rgba(255,92,92,0.3); }
  .b-warn    { background: rgba(246,166,10,0.14); color: var(--accent);  border-color: rgba(246,166,10,0.32); }
  .b-blue    { background: rgba(75,141,255,0.13); color: var(--accent2); border-color: rgba(75,141,255,0.3); }
  .b-purple  { background: rgba(160,123,255,0.13); color: var(--accent3); border-color: rgba(160,123,255,0.3); }
  .b-gray    { background: rgba(120,130,150,0.13); color: var(--muted);   border-color: rgba(120,130,150,0.3); }
  .b-yellow  { background: rgba(255,194,51,0.14); color: var(--warn);     border-color: rgba(255,194,51,0.3); }
  .b-red     { background: rgba(255,92,92,0.12);  color: var(--danger);   border-color: rgba(255,92,92,0.3); }
  .b-green   { background: rgba(53,207,122,0.14); color: var(--success);  border-color: rgba(53,207,122,0.3); }

  .meta-chip {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--card2); border: 1px solid var(--border);
    border-radius: 10px; padding: 5px 10px; font-size: 11px; color: var(--muted);
    font-weight: 700; min-width: 0;
  }
  .meta-chip svg { width: 12px; height: 12px; flex-shrink: 0; }
  .meta-chip b { color: var(--text); font-weight: 800; }
  .meta-chip.plate { font-family: var(--font-mono, ui-monospace, monospace); letter-spacing: 0.03em; }

  /* ════════════════════════════════════════════════════════════════════════
     TABLES
     ════════════════════════════════════════════════════════════════════════ */
  .table-wrap {
    overflow-x: auto;
    border-radius: 20px;
    background: var(--card);
    border: 1px solid var(--border);
    box-shadow: var(--sh-raise);
  }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  thead tr { background: var(--card2); }
  th {
    text-align: left;
    padding: 13px 18px;
    font-size: 10px;
    font-weight: 800;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.09em;
    white-space: nowrap;
  }
  td { padding: 12px 18px; border-top: 1px solid var(--border); vertical-align: middle; color: var(--text-sub); }
  tbody tr { transition: background 0.12s; }
  tbody tr:hover td { background: rgba(246,166,10,0.05); }
  .empty-row td { text-align: center; color: var(--muted); padding: 40px !important; font-size: 13px; }

  /* ── FORMS ── */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-group { display: flex; flex-direction: column; }
  .form-group.full { grid-column: 1 / -1; }

  /* ════════════════════════════════════════════════════════════════════════
     MODALS
     ════════════════════════════════════════════════════════════════════════ */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(10,11,15,0.6);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
  .modal {
    background: var(--card);
    border: 1px solid var(--border2);
    border-radius: 22px;
    width: 100%;
    max-width: 560px;
    padding: 24px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--sh-raise-lg);
  }
  .modal-lg { max-width: 720px; }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 12px; }
  .modal-title { font-size: 17px; font-weight: 900; display: flex; align-items: center; gap: 10px; }
  .modal-title::before {
    content: '';
    width: 5px; height: 18px; border-radius: 6px;
    background: repeating-linear-gradient(-45deg, var(--hz-a) 0 6px, var(--hz-b) 6px 12px);
  }
  .modal-close {
    background: var(--card2);
    border: 1px solid var(--border);
    border-radius: 12px;
    color: var(--muted);
    cursor: pointer;
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    transition: background 0.12s, color 0.12s, box-shadow 0.12s;
  }
  .modal-close:hover { background: rgba(255,92,92,0.15); color: var(--danger); border-color: rgba(255,92,92,0.4); }

  /* ── TOAST ── */
  .toast {
    position: fixed;
    bottom: 20px; right: 18px;
    background: var(--card);
    border: 1px solid var(--border2);
    border-radius: 16px;
    padding: 13px 18px;
    font-size: 13.5px;
    font-weight: 700;
    z-index: 999;
    box-shadow: var(--sh-raise-lg);
    max-width: calc(100vw - 32px);
    display: flex; align-items: center; gap: 8px;
  }
  .toast.success { border-color: rgba(53,207,122,0.45); color: var(--success); }
  .toast.error   { border-color: rgba(255,92,92,0.45);  color: var(--danger); }

  /* ── ALERTS ── */
  .alert {
    padding: 12px 16px; border-radius: 14px; font-size: 13px;
    display: flex; align-items: center; gap: 9px; border: 1px solid transparent;
    box-shadow: var(--sh-well);
  }
  .alert-danger  { background: rgba(255,92,92,0.08);  border-color: rgba(255,92,92,0.32);  color: var(--danger); }
  .alert-success { background: rgba(53,207,122,0.08); border-color: rgba(53,207,122,0.32); color: var(--success); }
  .alert-warn    { background: rgba(246,166,10,0.08); border-color: rgba(246,166,10,0.32); color: var(--accent); }

  /* ── UTILITIES ── */
  .divider { border: none; border-top: 1px solid var(--border); margin: 18px 0; }
  .flex-row     { display: flex; align-items: center; gap: 10px; }
  .flex-between { display: flex; align-items: center; justify-content: space-between; }
  .gap-12 { gap: 12px; }
  .mb-12  { margin-bottom: 12px; }
  .mb-16  { margin-bottom: 16px; }
  .mb-20  { margin-bottom: 20px; }
  .mt-14  { margin-top: 14px; }
  .text-muted   { color: var(--muted); }
  .text-sm      { font-size: 12.5px; }
  .text-xs      { font-size: 11px; }
  .font-bold    { font-weight: 700; }
  .text-success { color: var(--success); }
  .text-danger  { color: var(--danger); }
  .text-accent  { color: var(--accent); }
  .text-blue    { color: var(--accent2); }
  .text-purple  { color: var(--accent3); }
  .text-center  { text-align: center; }
  .w-full { width: 100%; }

  /* ── LIVE DOT ── */
  .live-dot {
    width: 8px; height: 8px;
    background: var(--success);
    border-radius: 50%;
    display: inline-block;
    box-shadow: 0 0 0 3px rgba(53,207,122,0.22);
    animation: pulse 2s infinite;
    margin-right: 5px;
    vertical-align: -1px;
  }
  .tb-spin { animation: wms-tb-spin 0.9s linear infinite; }
  @keyframes wms-tb-spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(0.8)} }

  /* ── PROGRESS BAR ── */
  .pbar-wrap {
    background: var(--card2);
    height: 8px; border-radius: 99px; overflow: hidden; margin-top: 6px;
    box-shadow: var(--sh-well);
  }
  .pbar {
    height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, var(--accent), #f8b02a);
    transition: width 0.5s ease;
  }
  .pbar.green { background: linear-gradient(90deg, #219d60, #35cf7a); }
  .pbar.blue  { background: linear-gradient(90deg, #2f6fed, #6aa4ff); }
  .pbar.red   { background: linear-gradient(90deg, #e5484d, #ff5c5c); }

  /* ── TABS ── */
  .tabs {
    display: flex; gap: 4px; background: var(--card2);
    border-radius: 16px; padding: 4px; border: 1px solid var(--border);
    margin-bottom: 20px; overflow-x: auto; -webkit-overflow-scrolling: touch;
    box-shadow: var(--sh-well);
  }
  .tab {
    padding: 8px 16px; border-radius: 12px; font-size: 12.5px; font-weight: 800;
    cursor: pointer; border: none; background: none; color: var(--muted);
    white-space: nowrap; transition: background 0.15s, color 0.15s, box-shadow 0.15s;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  }
  .tab.active { background: var(--card); color: var(--text); box-shadow: var(--sh-raise); }

  /* ── INFO ROWS ── */
  .info-row { display: flex; align-items: flex-start; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--border); }
  .info-row:last-child { border-bottom: none; }
  .info-key { font-size: 10px; color: var(--muted); font-weight: 800; width: 138px; flex-shrink: 0; text-transform: uppercase; padding-top: 3px; letter-spacing: 0.07em; }
  .info-val { font-size: 13.5px; font-weight: 600; }

  /* ── DO ITEM ROW ── */
  .do-item-row { display: flex; gap: 12px; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--border); }
  .do-item-row:last-child { border: none; }

  /* ── DETAIL HEADER ── */
  .detail-header { display: flex; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
  .detail-icon  { font-size: 26px; }
  .detail-title { font-size: 18px; font-weight: 900; }
  .detail-sub   { font-size: 12px; color: var(--muted); margin-top: 2px; }

  /* ── TIMELINE ── */
  .timeline { display: flex; flex-direction: column; gap: 0; }
  .timeline-item { display: flex; gap: 14px; }
  .timeline-left { display: flex; flex-direction: column; align-items: center; width: 28px; flex-shrink: 0; }
  .tl-dot {
    width: 14px; height: 14px; border-radius: 50%;
    border: 3px solid var(--border2); background: var(--card2); flex-shrink: 0; margin-top: 2px;
  }
  .tl-dot.done   { background: var(--success); border-color: var(--success); }
  .tl-dot.active { background: var(--accent);  border-color: var(--accent); animation: pulse 1.5s infinite; }
  .tl-line { flex: 1; width: 2px; background: var(--border2); margin: 3px 0; min-height: 24px; }
  .timeline-body { padding-bottom: 18px; flex: 1; }

  /* ── PALLET BALANCE ── */
  .balance-row { display: flex; height: 12px; border-radius: 99px; overflow: hidden; gap: 3px; margin: 10px 0 6px; box-shadow: var(--sh-well); }
  .balance-seg { height: 100%; border-radius: 3px; transition: width 0.4s; }
  .balance-seg:first-child { border-radius: 99px 0 0 99px; }
  .balance-seg:last-child  { border-radius: 0 99px 99px 0; }

  /* ── FILTER PILLS ── */
  .note-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .filter-pill { border-color: var(--border); color: var(--muted); }
  .filter-pill.active { background: var(--card); color: var(--text); border-color: var(--border2); box-shadow: var(--sh-raise); }

  /* ════════════════════════════════════════════════════════════════════════
     CHARTS
     ════════════════════════════════════════════════════════════════════════ */
  .chart-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--sh-raise); }
  .chart-card-title { font-size: 15px; font-weight: 900; margin-bottom: 12px; }
  .chart-legend { display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px; color: var(--muted); margin-bottom: 16px; }
  .chart-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .chart-legend-dot { width: 10px; height: 10px; border-radius: 99px; display: inline-block; }
  .chart-area { display: grid; gap: 14px; }
  .chart-row { display: grid; grid-template-columns: minmax(110px, 1fr) 4fr; gap: 14px; align-items: center; }
  .chart-label { font-size: 12px; color: var(--muted); font-weight: 600; }
  .chart-bars { display: grid; gap: 9px; }
  .chart-bar-group { display: grid; gap: 6px; }
  .chart-bar-track { background: var(--card2); border-radius: 99px; height: 13px; overflow: hidden; box-shadow: var(--sh-well); }
  .chart-bar { height: 100%; border-radius: 99px; }
  .chart-bar-meta { font-size: 11px; color: var(--muted); }

  /* ════════════════════════════════════════════════════════════════════════
     DASHBOARD
     ════════════════════════════════════════════════════════════════════════ */
  .dash-header { margin-bottom: 22px; }
  .dash-title { font-size: 24px; font-weight: 900; color: var(--text); letter-spacing: -0.025em; margin-bottom: 4px; }
  .dash-subtitle { font-size: 13.5px; color: var(--muted); }

  /* greeting band */
  .band {
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 18px 22px;
    box-shadow: var(--sh-raise);
    margin-bottom: 22px;
    position: relative; overflow: hidden;
  }
  .band::after {
    content: '';
    position: absolute; top: 0; right: 0; bottom: 0;
    width: 90px;
    background:
      repeating-linear-gradient(-45deg, rgba(246,166,10,0.06) 0 10px, transparent 10px 20px),
      linear-gradient(180deg, transparent, rgba(246,166,10,0.1));
    pointer-events: none;
  }
  .band-mark {
    width: 54px; height: 54px; border-radius: 18px;
    background: linear-gradient(145deg, #f8b02a, #dd8b04);
    color: #211500; display: flex; align-items: center; justify-content: center;
    box-shadow: var(--sh-raise); flex-shrink: 0;
  }
  .band-mark svg { width: 26px; height: 26px; }
  .band-title { font-size: 18px; font-weight: 900; color: var(--text); letter-spacing: -0.015em; line-height: 1.2; }
  .band-sub { font-size: 12.5px; color: var(--muted); margin-top: 3px; }
  .band-meta { margin-left: auto; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .chip {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--card2); border: 1px solid var(--border);
    border-radius: 14px; padding: 8px 14px;
    font-size: 12px; font-weight: 800; color: var(--text-sub);
    box-shadow: var(--sh-press);
  }
  .chip svg { width: 15px; height: 15px; color: var(--accent); }
  .chip b { color: var(--text); }

  /* KPI tiles */
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
  .kpi {
    position: relative;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 18px 18px 16px;
    box-shadow: var(--sh-raise);
    display: flex; flex-direction: column; gap: 12px;
    overflow: hidden;
    transition: transform 0.16s, box-shadow 0.16s;
  }
  .kpi:hover { transform: translateY(-3px); box-shadow: var(--sh-raise-lg); }
  .kpi::before {
    content: '';
    position: absolute; top: 0; left: 24px; right: 24px; height: 4px;
    border-radius: 0 0 8px 8px;
    background: repeating-linear-gradient(-45deg, var(--hz-a) 0 8px, var(--hz-b) 8px 16px);
    opacity: 0;
    transition: opacity 0.16s;
  }
  .kpi:hover::before { opacity: 1; }
  .kpi-ic {
    width: 42px; height: 42px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: var(--sh-press);
    flex-shrink: 0;
  }
  .kpi-ic svg { width: 20px; height: 20px; }
  .kpi .kpi-body { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; }
  .kpi-num { font-size: 30px; font-weight: 900; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
  .kpi-lbl { font-size: 10.5px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
  .kpi-sub { font-size: 11.5px; color: var(--muted); margin-top: 6px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

  .kpi .kpi-amber   { background: rgba(246,166,10,0.15); color: var(--accent); }
  .kpi .kpi-green   { background: rgba(53,207,122,0.15); color: var(--success); }
  .kpi .kpi-blue    { background: rgba(75,141,255,0.15); color: var(--accent2); }
  .kpi .kpi-red     { background: rgba(255,92,92,0.14);  color: var(--danger); }
  .kpi .kpi-purple  { background: rgba(160,123,255,0.14); color: var(--accent3); }
  .kpi .kpi-num.amber   { color: var(--accent); }
  .kpi .kpi-num.green   { color: var(--success); }
  .kpi .kpi-num.blue    { color: var(--accent2); }
  .kpi .kpi-num.red     { color: var(--danger); }
  .kpi .kpi-num.purple  { color: var(--accent3); }

  /* bento layout */
  .dash-grid-bento { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 16px; }
  .dash-grid-bento-bottom { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .dash-panel {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 22px;
    display: flex; flex-direction: column;
    box-shadow: var(--sh-raise);
  }
  .dash-panel-title {
    font-size: 14px; font-weight: 900; color: var(--text);
    margin-bottom: 18px;
    display: flex; justify-content: space-between; align-items: center; gap: 10px;
    letter-spacing: -0.01em;
  }
  .dash-panel-title::before {
    content: '';
    width: 4px; height: 16px; border-radius: 4px;
    background: repeating-linear-gradient(-45deg, var(--hz-a) 0 5px, var(--hz-b) 5px 10px);
    flex-shrink: 0;
  }
  .dash-panel-title { display: flex; }

  /* legacy dashboard cards (kept for compatibility) */
  .dash-card-stat {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 20px;
    display: flex; flex-direction: column;
    position: relative;
    box-shadow: var(--sh-raise);
    transition: transform 0.16s, box-shadow 0.16s;
  }
  .dash-card-stat:hover { transform: translateY(-3px); box-shadow: var(--sh-raise-lg); }
  .dash-card-stat.primary { background: linear-gradient(145deg, #2b2f3a, #20242e); border-color: var(--border); }
  .dash-card-stat.primary .stat-title, .dash-card-stat.primary .stat-sub { color: var(--text-sub); }
  .dash-card-stat.primary .stat-val { color: var(--accent); }
  .dash-card-stat .stat-title { font-size: 12px; font-weight: 800; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; color: var(--muted); text-transform: uppercase; letter-spacing: 0.07em; }
  .dash-card-stat .stat-val { font-size: 34px; font-weight: 900; line-height: 1.05; margin-bottom: 8px; font-variant-numeric: tabular-nums; }
  .dash-card-stat .stat-sub { font-size: 12px; color: var(--muted); font-weight: 600; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .dash-icon-circle { width: 38px; height: 38px; border-radius: 13px; background: var(--card2); display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); }
  .dash-icon-circle svg { width: 18px; height: 18px; color: var(--accent); }

  .dash-bar-chart { display: flex; align-items: flex-end; gap: 10px; height: 150px; margin-top: auto; padding-top: 16px; }
  .dash-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 7px; justify-content: flex-end; height: 100%; }
  .dash-bar-fill { width: 100%; max-width: 44px; border-radius: 8px 8px 0 0; transition: height 0.5s ease; }
  .dash-bar-fill.solid { background: linear-gradient(180deg, #35cf7a, #219d60); }
  .dash-bar-fill.light { background: linear-gradient(180deg, #7be0a8, #4bd989); }
  .dash-bar-fill.striped {
    background: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(33,157,96,0.3) 4px, rgba(33,157,96,0.3) 8px);
    border: 1px solid rgba(33,157,96,0.4);
  }
  .dash-bar-label { font-size: 11.5px; font-weight: 700; color: var(--muted); }

  .dash-list-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .dash-list-item:last-child { border-bottom: none; padding-bottom: 0; }
  .dash-avatar { width: 40px; height: 40px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; box-shadow: var(--sh-press); }
  .dash-list-info { flex: 1; min-width: 0; }
  .dash-list-title { font-size: 13.5px; font-weight: 800; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .dash-list-sub { font-size: 12px; color: var(--muted); margin-top: 1px; }
  .dash-badge { padding: 4px 11px; border-radius: 99px; font-size: 11px; font-weight: 800; border: 1px solid transparent; }
  .dash-badge.green { background: rgba(53,207,122,0.14); color: var(--success); border-color: rgba(53,207,122,0.32); }
  .dash-badge.yellow { background: rgba(255,194,51,0.14); color: var(--warn); border-color: rgba(255,194,51,0.32); }
  .dash-badge.red { background: rgba(255,92,92,0.14); color: var(--danger); border-color: rgba(255,92,92,0.32); }

  .dash-doughnut { position: relative; width: 130px; height: 130px; margin: 0 auto; }
  .dash-doughnut-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .dash-doughnut-bg { fill: none; stroke: var(--border2); stroke-width: 12; }
  .dash-doughnut-val { fill: none; stroke: var(--success); stroke-width: 12; stroke-linecap: round; stroke-dasharray: 283; transition: stroke-dashoffset 1s ease; }
  .dash-doughnut-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .dash-doughnut-pct { font-size: 28px; font-weight: 900; color: var(--text); line-height: 1; }
  .dash-doughnut-lbl { font-size: 10.5px; color: var(--muted); margin-top: 3px; }

  /* ════════════════════════════════════════════════════════════════════════
     NOTE / WHITEBOARD CARDS
     ════════════════════════════════════════════════════════════════════════ */
  .note-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
  .note-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 20px; overflow: hidden; display: flex; flex-direction: column;
    box-shadow: var(--sh-raise);
    transition: transform 0.16s, box-shadow 0.16s;
  }
  .note-card:hover { transform: translateY(-3px); box-shadow: var(--sh-raise-lg); }
  .note-card-strip { width: 100%; height: 5px; background: repeating-linear-gradient(-45deg, var(--hz-a) 0 10px, var(--hz-b) 10px 20px); }
  .note-card-content { padding: 18px; display: flex; flex-direction: column; flex: 1; min-height: 300px; }
  .note-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .note-card-title { font-size: 15px; font-weight: 900; color: var(--text); line-height: 1.3; }
  .note-card-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
  .note-badge { display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 99px; font-size: 11px; font-weight: 800; white-space: nowrap; background: var(--card3); color: var(--text); box-shadow: var(--sh-press); }
  .note-tag { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 99px; font-size: 11px; color: var(--muted); background: var(--card2); border: 1px solid var(--border); font-weight: 700; }
  .note-actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
  .note-card-body { color: var(--text-sub); font-size: 13px; line-height: 1.7; white-space: pre-wrap; min-height: 80px; margin-top: 12px; }
  .note-meta { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; font-size: 11px; color: var(--muted); align-items: center; margin-top: auto; padding-top: 12px; }
  .note-comments { display: grid; gap: 9px; }
  .comment-item { background: var(--card2); border-radius: 14px; padding: 12px 14px; border: 1px solid var(--border); }
  .comment-author { font-size: 12px; font-weight: 800; color: var(--text); margin-bottom: 3px; }
  .comment-body { font-size: 12.5px; line-height: 1.6; white-space: pre-wrap; color: var(--text-sub); }
  .comment-meta { margin-top: 6px; font-size: 10.5px; color: var(--muted); }
  .note-comment-input { display: flex; gap: 9px; align-items: flex-end; margin-top: auto; }
  .comment-input { min-height: 40px; max-height: 96px; border-radius: 14px; border: 1px solid var(--border); background: var(--card2); padding: 10px 14px; color: var(--text); font-size: 13px; resize: vertical; width: 100%; box-shadow: var(--sh-well); }
  .note-empty-state, .note-card .note-empty-state { padding: 40px 20px; text-align: center; color: var(--muted); border: 1px dashed var(--border2); border-radius: 20px; background: var(--card); font-size: 13px; }

  /* ── WHITEBOARD MASONRY ── */
  .wb-masonry { columns: 300px; column-gap: 16px; }
  .wb-card {
    break-inside: avoid; margin-bottom: 16px; width: 100%;
    display: flex; flex-direction: column;
    background: var(--card); border: 1px solid var(--border); border-radius: 20px;
    overflow: hidden; cursor: pointer; position: relative;
    box-shadow: var(--sh-raise);
    transition: transform 0.16s, border-color 0.16s, box-shadow 0.16s;
  }
  .wb-card:hover { transform: translateY(-3px); border-color: rgba(246,166,10,0.4); box-shadow: var(--sh-raise-lg); }
  .wb-strip { height: 5px; flex-shrink: 0; }
  .wb-body-pad { padding: 16px; display: flex; flex-direction: column; gap: 0; flex: 1; }
  .wb-head { display: flex; align-items: flex-start; gap: 10px; }
  .wb-title { font-size: 14.5px; font-weight: 900; color: var(--text); line-height: 1.3; flex: 1; min-width: 0; }
  .wb-actions { display: flex; gap: 5px; flex-shrink: 0; opacity: 0; transition: opacity 0.14s; margin-top: -3px; }
  .wb-card:hover .wb-actions, .wb-card:focus-within .wb-actions { opacity: 1; }
  .wb-act { width: 30px; height: 30px; border: none; border-radius: 10px; cursor: pointer; background: var(--card2); color: var(--muted); display: flex; align-items: center; justify-content: center; box-shadow: var(--sh-press); transition: background 0.12s, color 0.12s; }
  .wb-act:hover { background: var(--card); color: var(--accent); }
  .wb-act.danger:hover { background: rgba(255,92,92,0.14); color: var(--danger); }
  .wb-act svg { width: 14px; height: 14px; }
  .wb-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; align-items: center; }
  .wb-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 9.5px; font-weight: 900; color: #fff; padding: 3px 9px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.06em; }
  .wb-mention { font-size: 10.5px; font-weight: 800; color: var(--accent2); background: rgba(75,141,255,0.13); padding: 2px 8px; border-radius: 99px; border: 1px solid rgba(75,141,255,0.3); }
  .wb-body { margin-top: 12px; font-size: 13px; line-height: 1.65; color: var(--text-sub); white-space: pre-wrap; word-break: break-word; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }
  .wb-foot { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .wb-author { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .wb-avatar { width: 24px; height: 24px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; font-weight: 900; }
  .wb-author-name { font-size: 12px; font-weight: 800; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .wb-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .wb-time { font-size: 11px; color: var(--muted); }
  .wb-comcount { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; color: var(--muted); background: var(--card2); border: 1px solid var(--border); padding: 3px 10px; border-radius: 99px; box-shadow: var(--sh-press); }
  .wb-comcount.has { color: var(--accent2); border-color: rgba(75,141,255,0.45); background: rgba(75,141,255,0.1); }
  .wb-comcount svg { width: 11px; height: 11px; }
  .wb-lastcomment { margin-top: 10px; display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--muted); background: var(--card2); border-radius: 14px; padding: 8px 12px; overflow: hidden; border: 1px solid var(--border); }
  .wb-lastcomment span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .wb-lastcomment b { color: var(--text-sub); font-weight: 800; flex-shrink: 0; }
  .wb-hint { margin-top: 10px; font-size: 11px; color: var(--muted); display: flex; align-items: center; gap: 5px; }
  .wb-hint svg { width: 11px; height: 11px; }
  .wb-empty { text-align: center; padding: 52px 20px; color: var(--muted); border: 1px dashed var(--border2); border-radius: 20px; background: var(--card); font-size: 13px; }

  /* ── WHITEBOARD MODAL ── */
  .wb-modal {
    background: var(--card); border: 1px solid var(--border2);
    border-radius: 24px; width: 100%; max-width: 660px; max-height: 86vh;
    display: flex; flex-direction: column; overflow: hidden;
    box-shadow: var(--sh-raise-lg);
  }
  .wb-modal-strip { height: 6px; flex-shrink: 0; }
  .wb-modal-head { padding: 20px 24px 16px; display: flex; align-items: flex-start; gap: 14px; }
  .wb-modal-title { font-size: 18px; font-weight: 900; color: var(--text); line-height: 1.3; }
  .wb-modal-meta { display: flex; align-items: center; gap: 10px; margin-top: 8px; font-size: 12px; color: var(--muted); flex-wrap: wrap; }
  .wb-modal-close { margin-left: auto; background: var(--card2); border: 1px solid var(--border); border-radius: 12px; color: var(--muted); cursor: pointer; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.12s, color 0.12s; box-shadow: var(--sh-press); }
  .wb-modal-close:hover { background: rgba(255,92,92,0.15); color: var(--danger); border-color: rgba(255,92,92,0.4); }
  .wb-modal-close svg { width: 15px; height: 15px; }
  .wb-modal-body { overflow-y: auto; padding: 4px 24px 18px; }
  .wb-modal-text { font-size: 14px; line-height: 1.8; color: var(--text); white-space: pre-wrap; word-break: break-word; }
  .wb-disc { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); }
  .wb-disc-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 14px; }
  .wb-comments { display: flex; flex-direction: column; gap: 12px; }
  .wb-comment { display: flex; gap: 10px; align-items: flex-start; }
  .wb-comment .wb-avatar { width: 30px; height: 30px; font-size: 11px; margin-top: 1px; border-radius: 10px; }
  .wb-cmain { flex: 1; min-width: 0; background: var(--card2); border: 1px solid var(--border); border-radius: 16px; padding: 10px 14px; box-shadow: var(--sh-well); }
  .wb-cmeta { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .wb-cname { font-size: 12.5px; font-weight: 900; color: var(--text); }
  .wb-cdate { font-size: 10.5px; color: var(--muted); }
  .wb-ctext { font-size: 13px; line-height: 1.65; color: var(--text-sub); white-space: pre-wrap; word-break: break-word; }
  .wb-cdel { background: none; border: none; color: var(--muted); cursor: pointer; width: 26px; height: 26px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; opacity: 0; transition: opacity 0.12s; }
  .wb-comment:hover .wb-cdel { opacity: 1; }
  .wb-cdel:hover { background: rgba(255,92,92,0.15); color: var(--danger); }
  .wb-cdel svg { width: 13px; height: 13px; }
  .wb-nocomment { font-size: 12.5px; color: var(--muted); background: var(--card2); border: 1px dashed var(--border2); border-radius: 16px; padding: 16px; text-align: center; }
  .wb-compose { padding: 14px 24px 18px; border-top: 1px solid var(--border); background: var(--surface); flex-shrink: 0; }
  .wb-compose-row { display: flex; align-items: flex-end; gap: 8px; }
  .wb-compose textarea { flex: 1; resize: none; min-height: 42px; max-height: 120px; background: var(--card2); border: 1px solid var(--border); border-radius: 16px; color: var(--text); padding: 10px 14px; font-size: 14px; outline: none; box-shadow: var(--sh-well); transition: border-color 0.15s; }
  .wb-compose textarea:focus { border-color: var(--accent); }
  .wb-send {
    display: flex; align-items: center; gap: 6px;
    background: linear-gradient(145deg, #f8b02a, var(--accent));
    color: #211500; border: 1px solid rgba(255,255,255,0.18);
    border-radius: 14px; font-size: 13px; font-weight: 900; padding: 10px 16px;
    cursor: pointer; transition: box-shadow 0.12s, transform 0.08s; white-space: nowrap;
    box-shadow: 4px 4px 10px rgba(0,0,0,0.22), -2px -2px 6px rgba(255,255,255,0.06);
  }
  .wb-send:hover:not(:disabled) { box-shadow: 6px 6px 14px rgba(0,0,0,0.26); }
  .wb-send:active:not(:disabled) { box-shadow: var(--sh-press); transform: translateY(1px); }
  .wb-send:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
  .wb-send svg { width: 15px; height: 15px; }
  .wb-mention-hint { font-size: 10.5px; color: var(--muted); margin-top: 6px; }

  /* ════════════════════════════════════════════════════════════════════════
     TOPBAR BELL
     ════════════════════════════════════════════════════════════════════════ */
  .tb-bell { position: relative; }
  .tb-badge {
    position: absolute; top: -4px; right: -4px; min-width: 17px; height: 17px;
    border-radius: 99px; background: linear-gradient(145deg, #ff6b6b, var(--danger));
    color: #fff; font-size: 10px; font-weight: 900; display: flex; align-items: center;
    justify-content: center; padding: 0 4px; box-shadow: 0 2px 6px rgba(229,72,77,0.4);
  }
  .tb-pop {
    position: absolute; top: calc(100% + 12px); right: 0; width: 330px; max-height: 400px;
    background: var(--card); border: 1px solid var(--border2); border-radius: 20px;
    box-shadow: var(--sh-raise-lg); display: flex; flex-direction: column; overflow: hidden; z-index: 90;
  }
  .tb-pop-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border); }
  .tb-pop-title { font-size: 13px; font-weight: 900; color: var(--text); }
  .tb-pop-list { overflow-y: auto; }
  .tb-pop-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid var(--border); text-align: left; background: none; width: 100%; transition: background 0.12s; }
  .tb-pop-item:hover { background: var(--card2); }
  .tb-pop-item.unread { background: rgba(75,141,255,0.08); }
  .tb-pop-msg { font-size: 12.5px; color: var(--text); line-height: 1.5; font-weight: 700; }
  .tb-pop-time { font-size: 10.5px; color: var(--muted); margin-top: 3px; }
  .tb-pop-empty { padding: 28px 16px; text-align: center; color: var(--muted); font-size: 12.5px; }
  .tb-pop-foot { border-top: 1px solid var(--border); padding: 10px 16px; text-align: center; }
  .tb-pop-foot button { background: none; border: none; color: var(--accent2); font-size: 12px; font-weight: 800; cursor: pointer; }
  .tb-pop-foot button:hover { text-decoration: underline; }

  /* ════════════════════════════════════════════════════════════════════════
     ARMADA / ANGKUTAN MODULE
     ════════════════════════════════════════════════════════════════════════ */
  .armada-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; margin-bottom: 20px; }
  .armada-kpi {
    background: var(--card); border: 1px solid var(--border); border-radius: 20px;
    padding: 15px; display: flex; align-items: center; gap: 13px; min-width: 0;
    box-shadow: var(--sh-raise); transition: transform 0.15s, box-shadow 0.15s;
  }
  .armada-kpi:hover { transform: translateY(-2px); box-shadow: var(--sh-raise-lg); }
  .armada-kpi-icon { width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: var(--sh-press); }
  .armada-kpi-icon svg { width: 19px; height: 19px; }
  .armada-kpi-val { font-size: 22px; font-weight: 900; line-height: 1.05; color: var(--text); font-variant-numeric: tabular-nums; }
  .armada-kpi-lbl { font-size: 11px; color: var(--muted); font-weight: 700; margin-top: 3px; }
  .kpi-icon-green  { background: rgba(53,207,122,0.15); color: var(--success); }
  .kpi-icon-amber  { background: rgba(246,166,10,0.15); color: var(--warn); }
  .kpi-icon-red    { background: rgba(255,92,92,0.14); color: var(--danger); }
  .kpi-icon-gray   { background: rgba(120,130,150,0.15); color: var(--muted); }
  .kpi-icon-blue   { background: rgba(75,141,255,0.14); color: var(--accent2); }
  .kpi-icon-purple { background: rgba(160,123,255,0.14); color: var(--accent3); }
  .kpi-icon-white  { background: rgba(238,241,246,0.16); color: var(--text); }

  .search-box { position: relative; flex: 1; min-width: 220px; }
  .search-box svg { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: var(--muted); pointer-events: none; }
  .search-box input { padding-left: 38px; }

  .fleet-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }

  .fleet-group { margin-bottom: 22px; }
  .fleet-group-head { display: flex; align-items: center; gap: 12px; padding: 0 2px; margin-bottom: 12px; }
  .fleet-tag {
    width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center;
    justify-content: center; font-weight: 900; font-size: 11px; letter-spacing: 0.03em;
    flex-shrink: 0; box-shadow: var(--sh-press);
  }
  .fleet-tag.gms { background: rgba(53,207,122,0.15); color: var(--success); }
  .fleet-tag.tms { background: rgba(246,166,10,0.15); color: var(--warn); }
  .fleet-tag.imk { background: rgba(75,141,255,0.14); color: var(--accent2); }
  .fleet-tag.oth { background: rgba(160,123,255,0.14); color: var(--accent3); }
  .fleet-group-name { font-size: 16px; font-weight: 900; color: var(--text); }
  .fleet-group-sub { font-size: 11.5px; color: var(--muted); font-weight: 700; margin-top: 2px; }
  .fleet-group-right { margin-left: auto; }

  .fleet-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 14px; }

  .truck-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 20px;
    padding: 16px; display: flex; flex-direction: column; gap: 13px; min-width: 0;
    position: relative; box-shadow: var(--sh-raise);
    transition: transform 0.16s, box-shadow 0.16s;
  }
  .truck-card:hover { transform: translateY(-3px); box-shadow: var(--sh-raise-lg); }
  .truck-card-top { display: flex; align-items: center; gap: 13px; min-width: 0; }
  .truck-avatar {
    width: 46px; height: 46px; border-radius: 15px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; font-weight: 900; color: #fff;
    box-shadow: var(--sh-press);
  }
  .st-ready  { background: linear-gradient(145deg, #4bd989, #219d60); }
  .st-away   { background: linear-gradient(145deg, #ffc233, #e59100); color: #231500; }
  .st-down   { background: linear-gradient(145deg, #ff6b6b, #e5484d); }
  .st-off    { background: linear-gradient(145deg, var(--border2), var(--muted)); color: rgba(0,0,0,0.55); }
  .truck-title { font-size: 15px; font-weight: 900; color: var(--text); line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .truck-sub { font-size: 11.5px; color: var(--muted); font-weight: 700; margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .truck-badge { margin-left: auto; flex-shrink: 0; }
  .truck-meta { display: flex; flex-wrap: wrap; gap: 7px; }
  .truck-actions { display: flex; align-items: center; gap: 7px; margin-top: 1px; padding-top: 13px; border-top: 1px dashed var(--border2); }
  .truck-actions .spacer { flex: 1; }

  /* Driver list rows (absen + riwayat) */
  .driver-list { display: flex; flex-direction: column; }
  .driver-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 12px 16px;
    align-items: center;
    padding: 13px 2px;
    border-bottom: 1px solid var(--border);
  }
  .driver-row:last-child { border-bottom: none; padding-bottom: 2px; }
  .driver-main { display: flex; align-items: center; gap: 13px; min-width: 0; }
  .driver-avatar {
    width: 42px; height: 42px; border-radius: 14px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 14px; font-weight: 900;
  }
  .driver-avatar.no { background: var(--card2); border: 1px solid var(--border); color: var(--muted); box-shadow: var(--sh-press); }
  .driver-avatar.hadir { background: linear-gradient(145deg, #4bd989, #219d60); }
  .driver-avatar.tidak { background: linear-gradient(145deg, #ff6b6b, #e5484d); }
  .driver-name { font-size: 14.5px; font-weight: 900; color: var(--text); line-height: 1.2; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .driver-sub { font-size: 11.5px; color: var(--muted); font-weight: 700; margin-top: 3px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; min-width: 0; }
  .driver-sub .sep { opacity: 0.5; }
  .driver-note { font-size: 11.5px; color: var(--warn); font-weight: 800; margin-top: 5px; display: flex; align-items: center; gap: 5px; }
  .driver-status { min-width: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .driver-actions { display: flex; align-items: center; gap: 7px; justify-content: flex-end; }

  .seg { display: inline-flex; align-items: center; gap: 3px; padding: 3px; background: var(--card2); border: 1px solid var(--border); border-radius: 14px; box-shadow: var(--sh-well); }
  .seg button {
    appearance: none; border: none; cursor: pointer; border-radius: 11px;
    padding: 6px 12px; font-size: 11.5px; font-weight: 900; color: var(--muted);
    background: transparent; display: inline-flex; align-items: center; gap: 5px;
    transition: background 0.13s, color 0.13s, transform 0.08s, box-shadow 0.13s;
    font-family: var(--font); white-space: nowrap;
  }
  .seg button:hover:not(:disabled) { color: var(--text); }
  .seg button:active { transform: translateY(1px); }
  .seg button.on-hadir { background: linear-gradient(145deg, #4bd989, #219d60); color: #fff; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); }
  .seg button.on-hadir svg { color: #fff; }
  .seg button.on-tidak { background: linear-gradient(145deg, #ff6b6b, #e5484d); color: #fff; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); }
  .seg button svg { width: 12px; height: 12px; }
  .seg button.on-hadir:hover:not(:disabled) { color: #fff; }
  .seg button.on-tidak:hover:not(:disabled) { color: #fff; }

  .icon-btn {
    width: 36px; height: 36px; padding: 0 !important; min-height: 0 !important;
    border-radius: 12px !important; justify-content: center !important;
  }
  .icon-btn svg { width: 16px; height: 16px; }
  .btn-danger-text { color: var(--danger) !important; border-color: rgba(255,92,92,0.4) !important; }
  .btn-danger-text:hover:not(:disabled) { background: rgba(255,92,92,0.12) !important; color: var(--danger) !important; box-shadow: var(--sh-press) !important; }

  /* Group summary strip (absen per armada) */
  .agrp-bar { display: flex; align-items: center; gap: 6px; margin-top: 9px; }
  .agrp-pbar { flex: 1; height: 6px; border-radius: 99px; background: var(--card2); overflow: hidden; box-shadow: var(--sh-well); }
  .agrp-pbar i { display: block; height: 100%; border-radius: 99px; background: var(--success); }
  .agrp-pbar.warn i { background: var(--warn); }
  .agrp-pmeta { font-size: 10.5px; color: var(--muted); font-weight: 800; white-space: nowrap; }

  /* Detail hero */
  .hero-detail { display: flex; align-items: center; gap: 16px; padding: 4px 0 18px; border-bottom: 1px solid var(--border); margin-bottom: 18px; flex-wrap: wrap; }
  .hero-avatar {
    width: 62px; height: 62px; border-radius: 20px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; font-weight: 900; color: #fff;
    box-shadow: var(--sh-raise);
  }
  .hero-name { font-size: 20px; font-weight: 900; color: var(--text); line-height: 1.15; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .hero-sub { font-size: 12.5px; color: var(--muted); margin-top: 5px; display: flex; align-items: center; gap: 7px; flex-wrap: wrap; font-weight: 600; }
  .hero-note { font-size: 12px; color: var(--warn); margin-top: 8px; display: flex; align-items: center; gap: 6px; font-weight: 800; }
  .stat-grid.mini { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }

  .empty-state {
    text-align: center; padding: 48px 20px; color: var(--muted);
    border: 1px dashed var(--border2); border-radius: 20px;
    background: var(--card); font-size: 13px; box-shadow: var(--sh-raise);
  }
  .empty-state .empty-ic { font-size: 30px; display: block; margin-bottom: 8px; }

  /* ════════════════════════════════════════════════════════════════════════
     RESPONSIVE
     ════════════════════════════════════════════════════════════════════════ */
  @media (max-width: 1200px) {
    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .dash-grid-bento { grid-template-columns: 1fr 1fr; }
    .dash-grid-bento-bottom { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 980px) {
    .dash-grid-bento { grid-template-columns: 1fr; }
    .dash-grid-bento-bottom { grid-template-columns: 1fr 1fr; }
  }

  @media (min-width: 769px) {
    .hamburger-btn { display: none !important; }
    .sidebar-overlay { display: none !important; }
    .topbar-datetime { display: inline; }
  }

  /* Tablet / phone ≤ 768px */
  @media (max-width: 768px) {
    .hamburger-btn { display: inline-flex !important; }
    .topbar-datetime { display: none; }

    .main { margin-left: 0 !important; }
    .content { padding: 16px 14px; }
    .topbar { padding: 0 14px; height: 56px; }

    .sidebar { transform: translateX(-100%); box-shadow: none; }
    .sidebar.sidebar-open { transform: translateX(0); box-shadow: 10px 0 40px rgba(0,0,0,0.5); }

    .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 35; backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); }

    .kpi-grid            { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .dash-grid-bento     { grid-template-columns: 1fr; gap: 14px; }
    .dash-grid-bento-bottom { grid-template-columns: 1fr; gap: 14px; }
    .dash-panel          { padding: 18px; }
    .dash-title          { font-size: 21px; }

    .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }

    .form-grid { grid-template-columns: 1fr; gap: 14px; }

    .modal-overlay { align-items: flex-end; padding: 0; }
    .modal         { max-width: 100%; border-radius: 22px 22px 0 0; padding: 22px 18px 28px; max-height: 92vh; }
    .modal-lg      { max-width: 100%; }
    .wb-modal      { max-width: 100%; border-radius: 22px 22px 0 0; max-height: 94vh; }

    .note-grid  { grid-template-columns: 1fr; }
    .wb-masonry { columns: 1; }

    .tb-pop { width: min(330px, calc(100vw - 20px)); right: -4px; }

    .toast { bottom: 14px; right: 10px; left: 10px; max-width: none; }

    .card   { padding: 16px; }
    .btn    { padding: 10px 15px; min-height: 44px; }
    .btn-sm { padding: 7px 13px; min-height: 36px; }

    .shell { overflow-x: hidden; }
    .topbar-right { gap: 6px; }
    .band-meta { margin-left: 0; width: 100%; }
  }

  /* ════════════════════════════════════════════════════════════════════════
     RESPONSIVE — tabel berubah jadi kartu bertumpuk (mobile-friendly)
     Tambahkan class "resp-table" di .table-wrap untuk memicu perilaku ini.
     ════════════════════════════════════════════════════════════════════════ */
  @media (max-width: 767px) {
    .table-wrap.resp-table {
      overflow: visible;
      background: transparent;
      border: none;
      box-shadow: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .table-wrap.resp-table > table { display: block; width: 100%; }
    .table-wrap.resp-table thead { display: none; }
    .table-wrap.resp-table tbody { display: block; }
    .table-wrap.resp-table tbody > tr { display: block; width: 100%; }
    .table-wrap.resp-table tbody > tr:not(.sj-detail-row) {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      box-shadow: var(--sh-raise);
      overflow: hidden;
    }
    .table-wrap.resp-table tbody > tr:last-child { margin-bottom: 0; }

    .table-wrap.resp-table tbody td { display: block; width: 100%; padding: 9px 16px; border: none; }
    .table-wrap.resp-table tbody tr > td:not(:first-child) { border-top: 1px dashed var(--border); }

    /* baris detail (hasil ketuk) tampil sebagai panel kelabu terpisah */
    .table-wrap.resp-table tbody tr.sj-detail-row td {
      background: var(--card2);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 4px 14px 10px;
      margin: 4px 2px 10px;
      width: auto;
    }
    .table-wrap.resp-table tbody tr.sj-detail-row td { display: block; }
    .table-wrap.resp-table tbody tr.sj-detail-row > td { border-top: none; }

    .table-wrap.resp-table td[data-label] { display: block; }
    .table-wrap.resp-table td[data-label]::before {
      content: attr(data-label);
      display: block;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--muted);
      margin-bottom: 2px;
    }

    /* tombol expand (chevron) disembunyikan; seluruh kartu bisa diketuk */
    .table-wrap.resp-table td.sj-toggle { display: none; }

    /* kolom aksi: tombol melebar rapi */
    .table-wrap.resp-table td.sj-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .table-wrap.resp-table td.sj-actions .btn { flex: 1 1 auto; justify-content: center; }
    .table-wrap.resp-table td.sj-actions .btn.icon-btn { flex: 0 0 auto; }
  }

  /* ════════════════════════════════════════════════════════════════════════
     MOBILE — Modul Angkutan / Armada / Absen (dipadatkan, tidak menumpuk)
     ════════════════════════════════════════════════════════════════════════ */
  @media (max-width: 767px) {
    /* KPI armada: 2 kolom padat */
    .armada-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
    .armada-kpi { padding: 10px 12px; gap: 10px; border-radius: 16px; }
    .armada-kpi-icon { width: 34px; height: 34px; border-radius: 11px; }
    .armada-kpi-icon svg { width: 17px; height: 17px; }
    .armada-kpi-val { font-size: 19px; }
    .armada-kpi-lbl { font-size: 10px; }

    /* toolbar master armada */
    .fleet-toolbar { gap: 8px; margin-bottom: 14px; }
    .fleet-toolbar .search-box { flex-basis: 100%; min-width: 0; }
    .fleet-toolbar > span { font-size: 12px; }

    /* grup armada ringkas */
    .fleet-group { margin-bottom: 14px; }
    .fleet-group-head { gap: 9px; margin-bottom: 8px; }
    .fleet-group-right { display: none; }
    .fleet-tag { width: 34px; height: 34px; border-radius: 11px; font-size: 10px; }
    .fleet-group-name { font-size: 14px; }
    .fleet-group-sub { font-size: 10.5px; }

    /* kartu truk: compact, 2 kolom di layar sedang */
    .fleet-grid { grid-template-columns: repeat(auto-fill, minmax(158px, 1fr)); gap: 10px; }
    .truck-card { padding: 11px 12px; gap: 9px; border-radius: 16px; }
    .truck-card-top { gap: 9px; }
    .truck-avatar { width: 34px; height: 34px; border-radius: 11px; font-size: 13px; }
    .truck-title { font-size: 13px; }
    .truck-sub { display: none; }
    .truck-badge { font-size: 10px; padding: 3px 8px; }
    .truck-meta { gap: 5px; }
    .meta-chip { padding: 3px 8px; font-size: 10px; border-radius: 8px; }
    .truck-actions { flex-wrap: wrap; gap: 6px; }
    .truck-actions .btn { flex: 1 1 auto; justify-content: center; padding: 7px 10px; font-size: 11.5px; }
    .truck-actions .icon-btn { flex: 0 0 auto; }

    /* baris sopir absen: nama & status sebaris, aksi di baris bawah */
    .driver-row { grid-template-columns: minmax(0, 1fr) auto; gap: 7px 10px; padding: 10px 0; }
    .driver-main { grid-column: 1 / 2; }
    .driver-status { grid-column: 2 / 3; grid-row: 1 / 2; flex-direction: row; align-items: center; justify-content: flex-end; gap: 5px; flex-wrap: wrap; }
    .driver-status .badge { font-size: 10.5px; padding: 4px 8px; }
    .driver-actions { grid-column: 1 / -1; grid-row: auto; justify-content: flex-start; gap: 6px; flex-wrap: wrap; }
    .driver-avatar { width: 38px; height: 38px; border-radius: 12px; font-size: 13px; }
    .driver-name { font-size: 13.5px; }
    .driver-sub { font-size: 11px; margin-top: 2px; }
    .driver-note { font-size: 11px; margin-top: 3px; }
    .seg button { padding: 5px 10px; font-size: 11px; }
    .driver-actions .icon-btn { width: 32px; height: 32px; }

    /* detail satu angkutan */
    .hero-detail { gap: 12px; padding-bottom: 14px; margin-bottom: 14px; }
    .hero-avatar { width: 52px; height: 52px; border-radius: 16px; font-size: 20px; }
    .hero-name { font-size: 17px; }
    .hero-sub { font-size: 12px; }
    .hero-detail > .flex-row { width: 100%; margin-left: 0 !important; flex-wrap: wrap; }
    .hero-detail > .flex-row .btn { flex: 1; justify-content: center; }
    .stat-grid.mini { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .stat-card { padding: 13px; border-radius: 16px; }
    .stat-val { font-size: 22px; }
  }

  /* Small phones ≤ 480px */
  @media (max-width: 480px) {
    .kpi-grid { grid-template-columns: 1fr; gap: 12px; }
    .stat-grid   { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .content     { padding: 14px 12px; }
    .topbar-title { font-size: 14.5px !important; }
    .tb-icon-chip { display: none; }
    .tb-hide-sm { display: none !important; }
  }

  /* Print */
  @media print {
    .sidebar, .topbar, .btn, .hamburger-btn, .sidebar-overlay { display: none !important; }
    .main { margin-left: 0 !important; }
    table { color: #000 !important; }
  }
`;
