import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  decimal,
  json,
} from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';

import { orderItems } from './orders.schema';
// 新增產品狀態枚舉
export const productStatusEnum = pgEnum('productStatus', [
  'active',
  'inactive',
  'out_of_stock',
  'discontinued',
]);

// 產品分類表格
export const productCategories = pgTable('productCategories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 產品表格
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => productCategories.id),
  name: text('name').notNull(),
  description: text('description'),
  sku: text('sku').notNull().unique(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  // 商品規格和其他屬性使用 JSON 類型儲存，方便擴充
  specifications: json('specifications'),
  status: productStatusEnum('status').default('active').notNull(),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  // 商品圖片網址陣列
  images: json('images').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productCategoriesRelations = relations(
  productCategories,
  ({ many }) => ({
    products: many(products),
  }),
);

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  orderItems: many(orderItems),
}));
