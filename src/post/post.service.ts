import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdatePostDto } from './dto/update-post.dto';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import { posts } from 'src/drizzle/schema/posts.schema';
import { eq } from 'drizzle-orm';
import { PaginationDTO } from './dto/pagination.dto';
import { DEFAULT_PAGE_SIZE } from 'src/utils/constants';

@Injectable()
export class PostService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DrizzleDB) {}
  create(createPostDto: typeof posts.$inferInsert) {
    return this.db.insert(posts).values(createPostDto);
  }

  async findAll(paginationDto: PaginationDTO) {
    console.log('cc', paginationDto);

    // return await this.db.select().from(posts);
    return await this.db.query.posts.findMany({
      with: {
        author: {
          with: {
            usersToGroups: {
              with: {
                group: true,
              },
            },
          },
        },
      },
      limit: paginationDto.limit ?? DEFAULT_PAGE_SIZE,
      offset: paginationDto.offset >= 0 ? paginationDto.offset : 0,
    });
  }

  async findOne(id: number) {
    const post = await this.db.query.posts.findMany({
      where: (posts, { eq }) => eq(posts.id, id),
      with: {
        author: {
          with: {
            usersToGroups: {
              with: {
                group: true,
              },
            },
          },
        },
      },
    });

    if (post.length <= 0) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    return await this.db
      .update(posts)
      .set(updatePostDto)
      .where(eq(posts.id, id));
  }

  async remove(id: number) {
    return await this.db.delete(posts).where(eq(posts.id, id));
  }
}
