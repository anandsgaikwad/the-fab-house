/**
 * Convert numerical INR amount to Indian Currency Words (Lakhs, Crores, Thousands)
 * e.g. 125430 -> "Indian Rupees One Lakh Twenty-Five Thousand Four Hundred Thirty Only"
 */

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertTwoDigits(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const units = n % 10;
  return TENS[tens] + (units > 0 ? `-${ONES[units]}` : '');
}

function convertThreeDigits(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  let str = '';
  if (hundreds > 0) {
    str += `${ONES[hundreds]} Hundred`;
    if (rest > 0) str += ' and ';
  }
  if (rest > 0) {
    str += convertTwoDigits(rest);
  }
  return str;
}

export function amountToIndianWords(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'Indian Rupees Zero Only';
  }

  const rounded = Math.round((Math.abs(amount) + Number.EPSILON) * 100) / 100;
  let whole = Math.floor(rounded);
  const paise = Math.round((rounded - whole) * 100);

  if (whole === 0 && paise > 0) {
    return `Indian Rupees ${convertTwoDigits(paise)} Paise Only`;
  }

  const parts: string[] = [];

  // Crores (>= 1,00,00,000)
  if (whole >= 10000000) {
    const crore = Math.floor(whole / 10000000);
    whole %= 10000000;
    parts.push(`${convertTwoDigits(crore)} Crore`);
  }

  // Lakhs (>= 1,00,000)
  if (whole >= 100000) {
    const lakh = Math.floor(whole / 100000);
    whole %= 100000;
    parts.push(`${convertTwoDigits(lakh)} Lakh`);
  }

  // Thousands (>= 1,000)
  if (whole >= 1000) {
    const thousand = Math.floor(whole / 1000);
    whole %= 1000;
    parts.push(`${convertTwoDigits(thousand)} Thousand`);
  }

  // Hundreds & units (< 1,000)
  if (whole > 0) {
    parts.push(convertThreeDigits(whole));
  }

  let words = parts.join(' ').trim();
  let result = `Indian Rupees ${words}`;

  if (paise > 0) {
    result += ` and ${convertTwoDigits(paise)} Paise`;
  }

  result += ' Only';
  return result;
}
