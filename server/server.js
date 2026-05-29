const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const labRoutes = require('./routes/labRoutes');
const billingRoutes = require('./routes/billingRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const testCatalogRoutes = require('./routes/testCatalogRoutes');
const labTestRequestRoutes = require('./routes/labTestRequestRoutes');
const labOrderRoutes = require('./routes/labOrderRoutes');
const socketHandler = require('./socket/socketHandler');

dotenv.config();

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://careos-hospital-client.vercel.app',
];

const isAllowedVercelPreview = (origin) => {
  return /^https:\/\/careos-hospital-client-[a-z0-9-]+-vertax\.vercel\.app$/.test(origin);
};

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || isAllowedVercelPreview(origin)) {
      return callback(null, true);
    }

    console.error('Blocked by CORS:', origin);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const server = http.createServer(app);
let io = null;

if (process.env.VERCEL !== '1') {
  io = new Server(server, {
    cors: corsOptions,
  });

  app.set('io', io);
  socketHandler(io);
} else {
  app.set('io', null);
}

// Start initial MongoDB connection, but do not block Vercel startup
connectDB().catch((error) => {
  console.error('Initial MongoDB connection error:', error.message);
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API healthy',
    dbState: mongoose.connection.readyState,
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CareOS API Running',
    dbState: mongoose.connection.readyState,
  });
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    data: null,
  },
});

// Ensure MongoDB is connected before any API route runs
app.use('/api', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    next();
  } catch (error) {
    console.error('Database middleware error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      data: error.message,
    });
  }
});

app.use('/api/auth', authRoutes);

app.use(limiter);

app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/tests', testCatalogRoutes);
app.use('/api/lab-requests', labTestRequestRoutes);
app.use('/api/lab-orders', labOrderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/billing', billingRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null,
  });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    data: err.data || null,
  });
});

if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`CareOS server running on port ${PORT}`);
  });
}

module.exports = app;