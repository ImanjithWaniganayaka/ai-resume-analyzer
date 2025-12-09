import { twMerge } from "tailwind-merge";

// Minimal replacement for clsx/classnames behavior we need in this project
type Primitive = string | number | boolean | null | undefined;
type ClassDictionary = Record<string, boolean | undefined | null>;
type ClassArray = ClassValue[];
export type ClassValue = Primitive | ClassDictionary | ClassArray;

function toClassName(value: ClassValue): string {
    if (!value) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (Array.isArray(value)) return value.map(toClassName).filter(Boolean).join(" ");
    if (typeof value === "object") {
        return Object.entries(value)
            .filter(([, v]) => Boolean(v))
            .map(([k]) => k)
            .join(" ");
    }
    return "";
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(toClassName(inputs));
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
