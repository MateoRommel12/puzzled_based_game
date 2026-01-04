# WEKA Integration Guide for Clustering Game

This guide explains how to integrate WEKA (Waikato Environment for Knowledge Analysis) into your PHP web application for advanced machine learning clustering.

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Approach 1: Command-Line Execution (Simplest)](#approach-1-command-line-execution)
4. [Approach 2: Java REST API Wrapper (Recommended)](#approach-2-java-rest-api-wrapper)
5. [Approach 3: PHP-Java Bridge](#approach-3-php-java-bridge)
6. [Comparison](#comparison)

---

## Overview

WEKA is a Java-based machine learning toolkit that provides advanced clustering algorithms like:
- **K-Means** (with better initialization)
- **EM (Expectation Maximization)**
- **Hierarchical Clustering**
- **DBSCAN**
- **X-Means** (automatic cluster number detection)

### Why Use WEKA?
- More sophisticated algorithms than simple threshold-based clustering
- Better cluster quality and validation metrics
- Automatic cluster number detection
- Extensive preprocessing options
- Well-documented and widely used

---

## Prerequisites

### Required Software
1. **Java JDK 8 or higher**
   - Download from: https://www.oracle.com/java/technologies/downloads/
   - Verify installation: `java -version`

2. **WEKA JAR File**
   - Download from: https://www.cs.waikato.ac.nz/ml/weka/downloading.html
   - Get the "stable" version (weka-stable-3.8.6.zip)
   - Extract and locate `weka.jar`

3. **Directory Structure**
   ```
   ClusteringGame/
   ├── weka/
   │   ├── weka.jar
   │   ├── StudentClustering.java
   │   ├── StudentClustering.class (compiled)
   │   └── arff/ (temporary ARFF files)
   ```

---

## Approach 1: Command-Line Execution (Simplest)

This approach calls WEKA from PHP using command-line execution.

### Step 1: Create Java Clustering Class

Create `weka/StudentClustering.java`:

```java
import weka.clusterers.SimpleKMeans;
import weka.core.Instances;
import weka.core.converters.ConverterUtils.DataSource;
import weka.filters.Filter;
import weka.filters.unsupervised.attribute.Remove;
import java.io.FileWriter;
import java.io.PrintWriter;

public class StudentClustering {
    public static void main(String[] args) {
        if (args.length < 3) {
            System.out.println("Usage: java StudentClustering <arff_file> <num_clusters> <output_file>");
            System.exit(1);
        }
        
        String arffFile = args[0];
        int numClusters = Integer.parseInt(args[1]);
        String outputFile = args[2];
        
        try {
            // Load data
            DataSource source = new DataSource(arffFile);
            Instances data = source.getDataSet();
            
            // Remove class attribute if exists (clustering is unsupervised)
            if (data.classIndex() == -1) {
                data.setClassIndex(data.numAttributes() - 1);
            }
            Remove remove = new Remove();
            remove.setAttributeIndices("last");
            remove.setInputFormat(data);
            Instances dataClusterer = Filter.useFilter(data, remove);
            
            // Build clusterer
            SimpleKMeans kmeans = new SimpleKMeans();
            kmeans.setNumClusters(numClusters);
            kmeans.setSeed(42);
            kmeans.buildClusterer(dataClusterer);
            
            // Assign clusters
            PrintWriter writer = new PrintWriter(new FileWriter(outputFile));
            writer.println("user_id,cluster_number,cluster_label");
            
            for (int i = 0; i < dataClusterer.numInstances(); i++) {
                int cluster = kmeans.clusterInstance(dataClusterer.instance(i));
                String label = getClusterLabel(cluster, numClusters);
                writer.println((i+1) + "," + cluster + "," + label);
            }
            
            writer.close();
            System.out.println("SUCCESS: Clustering completed");
            
        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
    
    private static String getClusterLabel(int cluster, int numClusters) {
        if (numClusters == 3) {
            String[] labels = {"High Achievers", "Average Performers", "Needs Support"};
            return labels[cluster];
        }
        return "Cluster " + cluster;
    }
}
```

### Step 2: Compile Java Class

```bash
cd weka
javac -cp weka.jar StudentClustering.java
```

### Step 3: Create PHP Integration

See `api/clustering-weka.php` (created below)

---

## Approach 2: Java REST API Wrapper (Recommended)

This approach creates a Java Spring Boot service that exposes WEKA as a REST API.

### Advantages
- Better error handling
- Can run as separate service
- More scalable
- Better security (no shell execution)

### Step 1: Create Spring Boot Project

**pom.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.clusteringgame</groupId>
    <artifactId>weka-service</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.0</version>
    </parent>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>nz.ac.waikato.cms.weka</groupId>
            <artifactId>weka-stable</artifactId>
            <version>3.8.6</version>
        </dependency>
    </dependencies>
</project>
```

**ClusteringController.java:**
```java
@RestController
@RequestMapping("/api/clustering")
public class ClusteringController {
    
    @PostMapping("/kmeans")
    public ResponseEntity<?> performKMeans(@RequestBody ClusteringRequest request) {
        try {
            // Convert JSON to ARFF
            String arffData = convertToARFF(request.getStudents());
            
            // Perform clustering
            ClusteringResult result = performClustering(arffData, request.getNumClusters());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Implementation methods...
}
```

### Step 2: Run Service

```bash
java -jar weka-service.jar --server.port=8080
```

### Step 3: Call from PHP

```php
$response = file_get_contents('http://localhost:8080/api/clustering/kmeans', 
    false, 
    stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => json_encode($data)
        ]
    ])
);
```

---

## Approach 3: PHP-Java Bridge

Uses php-java-bridge to call Java directly from PHP.

### Installation
```bash
# Download php-java-bridge
# Place JavaBridge.jar in your project
```

### Usage
```php
require_once("java/Java.inc");
$clusterer = new Java("weka.clusterers.SimpleKMeans");
```

**Note:** This approach is complex and may have compatibility issues.

---

## Comparison

| Approach | Complexity | Performance | Security | Scalability | Recommended |
|----------|-----------|-------------|---------|-------------|-------------|
| Command-Line | Low | Medium | Medium | Low | ✅ Good for small projects |
| REST API | Medium | High | High | High | ✅✅ Best for production |
| PHP-Java Bridge | High | Medium | Medium | Medium | ❌ Not recommended |

---

## Next Steps

1. Choose your preferred approach
2. Follow the implementation steps
3. Test with sample data
4. Integrate with existing clustering API
5. Update admin dashboard to show WEKA results

---

## Additional Resources

- WEKA Documentation: https://www.cs.waikato.ac.nz/ml/weka/documentation.html
- WEKA API: https://weka.sourceforge.io/doc.stable/
- Java Tutorial: https://docs.oracle.com/javase/tutorial/

