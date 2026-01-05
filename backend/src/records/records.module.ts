import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from '../entities/record.entity';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { PdfExtractorService } from '../services/pdf-extractor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Record])],
  controllers: [RecordsController],
  providers: [RecordsService, PdfExtractorService],
})
export class RecordsModule {}

