<?php
require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = trim($_POST['nombre'] ?? '');
    $puesto = trim($_POST['puesto'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $metodo = trim($_POST['metodo_contacto'] ?? 'whatsapp');

    if (!empty($nombre) && !empty($puesto) && !empty($telefono)) {
        try {
            // Guardar postulación en MySQL
            $stmt = $pdo->prepare("INSERT INTO postulaciones (nombre, puesto, telefono, email, metodo_contacto) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$nombre, $puesto, $telefono, $email, $metodo]);

            if ($metodo === 'whatsapp') {
                // Redirigir a WhatsApp con texto listo
                $numeroWhatsApp = "5493511234567"; // Poné el número de WhatsApp oficial de Jobbers
                $mensaje = urlencode("¡Hola! Mi nombre es $nombre. Me postulo para el puesto de $puesto desde la web.");
                header("Location: https://wa.me/$numeroWhatsApp?text=$mensaje");
                exit();
            } else {
                // Enviar por Email/Gmail
                $destino = "gerenciaoperativagastronomica@gmail.com";
                $asunto = "Nueva Postulación Express: $puesto";
                $cuerpo = "Se ha recibido una nueva postulación:\n\n"
                        . "Nombre: $nombre\n"
                        . "Puesto: $puesto\n"
                        . "Teléfono: $telefono\n"
                        . "Email: $email\n";
                $headers = "From: no-reply@jobbersargentina.com\r\n"
                         . "Reply-To: $email\r\n";

                mail($destino, $asunto, $cuerpo, $headers);

                // Redirigir a una confirmación
                header("Location: index.html?status=exito");
                exit();
            }

        } catch (PDOException $e) {
            echo "Error al guardar los datos: " . $e->getMessage();
        }
    } else {
        echo "Por favor completá los campos requeridos.";
    }
}
?>
