import { z } from 'zod';
export const ArticleBlockSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['paragraph','heading','image','gallery','video','audio','quote','pullQuote','infobox','timeline','table','embed','map','sourceCard','relatedStory','poll','chart','keyFacts','warning','interactive']),
  data: z.record(z.string(), z.any()),
});
export const ArticleInputSchema = z.object({
  storyId: z.string().min(1), title: z.string().min(3), slug: z.string().min(3), subtitle: z.string().optional(), summary: z.string().optional(), lead: z.string().optional(),
  body: z.object({blocks:z.array(ArticleBlockSchema)}), language: z.string().default('fa'), sectionId: z.string().optional(), categoryId: z.string().optional(), locationId: z.string().optional(),
  priority: z.enum(['LOW','NORMAL','HIGH','URGENT']).default('NORMAL'), seo: z.record(z.string(),z.any()).optional(), social: z.record(z.string(),z.any()).optional(),
});
export type ArticleInput = z.infer<typeof ArticleInputSchema>;
