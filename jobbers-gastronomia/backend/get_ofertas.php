<?php
// Habilitar CORS para que GitHub Pages pueda leer los datos sin bloqueos de seguridad
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

try {
    // Traemos las ofertas de trabajo ordenadas por ID descendente
    $stmt = $pdo->query("SELECT * FROM ofertas ORDER BY id DESC");
    $ofertas = $stmt->fetchAll();
    
    echo json_encode($ofertas);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error al obtener ofertas: " . $e->getMessage()]);
}
?>