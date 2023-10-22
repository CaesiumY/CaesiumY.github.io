import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getOS = () => {
  const { userAgent } = navigator;

  if (/android/i.test(userAgent)) return "android";
  if (/iPad|iPhone|iPod/.test(userAgent)) return "ios";
  if (/Mac/.test(userAgent)) return "mac";
  if (/Windows/.test(userAgent)) return "windows";
  if (/Linux/.test(userAgent)) return "linux";

  return "unknown";
};
