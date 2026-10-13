# Site ONG-BK

Site public et espace d’administration de l’ONG Borja Kouila, construit avec Next.js, TypeScript, Tailwind CSS, Prisma et PostgreSQL.

## Démarrage local sous Windows 11

Prérequis : Node.js LTS, npm et PostgreSQL installés.

```powershell
Copy-Item .env.example .env
# Modifier .env localement avec l’URL PostgreSQL et les paramètres SMTP.
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Le serveur de développement ouvre `http://localhost:3000`. Pour lancer le serveur de production localement, exécuter `npm run build` puis `npm start`. `npm start` seul échoue si aucun build `.next` n’existe.

Les variables requises et la procédure de création sécurisée du premier compte sont décrites dans [docs/backend-setup.md](./docs/backend-setup.md). Ne versionnez jamais `.env`, mot de passe, jeton ou identifiant SMTP. Le premier administrateur est créé avec le rôle `SYSTEM_ADMIN` uniquement via le script de bootstrap ; ne réutilisez pas un mot de passe communiqué dans un chat.

## État fonctionnel vérifié dans le code

- Pages publiques et espace administration authentifié côté serveur.
- Sessions à jeton opaque, mots de passe hachés, récupération par courriel nécessitant SMTP.
- Gestion des comptes d’appui, rôles self-service limités, tâches, rôles institutionnels BE/CCE.
- APIs financières pour exercices, budgets, recettes, dépenses, transitions contrôlées et historisées.
- Synthèse financière par exercice et devise, exports CSV/Excel/PDF protégés par permission.
- Espace CCE de constats/recommandations historisés, avec réponses BE séparées.
- Stockage de documents privé ; l’accès aux justificatifs financiers vérifie aussi la permission financière.

La migration [20261013000000_application_modules_and_finance](./prisma/migrations/20261013000000_application_modules_and_finance/migration.sql) a été générée à partir du schéma et des migrations versionnées ; elle n’a pas été appliquée ni vérifiée contre une base PostgreSQL réelle. Elle comble aussi des écarts plus anciens entre schéma et historique des migrations. Ne l’appliquez pas à une base existante avant d’avoir comparé son état réel et réconcilié les éventuelles tables déjà créées hors migrations. Aucun compte principal n’a été créé dans une base : aucune configuration de base locale n’était disponible.

## Contrôles disponibles

```powershell
npm test
npm run lint
npm run build
```

Les tests unitaires vérifient les calculs, les permissions ainsi que la génération et la structure des fichiers PDF/Excel. Le smoke test HTTP E2E, après le build, utilise un serveur de test distinct :

```powershell
$env:PORT = "3100"
npm start
# Dans un autre terminal :
$env:E2E_BASE_URL = "http://localhost:3100"
npm run test:e2e
```

Ces contrôles HTTP couvrent plusieurs pages publiques statiques, la redirection de l’administration et le refus d’accès anonyme aux API et exports financiers. Ils ne remplacent pas encore les tests d’intégration PostgreSQL, les parcours métier authentifiés ni une restauration réelle. Le site n’est donc pas déclaré prêt pour la production.

## Documentation

- [Configuration et sécurité du back-end](./docs/backend-setup.md)
- [Finances, CCE, sauvegarde et déploiement](./docs/operations-finance.md)

Les règles métier institutionnelles, les rôles nominatifs, les durées légales de conservation, les coordonnées officielles et le fournisseur de production doivent être validés par l’ONG-BK avant leur activation.
