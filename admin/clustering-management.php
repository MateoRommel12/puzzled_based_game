<?php
/**
 * Admin Clustering Management Page
 */

require_once __DIR__ . '/../config/database.php';

// Check admin authentication
if (!isset($_SESSION['admin_id'])) {
    header('Location: admin-login.php');
    exit();
}

$pageTitle = 'Student Clustering Management';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?> - Clustering Game Platform</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="styles/admin.css" rel="stylesheet">
    <style>
        .clustering-card {
            border: 2px solid #e9ecef;
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        .clustering-card:hover {
            border-color: #007bff;
            box-shadow: 0 4px 8px rgba(0,123,255,0.1);
        }
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
        }
        .status-online { background-color: #28a745; }
        .status-offline { background-color: #dc3545; }
        .status-unknown { background-color: #ffc107; }
    </style>
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <nav class="col-md-3 col-lg-2 d-md-block bg-light sidebar">
                <div class="position-sticky pt-3">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link" href="admin-dashboard.php">
                                <i class="fas fa-tachometer-alt"></i> Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="student-management.php">
                                <i class="fas fa-users"></i> Students
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link active" href="clustering-management.php">
                                <i class="fas fa-project-diagram"></i> Clustering
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="add-game.php">
                                <i class="fas fa-plus"></i> Add Game
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="logout.php">
                                <i class="fas fa-sign-out-alt"></i> Logout
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>

            <!-- Main content -->
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Student Clustering Management</h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group me-2">
                            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="checkClusteringStatus()">
                                <i class="fas fa-sync"></i> Refresh Status
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Clustering Service Status -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card clustering-card">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="fas fa-server"></i> Clustering Service Status
                                </h5>
                            </div>
                            <div class="card-body">
                                <div id="clusteringStatus">
                                    <div class="text-center">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                        <p class="mt-2">Checking service status...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Clustering Actions -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="card clustering-card">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="fas fa-play"></i> Run Clustering Analysis
                                </h5>
                            </div>
                            <div class="card-body">
                                <p class="card-text">
                                    Run K-Means clustering analysis on student performance data to identify learning patterns and group students.
                                </p>
                                <button type="button" class="btn btn-primary btn-lg" id="runClusteringBtn" onclick="runClustering()">
                                    <i class="fas fa-play"></i> Run Student Clustering
                                </button>
                                <div class="mt-3">
                                    <small class="text-muted">
                                        <i class="fas fa-info-circle"></i>
                                        This will analyze all students with game data and create performance-based clusters.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="card clustering-card">
                            <div class="card-header">
                                <h5 class="mb-0">
                                    <i class="fas fa-chart-bar"></i> Clustering Statistics
                                </h5>
                            </div>
                            <div class="card-body">
                                <?php
                                try {
                                    $db = getDBConnection();
                                    
                                    // Get total students
                                    $stmt = $db->prepare("SELECT COUNT(*) as total FROM users WHERE is_active = 1");
                                    $stmt->execute();
                                    $totalStudents = $stmt->fetch()['total'];
                                    
                                    // Get students with game data
                                    $stmt = $db->prepare("
                                        SELECT COUNT(DISTINCT u.user_id) as with_data 
                                        FROM users u 
                                        INNER JOIN game_sessions gs ON u.user_id = gs.user_id 
                                        WHERE u.is_active = 1 AND gs.completed_at IS NOT NULL
                                    ");
                                    $stmt->execute();
                                    $studentsWithData = $stmt->fetch()['with_data'];
                                    
                                    // Get latest clustering report
                                    $stmt = $db->prepare("
                                        SELECT * FROM clustering_reports 
                                        ORDER BY created_at DESC 
                                        LIMIT 1
                                    ");
                                    $stmt->execute();
                                    $latestReport = $stmt->fetch();
                                    
                                } catch (Exception $e) {
                                    $totalStudents = 0;
                                    $studentsWithData = 0;
                                    $latestReport = null;
                                }
                                ?>
                                
                                <div class="row text-center">
                                    <div class="col-6">
                                        <h3 class="text-primary"><?php echo $totalStudents; ?></h3>
                                        <small>Total Students</small>
                                    </div>
                                    <div class="col-6">
                                        <h3 class="text-success"><?php echo $studentsWithData; ?></h3>
                                        <small>With Game Data</small>
                                    </div>
                                </div>
                                
                                <?php if ($latestReport): ?>
                                <hr>
                                <div class="mt-3">
                                    <h6>Latest Analysis</h6>
                                    <p class="mb-1">
                                        <strong>Date:</strong> <?php echo date('M j, Y g:i A', strtotime($latestReport['created_at'])); ?>
                                    </p>
                                    <p class="mb-1">
                                        <strong>Students Analyzed:</strong> <?php echo $latestReport['total_students']; ?>
                                    </p>
                                    <p class="mb-0">
                                        <strong>Clusters Created:</strong> <?php echo $latestReport['number_of_clusters']; ?>
                                    </p>
                                </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Clustering Report Display -->
                <div class="row">
                    <div class="col-12">
                        <div id="clusteringReport">
                            <!-- Latest clustering report will be displayed here -->
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://kit.fontawesome.com/your-fontawesome-kit.js" crossorigin="anonymous"></script>
    <script src="scripts/clustering-admin.js"></script>
</body>
</html>
