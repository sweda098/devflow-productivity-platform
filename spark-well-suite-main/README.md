# Devflow

A comprehensive wellness and productivity platform designed specifically for developers to track their health, manage tasks, and maintain work-life balance.

## Features

- **Journal**: Daily task management and reflection
- **Health Tracking**: Monitor health metrics and wellness indicators
- **Analytics**: Data-driven insights into productivity patterns
- **Standup Reports**: Daily standup meeting management
- **Insights**: AI-powered recommendations and analytics
- **Authentication**: Secure user authentication with JWT

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- ShadCN UI components
- Tailwind CSS for styling
- React Router for navigation
- TanStack Query for data fetching
- Axios for API calls

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# PORT=5000
# JWT_SECRET=your_jwt_secret
# MONGODB_URI=mongodb://localhost:27017/devflowdb
npm run dev
```

### Frontend Setup
```bash
cd spark-well-suite-main
npm install
npm run dev
```

## Usage

1. Start the backend server
2. Start the frontend development server
3. Navigate to `http://localhost:5173`
4. Register/Login to access the dashboard
5. Explore features: Journal, Health, Analytics, Standup, Insights

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `GET /api/health` - Get health metrics
- `POST /api/health` - Add health metric
- `GET /api/insights` - Get insights
- `GET /api/standup` - Get standup reports

## Project Structure

```
spark-well-suite-main/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API service functions
│   └── hooks/         # Custom React hooks
├── backend/
│   ├── controllers/   # Route controllers
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   └── server.js      # Main server file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC
