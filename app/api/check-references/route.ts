import { dbInstance } from '../../../server/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  if (!type || !id) {
    return Response.json({ message: 'Missing type or id' }, { status: 400 });
  }

  const result = dbInstance.checkEntityReferences(type, id);
  return Response.json(result);
}
