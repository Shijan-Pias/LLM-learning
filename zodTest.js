import { ComplaintSchema } from './schemas.js';

const samples = [
  { category: 'delivery', urgency: 'high', summary: 'Late order', needs_human: true },
  { category: 'shipping', urgency: 'high', summary: 'Late order', needs_human: true },
  { category: 'delivery', urgency: 'high', summary: 'Late order' },
  { category: 'delivery', urgency: 'urgent', summary: '', needs_human: 'yes' },
];

for (const s of samples) {
  const result = ComplaintSchema.safeParse(s);
  if (result.success) {
    console.log('OK:', result.data);
  } else {
    console.log('FAIL:', result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`));
  }
}