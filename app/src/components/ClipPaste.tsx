import { IconButton, Icon, Tooltip } from "@mui/material";
import { useDevice } from "../hooks/use-device";

interface ClipPasteProps {
  onChange?: (text: string) => void;
}

export const ClipPaste: React.FC<ClipPasteProps> = ({
  onChange = () => {},
}) => {
  const { isTouch } = useDevice();
  const handlePaste = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      onChange(text);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      alert(`Failed to read clipboard contents: ${message}`);
    }
  };

  return isTouch ? (
    <IconButton onClick={() => handlePaste()}>
      <Icon>content_paste</Icon>
    </IconButton>
  ) : (
    <Tooltip title="Paste from clipboard" arrow>
      <IconButton onClick={() => handlePaste()}>
        <Icon>content_paste</Icon>
      </IconButton>
    </Tooltip>
  );
};
