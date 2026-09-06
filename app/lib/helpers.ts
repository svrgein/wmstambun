// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────────

export const fmt = (n: number) => n.toLocaleString('id-ID');
export const fmtTon = (n: number) => n.toLocaleString('id-ID', { maximumFractionDigits: 3 });
const JAKARTA_TIME_ZONE = 'Asia/Jakarta';

export const fmtDate = (s: string) => new Intl.DateTimeFormat('id-ID', {
  timeZone: JAKARTA_TIME_ZONE, day: '2-digit', month: 'short', year: 'numeric',
}).format(new Date(s));

export const fmtTime = (s: string) => new Intl.DateTimeFormat('id-ID', {
  timeZone: JAKARTA_TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false,
}).format(new Date(s));

export const fmtJakartaDateTime = (date: Date = new Date()) => `${new Intl.DateTimeFormat('id-ID', {
  timeZone: JAKARTA_TIME_ZONE, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
}).format(date)} WIB`;

export const today = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: JAKARTA_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};

// Ubah string tanggal (ISO) menjadi kunci tanggal "yyyy-mm-dd" zona Asia/Jakarta.
export const dayKey = (s: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: JAKARTA_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(s));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};

export const addDays = (dateKey: string, delta: number) => {
  const d = new Date(`${dateKey}T12:00:00`);
  d.setDate(d.getDate() + delta);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: JAKARTA_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(d);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};

// ─── WHITEBOARD HELPERS ────────────────────────────────────────────────────────

export const parseMentions = (text: string) =>
  Array.from(new Set((text.match(/@[A-Za-z0-9_\-]+/g) || []).map(tag => tag.slice(1))));

export const whiteboardTypes: Array<{ label: string; color: string }> = [
  { label: 'Semua', color: 'var(--surface)' },
  { label: 'DO', color: '#e05252' },
  { label: 'Angkutan', color: '#5b8af5' },
  { label: 'Operasional', color: '#e8a045' },
  { label: 'Barang', color: '#4caf7d' },
  { label: 'Lainnya', color: '#a259f7' },
];

export const typeLabelByColor: Record<string, string> = {
  '#e05252': 'DO',
  '#5b8af5': 'Angkutan',
  '#e8a045': 'Operasional',
  '#4caf7d': 'Barang',
  '#a259f7': 'Lainnya',
  '#3a3f60': 'Lainnya',
};

export const getTypeLabel = (warna: string) => typeLabelByColor[warna] || 'Lainnya';

const AVATAR_COLORS = ['#e05252', '#5b8af5', '#e8a045', '#4caf7d', '#a259f7', '#f472b6'];

export const avatarColor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

export const fmtAgo = (s: string) => {
  const diff = Date.now() - new Date(s).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return 'baru saja';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} mnt lalu`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} jam lalu`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day} hr lalu`;
  return fmtDate(s);
};
