import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateRecordDto {
  @IsString()
  @MinLength(1)
  sourceId: string;

  @IsDateString()
  date: string;

  @IsString()
  @MinLength(1)
  category: string;

  @IsNumber()
  amount: number;

  @IsString()
  @MinLength(1)
  status: string;

  @IsString()
  @IsOptional()
  description?: string;
}




