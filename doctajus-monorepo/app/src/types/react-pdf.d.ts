declare module 'react-pdf' {
  import { ComponentType, ReactElement } from 'react';

  export interface DocumentProps {
    file: string | File | null;
    onLoadSuccess?: (document: { numPages: number }) => void;
    loading?: ReactElement;
    error?: ReactElement;
    children?: ReactElement | ReactElement[];
  }

  export interface PageProps {
    pageNumber: number;
    width?: number;
    renderTextLayer?: boolean;
    renderAnnotationLayer?: boolean;
  }

  export const Document: ComponentType<DocumentProps>;
  export const Page: ComponentType<PageProps>;

  interface PDFJSStatic {
    GlobalWorkerOptions: {
      workerSrc: string;
    };
    version: string;
  }

  export const pdfjs: PDFJSStatic;
}

declare module 'react-pdf/dist/esm/pdfjs' {
  interface PDFJSStatic {
    GlobalWorkerOptions: {
      workerSrc: string;
    };
    version: string;
  }

  const pdfjs: PDFJSStatic;
  export default pdfjs;
}

declare module 'react-pdf/dist/esm/Page/AnnotationLayer.css' {}
declare module 'react-pdf/dist/esm/Page/TextLayer.css' {}
