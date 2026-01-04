# WEKA Integration Setup Guide

This directory contains files for integrating WEKA machine learning toolkit into the clustering system.

## Quick Start

### 1. Install Java JDK
- Download from: https://www.oracle.com/java/technologies/downloads/
- Install and verify: `java -version`

### 2. Download WEKA
- Download from: https://www.cs.waikato.ac.nz/ml/weka/downloading.html
- Extract `weka.jar` and place it in this directory

### 3. Compile Java Class
```bash
cd weka
javac -cp weka.jar StudentClustering.java
```

**Windows:**
```cmd
cd weka
javac -cp "weka.jar;." StudentClustering.java
```

**Linux/Mac:**
```bash
cd weka
javac -cp "weka.jar:." StudentClustering.java
```

### 4. Test WEKA Integration
Visit: `http://localhost/ClusteringGame/api/clustering-weka.php?action=check`

### 5. Run WEKA Clustering
From admin dashboard or via API:
```
GET /api/clustering-weka.php?action=run&category=all&clusters=3
```

## Directory Structure

```
weka/
├── weka.jar                    # WEKA library (download separately)
├── StudentClustering.java      # Java clustering class
├── StudentClustering.class     # Compiled class (generated)
├── arff/                       # Temporary ARFF files (auto-created)
│   ├── students_all_*.arff
│   └── clusters_all_*.csv
└── README.md                   # This file
```

## Configuration

Edit `api/clustering-weka.php` to configure paths:

```php
define('WEKA_JAR_PATH', __DIR__ . '/../weka/weka.jar');
define('JAVA_BIN', 'java'); // Or full path: 'C:\\Program Files\\Java\\jdk-17\\bin\\java.exe'
```

## Troubleshooting

### Java not found
- Ensure Java is in your PATH
- Or set full path in `JAVA_BIN` constant

### WEKA JAR not found
- Download weka.jar from official website
- Place in `weka/` directory
- Verify file exists: `weka/weka.jar`

### Class not compiled
- Run: `javac -cp weka.jar StudentClustering.java`
- Verify: `weka/StudentClustering.class` exists

### Permission errors
- Ensure `arff/` directory is writable
- On Linux: `chmod 777 weka/arff`

## Advanced: Using Different Algorithms

To use other WEKA algorithms, modify `StudentClustering.java`:

### EM (Expectation Maximization)
```java
import weka.clusterers.EM;
EM em = new EM();
em.setNumClusters(numClusters);
em.buildClusterer(dataClusterer);
```

### Hierarchical Clustering
```java
import weka.clusterers.HierarchicalClusterer;
HierarchicalClusterer hc = new HierarchicalClusterer();
hc.setNumClusters(numClusters);
hc.buildClusterer(dataClusterer);
```

## API Endpoints

### Check Availability
```
GET /api/clustering-weka.php?action=check
```

Response:
```json
{
  "success": true,
  "checks": {
    "java_installed": true,
    "weka_jar_exists": true,
    "weka_class_exists": true,
    "arff_dir_writable": true
  },
  "all_ok": true
}
```

### Run Clustering
```
GET /api/clustering-weka.php?action=run&category=all&clusters=3
```

Parameters:
- `category`: `all`, `literacy`, or `math`
- `clusters`: Number of clusters (default: 3)

Response:
```json
{
  "success": true,
  "message": "Overall WEKA clustering completed successfully",
  "report": {...},
  "category": "all",
  "algorithm": "WEKA K-Means"
}
```

## Integration with Existing System

To use WEKA instead of simple clustering:

1. Update `api/clustering.php`:
```php
case 'run':
    // Option 1: Use WEKA
    require_once __DIR__ . '/clustering-weka.php';
    $category = $_GET['category'] ?? 'all';
    $result = runWekaClustering($category, 3);
    echo json_encode($result);
    break;
    
    // Option 2: Use simple clustering (current)
    // runLocalClustering($category);
    // break;
```

2. Or add a parameter to choose:
```php
$useWeka = $_GET['use_weka'] ?? false;
if ($useWeka) {
    require_once __DIR__ . '/clustering-weka.php';
    runWekaClustering($category);
} else {
    runLocalClustering($category);
}
```

## Performance Notes

- WEKA clustering is slower than simple threshold-based clustering
- For < 100 students: ~1-2 seconds
- For 100-1000 students: ~2-5 seconds
- For > 1000 students: Consider running asynchronously

## Security Considerations

- Command-line execution requires proper input sanitization (already done)
- ARFF files contain student data - ensure proper cleanup
- Consider running WEKA in a sandboxed environment for production

