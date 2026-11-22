import { z } from 'zod';

export const ComplaintSchema = z.object({
  category: z.enum(['delivery', 'return', 'product', 'payment', 'other']),
  urgency: z.enum(['low', 'medium', 'high']),
  summary: z.string().min(1).max(200),
  needs_human: z.boolean(),
});