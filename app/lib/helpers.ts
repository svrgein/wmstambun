// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────────

export const fmt = (n: number) => n.toLocaleString('id-ID');
export const fmtDate = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
export const fmtTime = (s: string) => new Date(s).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
export const today = () => new Date().toISOString().split('T')[0];
