import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

// Tipo para archivo multer
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer: Buffer;
}

class UploadFileService {
  private uploadDir: string;

  constructor() {
    // Por defecto, guardamos archivos en una carpeta local 'uploads'
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads';
    this.ensureDirectoryExists(this.uploadDir);
  }

  private ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  /**
   * Sube un archivo al sistema de almacenamiento
   * @param file Archivo a subir
   * @param folder Carpeta donde se guardará el archivo (opcional)
   * @returns Objeto con información del archivo subido
   */
  async uploadFile(file: MulterFile, folder = ''): Promise<{ url: string; filename: string }> {
    try {
      // Crear carpeta de destino si no existe
      const targetDir = path.join(this.uploadDir, folder);
      this.ensureDirectoryExists(targetDir);

      // Generar nombre único para el archivo
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(targetDir, fileName);

      // Guardar el archivo desde la buffer a la ubicación final
      const writeFile = promisify(fs.writeFile);
      await writeFile(filePath, file.buffer);

      // Devolver URL relativa
      const fileUrl = `/api/uploads/${folder ? folder + '/' : ''}${fileName}`;

      console.log(`Archivo subido exitosamente: ${filePath}`);
      return {
        url: fileUrl,
        filename: fileName
      };
    } catch (error: any) {
      console.error(`Error al subir archivo: ${error?.message || 'Error desconocido'}`, error);
      throw error;
    }
  }

  /**
   * Obtiene una URL firmada para descargar un archivo
   * @param fileUrl URL del archivo a descargar
   * @param expiryMinutes Minutos de validez de la URL
   * @returns URL firmada para descargar el archivo
   */
  async getSignedUrl(fileUrl: string, expiryMinutes = 60): Promise<string> {
    // En una implementación real, aquí se generaría una URL firmada
    // Por ahora, simplemente devolvemos la misma URL
    return fileUrl;
  }

  /**
   * Elimina un archivo del sistema de almacenamiento
   * @param fileUrl URL del archivo a eliminar
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Extraer el nombre del archivo de la URL
      const urlParts = fileUrl.split('/');
      let fileName: string;
      let folderPath = '';

      if (urlParts.length > 2) {
        // URL contiene una carpeta
        fileName = urlParts.pop() || '';
        folderPath = urlParts.pop() || '';
      } else {
        fileName = urlParts.pop() || '';
      }

      if (!fileName) {
        throw new Error('URL de archivo inválida');
      }

      // Encontrar el archivo en el sistema
      const filePath = path.join(this.uploadDir, folderPath, fileName);
      if (fs.existsSync(filePath)) {
        const unlinkFile = promisify(fs.unlink);
        await unlinkFile(filePath);
        console.log(`Archivo eliminado: ${filePath}`);
        return true;
      }

      console.warn(`Archivo no encontrado para eliminar: ${filePath}`);
      return false;
    } catch (error: any) {
      console.error(`Error al eliminar archivo: ${error?.message || 'Error desconocido'}`, error);
      throw error;
    }
  }
}

export const uploadFileService = new UploadFileService();
