import React from 'react';
import { getKoreanAmount } from '../utils/format';

export default function CurrencyDisplay({ amount }) {
  if (amount === undefined || amount === null || amount === '') return <span>-</span>;
  const num = parseInt(amount, 10);
  if (isNaN(num)) return <span>{amount}</span>;

  return (
    <div className="currency-display" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
      <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{num.toLocaleString()}</div>
      <div className="amount-korean-helper" style={{ margin: 0, padding: 0, background: 'none', border: 'none', boxShadow: 'none', gap: '4px', justifyContent: 'flex-end' }}>
        <span className="amount-korean-label" style={{ fontSize: '20px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>= 금</span>
        <span className="amount-korean-text" style={{ fontSize: '20px', color: 'var(--color-text-secondary)', fontWeight: 700, textAlign: 'right', wordBreak: 'keep-all' }}>{getKoreanAmount(num)}</span>
      </div>
    </div>
  );
}
