import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    // Crear usuario por defecto si no existe
    this.createDefaultUser();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  private async createDefaultUser() {
    const defaultEmail = 'admin@test.com';
    const defaultPassword = 'admin123';
    
    const existingUser = await this.findByEmail(defaultEmail);
    if (!existingUser) {
      await this.create(defaultEmail, defaultPassword);
      console.log('Usuario por defecto creado:', defaultEmail);
    }
  }
}




