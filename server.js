// server.js
const express = require('express');
const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
  const incomingMessage = req.body;
  console.log("📩 Message reçu :", incomingMessage);

  const reply = {
    to: incomingMessage.from,
    text: `Bonjour 👋
Je suis MWALIMU AI.
Je vais t’aider à comprendre ta leçon, étape par étape.`
  };

  console.log("📤 Réponse envoyée :", reply);
  res.status(200).json(reply);
});

app.listen(3000, () => {
  console.log('Serveur MWALIMU lancé sur http://localhost:3000');
});

module.exports = app;
