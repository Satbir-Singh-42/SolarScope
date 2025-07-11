# SolarScope AI

> **AI-Powered Solar Panel Analysis Platform**

An advanced full-stack web application that leverages Google Gemini AI to provide comprehensive solar panel analysis, installation planning, and fault detection through cutting-edge computer vision technology.

![SolarScope AI](https://img.shields.io/badge/AI-Powered-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express.js-404D59?logo=express)
![Google AI](https://img.shields.io/badge/Google_AI-Gemini-orange)

## 🌟 Key Highlights

- **Real Google AI Integration**: Powered by Google Gemini 2.0 Flash for accurate computer vision analysis
- **Professional-Grade Analysis**: Installation planning and fault detection with industry-standard accuracy
- **Mobile-First Design**: Fully responsive interface optimized for all devices
- **Voice-Enabled Chat**: AI assistant with speech recognition for hands-free interaction
- **Production Ready**: Deployed on Render with PostgreSQL database for scalability

## 🚀 Features

### 🏠 **Installation Planning**
- **AI-Powered Roof Analysis**: Intelligent assessment of rooftop suitability for solar installations
- **Optimal Panel Placement**: Advanced algorithms determine the best panel positioning for maximum efficiency
- **Real-time Visualization**: Interactive canvas overlays showing recommended installation zones
- **Performance Predictions**: Accurate energy output forecasting based on location and roof conditions
- **Dynamic Confidence Scoring**: Adaptive analysis quality based on image clarity and roof complexity
- **Anti-Fake Detection**: Prevents panels from being placed in sky areas or unsuitable locations
- **Strict Image Validation**: AI-powered content classification ensures only rooftop images are accepted

### 🔍 **Fault Detection**
- **Computer Vision Analysis**: Automated detection of solar panel defects and performance issues
- **Critical Issue Identification**: Real-time detection of cracks, delamination, hot spots, and degradation
- **Severity Classification**: Intelligent ranking from Low to Critical with color-coded indicators
- **Maintenance Recommendations**: Actionable repair guidance with timeline priorities
- **Comprehensive Reporting**: Detailed fault analysis with exportable reports
- **Content Validation**: Ensures only solar panel images are processed for accurate analysis

### 🤖 **AI Chat Assistant**
- **Expert Solar Guidance**: 24/7 AI-powered consultation on all solar panel topics
- **Voice Input Support**: Hands-free interaction with speech recognition technology
- **Mobile-Optimized**: Seamless chat experience across all devices with responsive design
- **Rich Text Formatting**: Markdown support for formatted responses with bold, italic, and lists
- **Contextual Responses**: Smart categorization of queries (installation, maintenance, troubleshooting)
- **Quick Start Prompts**: Pre-built questions for instant expert advice
- **Copy Functionality**: Easy copying of AI responses with markdown formatting removed

### 📱 **Modern User Experience**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Drag & Drop Uploads**: Intuitive image upload interface with progress indicators
- **Real-time Processing**: Live analysis with animated loading states
- **Professional UI**: shadcn/ui components with consistent design system
- **Mobile Navigation**: Hamburger menu with smooth animations for mobile users
- **Framer Motion Animations**: Smooth transitions and interactive elements

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** for styling
- **TanStack Query** for state management
- **Framer Motion** for animations
- **Wouter** for lightweight routing

### Backend
- **Express.js 4.21.2** with TypeScript
- **Google Gemini AI** for image analysis
- **Drizzle ORM** with PostgreSQL
- **Multer** for file handling
- **Zod** for schema validation
- **Neon PostgreSQL** for production database

### AI & Deployment
- **Google Gemini 2.0 Flash** for computer vision analysis
- **Render** for production deployment
- **PostgreSQL** for data persistence
- Advanced image classification with content validation
- Context-aware analysis with intelligent fallback systems
- Real-time chat assistance with markdown formatting

## Quick Start

### Prerequisites
- Node.js 18 or higher
- Google AI API key
- PostgreSQL database (optional - uses in-memory storage by default)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd solarscope-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
GOOGLE_API_KEY=your_google_ai_api_key_here
DATABASE_URL=your_postgres_connection_string (optional)
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5000`

### Deployment to Render

The application is optimized for Render deployment with the following configuration:

1. **Build Command**: `npm install && npm run build`
2. **Start Command**: `node start-production.js`
3. **Environment**: Node.js with auto-deploy from Git

**Environment Variables for Production:**
- `GOOGLE_API_KEY`: Your Google Gemini AI API key
- `DATABASE_URL`: Neon PostgreSQL connection string
- `NODE_ENV`: Set to `production`

The deployment uses a production-ready Express server with comprehensive health monitoring and error handling.

## Usage

### Installation Analysis
1. Navigate to the **Installation Planning** tab
2. Upload a clear rooftop image (aerial view preferred)
3. Configure roof parameters (size, shape, panel type)
4. Click **Start AI Analysis** for AI-powered recommendations
5. Review the analysis results and panel placement overlay
6. Export the report for professional consultation

### Fault Detection
1. Go to the **Fault Detection** tab
2. Upload images of your existing solar panels
3. Click **Start AI Analysis** for automated fault detection
4. Review detected issues with severity classifications
5. Follow the provided maintenance recommendations
6. Generate detailed fault reports

### AI Chat Assistant
1. Access the **AI Assistant** page from the navigation
2. Ask questions about solar panels, installation, or maintenance
3. Use quick prompt buttons for common inquiries
4. Get real-time expert advice and recommendations
5. Use voice input for hands-free interaction

## API Endpoints

### Installation Analysis
```
POST /api/analyze/installation
Content-Type: multipart/form-data

Body:
- image: File (rooftop image)
- userId: string
- roofSize: string (optional)
- roofShape: string (optional)
- panelSize: string (optional)
```

### Fault Detection
```
POST /api/analyze/fault-detection
Content-Type: multipart/form-data

Body:
- image: File (solar panel image)
- userId: string
```

### AI Chat
```
POST /api/ai/chat
Content-Type: application/json

Body:
{
  "message": "Your question about solar panels",
  "userId": "1"
}
```

### Health Check
```
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2025-07-11T12:07:32.925Z",
  "service": "SolarScope AI",
  "version": "1.0.0"
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Gemini AI API key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | No |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 5000 dev, 10000 prod) | No |

## Project Structure

```
├── client/                 # React frontend application
│   ├── public/            # Static assets and robot icon
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/        # shadcn/ui component library
│   │   │   ├── ai-chat-widget.tsx         # Desktop chat widget
│   │   │   ├── mobile-ai-chat-widget.tsx  # Mobile chat widget
│   │   │   ├── analysis-overlay.tsx       # Canvas visualization
│   │   │   ├── fault-detection.tsx        # Fault analysis component
│   │   │   └── installation-analysis.tsx  # Installation planning
│   │   ├── pages/         # Application pages
│   │   │   ├── dashboard.tsx  # Main analysis interface
│   │   │   ├── chat.tsx       # AI chat assistant page
│   │   │   ├── about.tsx      # About and information
│   │   │   └── not-found.tsx  # 404 error page
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   └── types/         # TypeScript type definitions
├── server/                 # Express.js backend
│   ├── ai-service.ts      # Google AI integration services
│   ├── routes.ts          # API route handlers
│   ├── storage.ts         # Database and memory storage
│   ├── production.ts      # Production server configuration
│   └── index.ts           # Development server entry
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle ORM schemas and Zod validation
├── start-production.js    # Production startup script
├── render.yaml           # Render deployment configuration
├── RENDER_DEPLOYMENT_INSTRUCTIONS.md  # Deployment guide
├── DEPLOYMENT_CHECKLIST.md          # Deployment checklist
└── replit.md             # Project documentation and changelog
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 🏗️ Architecture Highlights

### Frontend Architecture
- **Component-Based Design**: Modular React components with TypeScript
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Framework**: shadcn/ui built on Radix UI primitives for accessibility
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints
- **Progressive Enhancement**: Works on all devices with graceful degradation

### Backend Architecture
- **Production-Ready**: Express.js server optimized for Render deployment
- **AI Integration**: Direct Google Gemini API integration with error handling
- **File Processing**: Multer for image uploads with validation
- **Type Safety**: End-to-end TypeScript with Zod schema validation
- **Database Integration**: Drizzle ORM with PostgreSQL and memory storage fallback

### Key Technical Decisions
- **Flexible Storage**: Memory storage for development, PostgreSQL for production
- **Dual Chat Widgets**: Separate desktop and mobile chat components for optimal UX
- **Canvas Overlays**: Custom visualization for analysis results
- **Markdown Support**: Rich text formatting in AI responses
- **Voice Integration**: Speech recognition for hands-free interaction
- **Image Classification**: AI-powered content validation for appropriate image types

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build for production (frontend + backend)
- `npm run start` - Start production server locally
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

### Development Features
- **Hot Module Replacement**: Instant updates during development
- **TypeScript Integration**: Full type safety across frontend and backend
- **Error Boundaries**: Graceful error handling with user-friendly messages
- **Console Logging**: Comprehensive logging for debugging
- **CORS Configuration**: Proper cross-origin setup for API access

## 📊 Performance & Analytics

- **Bundle Optimization**: Vite-powered build with code splitting
- **Image Optimization**: Efficient handling of large image uploads
- **API Response Caching**: Intelligent caching for improved performance
- **Mobile Performance**: Optimized for low-bandwidth connections
- **Error Tracking**: Comprehensive error logging and monitoring

## 🔐 Security

- **API Key Protection**: Secure handling of Google AI credentials
- **Input Validation**: Zod schema validation for all API inputs
- **File Upload Security**: Size limits and type validation for images
- **CORS Configuration**: Restricted cross-origin access
- **Environment Isolation**: Separate development and production configurations
- **Image Content Validation**: AI-powered classification prevents inappropriate uploads

## Recent Updates

- **July 2025**: Complete migration from Replit Agent to Replit environment
- **Production Deployment**: Fixed all Render deployment issues with proper dependency management
- **Express Compatibility**: Resolved Express 5.x compatibility issues
- **Database Integration**: Added PostgreSQL support with Neon database
- **Mobile Optimization**: Enhanced mobile responsiveness across all components
- **AI Chat System**: Implemented professional AI chat with voice input and markdown support

## License

This project is proprietary software. All rights reserved.

## Support

For technical support or questions about SolarScope AI, please contact the development team or create an issue in the repository.

---

**Built with precision for the solar energy community** ⚡
*Empowering sustainable energy through AI innovation*