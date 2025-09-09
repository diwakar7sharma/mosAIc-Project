# 🎯 Meeting Actioner - AI-Powered Meeting Intelligence

> Transform your meeting transcripts into actionable insights with cutting-edge AI analysis, intelligent task extraction, and premium voice summaries.

**Meeting Actioner** is a comprehensive web application that revolutionizes how teams handle meeting follow-ups. By leveraging Google Gemini AI and ElevenLabs voice synthesis, it automatically converts raw meeting transcripts into structured insights, actionable tasks, and professional communications.

## ✨ Key Features

### 🧠 **AI-Powered Meeting Analysis**
- **Google Gemini Integration**: Advanced transcript analysis using Google's latest AI model
- **Intelligent Extraction**: Automatically identifies meeting titles, key decisions, and action items
- **Context-Aware Summaries**: Generates comprehensive meeting summaries with confidence scoring
- **Real-time Processing**: Fast analysis with loading states and progress indicators

### 🎵 **Premium Voice Synthesis**
- **ElevenLabs Integration**: High-quality text-to-speech with natural-sounding voices
- **One-Click Playback**: Instant audio generation from AI summaries
- **Multiple Voice Options**: Configurable voice IDs for personalized experience
- **Seamless Audio**: Direct playback without visible controls for clean UX

### 📋 **Advanced Task Management**
- **Kanban Board**: Beautiful drag-and-drop interface (To Do → In Progress → Done)
- **Smart Task Creation**: Individual or bulk task addition from AI insights
- **User-Specific Data**: All tasks tied to authenticated user accounts
- **Real-time Updates**: Live synchronization across sessions
- **Priority Management**: Task prioritization with visual indicators

### 📊 **User Analytics & Metrics**
- **Performance Tracking**: Monitor transcripts analyzed, insights generated, and time saved
- **Hours Saved Calculation**: Intelligent time estimation based on meeting duration
- **Real-time Dashboard**: Live metrics updates without page refresh
- **Historical Data**: Persistent user statistics and progress tracking

### 📧 **Professional Communication**
- **Auto-Generated Emails**: AI-crafted follow-up emails with proper formatting
- **Editable Content**: Customize email content before sending
- **Copy-to-Clipboard**: Easy sharing and distribution
- **Professional Templates**: Business-ready email formatting

### 🔐 **Enterprise-Grade Security**
- **Auth0 Authentication**: Secure user management with Google and email login
- **User Data Isolation**: All data scoped to individual user accounts
- **MongoDB Integration**: Secure data persistence with proper access controls
- **API Protection**: Authenticated endpoints with proper error handling

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **shadcn/ui** for beautiful components
- **Framer Motion** for smooth animations
- **Auth0 React SDK** for authentication
- **React Router** for navigation
- **@dnd-kit** for drag-and-drop functionality

### Backend
- **Node.js** with Pure HTTP Server and TypeScript
- **MongoDB** with Mongoose for data persistence
- **Auth0** for authentication middleware
- **Google Gemini API** for advanced transcript analysis
- **ElevenLabs API** for premium text-to-speech
- **CORS** and comprehensive security middleware

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js 18+** installed
- **npm** or yarn package manager
- **MongoDB Atlas** account (free tier available)
- **Auth0** account (free tier available)
- **Google Gemini API** key (free tier available)
- **ElevenLabs API** key (premium service)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, client)
npm run install:all
```

### 2. Environment Configuration

Copy the example environment files and configure them:

```bash
# Copy environment files
cp .env.example server/.env
cp .env.example client/.env
```

### 3. Configure Auth0

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application (Single Page Application)
3. Configure the following settings:
   - **Allowed Callback URLs**: `http://localhost:5173`
   - **Allowed Logout URLs**: `http://localhost:5173`
   - **Allowed Web Origins**: `http://localhost:5173`
   - **Allowed Origins (CORS)**: `http://localhost:5173`

4. Update your environment files with Auth0 credentials:

**server/.env**:
```env
AUTH0_SECRET=your-32-character-secret
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
```

**client/.env**:
```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
```

### 4. API Keys Configuration

Update your environment files with the required API keys:

**server/.env**:
```env
# Google Gemini Configuration
GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your-elevenlabs-api-key
ELEVENLABS_VOICE_ID=XrExE9yKIg1WjnnlVkGX

# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string
```

**client/.env**:
```env
# Google Gemini Configuration
VITE_GOOGLE_GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# ElevenLabs Configuration
VITE_ELEVENLABS_API_KEY=your-elevenlabs-api-key
VITE_ELEVENLABS_VOICE_ID=XrExE9yKIg1WjnnlVkGX
```

### 5. Run the Application

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend application on `http://localhost:5173`

## 📖 Usage Guide

### 1. Authentication
- Click "Login" to authenticate with Auth0
- Use Google login or email/password
- Dashboard and Tasks pages require authentication

### 2. Analyzing Meeting Transcripts
1. Go to the **Dashboard** page
2. Paste your meeting transcript in the text area
3. Click **Extract Insights**
4. View the generated:
   - Meeting title and summary
   - Key decisions made
   - Action items table
   - Follow-up email draft

### 3. Voice Summaries
- Click the **Speaker** icon next to any AI summary
- High-quality voice synthesis plays automatically
- Uses ElevenLabs premium voice technology
- No visible audio controls for seamless experience

### 4. Task Management
1. Go to the **Tasks** page
2. View action items in Kanban columns (To Do, In Progress, Done)
3. Drag and drop tasks between columns
4. Add individual tasks from AI insights or create new ones
5. Bulk add all action items with one click
6. Real-time metrics tracking for productivity insights

### 5. Follow-up Emails
- Edit the generated email content
- Copy to clipboard or open in your email client
- Professional formatting included

## 🏗️ Project Structure

```
meeting-actioner/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── lib/           # Utility functions
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── server/                # Express backend
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   └── index.ts       # Main server file
│   ├── package.json
│   └── tsconfig.json
├── package.json           # Root package.json
├── .env.example          # Environment variables template
└── README.md
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run server:dev       # Start only backend
npm run client:dev       # Start only frontend

# Building
npm run build           # Build frontend for production
npm run start           # Start production server

# Dependencies
npm run install:all     # Install all dependencies
```

### API Endpoints

**Core Functionality:**
- `POST /api/extract` - Extract insights from meeting transcript
- `POST /api/tts` - Generate voice summary from text
- `GET /health` - Health check endpoint

**Task Management:**
- `GET /api/tasks/user/:userId` - Get user's tasks
- `POST /api/tasks` - Create new task
- `POST /api/tasks/with-metrics` - Create task with metrics tracking
- `POST /api/tasks/bulk` - Create multiple tasks
- `PUT /api/tasks/:taskId` - Update task
- `PATCH /api/tasks/:taskId/status` - Update task status
- `DELETE /api/tasks/:taskId` - Delete task

**User Analytics:**
- `GET /api/metrics/:userId` - Get user metrics
- `POST /api/metrics/:userId/increment` - Increment specific metric

**Data Management:**
- `GET /api/transcripts/user/:userId` - Get user transcripts
- `POST /api/transcripts` - Save transcript
- `GET /api/insights/user/:userId` - Get user insights
- `POST /api/insights` - Save meeting insights
- `DELETE /api/userdata/:userId` - Clear all user data

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository to Vercel or Netlify
2. Set environment variables in deployment dashboard:
   - `VITE_AUTH0_DOMAIN`
   - `VITE_AUTH0_CLIENT_ID`
   - `VITE_API_URL`
   - `VITE_GOOGLE_GEMINI_API_KEY`
   - `VITE_ELEVENLABS_API_KEY`
   - `VITE_ELEVENLABS_VOICE_ID`
3. Deploy automatically on push to main branch

### Backend (Render/Railway/Heroku)
1. Deploy to your preferred Node.js hosting platform
2. Configure environment variables:
   - `MONGODB_URI`
   - `AUTH0_SECRET`
   - `AUTH0_CLIENT_ID`
   - `AUTH0_CLIENT_SECRET`
   - `AUTH0_ISSUER_BASE_URL`
   - `GOOGLE_GEMINI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID`
   - `CLIENT_URL`
3. Update CORS settings for production domain
4. Ensure MongoDB Atlas allows connections from deployment platform

## 🔒 Security Features

- **Auth0 Authentication**: Secure user management
- **API Protection**: All API routes require authentication
- **Rate Limiting**: Prevents API abuse
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Sanitized user inputs
- **Environment Variables**: Secure credential storage

## 🎯 Use Cases

### For Teams
- **Standup Meetings**: Extract action items and blockers
- **Project Planning**: Identify decisions and next steps
- **Client Calls**: Generate professional follow-up emails
- **Retrospectives**: Capture improvement actions

### For Individuals
- **Interview Notes**: Structure feedback and decisions
- **Training Sessions**: Extract key learnings and tasks
- **Brainstorming**: Organize ideas into actionable items
- **Performance Reviews**: Track commitments and goals

## 🔄 Workflow

1. **Record/Transcribe** your meeting using any tool
2. **Paste** the transcript into Meeting Actioner
3. **Analyze** with AI to extract insights automatically
4. **Listen** to voice summaries for quick review
5. **Manage** tasks in the Kanban board
6. **Send** professional follow-up emails
7. **Track** your productivity metrics over time

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Add proper error handling and loading states
- Write meaningful commit messages
- Test across different browsers and devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎨 Screenshots

### Dashboard - AI Analysis
![Dashboard showing AI-powered meeting analysis with voice synthesis]()

### Task Management - Kanban Board
![Drag-and-drop task management with real-time updates]()

### User Metrics - Analytics Dashboard
![Comprehensive productivity tracking and time savings]()

## 🔧 Advanced Configuration

### Custom Voice Selection
Update the `ELEVENLABS_VOICE_ID` in your environment files to use different voices:
- `XrExE9yKIg1WjnnlVkGX` - Default professional voice
- `nPczCjzI2devNBz1zQrb` - Alternative voice option
- Visit [ElevenLabs Voice Library](https://elevenlabs.io/app/voice-library) for more options

### MongoDB Collections
The application uses the following MongoDB collections:
- `tasks` - User task management
- `usermetrics` - Analytics and productivity tracking
- `transcripts` - Meeting transcript storage
- `meetinginsights` - AI-generated insights

### Performance Optimization
- Real-time subscriptions for live updates
- Efficient data pagination for large datasets
- Optimized API calls with proper caching
- Responsive design with mobile-first approach

## 🙏 Acknowledgments

- **Google** for Gemini AI API
- **ElevenLabs** for premium voice synthesis
- **Auth0** for enterprise authentication
- **MongoDB** for reliable data persistence
- **Vercel** for seamless deployment
- **shadcn/ui** for beautiful component library
- **Framer Motion** for smooth animations
- **React DnD Kit** for drag-and-drop functionality

## 📞 Support & Community

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/diwakar7sharma/mosAIc-Project/issues) page
2. Create a new issue with detailed information
3. Join our community discussions
4. Star ⭐ the repository if you find it helpful!

## 📈 Roadmap

- [ ] **Multi-language Support** - Support for non-English transcripts
- [ ] **Calendar Integration** - Sync with Google Calendar/Outlook
- [ ] **Team Collaboration** - Shared workspaces and team metrics
- [ ] **Advanced Analytics** - Detailed productivity insights
- [ ] **Mobile App** - Native iOS and Android applications
- [ ] **Slack/Teams Integration** - Bot for instant meeting analysis
- [ ] **Custom AI Models** - Fine-tuned models for specific industries

---

**Made with ❤️ for productive teams everywhere**

*Transform your meetings from time-wasters to productivity boosters with AI-powered intelligence.*