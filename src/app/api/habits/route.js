import { ObjectId } from 'mongodb';
import { connectToDatabase, closeConnection } from '../db/mongodb';

export async function GET() {
  let database;
  try {
    database = await connectToDatabase();
    const habits = await database.collection('habits').find({}).toArray();
    return new Response(JSON.stringify(habits), { status: 200 });
  } catch (error) {
    console.error('Error in GET request:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  } finally {
    await closeConnection();
  }
}

export async function POST(request) {
  let database;
  try {
    const habit = await request.json();
    database = await connectToDatabase();
    const result = await database.collection('habits').insertOne(habit);
    return new Response(JSON.stringify({ 
      insertedId: result.insertedId,
      habit: { ...habit, _id: result.insertedId }
    }), { status: 201 });
  } catch (error) {
    console.error('Error in POST request:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  } finally {
    await closeConnection();
  }
}

export async function PUT(request) {
  let database;
  try {
    const { id, completedDates } = await request.json();
    database = await connectToDatabase();
    await database.collection('habits').updateOne(
      { _id: new ObjectId(id) },
      { $set: { completedDates } }
    );
    return new Response(JSON.stringify({ message: 'Habit updated successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error in PUT request:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  } finally {
    await closeConnection();
  }
}

export async function DELETE(request) {
  let database;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    database = await connectToDatabase();
    await database.collection('habits').deleteOne({ _id: new ObjectId(id) });
    return new Response(JSON.stringify({ message: 'Habit deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error in DELETE request:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  } finally {
    await closeConnection();
  }
}
