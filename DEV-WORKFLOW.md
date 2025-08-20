# 🚀 Vocational Scheduler - Development Workflow

## 📋 Quick Start

### 1. Start Local Development
```bash
npm run dev
# Opens http://localhost:3000
# Connected to live Neon database
# Hot reloading enabled
```

### 2. Test Your Changes
```bash
npm run test:local
# Quick API test to verify database connection
```

### 3. Deploy to Production
```bash
npm run deploy
# Automatically: git add + commit + push
# Vercel will auto-deploy from GitHub
```

## 🔄 Complete Development Cycle

### Local Development
- **URL**: http://localhost:3000
- **Database**: Live Neon database (shared with production)
- **Environment**: `.env.local` file
- **Hot Reload**: Changes appear instantly

### Version Control
```bash
# Manual approach:
git add .
git commit -m "Feature: Your description"
git push origin main

# Or use shortcut:
npm run deploy
```

### Automatic Deployment
- **Trigger**: Push to GitHub main branch
- **Platform**: Vercel (already configured)
- **URL**: https://vocational-scheduler.vercel.app
- **Database**: Same Neon database

## 🛠️ Available Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run dev:fresh` | Kill existing server and start fresh |
| `npm run build` | Build for production |
| `npm run test:local` | Test API connectivity |
| `npm run deploy` | Quick deploy to production |
| `npm run db:studio` | Open database admin panel |

## 🎯 Best Practices

### Before Committing:
1. ✅ Test changes on localhost:3000
2. ✅ Verify database operations work
3. ✅ Check responsive design (iPad optimization)
4. ✅ No console errors

### Environment Variables:
- **Local**: `.env.local` (already configured)
- **Production**: Vercel dashboard (already set)
- **Database**: Shared Neon database for consistency

### Database Changes:
```bash
# If you modify schema:
npm run db:generate  # Generate migration
npm run db:push      # Apply to database
```

## 🚨 Troubleshooting

### Server Not Updating?
```bash
npm run dev:fresh
```

### Database Issues?
```bash
npm run test:local
# Should return student data
```

### Vercel Deploy Failed?
- Check Vercel dashboard for build logs
- Ensure environment variables are set
- Verify GitHub connection

## 📊 Current Setup Status

✅ **Database**: Neon PostgreSQL connected  
✅ **Local Environment**: `.env.local` configured  
✅ **Version Control**: GitHub repository linked  
✅ **Deployment**: Vercel auto-deploy enabled  
✅ **Data Flow**: 100% database-driven  

Your development environment is perfectly configured for the local → test → commit → deploy workflow!
