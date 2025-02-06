import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';
import { comments } from './comments.schema';
import { posts } from './posts.schema';
import { profileInfo } from './profileInfo.schema';
import { usersToGroups } from './groups.schema';
import { orders } from './orders.schema';

// 會員狀態枚舉
export const userStatusEnum = pgEnum('userStatus', [
  'active',
  'inactive',
  'suspended',
]);

export const userStatusValue = userStatusEnum.enumValues;

export type UserStatusEnum = (typeof userStatusValue)[number];

// 會員資料表
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  // 使用 TEXT 而非 VARCHAR，因為在 PostgreSQL 中兩者性能相同，且 TEXT 更靈活
  email: text('email').notNull().unique(),
  // 密碼雜湊值通常是固定長度，但使用 TEXT 可以適應未來可能的加密方式變更
  password: text('password').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone'),
  status: userStatusEnum('status').default('active').notNull(),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 會員認證資料表
export const userAuth = pgTable('user_auth', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  // refresh token 的長度可能會隨認證方式改變，使用 TEXT 更有彈性
  refreshToken: text('refresh_token'),
  lastLogin: timestamp('last_login'),
  failedAttempts: integer('failed_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  userAuth: many(userAuth),
  orders: many(orders),
  comments: many(comments),
  posts: many(posts),
  profile: one(profileInfo, {
    fields: [users.id],
    references: [profileInfo.userId],
  }),
  usersToGroups: many(usersToGroups),
}));

export const userAuthRelations = relations(userAuth, ({ one }) => ({
  user: one(users, {
    fields: [userAuth.userId],
    references: [users.id],
  }),
}));
