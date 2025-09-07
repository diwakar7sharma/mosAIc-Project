# Meeting Actioner

> Transform your meeting transcripts into actionable insights with AI-powered analysis, task extraction, and voice summaries.

## 🚀 Features

- **AI-Powered Analysis**: Extract key decisions, action items, and summaries from meeting transcripts
- **Voice Summaries**: Generate high-quality voice summaries using ElevenLabs AI
- **Task Management**: Organize action items in a beautiful Kanban-style board
- **Follow-up Emails**: Auto-generate professional follow-up emails
- **Secure Authentication**: Auth0 integration with Google and email login
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Built with TailwindCSS and shadcn/ui components

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
- **Node.js** with Express and TypeScript
- **Auth0** for authentication middleware
- **Google Gemini** for transcript analysis
- **ElevenLabs** for text-to-speech
- **CORS** and security middleware

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Auth0 account (free tier available)
- OpenAI API key
- ElevenLabs API key

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

The OpenAI and ElevenLabs API keys are already configured in the server/.env file:

- **Gemini API Key**: Already set for Gemini access
- **ElevenLabs API Key**: Already set with Voice ID `bIHbv24MWmeRgasZH58o`

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
- Click the **Play** button next to any summary
- AI-generated voice summary will play automatically
- Uses ElevenLabs high-quality voice synthesis

### 4. Task Management
1. Go to the **Tasks** page
2. View action items in Kanban columns (To Do, In Progress, Done)
3. Drag and drop tasks between columns
4. Add new tasks using the input field

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

- `POST /api/extract` - Extract insights from meeting transcript
- `POST /api/tts` - Generate voice summary from text
- `GET /health` - Health check endpoint

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render/Vercel Functions)
1. Deploy to Render or use Vercel Functions
2. Configure environment variables
3. Update CORS settings for production domain

## 🔒 Security Features

- **Auth0 Authentication**: Secure user management
- **API Protection**: All API routes require authentication
- **Rate Limiting**: Prevents API abuse
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Sanitized user inputs
- **Environment Variables**: Secure credential storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google** for Gemini API
- **ElevenLabs** for voice synthesis
- **Auth0** for authentication services
- **Vercel** for deployment platform
- **shadcn/ui** for beautiful components

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/meeting-actioner/issues) page
2. Create a new issue with detailed information
3. Contact support at hello@meetingactioner.com

---

**Made with ❤️ for productive teams everywhere**