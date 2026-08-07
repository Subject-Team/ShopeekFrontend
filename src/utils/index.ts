export const toPersianDigits = (num: number | string): string => {
  const persianMap: { [key: string]: string } = {
    '0': '۰',
    '1': '۱',
    '2': '۲',
    '3': '۳',
    '4': '۴',
    '5': '۵',
    '6': '۶',
    '7': '۷',
    '8': '۸',
    '9': '۹'
  };

  return String(num)
    .split('')
    .map(char => persianMap[char] || char)
    .join('');
};

export const toPersianDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

export const formatPersianNumber = (num: number): string => {
  return toPersianDigits(num.toLocaleString('fa-IR'));
};

export const formatToman = (val: number) => {
  if (val === undefined || val === null || isNaN(val)) return '';

  if (val >= 1000000) {
    return `${toPersianDigits((val / 1000000).toFixed(1))}M`;
  }
  if (val >= 1000) {
    return `${toPersianDigits(Math.round(val / 1000).toString())}K`;
  }
  return toPersianDigits(val.toString());
};
