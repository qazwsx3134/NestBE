import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { DrizzleDB } from 'src/drizzle/types/drizzle';
import { userAuth, users } from 'src/drizzle/schema/users.schema';
import { and, asc, eq, getTableColumns, SQL, sql } from 'drizzle-orm';
import { verify } from 'argon2';
import { PgTable } from 'drizzle-orm/pg-core';

const buildConflictUpdateColumns = <
  T extends PgTable,
  Q extends keyof T['_']['columns'],
>(
  table: T,
  columns: Q[],
) => {
  const cls = getTableColumns(table);
  return columns.reduce(
    (acc, column) => {
      const colName = cls[column].name;
      acc[column] = sql.raw(`excluded.${colName}`);
      return acc;
    },
    {} as Record<Q, SQL>,
  );
};

const MAX_SESSION = 1;
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
    return this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, id));
  }

  async userAuthFindOne(id: number) {
    // const cc = await this.db.query.userAuth.findFirst({
    //   where: (userAuth, { eq }) => eq(userAuth.userId, id),
    // });
    const result = await this.db
      .select({
        id: userAuth.id,
        refreshToken: userAuth.refreshToken,
      })
      .from(userAuth)
      .where(eq(userAuth.userId, id));

    return result[0];
  }

  async userAuthTokenFindOne(id: number, refreshToken: string) {
    // const cc = await this.db.query.userAuth.findFirst({
    //   where: (userAuth, { eq }) => eq(userAuth.userId, id),
    // });
    const result = await this.db
      .select({
        id: userAuth.id,
        refreshToken: userAuth.refreshToken,
      })
      .from(userAuth)
      .where(
        and(eq(userAuth.userId, id), eq(userAuth.refreshToken, refreshToken)),
      );

    return result[0];
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async insertRefreshToken(userId: number, refreshToken: string) {
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + 7); // 例如：設置 7 天後過期

    const value = await this.db.insert(userAuth).values({
      userId,
      refreshToken,
      expiredAt,
    });

    // 限制最多 5 個 `refreshToken`
    const existingTokens = await this.db
      .select({ id: userAuth.id })
      .from(userAuth)
      .where(eq(userAuth.userId, userId))
      .orderBy(asc(userAuth.expiredAt)); // 由舊到新排序

    if (existingTokens.length > MAX_SESSION) {
      await this.db
        .delete(userAuth)
        .where(eq(userAuth.id, existingTokens[0].id)); // 刪除最舊的 `refreshToken`
    }

    return value;
  }

  async updateRefreshToken(
    userId: number,
    oldRefreshToken: string,
    refreshToken: string,
  ) {
    return await this.db
      .update(userAuth)
      .set({ refreshToken })
      .where(
        and(
          eq(userAuth.userId, userId),
          eq(userAuth.refreshToken, oldRefreshToken),
        ),
      );
  }
}
