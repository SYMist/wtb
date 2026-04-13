export interface AgeResult {
  age: number;
  nextBirthdayDays: number;
  koreanAge: number;
  totalDays: number;
}

export function calculateAge(birthDate: string, baseDate?: string): AgeResult {
  const birth = new Date(birthDate);
  const today = baseDate ? new Date(baseDate) : new Date();

  today.setHours(0, 0, 0, 0);
  birth.setHours(0, 0, 0, 0);

  // 만 나이
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  // 한국식 나이
  const koreanAge = today.getFullYear() - birth.getFullYear() + 1;

  // 다음 생일까지 남은 일수
  const nextBirthday = new Date(
    today.getFullYear(),
    birth.getMonth(),
    birth.getDate()
  );
  if (nextBirthday <= today) {
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  }
  const nextBirthdayDays = Math.ceil(
    (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 살아온 일수
  const totalDays = Math.floor(
    (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)
  );

  return { age: Math.max(age, 0), nextBirthdayDays, koreanAge, totalDays };
}
