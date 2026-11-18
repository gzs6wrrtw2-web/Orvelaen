# Orveläen – Première scène : le château

Prototype de départ en Phaser 4 + TypeScript + Vite.

## Lancer le projet

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
npm run dev
```

Ouvrir l'adresse locale indiquée par Vite.

Pour compiler :
```bash
npm run build
```

## Commandes
- Flèches ou ZQSD : déplacement
- E : interaction
- Espace / Entrée ou toucher l'écran : fermer un dialogue
- Écran tactile : pavé directionnel + bouton E

## État du prototype
Cette première livraison est un socle jouable avec décor provisoire dessiné en primitives Phaser :
- cour de château en vue de dessus ;
- Kanann contrôlable ;
- collisions aux limites de la carte ;
- garde, seigneur et écuries interactifs ;
- dialogue d'introduction et déclenchement de la mission.

Les graphismes sont provisoires. Les prochaines étapes sont la création des sprites pixel art définitifs, les collisions détaillées des bâtiments, la salle du trône et la transition vers le village incendié.
