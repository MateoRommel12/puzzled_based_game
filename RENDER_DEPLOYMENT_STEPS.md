# Step-by-Step: Deploy WEKA to Render

## 🎯 Goal
Deploy WEKA clustering service to Render and connect it to your Hostinger PHP app.

---

## Step 1: Prepare Files

All files are already created in `weka-service/` directory:
- ✅ `pom.xml` - Maven configuration
- ✅ Java source files
- ✅ `render.yaml` - Render configuration
- ✅ `README.md` - Documentation

---

## Step 2: Create GitHub Repository

1. **Initialize Git** (if not already done)
   ```bash
   cd weka-service
   git init
   ```

2. **Create .gitignore**
   ```bash
   echo "target/
   .idea/
   *.iml
   .DS_Store" > .gitignore
   ```

3. **Commit files**
   ```bash
   git add .
   git commit -m "Initial WEKA service for Render"
   ```

4. **Create GitHub repo**
   - Go to https://github.com/new
   - Repository name: `weka-clustering-service`
   - Make it **Public** (required for Render free tier)
   - Click "Create repository"

5. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/weka-clustering-service.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 3: Deploy to Render

1. **Sign up/Login to Render**
   - Go to https://render.com
   - Sign up with GitHub (free)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub account (if not connected)
   - Select repository: `weka-clustering-service`

3. **Configure Service**
   - **Name:** `weka-clustering-service` (or your choice)
   - **Environment:** `Java`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** Leave empty (or `weka-service` if you put files in subfolder)
   - **Build Command:** `mvn clean install`
   - **Start Command:** `java -jar target/weka-service-1.0.0.jar`
   - **Instance Type:** 
     - **Free** (for testing) - sleeps after 15 min
     - **Starter ($7/mo)** - always on, better for production

4. **Environment Variables** (Optional)
   - Click "Advanced"
   - Add if needed:
     - `PORT` = `8080` (Render sets this automatically)
     - `JAVA_OPTS` = `-Xmx512m -Xms256m`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build (5-10 minutes first time)
   - Watch build logs for any errors

---

## Step 4: Get Your Service URL

After deployment succeeds:
- Your service URL: `https://weka-clustering-service.onrender.com`
- API endpoint: `https://weka-clustering-service.onrender.com/api`

**Save this URL!** You'll need it for PHP integration.

---

## Step 5: Test the Service

### Test Health Endpoint
```bash
curl https://weka-clustering-service.onrender.com/api/health
```

Expected response:
```json
{"status":"ok","service":"WEKA Clustering"}
```

### Test Clustering Endpoint
```bash
curl -X POST https://weka-clustering-service.onrender.com/api/cluster \
  -H "Content-Type: application/json" \
  -d '{
    "students": [
      {
        "user_id": 1,
        "literacy_score": 85.5,
        "math_score": 78.2,
        "games_played": 10,
        "total_score": 500
      },
      {
        "user_id": 2,
        "literacy_score": 65.0,
        "math_score": 70.0,
        "games_played": 8,
        "total_score": 400
      }
    ],
    "category": "all",
    "clusters": 3
  }'
```

---

## Step 6: Configure PHP Integration

1. **Set API URL**

   **Option A: Edit config file**
   ```php
   // In api/clustering-weka-render.php, line ~15
   define('RENDER_WEKA_API_URL', 'https://weka-clustering-service.onrender.com/api');
   ```

   **Option B: Use environment variable** (Recommended)
   - In Hostinger cPanel → Environment Variables
   - Add: `RENDER_WEKA_API_URL` = `https://weka-clustering-service.onrender.com/api`
   - Update PHP code to read from env:
   ```php
   define('RENDER_WEKA_API_URL', getenv('RENDER_WEKA_API_URL') ?: 'https://your-service.onrender.com/api');
   ```

2. **Update Admin Dashboard**

   Edit `scripts/admin-dashboard.js`:
   ```javascript
   // In runManualClustering() function
   const response = await fetch(
       `../api/clustering.php?action=run&category=${category}&use_weka_render=true`
   );
   ```

---

## Step 7: Test from PHP

1. **Check API availability**
   ```
   GET /api/clustering-weka-render.php?action=check
   ```

2. **Run clustering**
   ```
   GET /api/clustering.php?action=run&category=all&use_weka_render=true
   ```

---

## ✅ Success Checklist

- [ ] GitHub repository created and pushed
- [ ] Render service deployed successfully
- [ ] Health endpoint returns OK
- [ ] Clustering endpoint tested
- [ ] PHP API URL configured
- [ ] Admin dashboard updated
- [ ] Clustering works from admin panel

---

## 🐛 Troubleshooting

### Build Fails
- Check Java version (should be 17)
- Verify `pom.xml` is correct
- Check Render build logs

### Service Won't Start
- Check start command is correct
- Verify JAR file exists in target/
- Check Render logs for errors

### API Not Responding
- Service might be sleeping (free tier)
- First request after sleep takes 30-60 seconds
- Consider upgrading to paid plan

### CORS Errors
- Update `application.properties` CORS settings
- Add your domain to allowed origins

### Timeout Errors
- Increase timeout in PHP curl settings
- Render free tier is slower (upgrade for better performance)

---

## 💡 Tips

1. **Free Tier Limitations**
   - Service sleeps after 15 min inactivity
   - First request after sleep is slow (30-60s)
   - 750 hours/month free

2. **Production Recommendations**
   - Upgrade to Starter plan ($7/mo) for always-on
   - Add API key authentication
   - Configure CORS properly
   - Monitor usage and errors

3. **Performance**
   - Clustering is fast (< 1 second for < 1000 students)
   - Network latency adds ~100-500ms
   - Render free tier adds wake-up delay

---

## 🎉 You're Done!

Your WEKA clustering now works on Render and can be called from Hostinger!

**Next Steps:**
1. Test thoroughly
2. Monitor performance
3. Consider upgrading Render plan for production
4. Add error handling and retries


