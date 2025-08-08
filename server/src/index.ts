import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createUserInputSchema,
  updateUserInputSchema,
  createSubscriptionInputSchema,
  createContentInputSchema,
  updateContentInputSchema,
  getUserContentQuerySchema,
  getAnalyticsQuerySchema,
  subscriptionPlanSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { getUser } from './handlers/get_user';
import { updateUser } from './handlers/update_user';
import { createSubscription } from './handlers/create_subscription';
import { getSubscription } from './handlers/get_subscription';
import { getContentTemplates } from './handlers/get_content_templates';
import { createContent } from './handlers/create_content';
import { getUserContent } from './handlers/get_user_content';
import { updateContent } from './handlers/update_content';
import { scheduleContent } from './handlers/schedule_content';
import { getAnalytics, getAnalyticsSummary } from './handlers/get_analytics';
import { generateCaption } from './handlers/generate_caption';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  
  getUser: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getUser(input.id)),
  
  updateUser: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input }) => updateUser(input)),

  // Subscription management
  createSubscription: publicProcedure
    .input(createSubscriptionInputSchema)
    .mutation(({ input }) => createSubscription(input)),
  
  getSubscription: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getSubscription(input.userId)),

  // Content templates
  getContentTemplates: publicProcedure
    .input(z.object({ 
      category: z.string().optional(),
      isPremium: z.boolean().optional()
    }))
    .query(({ input }) => getContentTemplates(input.category, input.isPremium)),

  // Content management
  createContent: publicProcedure
    .input(createContentInputSchema)
    .mutation(({ input }) => createContent(input)),
  
  getUserContent: publicProcedure
    .input(getUserContentQuerySchema)
    .query(({ input }) => getUserContent(input)),
  
  updateContent: publicProcedure
    .input(updateContentInputSchema)
    .mutation(({ input }) => updateContent(input)),

  // Content scheduling
  scheduleContent: publicProcedure
    .input(z.object({
      contentId: z.number(),
      scheduledAt: z.coerce.date(),
      platforms: z.array(z.enum(['facebook', 'instagram', 'tiktok']))
    }))
    .mutation(({ input }) => scheduleContent(input.contentId, input.scheduledAt, input.platforms)),

  // Analytics
  getAnalytics: publicProcedure
    .input(getAnalyticsQuerySchema)
    .query(({ input }) => getAnalytics(input)),
  
  getAnalyticsSummary: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getAnalyticsSummary(input.userId)),

  // AI Features
  generateCaption: publicProcedure
    .input(z.object({
      contentType: z.string(),
      businessType: z.string(),
      customPrompt: z.string().optional()
    }))
    .mutation(({ input }) => generateCaption(input.contentType, input.businessType, input.customPrompt)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`KontenSiap TRPC server listening at port: ${port}`);
}

start();