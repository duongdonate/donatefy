// 3 cấp thiết bị của app; mốc theo bề ngang cửa sổ
export const DEVICE = Object.freeze({
  MOBILE: "mobile", // < 768
  TABLET: "tablet", // 768–1279
  DESKTOP: "desktop", // ≥ 1280
});

export function deviceFromWidth(width) {
  if (width < 768) return DEVICE.MOBILE;
  if (width < 1280) return DEVICE.TABLET;
  return DEVICE.DESKTOP;
}
