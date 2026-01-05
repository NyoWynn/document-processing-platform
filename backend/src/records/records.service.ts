import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from '../entities/record.entity';
import { PdfExtractorService, RawRecord, NormalizedRecord } from '../services/pdf-extractor.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Record)
    private recordsRepository: Repository<Record>,
    private pdfExtractorService: PdfExtractorService,
  ) {}

  async findAll(): Promise<Record[]> {
    return this.recordsRepository.find({
      order: { date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Record | null> {
    return this.recordsRepository.findOne({ where: { id } });
  }

  async create(createRecordDto: any): Promise<Record> {
    // Convertir date de string a Date 
    const recordData = {
      ...createRecordDto,
      date: createRecordDto.date instanceof Date 
        ? createRecordDto.date 
        : new Date(createRecordDto.date),
    };
    const record = this.recordsRepository.create(recordData);
    const saved = await this.recordsRepository.save(record);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async update(id: number, updateRecordDto: any): Promise<Record> {
 
    const updateData: any = { ...updateRecordDto };
    if (updateRecordDto.date && typeof updateRecordDto.date === 'string') {
      updateData.date = new Date(updateRecordDto.date);
    }
    await this.recordsRepository.update(id, updateData);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error('Record not found');
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.recordsRepository.delete(id);
  }

  private saveJsonFile(data: any[], filePath: string): void {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, jsonContent, 'utf8');
      console.log(`Archivo JSON guardado: ${filePath}`);
    } catch (error) {
      console.error(`Error al guardar JSON ${filePath}:`, error);
    }
  }

  private saveCsvFile(data: any[], filePath: string): void {
    try {
      if (data.length === 0) {
        fs.writeFileSync(filePath, '', 'utf8');
        return;
      }

      // Obtener headers de las claves del primer objeto
      const headers = Object.keys(data[0]);
      
      // Crear línea de headers
      const csvRows = [headers.join(',')];
      
      // Crear líneas de datos
      for (const row of data) {
        const values = headers.map(header => {
          const value = row[header];
          // Escapar comillas y envolver en comillas si contiene comas o comillas
          if (value === null || value === undefined) {
            return '';
          }
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        });
        csvRows.push(values.join(','));
      }
      
      fs.writeFileSync(filePath, csvRows.join('\n'), 'utf8');
      console.log(`Archivo CSV guardado: ${filePath}`);
    } catch (error) {
      console.error(`Error al guardar CSV ${filePath}:`, error);
    }
  }

  async ingestFromPdf(pdfBuffer: Buffer): Promise<{ imported: number; updated: number }> {
    // Extraer datos del PDF
    const rawRecords = await this.pdfExtractorService.extractFromPdf(pdfBuffer);
    
    // Guardar archivos raw (datos crudos)
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.saveJsonFile(rawRecords, path.join(dataDir, 'raw.json'));
    this.saveCsvFile(rawRecords, path.join(dataDir, 'raw.csv'));
    
    // Normalizar datos
    const normalizedRecords = this.pdfExtractorService.normalizeRecords(rawRecords);
    
    // Guardar archivos normalized (datos normalizados)
    this.saveJsonFile(normalizedRecords, path.join(dataDir, 'normalized.json'));
    this.saveCsvFile(normalizedRecords, path.join(dataDir, 'normalized.csv'));
    
    let imported = 0;
    let updated = 0;
    
    // Cargar datos de forma idempotente 
    for (const normalized of normalizedRecords) {
      const existing = await this.recordsRepository.findOne({
        where: { sourceId: normalized.sourceId },
      });
      
      // Crear fecha en hora local para evitar problemas de zona horaria
      const [year, month, day] = normalized.date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11
      
      if (existing) {
        // Actualizar registro existente
        await this.recordsRepository.update(existing.id, {
          date: dateObj,
          category: normalized.category,
          amount: normalized.amount,
          status: normalized.status,
          description: normalized.description,
        });
        updated++;
      } else {
        // Crear nuevo registro
        await this.recordsRepository.save({
          sourceId: normalized.sourceId,
          date: dateObj,
          category: normalized.category,
          amount: normalized.amount,
          status: normalized.status,
          description: normalized.description,
        });
        imported++;
      }
    }
    
    return { imported, updated };
  }
}

