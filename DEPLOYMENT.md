# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [x] Firebase config moved to environment file
- [x] Production environment created
- [x] API keys secured (use environment variables in CI/CD)

### 2. Build Optimization
- [x] Production build script configured
- [x] Bundle size budgets set (500KB initial, 1MB max)
- [x] Source maps disabled for production
- [x] Output hashing enabled for cache busting

### 3. Security
- [x] Security headers configured (CSP, X-Frame-Options, etc.)
- [x] Firebase security rules (configure in Firebase Console)
- [x] Global error handler implemented
- [x] Input validation on all forms

### 4. Performance
- [x] Lazy loading routes (if needed)
- [x] Performance monitoring added
- [x] Image optimization (use WebP format)
- [x] Caching strategy configured

### 5. SEO & PWA
- [x] Meta tags for SEO
- [x] Open Graph tags
- [x] PWA manifest
- [x] robots.txt
- [x] Favicon

### 6. Monitoring
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Set up analytics (Google Analytics, Firebase Analytics)
- [ ] Set up performance monitoring
- [ ] Set up uptime monitoring

## Build Commands

### Development Build
```bash
npm start
```

### Production Build
```bash
npm run build:prod
```

This creates optimized bundle in `dist/` folder with:
- Minification
- Tree shaking
- Dead code elimination
- Output hashing
- No source maps

## Deployment Options

### Option 1: Firebase Hosting (Recommended)

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Initialize Firebase Hosting**
```bash
firebase init hosting
```
- Select your Firebase project
- Set public directory to `dist`
- Configure as single-page app: Yes
- Don't overwrite index.html

4. **Build and Deploy**
```bash
npm run build:prod
firebase deploy --only hosting
```

5. **Custom Domain (Optional)**
```bash
firebase hosting:channel:deploy production
```

### Option 2: Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build**
```bash
npm run build:prod
```

3. **Deploy**
```bash
netlify deploy --prod --dir=dist
```

4. **Configure Redirects**
Create `dist/_redirects`:
```
/*    /index.html   200
```

### Option 3: Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Configure**
Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Option 4: AWS S3 + CloudFront

1. **Build**
```bash
npm run build:prod
```

2. **Upload to S3**
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

3. **Invalidate CloudFront Cache**
```bash
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Post-Deployment

### 1. Verify Deployment
- [ ] Test login functionality
- [ ] Test habit creation
- [ ] Test habit editing/deletion
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Check console for errors
- [ ] Verify analytics tracking

### 2. Performance Testing
```bash
# Lighthouse audit
npx lighthouse https://your-domain.com --view

# Check bundle size
npm run build:prod
ls -lh dist/
```

### 3. Security Testing
- [ ] Check security headers: https://securityheaders.com
- [ ] Test HTTPS configuration
- [ ] Verify Firebase security rules
- [ ] Check for exposed API keys

### 4. SEO Testing
- [ ] Google Search Console verification
- [ ] Submit sitemap
- [ ] Test meta tags: https://metatags.io
- [ ] Check mobile-friendliness

## Firebase Security Rules

Configure in Firebase Console > Realtime Database > Rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "habits": {
          ".validate": "newData.isString() || newData.hasChildren()",
          ".indexOn": ["createdAt"]
        },
        "logs": {
          ".validate": "newData.isString() || newData.hasChildren()",
          ".indexOn": ["date", "habitId"]
        }
      }
    }
  }
}
```

## Environment Variables

For CI/CD, set these environment variables:

```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_DATABASE_URL=your_database_url
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build:prod
      
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## Monitoring Setup

### 1. Google Analytics
Add to `index.html` before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. Sentry Error Tracking
```bash
npm install @sentry/angular
```

Update `error-handler.service.ts`:
```typescript
import * as Sentry from "@sentry/angular";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

## Performance Optimization

### Bundle Analysis
```bash
npm install -g webpack-bundle-analyzer
ng build --stats-json
webpack-bundle-analyzer dist/stats.json
```

### Image Optimization
- Use WebP format
- Compress images: https://tinypng.com
- Use lazy loading for images
- Add width/height attributes

### Caching Strategy
- Static assets: 1 year cache
- HTML: No cache
- API responses: Short cache (5 min)

## Backup Strategy

### Automated Backups
Create Firebase Cloud Function:
```javascript
exports.backupDatabase = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // Backup logic
  });
```

### Manual Backup
```bash
firebase database:get / > backup-$(date +%Y%m%d).json
```

## Rollback Plan

If deployment fails:

1. **Firebase Hosting**
```bash
firebase hosting:rollback
```

2. **Netlify**
- Go to Deploys tab
- Click "Publish deploy" on previous version

3. **Vercel**
- Go to Deployments
- Click "Promote to Production" on previous version

## Support & Maintenance

### Regular Tasks
- [ ] Weekly: Check error logs
- [ ] Weekly: Review performance metrics
- [ ] Monthly: Update dependencies
- [ ] Monthly: Security audit
- [ ] Quarterly: User feedback review

### Monitoring Alerts
Set up alerts for:
- Error rate > 1%
- Response time > 3s
- Downtime > 1 minute
- Bundle size increase > 10%

## Resources

- Firebase Console: https://console.firebase.google.com
- Angular Docs: https://angular.io/docs
- Web.dev Performance: https://web.dev/performance
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci

## Contact

For deployment issues, contact: [your-email@domain.com]
