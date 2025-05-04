/**
 * Clase para manejar respuestas de error personalizado
 * Extiende la clase Error nativa
 */
export class ErrorResponse extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    // Configuración necesaria debido a cómo funciona la extensión de clases en TypeScript
    Object.setPrototypeOf(this, ErrorResponse.prototype);
  }
}
