# Orveläen – Première scène : le château

Prototype Phaser 4 + TypeScript + Vite. La configuration Vite utilise `base: '/Orvelaen/'` pour GitHub Pages.

## Publication GitHub Pages

1. Copier le contenu de ce dossier à la racine du dépôt `gzs6wrrtw2-web/Orvelaen`.
2. Dans GitHub, ouvrir **Settings > Pages** et choisir **GitHub Actions** comme source de publication.
3. Envoyer les modifications sur la branche `main`.
4. Dans l'onglet **Actions**, attendre la réussite du workflow **Deploy Orvelaen to GitHub Pages**.

Le workflow compile TypeScript et Phaser avec Vite, puis publie le dossier `dist`.

## Développement local

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
npm run dev
```

Pour vérifier la compilation :

```bash
npm run build
```

## Commandes
- Flèches ou ZQSD : déplacement
- E : interaction
- Espace / Entrée ou toucher l'écran : fermer un dialogue
- Écran tactile : pavé directionnel + bouton E

Les graphismes restent provisoires à ce stade ; cette archive corrige avant tout la chaîne de compilation et de publication.
