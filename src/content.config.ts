import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const accent = z.enum(['primary', 'warning', 'success', 'error']);

const info = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/info' }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    location: z.string(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    accent: accent.default('warning'),
    excerpt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const career = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/career' }),
  schema: z.object({
    role: z.string(),
    org: z.string(),
    orgUrl: z.string().url().optional(),
    dateLabel: z.string(),
    order: z.number(),
    accent: accent.default('success'),
  }),
});

export const collections = { info, blog, career };
