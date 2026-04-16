import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly posts: PostsRepository) {}

  listPublic() {
    return this.posts.listPublic();
  }

  listMine(authorId: number) {
    return this.posts.listByAuthor(authorId);
  }

  async findOne(id: number) {
    const post = await this.posts.findById(id);
    if (!post) throw new NotFoundException('post not found');
    return post;
  }

  create(authorId: number, dto: CreatePostDto) {
    return this.posts.create(authorId, dto);
  }

  async update(authorId: number, id: number, dto: UpdatePostDto) {
    await this.assertOwner(authorId, id);
    return this.posts.update(id, dto);
  }

  async remove(authorId: number, id: number) {
    await this.assertOwner(authorId, id);
    await this.posts.delete(id);
    return { ok: true };
  }

  private async assertOwner(authorId: number, id: number) {
    const post = await this.posts.findOwnerId(id);
    if (!post) throw new NotFoundException('post not found');
    if (post.authorId !== authorId) throw new ForbiddenException('not your post');
  }
}
