# 🚀 Complete Deployment Guide

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB connection tested
- [ ] AlphaVantage API key valid
- [ ] Gemini API key valid
- [ ] Local testing complete
- [ ] Git repository created
- [ ] `.env` added to `.gitignore`

---

## 🌐 Option 1: Deploy to Railway (Recommended)

### Step 1: Prepare Repository

```bash
# Create .gitignore
cat > .gitignore << EOF
node_modules/
.env
.DS_Store
*.log
EOF

# Initialize git
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Push to GitHub

```bash
# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/finora-backend.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway auto-detects Node.js

### Step 4: Add Environment Variables

In Railway dashboard → **Variables** tab:

```
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
ALPHA_VANTAGE_KEY=your_key
GEMINI_API_KEY=your_key
CORS_ORIGIN=https://your-frontend-domain.com
```

### Step 5: Add MongoDB

1. In Railway, click **"New"** → **"Database"** → **"MongoDB"**
2. Copy the connection string
3. Update `MONGO_URI` variable

### Step 6: Deploy

Railway auto-deploys on every git push!

```bash
# Make changes
git add .
git commit -m "Update code"
git push

# Railway auto-deploys in ~2 minutes
```

**Your API will be live at**: `https://finora-backend-production.up.railway.app`

---

## 🎯 Option 2: Deploy to Render (Free Tier)

### Step 1: Create Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `finora-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Environment Variables

Add in Render dashboard:

```
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_uri
ALPHA_VANTAGE_KEY=your_key
GEMINI_API_KEY=your_key
CORS_ORIGIN=https://your-frontend.com
```

### Step 4: Deploy

Click **"Create Web Service"** - First deploy takes 5-10 minutes.

**Your API**: `https://finora-backend.onrender.com`

---

## 🐳 Option 3: Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:5000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/finora-ai
      - ALPHA_VANTAGE_KEY=${ALPHA_VANTAGE_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
```

### Deploy

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## ☁️ Option 4: AWS EC2 Deployment

### Step 1: Launch EC2 Instance

1. Launch Ubuntu 22.04 instance
2. Security group: Allow ports 22, 5000, 27017
3. Download `.pem` key file

### Step 2: Connect to EC2

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2
```

### Step 4: Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/finora-backend.git
cd finora-backend

# Install dependencies
npm install

# Create .env file
nano .env
```

Add your environment variables, then:

```bash
# Start with PM2
pm2 start server.js --name finora-api

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup
```

### Step 5: Configure Nginx (Optional)

```bash
# Install Nginx
sudo apt install nginx -y

# Configure reverse proxy
sudo nano /etc/nginx/sites-available/finora
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/finora /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 MongoDB Atlas Setup (Cloud Database)

### Step 1: Create Account

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up (free tier available)

### Step 2: Create Cluster

1. Click **"Build a Database"**
2. Choose **"M0 Free"** tier
3. Select region closest to your users
4. Click **"Create"**

### Step 3: Configure Access

1. **Database Access**:
   - Create user: `finora_admin`
   - Set strong password
   - Grant **"Read and write to any database"**

2. **Network Access**:
   - Click **"Add IP Address"**
   - Choose **"Allow access from anywhere"** (0.0.0.0/0)
   - Or add your server's IP

### Step 4: Get Connection String

1. Click **"Connect"**
2. Choose **"Drivers"**
3. Copy connection string:

```
mongodb+srv://finora_admin:<password>@cluster0.xxxxx.mongodb.net/finora-ai?retryWrites=true&w=majority
```

4. Replace `<password>` with your actual password
5. Use this as `MONGO_URI` in your `.env`

---

## 🧪 Post-Deployment Testing

### Test API Health

```bash
curl https://your-api-domain.com/
```

Expected:
```json
{
  "ok": true,
  "message": "Finora AI Investment Analyst API",
  "status": "Running"
}
```

### Test Company Endpoint

```bash
curl https://your-api-domain.com/api/company/AAPL
```

### Test Analysis

```bash
curl -X POST https://your-api-domain.com/api/analyze/AAPL
```

### Test Chat

```bash
curl -X POST https://your-api-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the PE ratio?", "symbol": "AAPL"}'
```

---

## 🔍 Monitoring & Logs

### Railway Logs

```bash
# View live logs in dashboard
# Or use CLI:
railway logs
```

### Render Logs

- View logs in dashboard
- Click **"Logs"** tab

### PM2 Logs (VPS)

```bash
# View logs
pm2 logs finora-api

# Monitor resources
pm2 monit

# Restart if needed
pm2 restart finora-api
```

---

## 🚨 Troubleshooting

### Issue: MongoDB Connection Failed

**Solution:**
- Check `MONGO_URI` format
- Verify network access in Atlas
- Test connection: `mongosh "your-connection-string"`

### Issue: AlphaVantage Rate Limit

**Solution:**
- Wait 1 minute between requests (free tier: 5/min)
- Consider premium plan for production

### Issue: Gemini API Error

**Solution:**
- Verify API key validity
- Check quota limits
- Ensure proper request format

### Issue: CORS Error

**Solution:**
- Set correct `CORS_ORIGIN` in `.env`
- For multiple origins:
  ```javascript
  app.use(cors({
    origin: ['https://frontend1.com', 'https://frontend2.com']
  }));
  ```

---

## 📊 Production Best Practices

### 1. Environment Variables

✅ **Never commit `.env` to Git**
✅ Use different keys for dev/prod
✅ Rotate keys regularly

### 2. Rate Limiting

Already implemented:
- 100 requests per 15 minutes
- Adjust in `.env`:
  ```
  RATE_LIMIT_MAX_REQUESTS=200
  RATE_LIMIT_WINDOW_MS=900000
  ```

### 3. Logging

Add production logging:
```bash
npm install winston
```

### 4. Error Tracking

Consider adding:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay

### 5. Monitoring

Set up health checks:
- [UptimeRobot](https://uptimerobot.com)
- [Better Uptime](https://betteruptime.com)

### 6. Backup Strategy

**MongoDB Atlas**:
- Automatic backups enabled
- Point-in-time recovery

**Manual Backup**:
```bash
mongodump --uri="your-mongo-uri" --out=/backup/$(date +%Y-%m-%d)
```

---

## 🎯 Performance Optimization

### 1. Enable Compression

Already enabled in `server.js`:
```javascript
app.use(compression());
```

### 2. Database Indexing

Already added in models:
```javascript
CompanySchema.index({ symbol: 1, fetchedAt: -1 });
```

### 3. Caching Strategy

- Company data: 24 hours
- Analysis: 7 days
- Consider Redis for production

### 4. Load Balancing

For high traffic:
- Use PM2 cluster mode:
  ```bash
  pm2 start server.js -i max
  ```

---

## 📈 Scaling Checklist

When you reach 1000+ users:

- [ ] Upgrade MongoDB to paid tier
- [ ] Add Redis caching layer
- [ ] Implement CDN (Cloudflare)
- [ ] Use load balancer
- [ ] Add database replicas
- [ ] Implement queue system (Bull/BullMQ)
- [ ] Microservices architecture

---

## 🔐 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Rate limiting active
- [ ] CORS properly configured
- [ ] MongoDB authentication enabled
- [ ] Regular security updates
- [ ] API key rotation policy
- [ ] Input validation
- [ ] SQL injection prevention (using Mongoose)

---

## 📞 Support & Maintenance

### Weekly Tasks
- Check error logs
- Monitor API usage
- Review rate limits
- Database performance

### Monthly Tasks
- Update dependencies: `npm audit fix`
- Review security: `npm audit`
- Backup database
- Check API key quotas

### Quarterly Tasks
- Rotate API keys
- Performance audit
- Cost optimization
- User feedback review

---

## 🎉 Success Metrics

After deployment, track:

| Metric | Target | Tool |
|--------|--------|------|
| Uptime | >99.9% | UptimeRobot |
| Response Time | <200ms | PM2/Logs |
| Error Rate | <1% | Sentry |
| API Calls/Day | Growing | Analytics |
| User Satisfaction | >4.5/5 | Surveys |

---

## 🚀 You're Live!

Your Finora API is now production-ready! 

**Next Steps:**
1. Connect frontend
2. Test all features
3. Monitor performance
4. Gather user feedback
5. Iterate and improve

**Need help?** Open an issue on GitHub!

---

Built with ❤️ by Team Certified Losers
