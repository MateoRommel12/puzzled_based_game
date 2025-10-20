#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Student Clustering Algorithm
Uses K-Means clustering to group students based on performance
"""

import sys
import io

# Fix Windows console encoding issues
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import mysql.connector
from mysql.connector import Error
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from datetime import datetime
import json
import warnings
warnings.filterwarnings('ignore')

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'clustering_game_db',
    'user': 'root',
    'password': ''
}

def get_db_connection():
    """Create database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            print("[OK] Connected to MySQL database")
        return connection
    except Error as e:
        print(f"[ERROR] Error connecting to MySQL: {e}")
        return None

def extract_features(connection):
    """Extract features for clustering from database"""
    cursor = connection.cursor(dictionary=True)
    
    query = """
        SELECT 
            u.user_id,
            u.full_name,
            COALESCE(sp.literacy_progress, 0) as literacy_score,
            COALESCE(sp.math_progress, 0) as math_score,
            COALESCE(sp.total_score, 0) as total_score,
            COALESCE(sp.games_played, 0) as games_played,
            COALESCE(AVG(gs.accuracy), 0) as avg_accuracy,
            COALESCE(AVG(gs.time_taken), 0) as avg_time,
            COALESCE(SUM(gs.hints_used), 0) as total_hints
        FROM users   u  
        LEFT JOIN student_progress sp ON u.user_id = sp.user_id
        LEFT JOIN game_sessions gs ON u.user_id = gs.user_id 
            AND gs.completed_at IS NOT NULL
        WHERE u.is_active = 1
        GROUP BY u.user_id, u.full_name, sp.literacy_progress, 
                 sp.math_progress, sp.total_score, sp.games_played
        HAVING games_played > 0
    """
    
    cursor.execute(query)
    students = cursor.fetchall()
    cursor.close()
    
    print(f"[OK] Extracted data for {len(students)} students")
    return students

def prepare_feature_matrix(students):
    """Prepare feature matrix for clustering"""
    if len(students) == 0:
        print("[ERROR] No students to cluster")
        return None, None, None
    
    # Extract features
    features = []
    user_ids = []
    
    for student in students:
        feature_vector = [
            float(student['literacy_score']),
            float(student['math_score']),
            float(student['avg_accuracy']),
            float(student['games_played']),
            float(student['total_score']) / 100.0,  # Normalize
            float(student['avg_time']) / 60.0,  # Convert to minutes
            float(student['total_hints'])
        ]
        features.append(feature_vector)
        user_ids.append(student['user_id'])
    
    feature_matrix = np.array(features)
    
    # Standardize features
    scaler = StandardScaler()
    normalized_features = scaler.fit_transform(feature_matrix)
    
    print(f"[OK] Prepared feature matrix: {normalized_features.shape}")
    return normalized_features, user_ids, students

def perform_clustering(features, n_clusters=3):
    """Perform K-Means clustering"""
    if features is None or len(features) < n_clusters:
        print(f"[ERROR] Not enough data for clustering (need at least {n_clusters} students)")
        return None
    
    kmeans = KMeans(
        n_clusters=n_clusters,
        init='k-means++',
        n_init=10,
        max_iter=300,
        random_state=42
    )
    
    cluster_labels = kmeans.fit_predict(features)
    
    print(f"[OK] Clustering completed with {n_clusters} clusters")
    print(f"  Inertia: {kmeans.inertia_:.2f}")
    
    return cluster_labels, kmeans

def assign_cluster_labels(cluster_labels, students):
    """Assign human-readable labels to clusters"""
    cluster_scores = {}
    
    for i, student in enumerate(students):
        cluster = int(cluster_labels[i])
        if cluster not in cluster_scores:
            cluster_scores[cluster] = []
        
        # Calculate overall performance
        overall = (float(student['literacy_score']) + 
                  float(student['math_score'])) / 2
        cluster_scores[cluster].append(overall)
    
    # Calculate average score for each cluster
    cluster_avgs = {
        cluster: np.mean(scores) 
        for cluster, scores in cluster_scores.items()
    }
    
    # Sort clusters by average score
    sorted_clusters = sorted(cluster_avgs.items(), 
                           key=lambda x: x[1], 
                           reverse=True)
    
    # Assign labels
    label_mapping = {}
    labels = ['High Achievers', 'Average Performers', 'Needs Support']
    
    for i, (cluster, avg_score) in enumerate(sorted_clusters):
        label_mapping[cluster] = {
            'label': labels[i] if i < len(labels) else f'Cluster {i+1}',
            'avg_score': avg_score
        }
    
    print("[OK] Cluster labels assigned:")
    for cluster, info in label_mapping.items():
        print(f"  Cluster {cluster}: {info['label']} (avg: {info['avg_score']:.2f}%)")
    
    return label_mapping

def save_clustering_results(connection, cluster_labels, user_ids, students, label_mapping):
    """Save clustering results to database"""
    cursor = connection.cursor()
    
    # Mark all previous clustering results as not current
    cursor.execute("UPDATE clustering_results SET is_current = 0")
    
    # Insert new clustering results
    insert_query = """
        INSERT INTO clustering_results (
            user_id, cluster_number, cluster_label, 
            literacy_score, math_score, overall_performance,
            features, analysis_date, is_current
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), 1)
    """
    
    for i, user_id in enumerate(user_ids):
        student = students[i]
        cluster = int(cluster_labels[i])
        cluster_info = label_mapping[cluster]
        
        literacy_score = float(student['literacy_score'])
        math_score = float(student['math_score'])
        overall_performance = (literacy_score + math_score) / 2
        
        # Create feature JSON
        features = {
            'literacy_score': literacy_score,
            'math_score': math_score,
            'total_score': float(student['total_score']),
            'games_played': int(student['games_played']),
            'avg_accuracy': float(student['avg_accuracy']),
            'avg_time': float(student['avg_time']),
            'total_hints': int(student['total_hints'])
        }
        
        cursor.execute(insert_query, (
            user_id,
            cluster,
            cluster_info['label'],
            literacy_score,
            math_score,
            overall_performance,
            json.dumps(features),
        ))
    
    connection.commit()
    cursor.close()
    
    print(f"[OK] Saved {len(user_ids)} clustering results to database")

def generate_report(cluster_labels, students, label_mapping):
    """Generate clustering report"""
    print("\n" + "="*60)
    print("CLUSTERING ANALYSIS REPORT")
    print("="*60)
    print(f"Analysis Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total Students Analyzed: {len(students)}")
    print(f"Number of Clusters: {len(label_mapping)}")
    print("-"*60)
    
    for cluster_num in sorted(label_mapping.keys()):
        cluster_info = label_mapping[cluster_num]
        count = np.sum(cluster_labels == cluster_num)
        percentage = (count / len(students)) * 100
        
        print(f"\nCluster {cluster_num}: {cluster_info['label']}")
        print(f"  Students: {count} ({percentage:.1f}%)")
        print(f"  Average Performance: {cluster_info['avg_score']:.2f}%")
        
        # Get students in this cluster
        cluster_students = [
            students[i] for i in range(len(students)) 
            if cluster_labels[i] == cluster_num
        ]
        
        # Calculate cluster statistics
        literacy_avg = np.mean([s['literacy_score'] for s in cluster_students])
        math_avg = np.mean([s['math_score'] for s in cluster_students])
        accuracy_avg = np.mean([s['avg_accuracy'] for s in cluster_students])
        
        print(f"  Literacy Avg: {literacy_avg:.2f}%")
        print(f"  Math Avg: {math_avg:.2f}%")
        print(f"  Accuracy Avg: {accuracy_avg:.2f}%")
    
    print("\n" + "="*60)

def main():
    """Main clustering pipeline"""
    print("\n[AI] Student Clustering Algorithm")
    print("="*60)
    
    # Connect to database
    connection = get_db_connection()
    if not connection:
        return
    
    try:
        # Extract features
        students = extract_features(connection)
        
        if len(students) == 0:
            print("[ERROR] No students with game data found")
            return
        
        # Prepare feature matrix
        features, user_ids, students = prepare_feature_matrix(students)
        
        if features is None:
            return
        
        # Determine optimal number of clusters
        n_clusters = min(3, len(students))  # Max 3 clusters, or less if fewer students
        
        # Perform clustering
        result = perform_clustering(features, n_clusters)
        
        if result is None:
            return
        
        cluster_labels, kmeans = result
        
        # Assign labels
        label_mapping = assign_cluster_labels(cluster_labels, students)
        
        # Save results
        save_clustering_results(connection, cluster_labels, user_ids, 
                              students, label_mapping)
        
        # Generate report
        generate_report(cluster_labels, students, label_mapping)
        
        print("\n[SUCCESS] Clustering completed successfully!")
        
    except Exception as e:
        print(f"\n[ERROR] Error during clustering: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        if connection and connection.is_connected():
            connection.close()
            print("[OK] Database connection closed")

if __name__ == "__main__":
    main()

