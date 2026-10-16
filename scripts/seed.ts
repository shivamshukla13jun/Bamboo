import { seedDatabase } from '../src/lib/seed';
import mongoose from 'mongoose';

async function main() {
  await seedDatabase();
  console.log('Bamboorise database seeded successfully.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
