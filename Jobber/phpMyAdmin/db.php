<?php
// Configuración de la base de datos remota
$host = 'TU_HOST_REMOTO'; // Ej: sqlXXX.yourhosting.com o localhost
$db   = 'TU_BASE_DE_DATOS';
$user = 'TU_USUARIO';
$pass = 'TU_CONTRASEÑA';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    header("Content-Type: application/json");
    echo json_encode(["error" => "Error de conexión: " . $e->getMessage()]);
    exit;
}
?>