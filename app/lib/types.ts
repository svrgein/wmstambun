// ─── INTERFACES ───────────────────────────────────────────────────────────────

export interface ProductView {
  id: string;
  nama: string;
  merk: string;
  berat_per_zak: number;
  stok_zak: number;
  stok_minimal: number;
  stok_ton: number;
  stok_rendah: boolean;
  keterangan: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  produk_id: string;
  user_id: string;
  jenis: 'masuk' | 'keluar';
  jumlah_zak: number;
  keterangan: string;
  no_surat: string;
  pihak: string;
  tanggal: string;
  produk?: { nama: string; merk: string; berat_per_zak: number };
  profiles?: { nama: string };
}

export interface UserProfile {
  id: string;
  nama: string;
  role: 'admin' | 'operator' | 'superadmin';
  email?: string;
}

export interface Toko {
  id: string;
  nama: string;
  pemilik: string;
  alamat: string;
  no_hp: string;
  batas_pallet: number;
  catatan: string;
  created_at: string;
}

export interface Angkutan {
  id: string;
  nama_angkutan: string;
  nama_sopir: string;
  no_polisi: string;
  kapasitas_zak: number;
  status: 'tersedia' | 'dalam_perjalanan' | 'maintenance' | 'tidak_aktif';
  catatan: string;
  created_at: string;
}

export interface DeliveryOrder {
  id: string;
  no_do: string;
  toko_id: string;
  angkutan_id: string;
  tanggal: string;
  status: 'draft' | 'proses' | 'selesai' | 'batal';
  total_zak: number;
  total_pallet: number;
  catatan: string;
  created_by: string;
  toko?: Toko;
  angkutan?: Angkutan;
  do_items?: DOItem[];
  pengiriman?: Pengiriman[];
}

export interface DOItem {
  id: string;
  do_id: string;
  produk_id: string;
  jumlah_zak: number;
  produk?: { nama: string; merk: string; berat_per_zak: number };
}

export interface Pengiriman {
  id: string;
  do_id: string;
  angkutan_id?: string | null;
  tahap: number;
  jumlah_zak: number;
  jumlah_pallet: number;
  waktu_berangkat: string;
  waktu_tiba: string | null;
  status: 'persiapan' | 'jalan' | 'tiba';
  catatan: string;
  angkutan?: Angkutan;
}

export interface PalletLog {
  id: string;
  toko_id: string;
  do_id: string | null;
  jenis: 'keluar' | 'kembali';
  jumlah: number;
  tanggal: string;
  catatan: string;
  toko?: Toko;
}

export interface Catatan {
  id: string;
  user_id: string;
  judul: string;
  isi: string;
  warna: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  profiles?: { nama: string };
}

export interface CatatanKomentar {
  id: string;
  catatan_id: string;
  user_id: string | null;
  nama: string;
  isi: string;
  created_at: string;
}

export interface WhiteboardNotif {
  id: string;
  catatan_id: string;
  message: string;
  created_at: string;
}

export interface AbsenHarian {
  id: string;
  tanggal: string;
  angkutan_id: string | null;
  jenis: 'reguler' | 'bantuan';
  nama_sopir: string;
  nama_angkutan: string;
  no_polisi: string | null;
  kapasitas_zak: number | null;
  gudang_asal: string | null;
  status: 'hadir' | 'tidak';
  jumlah_pallet: number | null;
  asal_pallet: string | null;
  catatan: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AbsenDailyNote {
  tanggal: string;
  isi: string;
  updated_by: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  tabel: string;
  aksi: string;
  record_id: string;
  ringkasan: string;
  data_lama: unknown;
  data_baru: unknown;
  created_at: string;
  profiles?: { nama: string };
}

export interface SetoranSJ {
  id: string;
  no_sj: string;
  angkutan: string;
  toko: string;
  tanggal: string | null;
  status: 'belum' | 'disetor';
  alasan: string | null;
  catatan: string | null;
  disetor_tanggal: string | null;
  disetor_oleh: string | null;
  dibuat_oleh: string | null;
  updated_oleh: string | null;
  created_at: string;
  updated_at: string;
  disetorBy?: { nama: string };
  dibuatBy?: { nama: string };
  updatedBy?: { nama: string };
}

export interface PalletStok {
  id: string;
  total_pallet: number;
  stok_gudang: number;
  pallet_isi: number;
  pallet_angkutan: number;
  keterangan: string;
  updated_at: string;
}

// Buku Tanda Terima DO — berbasis paste dari app DO eksternal.
// Satu baris = satu SDO, dilengkapi tracking kirim & setoran.
export interface TandaTerima {
  id: string;
  print_date: string;                 // tanggal print (yg user pilih)
  angkutan: string;                   // nama transporter (cth INTITRANS/GMS)
  // kolom dari paste (app eksternal):
  order_date: string | null;          // tanggal DO dibuat
  sdo: string;                        // SDO / no DO (KEY)
  jadwal_kirim: string | null;        // jadwal kirim DO
  customer_code: string | null;
  customer: string | null;            // nama toko
  adres: string | null;               // alamat lengkap
  destination: string | null;         // area (cth TARUMAJAYA)
  cement_type: string | null;         // jenis semen (cth PCC)
  pack: string | null;                // berat/zak (cth 50 KG)
  qty: number | null;                 // jumlah zak
  // tracking (input di app):
  status_kirim: 'belum' | 'tunggu_info' | 'terkirim' | 'batal';
  alasan_tunggu: string | null;
  delv_date: string | null;           // tanggal kirim aktual
  status_setoran: 'belum' | 'disetor';
  setoran_note: string | null;        // cth "SURAT JALAN SUDAH DI SETOR KE GUDANG"
  cek_angkutan: 'belum' | 'sudah';    // udah dicek/verify angkutan vs sistem distributor?
  catatan: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PalletRingkasan {
  total_pallet: number;
  stok_gudang: number;
  pallet_isi: number;
  pallet_angkutan: number;
  stok_di_toko: number;
  total_pernah_keluar: number;
  total_kembali: number;
}

export interface PalletBalance {
  total: number;
  kosong: number;
  isi: number;
  angkutan: number;
  toko: number;
  terpakai: number;
  selisih: number;
}
