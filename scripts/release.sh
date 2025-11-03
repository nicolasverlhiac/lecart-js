#!/bin/bash

# Script de release pour LeCart
# Usage: ./scripts/release.sh [patch|minor|major]

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Vérifier qu'on est sur la branche main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    error "Vous devez être sur la branche 'main' pour créer une release (branche actuelle: $CURRENT_BRANCH)"
fi

# Vérifier qu'il n'y a pas de modifications non commitées
if ! git diff-index --quiet HEAD --; then
    error "Il y a des modifications non commitées. Veuillez commit ou stash vos changements."
fi

# Vérifier que la branche est à jour avec origin
info "Vérification de la synchronisation avec origin..."
git fetch origin
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
if [ "$LOCAL" != "$REMOTE" ]; then
    error "Votre branche n'est pas synchronisée avec origin. Faites 'git pull' d'abord."
fi

# Déterminer le type de version (patch par défaut)
VERSION_TYPE=${1:-patch}

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    error "Type de version invalide. Utilisez: patch, minor, ou major"
fi

info "Type de release: ${VERSION_TYPE}"

# Vérifier que npm est connecté
if ! npm whoami &> /dev/null; then
    error "Vous n'êtes pas connecté à npm. Faites 'npm login' d'abord."
fi

NPM_USER=$(npm whoami)
success "Connecté à npm en tant que: $NPM_USER"

# Exécuter les tests
info "Exécution des tests..."
if ! npm test; then
    error "Les tests ont échoué. Corrigez-les avant de créer une release."
fi
success "Tests passés"

# Builder le projet
info "Build du projet..."
if ! npm run build; then
    error "Le build a échoué."
fi
success "Build réussi"

# Bumper la version (sans créer de tag git automatiquement)
info "Bump de la version ($VERSION_TYPE)..."
NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version)
success "Nouvelle version: $NEW_VERSION"

# Commit des changements de version
info "Commit du changement de version..."
git add package.json package-lock.json
git commit -m "chore: Release $NEW_VERSION"

# Créer le tag git
info "Création du tag $NEW_VERSION..."
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"

# Pousser les changements et le tag
info "Push vers origin..."
git push origin main
git push origin "$NEW_VERSION"
success "Changements et tag poussés"

# Publier sur npm
info "Publication sur npm..."
if npm publish; then
    success "Package publié sur npm: https://www.npmjs.com/package/lecart"
else
    error "La publication npm a échoué"
fi

# Message final
echo ""
success "Release $NEW_VERSION créée avec succès! 🎉"
echo ""
info "Prochaines étapes:"
echo "  1. Créer la release GitHub: https://github.com/nicolasverlhiac/lecart-js/releases/new?tag=$NEW_VERSION"
echo "  2. Vérifier le package npm: https://www.npmjs.com/package/lecart"
echo ""
