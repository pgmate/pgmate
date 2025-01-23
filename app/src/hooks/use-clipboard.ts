export const useClipboard = () => {
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy text to clipboard:", error);
    }
  };

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const event = new ClipboardEvent("paste", {
        clipboardData: new DataTransfer(),
      });
      event.clipboardData?.setData("text", text);
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Failed to paste text from clipboard:", error);
    }
  };

  return {
    copy,
    paste,
  };
};
