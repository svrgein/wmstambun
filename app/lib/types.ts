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
  role: 'admin' | 'operator';
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
  status: 'tersedia' | 'dalam_perjalanan' | 'maintenance';
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
  tahap: number;
  jumlah_zak: number;
  jumlah_pallet: number;
  waktu_berangkat: string;
  waktu_tiba: string | null;
  status: 'persiapan' | 'jalan' | 'tiba';
  catatan: string;
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

export interface AuditLog {
  id: string;
  user_id: string;
  tabel: string;
  aksi: string;
  record_id: string;
  ringkasan: string;
  data_lama: any;
  data_baru: any;
  created_at: string;
  profiles?: { nama: string };
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
