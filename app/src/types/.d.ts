// import type { Tesseract } from "tesseract.js";

export {};

declare global {
  interface Window {
    // Tesseract: typeof Tesseract;
    __START__: number;
  }
}
