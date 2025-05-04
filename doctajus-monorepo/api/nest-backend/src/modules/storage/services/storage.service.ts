import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

// Definición básica del tipo para evitar errores
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    // Por defecto, guardamos archivos en una carpeta local 'uploads'
    this.uploadDir = this.configService.get('UPLOAD_DIR', 'uploads');
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
      // Para MongoDB Atlas, aquí se conectaría con GridFS u otro servicio
      // Por ahora, implementamos un almacenamiento local simple

      // Crear carpeta de destino si no existe
      const targetDir = path.join(this.uploadDir, folder);
      this.ensureDirectoryExists(targetDir);

      // Generar nombre único para el archivo
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(targetDir, fileName);

      // Copiar el archivo desde la ubicación temporal a la final
      const copyFile = promisify(fs.copyFile);
      await copyFile(file.path, filePath);

      // Eliminar el archivo temporal
      const unlinkFile = promisify(fs.unlink);
      await unlinkFile(file.path);

      // En un entorno real, aquí se subiría a MongoDB Atlas o servicio en la nube
      // Por ahora, devolvemos una URL local
      const fileUrl = `/api/uploads/${folder ? folder + '/' : ''}${fileName}`;

      this.logger.log(`Archivo subido exitosamente: ${filePath}`);
      return {
        url: fileUrl,
        filename: fileName
      };
    } catch (error) {
      this.logger.error(`Error al subir archivo: ${error.message}`, error.stack);
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
    try {
      // En una implementación real, aquí se generaría una URL firmada con MongoDB Atlas
      // Por ahora, simplemente devolvemos la misma URL
      return fileUrl;
    } catch (error) {
      this.logger.error(`Error al generar URL firmada: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Elimina un archivo del sistema de almacenamiento
   * @param fileUrl URL del archivo a eliminar
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Extraer el nombre del archivo de la URL
      const fileName = fileUrl.split('/').pop();
      if (!fileName) {
        throw new Error('URL de archivo inválida');
      }

      // Encontrar el archivo en el sistema
      const filePath = path.join(this.uploadDir, fileName);
      if (fs.existsSync(filePath)) {
        const unlinkFile = promisify(fs.unlink);
        await unlinkFile(filePath);
        this.logger.log(`Archivo eliminado: ${filePath}`);
        return true;
      }

      this.logger.warn(`Archivo no encontrado para eliminar: ${filePath}`);
      return false;
    } catch (error) {
      this.logger.error(`Error al eliminar archivo: ${error.message}`, error.stack);
      throw error;
    }
  }
}
