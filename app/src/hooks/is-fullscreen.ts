/**
 * It helps detecting if the app is running in fullscreen mode.
 * (standard PWA or iOS standalone mode)
 *
 * the IOS_SPACING_BOTTOM seems to be optimal for iOS standalone mode.
 * I tested it on iPhone 14Pro and it works fine.
 */

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export const IOS_SPACING_BOTTOM = "20px";

export const isFullScreen = () => {
  try {
    const standalone = window.navigator.standalone;
    const displayMode = window.matchMedia("(display-mode: standalone)").matches;

    return Boolean(standalone || displayMode);
  } catch {
    return false;
  }
};

export default isFullScreen;
