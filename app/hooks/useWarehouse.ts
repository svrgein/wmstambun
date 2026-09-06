'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/lib/supabase';
import { today, fmt } from '@/app/lib/helpers';
import type {
  ProductView, Transaction, UserProfile, Toko, Angkutan,
  DeliveryOrder, PalletLog, Catatan, AuditLog, PalletStok,
  PalletRingkasan, PalletBalance, Pengiriman,
} from '@/app/lib/types';

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
  const [whiteboardNotifications, setWhiteboardNotifications] = useState<{ id: string; catatan_id: string; message: string; created_at: string }[]>([]);

  const whiteboardNotificationKey = user ? `whiteboard-notifications-${user.nama?.trim() || 'Guest'}` : null;

  useEffect(() => {
    if (!user || !whiteboardNotificationKey) return;
    const stored = window.localStorage.getItem(whiteboardNotificationKey);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setWhiteboardNotifications(JSON.parse(stored));
  }, [user, whiteboardNotificationKey]);

  useEffect(() => {
    if (!user || !whiteboardNotificationKey) return;
    window.localStorage.setItem(whiteboardNotificationKey, JSON.stringify(whiteboardNotifications));
  }, [user, whiteboardNotifications, whiteboardNotificationKey]);

  const addWhiteboardNotification = (notification: { id: string; catatan_id: string; message: string; created_at: string }) => {
    triggerToast(`🔔 ${notification.message}`);
    setWhiteboardNotifications(prev => [notification, ...prev]);
  };

  const clearWhiteboardNotifications = () => setWhiteboardNotifications([]);

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
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) setUser({ id: session.user.id, nama: profile.nama, role: profile.role, email: session.user.email });
      }
      setLoadingUser(false);
    }
    checkUser();
  }, []);

  // ── Fetch all data
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
      if (stokRes.error) throw stokRes.error;
      if (trxRes.error) throw trxRes.error;
      if (tokoRes.error) throw tokoRes.error;
      if (angkutanRes.error) throw angkutanRes.error;
      if (doRes.error) throw doRes.error;
      if (palletRes.error) throw palletRes.error;
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
    if (!loginEmail || !loginPassword) { setLoginError('⚠️ Isi email dan password.'); return; }
    setLoginError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) { setLoginError(`❌ ${error.message}`); return; }
    if (data?.user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      setUser({ id: data.user.id, nama: profile?.nama || 'User', role: profile?.role || 'operator', email: data.user.email });
      triggerToast('Login berhasil!');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActivePage('dashboard');
  };

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
    const validStatuses = ['tersedia', 'dalam_perjalanan', 'maintenance'];
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
    const angkutan = palletRingkasan?.pallet_angkutan ?? palletStok?.pallet_angkutan ?? 0;
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

  return {
    // Auth
    user, loadingUser, loginEmail, setLoginEmail, loginPassword, setLoginPassword,
    loginError, handleLogin, handleLogout,
    // Navigation
    activePage, setActivePage,
    // Toast
    toast, triggerToast,
    // Core data
    products, transactions, tokos, angkutans, angkutanGMS, angkutanTMS, angkutanIMK, angkutanGroups, deliveryOrders,
    palletLogs, catatan, auditLogs, palletStok, palletRingkasan,
    isLoadingData, fetchAll,
    // Whiteboard notifications
    whiteboardNotifications, addWhiteboardNotification, clearWhiteboardNotifications,
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
