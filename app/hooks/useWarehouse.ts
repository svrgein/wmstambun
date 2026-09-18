'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/lib/supabase';
import { today, fmt, parseMentions } from '@/app/lib/helpers';
import { DEFAULT_PALLET_SUPIR } from '@/app/lib/constants';
import type {
  ProductView, Transaction, UserProfile, Toko, Angkutan,
  DeliveryOrder, PalletLog, Catatan, CatatanKomentar, WhiteboardNotif,
  AbsenHarian, AbsenDailyNote,
  AuditLog, PalletStok,
  PalletRingkasan, PalletBalance, Pengiriman,
} from '@/app/lib/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 30000;

const normalizeProductKey = (value: string) => value.trim().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').toUpperCase();
const productOrderList = [
  'PCC 50',
  'PCC 40',
  'RAJAWALI 50',
  'RAJAWALI 40',
  'JEMPOLAN 40',
  'TR-30 ACIAN PUTIH',
  'TR-10',
  'TR-15 THINBED',
  'TR-18',
  'WHC 40',
  'UNI 01',
  'UNI 08',
];

const getProductOrderIndex = (p: ProductView) => {
  const fullName = normalizeProductKey(`${p.merk} ${p.nama}`);
  const foundIndex = productOrderList.findIndex(order => normalizeProductKey(order) === fullName);
  if (foundIndex !== -1) return foundIndex;
  const fallbackIndex = productOrderList.findIndex(order => fullName.includes(normalizeProductKey(order)) || normalizeProductKey(order).includes(fullName));
  return fallbackIndex !== -1 ? fallbackIndex : productOrderList.length;
};

const sortProductsByCustomOrder = (list: ProductView[]) => [...list].sort((a, b) => {
  const aIndex = getProductOrderIndex(a);
  const bIndex = getProductOrderIndex(b);
  if (aIndex !== bIndex) return aIndex - bIndex;
  const aKey = normalizeProductKey(`${a.merk} ${a.nama}`);
  const bKey = normalizeProductKey(`${b.merk} ${b.nama}`);
  return aKey.localeCompare(bKey);
});

const isUnimixProduct = (p: ProductView) => {
  const fullName = normalizeProductKey(`${p.merk} ${p.nama}`);
  return fullName.includes('UNIMIX') || fullName.includes('UNI MIX');
};

export function useWarehouse() {
  // ── Auth
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginLockSeconds, setLoginLockSeconds] = useState(0);
  const loginAttemptsRef = useRef(0);

  // ── Navigation
  const [activePage, setActivePage] = useState('dashboard');

  // ── Toast
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });

  // ── Core data
  const [products, setProducts] = useState<ProductView[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokos, setTokos] = useState<Toko[]>([]);
  const [angkutans, setAngkutans] = useState<Angkutan[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [palletLogs, setPalletLogs] = useState<PalletLog[]>([]);
  const [catatan, setCatatan] = useState<Catatan[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [palletStok, setPalletStok] = useState<PalletStok | null>(null);
  const [palletRingkasan, setPalletRingkasan] = useState<PalletRingkasan | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [commentsByNote, setCommentsByNote] = useState<Record<string, CatatanKomentar[]>>({});
  const [wbReadIds, setWbReadIds] = useState<string[]>([]);
  const [openWhiteboardNoteId, setOpenWhiteboardNoteId] = useState<string | null>(null);
  const [absenRows, setAbsenRows] = useState<AbsenHarian[]>([]);
  const [absenDailyNotes, setAbsenDailyNotes] = useState<Record<string, AbsenDailyNote>>({});

  const wbReadKey = user ? `whiteboard-read-${user.id}` : null;

  useEffect(() => {
    if (!user || !wbReadKey) return;
    const stored = window.localStorage.getItem(wbReadKey);
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWbReadIds(prev => {
        try {
          const parsed = JSON.parse(stored) as unknown;
          return Array.isArray(parsed) ? (parsed as string[]) : prev;
        } catch {
          return prev;
        }
      });
    }
  }, [user, wbReadKey]);

  useEffect(() => {
    if (!user || !wbReadKey) return;
    window.localStorage.setItem(wbReadKey, JSON.stringify(wbReadIds));
  }, [user, wbReadKey, wbReadIds]);

  // Notifikasi whiteboard diturunkan (derived) dari data catatan & komentar,
  // jadi selalu sinkron tanpa perlu menyimpan state duplikat.
  const whiteboardNotifications = useMemo<WhiteboardNotif[]>(() => {
    if (!user) return [];
    const me = (user.nama || '').trim().toLowerCase();
    const out: WhiteboardNotif[] = [];
    for (const cat of catatan) {
      const judul = (cat.judul || 'Tanpa judul').slice(0, 60);
      const mentionBody = parseMentions(cat.isi).some(n => n.toLowerCase() === me);
      if (mentionBody && cat.user_id !== user.id) {
        out.push({ id: `note-mention-${cat.id}`, catatan_id: cat.id, message: `Anda disebut dalam catatan "${judul}"`, created_at: cat.updated_at });
      }
      const cmts = commentsByNote[cat.id] || [];
      for (const cm of cmts) {
        if (cm.user_id === user.id) continue;
        if (parseMentions(cm.isi).some(n => n.toLowerCase() === me)) {
          out.push({ id: `c-mention-${cm.id}`, catatan_id: cat.id, message: `${cm.nama} menyebut Anda di komentar "${judul}"`, created_at: cm.created_at });
        }
      }
      if (cat.user_id === user.id) {
        const latest = [...cmts].reverse().find(cm => cm.user_id !== user.id);
        if (latest) {
          out.push({ id: `c-own-${latest.id}`, catatan_id: cat.id, message: `${latest.nama} berkomentar di "${judul}"`, created_at: latest.created_at });
        }
      }
    }
    return out
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, 40);
  }, [user, catatan, commentsByNote]);

  // Buang id "sudah dibaca" yang tidak lagi muncul di notifikasi (cegah menumpuk).
  useEffect(() => {
    if (!user || whiteboardNotifications.length === 0) return;
    const valid = new Set(whiteboardNotifications.map(n => n.id));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWbReadIds(prev => {
      const filtered = prev.filter(id => valid.has(id));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [user, whiteboardNotifications]);

  const unreadWhiteboardCount = whiteboardNotifications.filter(n => !wbReadIds.includes(n.id)).length;

  const markNotificationRead = (id: string) => {
    setWbReadIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  const clearWhiteboardNotifications = () => {
    setWbReadIds(whiteboardNotifications.map(n => n.id));
  };

  // ── Modal states
  const [modalToko, setModalToko] = useState(false);
  const [modalAngkutan, setModalAngkutan] = useState(false);
  const [modalDO, setModalDO] = useState(false);
  const [modalProduk, setModalProduk] = useState(false);
  const [modalPengiriman, setModalPengiriman] = useState(false);
  const [modalPallet, setModalPallet] = useState(false);
  const [modalCatatan, setModalCatatan] = useState(false);
  const [modalPalletStok, setModalPalletStok] = useState(false);
  const [editingCatatan, setEditingCatatan] = useState<Catatan | null>(null);
  const [editingAngkutan, setEditingAngkutan] = useState<Angkutan | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductView | null>(null);
  const [editingPengiriman, setEditingPengiriman] = useState<Pengiriman | null>(null);

  // ── Detail/selected
  const [selectedToko, setSelectedToko] = useState<Toko | null>(null);
  const [selectedAngkutan, setSelectedAngkutan] = useState<Angkutan | null>(null);
  const [selectedDO, setSelectedDO] = useState<DeliveryOrder | null>(null);

  // ── Stok forms
  const [masukId, setMasukId] = useState('');
  const [masukQty, setMasukQty] = useState('');
  const [masukNoSurat, setMasukNoSurat] = useState('');
  const [masukSupplier, setMasukSupplier] = useState('');
  const [masukKet, setMasukKet] = useState('');
  const [keluarId, setKeluarId] = useState('');
  const [keluarQty, setKeluarQty] = useState('');
  const [keluarNoSurat, setKeluarNoSurat] = useState('');
  const [keluarCustomer, setKeluarCustomer] = useState('');
  const [keluarKet, setKeluarKet] = useState('');

  // ── Produk form
  const [pNama, setPNama] = useState('');
  const [pMerk, setPMerk] = useState('');
  const [pBerat, setPBerat] = useState('50');
  const [pMinimal, setPMinimal] = useState('100');
  const [pStok, setPStok] = useState('');
  const [pKet, setPKet] = useState('');

  // ── Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ── Toko form
  const [tNama, setTNama] = useState('');
  const [tPemilik, setTPemilik] = useState('');
  const [tAlamat, setTAlamat] = useState('');
  const [tHP, setTHP] = useState('');
  const [tBatasPallet, setTBatasPallet] = useState('0');
  const [tCatatan, setTCatatan] = useState('');

  // ── Angkutan form
  const [aNama, setANama] = useState('');
  const [aSopir, setASopir] = useState('');
  const [aPolisi, setAPolisi] = useState('');
  const [aKapasitas, setAKapasitas] = useState('200');
  const [aStatus, setAStatus] = useState<'tersedia' | 'dalam_perjalanan' | 'maintenance' | 'tidak_aktif'>('tersedia');
  const [aCatatan, setACatatan] = useState('');

  // ── DO form
  const [doNoDO, setDoNoDO] = useState('');
  const [doTokoId, setDoTokoId] = useState('');
  const [doAngkutanId, setDoAngkutanId] = useState('');
  const [doTanggal, setDoTanggal] = useState(today());
  const [doCatatan, setDoCatatan] = useState('');
  const [doItems, setDoItems] = useState<{ produk_id: string; jumlah_zak: number }[]>([{ produk_id: '', jumlah_zak: 0 }]);

  // ── Pengiriman form
  const [pgDoId, setPgDoId] = useState('');
  const [pgZak, setPgZak] = useState('');
  const [pgPallet, setPgPallet] = useState('');
  const [pgAngkutanId, setPgAngkutanId] = useState('');
  const [pgStatus, setPgStatus] = useState<'persiapan' | 'jalan' | 'tiba'>('persiapan');
  const [pgCatatan, setPgCatatan] = useState('');

  // ── Pallet form
  const [plTokoId, setPlTokoId] = useState('');
  const [plDoId, setPlDoId] = useState('');
  const [plJenis, setPlJenis] = useState<'keluar' | 'kembali'>('keluar');
  const [plJumlah, setPlJumlah] = useState('');
  const [plCatatan, setPlCatatan] = useState('');

  // ── Laporan filters
  const [filterDari, setFilterDari] = useState('');
  const [filterSampai, setFilterSampai] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterProd, setFilterProd] = useState('');

  // ── Catatan form
  const [cJudul, setCJudul] = useState('');
  const [cIsi, setCIsi] = useState('');
  const [cWarna, setCWarna] = useState('#e8a045');

  // ── Pallet stok form
  const [psTotal, setPsTotal] = useState('');
  const [psStok, setPsStok] = useState('');
  const [psPalletIsi, setPsPalletIsi] = useState('');
  const [psPalletAngkutan, setPsPalletAngkutan] = useState('');
  const [psKet, setPsKet] = useState('');

  // ── Auth check
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Cek apakah sudah ganti hari sejak login terakhir — paksa login ulang tiap hari
        const LOGIN_KEY = `wms_login_at_${session.user.id}`;
        const loginAt = localStorage.getItem(LOGIN_KEY);
        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD lokal

        if (!loginAt || loginAt !== todayStr) {
          // Beda hari atau belum pernah login lewat app ini — paksa login ulang
          await supabase.auth.signOut();
          localStorage.removeItem(LOGIN_KEY);
          setLoadingUser(false);
          return;
        }

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) setUser({ id: session.user.id, nama: profile.nama, role: profile.role, email: session.user.email });
      }
      setLoadingUser(false);
    }
    checkUser();
  }, []);

  // ── Fetch all data
  // ── Absen angkutan harian ──
  const fetchAbsenData = async () => {
    if (!user) return;
    const [rowsRes, notesRes] = await Promise.all([
      supabase.from('absen_harian').select('*').order('tanggal'),
      supabase.from('absen_catatan_harian').select('*'),
    ]);
    if (!rowsRes.error) setAbsenRows(rowsRes.data as AbsenHarian[]);
    else console.error('Gagal memuat absen harian:', rowsRes.error.message);
    if (!notesRes.error) {
      const noteMap: Record<string, AbsenDailyNote> = {};
      (notesRes.data || []).forEach((n: AbsenDailyNote) => { noteMap[n.tanggal] = n; });
      setAbsenDailyNotes(noteMap);
    }
  };

  const fetchAll = async () => {
    if (!user) return;
    setIsLoadingData(true);
    try {
      const [stokRes, trxRes, tokoRes, angkutanRes, doRes, palletRes,
        catatanRes, auditRes, palletStokRes, palletRingkasanRes] = await Promise.all([
          supabase.from('v_stok').select('*').order('merk').order('nama'),
          supabase.from('transaksi').select('*, produk(nama,merk,berat_per_zak), profiles:user_id(nama)').order('tanggal', { ascending: false }),
          supabase.from('toko').select('*').order('nama'),
          supabase.from('angkutan').select('*').order('nama_sopir'),
          supabase.from('delivery_order').select('*, toko(*), angkutan(*), do_items(*, produk(nama,merk,berat_per_zak)), pengiriman(*, angkutan(*))').order('tanggal', { ascending: false }),
          supabase.from('pallet_log').select('*, toko(nama)').order('tanggal', { ascending: false }),
          supabase.from('catatan').select('*, profiles:user_id(nama)').order('pinned', { ascending: false }).order('updated_at', { ascending: false }),
          supabase.from('audit_log').select('*, profiles:user_id(nama)').order('created_at', { ascending: false }).limit(200),
          supabase.from('pallet_stok').select('*').limit(1).single(),
          supabase.from('v_pallet_ringkasan').select('*').single(),
        ]);
      if (stokRes.error) throw new Error(stokRes.error.message);
      if (trxRes.error) throw new Error(trxRes.error.message);
      if (tokoRes.error) throw new Error(tokoRes.error.message);
      if (angkutanRes.error) throw new Error(angkutanRes.error.message);
      if (doRes.error) throw new Error(doRes.error.message);
      if (palletRes.error) throw new Error(palletRes.error.message);
      const nextDeliveryOrders = doRes.data || [];
      setProducts(sortProductsByCustomOrder(stokRes.data || []));
      setTransactions(trxRes.data || []);
      setTokos(tokoRes.data || []);
      setAngkutans(angkutanRes.data || []);
      setDeliveryOrders(nextDeliveryOrders);
      if (selectedDO?.id) {
        const refreshedSelectedDO = nextDeliveryOrders.find(d => d.id === selectedDO.id) || null;
        setSelectedDO(refreshedSelectedDO);
      }
      setPalletLogs(palletRes.data || []);
      if (catatanRes.error) {
        console.error('Gagal memuat catatan whiteboard:', catatanRes.error);
        triggerToast('Catatan whiteboard tidak bisa dimuat karena aturan akses database. Periksa kebijakan RLS tabel catatan.', 'error');
      } else {
        setCatatan(catatanRes.data || []);
      }
      if (!auditRes.error) setAuditLogs(auditRes.data || []);
      if (!palletStokRes.error) setPalletStok(palletStokRes.data);
      if (!palletRingkasanRes.error) setPalletRingkasan(palletRingkasanRes.data);
      await fetchAbsenData();
    } catch (e: unknown) {
      const message = formatErrorMessage(e);
      triggerToast(message || 'Gagal sinkronisasi database', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { if (user) fetchAll(); }, [user]);

  const angkutanCategory = (a: Angkutan) => {
    const name = a.nama_angkutan.toLowerCase();
    if (name.includes('gms')) return 'GMS';
    if (name.includes('tms')) return 'TMS';
    if (name.includes('imk')) return 'IMK';
    return 'Lainnya';
  };

  const sortAngkutanByName = (list: Angkutan[]) => [...list].sort((a, b) => a.nama_angkutan.localeCompare(b.nama_angkutan));

  const angkutanGMS = sortAngkutanByName(angkutans.filter(a => angkutanCategory(a) === 'GMS'));
  const angkutanTMS = sortAngkutanByName(angkutans.filter(a => angkutanCategory(a) === 'TMS'));
  const angkutanIMK = sortAngkutanByName(angkutans.filter(a => angkutanCategory(a) === 'IMK'));
  const angkutanLainnya = sortAngkutanByName(angkutans.filter(a => angkutanCategory(a) === 'Lainnya'));
  const angkutanGroups = { GMS: angkutanGMS, TMS: angkutanTMS, IMK: angkutanIMK, Lainnya: angkutanLainnya };

  const formatErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null) {
      const errObj = error as Record<string, unknown>;
      if (typeof errObj.message === 'string') return errObj.message;
      try { return JSON.stringify(errObj); } catch {
        return String(error);
      }
    }
    return String(error);
  };

  // ── Toast
  function triggerToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3500);
  }

  // ── Login / Logout
  const handleLogin = async () => {
    if (isLoggingIn) return;
    const email = loginEmail.trim().toLowerCase();
    if (!email || !loginPassword) { setLoginError('⚠️ Isi email dan password.'); return; }
    if (!EMAIL_REGEX.test(email)) { setLoginError('⚠️ Format email tidak valid. Contoh: nama@perusahaan.com'); return; }
    if (loginLockSeconds > 0) { setLoginError('⏳ Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat.'); return; }

    setLoginError('');
    setIsLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: loginPassword });
      if (error || !data?.user) {
        // Pesan error disamarkan agar tidak membocorkan apakah email terdaftar atau tidak.
        console.error('Login gagal:', error?.message || 'Pengguna tidak ditemukan');
        loginAttemptsRef.current += 1;
        if (loginAttemptsRef.current >= MAX_LOGIN_ATTEMPTS) {
          loginAttemptsRef.current = 0;
          setLoginLockSeconds(Math.round(LOGIN_LOCK_MS / 1000));
          setLoginError('⏳ Terlalu banyak percobaan gagal. Login dikunci sementara.');
        } else {
          const sisa = MAX_LOGIN_ATTEMPTS - loginAttemptsRef.current;
          setLoginError(`Email atau password salah (${sisa} percobaan tersisa).`);
        }
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      setUser({ id: data.user.id, nama: profile?.nama || 'User', role: profile?.role || 'operator', email: data.user.email });
      // Simpan tanggal login hari ini — session expired saat ganti hari
      localStorage.setItem(`wms_login_at_${data.user.id}`, new Date().toLocaleDateString('en-CA'));
      loginAttemptsRef.current = 0;
      setLoginLockSeconds(0);
      setLoginPassword('');
      setLoginEmail('');
      triggerToast('Login berhasil!');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) localStorage.removeItem(`wms_login_at_${session.user.id}`);
    await supabase.auth.signOut();
    setUser(null);
    setActivePage('dashboard');
  };

  // Hitung mundur kunci login (pengaman anti brute-force di sisi klien).
  const loginLocked = loginLockSeconds > 0;
  useEffect(() => {
    if (!loginLocked) return;
    const id = setInterval(() => {
      setLoginLockSeconds(s => {
        if (s <= 1) { clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [loginLocked]);

  const savePassword = async () => {
    if (!newPassword || !confirmPassword) {
      triggerToast('Isi password baru dan konfirmasi password.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast('Password baru dan konfirmasi harus sama.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      triggerToast('Password harus minimal 8 karakter.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        triggerToast(`Gagal mengubah password: ${error.message}`, 'error');
        return;
      }
      if (data) {
        triggerToast('Password berhasil diubah. Silakan login ulang jika diminta.');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (e: unknown) {
      triggerToast(formatErrorMessage(e) || 'Gagal mengubah password.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ── Stok: Masuk / Keluar
  const submitMasuk = async () => {
    if (!masukId || !masukQty || Number(masukQty) <= 0) { triggerToast('Form tidak valid!', 'error'); return; }
    const prod = products.find(p => p.id === masukId);
    const beratPerZak = prod ? prod.berat_per_zak : 50;
    const jumlahZak = Math.round((Number(masukQty) * 1000) / beratPerZak);

    const { error } = await supabase.from('transaksi').insert({ produk_id: masukId, user_id: user?.id, jenis: 'masuk', jumlah_zak: jumlahZak, no_surat: masukNoSurat || null, pihak: masukSupplier || null, keterangan: masukKet || null });
    if (error) { triggerToast(error.message, 'error'); return; }
    await supabase.from('audit_log').insert({
      user_id: user?.id, tabel: 'transaksi', aksi: 'INSERT',
      ringkasan: `Stok masuk ${prod?.merk || ''} ${prod?.nama || ''}: ${fmt(jumlahZak)} Zak${masukSupplier ? ` dari ${masukSupplier}` : ''}${masukNoSurat ? ` (Surat: ${masukNoSurat})` : ''}`,
    });
    triggerToast(`Stok masuk tersimpan (${fmt(jumlahZak)} Zak)`);
    setMasukQty(''); setMasukNoSurat(''); setMasukSupplier(''); setMasukKet('');
    fetchAll();
  };

  const submitKeluar = async () => {
    if (!keluarId || !keluarQty || Number(keluarQty) <= 0) { triggerToast('Form tidak valid!', 'error'); return; }
    const prod = products.find(p => p.id === keluarId);
    const beratPerZak = prod ? prod.berat_per_zak : 50;
    const jumlahZak = Math.round((Number(keluarQty) * 1000) / beratPerZak);

    const { error } = await supabase.from('transaksi').insert({ produk_id: keluarId, user_id: user?.id, jenis: 'keluar', jumlah_zak: jumlahZak, no_surat: keluarNoSurat || null, pihak: keluarCustomer || null, keterangan: keluarKet || null });
    if (error) { triggerToast(`Gagal: ${error.message}`, 'error'); return; }
    await supabase.from('audit_log').insert({
      user_id: user?.id, tabel: 'transaksi', aksi: 'INSERT',
      ringkasan: `Stok keluar ${prod?.merk || ''} ${prod?.nama || ''}: ${fmt(jumlahZak)} Zak${keluarCustomer ? ` ke ${keluarCustomer}` : ''}${keluarNoSurat ? ` (Surat: ${keluarNoSurat})` : ''}`,
    });
    triggerToast(`Barang keluar divalidasi (${fmt(jumlahZak)} Zak)`);
    setKeluarQty(''); setKeluarNoSurat(''); setKeluarCustomer(''); setKeluarKet('');
    fetchAll();
  };

  // ── Produk
  const openEditProduk = (p: ProductView) => {
    setEditingProduct(p);
    setPNama(p.nama); setPMerk(p.merk); setPBerat(String(p.berat_per_zak));
    setPMinimal(String(p.stok_minimal)); setPStok(String(p.stok_zak)); setPKet(p.keterangan || '');
    setModalProduk(true);
  };

  const saveProduk = async () => {
    if (user?.role !== 'admin' && user?.role !== 'superadmin') { triggerToast('Akses ditolak: Hanya Admin yang dapat menambah/edit produk.', 'error'); return; }
    if (!pNama || !pMerk) { triggerToast('Nama dan Merk wajib diisi!', 'error'); return; }
    if (editingProduct) {
      const payload: {
        nama: string;
        merk: string;
        berat_per_zak: number;
        stok_minimal: number;
        keterangan: string | null;
      } = {
        nama: pNama,
        merk: pMerk,
        berat_per_zak: Number(pBerat) || 50,
        stok_minimal: Number(pMinimal) || 100,
        keterangan: pKet || null,
      };

      const { error } = await supabase.from('produk').update(payload).eq('id', editingProduct.id);
      if (error) { triggerToast(error.message, 'error'); return; }

      if (user?.role === 'superadmin' && pStok !== '') {
        const newStock = Number(pStok);
        const currentStock = editingProduct.stok_zak;
        const diff = newStock - currentStock;
        if (diff !== 0) {
          const trxPayload = {
            produk_id: editingProduct.id,
            user_id: user?.id,
            jenis: diff > 0 ? 'masuk' : 'keluar',
            jumlah_zak: Math.abs(diff),
            no_surat: null,
            pihak: null,
            keterangan: `Koreksi stok superadmin: ${diff > 0 ? 'tambah' : 'kurang'} ${Math.abs(diff)} zak`,
          };
          const { error: stokError } = await supabase.from('transaksi').insert(trxPayload);
          if (stokError) { triggerToast(`Gagal koreksi stok: ${stokError.message}`, 'error'); return; }
          await supabase.from('audit_log').insert({
            user_id: user?.id, tabel: 'transaksi', aksi: 'INSERT',
            ringkasan: `Koreksi stok ${diff > 0 ? 'masuk' : 'keluar'} ${Math.abs(diff)} zak untuk ${pMerk} ${pNama}`,
          });
        }
      }

      await supabase.from('audit_log').insert({
        user_id: user?.id, tabel: 'produk', aksi: 'UPDATE',
        ringkasan: `Produk diperbarui: ${pMerk} ${pNama} (${pBerat}kg/zak, minimal ${pMinimal} zak)`,
      });
      triggerToast('Produk diperbarui');
    } else {
      const payload: {
        nama: string;
        merk: string;
        berat_per_zak: number;
        stok_minimal: number;
        keterangan: string | null;
      } = {
        nama: pNama,
        merk: pMerk,
        berat_per_zak: Number(pBerat) || 50,
        stok_minimal: Number(pMinimal) || 100,
        keterangan: pKet || null,
      };

      const { data, error } = await supabase.from('produk').insert(payload).select('id').single();
      if (error) { triggerToast(error.message, 'error'); return; }
      const productId = data?.id;

      if (user?.role === 'superadmin' && pStok !== '' && productId) {
        const newStock = Number(pStok);
        if (newStock !== 0) {
          const trxPayload = {
            produk_id: productId,
            user_id: user?.id,
            jenis: newStock > 0 ? 'masuk' : 'keluar',
            jumlah_zak: Math.abs(newStock),
            no_surat: null,
            pihak: null,
            keterangan: `Inisialisasi stok superadmin: ${Math.abs(newStock)} zak`,
          };
          const { error: stokError } = await supabase.from('transaksi').insert(trxPayload);
          if (stokError) { triggerToast(`Gagal set stok awal: ${stokError.message}`, 'error'); return; }
          await supabase.from('audit_log').insert({
            user_id: user?.id, tabel: 'transaksi', aksi: 'INSERT',
            ringkasan: `Set stok awal ${Math.abs(newStock)} zak untuk ${pMerk} ${pNama}`,
          });
        }
      }

      await supabase.from('audit_log').insert({
        user_id: user?.id, tabel: 'produk', aksi: 'INSERT',
        ringkasan: `Produk dibuat: ${pMerk} ${pNama} (${pBerat}kg/zak, minimal ${pMinimal} zak)`,
      });
      triggerToast('Produk tersimpan');
    }
    setModalProduk(false); setEditingProduct(null); setPNama(''); setPMerk(''); setPBerat('50'); setPMinimal('100'); setPStok(''); setPKet('');
    fetchAll();
  };

  // ── Toko
  const saveToko = async () => {
    if (user?.role !== 'admin' && user?.role !== 'superadmin') { triggerToast('Akses ditolak: Hanya Admin yang dapat mengelola toko.', 'error'); return; }
    if (!tNama) { triggerToast('Nama toko wajib diisi!', 'error'); return; }
    const { error } = await supabase.from('toko').insert({ nama: tNama, pemilik: tPemilik || null, alamat: tAlamat || null, no_hp: tHP || null, batas_pallet: Number(tBatasPallet) || 0, catatan: tCatatan || null });
    if (error) { triggerToast(error.message, 'error'); return; }
    await supabase.from('audit_log').insert({
      user_id: user?.id, tabel: 'toko', aksi: 'INSERT',
      ringkasan: `Toko dibuat: ${tNama}${tPemilik ? ` (${tPemilik})` : ''}${tAlamat ? ` — ${tAlamat}` : ''}`,
    });
    triggerToast('Toko tersimpan');
    setModalToko(false); setTNama(''); setTPemilik(''); setTAlamat(''); setTHP(''); setTBatasPallet('0'); setTCatatan('');
    fetchAll();
  };

  // ── Angkutan
  const openEditAngkutan = (a: Angkutan) => {
    setEditingAngkutan(a);
    setANama(a.nama_angkutan); setASopir(a.nama_sopir); setAPolisi(a.no_polisi || '');
    setAKapasitas(String(a.kapasitas_zak)); setAStatus(a.status); setACatatan(a.catatan || '');
    setModalAngkutan(true);
  };

  const saveAngkutan = async () => {
    if (user?.role !== 'admin' && user?.role !== 'superadmin') { triggerToast('Akses ditolak: Hanya Admin yang dapat mengelola angkutan.', 'error'); return; }
    if (!aNama || !aSopir) { triggerToast('Nama angkutan dan sopir wajib diisi!', 'error'); return; }
    const validStatuses = ['tersedia', 'dalam_perjalanan', 'maintenance', 'tidak_aktif'];
    if (!validStatuses.includes(aStatus)) {
      triggerToast('Status angkutan tidak valid. Pilih status dari daftar.', 'error');
      return;
    }
    const payload = { nama_angkutan: aNama, nama_sopir: aSopir, no_polisi: aPolisi || null, kapasitas_zak: Number(aKapasitas) || 200, status: aStatus, catatan: aCatatan || null };
    if (editingAngkutan) {
      const { error } = await supabase.from('angkutan').update(payload).eq('id', editingAngkutan.id);
      if (error) { triggerToast(error.message, 'error'); return; }
      await supabase.from('audit_log').insert({
        user_id: user?.id, tabel: 'angkutan', aksi: 'UPDATE',
        ringkasan: `Update angkutan: ${aNama} (${aSopir}) | status ${aStatus}${aPolisi ? ` | polisi ${aPolisi}` : ''}`,
      });
      triggerToast('Angkutan berhasil diperbarui');
    } else {
      const { error } = await supabase.from('angkutan').insert(payload);
      if (error) { triggerToast(error.message, 'error'); return; }
      await supabase.from('audit_log').insert({
        user_id: user?.id, tabel: 'angkutan', aksi: 'INSERT',
        ringkasan: `Angkutan baru: ${aNama} (${aSopir}) | status ${aStatus}${aPolisi ? ` | polisi ${aPolisi}` : ''}`,
      });
      triggerToast('Angkutan tersimpan');
    }
    setModalAngkutan(false); setEditingAngkutan(null); setANama(''); setASopir(''); setAPolisi(''); setACatatan('');
    fetchAll();
  };

  const deleteAngkutan = async (id: string) => {
    if (!confirm('Hapus angkutan ini?')) return;
    const ang = angkutans.find(a => a.id === id);

    // Cek langsung ke database — jangan andalkan state lokal yang mungkin tidak lengkap
    const { data: doTerkait, error: checkError } = await supabase
      .from('delivery_order')
      .select('no_do, status')
      .eq('angkutan_id', id)
      .not('status', 'in', '("batal","selesai")');

    if (checkError) { triggerToast(checkError.message, 'error'); return; }

    if (doTerkait && doTerkait.length > 0) {
      const listDO = doTerkait.map((d: { no_do: string }) => d.no_do).join(', ');
      triggerToast(
        `Tidak bisa hapus — angkutan masih dipakai di DO aktif: ${listDO}. Batalkan atau selesaikan DO tersebut terlebih dahulu.`,
        'error'
      );
      return;
    }

    const { error } = await supabase.from('angkutan').delete().eq('id', id);
    if (error) { triggerToast(error.message, 'error'); return; }
    await supabase.from('audit_log').insert({
      user_id: user?.id, tabel: 'angkutan', aksi: 'DELETE',
      ringkasan: `Hapus angkutan: ${ang?.nama_angkutan} (${ang?.nama_sopir})`,
    });
    triggerToast('Angkutan dihapus');
    fetchAll();
  };

  // ── Produk
  const saveDO = async () => {
    if (!doNoDO.trim()) { triggerToast('No SDO wajib diisi!', 'error'); return; }
    if (!doTokoId || !doAngkutanId) { triggerToast('Toko dan Angkutan wajib dipilih!', 'error'); return; }
    const validItems = doItems.filter(i => i.produk_id && i.jumlah_zak > 0);
    if (validItems.length === 0) { triggerToast('Tambah minimal 1 item semen!', 'error'); return; }
    const totalZak = validItems.reduce((s, i) => s + i.jumlah_zak, 0);
    const noDO = doNoDO.trim();
    const { data: doData, error: doErr } = await supabase.from('delivery_order').insert({
      no_do: noDO, toko_id: doTokoId, angkutan_id: doAngkutanId,
      tanggal: doTanggal, status: 'draft', total_zak: totalZak,
      total_pallet: 0, catatan: doCatatan || null, created_by: user?.id,
    }).select().single();
    if (doErr) { triggerToast(doErr.message, 'error'); return; }
    const { error: itemErr } = await supabase.from('do_items').insert(
      validItems.map(i => ({ do_id: doData.id, produk_id: i.produk_id, jumlah_zak: i.jumlah_zak }))
    );
    if (itemErr) { triggerToast(itemErr.message, 'error'); return; }
    const doToko = tokos.find(t => t.id === doTokoId);
    const doAngkut = angkutans.find(a => a.id === doAngkutanId);
    await supabase.from('audit_log').insert({
      user_id: user?.id, tabel: 'delivery_order', aksi: 'INSERT',
      ringkasan: `DO dibuat ${noDO}: ${fmt(totalZak)} zak → ${doToko?.nama || ''} via ${doAngkut?.nama_sopir || ''} (${validItems.length} item)`,
    });
    triggerToast(`DO ${noDO} berhasil dibuat`);
    setModalDO(false); setDoNoDO(''); setDoTokoId(''); setDoAngkutanId(''); setDoCatatan('');
    setDoItems([{ produk_id: '', jumlah_zak: 0 }]);
    fetchAll();
  };

  // ── Pengiriman
  const savePengiriman = async () => {
    if (!pgDoId || !pgZak) { triggerToast('DO dan Jumlah Zak wajib diisi!', 'error'); return; }
    const doRef = deliveryOrders.find(d => d.id === pgDoId);
    if (!doRef) { triggerToast('DO tidak ditemukan', 'error'); return; }
    const existing = doRef.pengiriman || [];
    const currentId = editingPengiriman?.id;
    const sudahDikirim = existing.reduce((s, p) => s + (p.id === currentId ? 0 : p.jumlah_zak), 0);
    const sisa = doRef.total_zak - sudahDikirim;
    const newZak = Number(pgZak);
    if (newZak > sisa) {
      triggerToast(`⚠️ Melebihi sisa zak! Sisa: ${fmt(sisa)} zak, input: ${fmt(newZak)} zak`, 'error');
      return;
    }
    if (editingPengiriman) {
      const { error } = await supabase.from('pengiriman').update({
        jumlah_zak: newZak, jumlah_pallet: Number(pgPallet) || 0,
        angkutan_id: pgAngkutanId || null,
        waktu_berangkat: new Date().toISOString(), status: pgStatus, catatan: pgCatatan || null,
      }).eq('id', editingPengiriman.id);
      if (error) { triggerToast(error.message, 'error'); return; }
      await supabase.from('audit_log').insert({
        user_id: user?.id, tabel: 'pengiriman', aksi: 'UPDATE',
        ringkasan: `Tahap ${editingPengiriman.tahap} DO ${doRef.no_do} diperbarui: ${fmt(newZak)} zak`,
      });
      triggerToast('Pengiriman diperbarui');
    } else {
      const tahap = existing.length + 1;
      const { error } = await supabase.from('pengiriman').insert({
        do_id: pgDoId,
        angkutan_id: pgAngkutanId || doRef.angkutan_id || null,
        tahap,
        jumlah_zak: newZak,
        jumlah_pallet: Number(pgPallet) || 0,
        waktu_berangkat: new Date().toISOString(),
        status: pgStatus,
        catatan: pgCatatan || null,
      });
      if (error) { triggerToast(error.message, 'error'); return; }
      await supabase.from('delivery_order').update({ status: 'proses' }).eq('id', pgDoId);
      if (doRef.angkutan_id) {
        await supabase.from('angkutan').update({ status: 'dalam_perjalanan' }).eq('id', doRef.angkutan_id);
      }
      await supabase.from('audit_log').insert({
        user_id: user?.id, tabel: 'pengiriman', aksi: 'INSERT',
        ringkasan: `Tahap ${tahap} DO ${doRef.no_do} dibuat: ${fmt(newZak)} zak → ${doRef.toko?.nama || ''}`,
      });
      const selesaiSemua = sudahDikirim + newZak >= doRef.total_zak;
      triggerToast(`Tahap ${tahap} dicatat${selesaiSemua ? ' — ✅ Semua zak sudah dikirim!' : ` — Sisa ${fmt(sisa - newZak)} zak`}`);
    }
    setModalPengiriman(false); setEditingPengiriman(null); setPgDoId(''); setPgZak(''); setPgPallet(''); setPgAngkutanId(''); setPgCatatan('');
    fetchAll();
  };

  const openEditPengiriman = (pg: Pengiriman) => {
    setEditingPengiriman(pg);
    setPgDoId(pg.do_id); setPgZak(String(pg.jumlah_zak)); setPgPallet(String(pg.jumlah_pallet));
    setPgAngkutanId(pg.angkutan_id || ''); setPgStatus(pg.status); setPgCatatan(pg.catatan || ''); setModalPengiriman(true);
  };

  const deletePengiriman = async (id: string) => {
    if (!confirm('Hapus kiriman ini?')) return;
    const pg = deliveryOrders.flatMap(d => (d.pengiriman || []).map(p => ({ ...p, do: d }))).find(p => p.id === id);
    if (!pg) return;
    const { error } = await supabase.from('pengiriman').delete().eq('id', id);
    if (error) { triggerToast(error.message, 'error'); return; }
    const doRef = deliveryOrders.find(d => d.id === pg.do_id);
    if (doRef) {
      const remaining = (doRef.pengiriman || []).filter(p => p.id !== id);
      const statusUpdate = remaining.length === 0 ? 'draft' : 'proses';
      await supabase.from('delivery_order').update({ status: statusUpdate }).eq('id', doRef.id);
      if (statusUpdate === 'draft' && doRef.angkutan_id) {
        await supabase.from('angkutan').update({ status: 'tersedia' }).eq('id', doRef.angkutan_id);
      }
    }
    await supabase.from('audit_log').insert({
      user_id: user?.id, tabel: 'pengiriman', aksi: 'DELETE',
      ringkasan: `Tahap ${pg.tahap} DO ${pg.do.no_do} dihapus`,
    });
    triggerToast('Pengiriman dihapus');
    fetchAll();
  };

  // ── Pallet log
  const savePalletLog = async () => {
    if (!plTokoId || !plJumlah || Number(plJumlah) <= 0) { triggerToast('Form pallet tidak valid!', 'error'); return; }
    const { error } = await supabase.from('pallet_log').insert({
      toko_id: plTokoId, do_id: plDoId || null, jenis: plJenis,
      jumlah: Number(plJumlah), tanggal: new Date().toISOString(), catatan: plCatatan || null,
    });
    if (error) { triggerToast(error.message, 'error'); return; }
    await supabase.from('audit_log').insert({
      user_id: user?.id, tabel: 'pallet_log', aksi: 'INSERT',
      ringkasan: `Pallet ${plJenis} ${plJumlah} ke toko ${tokos.find(t => t.id === plTokoId)?.nama || ''}`,
    });
    triggerToast(`Pallet ${plJenis === 'keluar' ? 'keluar ke toko' : 'kembali ke gudang'} dicatat`);
    setModalPallet(false); setPlTokoId(''); setPlDoId(''); setPlJumlah(''); setPlCatatan('');
    fetchAll();
  };

  // ── Catatan
  const saveCatatan = async () => {
    if (!cIsi.trim()) { triggerToast('Isi catatan tidak boleh kosong!', 'error'); return; }
    if (editingCatatan) {
      const { error } = await supabase.from('catatan').update({
        judul: cJudul || 'Catatan', isi: cIsi, warna: cWarna, updated_at: new Date().toISOString(),
      }).eq('id', editingCatatan.id);
      if (error) { triggerToast(error.message, 'error'); return; }
      await supabase.from('audit_log').insert({
        user_id: user?.id, tabel: 'catatan', aksi: 'UPDATE',
        ringkasan: `Catatan diperbarui: "${cJudul || 'Catatan'}"`,
      });
      triggerToast('Catatan diperbarui');
    } else {
      const { error } = await supabase.from('catatan').insert({
        user_id: user?.id, judul: cJudul || 'Catatan', isi: cIsi, warna: cWarna,
      });
      if (error) { triggerToast(error.message, 'error'); return; }
      await supabase.from('audit_log').insert({
        user_id: user?.id, tabel: 'catatan', aksi: 'INSERT',
        ringkasan: `Catatan dibuat: "${cJudul || 'Catatan'}"`,
      });
      triggerToast('Catatan disimpan');
    }
    setModalCatatan(false); setCJudul(''); setCIsi(''); setCWarna('#e8a045'); setEditingCatatan(null);
    fetchAll();
  };

  const deleteCatatan = async (id: string) => {
    if (!confirm('Hapus catatan ini?')) return;
    const cat = catatan.find(c => c.id === id);
    if (!cat) return;
    if (cat.user_id !== user?.id && user?.role !== 'superadmin') {
      triggerToast('Akses ditolak: Hanya pembuat catatan atau superadmin yang dapat menghapus.', 'error');
      return;
    }
    const { error } = await supabase.from('catatan').delete().eq('id', id);
    if (error) { triggerToast(error.message, 'error'); return; }
    await supabase.from('audit_log').insert({
      user_id: user?.id, tabel: 'catatan', aksi: 'DELETE',
      ringkasan: `Catatan dihapus: "${cat?.judul || 'Catatan'}"`,
    });
    triggerToast('Catatan dihapus');
    fetchAll();
  };

  const togglePinCatatan = async (c: Catatan) => {
    await supabase.from('catatan').update({ pinned: !c.pinned }).eq('id', c.id);
    fetchAll();
  };

  const openEditCatatan = (c: Catatan) => {
    setEditingCatatan(c); setCJudul(c.judul); setCIsi(c.isi); setCWarna(c.warna);
    setModalCatatan(true);
  };

  // ── Pallet stok
  const savePalletStokGudang = async () => {
    if (user?.role !== 'admin' && user?.role !== 'superadmin') { triggerToast('Akses ditolak: Hanya Admin yang dapat mengkoreksi stok pallet awal.', 'error'); return; }
    const payload = {
      total_pallet: psTotal !== '' ? Number(psTotal) : (palletStok?.total_pallet ?? 0),
      stok_gudang: psStok !== '' ? Number(psStok) : (palletStok?.stok_gudang ?? 0),
      pallet_isi: psPalletIsi !== '' ? Number(psPalletIsi) : (palletStok?.pallet_isi ?? 0),
      pallet_angkutan: psPalletAngkutan !== '' ? Number(psPalletAngkutan) : (palletStok?.pallet_angkutan ?? 0),
      keterangan: psKet || null,
      updated_at: new Date().toISOString(),
    };
    if (palletStok) {
      await supabase.from('pallet_stok').update(payload).eq('id', palletStok.id);
    } else {
      await supabase.from('pallet_stok').insert(payload);
    }
    await supabase.from('audit_log').insert({
      user_id: user?.id, tabel: 'pallet_stok', aksi: 'UPDATE',
      ringkasan: `Koreksi pallet — Total:${payload.total_pallet} Gudang(kosong):${payload.stok_gudang} Gudang(isi):${payload.pallet_isi} Angkutan:${payload.pallet_angkutan}`,
    });
    triggerToast('Stok pallet diperbarui');
    setModalPalletStok(false);
    setPsTotal(''); setPsStok(''); setPsPalletIsi(''); setPsPalletAngkutan(''); setPsKet('');
    fetchAll();
  };

  // ── DO item helpers
  const addDoItem = () => setDoItems(p => [...p, { produk_id: '', jumlah_zak: 0 }]);
  const removeDoItem = (i: number) => setDoItems(p => p.filter((_, idx) => idx !== i));
  const updateDoItem = (i: number, field: string, val: string) => {
    setDoItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: field === 'jumlah_zak' ? Number(val) : val } : item));
  };

  // ── Derived
  const visibleProducts = products.filter(p => !isUnimixProduct(p));
  const totalZak = visibleProducts.reduce((s, p) => s + p.stok_zak, 0);
  const totalTon = visibleProducts.reduce((s, p) => s + p.stok_ton, 0);
  const stokRendah = products.filter(p => p.stok_rendah);
  const todayStr = today();
  const todayTrx = transactions.filter(t => t.tanggal.split('T')[0] === todayStr);
  const todayDO = deliveryOrders.filter(d => d.tanggal.split('T')[0] === todayStr);
  const getTrxTon = (trx: Transaction) => {
    const berat = trx.produk?.berat_per_zak ?? products.find(p => p.id === trx.produk_id)?.berat_per_zak ?? 50;
    return (trx.jumlah_zak * berat) / 1000;
  };
  const todayTonIn = todayTrx
    .filter(t => t.jenis === 'masuk')
    .reduce((sum, t) => sum + getTrxTon(t), 0);
  const todayTonOut = todayTrx
    .filter(t => t.jenis === 'keluar')
    .reduce((sum, t) => sum + getTrxTon(t), 0);
  const angkutanJalan = angkutans.filter(a => a.status === 'dalam_perjalanan');

  const palletSaldoByToko = (tokoId: string) => {
    return palletLogs.filter(l => l.toko_id === tokoId)
      .reduce((s, l) => l.jenis === 'keluar' ? s + l.jumlah : s - l.jumlah, 0);
  };

  const filteredTrx = transactions.filter(t => {
    const d = t.tanggal.split('T')[0];
    if (filterDari && d < filterDari) return false;
    if (filterSampai && d > filterSampai) return false;
    if (filterJenis && t.jenis !== filterJenis) return false;
    if (filterProd && t.produk_id !== filterProd) return false;
    return true;
  });

  // ── Pallet balance helper
  const getPalletBalance = (): PalletBalance => {
    const total = palletRingkasan?.total_pallet ?? palletStok?.total_pallet ?? 0;

    // "Di Angkutan" mengikuti absen hari ini: supir hadir yang membawa pallet
    // dari gudang kita (default 4 per supir). Kalau belum ada absen hari ini,
    // jatuh ke angka manual / ringkasan dari stok pallet.
    // Hanya hitung jenis 'reguler' (bukan bantuan) dan deduplicate per angkutan_id
    // supaya tidak double-count kalau beberapa user mengisi absen angkutan yang sama.
    const seenAngkutanIds = new Set<string>();
    const absenPalletKitaHariIni = absenRows
      .filter(r => {
        if (r.tanggal !== today()) return false;
        if (r.status !== 'hadir') return false;
        if (r.asal_pallet !== 'gudang_kita') return false;
        if (r.jenis !== 'reguler') return false;
        // skip duplikat angkutan_id yang sama
        if (r.angkutan_id && seenAngkutanIds.has(r.angkutan_id)) return false;
        if (r.angkutan_id) seenAngkutanIds.add(r.angkutan_id);
        return true;
      })
      .reduce((sum, r) => sum + (r.jumlah_pallet || 0), 0);
    const angkutanManual = palletRingkasan?.pallet_angkutan ?? palletStok?.pallet_angkutan ?? 0;
    const angkutan = absenPalletKitaHariIni > 0 ? absenPalletKitaHariIni : angkutanManual;

    const toko = palletRingkasan?.stok_di_toko ?? 0;

    // Pallet isi dihitung dari total tonase stok non-Unimix.
    // 1 pallet = 2 ton, sedangkan produk Unimix tidak masuk hitungan stok.
    const totalTonaseNonUnimix = products
      .filter(p => !isUnimixProduct(p))
      .reduce((sum, p) => sum + Math.max(0, p.stok_ton), 0);

    const isi = Math.max(0, Math.ceil(totalTonaseNonUnimix / 2));

    // Gudang kosong adalah sisa dari total dikurangi yang sedang terpakai
    const kosong = total - (isi + angkutan + toko);
    const terpakai = kosong + isi + angkutan + toko; // = total
    const selisih = 0; // Selalu 0 karena kosong dihitung otomatis berdasarkan total

    return { total, kosong, isi, angkutan, toko, terpakai, selisih };
  };

  const downloadBackup = async () => {
    if (user?.role !== 'superadmin') {
      triggerToast('Hanya superadmin yang dapat membuat backup.', 'error');
      return;
    }

    const backupTables = ['profiles', 'produk', 'transaksi', 'toko', 'angkutan', 'delivery_order', 'do_items', 'pengiriman', 'pallet_log', 'pallet_stok', 'catatan', 'catatan_komentar', 'audit_log', 'cancel_do_manual'];
    setIsLoadingData(true);
    try {
      const results = await Promise.all(backupTables.map(async (table) => ({ table, result: await supabase.from(table).select('*') })));
      const errors = results.filter(({ result }) => result.error).map(({ table, result }) => `${table}: ${result.error?.message}`);
      const data = Object.fromEntries(results.map(({ table, result }) => [table, result.data || []]));
      const backup = { application: 'DLI Tambun Warehouse Management System', exported_at: new Date().toISOString(), timezone: 'Asia/Jakarta', exported_by: user.nama, data, errors };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-gudang-semen-${today()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      triggerToast(errors.length ? `Backup diunduh, tetapi ${errors.length} tabel tidak dapat dibaca.` : 'Backup lengkap berhasil diunduh.');
    } finally {
      setIsLoadingData(false);
    }
  };

  // ── Whiteboard: komentar & realtime ──
  const loadComments = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('catatan_komentar')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      const grouped = (data || []).reduce<Record<string, CatatanKomentar[]>>((acc, row) => {
        if (!row.catatan_id) return acc;
        (acc[row.catatan_id] = acc[row.catatan_id] || []).push({
          id: row.id,
          catatan_id: row.catatan_id,
          user_id: row.user_id || null,
          nama: row.nama || 'Guest',
          isi: row.isi || '',
          created_at: row.created_at || new Date().toISOString(),
        });
        return acc;
      }, {});
      setCommentsByNote(grouped);
      window.localStorage.setItem('whiteboard-comments', JSON.stringify(grouped));
    } catch (err) {
      console.error('Gagal memuat komentar whiteboard:', err);
    }
  };

  const addComment = async (catatanId: string, isi: string): Promise<boolean> => {
    const text = isi.trim();
    if (!text || !user?.id) return false;
    const author = user.nama?.trim() || 'Guest';
    const { data, error } = await supabase
      .from('catatan_komentar')
      .insert({ catatan_id: catatanId, user_id: user.id, nama: author, isi: text })
      .select()
      .single();
    if (error) {
      console.error('Komentar gagal disimpan:', error.message);
      triggerToast('Komentar gagal disimpan. Periksa kebijakan RLS tabel komentar.', 'error');
      return false;
    }
    const saved: CatatanKomentar = {
      id: data.id,
      catatan_id: catatanId,
      user_id: data.user_id || user.id,
      nama: data.nama || author,
      isi: data.isi || text,
      created_at: data.created_at || new Date().toISOString(),
    };
    setCommentsByNote(prev => ({ ...prev, [catatanId]: [...(prev[catatanId] || []), saved] }));
    return true;
  };

  const deleteComment = async (comment: CatatanKomentar): Promise<boolean> => {
    if (!user?.id) return false;
    const isOwner = comment.user_id === user.id;
    const isSuperadmin = user.role === 'superadmin';
    if (!isOwner && !isSuperadmin) {
      triggerToast('Akses ditolak: hanya penulis komentar atau superadmin yang dapat menghapus.', 'error');
      return false;
    }
    const { error } = await supabase.from('catatan_komentar').delete().eq('id', comment.id);
    if (error) {
      triggerToast(error.message || 'Gagal menghapus komentar. Periksa kebijakan RLS tabel komentar.', 'error');
      return false;
    }
    setCommentsByNote(prev => ({
      ...prev,
      [comment.catatan_id]: (prev[comment.catatan_id] || []).filter(c => c.id !== comment.id),
    }));
    const cat = catatan.find(x => x.id === comment.catatan_id);
    await supabase.from('audit_log').insert({
      user_id: user.id,
      tabel: 'catatan_komentar',
      aksi: 'DELETE',
      ringkasan: `Komentar "${comment.isi.slice(0, 80)}" dihapus dari catatan "${cat?.judul || ''}"`,
    });
    triggerToast('Komentar dihapus.');
    return true;
  };

  const refreshCatatan = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('catatan')
      .select('*, profiles:user_id(nama)')
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false });
    if (!error && data) setCatatan(data as Catatan[]);
  };

  // Realtime: pantau perubahan catatan & komentar dari pengguna lain.
  useEffect(() => {
    if (!user?.id) return;

    // Debounce fetchAll — hindari double-fetch saat user sendiri yang trigger perubahan
    let fetchAllTimer: ReturnType<typeof setTimeout> | null = null;
    const debouncedFetchAll = () => {
      if (fetchAllTimer) clearTimeout(fetchAllTimer);
      fetchAllTimer = setTimeout(() => { void fetchAll(); }, 600);
    };
    const channel = supabase
      .channel(`wms-realtime-${user.id}`)
      // Whiteboard
      .on('postgres_changes', { event: '*', schema: 'public', table: 'catatan' }, () => {
        void refreshCatatan();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'catatan_komentar' }, () => {
        void loadComments();
      })
      // Absen
      .on('postgres_changes', { event: '*', schema: 'public', table: 'absen_harian' }, () => {
        void fetchAbsenData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'absen_catatan_harian' }, () => {
        void fetchAbsenData();
      })
      // Operasional — auto-refresh saat ada perubahan dari user lain
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transaksi' }, () => {
        debouncedFetchAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_order' }, () => {
        debouncedFetchAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_order_item' }, () => {
        debouncedFetchAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pengiriman' }, () => {
        debouncedFetchAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pallet_log' }, () => {
        debouncedFetchAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'angkutan' }, () => {
        debouncedFetchAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'toko' }, () => {
        debouncedFetchAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produk' }, () => {
        debouncedFetchAll();
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') console.info('Realtime WMS aktif — semua tabel dipantau.');
      });
    return () => {
      if (fetchAllTimer) clearTimeout(fetchAllTimer);
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Muat komentar awal begitu user login / jumlah catatan berubah.
  useEffect(() => {
    if (!user?.id) return;
    const t = window.setTimeout(() => { void loadComments(); }, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, catatan.length]);

  // ── Absen: mutasi harian ──
  const absenAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const toggleAbsenStatus = async (a: Angkutan, tanggal: string, status: 'hadir' | 'tidak', existing?: AbsenHarian | null) => {
    if (!user?.id || !absenAdmin) {
      triggerToast('Akses ditolak: hanya admin yang dapat mengisi absen.', 'error');
      return;
    }
    const found = existing ?? absenRows.find(r => r.angkutan_id === a.id && r.tanggal === tanggal);
    const payload = {
      status,
      jumlah_pallet: status === 'hadir' ? (found?.jumlah_pallet ?? DEFAULT_PALLET_SUPIR) : null,
      asal_pallet: status === 'hadir' ? (found?.asal_pallet ?? 'gudang_kita') : null,
    };
    const result = found
      ? await supabase.from('absen_harian').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', found.id).select().single()
      : await supabase.from('absen_harian').insert({
        tanggal,
        angkutan_id: a.id,
        jenis: 'reguler',
        nama_sopir: a.nama_sopir,
        nama_angkutan: a.nama_angkutan,
        no_polisi: a.no_polisi || null,
        kapasitas_zak: a.kapasitas_zak,
        ...payload,
        created_by: user.id,
      }).select().single();
    if (result.error) {
      triggerToast(`Gagal ubah absen: ${result.error.message}`, 'error');
      return;
    }
    const row = result.data as AbsenHarian;
    setAbsenRows(prev => (found ? prev.map(r => (r.id === row.id ? row : r)) : [...prev, row]));
    await supabase.from('audit_log').insert({
      user_id: user.id, tabel: 'absen_harian', aksi: found ? 'UPDATE' : 'INSERT',
      ringkasan: `Absen ${tanggal} — ${a.nama_sopir} (${a.nama_angkutan}) → ${status === 'hadir' ? `Hadir · ${row.jumlah_pallet ?? 0} pallet` : 'Tidak Hadir'}`,
    });
    triggerToast(`${a.nama_sopir}: ${status === 'hadir' ? 'Hadir' : 'Tidak Hadir'} (${tanggal})`);
  };

  const upsertAbsenRow = async (
    id: string | null,
    input: {
      tanggal: string;
      angkutan_id?: string | null;
      jenis: 'reguler' | 'bantuan';
      nama_sopir: string;
      nama_angkutan: string;
      no_polisi?: string | null;
      kapasitas_zak?: number | null;
      gudang_asal?: string | null;
      status: 'hadir' | 'tidak';
      jumlah_pallet?: number | null;
      asal_pallet?: string | null;
      catatan?: string | null;
    },
  ): Promise<AbsenHarian | null> => {
    if (!user?.id || !absenAdmin) {
      triggerToast('Akses ditolak: hanya admin yang dapat mengubah absen.', 'error');
      return null;
    }
    // Kalau insert baru, cek dulu existing untuk angkutan_id + tanggal — hindari double
    let result;
    if (id) {
      result = await supabase.from('absen_harian').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    } else {
      const existing = input.angkutan_id
        ? absenRows.find(r => r.angkutan_id === input.angkutan_id && r.tanggal === input.tanggal)
        : null;
      if (existing) {
        result = await supabase.from('absen_harian').update({ ...input, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single();
      } else {
        result = await supabase.from('absen_harian').insert({ ...input, created_by: user.id }).select().single();
      }
    }
    if (result.error) {
      triggerToast(`Gagal simpan absen: ${result.error.message}`, 'error');
      return null;
    }
    const row = result.data as AbsenHarian;
    setAbsenRows(prev => {
      const idx = prev.findIndex(r => r.id === row.id);
      if (idx === -1) return [...prev, row];
      const next = [...prev];
      next[idx] = row;
      return next;
    });
    await supabase.from('audit_log').insert({
      user_id: user.id, tabel: 'absen_harian', aksi: id ? 'UPDATE' : 'INSERT',
      ringkasan: `Absen ${row.tanggal} ${row.jenis === 'bantuan' ? '(bantuan) ' : ''}${row.nama_sopir} → ${row.status === 'hadir' ? `Hadir · ${row.jumlah_pallet ?? 0} pallet${row.asal_pallet === 'gudang_lain' ? ' (bawa dari gudang lain)' : ''}` : 'Tidak Hadir'}${row.catatan ? ` — ${row.catatan}` : ''}`,
    });
    return row;
  };

  const deleteAbsenRow = async (row: AbsenHarian) => {
    if (!user?.id || !absenAdmin) {
      triggerToast('Akses ditolak: hanya admin yang dapat menghapus absen.', 'error');
      return;
    }
    const { error } = await supabase.from('absen_harian').delete().eq('id', row.id);
    if (error) {
      triggerToast(`Gagal hapus: ${error.message}`, 'error');
      return;
    }
    setAbsenRows(prev => prev.filter(r => r.id !== row.id));
    await supabase.from('audit_log').insert({
      user_id: user.id, tabel: 'absen_harian', aksi: 'DELETE',
      ringkasan: `Absen ${row.tanggal} ${row.nama_sopir} (${row.nama_angkutan}) dihapus`,
    });
    triggerToast('Baris absen dihapus.');
  };

  const saveAbsenDailyNote = async (tanggal: string, isi: string) => {
    if (!user?.id || !absenAdmin) {
      triggerToast('Akses ditolak: hanya admin yang dapat menulis catatan harian.', 'error');
      return false;
    }
    const { error, data } = await supabase
      .from('absen_catatan_harian')
      .upsert({ tanggal, isi, updated_by: user.id, updated_at: new Date().toISOString() }, { onConflict: 'tanggal' })
      .select()
      .single();
    if (error) {
      triggerToast(`Gagal simpan catatan: ${error.message}`, 'error');
      return false;
    }
    setAbsenDailyNotes(prev => ({ ...prev, [tanggal]: data as AbsenDailyNote }));
    await supabase.from('audit_log').insert({
      user_id: user.id, tabel: 'absen_catatan_harian', aksi: 'UPSERT',
      ringkasan: `Catatan harian ${tanggal} diperbarui: "${isi.slice(0, 80)}"`,
    });
    triggerToast('Catatan harian disimpan.');
    return true;
  };

  return {
    // Auth
    user, loadingUser, loginEmail, setLoginEmail, loginPassword, setLoginPassword,
    loginError, handleLogin, handleLogout, isLoggingIn, loginLockSeconds,
    // Navigation
    activePage, setActivePage,
    // Toast
    toast, triggerToast,
    // Core data
    products, transactions, tokos, angkutans, angkutanGMS, angkutanTMS, angkutanIMK, angkutanGroups, deliveryOrders,
    palletLogs, catatan, auditLogs, palletStok, palletRingkasan,
    isLoadingData, fetchAll,
    // Absen harian
    absenRows, absenDailyNotes, toggleAbsenStatus, upsertAbsenRow, deleteAbsenRow, saveAbsenDailyNote,
    // Whiteboard
    commentsByNote, loadComments, addComment, deleteComment, refreshCatatan,
    whiteboardNotifications, unreadWhiteboardCount, markNotificationRead, clearWhiteboardNotifications,
    wbReadIds, openWhiteboardNoteId, setOpenWhiteboardNoteId,
    // Modals
    modalToko, setModalToko, modalAngkutan, setModalAngkutan,
    modalDO, setModalDO, modalProduk, setModalProduk,
    modalPengiriman, setModalPengiriman, modalPallet, setModalPallet,
    modalCatatan, setModalCatatan, modalPalletStok, setModalPalletStok,
    editingCatatan, setEditingCatatan,
    editingAngkutan, setEditingAngkutan, openEditAngkutan,
    // Selected
    selectedToko, setSelectedToko, selectedAngkutan, setSelectedAngkutan,
    selectedDO, setSelectedDO,
    // Stok forms
    masukId, setMasukId, masukQty, setMasukQty, masukNoSurat, setMasukNoSurat,
    masukSupplier, setMasukSupplier, masukKet, setMasukKet,
    keluarId, setKeluarId, keluarQty, setKeluarQty, keluarNoSurat, setKeluarNoSurat,
    keluarCustomer, setKeluarCustomer, keluarKet, setKeluarKet,
    submitMasuk, submitKeluar,
    // Produk form
    pNama, setPNama, pMerk, setPMerk, pBerat, setPBerat, pMinimal, setPMinimal, pStok, setPStok, pKet, setPKet,
    saveProduk,
    // Password change
    newPassword, setNewPassword, confirmPassword, setConfirmPassword, isChangingPassword, savePassword,
    // Toko form
    tNama, setTNama, tPemilik, setTPemilik, tAlamat, setTAlamat, tHP, setTHP,
    tBatasPallet, setTBatasPallet, tCatatan, setTCatatan, saveToko,
    // Angkutan form
    aNama, setANama, aSopir, setASopir, aPolisi, setAPolisi, aKapasitas, setAKapasitas,
    aStatus, setAStatus, aCatatan, setACatatan, saveAngkutan,
    // DO form
    doNoDO, setDoNoDO, doTokoId, setDoTokoId, doAngkutanId, setDoAngkutanId, doTanggal, setDoTanggal,
    doCatatan, setDoCatatan, doItems, setDoItems, addDoItem, removeDoItem, updateDoItem,
    saveDO,
    // Pengiriman form
    pgDoId, setPgDoId, pgZak, setPgZak, pgPallet, setPgPallet, pgAngkutanId, setPgAngkutanId,
    pgStatus, setPgStatus, pgCatatan, setPgCatatan, savePengiriman,
    // Pallet form
    plTokoId, setPlTokoId, plDoId, setPlDoId, plJenis, setPlJenis,
    plJumlah, setPlJumlah, plCatatan, setPlCatatan, savePalletLog,
    // Laporan filters
    filterDari, setFilterDari, filterSampai, setFilterSampai,
    filterJenis, setFilterJenis, filterProd, setFilterProd,
    // Catatan
    cJudul, setCJudul, cIsi, setCIsi, cWarna, setCWarna,
    saveCatatan, deleteCatatan, togglePinCatatan, openEditCatatan,
    // Pallet stok form
    psTotal, setPsTotal, psStok, setPsStok, psPalletIsi, setPsPalletIsi,
    psPalletAngkutan, setPsPalletAngkutan, psKet, setPsKet, savePalletStokGudang,
    // DO/Pengiriman helpers
    editingProduct, openEditProduk, editingPengiriman, openEditPengiriman, deletePengiriman, deleteAngkutan,
    // Derived
    totalZak, totalTon, stokRendah, todayTrx, todayDO, todayTonIn, todayTonOut, angkutanJalan,
    palletSaldoByToko, filteredTrx, getPalletBalance,
    // Backup
    downloadBackup,
    // Supabase (for inline actions in pages)
    supabase,
  };
}

export type UseWarehouseReturn = ReturnType<typeof useWarehouse>;
