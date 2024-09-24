import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://desiggnerweb:ar12w9umer@clusterentry.tliuo.mongodb.net/?retryWrites=true&w=majority&appName=ClusterEntry";
const client = new MongoClient(uri);

export async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    return client.db('habittracker');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export function closeConnection() {
  return client.close();
}
