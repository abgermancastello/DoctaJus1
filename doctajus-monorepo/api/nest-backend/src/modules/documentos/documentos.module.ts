import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DocumentosController } from './controllers/documentos.controller';
import { DocumentoDataController } from './controllers/documento-data.controller';
import { DocumentosService } from './services/documentos.service';
import { Documento } from './entities/documento.entity';
import { DocumentoVersion } from './entities/documento-version.entity';
import { DocumentoPermiso } from './entities/documento-permiso.entity';
import { DocumentoHistorial } from './entities/documento-historial.entity';
import { StorageModule } from '../storage/storage.module';
import { IaServiceModule } from '../ia-service/ia-service.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Documento,
      DocumentoVersion,
      DocumentoPermiso,
      DocumentoHistorial
    ]),
    ConfigModule,
    StorageModule,
    IaServiceModule
  ],
  controllers: [DocumentosController, DocumentoDataController],
  providers: [DocumentosService],
  exports: [DocumentosService]
})
export class DocumentosModule {}
