export interface PasswordAnalysis {
  hasMinLength: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasSymbol: boolean;
  hasDigit: boolean;
  isMatching: boolean;
  score: number;
  levelLabel: string;
  levelColor: string;
  barColor: string;
}

export const analyzePassword = (password: string, confirmPassword = ''): PasswordAnalysis => {
  const hasMinLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const isMatching = Boolean(password && confirmPassword && password === confirmPassword);

  if (!password) {
    return {
      hasMinLength: false,
      hasLower: false,
      hasUpper: false,
      hasSymbol: false,
      hasDigit: false,
      isMatching: false,
      score: 0,
      levelLabel: '—',
      levelColor: 'text-slate-400',
      barColor: 'bg-slate-200',
    };
  }

  let points = 0;
  if (password.length >= 14) points += 3;
  else if (password.length >= 10) points += 2;
  else if (password.length >= 8) points += 1;

  if (hasLower) points += 1;
  if (hasUpper) points += 1;
  if (hasDigit) points += 1;
  if (hasSymbol) {
    const symbolCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
    points += symbolCount >= 2 ? 2 : 1;
  }
  if (new Set(password).size >= 7) points += 1;

  let score = 1;
  let levelLabel = 'بسیار ضعیف';
  let levelColor = 'text-rose-600';
  let barColor = 'bg-rose-500';

  if (password.length >= 6 && points >= 3 && points <= 4) {
    score = 2;
    levelLabel = 'متوسط';
    levelColor = 'text-amber-600';
    barColor = 'bg-amber-500';
  } else if (points >= 5 && points <= 6) {
    score = 3;
    levelLabel = 'خوب';
    levelColor = 'text-sky-600';
    barColor = 'bg-sky-500';
  } else if (points >= 7) {
    score = 4;
    levelLabel = 'بسیار قوی';
    levelColor = 'text-emerald-600';
    barColor = 'bg-emerald-600';
  }

  return {
    hasMinLength,
    hasLower,
    hasUpper,
    hasSymbol,
    hasDigit,
    isMatching,
    score,
    levelLabel,
    levelColor,
    barColor,
  };
};
