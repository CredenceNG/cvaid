# Deployment Guide

This Next.js application can be deployed to multiple hosting platforms. Choose the one that best fits your needs.

## Quick Comparison

| Platform | Difficulty | Cost | Best For |
|----------|-----------|------|----------|
| **Vercel** | Easiest | Free tier | Quick deployment, Next.js optimized |
| **DigitalOcean** | Easy | $5/mo+ | Full control, predictable pricing |
| **Railway** | Easy | $5/mo | Simple setup, good free tier |
| **Render** | Easy | Free tier | Cost-effective, simple |
| **Self-Hosted** | Medium | Variable | Complete control |

---

## Option 1: Vercel (Recommended for Beginners)

**Why Vercel:**
- Built by the Next.js team
- Zero configuration needed
- Automatic HTTPS
- Global CDN
- Generous free tier

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd resume-optimizer-nextjs
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add STRIPE_SECRET_KEY
   vercel env add STRIPE_WEBHOOK_SECRET
   vercel env add NEXT_PUBLIC_STRIPE_PRICE_ID
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   ```

5. **Redeploy**
   ```bash
   vercel --prod
   ```

**Alternatively, use Vercel Dashboard:**
- Go to [vercel.com](https://vercel.com)
- Import from GitHub
- Add environment variables in Settings → Environment Variables
- Deploy automatically on every push

---

## Option 2: DigitalOcean App Platform

**Why DigitalOcean:**
- Predictable pricing ($5-12/month)
- Good performance
- Easy to scale
- Simple interface

**Steps:**

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Create App on DigitalOcean**
   - Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect your GitHub repository
   - Select `resume-optimizer-nextjs` folder

3. **Configure Build Settings**
   - **Build Command:** `npm run build`
   - **Run Command:** `npm start`
   - **HTTP Port:** 3000

4. **Add Environment Variables**
   Go to Settings → App-Level Environment Variables:
   ```
   GEMINI_API_KEY=your_key
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   ```

5. **Deploy**
   - Click "Deploy"
   - Your app will be live at: `your-app-name.ondigitalocean.app`

**Custom Domain:**
- Go to Settings → Domains
- Add your custom domain
- Update DNS records as instructed

---

## Option 3: Railway

**Why Railway:**
- Simple CLI and dashboard
- Good free tier ($5/month credit)
- Automatic SSL
- GitHub integration

**Steps:**

1. **Install Railway CLI**
   ```bash
   npm install -g railway
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd resume-optimizer-nextjs
   railway init
   ```

4. **Add Environment Variables**
   ```bash
   railway variables set GEMINI_API_KEY=your_key
   railway variables set STRIPE_SECRET_KEY=sk_live_xxx
   railway variables set STRIPE_WEBHOOK_SECRET=whsec_xxx
   railway variables set NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxx
   railway variables set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   ```

5. **Deploy**
   ```bash
   railway up
   ```

**Or use Railway Dashboard:**
- Go to [railway.app](https://railway.app)
- Create new project from GitHub
- Add environment variables
- Deploy automatically

---

## Option 4: Render

**Why Render:**
- Generous free tier
- Good for side projects
- Auto-deploy from GitHub

**Steps:**

1. **Push to GitHub** (if not already done)

2. **Create Web Service on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   - **Name:** resume-optimizer
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free or Starter

4. **Add Environment Variables**
   In the Environment section:
   ```
   GEMINI_API_KEY=your_key
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Your app will be live at: `your-app-name.onrender.com`

**Note:** Free tier services sleep after 15 min of inactivity (cold starts)

---

## Option 5: Self-Hosted (Docker)

**Why Self-Host:**
- Complete control
- Use your own infrastructure
- No platform limitations

### Using Docker

**1. Create Dockerfile**

Already included in the project. Check the file at the root.

**2. Create docker-compose.yml**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - NEXT_PUBLIC_STRIPE_PRICE_ID=${NEXT_PUBLIC_STRIPE_PRICE_ID}
      - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      - NEXT_PUBLIC_CLIENT_URL=${NEXT_PUBLIC_CLIENT_URL}
    restart: unless-stopped
```

**3. Build and Run**
```bash
docker-compose up -d
```

### Using PM2 (Process Manager)

**1. Install PM2**
```bash
npm install -g pm2
```

**2. Build Application**
```bash
npm run build
```

**3. Start with PM2**
```bash
pm2 start npm --name "resume-optimizer" -- start
pm2 save
pm2 startup
```

**4. Configure Nginx (Optional)**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Post-Deployment Checklist

### 1. Update Stripe Webhook URL
- Go to Stripe Dashboard → Developers → Webhooks
- Update endpoint URL to: `https://yourdomain.com/api/webhook`
- Copy the webhook secret and update `STRIPE_WEBHOOK_SECRET`

### 2. Test Payment Flow
- Make a test payment
- Verify webhook receives events
- Check payment verification works

### 3. Test Resume Upload
- Upload PDF resume
- Upload DOCX resume
- Test AI analysis

### 4. Security Checklist
- [ ] All API keys are in environment variables (not hardcoded)
- [ ] `.env.local` is in `.gitignore`
- [ ] Stripe is in test mode OR live keys are secure
- [ ] HTTPS is enabled
- [ ] CORS is properly configured

### 5. Performance
- [ ] Test page load speed
- [ ] Verify AI responses are fast
- [ ] Check Stripe checkout loads properly

### 6. Monitoring (Optional)
Consider adding:
- Error tracking (Sentry)
- Analytics (Google Analytics, Vercel Analytics)
- Uptime monitoring (UptimeRobot, Better Uptime)

---

## Environment Variables Reference

### Required (Server-Side Only)
```bash
GEMINI_API_KEY=                    # Google AI API key
STRIPE_SECRET_KEY=                 # Stripe secret key (sk_test_ or sk_live_)
STRIPE_WEBHOOK_SECRET=             # Stripe webhook secret (whsec_)
```

### Required (Public - Client-Side)
```bash
NEXT_PUBLIC_STRIPE_PRICE_ID=       # Stripe price ID (price_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= # Stripe publishable key (pk_test_ or pk_live_)
```

### Optional
```bash
NEXT_PUBLIC_CLIENT_URL=            # Your domain (auto-detected on most platforms)
```

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working
- Make sure `NEXT_PUBLIC_` prefix for client-side vars
- Restart the application after changing env vars
- Check platform dashboard for typos

### API Routes Return 404
- Verify route files are named `route.ts`
- Check file is in correct directory: `app/api/*/route.ts`
- Ensure functions are exported: `export async function POST`

### Stripe Webhook Fails
- Verify webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Test webhook with Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3000/api/webhook
  ```

### Cold Starts (Free Tiers)
Some platforms sleep inactive apps:
- **Render:** 15 min inactivity (free tier)
- **Railway:** Never sleeps (with credit)
- **Vercel:** No cold starts on Hobby plan

**Solution:** Use cron-job.org to ping your app every 10 minutes

---

## Cost Estimates

### Development/Personal Use
- **Vercel Hobby:** Free (hobby projects)
- **Render Free:** $0/month (with cold starts)
- **Railway:** $5/month credit (free with GitHub Student)

### Small Business
- **Vercel Pro:** $20/month
- **DigitalOcean:** $5-12/month
- **Railway:** $10-20/month
- **Render Starter:** $7/month

### Production/Scale
- **Vercel Enterprise:** Custom pricing
- **DigitalOcean:** $12-48/month
- **Self-Hosted VPS:** $5-50/month + management time

---

## Support

For deployment issues:
- Check the [Migration Guide](./MIGRATION_GUIDE.md)
- Review platform documentation
- Check Next.js deployment docs
- Open an issue on GitHub

Happy Deploying! 🚀
