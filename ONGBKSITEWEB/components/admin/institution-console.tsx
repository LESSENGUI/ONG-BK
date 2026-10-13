"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowDownToLine, Check, FileText, Plus, UsersRound } from "lucide-react";

type Permissions = string[];
type IdentityItem = {
  key: string;
  title: string;
  content: string;
  status: string;
  version: number;
  publishedAt: string | null;
};
type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  locality: string | null;
  category: string;
  status: string;
  joinedAt: string | null;
};
type Mandate = {
  id: string;
  bodyCode: string;
  positionCode: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  biography: string | null;
  photoPath: string | null;
  appointmentDocument: { id: string; title: string } | null;
  position: { title: string };
  member: { id: string; firstName: string; lastName: string };
};
type OfficialDocument = {
  id: string;
  title: string;
  category: string;
  documentDate: string | null;
  version: string;
  status: string;
  confidentiality: string;
  mediaType: string;
};
type Meeting = {
  id: string;
  bodyCode: string;
  title: string;
  scheduledAt: string | null;
  location: string | null;
  agenda: string;
  status: string;
  minutesDocumentId: string | null;
  participants: {
    memberId: string | null;
    attended: boolean | null;
    member: { id: string; firstName: string; lastName: string } | null;
    user: { email: string } | null;
  }[];
  decisions: { id: string; title: string; status: string; dueAt: string | null }[];
};
type MembershipRequest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  motivation: string;
  internalNotes: string | null;
  requestedCategory: string | null;
  status: string;
  createdAt: string;
  decisionAt: string | null;
  decisionBy: { email: string } | null;
  history: {
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
    createdAt: string;
  }[];
};
type PagedItems<T> = { items: T[]; pages: number };

const identityTitles: Record<string, string> = {
  presentation: "Présentation générale",
  vision: "Vision",
  mission: "Mission",
  objectives: "Objectifs",
  domains: "Domaines d’intervention",
  values: "Valeurs",
  motto: "Devise",
  slogan: "Slogan",
  history: "Historique",
  headquarters: "Siège",
  contact: "Coordonnées",
  statutes: "Références statutaires",
};
const bodyLabels: Record<string, string> = {
  EXECUTIVE_BOARD: "Bureau exécutif",
  CONTROL_COMMISSION: "Commission de contrôle et d’évaluation",
};
const categoryLabels: Record<string, string> = {
  FOUNDING: "Fondateur",
  ACTIVE: "Actif",
  HONORARY: "Honneur",
  SUPPORTER: "Sympathisant",
};
const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  PENDING_REVIEW: "À valider",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
  ACTIVE: "Actif",
  PLANNED: "Planifié",
  HELD: "Tenue",
  CANCELLED: "Annulée",
  RECEIVED: "Reçue",
  UNDER_REVIEW: "En examen",
  NEEDS_INFORMATION: "Compléments requis",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
  PENDING: "En attente",
  SUSPENDED: "Suspendu",
};
const positionOptions = [
  ["BE_PRESIDENT", "Président du BE"],
  ["BE_VICE_PRESIDENT", "Vice-président du BE"],
  ["BE_SECRETARY_GENERAL", "Secrétaire général"],
  ["BE_DEPUTY_SECRETARY_GENERAL", "Secrétaire général adjoint"],
  ["BE_TREASURER_GENERAL", "Trésorier général"],
  ["BE_DEPUTY_TREASURER_GENERAL", "Trésorier général adjoint"],
  ["BE_ORGANISATION_COMMUNICATION_SECRETARY", "Secrétaire chargé de l’organisation et de la communication"],
  ["CCE_PRESIDENT", "Président de la CCE"],
  ["CCE_VICE_PRESIDENT", "Vice-président de la CCE"],
  ["CCE_RAPPORTEUR", "Rapporteur de la CCE"],
];

function can(permissions: Permissions, code: string) {
  return permissions.includes(code);
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof result?.error === "string" ? result.error : "Une erreur est survenue.");
  }
  return result as T;
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="scroll-mt-8 rounded-3xl border border-ink/[0.08] bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-ink/60">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink/80">
      {label}
      {children}
    </label>
  );
}

function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-end gap-3 text-sm">
      <button className="rounded-lg border border-ink/15 px-3 py-2 font-semibold disabled:opacity-40" disabled={page <= 1} onClick={() => onChange(page - 1)}>Précédent</button>
      <span>Page {page} sur {pages}</span>
      <button className="rounded-lg border border-ink/15 px-3 py-2 font-semibold disabled:opacity-40" disabled={page >= pages} onClick={() => onChange(page + 1)}>Suivant</button>
    </nav>
  );
}

const inputClass = "min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-forest focus:ring-2 focus:ring-forest/15";
const buttonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0c3329] disabled:cursor-not-allowed disabled:opacity-60";

export function InstitutionConsole({ permissions }: { permissions: Permissions }) {
  const [identity, setIdentity] = useState<IdentityItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [identityKey, setIdentityKey] = useState("presentation");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentStatus, setDocumentStatus] = useState("DRAFT");
  const [meetingBody, setMeetingBody] = useState(
    can(permissions, "BE_MEETINGS_CREATE") ? "EXECUTIVE_BOARD" : "CONTROL_COMMISSION",
  );
  const [governanceBody, setGovernanceBody] = useState(
    can(permissions, "BE_GOVERNANCE_CREATE") ? "EXECUTIVE_BOARD" : "CONTROL_COMMISSION",
  );
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, string>>({});
  const [memberStatusDrafts, setMemberStatusDrafts] = useState<Record<string, string>>({});
  const [memberPage, setMemberPage] = useState(1);
  const [memberPages, setMemberPages] = useState(1);
  const [mandatePage, setMandatePage] = useState(1);
  const [mandatePages, setMandatePages] = useState(1);
  const [documentPage, setDocumentPage] = useState(1);
  const [documentPages, setDocumentPages] = useState(1);
  const [requestPage, setRequestPage] = useState(1);
  const [requestPages, setRequestPages] = useState(1);

  const load = useCallback(async () => {
    const tasks: Promise<void>[] = [];
    if (can(permissions, "IDENTITY_READ")) {
      tasks.push(request<IdentityItem[]>("/api/admin/identity").then(setIdentity));
    }
    if (can(permissions, "MEMBERS_READ")) {
      tasks.push(request<PagedItems<Member>>(`/api/admin/members?page=${memberPage}&pageSize=10&q=${encodeURIComponent(query)}`).then((data) => {
        setMembers(data.items);
        setMemberPages(data.pages);
      }));
    }
    if (can(permissions, "GOVERNANCE_READ")) {
      tasks.push(request<PagedItems<Mandate>>(`/api/admin/governance?page=${mandatePage}&pageSize=10`).then((data) => {
        setMandates(data.items);
        setMandatePages(data.pages);
      }));
    }
    if (can(permissions, "DOCUMENTS_READ")) {
      tasks.push(request<PagedItems<OfficialDocument>>(`/api/admin/documents?page=${documentPage}&pageSize=10&q=${encodeURIComponent(query)}`).then((data) => {
        setDocuments(data.items);
        setDocumentPages(data.pages);
      }));
    }
    if (can(permissions, "MEMBERSHIP_REQUESTS_READ")) {
      tasks.push(request<PagedItems<MembershipRequest>>(`/api/admin/membership-requests?page=${requestPage}&pageSize=10&q=${encodeURIComponent(query)}`).then((data) => {
        setRequests(data.items);
        setRequestPages(data.pages);
      }));
    }
    const bodies: string[] = [];
    if (can(permissions, "BE_MEETINGS_READ")) bodies.push("EXECUTIVE_BOARD");
    if (can(permissions, "CCE_MEETINGS_READ")) bodies.push("CONTROL_COMMISSION");
    for (const body of bodies) {
      tasks.push(request<Meeting[]>(`/api/admin/meetings?body=${body}`).then((items) => setMeetings((current) => [
        ...current.filter((meeting) => meeting.bodyCode !== body),
        ...items,
      ])));
    }
    await Promise.all(tasks);
  }, [documentPage, mandatePage, memberPage, permissions, query, requestPage]);

  useEffect(() => {
    let active = true;
    setError("");
    void load().catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Chargement impossible.");
    });
    return () => { active = false; };
  }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>, action: () => Promise<unknown>, success: string) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(success);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Opération impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function saveIdentity(event: FormEvent<HTMLFormElement>) {
    const form = new FormData(event.currentTarget);
    const submitter = event.nativeEvent instanceof SubmitEvent ? event.nativeEvent.submitter : null;
    const action = submitter instanceof HTMLButtonElement ? submitter.value : "save";
    const payload = {
      key: identityKey,
      title: String(form.get("title") ?? ""),
      content: String(form.get("content") ?? ""),
      action,
    };
    await submit(event, () => request("/api/admin/identity", { method: "PUT", body: JSON.stringify(payload) }), action === "publish" ? "Contenu publié." : "Contenu enregistré.");
  }

  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!documentFile) {
      setError("Sélectionnez un fichier à déposer.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    form.set("file", documentFile);
    form.set("metadata", JSON.stringify({
      title: form.get("title"),
      category: form.get("category"),
      documentDate: form.get("documentDate") || null,
      version: form.get("version"),
      confidentiality: form.get("confidentiality"),
      status: documentStatus,
    }));
    try {
      await request("/api/admin/documents", { method: "POST", body: form });
      setDocumentFile(null);
      setMessage("Document déposé dans le stockage privé.");
      await load();
      formElement.reset();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Dépôt impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function reviewRequest(item: MembershipRequest, status: string) {
    const note = status === "ACCEPTED" || status === "REJECTED" || status === "NEEDS_INFORMATION"
      ? window.prompt("Note de décision (facultative) :") ?? ""
      : "";
    const category = categoryDrafts[`request:${item.id}`] ?? item.requestedCategory ?? "ACTIVE";
    if (status === "ACCEPTED" && !window.confirm(`Confirmer l’acceptation de ${item.firstName} ${item.lastName} comme ${categoryLabels[category]?.toLowerCase() ?? "membre"} ?`)) return;
    if (status === "ARCHIVED" && !window.confirm(`Archiver la demande de ${item.firstName} ${item.lastName} ?`)) return;
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/membership-requests`, {
        method: "PATCH",
        body: JSON.stringify({ id: item.id, decision: { status, category, note } }),
      });
      setMessage("Décision d’adhésion enregistrée et journalisée.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Décision impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function updateMember(member: Member) {
    const category = categoryDrafts[member.id] ?? member.category;
    const status = memberStatusDrafts[member.id] ?? member.status;
    if (category === member.category && status === member.status) return;
    if (!window.confirm(`Confirmer la modification du dossier de ${member.firstName} ${member.lastName} ?`)) return;
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/members/${member.id}`, {
        method: "PUT",
        body: JSON.stringify({
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email ?? "",
          phone: member.phone ?? "",
          locality: member.locality ?? "",
          category,
          status,
          joinedAt: member.joinedAt,
        }),
      });
      setMessage("Dossier membre mis à jour et journalisé.");
      setCategoryDrafts((current) => ({ ...current, [member.id]: category }));
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Modification impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function archiveMember(member: Member) {
    if (!window.confirm(`Archiver le dossier de ${member.firstName} ${member.lastName} ?`)) return;
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/members/${member.id}`, { method: "DELETE" });
      setMessage("Dossier membre archivé.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Archivage impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function changeDocument(item: OfficialDocument, status: string) {
    if (!window.confirm(`Confirmer le changement de statut du document « ${item.title} » ?`)) return;
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/documents/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: item.title,
          category: item.category,
          documentDate: item.documentDate?.slice(0, 10) ?? null,
          version: item.version,
          confidentiality: item.confidentiality,
          status,
        }),
      });
      setMessage("Statut documentaire mis à jour.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Modification impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function changeMandate(mandate: Mandate, status: string) {
    if (!window.confirm(`Confirmer le passage du mandat de ${mandate.member.firstName} ${mandate.member.lastName} au statut « ${status} » ?`)) return;
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/governance/${mandate.id}`, {
        method: "PUT",
        body: JSON.stringify({
          bodyCode: mandate.bodyCode,
          positionCode: mandate.positionCode,
          memberId: mandate.member.id,
          startDate: mandate.startDate?.slice(0, 10) ?? null,
          endDate: mandate.endDate?.slice(0, 10) ?? null,
          status,
          biography: mandate.biography ?? "",
          photoPath: mandate.photoPath ?? "",
          appointmentDocumentId: mandate.appointmentDocument?.id ?? null,
        }),
      });
      setMessage("Statut du mandat mis à jour et journalisé.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Modification impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function changeMeetingStatus(meeting: Meeting, status: string) {
    if (status === "CANCELLED" && !window.confirm(`Annuler la réunion « ${meeting.title} » ?`)) return;
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/meetings/${meeting.id}`, {
        method: "PUT",
        body: JSON.stringify({
          bodyCode: meeting.bodyCode,
          title: meeting.title,
          scheduledAt: meeting.scheduledAt,
          location: meeting.location ?? "",
          agenda: meeting.agenda,
          status,
          minutesDocumentId: meeting.minutesDocumentId,
        }),
      });
      setMessage("Statut de réunion mis à jour et journalisé.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Modification impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function markAttendance(meeting: Meeting, memberId: string, attended: boolean) {
    setBusy(true);
    setError("");
    try {
      await request(`/api/admin/meetings/${meeting.id}/participants`, {
        method: "PATCH",
        body: JSON.stringify({ memberId, attended }),
      });
      setMessage("Présence enregistrée.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Mise à jour impossible.");
    } finally {
      setBusy(false);
    }
  }

  const currentIdentity = identity.find((item) => item.key === identityKey);
  const navLinks = [
    ["identite", "Identité", "IDENTITY_READ"],
    ["gouvernance", "Gouvernance", "GOVERNANCE_READ"],
    ["membres", "Membres", "MEMBERS_READ"],
    ["documents", "Documents", "DOCUMENTS_READ"],
  ].filter(([, , permission]) => can(permissions, permission));
  if (can(permissions, "BE_MEETINGS_READ") || can(permissions, "CCE_MEETINGS_READ")) {
    navLinks.push(["reunions", "Réunions", "BE_MEETINGS_READ"]);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-forest p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f3ce6e]">Administration institutionnelle</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Identité et vie associative</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">
          Gérez les contenus validés, les mandats, les adhésions, les documents privés et les réunions selon vos permissions.
        </p>
      </header>

      <nav aria-label="Modules institutionnels" className="flex gap-2 overflow-x-auto rounded-2xl border border-ink/[0.08] bg-white p-2">
        {navLinks.map(([id, label]) => (
          <a className="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-paper" href={`#${id}`} key={id}>{label}</a>
        ))}
        {can(permissions, "MEMBERSHIP_REQUESTS_READ") && <a className="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-paper" href="#adhesions">Demandes</a>}
      </nav>

      {(message || error) && (
        <div role={error ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"}`}>
          {error || message}
        </div>
      )}

      {can(permissions, "IDENTITY_READ") && (
        <Panel title="Identité et présentation" description="Les contenus inconnus peuvent rester vides. Les versions précédentes sont conservées à chaque modification.">
          {can(permissions, "IDENTITY_UPDATE") || can(permissions, "IDENTITY_CREATE") ? (
            <form className="grid gap-4" onSubmit={saveIdentity}>
              <Field label="Rubrique">
                <select className={inputClass} value={identityKey} onChange={(event) => setIdentityKey(event.target.value)}>
                  {Object.entries(identityTitles).map(([key, title]) => <option key={key} value={key}>{title}</option>)}
                </select>
              </Field>
              <Field label="Titre">
                <input className={inputClass} defaultValue={currentIdentity?.title ?? identityTitles[identityKey]} key={`${identityKey}-${currentIdentity?.version ?? 0}`} maxLength={200} name="title" required />
              </Field>
              <Field label="Contenu">
                <textarea className={`${inputClass} min-h-36`} defaultValue={currentIdentity?.content ?? ""} key={`content-${identityKey}-${currentIdentity?.version ?? 0}`} maxLength={20000} name="content" />
              </Field>
              <p className="text-xs text-ink/55">
                Statut : {statusLabels[currentIdentity?.status ?? "DRAFT"] ?? currentIdentity?.status ?? "Non renseigné"}
                {currentIdentity ? ` · Version ${currentIdentity.version}` : ""}
              </p>
              <div className="flex flex-wrap gap-3">
                <button className={buttonClass} disabled={busy} name="action" value="save">Enregistrer en brouillon</button>
                {can(permissions, "IDENTITY_APPROVE") && <button className={buttonClass} disabled={busy} name="action" value="publish"><Check size={16} /> Publier</button>}
                {can(permissions, "IDENTITY_UPDATE") && <button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-ink/15 px-4 py-2 text-sm font-semibold" disabled={busy} name="action" value="submit">Soumettre pour validation</button>}
              </div>
            </form>
          ) : (
            <ul className="divide-y divide-ink/10">
              {identity.map((item) => <li className="py-3" key={item.key}><strong>{item.title}</strong><p className="mt-1 whitespace-pre-wrap text-sm text-ink/65">{item.content || "Aucun contenu validé."}</p></li>)}
            </ul>
          )}
        </Panel>
      )}

      {can(permissions, "GOVERNANCE_READ") && (
        <Panel title="Bureau exécutif et CCE" description="Les titulaires ne sont créés qu’à partir de dossiers de membres actifs. Chaque mandat demeure dans l’historique.">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold"><UsersRound size={17} /> Composition</label>
            {can(permissions, "GOVERNANCE_EXPORT") && <a className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-ink/15 px-4 text-sm font-semibold" href="/api/admin/governance?format=csv"><ArrowDownToLine size={16} /> Exporter CSV</a>}
          </div>
          {(can(permissions, "BE_GOVERNANCE_CREATE") || can(permissions, "CCE_GOVERNANCE_CREATE")) && (
            <form className="mb-6 grid gap-3 rounded-2xl bg-paper p-4 sm:grid-cols-2" onSubmit={(event) => {
              const form = new FormData(event.currentTarget);
              void submit(event, () => request("/api/admin/governance", { method: "POST", body: JSON.stringify({
                bodyCode: form.get("bodyCode"),
                positionCode: form.get("positionCode"),
                memberId: form.get("memberId"),
                startDate: form.get("startDate") || null,
                endDate: form.get("endDate") || null,
                status: form.get("status"),
                biography: form.get("biography") || "",
                photoPath: form.get("photoPath") || "",
                appointmentDocumentId: form.get("appointmentDocumentId") || null,
              }) }), "Mandat créé.");
            }}>
              <Field label="Organe"><select className={inputClass} name="bodyCode" onChange={(event) => setGovernanceBody(event.target.value)} value={governanceBody}>{can(permissions, "BE_GOVERNANCE_CREATE") && <option value="EXECUTIVE_BOARD">Bureau exécutif</option>}{can(permissions, "CCE_GOVERNANCE_CREATE") && <option value="CONTROL_COMMISSION">CCE</option>}</select></Field>
              <Field label="Membre titulaire"><select className={inputClass} name="memberId" required><option value="">Choisir un membre actif</option>{members.filter((member) => member.status === "ACTIVE").map((member) => <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>)}</select></Field>
              <Field label="Poste"><select className={inputClass} name="positionCode">{positionOptions.filter(([value]) => governanceBody === "EXECUTIVE_BOARD" ? value.startsWith("BE_") : value.startsWith("CCE_")).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
              <Field label="Statut"><select className={inputClass} name="status"><option value="PLANNED">Prévu — en attente de validation</option>{can(permissions, governanceBody === "EXECUTIVE_BOARD" ? "BE_GOVERNANCE_APPROVE" : "CCE_GOVERNANCE_APPROVE") && <option value="ACTIVE">Actif — nomination validée</option>}</select></Field>
              <Field label="Début du mandat"><input className={inputClass} name="startDate" type="date" /></Field>
              <Field label="Fin du mandat"><input className={inputClass} name="endDate" type="date" /></Field>
              <Field label="Présentation facultative"><textarea className={inputClass} name="biography" maxLength={4000} /></Field>
              <Field label="Photo publique (chemin local facultatif)"><input className={inputClass} name="photoPath" placeholder="/images/photo-membre.jpg" /></Field>
              <Field label="Document de nomination"><select className={inputClass} name="appointmentDocumentId"><option value="">Aucun document lié</option>{documents.filter((document) => document.category === "APPOINTMENT").map((document) => <option key={document.id} value={document.id}>{document.title}</option>)}</select></Field>
              <button className={buttonClass} disabled={busy}><Plus size={16} /> Ajouter un mandat</button>
            </form>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs uppercase text-ink/55"><tr><th className="py-3 pr-4">Organe / poste</th><th className="py-3 pr-4">Titulaire</th><th className="py-3 pr-4">Mandat</th><th className="py-3">Période</th></tr></thead>
              <tbody className="divide-y divide-ink/10">{mandates.map((mandate) => {
                const governanceUpdatePermission = mandate.bodyCode === "EXECUTIVE_BOARD" ? "BE_GOVERNANCE_UPDATE" : "CCE_GOVERNANCE_UPDATE";
                const governanceApprovalPermission = mandate.bodyCode === "EXECUTIVE_BOARD" ? "BE_GOVERNANCE_APPROVE" : "CCE_GOVERNANCE_APPROVE";
                return <tr key={mandate.id}><td className="py-3 pr-4"><strong>{bodyLabels[mandate.bodyCode]}</strong><span className="block text-ink/60">{mandate.position.title}</span>{mandate.appointmentDocument && <a className="mt-1 block text-xs font-semibold text-forest underline" href={`/api/documents/${mandate.appointmentDocument.id}`} rel="noreferrer" target="_blank">{mandate.appointmentDocument.title}</a>}</td><td className="py-3 pr-4">{mandate.member.firstName} {mandate.member.lastName}</td><td className="py-3 pr-4">{statusLabels[mandate.status] ?? mandate.status}</td><td className="py-3">{mandate.startDate?.slice(0, 10) ?? "—"} – {mandate.endDate?.slice(0, 10) ?? "—"}</td>{can(permissions, governanceUpdatePermission) && <td className="py-3"><select aria-label={`Statut du mandat ${mandate.position.title}`} className="rounded-lg border border-ink/15 bg-white p-2" disabled={busy} onChange={(event) => void changeMandate(mandate, event.target.value)} value={mandate.status}><option value="PLANNED">Prévu</option><option disabled={!can(permissions, governanceApprovalPermission)} value="ACTIVE">Actif</option><option value="COMPLETED">Terminé</option><option value="REVOKED">Révoqué</option></select></td>}</tr>;
              })}</tbody>
            </table>
            {!mandates.length && <p className="py-5 text-sm text-ink/55">Aucun mandat enregistré. Aucun titulaire n’est pré-rempli.</p>}
          </div>
          <Pagination page={mandatePage} pages={mandatePages} onChange={setMandatePage} />
        </Panel>
      )}

      {can(permissions, "MEMBERS_READ") && (
        <Panel title="Membres" description="L’adhésion institutionnelle reste distincte des comptes de connexion. Les exports respectent les permissions.">
          {can(permissions, "MEMBERS_CREATE") && (
            <form className="mb-5 grid gap-3 rounded-2xl bg-paper p-4 sm:grid-cols-3" onSubmit={(event) => {
              const form = new FormData(event.currentTarget);
              void submit(event, () => request("/api/admin/members", {
                method: "POST",
                body: JSON.stringify({
                  firstName: form.get("firstName"),
                  lastName: form.get("lastName"),
                  email: form.get("email") || "",
                  phone: form.get("phone") || "",
                  locality: form.get("locality") || "",
                  category: form.get("category"),
                  status: "ACTIVE",
                  joinedAt: form.get("joinedAt")
                    ? new Date(String(form.get("joinedAt"))).toISOString()
                    : null,
                }),
              }), "Dossier de membre créé.");
            }}>
              <Field label="Prénom"><input className={inputClass} maxLength={100} name="firstName" required /></Field>
              <Field label="Nom"><input className={inputClass} maxLength={100} name="lastName" required /></Field>
              <Field label="Catégorie"><select className={inputClass} name="category">{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
              <Field label="Courriel (facultatif)"><input className={inputClass} maxLength={254} name="email" type="email" /></Field>
              <Field label="Téléphone (facultatif)"><input className={inputClass} maxLength={40} name="phone" /></Field>
              <Field label="Localité (facultatif)"><input className={inputClass} maxLength={160} name="locality" /></Field>
              <Field label="Date de décision/adhésion validée"><input className={inputClass} name="joinedAt" type="date" /></Field>
              <button className={buttonClass} disabled={busy}><Plus size={16} /> Créer le dossier validé</button>
            </form>
          )}
          <div className="mb-4 flex flex-wrap gap-3">
            <input aria-label="Rechercher un membre" className={`${inputClass} max-w-sm`} onChange={(event) => {
              setQuery(event.target.value);
              setMemberPage(1);
              setRequestPage(1);
              setDocumentPage(1);
            }} placeholder="Rechercher nom ou courriel" value={query} />
            {can(permissions, "MEMBERS_EXPORT") && <a className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-ink/15 px-4 text-sm font-semibold" href={`/api/admin/members?format=csv&q=${encodeURIComponent(query)}`}><ArrowDownToLine size={16} /> Exporter</a>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="text-xs uppercase text-ink/55">
                <tr><th className="py-3 pr-3">Nom</th><th className="py-3 pr-3">Catégorie</th><th className="py-3 pr-3">Courriel</th><th className="py-3 pr-3">Statut</th>{(can(permissions, "MEMBERS_UPDATE") || can(permissions, "MEMBERS_ARCHIVE")) && <th>Actions</th>}</tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="py-3 pr-3">{member.firstName} {member.lastName}</td>
                    <td className="py-3 pr-3">{can(permissions, "MEMBERS_UPDATE") ? (
                      <select aria-label={`Catégorie de ${member.firstName} ${member.lastName}`} className="rounded-lg border border-ink/15 bg-white p-2" onChange={(event) => setCategoryDrafts((current) => ({ ...current, [member.id]: event.target.value }))} value={categoryDrafts[member.id] ?? member.category}>
                        {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    ) : categoryLabels[member.category] ?? member.category}</td>
                    <td className="py-3 pr-3">{member.email ?? "—"}</td>
                    <td className="py-3 pr-3">{can(permissions, "MEMBERS_UPDATE") ? (
                      <select aria-label={`Statut de ${member.firstName} ${member.lastName}`} className="rounded-lg border border-ink/15 bg-white p-2" onChange={(event) => setMemberStatusDrafts((current) => ({ ...current, [member.id]: event.target.value }))} value={memberStatusDrafts[member.id] ?? member.status}>
                        {["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"].map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                      </select>
                    ) : statusLabels[member.status] ?? member.status}</td>
                    {(can(permissions, "MEMBERS_UPDATE") || can(permissions, "MEMBERS_ARCHIVE")) && (
                      <td className="py-3"><div className="flex gap-2">
                        {can(permissions, "MEMBERS_UPDATE") && <button className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-semibold" disabled={busy || ((categoryDrafts[member.id] ?? member.category) === member.category && (memberStatusDrafts[member.id] ?? member.status) === member.status)} onClick={() => void updateMember(member)}>Enregistrer</button>}
                        {can(permissions, "MEMBERS_ARCHIVE") && <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700" disabled={busy} onClick={() => void archiveMember(member)}>Archiver</button>}
                      </div></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {!members.length && <p className="py-5 text-sm text-ink/55">Aucun membre correspondant.</p>}
          </div>
          <Pagination page={memberPage} pages={memberPages} onChange={setMemberPage} />
        </Panel>
      )}

      {can(permissions, "MEMBERSHIP_REQUESTS_READ") && (
        <Panel title="Demandes d’adhésion" description="Les décisions sont historisées. Une acceptation crée un dossier membre, jamais un compte de connexion.">
          {!can(permissions, "MEMBERS_READ") && <input aria-label="Rechercher une demande" className={`${inputClass} mb-4 max-w-sm`} onChange={(event) => {
            setQuery(event.target.value);
            setRequestPage(1);
          }} placeholder="Rechercher nom ou courriel" value={query} />}
          <div className="grid gap-3">{requests.map((item) => <article className="rounded-2xl border border-ink/10 p-4" key={item.id}><div className="flex flex-wrap justify-between gap-2"><strong>{item.firstName} {item.lastName}</strong><span className="text-xs text-ink/55">{statusLabels[item.status] ?? item.status} · {new Date(item.createdAt).toLocaleDateString("fr-FR")}</span></div><p className="mt-1 text-sm text-ink/60">{item.email}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{item.motivation}</p>{item.internalNotes && <p className="mt-3 rounded-xl bg-[#fbf7ec] p-3 text-sm"><strong>Note interne :</strong> {item.internalNotes}</p>}{item.decisionAt && <p className="mt-2 text-xs text-ink/55">Décision du {new Date(item.decisionAt).toLocaleDateString("fr-FR")}{item.decisionBy ? ` · ${item.decisionBy.email}` : ""}</p>}{item.history.length > 0 && <details className="mt-3 text-sm"><summary className="cursor-pointer font-semibold">Historique des décisions ({item.history.length})</summary><ol className="mt-2 grid gap-2 border-l border-ink/15 pl-4">{item.history.map((event, index) => <li key={`${event.createdAt}-${index}`}><span className="font-semibold">{event.fromStatus ? `${statusLabels[event.fromStatus] ?? event.fromStatus} → ` : ""}{statusLabels[event.toStatus] ?? event.toStatus}</span><span className="ml-2 text-xs text-ink/55">{new Date(event.createdAt).toLocaleString("fr-FR")}</span>{event.note && <p className="mt-1 text-ink/65">{event.note}</p>}</li>)}</ol></details>}{can(permissions, "MEMBERSHIP_REQUESTS_DECIDE") && ["RECEIVED","UNDER_REVIEW","NEEDS_INFORMATION"].includes(item.status) && <div className="mt-4 flex flex-wrap items-center gap-2"><label className="text-sm font-semibold">Catégorie après acceptation <select className="ml-2 rounded-lg border border-ink/15 bg-white p-2" onChange={(event) => setCategoryDrafts((current) => ({ ...current, [`request:${item.id}`]: event.target.value }))} value={categoryDrafts[`request:${item.id}`] ?? item.requestedCategory ?? "ACTIVE"}>{Object.entries(categoryLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>{item.status === "RECEIVED" && <button className="rounded-xl border border-ink/15 px-3 py-2 text-sm font-semibold" disabled={busy} onClick={() => void reviewRequest(item, "UNDER_REVIEW")}>Prendre en charge</button>}<button className={buttonClass} disabled={busy} onClick={() => void reviewRequest(item, "ACCEPTED")}>Accepter</button><button className="rounded-xl border border-ink/15 px-3 py-2 text-sm font-semibold" disabled={busy} onClick={() => void reviewRequest(item, "NEEDS_INFORMATION")}>Demander des compléments</button><button className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700" disabled={busy} onClick={() => void reviewRequest(item, "REJECTED")}>Refuser</button></div>}{can(permissions, "MEMBERSHIP_REQUESTS_DECIDE") && item.status !== "ARCHIVED" && <button className="mt-3 rounded-xl border border-ink/15 px-3 py-2 text-xs font-semibold" disabled={busy} onClick={() => void reviewRequest(item, "ARCHIVED")}>Archiver la demande</button>}</article>)}{!requests.length && <p className="py-4 text-sm text-ink/55">Aucune demande d’adhésion reçue.</p>}</div>
          <Pagination page={requestPage} pages={requestPages} onChange={setRequestPage} />
        </Panel>
      )}

      {can(permissions, "DOCUMENTS_READ") && (
        <Panel title="Bibliothèque documentaire" description="Les fichiers sont conservés hors du répertoire public et ne sont servis qu’après vérification de la session, du rôle et de la confidentialité. Formats acceptés : PDF, JPEG et PNG, 10 Mo maximum.">
          <input aria-label="Rechercher un document" className={`${inputClass} mb-4 max-w-sm`} onChange={(event) => {
            setQuery(event.target.value);
            setDocumentPage(1);
            setMemberPage(1);
            setRequestPage(1);
          }} placeholder="Rechercher un titre" value={query} />
          {can(permissions, "DOCUMENTS_EXPORT") && <a className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-ink/15 px-4 text-sm font-semibold" href="/api/admin/documents?format=csv"><ArrowDownToLine size={16} /> Exporter la liste autorisée</a>}
          {can(permissions, "DOCUMENTS_CREATE") && <form className="mb-6 grid gap-3 rounded-2xl bg-paper p-4 sm:grid-cols-2" onSubmit={uploadDocument}>
            <Field label="Titre"><input className={inputClass} maxLength={240} name="title" required /></Field>
            <Field label="Catégorie"><select className={inputClass} name="category">{[["STATUTES","Statuts"],["INTERNAL_REGULATION","Règlement intérieur"],["MINUTES","Procès-verbal"],["DECISION","Décision"],["APPOINTMENT","Nomination"],["ANNUAL_REPORT","Rapport annuel"],["ACTIVITY_REPORT","Rapport d’activité"],["FINANCIAL_REPORT","Rapport financier"],["AGREEMENT","Convention"],["OTHER","Autre"]].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Date du document"><input className={inputClass} name="documentDate" type="date" /></Field>
            <Field label="Version"><input className={inputClass} defaultValue="1" maxLength={40} name="version" required /></Field>
            <Field label="Confidentialité"><select className={inputClass} name="confidentiality"><option value="INTERNAL">Interne</option><option value="EXECUTIVE_BOARD">Bureau exécutif</option><option value="CONTROL_COMMISSION">CCE</option><option value="STRICTLY_CONFIDENTIAL">Strictement confidentiel</option>{can(permissions, "DOCUMENTS_APPROVE") && <option value="PUBLIC">Public</option>}</select></Field>
            <Field label="Fichier PDF/JPEG/PNG"><input accept="application/pdf,image/jpeg,image/png" className={inputClass} onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} required type="file" /></Field>
            <Field label="Statut initial"><select className={inputClass} onChange={(event) => setDocumentStatus(event.target.value)} value={documentStatus}><option value="DRAFT">Brouillon</option><option value="PENDING_REVIEW">À valider</option></select></Field>
            <button className={buttonClass} disabled={busy}><Plus size={16} /> Déposer le document</button>
          </form>}
          <div className="grid gap-3">{documents.map((document) => <article className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 p-4" key={document.id}><div className="flex min-w-0 items-center gap-3"><FileText className="shrink-0 text-forest" size={20} /><div className="min-w-0"><strong className="block truncate">{document.title}</strong><span className="text-xs text-ink/55">{document.category} · v{document.version} · {document.confidentiality} · {statusLabels[document.status] ?? document.status}</span></div></div><div className="flex gap-2"><a className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-semibold" href={`/api/documents/${document.id}`} rel="noreferrer" target="_blank">Consulter</a>{document.status !== "PUBLISHED" && can(permissions, "DOCUMENTS_APPROVE") && <button className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-semibold" disabled={busy} onClick={() => void changeDocument(document, "PUBLISHED")}>Publier</button>}{document.status !== "ARCHIVED" && can(permissions, "DOCUMENTS_ARCHIVE") && <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700" disabled={busy} onClick={() => void changeDocument(document, "ARCHIVED")}>Archiver</button>}</div></article>)}{!documents.length && <p className="py-4 text-sm text-ink/55">Aucun document autorisé n’est enregistré.</p>}</div>
          <Pagination page={documentPage} pages={documentPages} onChange={setDocumentPage} />
        </Panel>
      )}

      {can(permissions, "BE_MEETINGS_READ") || can(permissions, "CCE_MEETINGS_READ") ? (
        <Panel title="Réunions et décisions" description="Les réunions et leurs décisions restent séparées par organe. Les procès-verbaux peuvent être liés à la bibliothèque documentaire confidentielle.">
          {(can(permissions, "BE_MEETINGS_CREATE") || can(permissions, "CCE_MEETINGS_CREATE")) && <form className="mb-6 grid gap-3 rounded-2xl bg-paper p-4 sm:grid-cols-2" onSubmit={(event) => {
            const form = new FormData(event.currentTarget);
            void submit(event, () => request("/api/admin/meetings", { method: "POST", body: JSON.stringify({
              bodyCode: form.get("bodyCode"),
              title: form.get("title"),
              scheduledAt: form.get("scheduledAt") ? new Date(String(form.get("scheduledAt"))).toISOString() : null,
              location: form.get("location"),
              agenda: form.get("agenda"),
              status: form.get("status"),
              participantMemberIds: form.getAll("participantMemberIds"),
              minutesDocumentId: form.get("minutesDocumentId") || null,
            }) }), "Réunion créée.");
          }}>
            <Field label="Organe"><select className={inputClass} name="bodyCode" onChange={(event) => setMeetingBody(event.target.value)} value={meetingBody}>{can(permissions, "BE_MEETINGS_CREATE") && <option value="EXECUTIVE_BOARD">Bureau exécutif</option>}{can(permissions, "CCE_MEETINGS_CREATE") && <option value="CONTROL_COMMISSION">CCE</option>}</select></Field>
            <Field label="Titre"><input className={inputClass} maxLength={220} name="title" required /></Field>
            <Field label="Date et heure"><input className={inputClass} name="scheduledAt" type="datetime-local" /></Field>
            <Field label="Lieu"><input className={inputClass} maxLength={240} name="location" /></Field>
            <Field label="Ordre du jour"><textarea className={inputClass} maxLength={20000} name="agenda" /></Field>
            <Field label="Participants membres (facultatif)"><select className={`${inputClass} min-h-28`} multiple name="participantMemberIds">{members.filter((member) => member.status === "ACTIVE").map((member) => <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>)}</select></Field>
            <Field label="Procès-verbal existant (facultatif)"><select className={inputClass} name="minutesDocumentId"><option value="">Aucun</option>{documents.filter((document) => document.category === "MINUTES").map((document) => <option key={document.id} value={document.id}>{document.title} · {document.confidentiality}</option>)}</select></Field>
            <button className={buttonClass} disabled={busy}><Plus size={16} /> Créer la réunion</button>
          </form>}
          <div className="grid gap-3">{[...meetings].sort((a,b) => (b.scheduledAt ?? "").localeCompare(a.scheduledAt ?? "")).map((meeting) => <article className="rounded-2xl border border-ink/10 p-4" key={meeting.id}><div className="flex flex-wrap justify-between gap-2"><strong>{meeting.title}</strong><span className="text-xs text-ink/55">{bodyLabels[meeting.bodyCode]} · {statusLabels[meeting.status] ?? meeting.status}</span></div><p className="mt-1 text-sm text-ink/60">{meeting.scheduledAt ? new Date(meeting.scheduledAt).toLocaleString("fr-FR") : "Date non renseignée"}{meeting.location ? ` · ${meeting.location}` : ""}</p>{meeting.agenda && <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{meeting.agenda}</p>}{meeting.minutesDocumentId && <a className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-forest underline" href={`/api/documents/${meeting.minutesDocumentId}`} target="_blank" rel="noreferrer"><FileText size={15} /> Consulter le procès-verbal</a>}{can(permissions, meeting.bodyCode === "EXECUTIVE_BOARD" ? "BE_MEETINGS_UPDATE" : "CCE_MEETINGS_UPDATE") && <div className="mt-3"><label className="text-sm font-semibold">Statut de la réunion <select aria-label={`Statut de la réunion ${meeting.title}`} className="ml-2 rounded-lg border border-ink/15 bg-white p-2" disabled={busy} onChange={(event) => void changeMeetingStatus(meeting, event.target.value)} value={meeting.status}><option value="PLANNED">Planifiée</option><option value="HELD">Tenue</option><option value="CANCELLED">Annulée</option></select></label></div>}{meeting.participants.length > 0 && <div className="mt-4"><h3 className="text-sm font-bold">Participants et présences</h3><ul className="mt-2 grid gap-2 sm:grid-cols-2">{meeting.participants.map((participant, index) => <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2 text-sm" key={participant.memberId ?? index}><span>{participant.member ? `${participant.member.firstName} ${participant.member.lastName}` : participant.user?.email ?? "Participant"}</span>{participant.memberId && can(permissions, meeting.bodyCode === "EXECUTIVE_BOARD" ? "BE_MEETINGS_UPDATE" : "CCE_MEETINGS_UPDATE") && <span className="flex gap-1"><button aria-label={`Marquer présent : ${participant.member?.firstName ?? ""}`} className="rounded-md border px-2 py-1 text-xs" disabled={busy} onClick={() => void markAttendance(meeting, participant.memberId!, true)}>Présent</button><button aria-label={`Marquer absent : ${participant.member?.firstName ?? ""}`} className="rounded-md border px-2 py-1 text-xs" disabled={busy} onClick={() => void markAttendance(meeting, participant.memberId!, false)}>Absent</button></span>}{participant.attended !== null && <span className="text-xs text-ink/55">{participant.attended ? "Présent" : "Absent"}</span>}</li>)}</ul></div>}{can(permissions, meeting.bodyCode === "EXECUTIVE_BOARD" ? "BE_MEETINGS_UPDATE" : "CCE_MEETINGS_UPDATE") && <form className="mt-4 grid gap-3 rounded-xl bg-paper p-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={(event) => { const form = new FormData(event.currentTarget); void submit(event, () => request(`/api/admin/meetings/${meeting.id}/decisions`, { method: "POST", body: JSON.stringify({ title: form.get("title"), description: form.get("description"), status: form.get("status"), dueAt: form.get("dueAt") ? new Date(String(form.get("dueAt"))).toISOString() : null }) }), "Décision ajoutée à la réunion."); }}><Field label="Décision / action"><input className={inputClass} maxLength={220} name="title" required /></Field><Field label="Description"><input className={inputClass} maxLength={10000} name="description" required /></Field><Field label="Échéance"><input className={inputClass} name="dueAt" type="datetime-local" /></Field><Field label="État"><select className={inputClass} name="status"><option value="PROPOSED">Proposée</option><option value="APPROVED">Approuvée</option><option value="DEFERRED">Reportée</option><option value="REJECTED">Rejetée</option></select></Field><button className={buttonClass} disabled={busy}>Ajouter la décision</button></form>}</article>)}{!meetings.length && <p className="py-4 text-sm text-ink/55">Aucune réunion enregistrée pour les organes accessibles.</p>}</div>
        </Panel>
      ) : null}

      <div aria-live="polite" className="sr-only">{busy ? "Opération en cours" : ""}</div>
    </div>
  );
}
