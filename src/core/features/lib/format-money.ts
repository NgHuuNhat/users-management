export const formatMoney = (value: number) =>
  value ? value.toLocaleString("vi-VN") : "";

export const parseMoney = (value: string) =>
  Number(value.replace(/\D/g, "") || 0);