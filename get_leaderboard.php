<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "quiz_db";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$sql = "SELECT name, score FROM quiz_users WHERE completed=1 ORDER BY score DESC LIMIT 10";
$result = $conn->query($sql);

$leaderboard = [];
while ($row = $result->fetch_assoc()) {
  $leaderboard[] = $row;
}

echo json_encode($leaderboard);
$conn->close();
?>
