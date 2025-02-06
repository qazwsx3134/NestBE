import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  decimal,
  json,
  boolean,
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';

import { orders } from './orders.schema';
import { users } from './users.schema';

export const couponTypeEnum = pgEnum('couponType', [
  'percentage',
  'fixed_amount',
  'free_shipping',
]);

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  type: couponTypeEnum('type').notNull(),
  // 優惠金額或百分比
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  // 最低消費門檻
  minimumPurchase: decimal('minimum_purchase', { precision: 10, scale: 2 }),
  // 最大折扣金額（針對百分比折扣）
  maximumDiscount: decimal('maximum_discount', { precision: 10, scale: 2 }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  // 優惠券使用次數限制
  usageLimit: integer('usage_limit'),
  // 目前使用次數
  usageCount: integer('usage_count').default(0).notNull(),
  // 是否啟用
  isActive: boolean('is_active').default(true).notNull(),
  // 優惠券描述
  description: text('description'),
  // 適用產品類別（null 表示全部適用）
  applicableCategories: json('applicable_categories').$type<number[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const couponUsages = pgTable('couponUsages', {
  id: serial('id').primaryKey(),
  couponId: integer('coupon_id')
    .references(() => coupons.id)
    .notNull(),
  orderId: integer('order_id')
    .references(() => orders.id)
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  // 實際優惠金額
  discountAmount: decimal('discountAmount', {
    precision: 10,
    scale: 2,
  }).notNull(),
  usedAt: timestamp('used_at').defaultNow().notNull(),
});

export const couponsRelations = relations(coupons, ({ many }) => ({
  usages: many(couponUsages),
}));

export const couponUsagesRelations = relations(couponUsages, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponUsages.couponId],
    references: [coupons.id],
  }),
  order: one(orders, {
    fields: [couponUsages.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [couponUsages.userId],
    references: [users.id],
  }),
}));
