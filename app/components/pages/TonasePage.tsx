'use client';

import React from 'react';
import type { UseWarehouseReturn } from '@/app/hooks/useWarehouse';
import { fmtTon, today } from '@/app/lib/helpers';
import type { Transaction } from '@/app/lib/types';

interface Props {
  w: UseWarehouseReturn;
}

const formatMonth = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
};

export default function TonasePage({ w }: Props) {
  const todayStr = today();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const [selectedDate, setSelectedDate] = React.useState(yesterdayDate.toISOString().slice(0, 10));

  const transactionTotals = React.useMemo(() => {
    const byDate: Record<string, { in: number; out: number }> = {};
    const byMonth: Record<string, { in: number; out: number }> = {};

    const getTon = (trx: Transaction) => {
      const berat = trx.produk?.berat_per_zak ?? w.products.find(p => p.id === trx.produk_id)?.berat_per_zak ?? 50;
      return (trx.jumlah_zak * berat) / 1000;
    };

    w.transactions.forEach(trx => {
      const date = trx.tanggal.split('T')[0];
      const month = date.slice(0, 7);
      const ton = getTon(trx);
      if (!byDate[date]) byDate[date] = { in: 0, out: 0 };
      if (!byMonth[month]) byMonth[month] = { in: 0, out: 0 };
      if (trx.jenis === 'masuk') {
        byDate[date].in += ton;
        byMonth[month].in += ton;
      } else {
        byDate[date].out += ton;
        byMonth[month].out += ton;
      }
    });

    return { byDate, byMonth };
  }, [w.transactions, w.products]);

  const selectedTotals = transactionTotals.byDate[selectedDate] || { in: 0, out: 0 };

  const dailyTotals = React.useMemo(() => {
    const days = [];
    const base = new Date(selectedDate || todayStr);
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(base);
      date.setDate(base.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const label = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: '2-digit', month: 'short' }).format(date);
      const totals = transactionTotals.byDate[key] || { in: 0, out: 0 };
      days.push({ key, label, ...totals });
    }
    return days;
  }, [selectedDate, todayStr, transactionTotals.byDate]);

  const monthlyTotals = React.useMemo(() => {
    const months = [];
    const base = new Date(selectedDate || todayStr);
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = formatMonth(key);
      const totals = transactionTotals.byMonth[key] || { in: 0, out: 0 };
      months.push({ key, label, ...totals });
    }
    return months;
  }, [selectedDate, todayStr, transactionTotals.byMonth]);

  const maxDaily = Math.max(1, ...dailyTotals.flatMap(item => [item.in, item.out]));
  const maxMonthly = Math.max(1, ...monthlyTotals.flatMap(item => [item.in, item.out]));

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Tonase Harian & Bulanan</div>
          <div className="section-subtitle">Lihat total tonase IN / OUT dan data per tanggal.</div>
        </div>
      </div>

      <div className="card chart-card">
        <div className="flex-between mb-12">
          <div>
            <div className="chart-card-title">Tonase per Tanggal</div>
            <div className="text-muted text-xs">Pilih tanggal untuk melihat angka detail dan riwayat.</div>
          </div>
          <input
            type="date"
            value={selectedDate}
            max={todayStr}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: '9px 11px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div className="chart-card" style={{ padding: '16px' }}>
            <div className="chart-card-title">Tonase IN</div>
            <div style={{ marginTop: '10px', fontSize: '30px', fontWeight: 800, color: 'var(--success)' }}>{fmtTon(selectedTotals.in)} Ton</div>
          </div>
          <div className="chart-card" style={{ padding: '16px' }}>
            <div className="chart-card-title">Tonase OUT</div>
            <div style={{ marginTop: '10px', fontSize: '30px', fontWeight: 800, color: 'var(--danger)' }}>{fmtTon(selectedTotals.out)} Ton</div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Grafik 7 Hari Terakhir</div>
          <div className="chart-legend">
            <span><span className="chart-legend-dot" style={{ background: 'var(--success)' }} />IN</span>
            <span><span className="chart-legend-dot" style={{ background: 'var(--danger)' }} />OUT</span>
          </div>
          <div className="chart-area">
            {dailyTotals.map(day => (
              <div key={day.key} className="chart-row">
                <div className="chart-label">{day.label}</div>
                <div className="chart-bars">
                  <div className="chart-bar-group">
                    <div className="chart-bar-track">
                      <div className="chart-bar" style={{ width: `${(day.in / maxDaily) * 100}%`, background: 'var(--success)' }} />
                    </div>
                    <div className="chart-bar-meta">IN {fmtTon(day.in)}</div>
                  </div>
                  <div className="chart-bar-group">
                    <div className="chart-bar-track">
                      <div className="chart-bar" style={{ width: `${(day.out / maxDaily) * 100}%`, background: 'var(--danger)' }} />
                    </div>
                    <div className="chart-bar-meta">OUT {fmtTon(day.out)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Grafik 6 Bulan Terakhir</div>
          <div className="chart-legend">
            <span><span className="chart-legend-dot" style={{ background: 'var(--success)' }} />IN</span>
            <span><span className="chart-legend-dot" style={{ background: 'var(--danger)' }} />OUT</span>
          </div>
          <div className="chart-area">
            {monthlyTotals.map(month => (
              <div key={month.key} className="chart-row">
                <div className="chart-label">{month.label}</div>
                <div className="chart-bars">
                  <div className="chart-bar-group">
                    <div className="chart-bar-track">
                      <div className="chart-bar" style={{ width: `${(month.in / maxMonthly) * 100}%`, background: 'var(--success)' }} />
                    </div>
                    <div className="chart-bar-meta">IN {fmtTon(month.in)}</div>
                  </div>
                  <div className="chart-bar-group">
                    <div className="chart-bar-track">
                      <div className="chart-bar" style={{ width: `${(month.out / maxMonthly) * 100}%`, background: 'var(--danger)' }} />
                    </div>
                    <div className="chart-bar-meta">OUT {fmtTon(month.out)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
