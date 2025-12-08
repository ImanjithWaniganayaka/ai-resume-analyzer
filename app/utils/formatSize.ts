/**
 * Convert a size in bytes to a human‑readable string in KB, MB, or GB.
 *
 * Rules:
 * - Uses binary units (1 KB = 1024 bytes).
 * - Chooses the largest unit among KB, MB, GB where the value is >= 1.
 * - Values are formatted up to 2 decimal places, trimming trailing zeros.
 * - Invalid, negative, or missing inputs are treated as 0.
 */
export function formatSize(input: number | null | undefined): string {
  const bytes = typeof input === 'number' && isFinite(input) && input > 0 ? input : 0;

  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  let value: number;
  let unit: 'KB' | 'MB' | 'GB';

  if (bytes >= GB) {
    value = bytes / GB;
    unit = 'GB';
  } else if (bytes >= MB) {
    value = bytes / MB;
    unit = 'MB';
  } else {
    // Always report at least in KB as per requirement
    value = bytes / KB;
    unit = 'KB';
  }

  // Format to max 2 decimals and trim trailing zeros
  const formatted = trimTrailingZeros(value.toFixed(2));
  return `${formatted} ${unit}`;
}

function trimTrailingZeros(numStr: string): string {
  if (!numStr.includes('.')) return numStr;
  return numStr.replace(/\.0+$/, '').replace(/\.(\d*?)0+$/, '.$1').replace(/\.$/, '');
}

export default formatSize;
