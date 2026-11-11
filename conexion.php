<?php
$host = 'localhost';
$dbname = 'u754739502_db_jobbers';
$username = 'u754739502_db_jobbers'; // Verificá si tu usuario tiene este mismo nombre o si cambia un detalle
$password = 'TU_CONTRASEÑA_CON_ESTRELLA'; // La clave que creaste recién

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de conexión a la base de datos: " . $e->getMessage());
}
?>
