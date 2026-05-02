# CareOS - Hospital Management System

A comprehensive, full-stack hospital management system built with modern web technologies. This application streamlines hospital operations with AI-powered clinical assistance, real-time communication, and role-based access control.

## 🚀 Features

### Phase 1: Core Infrastructure
- **Authentication System**: JWT-based login with role-based access control
- **Patient Management**: Complete CRUD operations for patient records
- **Appointment System**: Schedule and manage patient appointments
- **Real-time Communication**: Socket.io integration for live updates

### Phase 2: Enhanced Dashboard & Operations
- **Admin Dashboard**: Comprehensive hospital metrics and KPIs
- **Real-time Updates**: Live notifications for appointments and critical events
- **Role-based Navigation**: Dynamic UI based on user roles (Admin, Doctor, Nurse, Patient)

### Phase 3: Advanced Modules & AI Integration
- **AI-Powered Clinical Assistance**: Groq AI integration for:
  - Clinical note generation
  - Diagnosis suggestions
  - Drug interaction checking
  - Lab result interpretation
- **Doctor Consultation Screen**: AI-assisted medical consultations
- **Lab Management Module**: Complete lab workflow with critical value alerts
- **Billing System**: Invoice generation with PDF export
- **Patient Portal**: Self-service access for patients
- **Mobile Responsive Design**: Optimized for all devices
- **Toast Notifications**: User-friendly feedback system
- **Loading States**: Skeleton screens for better UX

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Socket.io-client** for real-time features
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time communication
- **PDFKit** for document generation
- **Groq AI** for clinical assistance

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/careos.git
cd careos
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careos
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔐 Default Users

The application includes sample users for testing:

- **Admin**: admin@careos.com / admin123
- **Doctor**: doctor@careos.com / doctor123
- **Patient**: patient@careos.com / patient123

## 📁 Project Structure

```
careos/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── context/        # React context providers
│   │   └── routes/         # Route protection
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic services
│   ├── socket/            # Socket.io handlers
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id/status` - Update appointment status

### AI Services
- `POST /api/ai/clinical-note` - Generate clinical notes
- `POST /api/ai/diagnosis` - Suggest diagnosis
- `POST /api/ai/drug-interaction` - Check drug interactions
- `POST /api/ai/interpret-lab` - Interpret lab results

### Lab Management
- `GET /api/lab/queue` - Get lab queue
- `POST /api/lab` - Create lab order
- `POST /api/lab/:id/results` - Update lab results
- `POST /api/lab/:id/verify` - Verify lab results

### Billing
- `POST /api/billing` - Generate bill
- `GET /api/billing` - Get bills
- `POST /api/billing/:id/payment` - Add payment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- AI integration powered by Groq
- Real-time features using Socket.io
- Responsive design with Tailwind CSS

---

**CareOS** - Revolutionizing hospital management with technology and AI.