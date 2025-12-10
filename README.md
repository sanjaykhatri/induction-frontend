# HSE Induction Training Platform - Frontend

A modern Next.js frontend application for a remote Health, Safety, and Environment (HSE) induction training platform. This application provides an intuitive interface for users to complete induction training modules, watch videos, answer questions, and track their progress.

## Features

- **User Authentication**: Secure login for regular users and administrators
- **Induction Management**: Browse and start available induction programs
- **Chapter-based Learning**: Progress through chapters with video content
- **Video Completion Tracking**: Track video watch progress and completion
- **Question Assessments**: Answer questions after completing each chapter
- **Progress Tracking**: View completion status and progress across all inductions
- **Admin Dashboard**: Comprehensive admin interface for managing:
  - Inductions
  - Chapters
  - Questions
  - Submissions
  - Administrators
- **Theme Support**: Light and dark mode support
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or yarn/pnpm/bun)
- **Backend API** running and accessible (see backend README for setup)

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd induction/induction-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

## Environment Variables

Create a `.env.local` file in the `induction-frontend` directory with the following variables:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Environment Variables Explained

- `NEXT_PUBLIC_API_URL`: The base URL for your backend API. 
  - For local development: `http://localhost:8000/api`
  - For production: `https://your-api-domain.com/api`
  - **Note**: The `/api` suffix is automatically appended by the API client, so include it in the URL.

## Development

1. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

3. **Make changes** - The page will automatically reload when you edit files

### Development Notes

- The app uses **Next.js 16** with the App Router
- **TypeScript** is enabled with strict mode
- **Tailwind CSS v4** is used for styling
- The app uses **React 19** with client components
- Path aliases are configured: `@/*` maps to the root directory

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server (after building)
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

```
induction-frontend/
├── app/                          # Next.js App Router pages
│   ├── (admin)/                  # Admin route group
│   ├── (user)/                   # User route group
│   ├── admin/                    # Admin pages
│   │   ├── dashboard/           # Admin dashboard
│   │   ├── inductions/          # Manage inductions
│   │   ├── submissions/         # View submissions
│   │   └── admins/              # Manage administrators
│   ├── inductions/               # User induction pages
│   │   └── [submissionId]/      # Dynamic submission routes
│   │       └── chapter/         # Chapter viewing and questions
│   ├── login/                    # User login page
│   ├── progress/                 # User progress tracking
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (redirects based on auth)
│   ├── providers.tsx             # Auth context provider
│   └── theme-provider.tsx        # Theme context provider
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   └── ...                   # Other UI components
│   ├── Header.tsx                # Application header
│   ├── AdminHeader.tsx           # Admin-specific header
│   ├── VideoPlayer.tsx           # Video player component
│   └── ThemeToggle.tsx           # Theme switcher
├── lib/                          # Utility libraries
│   └── api.ts                    # API client and endpoints
├── public/                       # Static assets
├── utils/                        # Utility functions
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## Building for Production

1. **Set environment variables** for production:
   ```env
   NEXT_PUBLIC_API_URL=https://your-production-api.com/api
   ```

2. **Build the application**:
   ```bash
   npm run build
   ```

3. **Start the production server**:
   ```bash
   npm run start
   ```

The production build will be optimized and ready for deployment.

## Deployment

### Deploying to Vercel

This project is optimized for deployment on [Vercel](https://vercel.com):

1. **Push your code** to a Git repository (GitHub, GitLab, or Bitbucket)

2. **Import your project** on Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Select the `induction-frontend` directory as the root directory

3. **Configure environment variables**:
   - In your Vercel project settings, go to "Environment Variables"
   - Add `NEXT_PUBLIC_API_URL` with your production API URL
   - Example: `https://api.yourdomain.com/api`

4. **Deploy**:
   - Vercel will automatically detect Next.js and deploy
   - The build process will run `npm run build`
   - Your app will be live at `https://your-project.vercel.app`

### Deploying to Other Platforms

For other platforms (Netlify, AWS, etc.), ensure:

- Node.js 18+ is available
- Build command: `npm run build`
- Output directory: `.next`
- Environment variables are set correctly

## API Integration

The frontend communicates with a Laravel backend API. Ensure:

1. **CORS is configured** on the backend to allow requests from your frontend domain
2. **Authentication tokens** are stored in localStorage and sent with API requests
3. **API endpoints** match the expected structure (see `lib/api.ts`)

### API Endpoints Used

- `/auth/login` - User authentication
- `/auth/admin/login` - Admin authentication
- `/auth/me` - Get current user
- `/inductions/active` - Get available inductions
- `/submissions/{id}` - Get submission details
- `/chapters/{id}/video/completion` - Check video completion
- `/chapters/{id}/video/progress` - Update video progress
- And more... (see `lib/api.ts` for complete list)

## Troubleshooting

### Build Errors

- **TypeScript errors**: Run `npm run lint` to identify issues
- **Missing environment variables**: Ensure `.env.local` exists with `NEXT_PUBLIC_API_URL`
- **API connection issues**: Verify the backend is running and CORS is configured

### Common Issues

1. **"Cannot connect to API"**:
   - Check that `NEXT_PUBLIC_API_URL` is set correctly
   - Verify the backend server is running
   - Check browser console for CORS errors

2. **"Authentication failed"**:
   - Clear localStorage: `localStorage.clear()` in browser console
   - Verify token is being stored correctly
   - Check backend authentication endpoints

3. **"Module not found"**:
   - Delete `node_modules` and `.next` directories
   - Run `npm install` again
   - Restart the dev server

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Fonts**: Geist Sans & Geist Mono (via Next.js)
- **State Management**: React Context API
- **HTTP Client**: Fetch API (custom wrapper)

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure TypeScript compiles without errors: `npm run build`
4. Test your changes locally
5. Submit a pull request

## License

[Add your license information here]

## Support

For issues and questions:
- Check the backend README for API documentation
- Review the codebase comments for implementation details
- Contact the development team
