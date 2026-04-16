import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

const publicSelect = { id: true, email: true, name: true, createdAt: true } as const;

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  findAllPublic() {
    return this.prisma.user.findMany({ select: publicSelect, orderBy: { id: 'desc' } });
  }

  findByIdPublic(id: number) {
    return this.prisma.user.findUnique({ where: { id }, select: publicSelect });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(data: { email: string; name?: string; passwordHash: string }) {
    return this.prisma.user.create({ data, select: publicSelect });
  }
}
