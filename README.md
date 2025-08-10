# PerzonAI Backend API

A production-ready backend API for PerzonAI - AI Marketing Persona Agent. Built with Node.js, Express, and TypeScript, designed for agentic AI workflows.

## 🚀 Features

- **AI Persona Generation** - Generate detailed customer personas using Google Gemini API
- **Interactive Chat** - Chat with personas in their unique voice and style
- **File Processing** - Upload and process CSV, JSON, TXT files for persona generation
- **Real-time Refinement** - Instantly refine personas with updated parameters
- **Export & Share** - Export personas as PDF/JSON/Text and create shareable links
- **Trends Analysis** - Fetch and serve marketing trends data
- **Production Ready** - Comprehensive logging, error handling, validation, and documentation

## 🏗️ Architecture

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # API routes
├── middlewares/     # Custom middleware
├── utils/           # Helper functions
├── types/           # TypeScript definitions
└── tests/           # Test files
```

## 🛠️ Tech Stack

- **Framework**: Node.js + Express + TypeScript
- **AI Integration**: Google Gemini API
- **File Processing**: Multer + CSV Parser
- **PDF Generation**: PDFKit
- **Validation**: Joi
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Containerization**: Docker

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API key

## 🚀 Quick Start

### 1. Clone and Install

```
git clone <repository-url>
cd perzonai-backend
npm install
```

### 2. Environment Setup

Create `.env` file:

```
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
LOG_LEVEL=info
```

### 3. Development

```
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

### 4. Docker Deployment

```
# Build and run with Docker Compose
docker-compose up --build

# Or build individual container
docker build -t perzonai-backend .
docker run -p 8000:8000 --env-file .env perzonai-backend
```

## 📚 API Documentation

Once running, visit:
- **API Docs**: http://localhost:8000/api-docs
- **Health Check**: http://localhost:8000/health

## 🔗 API Endpoints

### Personas
- `POST /api/personas/generate` - Generate AI personas
- `POST /api/personas/refine` - Refine existing personas
- `POST /api/personas/chat` - Chat with persona
- `GET /api/personas/export/pdf` - Export as PDF
- `GET /api/personas/export/text` - Export as text
- `GET /api/personas/export/json` - Export as JSON
- `POST /api/personas/share` - Create shareable link
- `GET /api/personas/share/:id` - Access shared personas
- `GET /api/personas/stats` - Get statistics
- `GET /api/personas/search` - Search personas

### Trends
- `GET /api/trends` - Get marketing trends data

### Upload
- `POST /api/upload` - Upload and process files

## 🔧 Configuration

### Environment Variables

```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `LOG_LEVEL` | Logging level | `info` |

```

### File Upload Limits

- **Max file size**: 10MB
- **Supported formats**: CSV, JSON, TXT
- **Max files per request**: 10

## 🧪 Testing

```
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- persona.test.ts
```

## 📊 Monitoring & Logging

- **Logs**: Stored in `logs/` directory
- **Health Check**: `/health` endpoint
- **Error Tracking**: Comprehensive error logging with Winston
- **Request Logging**: Morgan middleware for HTTP request logging

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Joi schema validation
- **File Upload Security**: Type and size validation

## 🚀 Production Deployment

### Using Docker

```
# Build production image
docker build -t perzonai-backend:latest .

# Run with environment variables
docker run -d \
  --name perzonai-backend \
  -p 8000:8000 \
  -e GEMINI_API_KEY=your_key \
  -e NODE_ENV=production \
  perzonai-backend:latest
```

### Using Docker Compose

```
# Production deployment
docker-compose -f docker-compose.yml up -d
```

### Manual Deployment

```
# Build the application
npm run build

# Start with PM2 (recommended)
npm install -g pm2
pm2 start dist/server.js --name perzonai-backend

# Or start directly
npm start
```

## 🔄 Frontend Integration

The backend is designed to work seamlessly with the PerzonAI React frontend. Key integration points:

1. **CORS Configuration**: Automatically configured for frontend URL
2. **File Upload**: Handles multipart form data from frontend
3. **Real-time Updates**: Supports real-time persona refinement
4. **Error Handling**: Consistent error responses for frontend consumption

### Frontend API Client Example

```
// Example API calls from frontend
const response = await fetch('http://localhost:8000/api/personas/generate', {
  method: 'POST',
  body: formData, // multipart/form-data
});

const chatResponse = await fetch('http://localhost:8000/api/personas/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ personaId, message }),
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check `/api-docs` endpoint
- **Issues**: Create an issue on GitHub
- **Health Check**: Monitor `/health` endpoint

---

Built with ❤️ for the PerzonAI project
