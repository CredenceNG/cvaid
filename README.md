# Resume Optimizer AI - Next.js

An AI-powered resume analysis and optimization tool built with Next.js, Google Gemini AI, and Stripe.

## Features

- **AI-Powered Analysis**: Advanced resume analysis using Google Gemini AI
- **Multiple Upload Formats**: Support for PDF and DOCX files
- **Comprehensive Feedback**: Detailed, section-by-section breakdown
- **Tailored Recommendations**: Job-specific optimization suggestions
- **Professional Rewrite**: AI-generated optimized resume copy
- **Cover Letter Generator**: Custom cover letters based on your resume
- **Secure Payments**: Stripe integration for premium features
- **Responsive Design**: Works perfectly on desktop and mobile

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: Google Gemini AI (gemini-2.5-flash)
- **Payments**: Stripe (Embedded Checkout)
- **File Processing**: PDF.js, Mammoth.js
- **Export**: jsPDF, docx

## Quick Start

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- Google Gemini API key
- Stripe account (test mode for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd resume-optimizer-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   NEXT_PUBLIC_CLIENT_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Getting API Keys

### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and add to `.env.local` as `GEMINI_API_KEY`

### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your test API keys from Developers → API keys
3. Create a product and price
4. Copy keys to `.env.local`:
   - `STRIPE_SECRET_KEY` (Secret key)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Publishable key)
   - `NEXT_PUBLIC_STRIPE_PRICE_ID` (Price ID from product)

### Stripe Webhook (for local testing)
```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhook

# Copy the webhook secret to .env.local
```

## Project Structure

```
resume-optimizer-nextjs/
├── app/
│   ├── api/                      # API routes (serverless functions)
│   │   ├── analyze/             # AI resume analysis
│   │   ├── create-checkout-session/  # Stripe checkout
│   │   ├── verify-payment/      # Payment verification
│   │   ├── webhook/             # Stripe webhooks
│   │   └── health/              # Health check endpoint
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main application page
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ResumeInputForm.tsx
│   ├── WizardPlaceholder.tsx
│   ├── SummaryStep.tsx
│   ├── DetailsStep.tsx
│   ├── RefinedCopyStep.tsx
│   ├── CoverLetterStep.tsx
│   ├── PaymentModal.tsx
│   └── icons/                   # Icon components
├── public/                       # Static assets
├── .env.local                    # Environment variables (not in git)
├── .env.example                  # Environment template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── Dockerfile                    # Docker configuration
├── MIGRATION_GUIDE.md           # Migration documentation
└── DEPLOYMENT.md                # Deployment guide
```

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Environment Variables

#### Server-Side (Secure)
- `GEMINI_API_KEY` - Google Gemini AI API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

#### Client-Side (Public)
- `NEXT_PUBLIC_STRIPE_PRICE_ID` - Stripe price ID
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_CLIENT_URL` - Your application URL

**Important**: Only variables prefixed with `NEXT_PUBLIC_` are accessible in the browser!

## Deployment

This application can be deployed to multiple platforms:

- **Vercel** (Recommended) - [See guide](./DEPLOYMENT.md#option-1-vercel-recommended-for-beginners)
- **DigitalOcean** - [See guide](./DEPLOYMENT.md#option-2-digitalocean-app-platform)
- **Railway** - [See guide](./DEPLOYMENT.md#option-3-railway)
- **Render** - [See guide](./DEPLOYMENT.md#option-4-render)
- **Self-Hosted** - [See guide](./DEPLOYMENT.md#option-5-self-hosted-docker)

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Architecture

This is a full-stack Next.js application:

- **Frontend**: React components with Tailwind CSS
- **Backend**: Next.js API routes (serverless functions)
- **AI**: Google Gemini AI for resume analysis
- **Payments**: Stripe Embedded Checkout
- **File Processing**: Client-side PDF/DOCX parsing

### Why Next.js?

Migrated from Vite + Express for:
- Unified codebase (no separate frontend/backend)
- Single deployment (no need for separate hosting)
- Built-in API routes
- Automatic optimization
- Better developer experience

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration information.

## Features Breakdown

### 1. Resume Upload
- Drag & drop or click to upload
- Support for PDF and DOCX formats
- Client-side file parsing for privacy

### 2. AI Analysis
Three-step analysis process:
1. **Summary**: High-level overview with immediate action items
2. **Detailed Feedback**: Section-by-section breakdown
3. **Refined Copy**: Complete rewritten resume + cover letter (premium)

### 3. Payment Integration
- Secure Stripe Embedded Checkout
- Server-side payment verification
- Webhook integration for payment tracking
- Local storage for session persistence

### 4. Export Options
- PDF export (jsPDF)
- DOCX export (docx library)
- Markdown copy to clipboard

## Security

- API keys stored securely in environment variables
- Payment processing handled by Stripe (PCI compliant)
- No sensitive data stored on server
- Client-side file processing (files never uploaded to server)
- Webhook signature verification

## Performance

- Server-side rendering for fast initial load
- Automatic code splitting
- Optimized images
- Lazy loading components
- Efficient caching strategy

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome)

## Support

- **Documentation**: Check [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues**: Open an issue on GitHub
- **Discussions**: Start a discussion for questions and ideas

---

**Built with ❤️ using Next.js**
