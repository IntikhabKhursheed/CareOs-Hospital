const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dotenv.config();

let cachedConnection = null;
let connectionPromise = null;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB URI. It must start with mongodb:// or mongodb+srv://');
    }

    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log('Using existing MongoDB connection');
      return cachedConnection;
    }

    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      cachedConnection = mongoose.connection;
      return cachedConnection;
    }

    if (connectionPromise) {
      console.log('MongoDB connection already in progress, waiting...');
      cachedConnection = await connectionPromise;
      return cachedConnection;
    }

    try {
      dns.setDefaultResultOrder('ipv4first');
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      console.log('DNS configured successfully for MongoDB SRV lookups');
    } catch (dnsErr) {
      console.warn('Failed to configure DNS, continuing:', dnsErr.message);
    }

    console.log('Connecting to MongoDB Atlas...');

    connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4,
      maxPoolSize: 10,
      bufferCommands: false,
    });

    cachedConnection = await connectionPromise;

    console.log('MongoDB connected successfully');

    return cachedConnection;
  } catch (error) {
    connectionPromise = null;
    cachedConnection = null;

    console.error('MongoDB connection failed:', error.message);

    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }

    throw error;
  }
};

module.exports = connectDB;