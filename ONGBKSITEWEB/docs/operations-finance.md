# Finances, CCE, sauvegardes et déploiement

## Module financier livré dans le code

Le back-end contient des modèles Prisma pour les exercices, budgets, recettes, dépenses, leurs changements de statut et les événements d’audit. Les montants sont validés à deux décimales et calculés en centimes entiers. Les résumés gardent chaque devise séparée ; les promesses et engagements de recettes ne sont pas additionnés aux recettes encaissées. Le solde visible est calculé à partir des écritures de l’application et n’est pas un solde bancaire certifié.

Les dépenses suivent des transitions bornées, avec justificatif et moyen de paiement requis à l’enregistrement du paiement. Le demandeur ne peut vérifier ni approuver sa propre demande ; l’auteur d’un budget ne peut pas approuver ce budget. Les exercices se chevauchant sont refusés, et un exercice ne peut pas être clôturé tant que des dépenses ou budgets sont encore en attente.

Formules appliquées, calculées séparément pour chaque devise :

- Recettes encaissées = somme des statuts `RECEIVED` et `VERIFIED` ; `EXPECTED`, `COMMITTED`, `CANCELLED` et `REVERSED` ne sont pas comptés.
- Dépenses payées = somme des écritures `PAID` ; une dépense archivée reste comptée comme payée si `paidAt` est renseigné.
- Solde net calculé = recettes encaissées − dépenses payées. Ce n’est pas un solde bancaire certifié.
- Budget initial/révisé = sommes des budgets approuvés (y compris approuvés puis archivés, identifiés par `approvedAt`).
- Engagements impayés = sommes des dépenses soumises, en vérification, en attente d’approbation ou approuvées, à l’exclusion des brouillons, rejets et annulations.
- Solde budgétaire = budget révisé − dépenses payées − engagements impayés.
- Taux d’exécution = dépenses payées ÷ budget révisé × 100 ; le taux est non calculable (null) si le budget révisé vaut zéro.

Les opérations annulées, rejetées ou renversées restent dans le journal mais ne contribuent pas aux totaux réalisés. Aucun taux de change n’est appliqué ; des devises différentes ne sont jamais additionnées.

Les justificatifs doivent référencer un document officiel non archivé et de confidentialité `INTERNAL`. Le téléchargement passe par `/api/documents/[id]`, vérifie la session et la permission, ne sert jamais le fichier depuis `public/` et journalise les téléchargements des justificatifs financiers.

La CCE dispose d’un espace distinct. Elle peut créer des constats/recommandations et faire progresser leur statut avec une note historisée. Les réponses du BE sont ajoutées comme enregistrements séparés ; elles ne remplacent pas le constat et ne peuvent pas clôturer la recommandation.

## Limites restantes du module

- Une migration SQL a été générée à partir de l’historique versionné et du schéma courant ; elle n’a pas été testée contre PostgreSQL et n’a pas été appliquée.
- L’historique versionné ne contient pas plusieurs modules publics déjà présents dans le schéma (projets, activités, partenaires, médias et publications). La migration ajoute ces tables manquantes ainsi que les modules tâches, financiers et CCE ; une base existante ayant reçu ces tables par `db push` ou par une procédure non versionnée doit d’abord être inspectée et réconciliée.
- Les formulaires d’administration permettent de créer exercices, budgets, recettes attendues/engagées et demandes de dépenses, puis de suivre les transitions. Les liaisons UI vers projets/activités, filtres détaillés et consultation paginée des historiques restent à compléter.
- La révision post-approbation de budget, le workflow de validation par projet/domaine, les conversions de devises avec taux horodaté et certains filtres/rapports ne sont pas implémentés.
- Le tableau de bord couvre une synthèse financière et les recommandations CCE ; il ne couvre pas encore tout le tableau institutionnel global.
- Les exports de synthèse financière CSV, Excel (.xlsx) et PDF sont disponibles uniquement aux comptes autorisés à `FINANCE_EXPORT`. Le classeur sépare les devises et inclut les formules de solde net, solde budgétaire et taux d’exécution. Le PDF comprend le périmètre, la date de génération, les synthèses, les tableaux mensuels et une mention de confidentialité. Ces exports restent limités aux agrégats de la synthèse financière ; ils ne constituent pas encore les rapports institutionnels détaillés ni des rapports par projet/domaine.
- Les tests d’intégration PostgreSQL, permissions HTTP complètes pour les rôles authentifiés, pièces jointes, rapports institutionnels et scénarios E2E métier restent à ajouter. `npm run test:e2e` est un smoke test HTTP limité aux pages publiques et aux refus d’accès anonymes ; il n’exige pas de base, mais nécessite un serveur de test déjà démarré.

Tous les formats d’export utilisent le contrôle serveur `FINANCE_EXPORT`, répondent avec `Cache-Control: no-store` et n’incluent que les données agrégées de l’exercice sélectionné. Les exercices et les registres sont limités à 5 000 écritures par registre pour cette synthèse ; au-delà, l’API refuse l’export au lieu de produire un rapport incomplet.

Ne pas utiliser les données de test comme données réelles. Ne pas appliquer de migration à une base de production avant revue SQL, sauvegarde vérifiée, test sur copie et approbation du responsable de base.

## Sauvegarde PostgreSQL et documents privés

Plan initial à faire approuver : sauvegarde PostgreSQL quotidienne, fichiers privés après chaque journée de dépôt (ou snapshot coordonné), rétention indicative 30 jours et copie chiffrée hors du serveur. Le responsable de l’ONG doit fixer la rétention finale et le lieu de stockage. Restreindre l’accès aux sauvegardes au personnel explicitement habilité ; ne jamais les déposer dans `public/` ou dans le dépôt Git.

Dans PowerShell, utiliser une destination protégée, hors du projet, et `pg_dump` installé avec PostgreSQL :

```powershell
$backupDir = "D:\Sauvegardes\ONG-BK"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
pg_dump --host localhost --port 5432 --username ongbk_backup --dbname ongbk --format custom --file "$backupDir\ongbk-$stamp.dump"
```

`pg_dump` demande le mot de passe si aucune méthode d’authentification locale sécurisée n’est configurée. Ne pas passer le secret dans la ligne de commande. Sauvegarder également le dossier désigné par `PRIVATE_UPLOADS_DIR` (ou `private-data\documents` en développement), avec des ACL Windows limitées :

```powershell
$privateUploads = "D:\ONG-BK-Private\documents"
Compress-Archive -Path $privateUploads -DestinationPath "$backupDir\documents-$stamp.zip"
Get-FileHash "$backupDir\ongbk-$stamp.dump" -Algorithm SHA256
Get-FileHash "$backupDir\documents-$stamp.zip" -Algorithm SHA256
```

Une sauvegarde n’est pas validée tant qu’une restauration isolée n’a pas réussi. Créer une base de test vierge, restaurer dedans sans toucher à la base source, puis vérifier migrations, tables, nombre d’enregistrements et lecture de documents :

```powershell
createdb --host localhost --port 5432 --username ongbk_restore ongbk_restore_test
pg_restore --host localhost --port 5432 --username ongbk_restore --dbname ongbk_restore_test --no-owner "$backupDir\ongbk-<horodatage>.dump"
```

Restaurer l’archive de documents vers un répertoire privé de test et configurer l’application de restauration avec une URL de base distincte. Consigner la date, le résultat et l’identité du testeur. Ne pas exécuter de commande `--clean` sur la base source.

## Déploiement recommandé (à confirmer)

Le stockage local `PRIVATE_UPLOADS_DIR` suppose un processus Node.js et un volume privé persistant. Une VM Linux ou un conteneur sur un hôte choisi par l’ONG-BK, avec PostgreSQL séparé (idéalement service managé avec sauvegardes vérifiables), est préférable à un hébergement serverless sans adaptateur de stockage objet persistant. Le choix du fournisseur, du domaine, de la région d’hébergement et de la politique de souveraineté des données reste institutionnel ; aucun n’est présumé disponible.

Procédure de livraison après création de la migration et validation :

1. Préparer un environnement de préproduction distinct, PostgreSQL distinct et répertoire de fichiers privé distinct.
2. Injecter `DATABASE_URL`, `APP_URL`, les variables SMTP, `AUTH_SESSION_HOURS` et `PRIVATE_UPLOADS_DIR` depuis un gestionnaire de secrets du fournisseur. Ne pas utiliser `NEXT_PUBLIC_` pour un secret.
3. Configurer domaine, terminaison HTTPS, en-têtes proxy fiables, supervision, journaux, alertes et stockage de sauvegarde chiffré.
4. Sauvegarder la base et les fichiers avant une mise à jour ; appliquer uniquement `npm run db:deploy`.
5. Déployer le build (`npm run build`), vérifier connexion, récupération par e-mail, permissions des pages/API, accès aux justificatifs et pages publiques.
6. Conserver l’image/application précédente et la sauvegarde associée comme point de retour arrière. Une migration destructive nécessite une stratégie de retour SQL conçue et testée séparément ; ne pas supposer que restaurer le seul code inverse une migration.
7. Faire une restauration de répétition avant la mise en production, puis établir les responsabilités d’astreinte et de révocation des secrets.

Ne pas démarrer la production sans tests sur une copie de la base, migration relue, SMTP opérationnel, stockage privé persistant, HTTPS, restaurations vérifiées et validation des personnes habilitées.
