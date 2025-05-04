import * as pdfjsLib from 'pdfjs-dist';

interface TextExtractionResult {
  text: string;
  success: boolean;
  error?: string;
}

class TextExtractorService {
  /**
   * Extrae texto de un archivo según su tipo
   * @param buffer Buffer del archivo
   * @param mimeType Tipo MIME del archivo
   * @returns Texto extraído o null si no se puede extraer
   */
  async extractText(buffer: Buffer, mimeType: string): Promise<string | null> {
    try {
      if (mimeType === 'application/pdf') {
        return await this.extractFromPdf(buffer);
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        // TODO: Implementar extracción de texto de documentos Word
        console.log("Extracción de texto de Word no implementada aún");
        return null;
      } else if (mimeType === 'text/plain') {
        return buffer.toString('utf-8');
      } else {
        console.log(`Extracción de texto no soportada para el tipo: ${mimeType}`);
        return null;
      }
    } catch (error: any) {
      console.error(`Error al extraer texto: ${error.message}`, error);
      return null;
    }
  }

  /**
   * Extrae texto de un archivo PDF
   * @param buffer Buffer del archivo PDF
   * @returns Texto extraído del PDF
   */
  private async extractFromPdf(buffer: Buffer): Promise<string> {
    try {
      // Cargar el documento PDF usando pdfjs
      const data = new Uint8Array(buffer);
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;

      let fullText = '';

      // Extraer texto de cada página
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items;

        // Combinar los elementos de texto
        let pageText = '';
        for (const item of textItems) {
          // @ts-ignore - La propiedad 'str' existe en los items pero puede no estar tipada
          if (item.str) pageText += item.str + ' ';
        }

        fullText += pageText + '\n\n';
      }

      return fullText.trim();
    } catch (error: any) {
      console.error(`Error al extraer texto del PDF: ${error.message}`, error);
      return '';
    }
  }
}

export const textExtractorService = new TextExtractorService();
