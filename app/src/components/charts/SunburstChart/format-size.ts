// Function to format size into human-readable format
export const formatLabelSize = (size: number): string => {
  if (!size) return "0B";

  const units = ["b", "Kb", "Mb", "Gb", "Tb"];
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // Format differently for specific units
  if (units[unitIndex] === "Kb" || units[unitIndex] === "Mb") {
    return `${Math.round(size)}${units[unitIndex]}`; // Always round for Kb and Mb
  }

  // Use `Number.isInteger` to check if the number has no decimal part
  return Number.isInteger(size)
    ? `${size}${units[unitIndex]}`
    : `${size.toFixed(1)}${units[unitIndex]}`;
};

// Function to format size into human-readable format for tooltips
export const formatTooltipSize = (size: number): string => {
  if (!size) return "0B";

  const units = ["b", "Kb", "Mb", "Gb", "Tb"];
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // Always show one decimal for tooltips
  return `${size.toFixed(1)}${units[unitIndex]}`;
};
