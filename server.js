// server.js
// MWALIMU — Bot éducatif anonyme, sécurisé et bienveillant
// IA moderne OpenAI + programme EPST + filtrage pédagogique

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const OpenAI = require("openai");

const app = express();

/* =========================
   CONFIGURATION IA
========================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* =========================
   SÉCURITÉ DE BASE
========================= */
app.use(helmet());
app.use(express.json({ limit: "5kb" }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30
});
app.use("/webhook", limiter);

/* =========================
   STOCKAGE DES CONVERSATIONS
========================= */
const FILE_PATH = path.join(__dirname, "conversations.json");
const REPONSES_PATH = path.join(__dirname, "reponses.json");

let conversations = fs.existsSync(FILE_PATH)
  ? JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"))
  : {};

let reponsesMemoire = fs.existsSync(REPONSES_PATH)
  ? JSON.parse(fs.readFileSync(REPONSES_PATH, "utf-8"))
  : {};

function saveAll() {
  fs.writeFileSync(FILE_PATH, JSON.stringify(conversations, null, 2));
  fs.writeFileSync(REPONSES_PATH, JSON.stringify(reponsesMemoire, null, 2));
}

/* =========================
   FONCTIONS UTILES
========================= */
function messageEstValide(texte) {
  if (!texte || texte.length < 3) return false;
  if (/^[^a-zA-Z0-9]+$/.test(texte)) return false;
  if (/^(.)\1{4,}$/.test(texte)) return false;
  return true;
}

function demandeInappropriee(texte) {
  const interdits = [
    "triche", "copier", "examen", "réponse directe",
    "insulte", "prof nul", "fraude", "mensonge"
  ];
  texte = texte.toLowerCase();
  return interdits.some(mot => texte.includes(mot));
}

/* =========================
   IA SIMPLIFIÉE
========================= */
async function simplifierExplication(question, contenu) {
  const prompt = `
Tu es un enseignant congolais respectant strictement le programme EPST.
Explique simplement et étape par étape, sans donner la réponse directe.
Réponds en phrases courtes adaptées à WhatsApp.

Question : "${question}"
Base pédagogique : "${contenu}"
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.4
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error("❌ Erreur IA :", err.message);
    return "Je rencontre une difficulté technique 🙂 Essayons autrement.";
  }
}

/* =========================
   ROUTES
========================= */
app.get("/", (req, res) => {
  res.send("MWALIMU est en ligne ✅");
});

// Vérification webhook WhatsApp / Meta
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Réception des messages
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body.text !== "string" || typeof body.from !== "string") {
      return res.json({ ok: true });
    }

    const texte = body.text.toLowerCase().trim();
    const sourceId = body.from;

    if (!messageEstValide(texte)) {
      return res.json({
        to: sourceId,
        text: "Peux-tu reformuler calmement 🙂"
      });
    }

    if (demandeInappropriee(texte)) {
      return res.json({
        to: sourceId,
        text:
          "Je ne peux pas aider pour ce type de demande.\n" +
          "Je suis là pour t’aider à apprendre honnêtement 📘"
      });
    }

    if (!conversations[sourceId]) {
      conversations[sourceId] = {
        id: uuidv4(),
        etape: "debut",
        messages: []
      };
    }

    conversations[sourceId].messages.push({
      text: texte,
      date: new Date().toISOString()
    });

    if (reponsesMemoire[texte]) {
      return res.json({ to: sourceId, text: reponsesMemoire[texte] });
    }

    let contenu = "Contenu conforme au programme EPST.";
    if (texte.includes("fraction")) {
      contenu = "Une fraction est une partie d’un tout.";
    } else if (texte.includes("addition")) {
      contenu = "L’addition consiste à réunir plusieurs quantités pour obtenir une somme totale.";
    }

    const reponse = await simplifierExplication(texte, contenu);
    reponsesMemoire[texte] = reponse;
    saveAll();

    res.json({ to: sourceId, text: reponse });

  } catch (err) {
    console.error("🔥 Erreur serveur :", err);
    res.json({
      to: req.body?.from,
      text: "Une erreur est survenue, mais je suis toujours là 🙂"
    });
  }
});

/* =========================
   ERREURS CRITIQUES
========================= */
process.on("uncaughtException", err => console.error("💥 Exception :", err));
process.on("unhandledRejection", err => console.error("💥 Promesse rejetée :", err));

/* =========================
   DÉMARRAGE (RENDER OK)
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ MWALIMU prêt sur le port ${PORT}`);
});
