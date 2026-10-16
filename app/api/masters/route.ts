import { dbInstance } from '../../../server/db';

export async function GET() {
  return Response.json({
    categories: dbInstance.categories,
    species: dbInstance.species,
    treatments: dbInstance.treatments,
    roofStyles: dbInstance.roofStyles,
    homeTypes: dbInstance.homeTypes,
    storageProviders: dbInstance.storageProviders
  });
}
