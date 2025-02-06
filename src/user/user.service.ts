import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import { users } from 'src/drizzle/schema/users.schema';

@Injectable()
export class UserService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DrizzleDB) {}
  async create(createUserDto: CreateUserDto) {
    // Hash password
    const { password, ...rest } = createUserDto;

    const user = await this.db
      .insert(users)
      .values({
        ...rest,
        password: await bcrypt.hash(password, 10),
      })
      .returning();

    // console.log(user);
    return 'This action adds a new user';
  }

  findOneByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
  }
  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
