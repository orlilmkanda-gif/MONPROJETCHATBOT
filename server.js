// server.js
const express = require('express');
const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
  const incomingMessage = req.body;
  const texte = incomingMessage.text.toLowerCase();
  let reponse = "";

  if (texte.includes("bonjour")) {
    reponse =
      "Bonjour 👋 Je suis MWALIMU, assistant scolaire et aide pédagogique.";
  } 
  else if (texte.includes("fraction")) {
    reponse =
      "D’accord 👍 parlons des fractions.\n\n" +
      "👉 Une fraction sert à représenter une partie d’un tout.\n\n" +
      "👉 Par exemple : si un gâteau est partagé en 4 parts égales et que tu prends 1 part, on écrit 1/4.\n\n" +
      "👉 Réfléchis : si tu prends 2 parts sur 4, comment écrirais-tu la fraction ?";
  } 
  else if (texte.includes("addition")) {
    reponse =
      "L’addition sert à ajouter des nombres. Par exemple : 2 + 3 = 5.";
  } 
  else {
    reponse =
      "Je suis MWALIMU. Pose-moi une question scolaire et je t’aiderai à comprendre.";
  }

  const reply = {
    to: incomingMessage.from,
    text: reponse
  };

  console.log("📤 Réponse envoyée :", reply);
  res.status(200).json(reply);
});

app.listen(3000, () => {
  console.log('Serveur MWALIMU lancé sur http://localhost:3000');
});

module.exports = app;
