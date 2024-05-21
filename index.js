const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const app = express();
const port = 8080;

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/subscribe", (req, res) => {
  res.render("inscription");
});

//EXO FORMULAIRE
const users = [];

app.post("/register", (req, res) => {
  const { firstName, lastName, username, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.send(`
      <p>Les mots de passe ne correspondent pas. Veuillez réessayer.</p>
      <a href="/">Retour au formulaire</a>
    `);
  }
  const existingUser = users.find(
    (user) => user.firstName === firstName && user.lastName === lastName
  );

  if (existingUser) {
    existingUser.username = username;
    existingUser.password = password;
    return res.send(`
      <p>Bonjour ${firstName} ${lastName}, tes informations ont été mises à jour.</p>
    `);
  }
  users.push({ firstName, lastName, username, password });
  res.send(`
    <p>Bonjour ${firstName} ${lastName}, ton compte est bien créé.</p>
  `);
});

//EXO COURS
const coursData = {
  1: {
    title: "Introduction à la Programmation",
    description: "Ce cours introduit les concepts de base de la programmation.",
    teachers: ["Alice Dupont", "Bob Martin", "Charlie Brown"],
  },
  2: {
    title: "Structures de Données",
    description: "Ce cours couvre les structures de données fondamentales.",
    teachers: ["David Clark", "Eva White"],
  },
  3: {
    title: "Algorithmes Avancés",
    description:
      "Ce cours explore des algorithmes avancés et leur application.",
    teachers: ["Frank Wright", "Grace Hopper", "Hannah Lee"],
  },
};

// CATCH DE TOUTE LES REQUETES
app.use((req, res, next) => {
  console.log(`Requête reçue à ${Date.now()}`);
  console.log(req.url);
  next();
});

// PAGE D'ACCEUIL
app.get("", (req, res) => {
  res.render("index");
});
app.get("/home", (req, res) => {
  res.render("index");
});

// TEMPLATE DE COURS AVEC EJS
app.get("/cours/:numeroducours/descr", (req, res) => {
  const numeroDuCours = req.params.numeroducours;
  const cours = coursData[numeroDuCours];

  if (cours) {
    res.render("cours", {
      title: cours.title,
      description: cours.description,
      teachers: cours.teachers,
    });
  } else {
    res.status(404).send("Cours non trouvé");
  }
});

//PREMIERE PARTIE
app.get("/private", (req, res) => {
  res.send("<h4>PRIVATE</h4>");
});

app.get("/private/mine", (req, res) => {
  res.send("<h4>PRIVATE/MINE</h4>");
});

app.get("/pictures", (req, res) => {
  const filePath = path.join(__dirname, "public", "favicon.ico");
  res.download(filePath, (err) => {
    if (err) {
      console.error("Erreur lors du téléchargement", err);
      res.status(500).send("Erreur lors du téléchargement");
    }
  });
});

app.get("/about", (req, res) => {
  console.log("Envoie des infos");
  console.log(
    "Auteur : Maxime Bidan \nNom: tp_express\nVersion: 1.0.0\nDescription: TP cours NodeJS"
  );
  res.send("Informations envoyées");
});

app.use((req, res) => {
  console.log("Abort v2");
  res.status(400).send("Erreur : Requête non valide");
});

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
