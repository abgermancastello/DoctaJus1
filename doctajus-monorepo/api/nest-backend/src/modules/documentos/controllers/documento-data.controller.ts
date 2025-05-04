import { Controller, Get } from '@nestjs/common';

interface Cliente {
  id: string;
  nombre: string;
}

interface Expediente {
  id: string;
  numero: string;
  titulo: string;
}

@Controller('documento-data')
export class DocumentoDataController {
  private clientes: Cliente[] = [
    { id: '1', nombre: 'Cliente 1' },
    { id: '2', nombre: 'Cliente 2' },
    { id: '3', nombre: 'Cliente 3' },
    { id: '4', nombre: 'Cliente 4' },
    { id: '5', nombre: 'Cliente 5' },
  ];

  private expedientes: Expediente[] = [
    { id: '1', numero: 'EXP-001', titulo: 'Caso Civil 1' },
    { id: '2', numero: 'EXP-002', titulo: 'Caso Laboral 1' },
    { id: '3', numero: 'EXP-003', titulo: 'Caso Comercial 1' },
    { id: '4', numero: 'EXP-004', titulo: 'Caso Penal 1' },
    { id: '5', numero: 'EXP-005', titulo: 'Caso Administrativo 1' },
  ];

  @Get('clientes')
  getClientes() {
    console.log('DocumentoDataController.getClientes - Retornando clientes de prueba');
    return this.clientes;
  }

  @Get('expedientes')
  getExpedientes() {
    console.log('DocumentoDataController.getExpedientes - Retornando expedientes de prueba');
    return this.expedientes;
  }
}
