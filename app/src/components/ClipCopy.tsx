import { IconButton, Icon, Tooltip } from "@mui/material";
import { useDevice } from "hooks/use-device";

interface ClipCopyProps {
  content: string; // Mandatory: content to copy to the clipboard
  tooltip?: string; // Optional: tooltip text, default is "copy to clipboard"
}

export const ClipCopy: React.FC<ClipCopyProps> = ({
  content,
  tooltip = "Copy to clipboard", // Default tooltip
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

  return isTouch ? (
    <IconButton onClick={() => handleCopy()}>
      <Icon>content_copy</Icon>
    </IconButton>
  ) : (
    <Tooltip title={tooltip} arrow>
      <IconButton onClick={() => handleCopy()}>
        <Icon>content_copy</Icon>
      </IconButton>
    </Tooltip>
  );
};
