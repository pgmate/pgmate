import { IconButton, Icon, Tooltip } from "@mui/material";
import { useDevice } from "hooks/use-device";

interface ClipCopyProps {
  content: string; // Mandatory: content to copy to the clipboard
  tooltip?: string; // Optional: tooltip text, default is "copy to clipboard"
  size?: "small" | "medium" | "large"; // Optional: size of the button
}

export const ClipCopy: React.FC<ClipCopyProps> = ({
  content,
  tooltip = "Copy to clipboard", // Default tooltip
  size = "medium", // Default size
}) => {
  const { isTouch } = useDevice();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      alert(`Failed to copy to clipboard: ${message}`);
    }
  };

  // Determine font size for the icon based on the button size
  const iconFontSize = size === "small" ? 16 : size === "large" ? 32 : 24;

  return isTouch ? (
    <IconButton onClick={() => handleCopy()} size={size}>
      <Icon sx={{ fontSize: iconFontSize }}>content_copy</Icon>
    </IconButton>
  ) : (
    <Tooltip title={tooltip} arrow>
      <IconButton onClick={() => handleCopy()} size={size}>
        <Icon sx={{ fontSize: iconFontSize }}>content_copy</Icon>
      </IconButton>
    </Tooltip>
  );
};
