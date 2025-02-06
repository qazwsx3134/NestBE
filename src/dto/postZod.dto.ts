import { z } from 'zod';

export const createPostZodSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  authorId: z.number(),
});

// dto stands for data transfer object
export type CreatePostZodDto = z.infer<typeof createPostZodSchema>;

export const updatePostZodSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  authorId: z.number(),
});

export type UpdatePostZodDto = z.infer<typeof updatePostZodSchema>;
