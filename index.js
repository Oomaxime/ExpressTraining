const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
const port = 8080;

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://maximebidan33:1234@clusterhetic.e85hlxq.mongodb.net/DBLP"
);

const db = mongoose.connection;

db.on("error", console.log.bind(console, "connection error"));
db.once("open", function (callback) {
  console.log("connection succeeded");
});

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/subscribe", (req, res) => {
  res.render("inscription");
});
//LOGIN

app.post("/login", function (req, res) {
  const username = req.body.username;
  const pass = req.body.password;

  db.collection("users").findOne(
    { username: username, password: pass },
    function (err, user) {
      if (err) {
        return res.status(500).send("Database error");
      }

      if (!user) {
        return res
          .status(401)
          .send("Nom d'utilisateur ou mot de passe incorrect");
      }
      req.session.user = user;
      res.redirect("/home");
    }
  );
});

//INSCRIPTION
app.post("/register", function (req, res) {
  const username = req.body.username;
  const email = req.body.email;
  const pass = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (pass !== confirmPassword) {
    return res.send("les mot de passe ne corresponde pas");
  }

  db.collection("users").findOne({ username: username }, function (err, user) {
    if (err) {
      return res.status(500).send("Database error");
    }

    if (user) {
      return res.redirect("/subscribe");
    }

    const data = {
      username: username,
      email: email,
      password: pass,
    };

    db.collection("users").insertOne(data, function (err, collection) {
      if (err) {
        return res.status(500).send("Error inserting record");
      }

      console.log("Record inserted Successfully");
      return res.render("index");
    });
  });
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
  res.render("login");
});

app.get("/home", (req, res) => {
  if (req.session.user) {
    res.render("index", { user: req.session.user });
  } else {
    res.redirect("/");
  }
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
  res.status(400).send("Erreur : Requête non valide");
});

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
