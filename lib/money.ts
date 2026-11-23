export const toKobo = (naira: number) => Math.round(naira * 100);

export const formatNaira = (kobo: number) =>
  "₦" +
  (kobo / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatCompactNaira = (kobo: number) => {
  const naira = kobo / 100;
  if (Math.abs(naira) >= 1_000_000) {
    return `₦${(naira / 1_000_000).toLocaleString("en-NG", {
      maximumFractionDigits: 1,
    })}M`;
  }
  if (Math.abs(naira) >= 1_000) {
    return `₦${(naira / 1_000).toLocaleString("en-NG", {
      maximumFractionDigits: 1,
    })}k`;
  }
  return formatNaira(kobo);
};
