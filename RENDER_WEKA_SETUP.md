# Deploying WEKA on Render - Complete Guide

## 🎯 Overview

This guide shows you how to:
1. Deploy a Java Spring Boot service with WEKA on Render (FREE tier available)
2. Call it from your Hostinger PHP application
3. Get full WEKA capabilities without VPS upgrade

## ✅ Why Render?

- ✅ **Free tier available** (with limitations)
- ✅ Supports Java applications
- ✅ Easy deployment from GitHub
- ✅ Automatic HTTPS
- ✅ No credit card required (for free tier)
- ✅ Works perfectly with Hostinger shared hosting

---

## 📋 Prerequisites

1. GitHub account (free)
2. Render account (free)
3. Your Hostinger PHP app (already set up)

---

## 🚀 Step 1: Create Java Spring Boot Service

### Project Structure
```
weka-service/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── clustering/
│       │           └── WekaServiceApplication.java
│       │           └── ClusteringController.java
│       │           └── ClusteringService.java
│       └── resources/
│           └── application.properties
├── pom.xml
├── render.yaml (optional)
└── README.md
```

---

## 🚀 Step 2: Create Files

See the files I'll create below:
- `weka-service/pom.xml` - Maven dependencies
- `weka-service/src/main/java/...` - Java code
- `weka-service/render.yaml` - Render configuration

---

## 🚀 Step 3: Deploy to Render

### Option A: Deploy from GitHub (Recommended)

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/weka-service.git
   git push -u origin main
   ```

2. **Connect to Render**
   - Go to https://render.com
   - Sign up/login (free)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   - **Name:** `weka-clustering-service`
   - **Environment:** `Java`
   - **Build Command:** `mvn clean install`
   - **Start Command:** `java -jar target/weka-service-1.0.0.jar`
   - **Instance Type:** Free (or paid for better performance)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build (5-10 minutes first time)
   - Get your service URL: `https://weka-clustering-service.onrender.com`

### Option B: Deploy via Render CLI

```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# Deploy
render deploy
```

---

## 🔧 Step 4: Update PHP Integration

Update `api/clustering-weka.php` to call Render API instead of local Java.

---

## 🧪 Step 5: Test

```bash
# Test from command line
curl -X POST https://your-service.onrender.com/api/cluster \
  -H "Content-Type: application/json" \
  -d '{"students":[...],"category":"all","clusters":3}'
```

---

## 💰 Pricing

### Free Tier
- ✅ 750 hours/month (enough for testing)
- ✅ Sleeps after 15 min inactivity
- ✅ 512MB RAM
- ✅ Shared CPU

### Paid Plans
- $7/month: Always on, 512MB RAM
- $25/month: Always on, 2GB RAM (recommended for production)

---

## 🔒 Security

1. **Add API Key Authentication**
2. **Use HTTPS only**
3. **Rate limiting**
4. **CORS configuration**

---

## 📝 Next Steps

1. Follow the file creation steps below
2. Deploy to Render
3. Update PHP to call Render API
4. Test and enjoy WEKA clustering!

---

## 🆘 Troubleshooting

### Service sleeps (Free tier)
- First request after sleep takes 30-60 seconds
- Consider paid plan for production

### Build fails
- Check Java version (use Java 17)
- Verify pom.xml is correct
- Check Render build logs

### API not responding
- Check service URL is correct
- Verify CORS settings
- Check Render service logs

---

## ✅ Benefits

- ✅ Full WEKA capabilities
- ✅ Works with Hostinger shared hosting
- ✅ Free tier available
- ✅ Easy deployment
- ✅ Automatic HTTPS
- ✅ Scalable

