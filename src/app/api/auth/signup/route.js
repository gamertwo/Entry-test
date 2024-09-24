import { connectToDatabase, closeConnection } from '../../db/mongodb';
import { hash } from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const db = await connectToDatabase();
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists' }), { status: 400 });
    }

    const hashedPassword = await hash(password, 12);
    await db.collection('users').insertOne({ email, password: hashedPassword });

    return new Response(JSON.stringify({ message: 'User created successfully' }), { status: 201 });
  } catch (error) {
    console.error('Error in signup:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  } finally {
    await closeConnection();
  }
}
