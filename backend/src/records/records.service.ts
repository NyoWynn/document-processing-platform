import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from '../entities/record.entity';
import { PdfExtractorService } from '../services/pdf-extractor.service';
import * as path from 'path';

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

  async ingestFromPdf(pdfBuffer: Buffer): Promise<{ imported: number; updated: number }> {
    // datos del PDF
    const rawRecords = await this.pdfExtractorService.extractFromPdf(pdfBuffer);
    
    // Normalizar 
    const normalizedRecords = this.pdfExtractorService.normalizeRecords(rawRecords);
    
    let imported = 0;
    let updated = 0;
    
    // Cargar datos de forma idempotente 
    for (const normalized of normalizedRecords) {
      const existing = await this.recordsRepository.findOne({
        where: { sourceId: normalized.sourceId },
      });
      
      // Crear fecha en hora local para evitar problemas de zona horaria
    
      const [year, month, day] = normalized.date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day); // month - 1 
      
      if (existing) {
        // Actualizar registro 
        await this.recordsRepository.update(existing.id, {
          date: dateObj,
          category: normalized.category,
          amount: normalized.amount,
          status: normalized.status,
          description: normalized.description,
        });
        updated++;
      } else {
        //  nuevo registro
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

