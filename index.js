// Carga las variables de entorno
require("dotenv").config();

const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Carga el service account desde la ruta indicada en .env
const serviceAccount = require(process.env.SERVICE_ACCOUNT_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor FCM activo y saludable");
});

// Endpoint para enviar notificaciones push
app.post("/send", async (req, res) => {
  try {
    const { title, body, tokens } = req.body;

    if (!tokens || tokens.length === 0) {
      return res.status(400).json({ error: "No hay tokens de destino." });
    }

    const message = {
      notification: { title, body },
      tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    res.json({ successCount: response.successCount, failureCount: response.failureCount });
  } catch (error) {
    console.error("Error enviando notificación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Inicia el servidor localmente (Railway asignará el puerto en producción)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
