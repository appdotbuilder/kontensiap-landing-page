import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  business_type: z.string().nullable(), // e.g., "warung", "kafe", "catering"
  business_name: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;

// Subscription plans enum
export const subscriptionPlanSchema = z.enum(['free', 'premium', 'business']);
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;

// Subscription schema
export const subscriptionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  plan: subscriptionPlanSchema,
  status: z.enum(['active', 'cancelled', 'expired']),
  content_limit: z.number().int(), // 5 for free, 30 for premium, 90 for business
  current_usage: z.number().int().default(0),
  starts_at: z.coerce.date(),
  ends_at: z.coerce.date(),
  created_at: z.coerce.date(),
});

export type Subscription = z.infer<typeof subscriptionSchema>;

// Content template schema
export const contentTemplateSchema = z.object({
  id: z.number(),
  title: z.string(),
  category: z.string(), // e.g., "menu", "promo", "testimoni"
  template_type: z.enum(['design', 'caption', 'full']),
  content_data: z.string(), // JSON string containing template data
  preview_url: z.string().nullable(),
  is_premium: z.boolean().default(false),
  created_at: z.coerce.date(),
});

export type ContentTemplate = z.infer<typeof contentTemplateSchema>;

// User content (generated/customized content)
export const userContentSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  template_id: z.number().nullable(),
  title: z.string(),
  caption: z.string().nullable(),
  hashtags: z.string().nullable(),
  image_url: z.string().nullable(),
  scheduled_at: z.coerce.date().nullable(),
  posted_at: z.coerce.date().nullable(),
  status: z.enum(['draft', 'scheduled', 'posted', 'failed']),
  platforms: z.array(z.enum(['facebook', 'instagram', 'tiktok'])).default([]),
  engagement_stats: z.string().nullable(), // JSON string for likes, shares, etc.
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type UserContent = z.infer<typeof userContentSchema>;

// Analytics/Statistics schema
export const analyticsSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  content_id: z.number(),
  platform: z.enum(['facebook', 'instagram', 'tiktok']),
  likes: z.number().int().default(0),
  shares: z.number().int().default(0),
  comments: z.number().int().default(0),
  reach: z.number().int().default(0),
  recorded_at: z.coerce.date(),
});

export type Analytics = z.infer<typeof analyticsSchema>;

// Input schemas for creating records
export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  business_type: z.string().nullable(),
  business_name: z.string().nullable(),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createSubscriptionInputSchema = z.object({
  user_id: z.number(),
  plan: subscriptionPlanSchema,
  starts_at: z.coerce.date().optional(),
  ends_at: z.coerce.date().optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionInputSchema>;

export const createContentInputSchema = z.object({
  user_id: z.number(),
  template_id: z.number().nullable(),
  title: z.string().min(1),
  caption: z.string().nullable(),
  hashtags: z.string().nullable(),
  scheduled_at: z.coerce.date().nullable(),
  platforms: z.array(z.enum(['facebook', 'instagram', 'tiktok'])).default([]),
});

export type CreateContentInput = z.infer<typeof createContentInputSchema>;

// Update schemas
export const updateUserInputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  business_type: z.string().nullable().optional(),
  business_name: z.string().nullable().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const updateContentInputSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  caption: z.string().nullable().optional(),
  hashtags: z.string().nullable().optional(),
  scheduled_at: z.coerce.date().nullable().optional(),
  platforms: z.array(z.enum(['facebook', 'instagram', 'tiktok'])).optional(),
  status: z.enum(['draft', 'scheduled', 'posted', 'failed']).optional(),
});

export type UpdateContentInput = z.infer<typeof updateContentInputSchema>;

// Query schemas
export const getUserContentQuerySchema = z.object({
  user_id: z.number(),
  status: z.enum(['draft', 'scheduled', 'posted', 'failed']).optional(),
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

export type GetUserContentQuery = z.infer<typeof getUserContentQuerySchema>;

export const getAnalyticsQuerySchema = z.object({
  user_id: z.number(),
  content_id: z.number().optional(),
  platform: z.enum(['facebook', 'instagram', 'tiktok']).optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

export type GetAnalyticsQuery = z.infer<typeof getAnalyticsQuerySchema>;