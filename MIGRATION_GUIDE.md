# Migration Guide: Vite + Express → Next.js

This document explains the migration from the Vite/React + Express architecture to Next.js.

## Architecture Changes

### Before (Vite + Express)
```
Frontend (Vite/React)          Backend (Express)
     ↓                              ↓
  dist/ (static)              server/index.js
     ↓                              ↓
 CDN Hosting             Separate Server Hosting
 (Netlify)                  (Needed: Render/Railway/etc)
```

**Problems:**
- Requires two separate hosting services
- Complex deployment process
- Separate environment configurations
- No built-in API routes

### After (Next.js)
```
Next.js Full-Stack Application
        ↓
Frontend + API Routes (unified)
        ↓
   Single Deployment
 (Vercel/DigitalOcean/Railway/Render/etc)
```

**Benefits:**
- Single codebase, single deployment
- API routes automatically become serverless functions
- Built-in optimization and SSR support
- Deploy anywhere that supports Node.js

## File Structure Comparison

### Old Structure
```
resume-optimizer/
├── components/           # React components
├── services/            # API service functions
├── server/
│   └── index.js         # Express server
├── index.html
├── index.tsx            # React entry point
├── App.tsx              # Main component
└── vite.config.ts
```

###New Structure
```
resume-optimizer-nextjs/
├── app/
│   ├── api/                    # API routes (replaces server/)
│   │   ├── analyze/route.ts
│   │   ├── create-checkout-session/route.ts
│   │   ├── verify-payment/route.ts
│   │   ├── webhook/route.ts
│   │   └── health/route.ts
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page (replaces App.tsx)
│   └── globals.css
├── components/                  # React components (unchanged)
└── next.config.ts
```

## Key Changes

### 1. API Routes (Server → Next.js API Routes)

**Before (Express):**
```javascript
// server/index.js
app.post('/api/analyze', async (req, res) => {
  const { resume, goals } = req.body;
  // ... logic
  res.json({ feedback });
});
```

**After (Next.js):**
```typescript
// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { resume, goals } = await request.json();
  // ... logic
  return NextResponse.json({ feedback });
}
```

### 2. Environment Variables

**Before (Vite):**
```bash
VITE_API_URL=http://localhost:3002
VITE_STRIPE_PRICE_ID=price_xxx
```

**After (Next.js):**
```bash
# Server-side only (secure)
GEMINI_API_KEY=xxx
STRIPE_SECRET_KEY=sk_test_xxx

# Client-side (public)
NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxx
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
```

**Important:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser!

### 3. Client Components

All components using React hooks must have `'use client'` directive:

```typescript
'use client';

import { useState } from 'react';

export function MyComponent() {
  const [state, setState] = useState();
  // ...
}
```

### 4. Service Functions

**Before:** Separate service files calling external API

```typescript
// services/geminiService.ts
const response = await fetch(`${API_BASE_URL}/api/analyze`, {...});
```

**After:** Direct API calls to local Next.js routes

```typescript
// Directly in component or inline
const response = await fetch('/api/analyze', {...});
```

## Deployment Options

Next.js can be deployed to multiple platforms:

### 1. **Vercel** (Easiest - Made by Next.js creators)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 2. **DigitalOcean App Platform**
- Connect your GitHub repository
- Select "Next.js" as framework
- Set environment variables in dashboard
- Deploy automatically on push

### 3. **Railway**
```bash
npm install -g railway
railway login
railway init
railway up
```

### 4. **Render**
- Connect GitHub repository
- Build Command: `npm run build`
- Start Command: `npm start`
- Add environment variables in dashboard

### 5. **Self-Hosted (Docker)**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Setup

### Development
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your keys
# Then run:
npm run dev
```

### Production
Set these environment variables in your hosting platform:

```bash
# Required
GEMINI_API_KEY=your_key
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Optional (auto-detected on most platforms)
NEXT_PUBLIC_CLIENT_URL=https://yourdomain.com
```

## Build & Run

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm run build
npm start
```

## Stripe Webhook Configuration

Update your Stripe webhook endpoint:
- Old: `https://yourbackend.com/api/webhook`
- New: `https://yourdomain.com/api/webhook`

## Migration Benefits

1. **Simplified Architecture**: One codebase instead of two
2. **Better DX**: Hot reload for both frontend and API routes
3. **Automatic Optimization**: Image optimization, code splitting, SSR
4. **Portable**: Deploy anywhere Node.js is supported
5. **Cost Effective**: Single hosting bill instead of two
6. **Easier Maintenance**: No need to sync two repos/deployments

## Testing the Migration

1. **Install dependencies:**
   ```bash
   cd resume-optimizer-nextjs
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Test all features:**
   - Resume upload (PDF/DOCX)
   - AI analysis
   - Payment flow
   - Full wizard journey

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Troubleshooting

### "Module not found" errors
- Make sure all components have the correct import paths
- Check that `@/` alias is configured in `tsconfig.json`

### API routes not working
- Ensure route files are named `route.ts` (not `index.ts`)
- Check that HTTP methods are exported: `export async function POST/GET/etc`

### Environment variables undefined
- Client-side vars must be prefixed with `NEXT_PUBLIC_`
- Restart dev server after changing `.env.local`

### Stripe checkout not loading
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check browser console for specific Stripe errors

## Next Steps

1. Deploy to your chosen platform
2. Update Stripe webhook URL
3. Test payment flow in production
4. Monitor with Next.js Analytics (optional)
5. Consider adding:
   - Database for user data
   - Authentication
   - Rate limiting
   - Caching

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Deployment Guide](https://nextjs.org/docs/deployment)
- [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [API Routes](https://nextjs.org/docs/api-routes/introduction)
