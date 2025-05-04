import React from 'react';
import { Cliente } from '../../types';

interface ImportExportButtonsProps {
  contactos: Cliente[];
  onImportComplete: (contactos: Cliente[]) => void;
}

const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({ contactos, onImportComplete }) => {
  // Exportar contactos a CSV
  const handleExport = () => {
    // Convertir contactos a formato CSV
    const headers = ['nombre', 'apellido', 'razonSocial', 'tipo', 'documento', 'email', 'telefono', 'direccion', 'notas'];

    const csvRows = [
      // Encabezados
      headers.join(','),

      // Filas de datos
      ...contactos.map(contacto => {
        return headers.map(header => {
          // Escapar valores con comas
          const value = contacto[header as keyof Cliente];
          const stringValue = value !== undefined ? String(value) : '';
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        }).join(',');
      })
    ];

    // Crear y descargar el archivo CSV
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `contactos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Abrir selector de archivo para importar
  const handleImportClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          const content = e.target?.result as string;
          const parsedContacts = parseCSV(content);
          onImportComplete(parsedContacts);
        };

        reader.readAsText(file);
      }
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  // Función para analizar el CSV
  const parseCSV = (csvContent: string): Cliente[] => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',');
      const contacto: any = {};

      headers.forEach((header, index) => {
        let value = values[index] || '';

        // Eliminar comillas si el valor está entre comillas
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }

        contacto[header.trim()] = value;
      });

      return contacto as Cliente;
    });
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={handleExport}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Exportar CSV
      </button>
      <button
        onClick={handleImportClick}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        Importar CSV
      </button>
    </div>
  );
};

export default ImportExportButtons;
