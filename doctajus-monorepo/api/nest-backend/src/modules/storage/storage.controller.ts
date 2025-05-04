import { Controller, Get, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('uploads')
export class StorageController {
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', 'uploads');
  }

  @Get(':folder/:filename')
  serveFile(@Param('folder') folder: string, @Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(this.uploadDir, folder, filename);

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Archivo no encontrado');
    }

    // Determinar el tipo de contenido basado en la extensión del archivo
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream'; // Tipo genérico por defecto

    // Asignar tipo MIME según la extensión
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.xls':
        contentType = 'application/vnd.ms-excel';
        break;
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
    }

    // Configurar encabezados para la respuesta
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'max-age=3600'
    });

    // Enviar el archivo
    return res.sendFile(filePath);
  }

  @Get(':filename')
  serveRootFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(this.uploadDir, filename);

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Archivo no encontrado');
    }

    // Determinar el tipo de contenido basado en la extensión del archivo
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream'; // Tipo genérico por defecto

    // Asignar tipo MIME según la extensión
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.xls':
        contentType = 'application/vnd.ms-excel';
        break;
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
    }

    // Configurar encabezados para la respuesta
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'max-age=3600'
    });

    // Enviar el archivo
    return res.sendFile(filePath);
  }
}
