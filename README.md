# PerzonAI – AI Marketing Persona Agent

A full-stack, production-ready web application that empowers marketers and product managers to create, refine, and interact with dynamic, AI-powered customer personas.
Built with Next.js + TypeScript (frontend) and Node.js + Express + TypeScript (backend) for a smooth, decoupled architecture, with Google Gemini API powering persona generation, refinement, and conversational AI.

## 🚀 Features

- **AI Persona Generation** – Generate detailed, structured personas from product briefs or uploaded data.
- **Interactive Chat** – Talk to personas in their unique voice and style.
- **Real-Time Refinement** – Update persona traits instantly with live feedback.
- **File Processing** – Upload CSV, JSON, or TXT files for persona generation.
- **Avatar Generation** – Auto-generate unique avatars using DiceBear API.
- **Export & Share** – Export personas as PDF, JSON, or Text; generate shareable links.
- **Trends Analysis** – View marketing trends data directly in the dashboard.
- **Production-Ready** – Includes logging, validation, error handling, Docker deployment.

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
```
[User Browser]
    ↓ (HTTP/HTTPS)
[Next.js Frontend]
    ↓ API Calls
[Node.js/Express Backend] --- [Google Gemini API] (AI)
        ↓
    [Supabase PostgreSQL]
        ↑
   [DiceBear API] (Avatars)

```

## 🛠️ Tech Stack

Frontend: *Next.js 14+, TypeScript, Tailwind CSS, Shadcn/UI, Framer Motion, Lucide Icons*
Backend: *Node.js, Express, TypeScript, Multer, Joi, Winston, PDFKit, Swagger/OpenAPI*
Database: *Supabase (PostgreSQL with JSONB support)*
AI Services: *Google Gemini API, DiceBear API*
DevOps: *Docker, PM2, GitHub Actions (optional CI/CD)*

## 📋 Prerequisites

-Node.js 18+
-npm or yarn
-Supabase account & API keys
-Google Gemini API key
-Docker (optional, for containerized deployment)

## 🚀 Quick Start

1️⃣ Clone Repository
```
git clone <repository-url>
cd perzonai
```
2️⃣ Install Dependencies
```
npm install
```
3️⃣ Environment Variables
Create .env in project root:
```
# Server
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# AI & DB
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Logging
LOG_LEVEL=info
```
4️⃣ Development Mode
```
npm run dev
```
5️⃣ Build & Production
```
npm run build
npm start
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
### 📖 Usage Guide
**1. Generating Personas**
Open the frontend in your browser (http://localhost:3000). <br>
Go to the Persona Generator page. <br>
Enter product details or upload a CSV/JSON/TXT file.  <br>
Click Generate – the request is sent to /api/personas/generate on the backend. <br>
Google Gemini API generates the persona data, avatars are added via DiceBear, and the results are displayed instantly. <br>

**2. Refining Personas**
On the Dashboard, adjust persona sliders, traits, or preferences. <br>
Click Apply Changes – the frontend calls /api/personas/refine with current personas + instructions. <br>
Backend sends instructions to Gemini, returns updated personas to the frontend in real time. <br>

**3. Chatting with Personas**
Click the Chat button on any persona card. <br>
Type a message – the frontend calls /api/personas/chat with persona context + user message. <br>
Backend sends a role-playing prompt to Gemini and returns the persona's reply. <br>

**4. Exporting & Sharing**
Export personas as PDF, JSON, or Text via backend export endpoints. <br>
Create shareable links using /api/personas/share. <br>

**5. Trends & Insights**
Fetch marketing trends with /api/trends for inspiration or targeting suggestions. <br>

**6. File Uploads**
Upload CSV, JSON, or TXT files directly to /api/upload. <br>
Backend parses the data and feeds it into the persona generation process.<br>

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
