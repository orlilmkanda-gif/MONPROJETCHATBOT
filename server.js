// server.js

const express = require("express");
const app = express();

// Stockage des conversations
const conversations = {};

// Middleware pour parser le JSON
app.use(express.json());

// WEBHOOK PRINCIPAL
app.post("/webhook", (req, res) => {
  const incomingMessage = req.body;
  const texte = incomingMessage.text.toLowerCase();
  const numero = incomingMessage.from;

  // 0️⃣ Initialisation de la conversation
  if (!conversations[numero]) {
    conversations[numero] = { etape: "presentation", niveau: "inconnu" };
  }

  // 1️⃣ Présentation automatique
  if (conversations[numero].etape === "presentation") {
    conversations[numero].etape = "attente_probleme";
    return res.json({
      to: numero,
      text:
        "Bonjour 👋 Je suis MWALIMU.\n\n" +
        "Je suis un assistant scolaire et aide pédagogique.\n" +
        "Explique-moi ton problème scolaire avec tes propres mots."
    });
  }

  // 2️⃣ Attente du problème
  if (conversations[numero].etape === "attente_probleme") {
    conversations[numero].etape = "explication";
    return res.json({
      to: numero,
      text:
        "Merci 👍 J'ai bien reçu ton problème.\n\n" +
        "Nous allons le traiter ensemble étape par étape."
    });
  }

  // 3️⃣ Détection du niveau
  if (texte.includes("2")) conversations[numero].niveau = "humanites2";
  if (texte.includes("3")) conversations[numero].niveau = "humanites3";
  if (texte.includes("4")) conversations[numero].niveau = "humanites4";

  // 4️⃣ Refus de donner directement la réponse
  if (texte.includes("reponse") || texte.includes("donne") || texte.includes("resous")) {
    return res.json({
      to: numero,
      text:
        "Je comprends ta demande 👍\n\n" +
        "Mais mon rôle n'est pas de donner directement la réponse.\n\n" +
        "Dis-moi plutôt ce que tu as déjà compris."
    });
  }

  // 5️⃣ Exemple guidé sur les fractions
  if (texte.includes("fraction")) {
    return res.json({
      to: numero,
      text:
        "Une fraction représente une partie d’un tout.\n\n" +
        "Par exemple, 1/2 signifie une part sur deux parts égales.\n\n" +
        "À ton avis, que représente le nombre du bas ?"
    });
  }

  // 6️⃣ Réponse par défaut
  return res.json({
    to: numero,
    text: "Je t'écoute 🙂 Explique-moi ce que tu ne comprends pas."
  });
});

// Lancement du serveur
app.listen(3000, () => {
  console.log("✅ Serveur MWALIMU lancé sur http://localhost:3000");
});