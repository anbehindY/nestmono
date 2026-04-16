import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const authorSelect = { id: true, email: true, name: true } as const;
const likeCount = { select: { likes: true } } as const;

@Injectable()
export class PostsRepository {
  constructor(private prisma: PrismaService) {}

  listPublic() {
    return this.prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: authorSelect },
        _count: likeCount,
      },
    });
  }

  listByAuthor(authorId: number) {
    return this.prisma.post.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
      include: { _count: likeCount },
    });
  }

  findById(id: number) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: authorSelect },
        _count: likeCount,
      },
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

  async like(userId: number, postId: number) {
    await this.prisma.like.upsert({
      where: { userId_postId: { userId, postId } },
      update: {},
      create: { userId, postId },
    });
  }

  async unlike(userId: number, postId: number) {
    await this.prisma.like.deleteMany({ where: { userId, postId } });
  }

  countLikes(postId: number) {
    return this.prisma.like.count({ where: { postId } });
  }
}
