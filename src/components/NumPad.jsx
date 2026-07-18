import { useState, useCallback } from 'react';
import './NumPad.css';

const BASE_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
import { getKoreanAmount } from '../utils/format';


/**
 * 공통 숫자패드 컴포넌트
 * 출입정보·금액 입력 공통 사용 (04_wireframe-prd.md 기준)
 * @param {string} value - 현재 입력값
 * @param {function} onChange - 값 변경 콜백
 * @param {number} maxLength - 최대 자릿수
 * @param {string} placeholder - 입력 안내 텍스트
 * @param {string} unit - 단위 (예: '원', '㎡')
 * @param {boolean} allowDecimal - 소수점 입력 허용 여부
 */
export default function NumPad({
  value = '',
  onChange,
  onComplete,
  maxLength = 12,
  placeholder = '숫자를 입력해주세요',
  unit = '',
  isCurrency = false,
  allowDecimal = false,
}) {
  const keys = [...BASE_KEYS, allowDecimal ? '.' : '', '0', 'del'];
  const formatDisplay = useCallback((val) => {
    if (!val) return '';
    if (isCurrency) {
      return Number(val).toLocaleString('ko-KR');
    }
    return val;
  }, [isCurrency]);

  const handleKey = useCallback((key) => {
    if (key === 'del') {
      onChange(value.slice(0, -1));
    } else if (key === '') {
      return;
    } else if (key === '.') {
      if (!value.includes('.')) {
        onChange(value ? value + '.' : '0.');
      }
    } else if (value.length < maxLength) {
      onChange(value + key);
    }
  }, [value, onChange, maxLength]);

  return (
    <div className="numpad">
      <div className="numpad__display">
        {value ? (
          <div className="numpad__value-wrapper">
            <div className="numpad__value-main">
              <span className="numpad__value tabular-nums">
                {formatDisplay(value)}
              </span>
              {unit && <span className="numpad__unit">{unit}</span>}
            </div>
            {isCurrency && (
              <div className="amount-korean-helper">
                <span className="amount-korean-label">= 금</span>
                <span className="amount-korean-text">{getKoreanAmount(value)}</span>
              </div>
            )}
          </div>
        ) : (
          <span className="numpad__placeholder">{placeholder}</span>
        )}
      </div>
      <div className="numpad__grid">
        {keys.map((key, i) => (
          <button
            key={i}
            className={`numpad__key ${key === 'del' ? 'numpad__key--action' : ''} ${key === '' ? 'numpad__key--empty' : ''}`}
            onClick={() => handleKey(key)}
            disabled={key === ''}
            type="button"
            aria-label={key === 'del' ? '지우기' : key === '.' ? '소수점' : key}
          >
            {key === 'del' ? '⌫' : key}
          </button>
        ))}
      </div>
    </div>
  );
}
