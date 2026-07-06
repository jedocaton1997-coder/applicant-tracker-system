import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

type Status =
  | "New Applicant"
  | "Contacted"
  | "Follow-Up"
  | "Scheduled"
  | "Confirmed"
  | "Passed"
  | "Failed"
  | "Cancelled"
  | "No Show";

type InterviewType = "Online" | "Face-to-Face";

type MessageType =
  | "First Message"
  | "Follow-Up Message"
  | "Interview Confirmation"
  | "Interview Reminder"
  | "2-Hour Interview Reminder"
  | "Rejection Message"
  | "Congratulations Message"
  | "Reschedule Message";

type Applicant = {
  id: string;
  name: string;
  email: string;
  source: string;
  calendlyLink: string;
  address: string;
  phone: string;
  location: string;
  jobPost: string;
  interviewType: InterviewType;
  interviewLocation: string;
  interviewDateTime: string;
  status: Status;
  notes: string;
  createdAt: string;
  statusUpdatedAt: string;
};

const statuses: Status[] = ["New Applicant", "Contacted", "Follow-Up", "Scheduled", "Confirmed", "Passed", "Failed", "Cancelled", "No Show"];

const messageTypes: MessageType[] = [
  "First Message",
  "Follow-Up Message",
  "Interview Confirmation",
  "Interview Reminder",
  "2-Hour Interview Reminder",
  "Rejection Message",
  "Congratulations Message",
  "Reschedule Message",
];

const iconLabels = {
  add: "+",
  applicant: "A",
  check: "Ok",
  clock: "Time",
  copy: "Copy",
  filter: "Filter",
  import: "CSV",
  mail: "Mail",
  message: "Msg",
  search: "Find",
  send: "SMS",
  trash: "Del",
  close: "X",
} as const;

const senderName = "Jedo";
const companyName = "System Oriented LLC";
const defaultApplicationSource = "Indeed";
const defaultCalendlyUrl = "https://calendly.com/steve-systemoriented/seasonal-delivery-driver";
const defaultInterviewLocation = "Panera Bread\n10914 Baltimore Ave, Beltsville, MD 20705, United States";
const contactedFollowUpHours = 24;

function Icon({ name }: { name: keyof typeof iconLabels }) {
  return (
    <span className="mini-icon" aria-hidden="true">
      {iconLabels[name]}
    </span>
  );
}

const defaultApplicant: Applicant = {
  id: "new",
  name: "",
  email: "",
  source: "Manual",
  calendlyLink: defaultCalendlyUrl,
  address: "",
  phone: "",
  location: "",
  jobPost: "",
  interviewType: "Online",
  interviewLocation: "",
  interviewDateTime: "",
  status: "New Applicant",
  notes: "",
  createdAt: new Date().toISOString(),
  statusUpdatedAt: new Date().toISOString(),
};

const starterApplicants: Applicant[] = [
  {
    id: crypto.randomUUID(),
    name: "Alyssa Rivera",
    email: "alyssa.rivera@example.com",
    source: "Manual",
    calendlyLink: defaultCalendlyUrl,
    address: "118 Cedar Place, Newark, NJ 07102",
    phone: "(201) 555-0188",
    location: "Newark, NJ",
    jobPost: "Dispatch Coordinator",
    interviewType: "Online",
    interviewLocation: "",
    interviewDateTime: nextSlot(1, 10),
    status: "Scheduled",
    notes: "Strong phone screen. Asked about weekend availability.",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Marcus Chen",
    email: "marcus.chen@example.com",
    source: "Manual",
    calendlyLink: defaultCalendlyUrl,
    address: "45 Pine Street, Queens, NY 11375",
    phone: "(718) 555-0142",
    location: "Queens, NY",
    jobPost: "Warehouse Associate",
    interviewType: "Face-to-Face",
    interviewLocation: "225 Industrial Ave, Secaucus, NJ",
    interviewDateTime: nextSlot(2, 14),
    status: "Follow-Up",
    notes: "No response after first message. Follow up tomorrow morning.",
    createdAt: new Date().toISOString(),
  },
];

function nextSlot(daysFromNow: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return toInputDateTime(date);
}

function toInputDateTime(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatDateTime(value: string) {
  if (!value) return "No interview scheduled";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatTime(value: string) {
  if (!value) return "the scheduled time";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatReminderLocation(applicant: Applicant) {
  if (applicant.interviewType !== "Face-to-Face") return "for your virtual interview";
  const location = applicant.interviewLocation || defaultInterviewLocation;
  const [venue, address = ""] = location.split("\n");
  const cityState = address.match(/,\s*([^,]+,\s*[A-Z]{2})\s+\d{5}/)?.[1];
  return cityState ? `at ${venue} in ${cityState}` : `at ${location.replace(/\n/g, ", ")}`;
}

function formatReminderLocationSentence(applicant: Applicant) {
  if (applicant.interviewType !== "Face-to-Face") return "The interview will be held online.";
  const location = (applicant.interviewLocation || defaultInterviewLocation).replace(/\n/g, ", ");
  return `The interview location is ${location}.`;
}

function isTomorrowInterview(value: string) {
  if (!value) return false;
  const interviewDate = new Date(value);
  if (Number.isNaN(interviewDate.getTime())) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  return interviewDate >= tomorrow && interviewDate < dayAfterTomorrow;
}

function hoursSince(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  return (Date.now() - date.getTime()) / 36e5;
}

function shouldAutoMoveToFollowUp(applicant: Applicant) {
  if (applicant.status === "Contacted") {
    return hoursSince(applicant.statusUpdatedAt || applicant.createdAt) >= contactedFollowUpHours;
  }

  if (applicant.status === "Scheduled" && applicant.interviewDateTime) {
    const interviewDate = new Date(applicant.interviewDateTime);
    return !Number.isNaN(interviewDate.getTime()) && interviewDate.getTime() < Date.now();
  }

  return false;
}

function normalizeApplicant(applicant: Partial<Applicant>): Applicant {
  return {
    ...defaultApplicant,
    ...applicant,
    id: applicant.id || crypto.randomUUID(),
    createdAt: applicant.createdAt || new Date().toISOString(),
    statusUpdatedAt: applicant.statusUpdatedAt || applicant.createdAt || new Date().toISOString(),
    email: applicant.email || "",
    source: applicant.source || "Manual",
    calendlyLink: applicant.calendlyLink || defaultCalendlyUrl,
  };
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function cleanPhone(value: string) {
  return value.trim().replace(/^'+/, "");
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function mapIndeedStatus(value: string): Status {
  const status = value.trim().toLowerCase();
  if (status.includes("cancel")) return "Cancelled";
  if (status.includes("reject")) return "Failed";
  if (status.includes("no show")) return "No Show";
  if (status.includes("confirm")) return "Confirmed";
  if (status.includes("scheduled") || status.includes("interview")) return "Scheduled";
  if (status.includes("follow")) return "Follow-Up";
  if (status.includes("pass")) return "Passed";
  if (status.includes("fail")) return "Failed";
  return "Contacted";
}

function getCsvValue(row: Record<string, string>, ...keys: string[]) {
  for (const key of keys) {
    const value = row[normalizeHeader(key)];
    if (value?.trim()) return value.trim();
  }
  return "";
}

function mapIndeedRows(text: string) {
  const rows = parseCsv(text);
  const [headerRow, ...dataRows] = rows;
  if (!headerRow?.length) return [];

  const headers = headerRow.map(normalizeHeader);
  return dataRows.map((cells) => {
    const row = headers.reduce(
      (record, header, index) => {
        record[header] = cells[index] ?? "";
        return record;
      },
      {} as Record<string, string>,
    );
    const source = getCsvValue(row, "source") || defaultApplicationSource;
    const indeedStatus = getCsvValue(row, "status");
    const relevantExperience = getCsvValue(row, "relevant experience");
    const education = getCsvValue(row, "education");
    const jobLocation = getCsvValue(row, "job location");
    const appliedDate = getCsvValue(row, "date");
    const interestLevel = getCsvValue(row, "interest level");
    const notes = [
      `${source} Status: ${indeedStatus || "Not provided"}`,
      relevantExperience ? `Relevant Experience: ${relevantExperience}` : "",
      education ? `Education: ${education}` : "",
      jobLocation ? `Job Location: ${jobLocation}` : "",
      appliedDate ? `Applied Date: ${appliedDate}` : "",
      interestLevel ? `Interest Level: ${interestLevel}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return normalizeApplicant({
      id: crypto.randomUUID(),
      name: getCsvValue(row, "name"),
      email: getCsvValue(row, "email"),
      phone: cleanPhone(getCsvValue(row, "phone")),
      source,
      calendlyLink: getCsvValue(row, "calendly", "calendly link", "calendly url") || defaultCalendlyUrl,
      location: getCsvValue(row, "candidate location", "location"),
      jobPost: getCsvValue(row, "job title", "job post applied for"),
      status: "New Applicant",
      interviewType: "Face-to-Face",
      interviewLocation: "",
      interviewDateTime: "",
      notes,
      createdAt: appliedDate ? new Date(`${appliedDate}T12:00:00`).toISOString() : new Date().toISOString(),
    });
  });
}

function loadSavedApplicants() {
  try {
    const saved = localStorage.getItem("ats-applicants");
    if (!saved) return starterApplicants.map(normalizeApplicant);
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return starterApplicants.map(normalizeApplicant);
    return parsed.map(normalizeApplicant);
  } catch {
    return starterApplicants.map(normalizeApplicant);
  }
}

function suggestedMessageType(status: Status): MessageType {
  const map: Record<Status, MessageType> = {
    "New Applicant": "First Message",
    Contacted: "First Message",
    "Follow-Up": "Follow-Up Message",
    Scheduled: "Interview Confirmation",
    Confirmed: "Interview Confirmation",
    Passed: "Congratulations Message",
    Failed: "Rejection Message",
    Cancelled: "Reschedule Message",
    "No Show": "Reschedule Message",
  };
  return map[status];
}

function buildMessage(applicant: Applicant, type: MessageType) {
  const name = applicant.name || "there";
  const job = applicant.jobPost || "the position";
  const schedule = formatDateTime(applicant.interviewDateTime);
  const interviewTime = formatTime(applicant.interviewDateTime);
  const place = applicant.interviewLocation || "the interview location";
  const interviewStyle = applicant.interviewType === "Face-to-Face" ? "in-person" : "virtual";
  const locationBlock = applicant.interviewType === "Face-to-Face" ? `\n\nInterview Location:\n${place}` : "";
  const currentLocationLine = applicant.interviewType === "Face-to-Face" ? `\nInterview Location: ${place}` : "";
  const reminderLocation = formatReminderLocation(applicant);
  const reminderLocationSentence = formatReminderLocationSentence(applicant);
  const calendlyLink = applicant.calendlyLink || defaultCalendlyUrl;
  const signature = `Thank you,\n${senderName}\n${companyName}`;

  const templates: Record<MessageType, string> = {
    "First Message": `Hi ${name},

This is ${senderName} from ${companyName}. Thank you for applying to our ${job} position on ${applicant.source || defaultApplicationSource}.

We would like to invite you for a 30-minute in-person interview. Please use the Calendly link below to choose a date and time that works best for you:

${calendlyLink}

Interview Location:
${applicant.interviewType === "Face-to-Face" ? applicant.interviewLocation || defaultInterviewLocation : defaultInterviewLocation}

Please arrive on time for your scheduled interview.

Thank you, and we look forward to meeting you.`,
    "Follow-Up Message": `Dear ${name},

I am following up regarding your application for the ${job} position.

We remain interested in speaking with you and would appreciate the opportunity to discuss your qualifications and availability. Please reply at your earliest convenience so we may proceed with the next step in the hiring process.

${signature}`,
    "Interview Confirmation": `Dear ${name},

This message is to confirm your interview for the ${job} position.

Interview Date and Time:
${schedule}

Interview Type:
${applicant.interviewType}${locationBlock}

Please be prepared and available at the scheduled time. If any changes are needed, please let us know as soon as possible.

${signature}`,
    "Interview Reminder": `Hello ${name},

This is a reminder that you have a scheduled interview tomorrow at ${interviewTime} for the ${job} position.

${reminderLocationSentence}

Kindly confirm today or tomorrow by 10:00 AM if you are able to attend. If we do not receive your confirmation, your appointment may be canceled and rescheduled.

Thank you.`,
    "2-Hour Interview Reminder": `Hello ${name},

I hope you are doing well.

Kindly confirm by 10:00 AM if you will be able to attend your appointment today at ${interviewTime} ${reminderLocation}.

If we do not receive your confirmation by 10:00 AM, we will cancel your appointment and ask you to reschedule.

Thank you, and we look forward to hearing from you.`,
    "Rejection Message": `Dear ${name},

Thank you for your time and interest in the ${job} position.

After careful review, we will not be moving forward with your application at this time. We appreciate the opportunity to consider you and wish you success in your job search.

${signature}`,
    "Congratulations Message": `Dear ${name},

Congratulations. We are pleased to inform you that you have been selected to move forward for the ${job} position.

Our team will contact you with the next steps and any additional information needed. Thank you for your time and interest in joining ${companyName}.

${signature}`,
    "Reschedule Message": `Dear ${name},

We need to reschedule your interview for the ${job} position.

Please reply with your next available date and time so we can confirm a new appointment.

Current Interview Details:
${schedule}${currentLocationLine}

${signature}`,
  };

  return templates[type];
}

export default function App() {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [applicants, setApplicants] = useState<Applicant[]>(loadSavedApplicants);
  const [selectedId, setSelectedId] = useState(applicants[0]?.id ?? "new");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [messageType, setMessageType] = useState<MessageType>("First Message");
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [importSummary, setImportSummary] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [preferredMessageType, setPreferredMessageType] = useState<MessageType | null>(null);

  useEffect(() => {
    localStorage.setItem("ats-applicants", JSON.stringify(applicants));
  }, [applicants]);

  useEffect(() => {
    const moveStaleApplicants = () => {
      setApplicants((current) => {
        let changed = false;
        const next = current.map((applicant) => {
          if (!shouldAutoMoveToFollowUp(applicant)) return applicant;
          changed = true;
          const automaticNote =
            applicant.status === "Contacted"
              ? `Automatically moved to Follow-Up after ${contactedFollowUpHours} hours with no status change.`
              : "Automatically moved to Follow-Up because the scheduled interview time has passed.";
          return {
            ...applicant,
            status: "Follow-Up" as Status,
            statusUpdatedAt: new Date().toISOString(),
            notes: applicant.notes.includes(automaticNote) ? applicant.notes : [applicant.notes, automaticNote].filter(Boolean).join("\n"),
          };
        });
        return changed ? next : current;
      });
    };

    moveStaleApplicants();
    const interval = window.setInterval(moveStaleApplicants, 15 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const selected = applicants.find((applicant) => applicant.id === selectedId) ?? defaultApplicant;

  useEffect(() => {
    setMessageType(preferredMessageType ?? suggestedMessageType(selected.status));
    setPreferredMessageType(null);
  }, [selected.id, selected.status]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const search = `${applicant.name} ${applicant.email} ${applicant.source} ${applicant.jobPost} ${applicant.location} ${applicant.phone}`.toLowerCase();
      const matchesSearch = search.includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || applicant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applicants, query, statusFilter]);

  const kanbanStatuses = statusFilter === "All" ? statuses : [statusFilter];
  const groupedApplicants = useMemo(() => {
    return statuses.reduce(
      (groups, status) => {
        groups[status] = filteredApplicants.filter((applicant) => applicant.status === status);
        return groups;
      },
      {} as Record<Status, Applicant[]>,
    );
  }, [filteredApplicants]);

  const metrics = useMemo(() => {
    const tomorrowInterviews = applicants.filter(
      (applicant) => isTomorrowInterview(applicant.interviewDateTime) && !["Failed", "Cancelled", "No Show"].includes(applicant.status),
    ).length;
    return {
      total: applicants.length,
      scheduled: applicants.filter((a) => ["Scheduled", "Confirmed"].includes(a.status)).length,
      needsFollowUp: applicants.filter((a) => ["Follow-Up", "No Show"].includes(a.status)).length,
      tomorrowInterviews,
    };
  }, [applicants]);

  const tomorrowInterviews = useMemo(() => {
    return applicants
      .filter(
        (applicant) =>
          isTomorrowInterview(applicant.interviewDateTime) && !["Failed", "Cancelled", "No Show"].includes(applicant.status),
      )
      .sort((a, b) => new Date(a.interviewDateTime).getTime() - new Date(b.interviewDateTime).getTime());
  }, [applicants]);

  const message = buildMessage(selected, messageType);

  function openApplicantDetails(id: string, type?: MessageType) {
    if (type) {
      setPreferredMessageType(type);
      setMessageType(type);
    }
    setSelectedId(id);
    setDetailsOpen(true);
  }

  function saveApplicant(next: Applicant) {
    const savedId = next.id === "new" ? crypto.randomUUID() : next.id;
    setApplicants((current) => {
      const existing = current.find((item) => item.id === savedId);
      const timestamp = new Date().toISOString();
      const applicant =
        next.id === "new"
          ? { ...next, id: savedId, createdAt: timestamp, statusUpdatedAt: timestamp }
          : { ...next, statusUpdatedAt: existing && existing.status !== next.status ? timestamp : next.statusUpdatedAt || existing?.statusUpdatedAt || timestamp };
      return existing ? current.map((item) => (item.id === applicant.id ? applicant : item)) : [applicant, ...current];
    });
    setSelectedId(savedId);
  }

  function updateSelected(patch: Partial<Applicant>) {
    saveApplicant({ ...selected, ...patch });
  }

  function createApplicant() {
    const timestamp = new Date().toISOString();
    const applicant = { ...defaultApplicant, id: crypto.randomUUID(), createdAt: timestamp, statusUpdatedAt: timestamp };
    setApplicants((current) => [applicant, ...current]);
    openApplicantDetails(applicant.id);
  }

  function deleteApplicant(id: string) {
    setApplicants((current) => current.filter((applicant) => applicant.id !== id));
    if (selectedId === id) setSelectedId(applicants.find((applicant) => applicant.id !== id)?.id ?? "new");
    setDetailsOpen(false);
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(message);
    setCopyLabel("Copied");
    window.setTimeout(() => setCopyLabel("Copy"), 1200);
  }

  async function importCandidates(file: File | undefined) {
    if (!file) return;

    const text = await file.text();
    const imported = mapIndeedRows(text).filter((applicant) => applicant.name || applicant.email || applicant.phone);
    let added = 0;
    let skipped = 0;
    let firstAddedId = "";

    setApplicants((current) => {
      const existingKeys = new Set(
        current.flatMap((applicant) => [applicant.email.toLowerCase(), normalizePhone(applicant.phone)].filter(Boolean)),
      );
      const next = [...current];

      for (const applicant of imported) {
        const keys = [applicant.email.toLowerCase(), normalizePhone(applicant.phone)].filter(Boolean);
        if (keys.some((key) => existingKeys.has(key))) {
          skipped += 1;
          continue;
        }

        next.unshift(applicant);
        keys.forEach((key) => existingKeys.add(key));
        added += 1;
        if (!firstAddedId) firstAddedId = applicant.id;
      }

      return next;
    });

    if (firstAddedId) setSelectedId(firstAddedId);
    if (firstAddedId) setDetailsOpen(true);
    setImportSummary(`Imported ${added} candidate${added === 1 ? "" : "s"}${skipped ? `, skipped ${skipped} duplicate${skipped === 1 ? "" : "s"}` : ""}.`);
    if (importInputRef.current) importInputRef.current.value = "";
  }

  return (
    <main className="ats-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Applicant Tracker System</span>
          <h1>Hiring pipeline and interview command center</h1>
        </div>
        <div className="topbar-actions">
          <input
            ref={importInputRef}
            className="hidden-input"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              importCandidates(event.target.files?.[0]);
            }}
          />
          <button className="secondary-action" onClick={() => importInputRef.current?.click()}>
            <Icon name="import" />
            Import Candidates
          </button>
          <button className="primary-action" onClick={createApplicant}>
            <Icon name="add" />
            New Applicant
          </button>
        </div>
      </header>

      {importSummary && <p className="import-summary">{importSummary}</p>}

      <section className="metrics" aria-label="Pipeline metrics">
        <Metric label="Total Applicants" value={metrics.total} icon={<Icon name="applicant" />} />
        <Metric label="Scheduled Interviews" value={metrics.scheduled} icon={<Icon name="clock" />} />
        <Metric label="Tomorrow Reminders" value={metrics.tomorrowInterviews} icon={<Icon name="clock" />} />
        <Metric label="Needs Follow-Up" value={metrics.needsFollowUp} icon={<Icon name="message" />} />
      </section>

      <section className="workspace kanban-workspace">
        <section className="panel kanban-panel">
          <section className="reminder-panel" aria-label="Tomorrow interview reminders">
            <div>
              <span className="eyebrow">Interview Reminders</span>
              <h2>Scheduled for tomorrow</h2>
            </div>
            {tomorrowInterviews.length > 0 ? (
              <div className="reminder-list">
                {tomorrowInterviews.map((applicant) => (
                  <article className="reminder-item" key={applicant.id}>
                    <button className="reminder-main" onClick={() => openApplicantDetails(applicant.id, "Interview Reminder")}>
                      <strong>{applicant.name || "Unnamed applicant"}</strong>
                      <span>{applicant.jobPost || "No job post entered"}</span>
                      <small>{formatDateTime(applicant.interviewDateTime)}</small>
                    </button>
                    <button className="secondary-action" onClick={() => openApplicantDetails(applicant.id, "Interview Reminder")}>
                      <Icon name="message" />
                      Open Reminder
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <p className="reminder-empty">No applicant interviews scheduled for tomorrow.</p>
            )}
          </section>

          <div className="list-tools">
            <label className="search-field">
              <Icon name="search" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applicants" />
            </label>
            <label className="select-field compact">
              <Icon name="filter" />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as Status | "All")}>
                <option>All</option>
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="kanban-board" aria-label="Applicant status board">
            {kanbanStatuses.map((status) => (
              <section className="kanban-column" key={status}>
                <header>
                  <span className={`status-dot status-${status.toLowerCase().replaceAll(" ", "-")}`} />
                  <strong>{status}</strong>
                  <em>{groupedApplicants[status]?.length ?? 0}</em>
                </header>
                <div className="kanban-cards">
                  {(groupedApplicants[status] ?? []).map((applicant) => (
                    <article className={applicant.id === selected.id ? "kanban-card active" : "kanban-card"} key={applicant.id}>
                      <button
                        className="kanban-card-main"
                        onClick={() => {
                          openApplicantDetails(applicant.id);
                        }}
                      >
                        <strong>{applicant.name || "Unnamed applicant"}</strong>
                        <span>{applicant.jobPost || "No job post entered"}</span>
                        <small>{formatDateTime(applicant.interviewDateTime)}</small>
                      </button>
                      <label className="kanban-status-select">
                        <span>Status</span>
                        <select
                          value={applicant.status}
                          onChange={(event) => {
                            setSelectedId(applicant.id);
                            saveApplicant({ ...applicant, status: event.target.value as Status });
                          }}
                        >
                          {statuses.map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                    </article>
                  ))}
                  {(groupedApplicants[status] ?? []).length === 0 && <p className="kanban-empty">No applicants</p>}
                </div>
              </section>
            ))}
          </div>
          {filteredApplicants.length === 0 && <p className="empty-state">No applicants match the current filters.</p>}
        </section>

      </section>

      {detailsOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Applicant details">
          <section className="modal-panel editor-panel">
            <div className="panel-heading modal-heading">
              <div>
                <span className="eyebrow">Applicant Details</span>
                <h2>{selected.name || "New applicant"}</h2>
              </div>
              <div className="modal-actions">
                {selected.id !== "new" && (
                  <button className="icon-button danger" onClick={() => deleteApplicant(selected.id)} aria-label="Delete applicant">
                    <Icon name="trash" />
                  </button>
                )}
                <button className="icon-button" onClick={() => setDetailsOpen(false)} aria-label="Close applicant details">
                  <Icon name="close" />
                </button>
              </div>
            </div>

            <div className="form-grid">
              <TextField label="Applicant Name" value={selected.name} onChange={(name) => updateSelected({ name })} />
              <TextField label="Email Address" value={selected.email} onChange={(email) => updateSelected({ email })} />
              <TextField label="Phone Number" value={selected.phone} onChange={(phone) => updateSelected({ phone })} />
              <TextField label="Applicant Source" value={selected.source} onChange={(source) => updateSelected({ source })} />
              <TextField label="Calendly Link" value={selected.calendlyLink} onChange={(calendlyLink) => updateSelected({ calendlyLink })} wide />
              <TextField label="Address" value={selected.address} onChange={(address) => updateSelected({ address })} wide />
              <TextField label="Location" value={selected.location} onChange={(location) => updateSelected({ location })} />
              <TextField label="Job Post Applied For" value={selected.jobPost} onChange={(jobPost) => updateSelected({ jobPost })} />
              <label>
                <span>Interview Type</span>
                <select value={selected.interviewType} onChange={(event) => updateSelected({ interviewType: event.target.value as InterviewType })}>
                  <option>Online</option>
                  <option>Face-to-Face</option>
                </select>
              </label>
              {selected.interviewType === "Face-to-Face" ? (
                <TextField label="Interview Location" value={selected.interviewLocation} onChange={(interviewLocation) => updateSelected({ interviewLocation })} />
              ) : (
                <div className="field-note">
                  <span>Virtual Interview</span>
                  <p>No interview link is required here. Add meeting details later if needed.</p>
                </div>
              )}
              <label>
                <span>Interview Date and Time</span>
                <input
                  type="datetime-local"
                  value={selected.interviewDateTime}
                  onChange={(event) => updateSelected({ interviewDateTime: event.target.value, status: event.target.value ? "Scheduled" : selected.status })}
                />
              </label>
              <label>
                <span>Status</span>
                <select value={selected.status} onChange={(event) => updateSelected({ status: event.target.value as Status })}>
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className="wide">
                <span>Notes</span>
                <textarea value={selected.notes} onChange={(event) => updateSelected({ notes: event.target.value })} rows={4} />
              </label>
            </div>

            <div className="embedded-message">
              <div>
                <span className="eyebrow">Message Generator</span>
                <h3>Status-ready message</h3>
              </div>
              <label>
                <span>Message Type</span>
                <select value={messageType} onChange={(event) => setMessageType(event.target.value as MessageType)}>
                  {messageTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <textarea className="message-box" value={message} readOnly rows={8} />
              <div className="button-row">
                <button onClick={copyMessage}>
                  <Icon name="copy" />
                  {copyLabel}
                </button>
                <a href={`sms:${selected.phone.replace(/[^\d+]/g, "")}?&body=${encodeURIComponent(message)}`}>
                  <Icon name="send" />
                  SMS
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(`Application update for ${selected.jobPost}`)}&body=${encodeURIComponent(message)}`}>
                  <Icon name="mail" />
                  Email
                </a>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function Metric({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <article className="metric-card">
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </article>
  );
}

function TextField({
  label,
  value,
  onChange,
  wide,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "wide" : ""}>
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
