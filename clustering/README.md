# Student Clustering Algorithm

This directory contains the machine learning clustering algorithm for grouping students based on their performance.

## Overview

The clustering algorithm uses **K-Means clustering** to automatically group students into performance-based clusters.

## Features Used for Clustering

1. **Literacy Score** - Performance in literacy games (0-100%)
2. **Math Score** - Performance in math games (0-100%)
3. **Average Accuracy** - Overall accuracy across all games
4. **Games Played** - Number of completed games
5. **Total Score** - Cumulative score (normalized)
6. **Average Time** - Average time per game (in minutes)
7. **Total Hints** - Number of hints used

## Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Install Dependencies

```bash
# Navigate to clustering directory
cd clustering

# Install required packages
pip install -r requirements.txt
```

Or install individually:
```bash
pip install mysql-connector-python numpy scikit-learn
```

## Configuration

Update database credentials in `cluster_students.py`:

```python
DB_CONFIG = {
    'host': 'localhost',
    'database': 'clustering_game_db',
    'user': 'root',
    'password': ''  # Update if you have a password
}
```

## Usage

### Run Clustering Analysis

```bash
cd clustering
python cluster_students.py
```

### Expected Output

```
🤖 Student Clustering Algorithm
============================================================
✓ Connected to MySQL database
✓ Extracted data for 15 students
✓ Prepared feature matrix: (15, 7)
✓ Clustering completed with 3 clusters
  Inertia: 12.45
✓ Cluster labels assigned:
  Cluster 0: High Achievers (avg: 85.50%)
  Cluster 1: Average Performers (avg: 65.20%)
  Cluster 2: Needs Support (avg: 40.30%)
✓ Saved 15 clustering results to database

============================================================
CLUSTERING ANALYSIS REPORT
============================================================
Analysis Date: 2025-01-12 10:30:45
Total Students Analyzed: 15
Number of Clusters: 3
------------------------------------------------------------

Cluster 0: High Achievers
  Students: 5 (33.3%)
  Average Performance: 85.50%
  Literacy Avg: 87.20%
  Math Avg: 83.80%
  Accuracy Avg: 88.50%

Cluster 1: Average Performers
  Students: 7 (46.7%)
  Average Performance: 65.20%
  Literacy Avg: 66.10%
  Math Avg: 64.30%
  Accuracy Avg: 68.20%

Cluster 2: Needs Support
  Students: 3 (20.0%)
  Average Performance: 40.30%
  Literacy Avg: 42.50%
  Math Avg: 38.10%
  Accuracy Avg: 45.00%

============================================================
✅ Clustering completed successfully!
```

## Algorithm Details

### K-Means Clustering
- **Algorithm:** K-Means++
- **Number of Clusters:** 3 (High, Average, Low)
- **Initialization:** k-means++
- **Max Iterations:** 300
- **Random State:** 42 (for reproducibility)

### Feature Preprocessing
1. **Extraction** - Retrieve data from database
2. **Normalization** - Standardize features using StandardScaler
3. **Clustering** - Apply K-Means algorithm
4. **Labeling** - Assign human-readable labels based on average performance

### Cluster Labels
Clusters are automatically labeled based on average performance:
1. **High Achievers** - Top performing cluster
2. **Average Performers** - Middle performing cluster
3. **Needs Support** - Lower performing cluster

## Scheduling

### Run Automatically (Windows Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Weekly, Sunday at 2 AM)
4. Action: Start a program
5. Program: `python.exe`
6. Arguments: `C:\xampp\htdocs\ClusteringGame\clustering\cluster_students.py`

### Run Automatically (Linux/Mac Cron)

```bash
# Edit crontab
crontab -e

# Add this line (runs every Sunday at 2 AM)
0 2 * * 0 cd /path/to/ClusteringGame/clustering && python3 cluster_students.py >> clustering.log 2>&1
```

## Database Integration

### Results Storage
Clustering results are stored in the `clustering_results` table:
- Previous results are marked as `is_current = 0`
- New results are marked as `is_current = 1`
- Historical data is preserved for trend analysis

### Access Results
```sql
-- Get current clustering
SELECT * FROM clustering_results WHERE is_current = 1;

-- Get clustering summary
SELECT 
    cluster_label, 
    COUNT(*) as student_count,
    AVG(overall_performance) as avg_performance
FROM clustering_results
WHERE is_current = 1
GROUP BY cluster_label;
```

## API Integration

The admin dashboard automatically retrieves clustering data via:
```http
GET /api/admin-dashboard.php?action=clustering
```

## Troubleshooting

### Error: Module not found
```bash
pip install mysql-connector-python numpy scikit-learn
```

### Error: Can't connect to MySQL
- Check XAMPP MySQL is running
- Verify database credentials in `cluster_students.py`
- Ensure database `clustering_game_db` exists

### Error: Not enough data
- Need at least 3 students with game data
- Students must have completed at least 1 game

### Error: Access denied for user
- Update DB_CONFIG with correct credentials
- Grant necessary privileges to database user

## Performance Optimization

### For Large Datasets (1000+ students)
1. **Batch Processing** - Process in batches of 1000
2. **Feature Selection** - Reduce number of features
3. **Algorithm Tuning** - Adjust max_iter and n_init
4. **Caching** - Cache feature extraction results

### Elbow Method (Determine Optimal K)
```python
from sklearn.metrics import silhouette_score

inertias = []
silhouette_scores = []

for k in range(2, 10):
    kmeans = KMeans(n_clusters=k, random_state=42)
    kmeans.fit(features)
    inertias.append(kmeans.inertia_)
    silhouette_scores.append(silhouette_score(features, kmeans.labels_))

# Plot and choose optimal k
```

## Advanced Features (Future)

1. **Hierarchical Clustering** - For more detailed grouping
2. **DBSCAN** - For density-based clustering
3. **Feature Importance** - Identify most significant features
4. **Trend Analysis** - Track cluster changes over time
5. **Anomaly Detection** - Identify unusual patterns
6. **Predictive Modeling** - Predict student performance

## References

- [Scikit-learn K-Means Documentation](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html)
- [K-Means Clustering Tutorial](https://scikit-learn.org/stable/modules/clustering.html#k-means)
- [Feature Scaling Best Practices](https://scikit-learn.org/stable/modules/preprocessing.html)

## Support

For issues:
1. Check error messages in console output
2. Verify database connection
3. Ensure sufficient data exists
4. Review Python error logs

