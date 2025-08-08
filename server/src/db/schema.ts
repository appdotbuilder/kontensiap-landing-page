import { serial, text, pgTable, timestamp, integer, boolean, pgEnum, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['free', 'premium', 'business']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'cancelled', 'expired']);
export const contentStatusEnum = pgEnum('content_status', ['draft', 'scheduled', 'posted', 'failed']);
export const platformEnum = pgEnum('platform', ['facebook', 'instagram', 'tiktok']);
export const templateTypeEnum = pgEnum('template_type', ['design', 'caption', 'full']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  business_type: text('business_type'), // nullable
  business_name: text('business_name'), // nullable
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Subscriptions table
export const subscriptionsTable = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  plan: subscriptionPlanEnum('plan').notNull(),
  status: subscriptionStatusEnum('status').notNull().default('active'),
  content_limit: integer('content_limit').notNull(), // 5 for free, 30 for premium, 90 for business
  current_usage: integer('current_usage').notNull().default(0),
  starts_at: timestamp('starts_at').defaultNow().notNull(),
  ends_at: timestamp('ends_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Content templates table
export const contentTemplatesTable = pgTable('content_templates', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(), // e.g., "menu", "promo", "testimoni"
  template_type: templateTypeEnum('template_type').notNull(),
  content_data: text('content_data').notNull(), // JSON string containing template data
  preview_url: text('preview_url'), // nullable
  is_premium: boolean('is_premium').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// User content table (generated/customized content)
export const userContentTable = pgTable('user_content', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  template_id: integer('template_id').references(() => contentTemplatesTable.id), // nullable
  title: text('title').notNull(),
  caption: text('caption'), // nullable
  hashtags: text('hashtags'), // nullable
  image_url: text('image_url'), // nullable
  scheduled_at: timestamp('scheduled_at'), // nullable
  posted_at: timestamp('posted_at'), // nullable
  status: contentStatusEnum('status').notNull().default('draft'),
  platforms: json('platforms').$type<('facebook' | 'instagram' | 'tiktok')[]>().notNull().default([]),
  engagement_stats: text('engagement_stats'), // nullable JSON string for likes, shares, etc.
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Analytics table for tracking content performance
export const analyticsTable = pgTable('analytics', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  content_id: integer('content_id').notNull().references(() => userContentTable.id),
  platform: platformEnum('platform').notNull(),
  likes: integer('likes').notNull().default(0),
  shares: integer('shares').notNull().default(0),
  comments: integer('comments').notNull().default(0),
  reach: integer('reach').notNull().default(0),
  recorded_at: timestamp('recorded_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(usersTable, ({ one, many }) => ({
  subscription: one(subscriptionsTable),
  content: many(userContentTable),
  analytics: many(analyticsTable),
}));

export const subscriptionsRelations = relations(subscriptionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [subscriptionsTable.user_id],
    references: [usersTable.id],
  }),
}));

export const contentTemplatesRelations = relations(contentTemplatesTable, ({ many }) => ({
  userContent: many(userContentTable),
}));

export const userContentRelations = relations(userContentTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [userContentTable.user_id],
    references: [usersTable.id],
  }),
  template: one(contentTemplatesTable, {
    fields: [userContentTable.template_id],
    references: [contentTemplatesTable.id],
  }),
  analytics: many(analyticsTable),
}));

export const analyticsRelations = relations(analyticsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [analyticsTable.user_id],
    references: [usersTable.id],
  }),
  content: one(userContentTable, {
    fields: [analyticsTable.content_id],
    references: [userContentTable.id],
  }),
}));

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Subscription = typeof subscriptionsTable.$inferSelect;
export type NewSubscription = typeof subscriptionsTable.$inferInsert;
export type ContentTemplate = typeof contentTemplatesTable.$inferSelect;
export type NewContentTemplate = typeof contentTemplatesTable.$inferInsert;
export type UserContent = typeof userContentTable.$inferSelect;
export type NewUserContent = typeof userContentTable.$inferInsert;
export type Analytics = typeof analyticsTable.$inferSelect;
export type NewAnalytics = typeof analyticsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  users: usersTable,
  subscriptions: subscriptionsTable,
  contentTemplates: contentTemplatesTable,
  userContent: userContentTable,
  analytics: analyticsTable,
};