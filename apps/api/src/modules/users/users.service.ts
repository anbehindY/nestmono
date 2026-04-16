import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  findAll() {
    return this.users.findAllPublic();
  }

  async findById(id: number) {
    const user = await this.users.findByIdPublic(id);
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  findByEmail(email: string) {
    return this.users.findByEmail(email);
  }

  create(data: { email: string; name?: string; passwordHash: string }) {
    return this.users.create(data);
  }
}
