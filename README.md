# MetaWurks Chat UI

Modern AI chat application with multiple LLM models, web search, and conversation branching.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
```

Visit http://localhost:3000

## Environment Variables

### Required

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# AI Models
OPENROUTER_API_KEY=sk-or-v1-...        # For Gemini & DeepSeek
GROQ_API_KEY=gsk_...                   # For Llama 3
TAVILY_API_KEY=tvly-...                # Web search

# Auth
NEXTAUTH_SECRET=                       # Generate: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

### Optional (OAuth)

```env
# Google OAuth - https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth - https://github.com/settings/developers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## Features

- **Multiple AI Models**: Gemini Pro, DeepSeek V3, Llama 3
- **Web Search**: Automatic Tavily integration with source citations
- **Conversation Branching**: Explore alternative conversation paths
- **Message Reactions**: React to messages with emojis
- **Message Remixing**: Transform messages into different styles
- **Scheduled Messages**: Schedule messages for later delivery
- **Real-time Streaming**: Token-by-token response streaming
- **Authentication**: Email/password + OAuth (Google, GitHub)

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- MongoDB + Mongoose
- NextAuth v5
- Tailwind CSS
- Framer Motion

## Authentication Flow

### Email/Password
1. User signs up at `/signup` - password hashed with bcrypt
2. User record created in MongoDB with `provider: "email"`
3. Login at `/login` validates credentials
4. NextAuth creates JWT with user's MongoDB `_id`
5. Session includes user ID for data isolation

### OAuth (Google/GitHub)
1. User clicks OAuth button
2. Redirected to provider for authentication
3. On callback, NextAuth checks if user exists by email
4. If new user, creates record with `provider: "google"` or `"github"`
5. JWT includes MongoDB `_id` for session
6. All subsequent requests use this ID for data access

### Session Management
- Strategy: JWT (stateless)
- Max age: 30 days
- Session includes: `id`, `email`, `name`, `image`, `provider`
- All API routes validate session and user ID

## MongoDB Schema

### Users
```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  passwordHash?: string,          // Only for email auth
  provider: "email" | "google" | "github",
  image?: string,
  settings: {
    theme: "light" | "dark" | "system",
    language: "en" | "es" | "fr" | "de",
    defaultModel: "gemini" | "deepseek" | "llama",
    webSearchEnabled: boolean,
    emailNotifications: boolean,
    browserNotifications: boolean,
    soundEnabled: boolean,
    saveHistory: boolean,
    analytics: boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Conversations
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: string,
  activeBranch: string,           // Current branch name
  moodTheme: string,
  isShared: boolean,
  shareToken?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Messages
```typescript
{
  _id: ObjectId,
  conversationId: ObjectId (ref: Conversation),
  userId: ObjectId (ref: User),
  branchId: string,               // Branch this message belongs to
  content: string,
  role: "user" | "assistant",
  timestamp: Date,
  reactions: string[],            // Emoji reactions
  remixes: [{                     // Alternative versions
    style: string,
    content: string
  }],
  importance: number,             // 0-1 relevance score
  isScheduled: boolean,
  scheduledFor?: Date
}
```

### Branches
```typescript
{
  _id: ObjectId,
  conversationId: ObjectId (ref: Conversation),
  name: string,                   // Branch name
  parentBranch: string,           // Parent branch name
  branchPointMessageId: string,   // Where branch diverged
  createdAt: Date
}
```

## Conversation Threading & Branching

### Thread Structure
- Each conversation has an `activeBranch` (default: "main")
- Messages belong to a specific `branchId`
- Branches track their `parentBranch` and `branchPointMessageId`

### Creating a Branch
```typescript
POST /api/conversations/:id/branch
Body: { targetMessageId: string }

// Creates new conversation with:
// - Copies messages up to targetMessageId
// - New branch record linking to parent
// - Returns new conversation ID
```

### Branch Use Cases
1. **Explore alternatives**: Try different prompts from same point
2. **Compare responses**: Get multiple AI responses to same question
3. **Conversation recovery**: Branch before risky prompt
4. **A/B testing**: Compare different conversation approaches

### Implementation Details
- Branches are separate conversations (not in-place)
- Original conversation remains unchanged
- Branch metadata stored in Branch collection
- UI shows branch relationships (future feature)

## API Routes

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Chat
- `POST /api/chat/stream` - Send message, get streaming response

### Conversations
- `GET /api/conversations` - List user's conversations
- `GET /api/conversations/:id` - Get conversation with messages
- `DELETE /api/conversations/:id` - Delete conversation
- `POST /api/conversations/:id/branch` - Create branch

### Messages
- `POST /api/react` - Add reaction to message
- `POST /api/remix` - Create message remix
- `POST /api/schedule` - Schedule message

### User
- `GET /api/user/profile` - Get profile
- `PATCH /api/user/profile` - Update profile
- `DELETE /api/user/profile` - Delete account
- `GET /api/user/settings` - Get settings
- `PATCH /api/user/settings` - Update settings
- `DELETE /api/user/clear-history` - Clear all conversations

## Security

- Session-based auth with JWT
- User data isolation (all queries filter by userId)
- MongoDB ObjectId validation
- Input sanitization (max lengths, whitelists)
- Password hashing with bcrypt
- CSRF protection (NextAuth)
- Content length limits (10k chars per message)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
- Update `NEXTAUTH_URL` to your domain
- Update OAuth callback URLs:
  - Google: `https://yourdomain.com/api/auth/callback/google`
  - GitHub: `https://yourdomain.com/api/auth/callback/github`

### MongoDB Atlas Setup
1. Create cluster at mongodb.com
2. Add IP whitelist (0.0.0.0/0 for Vercel)
3. Create database user
4. Get connection string
5. Add to `MONGODB_URI`

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
```

## Project Structure

```
src/
├── app/                    # Next.js pages & API routes
│   ├── api/               # API endpoints
│   │   ├── auth/         # Authentication
│   │   ├── chat/         # Chat streaming
│   │   ├── conversations/ # Conversation management
│   │   ├── react/        # Message reactions
│   │   ├── remix/        # Message remixing
│   │   ├── schedule/     # Scheduled messages
│   │   └── user/         # User management
│   ├── chat/             # Chat UI pages
│   ├── login/            # Login page
│   └── signup/           # Signup page
├── components/           # React components
│   ├── chat/            # Chat-specific components
│   ├── layout/          # Layout components
│   ├── providers/       # Context providers
│   └── ui/              # UI components
├── contexts/            # React contexts
├── hooks/               # Custom hooks
├── lib/                 # Utilities
│   ├── auth.ts         # NextAuth config
│   ├── mongodb.ts      # DB connection
│   ├── constants/      # App constants
│   └── utils/          # Helper functions
├── models/              # Mongoose models
└── types/               # TypeScript types
```

## License

MIT
