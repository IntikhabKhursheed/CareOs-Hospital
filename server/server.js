const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
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
const socketHandler = require('./socket/socketHandler');

dotenv.config();

const app = express();

app.set('trust proxy', 1);

// Shared CORS options — used by middleware, preflight, and Socket.io
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};

// CORS must be the very first middleware so preflight (OPTIONS) requests
// are handled before helmet or any other middleware can interfere
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Helmet configured to not override cross-origin resource policy set by CORS
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Socket.io — only active outside of Vercel (serverless doesn't support persistent sockets)
const server = http.createServer(app);
let io = null;

if (process.env.VERCEL !== '1') {
  io = new Server(server, { cors: corsOptions });
  app.set('io', io);
}

connectDB();
app.set('io', io);

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

// Auth routes are exempt from the rate limiter
app.use('/api/auth', authRoutes);
app.use(limiter);

app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/tests', testCatalogRoutes);
app.use('/api/lab-requests', labTestRequestRoutes);
app.use('/api/lab-orders', require('./routes/labOrderRoutes'));
app.use('/api/ai', aiRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/billing', billingRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'CareOS API Running' });
});

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found', data: null });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    data: err.data || null,
  });
});

if (process.env.VERCEL !== '1') {
  socketHandler(io);
  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => {
    console.log(`CareOS server running on port ${PORT}`);
  });
}

module.exports = app;
