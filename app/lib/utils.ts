import { twMerge } from "tailwind-merge";

// Minimal replacement for `clsx` to avoid external dependency
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | ClassValue[]
  | { [className: string]: boolean | undefined | null };

function cx(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  const push = (val: ClassValue): void => {
    if (!val && val !== 0) return;
    if (typeof val === "string" || typeof val === "number") {
      if (String(val).trim()) classes.push(String(val));
      return;
    }
    if (Array.isArray(val)) {
      for (const v of val) push(v);
      return;
    }
    if (typeof val === "object") {
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key) && (val as any)[key]) {
          if (key.trim()) classes.push(key);
        }
      }
    }
  };
  for (const input of inputs) push(input);
  return classes.join(" ");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(cx(...inputs));
}

export function formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    // Determine the appropriate unit by calculating the log
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // Format with 2 decimal places and round
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const generateUUID = () => crypto.randomUUID();
