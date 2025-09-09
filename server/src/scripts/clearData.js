const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://diwakar4311:Diwa%4063071@cluster0.vndwzuo.mongodb.net/mosaic-project?retryWrites=true&w=majority&appName=Cluster0';

async function clearAllData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Found collections:', collections.map(c => c.name));

    // Clear data from each collection while keeping schema
    for (const collection of collections) {
      const collectionName = collection.name;
      const result = await db.collection(collectionName).deleteMany({});
      console.log(`🗑️  Cleared ${result.deletedCount} documents from ${collectionName}`);
    }

    console.log('✨ All data cleared successfully! Schema and structure intact.');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

clearAllData();
