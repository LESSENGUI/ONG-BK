"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { roleLabels, selfServiceAssignableRoles } from "@/lib/rbac";

type User = {
  id: string;
  email: string;
  roleCode: keyof typeof roleLabels;
  isActive: boolean;
  profile: { firstName: string; lastName: string; phone: string | null } | null;
};

type Task = {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
  dueAt: string | null;
  assignee: { id: string; email: string; profile: { firstName: string; lastName: string } | null };
  createdBy: { email: string };
};

const operationalRoles = selfServiceAssignableRoles.map((code) => [code, roleLabels[code]] as const);

const statusLabels: Record<Task["status"], string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  BLOCKED: "Bloquée",
  DONE: "Terminée",
};

export function UserTaskManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [usersResponse, tasksResponse] = await Promise.all([
      fetch("/api/admin/users", { cache: "no-store" }),
      fetch("/api/admin/tasks", { cache: "no-store" }),
    ]);
    if (!usersResponse.ok || !tasksResponse.ok) throw new Error("Impossible de charger les comptes et les tâches.");
    setUsers((await usersResponse.json()) as User[]);
    setTasks((await tasksResponse.json()) as Task[]);
  }, []);

  useEffect(() => {
    void load().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Erreur de chargement."));
  }, [load]);

  async function submit(
    event: FormEvent<HTMLFormElement>,
    endpoint: string,
    successMessage: string,
  ) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    if (typeof payload.dueAt === "string" && payload.dueAt) {
      payload.dueAt = new Date(payload.dueAt).toISOString();
    } else {
      delete payload.dueAt;
    }
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "La demande a échoué.");
      formElement.reset();
      await load();
      setNotice(successMessage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  async function updateTask(taskId: string, status: Task["status"]) {
    setError("");
    const response = await fetch(`/api/admin/tasks/${encodeURIComponent(taskId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      setError("Impossible de modifier le statut de la tâche.");
      return;
    }
    await load();
  }

  async function updateUser(user: User, roleCode: User["roleCode"], isActive: boolean) {
    setError("");
    const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleCode, isActive }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(result.error ?? "Impossible de modifier ce compte.");
      return;
    }
    setNotice("Compte mis à jour. Ses sessions précédentes ont été révoquées.");
    await load();
  }

  const fieldClass = "mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink";
  const labelClass = "block text-sm font-semibold text-ink";

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl font-bold text-ink">Créer un compte</h2>
        <p className="mt-2 text-sm leading-6 text-ink/60">
          Le nouveau titulaire définira lui-même son mot de passe avec la procédure de réinitialisation par e-mail.
        </p>
        <form className="mt-6 grid gap-4" onSubmit={(event) => void submit(event, "/api/admin/users", "Compte créé. Le titulaire doit utiliser « Mot de passe oublié ».")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>Prénom<input className={fieldClass} name="firstName" required maxLength={100} /></label>
            <label className={labelClass}>Nom<input className={fieldClass} name="lastName" required maxLength={100} /></label>
          </div>
          <label className={labelClass}>E-mail<input className={fieldClass} name="email" type="email" required maxLength={254} /></label>
          <label className={labelClass}>Téléphone (facultatif)<input className={fieldClass} name="phone" maxLength={40} /></label>
          <label className={labelClass}>
            Rôle
            <select className={fieldClass} name="roleCode" required defaultValue="">
              <option disabled value="">Sélectionner un rôle</option>
              {operationalRoles.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
          </label>
          <button className="mt-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white disabled:opacity-50" disabled={busy}>
            Créer le compte
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl font-bold text-ink">Attribuer une tâche</h2>
        <form className="mt-6 grid gap-4" onSubmit={(event) => void submit(event, "/api/admin/tasks", "Tâche attribuée.")}>
          <label className={labelClass}>Intitulé<input className={fieldClass} name="title" required minLength={3} maxLength={200} /></label>
          <label className={labelClass}>Description<textarea className={fieldClass} name="description" rows={3} maxLength={4000} /></label>
          <label className={labelClass}>
            Destinataire
            <select className={fieldClass} name="assigneeId" required defaultValue="">
              <option disabled value="">Sélectionner un compte actif</option>
              {users.filter((user) => user.isActive).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email} — {roleLabels[user.roleCode]}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>Échéance (facultatif)<input className={fieldClass} name="dueAt" type="datetime-local" /></label>
          <button className="mt-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white disabled:opacity-50" disabled={busy || users.length === 0}>
            Attribuer
          </button>
        </form>
      </section>

      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-800 xl:col-span-2" role="alert">{error}</p>}
      {notice && <p className="rounded-xl bg-green-50 p-4 text-sm text-green-900 xl:col-span-2" role="status">{notice}</p>}

      <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8 xl:col-span-2">
        <h2 className="font-display text-2xl font-bold text-ink">Comptes opérationnels</h2>
        <div className="mt-5 grid gap-3">
          {users.filter((user) => user.roleCode !== "SYSTEM_ADMIN").map((user) => (
            <article className="grid gap-3 rounded-2xl border border-ink/10 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center" key={user.id}>
              <div>
                <p className="font-semibold text-ink">{user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}</p>
                <p className="mt-1 text-sm text-ink/60">{user.email}</p>
              </div>
              <label className="text-sm font-semibold text-ink">
                Rôle
                <select className="mt-1 block w-full rounded-lg border border-ink/15 bg-white px-3 py-2" defaultValue={user.roleCode} onChange={(event) => void updateUser(user, event.target.value as User["roleCode"], user.isActive)}>
                  {operationalRoles.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                </select>
              </label>
              <button className="rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold" onClick={() => void updateUser(user, user.roleCode, !user.isActive)}>
                {user.isActive ? "Désactiver" : "Réactiver"}
              </button>
            </article>
          ))}
          {users.length === 0 && <p className="text-sm text-ink/60">Aucun compte enregistré.</p>}
        </div>
      </section>

      <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8 xl:col-span-2">
        <h2 className="font-display text-2xl font-bold text-ink">Tâches attribuées</h2>
        <div className="mt-5 grid gap-3">
          {tasks.length === 0 && <p className="text-sm text-ink/60">Aucune tâche enregistrée.</p>}
          {tasks.map((task) => (
            <article className="flex flex-col gap-3 rounded-2xl border border-ink/10 p-4 sm:flex-row sm:items-center sm:justify-between" key={task.id}>
              <div>
                <h3 className="font-semibold text-ink">{task.title}</h3>
                <p className="mt-1 text-sm text-ink/60">
                  {task.assignee.profile ? `${task.assignee.profile.firstName} ${task.assignee.profile.lastName}` : task.assignee.email}
                  {task.dueAt ? ` · échéance ${new Date(task.dueAt).toLocaleDateString("fr-FR")}` : ""}
                </p>
                {task.description && <p className="mt-2 text-sm text-ink/75">{task.description}</p>}
              </div>
              <label className="text-sm font-semibold text-ink">
                Statut
                <select className="mt-1 block rounded-lg border border-ink/15 bg-white px-3 py-2" value={task.status} onChange={(event) => void updateTask(task.id, event.target.value as Task["status"])}>
                  {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
