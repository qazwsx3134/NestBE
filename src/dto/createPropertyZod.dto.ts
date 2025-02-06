import { z } from 'zod';

export const createPropertyZodSchema = z
  .object({
    name: z.string().min(3),
    description: z.string().min(5),
    area: z.number().positive(),
  })
  .required();

// dto stands for data transfer object
export type CreatePropertyZodDto = z.infer<typeof createPropertyZodSchema>;
