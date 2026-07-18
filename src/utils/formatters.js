export const formatPhoneNumber = (value) => {
  if (!value) return '';
  const num = value.replace(/[^0-9]/g, '');
  if (num.length < 4) return num;
  
  if (num.startsWith('02')) {
    if (num.length <= 5) return `${num.slice(0, 2)}-${num.slice(2)}`;
    if (num.length <= 9) return `${num.slice(0, 2)}-${num.slice(2, 5)}-${num.slice(5)}`;
    return `${num.slice(0, 2)}-${num.slice(2, 6)}-${num.slice(6, 10)}`;
  }
  
  if (num.length === 8 && /^(15|16|18)/.test(num)) {
    return `${num.slice(0, 4)}-${num.slice(4)}`;
  }
  
  if (num.length <= 7) return `${num.slice(0, 3)}-${num.slice(3)}`;
  if (num.length === 10) return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
  return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
};
