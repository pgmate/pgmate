export const ReadableSize = ({ bytes }: { bytes?: number }) => {
  if (!bytes) {
    return (
      <>
        0 <small>B</small>
      </>
    );
  }

  let _bytes = typeof bytes === "string" ? parseInt(bytes) : bytes;

  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let unit = 0;

  while (_bytes >= 1024 && unit < units.length - 1) {
    _bytes /= 1024;
    unit++;
  }

  const formattedValue =
    _bytes % 1 === 0 ? _bytes.toFixed(0) : _bytes.toFixed(2);

  return (
    <>
      {formattedValue} <small>{units[unit]}</small>
    </>
  );
};
