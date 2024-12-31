// import type { Tesseract } from "tesseract.js";

export {};

declare global {
  interface Window {
    // Tesseract: typeof Tesseract;
    __START__: number;
  }

  // Connection Object that needs to be passed to the useQuery to fetch the data
  export interface Connection {
    name: string;
    desc: string;
    ssl: boolean;
    database: string;
    username: string;
    created_at: string;
    updated_at: string;
  }
}
