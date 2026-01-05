import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Record } from '../entities/record.entity';
import { User } from '../users/user.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Contraseña vacía por defecto (Laragon)
  database: process.env.DB_NAME || 'test_programacion',
  entities: [Record, User],
  synchronize: process.env.NODE_ENV !== 'production', // true en desarrollo, false en producción
  logging: process.env.NODE_ENV === 'development',
};

