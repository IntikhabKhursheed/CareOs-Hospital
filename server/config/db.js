const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dotenv.config();

// Global cached connection state
let isConnected = false;

const connectDB = async () => {
  // If already connected or connecting, do not initiate another connection
  if (isConnected || mongoose.connection.readyState >= 1) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.error('MONGODB_URI is not defined in environment variables');
      return;
    }

    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      console.error('Invalid MongoDB URI. It must start with mongodb:// or mongodb+srv://');
      return;
    }

    // Always attempt setting DNS servers to Google and Cloudflare to resolve SRV issues in Node.js
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      console.log('DNS servers configured successfully for SRV lookups');
    } catch (dnsErr) {
      console.warn('Failed to set custom DNS servers (handled gracefully):', dnsErr.message);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds
      family: 4,                       // Force IPv4 DNS resolution (crucial for Vercel/AWS serverless)
      socketTimeoutMS: 45000,          // Close sockets after 45 seconds of inactivity
      // keepAlive: true                  // Keep connection alive across serverless invocations
    });

    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Never crash the Vercel serverless container on startup
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
