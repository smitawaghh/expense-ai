/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/* react-csv ships no type declarations — minimal shim so tsc is happy. */
declare module 'react-csv' {
  import type { ComponentType, AnchorHTMLAttributes } from 'react';
  interface CSVProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    data: unknown[] | string;
    headers?: unknown[];
    filename?: string;
    separator?: string;
    target?: string;
  }
  export const CSVLink: ComponentType<CSVProps>;
  export const CSVDownload: ComponentType<CSVProps>;
}
