// Étape 1 : Importer les dépendances nécessaires
import express from 'express'; // Framework pour créer des applications web
import mongoose from 'mongoose'; // Bibliothèque pour interagir avec MongoDB
import helmet from 'helmet'; // Middleware pour sécuriser l'application
import path from 'path'; // Module pour gérer les chemins de fichiers
import { fileURLToPath } from 'url'; // Utilitaire pour gérer les fichiers dans les modules ES
import bcrypt from 'bcrypt'; // Pour hacher les mots de passe
import bodyParser from 'body-parser'; // Pour parser les données des formulaires

// Configuration pour obtenir le chemin absolu du fichier en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Étape 2 : Créer une instance de l'application Express
const app = express();

// Étape 3 : Configurer la connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/rencontreRepas', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Étape 4 : Middleware pour le parsing des requêtes et la sécurité
app.use(express.static('public')); // Pour servir des fichiers statiques depuis le dossier 'public'
app.use(express.urlencoded({ extended: true })); // Pour parser les données des formulaires
app.use(express.json()); // Pour analyser les données JSON (si nécessaire)
app.use(helmet()); // Sécuriser les en-têtes HTTP

// Étape 5 : Configurer les directives de sécurité pour Helmet
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", 'https://www.gstatic.com', 'https://fonts.googleapis.com'], // Ajouter des styles externes
    scriptSrc: ["'self'", 'https://www.gstatic.com', 'https://cdnjs.cloudflare.com'], // Ajouter des scripts externes
    imgSrc: ["'self'", 'data:'], // Autoriser les images locales et les données inline
    connectSrc: ["'self'"]
  }
}));

// Étape 6 : Définir le schéma Mongoose pour les utilisateurs
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Email unique
  password: { type: String, required: true },
  food_pref: { type: String, required: true },
  hobby: { type: String, required: true }
});

// Étape 7 : Créer le modèle Mongoose pour les utilisateurs
const User = mongoose.model('User', userSchema);

// Étape 8 : Route de base pour afficher le formulaire d'inscription
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html')); // Servir le fichier HTML d'inscription
});

// Étape 9 : Route pour gérer l'inscription
app.post('/signup', async (req, res) => {
  const { name, email, password, food_pref, hobby } = req.body;

  // Validation des champs
  if (!name || !email || !password || !food_pref || !hobby) {
    return res.status(400).send('Tous les champs sont requis.');
  }

  try {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Cet email est déjà utilisé.');
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Étape 10 : Créer une nouvelle instance de l'utilisateur
    const newUser = new User({
      name,
      email,
      password: hashedPassword, // Mot de passe haché
      food_pref,
      hobby
    });

    // Étape 11 : Enregistrer l'utilisateur dans la base de données
    await newUser.save();
    res.status(201).send('Inscription réussie');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de l\'inscription');
  }
});

// Étape 12 : Démarrer le serveur
const port = 3000; // Port sur lequel le serveur écoute
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://www.gstatic.com', 'https://fonts.googleapis.com'],
    scriptSrc: ["'self'", 'https://www.gstatic.com', 'https://cdnjs.cloudflare.com'],
    imgSrc: ["'self'", 'data:'],
    connectSrc: ["'self'"]
  }
}));
