const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri);

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;


// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const dns = require('dns');

// dotenv.config();

// const connectDB = async () => {
//   try {
//     const uri = process.env.MONGODB_URI;
//     if (!uri) {
//       throw new Error('MONGODB_URI is not defined in environment variables');
//     }

//     const dnsServers = (process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1')
//       .split(',')
//       .map((server) => server.trim())
//       .filter(Boolean);

//     if (dnsServers.length) {
//       dns.setServers(dnsServers);
//       console.log('Using DNS servers:', dnsServers.join(', '));
//     }

//     await mongoose.connect(uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//     console.log('MongoDB connected successfully');
//   } catch (error) {
//     console.error('MongoDB connection failed:', error.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
