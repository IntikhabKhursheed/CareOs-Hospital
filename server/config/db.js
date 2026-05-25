const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dotenv.config();

const connectDB = async () => {
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

    // Attempt to set DNS servers to Google and Cloudflare to resolve MongoDB SRV cluster lookups (ECONNREFUSED)
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      console.log('DNS servers configured successfully for SRV lookups');
    } catch (dnsErr) {
      console.warn('Failed to set custom DNS servers (this is normal in some serverless environments):', dnsErr.message);
    }

    // Connect without blocking / crashing the serverless instance on failure
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000 // 15 seconds is better than 30 for Vercel timeout limits
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // Never call process.exit(1) on Vercel as it crashes the entire serverless container
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
