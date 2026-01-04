<?php
/**
 * Export Students Data to Excel
 * Generates an Excel file with students data (same as Students tab)
 */

// Start output buffering to prevent any output before headers
ob_start();

require_once __DIR__ . '/../config/database.php';

// Check admin authentication
if (!isset($_SESSION['admin_id']) || !isset($_SESSION['is_admin'])) {
    ob_end_clean();
    http_response_code(401);
    header('Content-Type: text/plain');
    die('Unauthorized access');
}

try {
    $db = getDBConnection();
    
    // Get all students with their stats (same query as Students tab)
    $query = "
        SELECT 
            u.user_id,
            u.full_name,
            u.email,
            sp.total_score,
            sp.games_played,
            sp.literacy_progress,
            sp.math_progress,
            sp.performance_level,
            u.last_login,
            u.created_at,
            COALESCE(SUM(gs.hints_used), 0) as total_hints_used,
            COALESCE(SUM(COALESCE(gs.time_taken, TIMESTAMPDIFF(SECOND, gs.started_at, gs.completed_at))), 0) as total_time_consumed
        FROM users u
        LEFT JOIN student_progress sp ON u.user_id = sp.user_id
        LEFT JOIN game_sessions gs ON u.user_id = gs.user_id AND gs.completed_at IS NOT NULL
        WHERE u.is_active = 1
        GROUP BY u.user_id, u.full_name, u.email, sp.total_score, sp.games_played, sp.literacy_progress, sp.math_progress, sp.performance_level, u.last_login, u.created_at
        ORDER BY sp.total_score DESC
    ";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Generate filename with timestamp
    $filename = 'students_report_' . date('Y-m-d_His') . '.xls';
    
    // Clear any previous output
    ob_end_clean();
    
    // Format time consumed helper function
    function formatTime($seconds) {
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $secs = $seconds % 60;
        if ($hours > 0) {
            return $hours . 'h ' . $minutes . 'm';
        } elseif ($minutes > 0) {
            return $minutes . 'm ' . $secs . 's';
        } else {
            return $secs . 's';
        }
    }
    
    // Create Excel file content
    // Using Excel XML format (compatible with Excel 2003+)
    $excelContent = '<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#4472C4" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Students Report">
  <Table>';
    
    // Add Student Details Header (matching Students tab columns)
    $excelContent .= '
   <Row>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Student Name</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Email</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Total Score</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Games Played</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Literacy Progress (%)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Math Progress (%)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Total Hints Used</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Total Time Consumed</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Performance Level</Data></Cell>
   </Row>';
    
    // Add Student Data
    foreach ($students as $student) {
        $totalTimeConsumed = intval($student['total_time_consumed'] ?? 0);
        $timeFormatted = formatTime($totalTimeConsumed);
        
        $excelContent .= '
   <Row>
    <Cell><Data ss:Type="String">' . htmlspecialchars($student['full_name']) . '</Data></Cell>
    <Cell><Data ss:Type="String">' . htmlspecialchars($student['email']) . '</Data></Cell>
    <Cell><Data ss:Type="Number">' . ($student['total_score'] ?? 0) . '</Data></Cell>
    <Cell><Data ss:Type="Number">' . ($student['games_played'] ?? 0) . '</Data></Cell>
    <Cell><Data ss:Type="Number">' . round($student['literacy_progress'] ?? 0, 2) . '</Data></Cell>
    <Cell><Data ss:Type="Number">' . round($student['math_progress'] ?? 0, 2) . '</Data></Cell>
    <Cell><Data ss:Type="Number">' . ($student['total_hints_used'] ?? 0) . '</Data></Cell>
    <Cell><Data ss:Type="String">' . htmlspecialchars($timeFormatted) . '</Data></Cell>
    <Cell><Data ss:Type="String">' . htmlspecialchars($student['performance_level'] ?? 'N/A') . '</Data></Cell>
   </Row>';
    }
    
    $excelContent .= '
  </Table>
 </Worksheet>
</Workbook>';
    
    // Set headers for Excel download (Excel XML format)
    header('Content-Type: application/vnd.ms-excel');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');
    header('Expires: 0');
    
    // Output the Excel content
    echo $excelContent;
    exit();
    
} catch (Exception $e) {
    ob_end_clean();
    http_response_code(500);
    header('Content-Type: text/plain');
    die('Error generating Excel file: ' . $e->getMessage());
}
?>

