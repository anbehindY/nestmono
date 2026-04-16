import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const authorSelect = { id: true, email: true, name: true } as const;

@Injectable()
export class PostsRepository {
  constructor(private prisma: PrismaService) {}

  listPublic() {
    return this.prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: authorSelect } },
    });
  }

  listByAuthor(authorId: number) {
    return this.prisma.post.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: number) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { author: { select: authorSelect } },
    });
  }

  findOwnerId(id: number) {
    return this.prisma.post.findUnique({ where: { id }, select: { authorId: true } });
  }

  create(authorId: number, data: CreatePostDto) {
    return this.prisma.post.create({ data: { ...data, authorId } });
  }

  update(id: number, data: UpdatePostDto) {
    return this.prisma.post.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.post.delete({ where: { id } });
  }
}
