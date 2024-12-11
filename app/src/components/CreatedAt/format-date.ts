export const formatDate = (date: string): string => {
  const now = new Date();
  const inputDate = new Date(date);
  const diffInSeconds = Math.floor(
    (inputDate.getTime() - now.getTime()) / 1000
  );

  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInWeek = secondsInDay * 7;
  const secondsInMonth = secondsInDay * 30; // Approximation
  const secondsInYear = secondsInDay * 365;

  if (diffInSeconds >= 0 && diffInSeconds < secondsInMinute) {
    // If within the next minute in the future, return "in {s} seconds"
    return `in ${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""}`;
  }

  if (diffInSeconds < 0) {
    // Past cases
    const pastDiffInSeconds = Math.abs(diffInSeconds);
    if (pastDiffInSeconds < secondsInHour) {
      const minutes = Math.floor(pastDiffInSeconds / secondsInMinute);
      return `${minutes} min ago`;
    } else if (pastDiffInSeconds < secondsInDay) {
      const hours = Math.floor(pastDiffInSeconds / secondsInHour);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (pastDiffInSeconds < secondsInDay * 2) {
      return "yesterday";
    } else if (pastDiffInSeconds < secondsInWeek) {
      return "last week";
    } else if (pastDiffInSeconds < secondsInMonth) {
      const weeks = Math.floor(pastDiffInSeconds / secondsInWeek);
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else if (pastDiffInSeconds < secondsInMonth * 6) {
      const months = Math.floor(pastDiffInSeconds / secondsInMonth);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      return inputDate.toISOString().split("T")[0].replace(/-/g, "/");
    }
  } else {
    // Future cases
    if (diffInSeconds < secondsInHour) {
      const minutes = Math.floor(diffInSeconds / secondsInMinute);
      return `in ${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else if (diffInSeconds < secondsInDay) {
      const hours = Math.floor(diffInSeconds / secondsInHour);
      const minutes = Math.floor(
        (diffInSeconds % secondsInHour) / secondsInMinute
      );
      return `in ${hours}:${minutes.toString().padStart(2, "0")}`;
    } else if (diffInSeconds < secondsInDay * 2) {
      const hours = inputDate.getHours();
      const minutes = inputDate.getMinutes();
      return `tomorrow at ${hours}:${minutes.toString().padStart(2, "0")}`;
    } else if (diffInSeconds < secondsInWeek) {
      return "next week";
    } else if (diffInSeconds < secondsInMonth) {
      const weeks = Math.floor(diffInSeconds / secondsInWeek);
      return `in ${weeks} week${weeks > 1 ? "s" : ""}`;
    } else if (diffInSeconds < secondsInYear) {
      const months = Math.floor(diffInSeconds / secondsInMonth);
      return `in ${months} month${months > 1 ? "s" : ""}`;
    } else {
      const years = Math.floor(diffInSeconds / secondsInYear);
      return `in ${years} year${years > 1 ? "s" : ""}`;
    }
  }
};
