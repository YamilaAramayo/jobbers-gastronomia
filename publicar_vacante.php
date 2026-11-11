<?php
require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $empresa = trim($_POST['empresa'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $puesto = trim($_POST['puesto'] ?? '');
    $zona = trim($_POST['zona'] ?? '');
    $turno = trim($_POST['turno'] ?? '');
    $jornada = trim($_POST['jornada'] ?? '');
    $descripcion = trim($_POST['descripcion'] ?? '');
    $urgente = isset($_POST['solicitud_urgente']) ? 1 : 0;

    if (!empty($empresa) && !empty($telefono) && !empty($puesto)) {
        try {
            // Guardamos en la misma tabla 'postulaciones' adaptando los campos
            $stmt = $pdo->prepare("INSERT INTO postulaciones (nombre, puesto, telefono, email, metodo_contacto, estado) VALUES (?, ?, ?, ?, 'empresa', 'pendiente')");
            $stmt->execute([$empresa, "[$zona] $puesto ($turno - $jornada)", $telefono, $descripcion]);

            // Redirigir al index con aviso de éxito
            header("Location: index.html?status=publicado");
            exit();
        } catch (PDOException $e) {
            echo "Error al guardar la vacante: " . $e->getMessage();
        }
    } else {
        echo "Por favor completá los campos obligatorios.";
    }
}
?>
