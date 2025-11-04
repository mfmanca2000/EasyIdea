# Easy Idea - App Idea Manager

A quick and beautiful way to save and manage your app ideas using post-it notes.

## Features

- **Quick Add**: Rapidly save new app ideas with a streamlined input form
- **Beautiful Post-its**: Ideas displayed as colorful, interactive post-it notes
- **Edit & Delete**: Click any post-it to edit or delete it
- **Secure Auth**: Google authentication with email whitelist access control
- **Responsive Design**: Works perfectly on desktop and mobile

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- Auth.js v5 (NextAuth)
- File-based JSON storage (easily replaceable with any database)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Cloud Project with OAuth credentials

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd EasyIdea
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Google OAuth credentials
   - Add your allowed email addresses

4. Generate an auth secret:
   ```bash
   openssl rand -base64 32
   ```
   Add this to your `.env.local` as `AUTH_SECRET`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Auth Configuration
AUTH_SECRET=your-secret-here
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_TRUST_HOST=true

# Allowed emails (comma-separated)
ALLOWED_EMAILS=your-email@gmail.com,another-email@gmail.com
```

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create "OAuth 2.0 Client ID"
5. Add authorized redirect URIs:
   - For local: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://your-domain.vercel.app/api/auth/callback/google`
6. Copy the Client ID and Client Secret

## Deploying to Vercel

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and import your repository

3. Add the environment variables in Vercel:
   - `AUTH_SECRET`
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `AUTH_TRUST_HOST=true`
   - `ALLOWED_EMAILS`

4. Don't forget to add your Vercel deployment URL to Google OAuth authorized redirect URIs:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```

5. Deploy!

## Storage

By default, this app uses a simple JSON file for data storage (`data/ideas.json`). This works well for personal use and small teams.

### Migrating to a Database

To use a proper database (recommended for production), you can easily replace the file-based storage in `lib/db.ts` with:
- **Vercel Postgres**: `@vercel/postgres`
- **Supabase**: `@supabase/supabase-js`
- **MongoDB**: `mongodb`
- **Prisma**: Works with any SQL database

The API routes (`app/api/ideas/*`) won't need changes - just update the database functions in `lib/db.ts`.

## Project Structure

```
├── app/
│   ├── api/ideas/          # API routes for CRUD operations
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Main dashboard
│   └── page.tsx            # Root redirect
├── components/
│   ├── ui/                 # Shadcn UI components
│   └── post-it.tsx         # Post-it note component
├── lib/
│   ├── db.ts               # Database functions
│   └── utils.ts            # Utility functions
├── auth.ts                 # Auth.js configuration
└── auth.config.ts          # Auth.js config
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
