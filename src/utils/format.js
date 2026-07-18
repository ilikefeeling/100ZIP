/**
 * 숫자를 한글 단위(억, 만)로 변환하여 반환합니다.
 * 예: 150000000 -> '1억 5000만 원'
 */
export function getKoreanAmount(amount) {
  if (amount === undefined || amount === null || amount === '') return '';
  const num = parseInt(amount, 10);
  if (isNaN(num)) return '';
  if (num === 0) return '영 원 정';

  const numberNames = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const digitNames = ['', '십', '백', '천'];
  const unitNames = ['', '만', '억', '조'];

  let result = '';
  let unitIndex = 0;
  let temp = num;

  while (temp > 0) {
    const mod = temp % 10000;
    if (mod > 0) {
      let part = '';
      let partTemp = mod;
      let digitIndex = 0;

      while (partTemp > 0) {
        const digit = partTemp % 10;
        if (digit > 0) {
          // 일(1)은 십, 백, 천 단위에서는 생략 (예: 일십 -> 십)
          const numStr = (digit === 1 && digitIndex > 0) ? '' : numberNames[digit] + ' ';
          const digitStr = digitIndex > 0 ? digitNames[digitIndex] + ' ' : '';
          part = numStr + digitStr + part;
        }
        partTemp = Math.floor(partTemp / 10);
        digitIndex++;
      }
      result = `${part}${unitNames[unitIndex]} ` + result;
    }
    temp = Math.floor(temp / 10000);
    unitIndex++;
  }

  return result.replace(/\s+/g, ' ').trim() + ' 원 정';
}

/**
 * 숫자와 한글 단위를 병기하여 반환합니다.
 * 예: 150000000 -> '150,000,000 (1억 5000만 원)'
 */
export function formatKoreanCurrency(amount) {
  if (amount === undefined || amount === null || amount === '') return '-';
  const num = parseInt(amount, 10);
  if (isNaN(num)) return amount.toString();

  const formatted = num.toLocaleString();
  const korean = getKoreanAmount(num);

  return `${formatted} (${korean})`;
}
