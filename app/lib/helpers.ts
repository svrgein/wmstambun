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
