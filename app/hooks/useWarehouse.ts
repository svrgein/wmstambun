'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/lib/supabase';
import { today, fmt } from '@/app/lib/helpers';
import type {
  ProductView, Transaction, UserProfile, Toko, Angkutan,
  DeliveryOrder, PalletLog, Catatan, AuditLog, PalletStok,
  PalletRingkasan, PalletBalance,
} from '@/app/lib/types';

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
  const [pKet, setPKet] = useState('');

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
  const [aStatus, setAStatus] = useState<'tersedia' | 'dalam_perjalanan' | 'maintenance'>('tersedia');
  const [aCatatan, setACatatan] = useState('');

  // ── DO form
  const [doTokoId, setDoTokoId] = useState('');
  const [doAngkutanId, setDoAngkutanId] = useState('');
  const [doTanggal, setDoTanggal] = useState(today());
  const [doCatatan, setDoCatatan] = useState('');
  const [doItems, setDoItems] = useState<{ produk_id: string; jumlah_zak: number }[]>([{ produk_id: '', jumlah_zak: 0 }]);

  // ── Pengiriman form
  const [pgDoId, setPgDoId] = useState('');
  const [pgZak, setPgZak] = useState('');
  const [pgPallet, setPgPallet] = useState('');
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
        supabase.from('v_stok').select('*').order('merk'),
        supabase.from('transaksi').select('*, produk(nama,merk,berat_per_zak), profiles:user_id(nama)').order('tanggal', { ascending: false }),
        supabase.from('toko').select('*').order('nama'),
        supabase.from('angkutan').select('*').order('nama_sopir'),
        supabase.from('delivery_order').select('*, toko(*), angkutan(*), do_items(*, produk(nama,merk,berat_per_zak)), pengiriman(*)').order('tanggal', { ascending: false }),
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
      setProducts(stokRes.data || []);
      setTransactions(trxRes.data || []);
      setTokos(tokoRes.data || []);
      setAngkutans(angkutanRes.data || []);
      setDeliveryOrders(doRes.data || []);
      setPalletLogs(palletRes.data || []);
      if (!catatanRes.error) setCatatan(catatanRes.data || []);
      if (!auditRes.error) setAuditLogs(auditRes.data || []);
      if (!palletStokRes.error) setPalletStok(palletStokRes.data);
      if (!palletRingkasanRes.error) setPalletRingkasan(palletRingkasanRes.data);
    } catch (e: any) {
      triggerToast(e.message || 'Gagal sinkronisasi database', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => { if (user) fetchAll(); }, [user]);

  // ── Toast
  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3500);
  };

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

  // ── Stok: Masuk / Keluar
  const submitMasuk = async () => {
    if (!masukId || !masukQty || Number(masukQty) <= 0) { triggerToast('Form tidak valid!', 'error'); return; }
    const prod = products.find(p => p.id === masukId);
    const beratPerZak = prod ? prod.berat_per_zak : 50;
    const jumlahZak = Math.round((Number(masukQty) * 1000) / beratPerZak);

    const { error } = await supabase.from('transaksi').insert({ produk_id: masukId, user_id: user?.id, jenis: 'masuk', jumlah_zak: jumlahZak, no_surat: masukNoSurat || null, pihak: masukSupplier || null, keterangan: masukKet || null });
    if (error) { triggerToast(error.message, 'error'); return; }
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
    triggerToast(`Barang keluar divalidasi (${fmt(jumlahZak)} Zak)`);
    setKeluarQty(''); setKeluarNoSurat(''); setKeluarCustomer(''); setKeluarKet('');
    fetchAll();
  };

  // ── Produk
  const saveProduk = async () => {
    if (user?.role !== 'admin') { triggerToast('Akses ditolak: Hanya Admin yang dapat menambah/edit produk.', 'error'); return; }
    if (!pNama || !pMerk) { triggerToast('Nama dan Merk wajib diisi!', 'error'); return; }
    const { error } = await supabase.from('produk').insert({ nama: pNama, merk: pMerk, berat_per_zak: Number(pBerat) || 50, stok_minimal: Number(pMinimal) || 100, keterangan: pKet || null });
    if (error) { triggerToast(error.message, 'error'); return; }
    triggerToast('Produk tersimpan');
    setModalProduk(false); setPNama(''); setPMerk(''); setPKet('');
    fetchAll();
  };

  // ── Toko
  const saveToko = async () => {
    if (user?.role !== 'admin') { triggerToast('Akses ditolak: Hanya Admin yang dapat mengelola toko.', 'error'); return; }
    if (!tNama) { triggerToast('Nama toko wajib diisi!', 'error'); return; }
    const { error } = await supabase.from('toko').insert({ nama: tNama, pemilik: tPemilik || null, alamat: tAlamat || null, no_hp: tHP || null, batas_pallet: Number(tBatasPallet) || 0, catatan: tCatatan || null });
    if (error) { triggerToast(error.message, 'error'); return; }
    triggerToast('Toko tersimpan');
    setModalToko(false); setTNama(''); setTPemilik(''); setTAlamat(''); setTHP(''); setTBatasPallet('0'); setTCatatan('');
    fetchAll();
  };

  // ── Angkutan
  const openEditAngkutan = (a: Angkutan) => {
    setEditingAngkutan(a);
    setANama(a.nama_angkutan); setASopir(a.nama_sopir); setAPolisi(a.no_polisi || '');
    setAKapasitas(String(a.kapasitas_zak)); setAStatus(a.status as any); setACatatan(a.catatan || '');
    setModalAngkutan(true);
  };

  const saveAngkutan = async () => {
    if (user?.role !== 'admin') { triggerToast('Akses ditolak: Hanya Admin yang dapat mengelola angkutan.', 'error'); return; }
    if (!aNama || !aSopir) { triggerToast('Nama angkutan dan sopir wajib diisi!', 'error'); return; }
    const payload = { nama_angkutan: aNama, nama_sopir: aSopir, no_polisi: aPolisi || null, kapasitas_zak: Number(aKapasitas) || 200, status: aStatus, catatan: aCatatan || null };
    if (editingAngkutan) {
      const { error } = await supabase.from('angkutan').update(payload).eq('id', editingAngkutan.id);
      if (error) { triggerToast(error.message, 'error'); return; }
      triggerToast('Angkutan berhasil diperbarui');
    } else {
      const { error } = await supabase.from('angkutan').insert(payload);
      if (error) { triggerToast(error.message, 'error'); return; }
      triggerToast('Angkutan tersimpan');
    }
    setModalAngkutan(false); setEditingAngkutan(null); setANama(''); setASopir(''); setAPolisi(''); setACatatan('');
    fetchAll();
  };

  // ── DO
  const generateNoDO = () => {
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const seq = String(deliveryOrders.length + 1).padStart(4, '0');
    return `DO-${date}-${seq}`;
  };

  const saveDO = async () => {
    if (!doTokoId || !doAngkutanId) { triggerToast('Toko dan Angkutan wajib dipilih!', 'error'); return; }
    const validItems = doItems.filter(i => i.produk_id && i.jumlah_zak > 0);
    if (validItems.length === 0) { triggerToast('Tambah minimal 1 item semen!', 'error'); return; }
    const totalZak = validItems.reduce((s, i) => s + i.jumlah_zak, 0);
    const noDO = generateNoDO();
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
    triggerToast(`DO ${noDO} berhasil dibuat`);
    setModalDO(false); setDoTokoId(''); setDoAngkutanId(''); setDoCatatan('');
    setDoItems([{ produk_id: '', jumlah_zak: 0 }]);
    fetchAll();
  };

  // ── Pengiriman
  const savePengiriman = async () => {
    if (!pgDoId || !pgZak) { triggerToast('DO dan Jumlah Zak wajib diisi!', 'error'); return; }
    const doRef = deliveryOrders.find(d => d.id === pgDoId);
    if (!doRef) { triggerToast('DO tidak ditemukan', 'error'); return; }
    const existing = doRef.pengiriman || [];
    const sudahDikirim = existing.reduce((s, p) => s + p.jumlah_zak, 0);
    const sisa = doRef.total_zak - sudahDikirim;
    const newZak = Number(pgZak);
    if (newZak > sisa) {
      triggerToast(`⚠️ Melebihi sisa zak! Sisa: ${fmt(sisa)} zak, input: ${fmt(newZak)} zak`, 'error');
      return;
    }
    const tahap = existing.length + 1;
    const { error } = await supabase.from('pengiriman').insert({
      do_id: pgDoId, tahap, jumlah_zak: newZak, jumlah_pallet: Number(pgPallet) || 0,
      waktu_berangkat: new Date().toISOString(), status: pgStatus, catatan: pgCatatan || null,
    });
    if (error) { triggerToast(error.message, 'error'); return; }
    await supabase.from('delivery_order').update({ status: 'proses' }).eq('id', pgDoId);
    if (doRef.angkutan_id) {
      await supabase.from('angkutan').update({ status: 'dalam_perjalanan' }).eq('id', doRef.angkutan_id);
    }
    await supabase.from('audit_log').insert({
      user_id: user?.id, tabel: 'pengiriman', aksi: 'INSERT',
      ringkasan: `Tahap ${tahap} DO ${doRef.no_do}: ${fmt(newZak)} zak → ${doRef.toko?.nama || ''}`,
    });
    const selesaiSemua = sudahDikirim + newZak >= doRef.total_zak;
    triggerToast(`Tahap ${tahap} dicatat${selesaiSemua ? ' — ✅ Semua zak sudah dikirim!' : ` — Sisa ${fmt(sisa - newZak)} zak`}`);
    setModalPengiriman(false); setPgDoId(''); setPgZak(''); setPgPallet(''); setPgCatatan('');
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
      triggerToast('Catatan diperbarui');
    } else {
      const { error } = await supabase.from('catatan').insert({
        user_id: user?.id, judul: cJudul || 'Catatan', isi: cIsi, warna: cWarna,
      });
      if (error) { triggerToast(error.message, 'error'); return; }
      triggerToast('Catatan disimpan');
    }
    setModalCatatan(false); setCJudul(''); setCIsi(''); setCWarna('#e8a045'); setEditingCatatan(null);
    fetchAll();
  };

  const deleteCatatan = async (id: string) => {
    if (!confirm('Hapus catatan ini?')) return;
    await supabase.from('catatan').delete().eq('id', id);
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
    if (user?.role !== 'admin') { triggerToast('Akses ditolak: Hanya Admin yang dapat mengkoreksi stok pallet awal.', 'error'); return; }
    const payload = {
      total_pallet:    psTotal          !== '' ? Number(psTotal)          : (palletStok?.total_pallet    ?? 0),
      stok_gudang:     psStok           !== '' ? Number(psStok)           : (palletStok?.stok_gudang     ?? 0),
      pallet_isi:      psPalletIsi      !== '' ? Number(psPalletIsi)      : (palletStok?.pallet_isi      ?? 0),
      pallet_angkutan: psPalletAngkutan !== '' ? Number(psPalletAngkutan) : (palletStok?.pallet_angkutan ?? 0),
      keterangan:      psKet || null,
      updated_at:      new Date().toISOString(),
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
  const totalZak = products.reduce((s, p) => s + p.stok_zak, 0);
  const totalTon = products.reduce((s, p) => s + p.stok_ton, 0);
  const stokRendah = products.filter(p => p.stok_rendah);
  const todayStr = today();
  const todayTrx = transactions.filter(t => t.tanggal.split('T')[0] === todayStr);
  const todayDO = deliveryOrders.filter(d => d.tanggal.split('T')[0] === todayStr);
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
    const total    = palletRingkasan?.total_pallet    ?? palletStok?.total_pallet    ?? 0;
    const angkutan = palletRingkasan?.pallet_angkutan ?? palletStok?.pallet_angkutan ?? 0;
    const toko     = palletRingkasan?.stok_di_toko    ?? 0;
    
    // Otomatis hitung Pallet Isi berdasarkan total stok zak di gudang
    const isi = products.reduce((acc, p) => {
      const zakPerPallet = 2000 / (p.berat_per_zak || 50);
      return acc + Math.floor(p.stok_zak / zakPerPallet);
    }, 0);

    // Gudang kosong adalah sisa dari total dikurangi yang sedang terpakai
    const kosong   = total - (isi + angkutan + toko);
    const terpakai = kosong + isi + angkutan + toko; // = total
    const selisih  = 0; // Selalu 0 karena kosong dihitung otomatis berdasarkan total
    
    return { total, kosong, isi, angkutan, toko, terpakai, selisih };
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
    products, transactions, tokos, angkutans, deliveryOrders,
    palletLogs, catatan, auditLogs, palletStok, palletRingkasan,
    isLoadingData, fetchAll,
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
    pNama, setPNama, pMerk, setPMerk, pBerat, setPBerat, pMinimal, setPMinimal, pKet, setPKet,
    saveProduk,
    // Toko form
    tNama, setTNama, tPemilik, setTPemilik, tAlamat, setTAlamat, tHP, setTHP,
    tBatasPallet, setTBatasPallet, tCatatan, setTCatatan, saveToko,
    // Angkutan form
    aNama, setANama, aSopir, setASopir, aPolisi, setAPolisi, aKapasitas, setAKapasitas,
    aStatus, setAStatus, aCatatan, setACatatan, saveAngkutan,
    // DO form
    doTokoId, setDoTokoId, doAngkutanId, setDoAngkutanId, doTanggal, setDoTanggal,
    doCatatan, setDoCatatan, doItems, setDoItems, addDoItem, removeDoItem, updateDoItem,
    saveDO,
    // Pengiriman form
    pgDoId, setPgDoId, pgZak, setPgZak, pgPallet, setPgPallet,
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
    // Derived
    totalZak, totalTon, stokRendah, todayTrx, todayDO, angkutanJalan,
    palletSaldoByToko, filteredTrx, getPalletBalance,
    // Supabase (for inline actions in pages)
    supabase,
  };
}

export type UseWarehouseReturn = ReturnType<typeof useWarehouse>;
