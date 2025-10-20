<?php
header("Content-Type: application/json");
echo json_encode([
    "success" => true,
    "message" => "Simple test API works",
    "timestamp" => date("Y-m-d H:i:s")
]);
?>