# OZ Dashboard - Project Overview

## 📋 Project Description

**OZ Dashboard** is a comprehensive web application for visualizing and analyzing Opportunity Zone (OZ) investment data. It features an interactive map visualization, market analytics dashboard, investment insights, and an AI-powered chatbot for user assistance.

## 🏗️ Architecture Overview

### Frontend (Next.js 15 with App Router)
- **Framework**: Next.js 15.3.4 with Turbopack for faster development
- **UI**: React 19 with Tailwind CSS for responsive design
- **Authentication**: Supabase Auth with Google OAuth integration
- **State Management**: Zustand for chat state, React Context for auth
- **Maps**: Leaflet/React-Leaflet for interactive OZ map visualization
- **Charts**: Chart.js with react-chartjs-2 for data visualizations

### Backend Services
- **Primary Backend**: Next.js API routes and server components
- **Chatbot Service**: Python FastAPI service (`ozlistings-chat/`) with Google Gemini AI
- **Database**: Supabase (PostgreSQL) for user management and data storage
- **Data Processing**: Client-side GeoJSON processing for map data

## 📁 Project Structure

```
oz-dashboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/              # Authentication routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.js          # Root layout component
│   │   └── page.js            # Homepage with slide container
│   ├── components/            # React components
│   │   ├── Charts/           # Chart components (Chart.js)
│   │   ├── ChatbotPanel.js   # AI chat interface
│   │   ├── OZMapVisualization.js # Interactive map
│   │   ├── ModernKpiDashboard.js # Analytics dashboard
│   │   ├── SlideContainer.js # Main slide navigation
│   │   └── [other UI components]
│   ├── contexts/             # React Context providers
│   │   └── AuthContext.js    # Authentication state
│   ├── lib/
│   │   └── supabase/         # Supabase client configurations
│   ├── services/             # Data services
│   │   └── ozDataService.js  # OZ data processing
│   └── stores/               # Zustand state stores
│       └── chatStore.js      # Chat state management
├── public/
│   ├── data/                 # Static data files
│   │   ├── opportunity-zones-compressed.geojson # OZ boundaries
│   │   └── us-opportunity-zones-data.json # OZ statistics
│   └── maps/                 # Map assets
├── ozlistings-chat/          # Python chatbot service
│   ├── backend/              # FastAPI application
│   ├── frontend/             # Chat UI (if separate)
│   ├── docker-compose.yml    # Local development setup
│   └── pyproject.toml        # Python dependencies
├── docs/                     # Documentation
│   ├── SETUP_AUTH.md         # Authentication setup guide
│   └── USER_PROFILES_TABLE.md # Database schema
└── [config files]
```

## ✨ Key Features

### 1. **Interactive Slide Presentation**
- **Map View**: Interactive Opportunity Zone map with detailed overlays
- **Investment Reasons**: Comprehensive guide to OZ investment benefits
- **Market Overview**: KPI dashboard with charts and analytics

### 2. **AI-Powered Chatbot**
- **Progressive Authentication**: First message free, second requires Google login
- **Context-Aware**: Understands OZ data and investment queries
- **Backend**: Python FastAPI with Google Gemini AI integration

### 3. **Data Visualizations**
- **Geographic**: Leaflet maps with GeoJSON OZ boundary data
- **Analytics**: Chart.js visualizations for market trends and KPIs
- **Real-time**: Dynamic data loading and filtering

### 4. **Authentication & User Management**
- **Provider**: Supabase Auth with Google OAuth
- **Flow**: Perplexity-style authentication overlay
- **Session**: Automatic session management with middleware

### 5. **Responsive Design**
- **Framework**: Tailwind CSS with dark/light theme support
- **Mobile**: Fully responsive across all device sizes
- **Accessibility**: ARIA labels and keyboard navigation

## 🔧 Technology Stack

### Frontend Dependencies
```json
{
  "@supabase/ssr": "^0.6.1",           // Supabase client
  "@supabase/supabase-js": "^2.50.2",  // Supabase JavaScript library
  "chart.js": "^4.5.0",                // Charts and visualizations
  "d3": "^7.8.5",                      // Data manipulation
  "leaflet": "^1.9.4",                 // Interactive maps
  "react-leaflet": "^5.0.0",           // React Leaflet bindings
  "zustand": "^5.0.6",                 // State management
  "tailwindcss": "^3.4.17"             // Styling framework
}
```

### Backend Dependencies (Chatbot)
```toml
fastapi = "^0.100.0"          # Web framework
google-generativeai = "*"     # Google Gemini AI
sqlalchemy = "==1.4.47"       # Database ORM
psycopg2-binary = "^2.9.5"    # PostgreSQL adapter
```

## 🚀 Deployment Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ (for chatbot service)
- Supabase account
- Google Cloud Console access (for OAuth)

### 1. Environment Setup

Create `.env.local` in the project root:
```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Chatbot Backend (Required)
NEXT_PUBLIC_OZ_BACKEND_URL=https://your-chatbot-backend-url.com

# Google OAuth (Optional - for enhanced auth)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 2. Frontend Deployment

#### Option A: Vercel (Recommended)
1. **Connect Repository**:
   ```bash
   # Push to GitHub
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Add environment variables in Vercel project settings
   - Deploy automatically triggers

3. **Configure Domain**:
   - Update Supabase auth URLs with your Vercel domain
   - Update Google OAuth redirect URIs

#### Option B: Manual Build
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

#### Option C: Docker
```dockerfile
# Dockerfile (create in project root)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 3. Chatbot Service Deployment

#### Option A: Google Cloud Run (Recommended)
```bash
# Navigate to chatbot directory
cd ozlistings-chat

# Build and deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml

# Or deploy directly
gcloud run deploy ozlistings-chat \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Option B: Local Development
```bash
cd ozlistings-chat

# Install dependencies
pip install poetry
poetry install

# Run development server
poetry run uvicorn backend.main:app --reload --port 8000
```

### 4. Database Setup

#### Supabase Configuration
1. **Create Project**: Set up new Supabase project
2. **Authentication**: Enable Google OAuth provider
3. **Database**: Run SQL from `docs/USER_PROFILES_TABLE.md`
4. **Security**: Configure RLS policies for user data

### 5. Authentication Setup

Follow the detailed guide in `docs/SETUP_AUTH.md`:

1. **Google Cloud Console**:
   - Create OAuth 2.0 client
   - Configure authorized domains and redirect URIs

2. **Supabase Auth**:
   - Enable Google provider
   - Configure redirect URLs
   - Set up user profiles table

### 6. Production Checklist

- [ ] Environment variables configured
- [ ] Supabase project set up with auth
- [ ] Google OAuth configured
- [ ] Chatbot service deployed and accessible
- [ ] Domain configured with HTTPS
- [ ] Database migrations run
- [ ] Error monitoring set up (optional)

## 🔒 Security Considerations

- **Environment Variables**: Never commit `.env.local` to version control
- **CORS**: Configure proper CORS policies for chatbot service
- **Auth**: Use Supabase RLS for database security
- **HTTPS**: Ensure all production deployments use HTTPS
- **API Keys**: Rotate Supabase and Google API keys regularly

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection Error**:
   - Verify environment variables are set
   - Check Supabase project status
   - Restart development server after env changes

2. **Authentication Issues**:
   - Verify Google OAuth configuration
   - Check Supabase auth provider settings
   - Ensure redirect URIs match exactly

3. **Chatbot Not Working**:
   - Check `NEXT_PUBLIC_OZ_BACKEND_URL` is set
   - Verify chatbot service is deployed and accessible
   - Check network/CORS configuration

4. **Map Not Loading**:
   - Verify GeoJSON files are in `public/data/`
   - Check browser console for loading errors
   - Ensure proper file permissions

## 📊 Performance Optimization

- **Bundle Analysis**: Use `@next/bundle-analyzer` to analyze bundle size
- **Image Optimization**: Next.js automatic image optimization
- **Data Loading**: Implement proper loading states and error boundaries
- **Caching**: Configure appropriate cache headers for static assets

## 🔄 Development Workflow

```bash
# Start development servers
npm run dev          # Frontend (localhost:3000)
cd ozlistings-chat && poetry run uvicorn backend.main:app --reload  # Backend (localhost:8000)

# Code quality
npm run lint         # ESLint
npx prettier --write . # Format code

# Git workflow
git add .
git commit -m "Description"
git push origin feature-branch
# Create PR for review
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs/)

---

**Last Updated**: January 2025
**Version**: 0.1.0 