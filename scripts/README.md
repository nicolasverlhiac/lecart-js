# Scripts LeCart

## Release Script

Script automatisé pour créer une nouvelle release de LeCart.

### Prérequis

1. Être sur la branche `main`
2. Aucune modification non commitée
3. Être connecté à npm (`npm login`)
4. Branche synchronisée avec origin

### Usage

```bash
# Release patch (1.0.1 → 1.0.2)
./scripts/release.sh patch

# Release minor (1.0.1 → 1.1.0)
./scripts/release.sh minor

# Release major (1.0.1 → 2.0.0)
./scripts/release.sh major

# Par défaut, c'est patch si non spécifié
./scripts/release.sh
```

### Ce que fait le script

1. ✅ Vérifie que vous êtes sur `main`
2. ✅ Vérifie qu'il n'y a pas de modifications non commitées
3. ✅ Vérifie la synchronisation avec origin
4. ✅ Vérifie la connexion npm
5. ✅ Exécute les tests (`npm test`)
6. ✅ Build le projet (`npm run build`)
7. ✅ Bump la version dans `package.json`
8. ✅ Commit les changements
9. ✅ Crée le tag git
10. ✅ Push vers GitHub (main + tag)
11. ✅ Publie sur npm
12. ℹ️  Affiche le lien pour créer la release GitHub

### Exemple de sortie

```
ℹ Vérification de la synchronisation avec origin...
✓ Connecté à npm en tant que: nicolasverlhiac
ℹ Exécution des tests...
✓ Tests passés
ℹ Build du projet...
✓ Build réussi
ℹ Bump de la version (patch)...
✓ Nouvelle version: v1.0.2
ℹ Commit du changement de version...
ℹ Création du tag v1.0.2...
ℹ Push vers origin...
✓ Changements et tag poussés
ℹ Publication sur npm...
✓ Package publié sur npm: https://www.npmjs.com/package/lecart

✓ Release v1.0.2 créée avec succès! 🎉

ℹ Prochaines étapes:
  1. Créer la release GitHub: https://github.com/nicolasverlhiac/lecart-js/releases/new?tag=v1.0.2
  2. Vérifier le package npm: https://www.npmjs.com/package/lecart
```

### Après l'exécution

Une fois le script terminé, il ne reste qu'à :
1. Cliquer sur le lien fourni pour créer la release GitHub
2. Remplir les release notes
3. Publier la release

### Gestion des erreurs

Le script s'arrête automatiquement en cas d'erreur :
- ❌ Pas sur la branche `main`
- ❌ Modifications non commitées
- ❌ Branche pas à jour avec origin
- ❌ Pas connecté à npm
- ❌ Tests échouent
- ❌ Build échoue
- ❌ Publication npm échoue

### Notes

- Le token npm doit être configuré localement via `npm login`
- Pas besoin de configurer `NPM_TOKEN` dans GitHub Actions
- Le workflow `npm-publish.yml` peut être désactivé ou supprimé
