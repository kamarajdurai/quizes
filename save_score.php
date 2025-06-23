<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "quiz_db";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$data = json_decode(file_get_contents("php://input"), true);
$name = $conn->real_escape_string($data['name']);
$reg = $conn->real_escape_string($data['regNumber']);
$course = $conn->real_escape_string($data['course']);
$score = (int)$data['score'];

$check = $conn->query("SELECT * FROM quiz_users WHERE reg_number='$reg'");
if ($check->num_rows > 0) {
  $conn->query("UPDATE quiz_users SET score=$score, completed=1 WHERE reg_number='$reg'");
} else {
  $conn->query("INSERT INTO quiz_users (name, reg_number, course, score, completed) VALUES ('$name', '$reg', '$course', $score, 1)");
}

echo json_encode(["status" => "success"]);
$conn->close();
?>
