import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface RawRecord {
  sourceId?: string;
  date?: string;
  category?: string;
  amount?: string | number;
  status?: string;
  description?: string;
  [key: string]: any;
}

export interface NormalizedRecord {
  sourceId: string;
  date: string; // YYYY-MM-DD
  category: string;
  amount: number;
  status: string;
  description?: string;
}

@Injectable()
export class PdfExtractorService {
  async extractFromPdf(pdfBuffer: Buffer): Promise<RawRecord[]> {
    try {
      // Importar pdf-parse
      const pdfParseModule = require('pdf-parse');
      const PDFParse = pdfParseModule.PDFParse;
      
      if (!PDFParse || typeof PDFParse !== 'function') {
        throw new Error('PDFParse no está disponible');
      }
      
      // Instanciar PDFParse
      const pdfParser = new PDFParse({ data: pdfBuffer });
      
      // Intentar obtener tabla primero (más preciso)
      try {
        const tableData = await pdfParser.getTable();
        if (tableData && tableData.pages && tableData.pages.length > 0) {
          const records: RawRecord[] = [];
          
          // Procesar todas las tablas de todas las páginas
          for (const page of tableData.pages) {
            if (page.tables && page.tables.length > 0) {
              for (const table of page.tables) {
                // Mostrar la primera fila (headers) para debug
                if (table.length > 0) {
                  console.log('Headers de la tabla:', table[0]);
                }
                
                // Identificar índices de columnas basándose en el contenido
                // Buscar en las primeras filas para identificar el orden
                let sourceIdCol = -1;
                let dateCol = -1;
                let categoryCol = -1;
                let amountCol = -1;
                let statusCol = -1;
                let descriptionCol = -1;
                
                // Buscar en las primeras 3 filas para identificar las columnas
                for (let sampleRow = 0; sampleRow < Math.min(3, table.length); sampleRow++) {
                  const row = table[sampleRow];
                  if (!row || row.length < 6) continue;
                  
                  for (let col = 0; col < row.length; col++) {
                    const cell = (row[col] || '').toString().trim();
                    
                    // Identificar Source ID
                    if (sourceIdCol === -1 && /^INV-\d{4}-\d{3}$/i.test(cell)) {
                      sourceIdCol = col;
                      console.log(`Source ID encontrado en columna ${col}: "${cell}"`);
                    }
                    
                    // Identificar Fecha (DD-MM-YYYY o DD/MM/YYYY)
                    if (dateCol === -1 && /^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/.test(cell)) {
                      dateCol = col;
                      console.log(`Fecha encontrada en columna ${col}: "${cell}"`);
                    }
                    
                    // Identificar Categoría
                    if (categoryCol === -1 && /^(Servicios|Inventario|Gastos|Ventas)$/i.test(cell)) {
                      categoryCol = col;
                      console.log(`Categoría encontrada en columna ${col}: "${cell}"`);
                    }
                    
                    // Identificar Monto ($ seguido de números)
                    if (amountCol === -1 && /\$[\d.,]+/.test(cell)) {
                      amountCol = col;
                      console.log(`Monto encontrado en columna ${col}: "${cell}"`);
                    }
                    
                    // Identificar Estado
                    if (statusCol === -1 && /^(activo|pendiente|completado|cancelado)$/i.test(cell)) {
                      statusCol = col;
                      console.log(`Estado encontrado en columna ${col}: "${cell}"`);
                    }
                  }
                }
                
                // Si no encontramos todas las columnas, usar la última columna como descripción
                if (descriptionCol === -1) {
                  // Buscar la columna más larga que no sea ninguna de las anteriores
                  for (let col = 0; col < (table[1]?.length || 0); col++) {
                    if (col !== sourceIdCol && col !== dateCol && col !== categoryCol && 
                        col !== amountCol && col !== statusCol) {
                      const cell = (table[1]?.[col] || '').toString().trim();
                      if (cell.length > 20) { // Descripción suele ser más larga
                        descriptionCol = col;
                        break;
                      }
                    }
                  }
                  // Si no encontramos, usar la última columna disponible
                  if (descriptionCol === -1 && table[1]?.length) {
                    descriptionCol = table[1].length - 1;
                  }
                }
                
                console.log(`Columnas identificadas: SourceID=${sourceIdCol}, Date=${dateCol}, Category=${categoryCol}, Amount=${amountCol}, Status=${statusCol}, Description=${descriptionCol}`);
                
                // Procesar filas de datos (saltar headers)
                console.log(`Total de filas en la tabla: ${table.length} (incluyendo headers)`);
                console.log(`Procesando filas desde índice 1 hasta ${table.length - 1}`);
                
                // Mostrar las primeras 10 filas completas para debug
                console.log('=== PRIMERAS 10 FILAS DE LA TABLA ===');
                for (let debugRow = 0; debugRow < Math.min(10, table.length); debugRow++) {
                  const debugRowData = table[debugRow];
                  console.log(`Fila ${debugRow}:`, debugRowData?.map((cell: any) => (cell || '').toString().trim()).join(' | '));
                }
                console.log('=== FIN PRIMERAS 10 FILAS ===');
                
                let processedCount = 0;
                let skippedCount = 0;
                let addedCount = 0;
                
                for (let i = 1; i < table.length; i++) {
                  processedCount++;
                  const row = table[i];
                  if (!row || row.length < 6) {
                    skippedCount++;
                    if (i <= 10) {
                      console.log(`Fila ${i} omitida: row=${!!row}, length=${row?.length || 0}`);
                    }
                    continue;
                  }
                  
                  // Extraer datos de las columnas identificadas
                  const sourceId = sourceIdCol >= 0 ? (row[sourceIdCol] || '').toString().trim() : '';
                  let date = dateCol >= 0 ? (row[dateCol] || '').toString().trim() : '';
                  const category = categoryCol >= 0 ? (row[categoryCol] || '').toString().trim() : '';
                  let amount = amountCol >= 0 ? (row[amountCol] || '').toString().trim() : '';
                  const status = statusCol >= 0 ? (row[statusCol] || '').toString().trim() : '';
                  const description = descriptionCol >= 0 ? (row[descriptionCol] || '').toString().trim() : '';
                  
                  // Log de las primeras 10 filas para debug
                  if (i <= 10) {
                    console.log(`Fila ${i} extraída: SourceID="${sourceId}", Date="${date}", Category="${category}", Amount="${amount}", Status="${status}"`);
                  }
                  
                  // Validar que tenemos los campos mínimos
                  if (!sourceId || !date || !category) {
                    skippedCount++;
                    if (i <= 10) {
                      console.log(`⚠️ Fila ${i} omitida: faltan campos requeridos - SourceID="${sourceId}", Date="${date}", Category="${category}"`);
                    }
                    continue;
                  }
                  
                  // Guardar fecha original para logs
                  const dateOriginal = date;
                  
                  // Limpiar fecha: remover espacios extra pero mantener guiones
                  date = date.replace(/\s+/g, '').replace(/[^\d-\/]/g, '');
                  
                  // Normalizar fecha: convertir DD/MM/YYYY a DD-MM-YYYY
                  if (date.includes('/')) {
                    date = date.replace(/\//g, '-');
                  }
                  
                  // Si la fecha tiene formato incorrecto, intentar corregirla
                  if (date && !date.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
                    // Intentar convertir otros formatos
                    const dateParts = date.split(/[-\s\/]/).filter(p => p);
                    if (dateParts.length === 3) {
                      date = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
                    }
                  }
                  
                  // Log con Source ID y fecha
                  console.log(`[${sourceId}] Fecha original: "${dateOriginal}" -> Fecha normalizada: "${date}"`);
                  
                  // Limpiar monto: remover $ y espacios
                  amount = amount.replace(/\$/g, '').replace(/\s+/g, '').replace(/,/g, '');
                  
                  const record: RawRecord = {
                    sourceId,
                    date,
                    category,
                    amount,
                    status: status.toLowerCase(),
                    description,
                  };
                  
                  if (record.sourceId && record.date && record.category) {
                    records.push(record);
                    addedCount++;
                  }
                }
                
                console.log(`=== RESUMEN DE EXTRACCIÓN ===`);
                console.log(`Filas procesadas: ${processedCount}`);
                console.log(`Filas omitidas: ${skippedCount}`);
                console.log(`Registros agregados: ${addedCount}`);
                console.log(`=== FIN RESUMEN ===`);
              }
            }
          }
          
          if (records.length > 0) {
            console.log(`Extraídos ${records.length} registros de la tabla`);
            // Mostrar los primeros 5 y últimos 5 Source IDs para verificar
            const firstFive = records.slice(0, 5).map(r => r.sourceId);
            const lastFive = records.slice(-5).map(r => r.sourceId);
            console.log(`Primeros 5 Source IDs extraídos: ${firstFive.join(', ')}`);
            console.log(`Últimos 5 Source IDs extraídos: ${lastFive.join(', ')}`);
            return records;
          }
        }
      } catch (tableError) {
        // Si falla getTable, usar getText como fallback
        console.log('getTable falló, usando getText como fallback:', tableError);
      }
      
      // Fallback: usar getText
      const textData = await pdfParser.getText();
      const rawRecords = this.parsePdfText(textData.text || '');
      
      return rawRecords;
    } catch (error: any) {
      throw new Error(`Error al extraer PDF: ${error.message}`);
    }
  }

  private parsePdfText(text: string): RawRecord[] {
    const lines = text.split('\n').filter(line => line.trim());
    const records: RawRecord[] = [];
    
    // Patrón para detectar filas de tabla: Source ID | Fecha | Categoría | Monto | Estado | Descripción
    // Formato esperado: INV-2025-XXX | DD-MM-YYYY | Categoría | $X.XXX | estado | descripción
    const sourceIdPattern = /(INV-\d{4}-\d{3})/i;
    // Patrón más específico para fecha DD-MM-YYYY (debe tener guiones y 4 dígitos en el año)
    const datePattern = /\b(\d{1,2})-(\d{1,2})-(\d{4})\b/; // DD-MM-YYYY con word boundaries
    const amountPattern = /\$([\d.]+)/; // $X.XXX o $X,XXX
    const categoryPattern = /(Servicios|Inventario|Gastos|Ventas)/i;
    const statusPattern = /\b(activo|pendiente|completado|cancelado)\b/i;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Buscar Source ID (INV-2025-XXX)
      const sourceIdMatch = line.match(sourceIdPattern);
      if (!sourceIdMatch) continue;
      
      const sourceId = sourceIdMatch[1];
      const record: RawRecord = { sourceId };
      
      // Buscar fecha (DD-MM-YYYY) - usar match con grupos para capturar correctamente
      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        // Reconstruir la fecha en formato DD-MM-YYYY
        const day = dateMatch[1];
        const month = dateMatch[2];
        const year = dateMatch[3];
        record.date = `${day}-${month}-${year}`;
      }
      
      // Buscar categoría
      const categoryMatch = line.match(categoryPattern);
      if (categoryMatch) {
        record.category = categoryMatch[1];
      }
      
      // Buscar monto ($X.XXX)
      const amountMatch = line.match(amountPattern);
      if (amountMatch) {
        record.amount = amountMatch[1];
      }
      
      // Buscar estado
      const statusMatch = line.match(statusPattern);
      if (statusMatch) {
        record.status = statusMatch[1].toLowerCase();
      }
      
      // Buscar descripción (texto después del estado)
      const statusIndex = line.toLowerCase().indexOf(record.status || '');
      if (statusIndex !== -1) {
        const descriptionStart = statusIndex + (record.status?.length || 0);
        const descriptionText = line.substring(descriptionStart).trim();
        // Limpiar la descripción (remover pipes, espacios extra, etc.)
        const cleanDescription = descriptionText
          .replace(/\|/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleanDescription && cleanDescription.length > 0) {
          record.description = cleanDescription;
        }
      }
      
      // Solo agregar si tenemos al menos sourceId, fecha y categoría
      if (record.sourceId && record.date && record.category) {
        records.push(record);
      }
    }
    
    return records;
  }

  normalizeRecords(rawRecords: RawRecord[]): NormalizedRecord[] {
    return rawRecords.map((raw, index) => {
      // Normalizar sourceId
      const sourceId = raw.sourceId || `PDF-${index + 1}`;
      
      // Normalizar fecha - agregar log para debug con Source ID
      console.log(`[${sourceId}] Normalizando fecha: "${raw.date}" -> `);
      let normalizedDate = this.normalizeDate(raw.date, sourceId);
      console.log(`[${sourceId}] Fecha normalizada: "${normalizedDate}"`);
      
      // Normalizar amount
      const amount = this.normalizeAmount(raw.amount);
      
      // Normalizar category
      const category = this.normalizeCategory(raw.category || 'Sin categoría');
      
      // Normalizar status
      const status = this.normalizeStatus(raw.status || 'pendiente');
      
      return {
        sourceId,
        date: normalizedDate,
        category,
        amount,
        status,
        description: raw.description || undefined,
      };
    });
  }

  private normalizeDate(dateStr?: string, sourceId?: string): string {
    const sourceIdPrefix = sourceId ? `[${sourceId}] ` : '';
    
    if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
      console.log(`${sourceIdPrefix}normalizeDate: fecha vacía, usando fecha actual`);
      return new Date().toISOString().split('T')[0];
    }
    
    console.log(`${sourceIdPrefix}normalizeDate: entrada original: "${dateStr}"`);
    
    // Limpiar la cadena de fecha: remover espacios, pero mantener guiones y números
    let cleaned = dateStr.trim();
    
    // Remover espacios entre números y guiones (ej: "11 - 10 - 2025" -> "11-10-2025")
    cleaned = cleaned.replace(/\s*-\s*/g, '-');
    cleaned = cleaned.replace(/\s+/g, '');
    
    // Si tiene barras, convertir a guiones
    cleaned = cleaned.replace(/\//g, '-');
    
    console.log(`${sourceIdPrefix}normalizeDate: después de limpieza: "${cleaned}"`);
    
    // El PDF usa formato DD-MM-YYYY (ej: 11-10-2025)
    // Intentar diferentes patrones
    const patterns = [
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,  // DD-MM-YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
      /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/, // Flexible
    ];
    
    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        let dayStr = match[1];
        let monthStr = match[2];
        let yearStr = match[3];
        
        console.log(`${sourceIdPrefix}normalizeDate: patrón encontrado - día: ${dayStr}, mes: ${monthStr}, año: ${yearStr}`);
        
        const day = parseInt(dayStr, 10);
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);
        
        // Validar que sean números válidos y estén en rangos correctos
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
            // Crear fecha para validar (mes - 1 porque Date usa 0-11)
            const testDate = new Date(year, month - 1, day);
            
            // Verificar que la fecha es válida (evita fechas como 31-02-2025)
            if (testDate.getFullYear() === year && 
                testDate.getMonth() === month - 1 && 
                testDate.getDate() === day) {
              // Convertir a YYYY-MM-DD
              const dayPadded = dayStr.padStart(2, '0');
              const monthPadded = monthStr.padStart(2, '0');
              const result = `${yearStr}-${monthPadded}-${dayPadded}`;
              console.log(`${sourceIdPrefix}normalizeDate: fecha normalizada exitosamente: "${result}"`);
              return result;
            } else {
              console.log(`${sourceIdPrefix}normalizeDate: fecha inválida (${day}-${month}-${year})`);
            }
          } else {
            console.log(`${sourceIdPrefix}normalizeDate: valores fuera de rango (día: ${day}, mes: ${month}, año: ${year})`);
          }
        }
      }
    }
    
    console.log(`${sourceIdPrefix}normalizeDate: no se pudo parsear la fecha, usando fecha actual`);
    
    // Intentar otros formatos como fallback
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{4})\-(\d{1,2})\-(\d{1,2})$/, // YYYY-MM-DD
    ];
    
    for (let i = 0; i < formats.length; i++) {
      const format = formats[i];
      const formatMatch = dateStr.match(format);
      if (formatMatch) {
        if (i === 1) {
          // YYYY-MM-DD - ya está en el formato correcto
          const testDate = new Date(dateStr);
          if (!isNaN(testDate.getTime())) {
            return dateStr;
          }
          continue;
        }
        
        // DD/MM/YYYY
        const day = parseInt(formatMatch[1], 10);
        const month = parseInt(formatMatch[2], 10);
        const year = parseInt(formatMatch[3], 10);
        
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
            const testDate = new Date(year, month - 1, day);
            if (testDate.getFullYear() === year && 
                testDate.getMonth() === month - 1 && 
                testDate.getDate() === day) {
              const dayPadded = formatMatch[1].padStart(2, '0');
              const monthPadded = formatMatch[2].padStart(2, '0');
              return `${year}-${monthPadded}-${dayPadded}`;
            }
          }
        }
      }
    }
    
    // Si no se puede parsear, usar fecha actual
    return new Date().toISOString().split('T')[0];
  }

  private normalizeAmount(amount?: string | number): number {
    if (typeof amount === 'number') {
      return amount;
    }
    
    if (!amount) {
      return 0;
    }
    
    // Remover símbolos de moneda y espacios
    let cleaned = amount.toString().replace(/[\$€\s]/g, '');
    
    // El PDF usa punto como separador de miles (ej: $1.666)
    // Si tiene punto, verificar si es separador de miles o decimal
    if (cleaned.includes('.')) {
      const parts = cleaned.split('.');
      // Si tiene más de 2 partes o la última parte tiene más de 2 dígitos, es separador de miles
      if (parts.length > 2 || (parts.length === 2 && parts[1].length > 2)) {
        // Es separador de miles, remover todos los puntos
        cleaned = cleaned.replace(/\./g, '');
      } else {
        // Es decimal, convertir punto a punto decimal
        cleaned = cleaned.replace(/\./g, '.');
      }
    }
    
    // Remover comas (por si acaso)
    cleaned = cleaned.replace(/,/g, '');
    
    // Convertir a número
    const num = parseFloat(cleaned);
    
    return isNaN(num) ? 0 : num;
  }

  private normalizeCategory(category: string): string {
    if (!category) {
      return 'Sin categoría';
    }
    
    // Normalizar a título (primera letra mayúscula)
    return category
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private normalizeStatus(status: string): string {
    if (!status) {
      return 'pendiente';
    }
    
    const normalized = status.toLowerCase();
    const validStatuses = ['activo', 'pendiente', 'completado', 'cancelado'];
    
    // Buscar el estado más cercano
    for (const validStatus of validStatuses) {
      if (normalized.includes(validStatus)) {
        return validStatus;
      }
    }
    
    return 'pendiente';
  }
}

