# Fondations du back-end ONG-BK

## Architecture

- PostgreSQL est la source de données, accédée exclusivement côté serveur avec Prisma.
- Les sessions sont des jetons aléatoires opaques. Seul leur condensat SHA-256 est stocké en base ; le cookie est `HttpOnly`, `SameSite=Strict`, limité à 8 heures par défaut et `Secure` en production.
- Les mots de passe sont hachés avec bcrypt (coût 12). Il n’existe ni inscription publique ni compte par défaut.
- Chaque page protégée est sous `app/admin/(secure)` et vérifie la session côté serveur. Chaque endpoint `/api/admin` appelle `authorizeApi()` avec la permission nécessaire. Masquer un lien ou un bouton ne constitue jamais un contrôle d’accès.
- Les autorisations effectives sont stockées dans `RolePermission`. `lib/rbac.ts` définit les attributions institutionnelles de départ utilisées par `npm run db:seed`. Ne donnez pas les permissions d’approbation au rôle technique.
- L’attribution d’un rôle institutionnel est réservée au rôle `SYSTEM_ADMIN`, attribué uniquement par le bootstrap initial ; aucun autre compte ne peut se promouvoir administrateur principal.
- `db:seed` remet les permissions de tous les rôles sur la matrice de référence ; ne le relancez pas après une personnalisation de permissions sans valider le changement.
- Les membres de la CCE peuvent consulter les données financières, enregistrer et suivre leurs constats et recommandations, et lire les réponses du BE. Ils ne peuvent pas modifier les opérations financières examinées ni écrire les réponses du BE. Les réponses sont ajoutées séparément et le suivi des constats est historisé.
- `AuditLog` n’enregistre ni mot de passe, ni jeton, ni contenu des paramètres. Les sessions et jetons de récupération ne sont jamais consignés en clair.

## PostgreSQL et variables d’environnement

1. Installer PostgreSQL 17 depuis un terminal PowerShell lancé en tant qu’administrateur Windows :

   ```powershell
   winget install --id PostgreSQL.PostgreSQL.17 --exact --source winget --accept-source-agreements --accept-package-agreements
   ```

   Le programme d’installation demandera les paramètres du service. Définir un nouveau mot de passe local pour le superutilisateur PostgreSQL ; ne pas le réutiliser comme mot de passe applicatif et ne pas le transmettre dans le chat.

2. Après démarrage du service, ouvrir `psql` puis créer un compte de service et une base de développement dédiée :

   ```powershell
   psql --host localhost --username postgres --dbname postgres
   ```

   Dans l’invite `psql` :

   ```sql
   CREATE ROLE ongbk_app LOGIN;
   \password ongbk_app
   CREATE DATABASE ongbk OWNER ongbk_app;
   \q
   ```

   `\password` demande le secret de manière interactive. Utiliser le rôle applicatif, et non le superutilisateur, dans `DATABASE_URL`.

3. Dans le terminal PowerShell de VS Code, à la racine du projet :

   ```powershell
   Copy-Item .env.example .env
   ```

4. Modifier `.env` localement. Par défaut, gardez `DATABASE_URL` et `DIRECT_URL` identiques ; si vous utilisez un pooler externe (par exemple Supabase), mettez `DATABASE_URL` sur le pooler transactionnel (port `6543`) et `DIRECT_URL` sur le pooler session (port `5432`) pour les migrations. Utilisez un mot de passe local unique, ne le versionnez jamais dans Git et encodez les caractères spéciaux dans l’URL. Définir `APP_URL` et configurer les paramètres SMTP du fournisseur institutionnel :

   ```dotenv
   DATABASE_URL="postgresql://ongbk_app:motdepasse-local@localhost:5432/ongbk?schema=public"
   DIRECT_URL="postgresql://ongbk_app:motdepasse-local@localhost:5432/ongbk?schema=public"
   APP_URL="http://localhost:3000"
   SMTP_HOST="smtp.votre-fournisseur"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="compte-smtp"
   SMTP_PASSWORD="secret-fourni-par-votre-administrateur"
   SMTP_FROM="ONG-BK <adresse-expediteur-vérifiée>"
   AUTH_SESSION_HOURS="8"
   
   ```
5. Appliquer le schéma et les migrations, puis attribuer les rôles initiaux :

   ```powershell
   npm install
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

   En production, appliquer uniquement les migrations déjà générées avec `npm run db:deploy` ; ne pas utiliser `migrate dev` sur la base de production.

## Premier compte administrateur

Sur `/admin/login`, le lien « Créer le premier compte administrateur » apparaît tant qu’aucun compte utilisateur n’existe. La route `/admin/setup` permet alors de créer le compte `SYSTEM_ADMIN` avec vos propres identifiants et ouvre une session après la création. La transaction sérialise les créations concurrentes ; dès qu’un utilisateur existe, l’inscription initiale est fermée. Aucun compte ni mot de passe par défaut n’est créé. Le rôle `SYSTEM_ADMIN` peut créer les comptes opérationnels et affecter des tâches, sans pouvoir d’approbation financière ou institutionnelle ; le rôle `TECHNICAL_ADMIN` n’est pas un administrateur principal.

Avant d’ouvrir le site aux utilisateurs, définissez `ADMIN_SETUP_SECRET` dans `.env` avec une valeur aléatoire privée d’au moins 32 caractères. Dans PowerShell, générez-la localement :

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try {
  $rng.GetBytes($bytes)
  [Convert]::ToBase64String($bytes)
}
finally {
  $rng.Dispose()
}
```

Copiez la valeur affichée dans `ADMIN_SETUP_SECRET` de `.env`, redémarrez l’application, ouvrez `/admin/setup` et saisissez le même code avec le nom, l’adresse e-mail et un mot de passe fort. Ne transmettez pas le code ou le mot de passe dans le chat et ne les ajoutez jamais au dépôt. Le formulaire exige également une requête de même origine. Si la base de données contient déjà un compte, cette création initiale ne peut plus être utilisée.

Le processus CLI ci-dessous reste disponible pour une création opérée directement sur le serveur. Il refuse également de s’exécuter si un utilisateur existe déjà.

Dans PowerShell, demander les informations sans inscrire le mot de passe dans l’historique de commandes :

```powershell
$env:BOOTSTRAP_ADMIN_EMAIL = Read-Host "Adresse e-mail de l'administrateur"
$env:BOOTSTRAP_ADMIN_FIRST_NAME = Read-Host "Prénom"
$env:BOOTSTRAP_ADMIN_LAST_NAME = Read-Host "Nom"
$securePassword = Read-Host "Mot de passe initial (12 caractères minimum)" -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
  $env:BOOTSTRAP_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  npm run db:bootstrap-admin
}
finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  Remove-Item Env:BOOTSTRAP_ADMIN_EMAIL, Env:BOOTSTRAP_ADMIN_FIRST_NAME, Env:BOOTSTRAP_ADMIN_LAST_NAME, Env:BOOTSTRAP_ADMIN_PASSWORD -ErrorAction SilentlyContinue
  Remove-Variable securePassword, passwordPointer -ErrorAction SilentlyContinue
}
```

Le mot de passe doit avoir au moins 12 caractères et au plus 72 octets en UTF-8. Le script n’affiche jamais le mot de passe. Utilisez un nouveau secret saisi localement et unique ; un secret communiqué dans un chat doit être considéré comme exposé et remplacé. Depuis `/admin/users`, l’administrateur principal peut créer les comptes opérationnels avec les rôles `TECHNICAL_ADMIN`, `CONTENT_EDITOR` ou `ONG_MEMBER`, désactiver/réactiver ces comptes et attribuer des tâches. Les rôles institutionnels nominatifs BE/CCE et les rôles financiers ne sont pas attribuables depuis cette interface ; leur attribution requiert une décision institutionnelle approuvée et une opération contrôlée consignée. Les nouveaux utilisateurs définissent leur propre mot de passe par « Mot de passe oublié » ; cela exige un service SMTP configuré.

Après approbation documentée d’une nomination, un opérateur PostgreSQL autorisé peut appliquer cette transaction, en remplaçant le courriel fictif de l’exemple par celui du compte préalablement créé. Conserver aussi la preuve de validation dans le registre institutionnel ; l’`actorId` nul dans cette trace indique une attribution opérée hors interface applicative :

```sql
BEGIN;
WITH changed AS (
  UPDATE "User"
  SET "roleCode" = 'BE_PRESIDENT'
  WHERE "email" = lower('ADRESSE_VERIFIEE')
    AND "isActive" = true
    AND "archivedAt" IS NULL
  RETURNING "id"
)
INSERT INTO "AuditLog" ("id", "actorId", "event", "subjectType", "subjectId", "createdAt")
SELECT md5(random()::text || clock_timestamp()::text), NULL, 'PERMISSION_CHANGED',
       'institutional-role', "id", now()
FROM changed;
COMMIT;
```

Adapter uniquement la valeur `roleCode` aux rôles prévus dans les statuts validés ; vérifier ensuite l’utilisateur et la trace créée. Les opérateurs DB doivent consigner leur identité et le justificatif dans le journal d’exploitation externe.

## Phase institutionnelle

La migration `20261012000000_institutional_modules` ajoute les rubriques institutionnelles versionnées, les membres et demandes d’adhésion, les postes et mandats, les documents officiels et les réunions/décisions. La migration `20261013000000_application_modules_and_finance` ajoute les modules publics absents de l’historique précédent, l’administration, la finance et la CCE. Cette dernière a été générée mais n’a pas été appliquée ni essayée sur PostgreSQL. Si la base contient déjà les tables de projet/activité ou les tables financières créées hors migrations, inspecter et réconcilier avant application pour éviter les collisions ; ne pas utiliser `db push` pour contourner les migrations.

Après avoir configuré PostgreSQL dans `.env`, exécuter depuis PowerShell à la racine du projet :

```powershell
npx prisma validate
npm run db:generate
npm run db:deploy
npm run db:seed
```

Pour une base locale neuve, appliquer les migrations, créer d’abord les rôles et permissions par le seed, puis le premier compte administrateur principal. Le seed suivant crée les rubriques d’identité rattachées à ce compte, sans écraser les rubriques déjà créées :

```powershell
npm run db:seed
# Exécuter ici le bloc PowerShell de création du compte ci-dessus
npm run db:seed
```

`db:seed` remet la matrice des permissions institutionnelles aux valeurs du code. Ne le relancez pas après des modifications manuelles de permissions sans en vérifier l’impact. Les postes BE/CCE sont préconfigurés, mais aucun titulaire ou mandat fictif n’est créé. Les champs institutionnels inconnus restent vides. Les rôles nominaux (BE, CCE, etc.) ne peuvent être attribués qu’après validation des nominations réelles ; effectuez cette attribution depuis un canal DB restreint, contrôlé et audité, jamais depuis le compte technique.

Le parcours `/admin/institutionnel` est filtré selon les permissions : contenus, mandats et historique, demandes d’adhésion et dossiers membres, dépôt/archivage de documents, réunions, participants, présences et décisions. La gestion éditoriale se trouve dans `/admin/publications` : les personnes ayant `CONTENT_CREATE` peuvent rédiger des articles ; sans `CONTENT_APPROVE`, leurs articles sont transmis pour validation au lieu d’être publiés directement. Les PDF sont déposés en stockage privé avec confidentialité publique, puis doivent être approuvés dans la gestion documentaire avant d’apparaître dans la bibliothèque `/actualites`. Les droits d’écriture des mandats du BE et de la CCE sont distincts ; le CCE peut consulter les dossiers qui lui sont autorisés et créer ses réunions, mais ne peut pas modifier les dossiers contrôlés. Chaque mutation sensible est journalisée. Les acceptations d’adhésion créent un dossier membre et n’ouvrent pas automatiquement de compte de connexion.

Les documents sont stockés hors de `public/` dans `private-data/documents/` par défaut. En production, définir `PRIVATE_UPLOADS_DIR` dans `.env` comme chemin absolu vers un volume privé persistant et sauvegardé. Ne pas monter ce volume sous le répertoire du site public. Seuls les PDF, JPEG et PNG dont la signature correspond au type annoncé, jusqu’à 10 Mo, sont acceptés. Le téléchargement passe par `/api/documents/[id]` qui revalide la session, la confidentialité et le rôle. Une panne ou un fichier manquant est signalé, jamais remplacé par un contenu factice.

La réception publique des demandes d’adhésion est désactivée (503) tant que `MEMBERSHIP_REQUEST_RETENTION_DAYS` n’est pas renseigné conformément à une politique institutionnelle de conservation approuvée. Aucune durée légale n’est présumée par le code. Une fois cette durée définie et configurée, planifier `npm run db:cleanup-membership-requests`; le nettoyage ne supprime pas silencieusement les demandes liées à des documents.

La page « À propos » présente le contenu institutionnel statique disponible dans l’application ; les fonctions d’édition des rubriques de contenu restent accessibles selon les permissions dans l’administration. Le slogan, la devise et les domaines fournis sont initialisés par le seed lorsque le compte d’auteur existe. Le personnel et les mandats ne sont affichés qu’après saisie administrative réelle. La page `/actualites` affiche l’article éditorial de sensibilisation sur l’égalité et les publications de la base dont le statut est `PUBLISHED` ; l’article éditorial n’est pas une déclaration officielle adoptée par l’organisation.

La page `/actions` affiche les domaines, l’approche, des repères de conduite d’un projet et un tableau issu des publications `VOLUNTEER_CALL` et `PROJECT_CALL` publiées. L’appel « Formation en langues étrangères », avec candidatures du 1er novembre 2026 au 20 juin 2027 inclus, est initialisé par `npm run db:seed` lorsqu’un premier compte administrateur existe ; le seed est idempotent et ne réactive pas un appel archivé. Pour créer une autre offre, utiliser `/admin/publications`, renseigner son résumé, sa catégorie, les deux dates d’ouverture/clôture et un descriptif complet (missions ou objet, profil/critères, modalités, pièces et échéance uniquement si confirmés), puis la publier ou la soumettre à validation selon les permissions. Le public accède à sa fiche `/actions/offres/{slug}` et au formulaire de candidature lié. Celui-ci transmet une demande `VOLUNTEER` ou `PROJECT_PROPOSAL` à l’API publique existante ; la période est vérifiée côté serveur et la réception nécessite une valeur `OPERATION_REQUEST_RETENTION_DAYS` conforme à la politique de conservation approuvée. Une candidature ne vaut ni sélection, ni adhésion, ni attribution de statut.
La page `/actions` affiche les domaines, l’approche, des repères de conduite d’un projet et un tableau issu des publications `VOLUNTEER_CALL` et `PROJECT_CALL` publiées. L’appel « Formation en langues étrangères », avec candidatures du 1er novembre 2026 au 20 juin 2027 inclus, est initialisé par `npm run db:seed` lorsqu’un premier compte administrateur existe ; le seed est idempotent et ne réactive pas un appel archivé. Pour créer une autre offre, utiliser `/admin/publications`, renseigner son résumé, sa catégorie, les deux dates d’ouverture/clôture et un descriptif complet (missions ou objet, profil/critères, modalités, pièces et échéance uniquement si confirmés), puis la publier ou la soumettre à validation selon les permissions. Le public accède à sa fiche `/actions/offres/{slug}` et au formulaire de candidature lié. Les demandes liées aux offres utilisent le nouveau type `APPLICATION` (migration `20261013120000_training_application_type`) ; elles sont enregistrées dans l’inbox existante, après contrôle de la période côté serveur. Leur réception nécessite une valeur `OPERATION_REQUEST_RETENTION_DAYS` conforme à la politique de conservation approuvée. Une candidature ne vaut ni sélection, ni adhésion, ni attribution de statut.

Les titulaires de `CONTENT_READ` peuvent suivre les appels depuis `/admin/publications`. Les personnes titulaires de `CONTENT_ARCHIVE` peuvent utiliser « Retirer / archiver » : l’appel cesse alors d’être affiché dans les pages publiques, sans suppression de son historique.

## Exécution, tests et limites de cette phase

```powershell
npm test
npm run lint
npm run build
npm start
```

L’interface d’accès est disponible à `/admin`, l’écran de connexion à `/admin/login` et le module institutionnel à `/admin/institutionnel`. La récupération nécessite SMTP opérationnel. Les routes d’administration vérifient les permissions sur le serveur et ne mettent pas leurs réponses en cache.

Planifier `npm run db:cleanup-auth` quotidiennement dans le planificateur du système afin de supprimer les sessions et jetons expirés ainsi que les limites d’essais anciennes. Le script ne supprime pas les journaux d’audit.

Les tests automatisés présents vérifient les schémas d’entrée, la taille des corps HTTP et la séparation des pouvoirs RBAC. Ils ne remplacent pas un test d’intégration sur un PostgreSQL configuré. Avant mise en production, configurer TLS pour PostgreSQL et SMTP, un proxy qui remplace (et non ajoute des valeurs contrôlées par le client à) les en-têtes `X-Real-IP` ou `X-Forwarded-For`, les sauvegardes/restaurations et une politique de rétention/anonymisation des demandes d’adhésion et du journal d’audit. Ajouter un endpoint admin uniquement s’il appelle `authorizeApi(permission)` pour chaque action et journalise les opérations sensibles dans la même transaction que la mutation.

**Périmètre à valider avant production :** les tests présents sont unitaires ; aucun test d’intégration PostgreSQL, parcours E2E, export PDF/Excel ni restauration de sauvegarde n’a été vérifié ici. Les modules financiers et CCE doivent recevoir leur migration de schéma, puis être testés sur une base isolée avant utilisation. Le tableau financier fournit une synthèse et un export CSV ; ce n’est pas le module complet de rapports demandé.

Les comptes et tâches se gèrent sous `/admin/users`. Les opérations financières et tableaux de bord sont sous `/admin/finance`; les constats, réponses distinctes du BE et historiques sont sous `/admin/cce`. Toute permission est de nouveau contrôlée par l’API, indépendamment des liens affichés dans l’interface. Voir [operations-finance.md](./operations-finance.md) pour le périmètre, les sauvegardes, la restauration et les limites restantes.
