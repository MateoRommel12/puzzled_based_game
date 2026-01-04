# WEKA Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Java
1. Download Java JDK 8+ from: https://www.oracle.com/java/technologies/downloads/
2. Install it
3. Verify: Open command prompt and type `java -version`

### Step 2: Download WEKA
1. Go to: https://www.cs.waikato.ac.nz/ml/weka/downloading.html
2. Download "stable" version (weka-stable-3.8.6.zip)
3. Extract and find `weka.jar`
4. Copy `weka.jar` to: `ClusteringGame/weka/weka.jar`

### Step 3: Compile Java Class
Open command prompt/terminal:

**Windows:**
```cmd
cd C:\xampp2\htdocs\ClusteringGame\weka
javac -cp "weka.jar;." StudentClustering.java
```

**Linux/Mac:**
```bash
cd /path/to/ClusteringGame/weka
javac -cp "weka.jar:." StudentClustering.java
```

### Step 4: Verify Setup
Visit: `http://localhost/ClusteringGame/weka/setup-weka.php`

All checks should be green ✅

### Step 5: Use WEKA Clustering
In admin dashboard, clustering will use WEKA when you add `?use_weka=true`:

```
/api/clustering.php?action=run&category=all&use_weka=true
```

Or modify the JavaScript to always use WEKA (see below).

## 📝 Integration Options

### Option A: Use WEKA via URL Parameter
Add `use_weka=true` to clustering API calls.

### Option B: Always Use WEKA
Edit `scripts/admin-dashboard.js`, find `runManualClustering()`:

```javascript
async function runManualClustering(category = 'all') {
    // ... existing code ...
    const response = await fetch(
        `../api/clustering.php?action=run&category=${category}&use_weka=true`
    );
    // ... rest of code ...
}
```

### Option C: Add Toggle in Admin Dashboard
Add a checkbox in `admin/admin-dashboard.php`:

```html
<label>
    <input type="checkbox" id="useWekaToggle" checked>
    Use WEKA Machine Learning
</label>
```

Then in JavaScript:
```javascript
const useWeka = document.getElementById('useWekaToggle').checked;
const url = `../api/clustering.php?action=run&category=${category}&use_weka=${useWeka}`;
```

## 🧪 Testing

### Test WEKA Availability
```bash
curl "http://localhost/ClusteringGame/api/clustering.php?action=check_weka"
```

### Test WEKA Clustering
```bash
curl "http://localhost/ClusteringGame/api/clustering.php?action=run&category=all&use_weka=true"
```

## 📊 What WEKA Provides

### Better Clustering Algorithms
- **K-Means++**: Better initialization than random
- **EM**: Expectation Maximization (probabilistic)
- **Hierarchical**: Tree-based clustering
- **DBSCAN**: Density-based clustering

### Advanced Features
- Automatic cluster number detection (X-Means)
- Cluster validation metrics
- Better handling of outliers
- More sophisticated distance metrics

## 🔧 Troubleshooting

### "Java not found"
- Add Java to PATH, or edit `api/clustering-weka.php`:
  ```php
  define('JAVA_BIN', 'C:\\Program Files\\Java\\jdk-17\\bin\\java.exe');
  ```

### "WEKA JAR not found"
- Ensure `weka.jar` is in `weka/` directory
- Check file name is exactly `weka.jar` (case-sensitive on Linux)

### "Class not compiled"
- Run compilation command again
- Check for errors in compilation output
- Ensure `weka.jar` is in the same directory

### "Permission denied" (Linux/Mac)
```bash
chmod 777 weka/arff
chmod +x weka/StudentClustering.class
```

## 📚 Next Steps

1. ✅ Complete setup
2. ✅ Test with sample data
3. ✅ Compare WEKA vs simple clustering results
4. ✅ Choose default algorithm (WEKA or simple)
5. ✅ Document cluster interpretation

## 💡 Tips

- **Start with K-Means** (default) - it's fast and works well
- **Use 3 clusters** for your use case (High/Average/Needs Support)
- **Compare results** - WEKA may produce different clusters than threshold-based
- **Monitor performance** - WEKA is slower but more accurate

## 🆘 Need Help?

- Check `weka/README.md` for detailed documentation
- Review `WEKA_INTEGRATION_GUIDE.md` for advanced options
- Visit WEKA documentation: https://www.cs.waikato.ac.nz/ml/weka/documentation.html

