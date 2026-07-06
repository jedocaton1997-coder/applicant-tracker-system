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

type ActiveTab = "Dashboard" | "Applicant Tracker" | "Timesheet" | "Daily Report";

type TimesheetEntry = {
  id: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  breakMinutes: number;
  hourlyRate: number;
  attendanceStatus: "Present" | "Absent" | "Late" | "Incomplete";
  notes: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
};

type DailyTaskStatus = "Not started" | "In progress" | "Completed" | "Skipped" | "Needs follow-up";

type DailyTask = {
  id: string;
  name: string;
  status: DailyTaskStatus;
  notes: string;
  recurring: boolean;
};

type DailyReport = {
  id: string;
  reportDate: string;
  preparedBy: string;
  status: "Draft" | "Generated" | "Sent";
  summary: string;
  applicantUpdates: string;
  timesheetUpdates: string;
  taskUpdates: string;
  financeUpdates: string;
  reminderUpdates: string;
  appointmentUpdates: string;
  routeDataConfirmation: string;
  auditReportStatus: string;
  fleetScreenshotStatus: string;
  issues: string;
  pendingItems: string;
  recommendations: string;
  nextSteps: string;
  finalNotes: string;
  tasks: DailyTask[];
};

const statuses: Status[] = ["New Applicant", "Contacted", "Follow-Up", "Scheduled", "Confirmed", "Passed", "Failed", "Cancelled", "No Show"];
const tabs: ActiveTab[] = ["Dashboard", "Applicant Tracker", "Timesheet", "Daily Report"];
const dailyTaskStatuses: DailyTaskStatus[] = ["Not started", "In progress", "Completed", "Skipped", "Needs follow-up"];

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
const defaultHourlyRate = 6;

const recurringDailyTaskNames = [
  "DAILY - SEND REPORT TO STEVE FINANCE REMINDER OR APPOINTMENT",
  "DAILY - SCHEDULE 5AM MESSAGE BELTSVILLE HUB AND IKEA STORE",
  "DAILY - SCHEDULE 10AM MESSAGE BELTSVILLE HUB TEAM",
  "DAILY - SCHEDULE MESSAGE TO IKEA STORE TEAM",
  "DAILY - CONFIRM CURRENT-DAY ROUTE DATA",
  "DAILY - SEND AUDIT REPORT AFTER ENTERING DATA INTO THE TRACKER",
  "DAILY - SEND SCREENSHOT FROM FLEET PROFITABILITY AUDIT",
];

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

const defaultPayPeriod = {
  start: "2026-06-22",
  end: "2026-07-03",
  payDate: "2026-07-06",
};

const starterTimesheets: TimesheetEntry[] = [
  {
    id: crypto.randomUUID(),
    employeeName: "Jedo Caton",
    date: "2026-07-01",
    clockIn: "08:00",
    clockOut: "16:30",
    breakMinutes: 30,
    hourlyRate: defaultHourlyRate,
    attendanceStatus: "Present",
    notes: "Completed route data and applicant updates.",
    payPeriodStart: defaultPayPeriod.start,
    payPeriodEnd: defaultPayPeriod.end,
    payDate: defaultPayPeriod.payDate,
  },
  {
    id: crypto.randomUUID(),
    employeeName: "Steve Team",
    date: "2026-07-02",
    clockIn: "09:00",
    clockOut: "15:00",
    breakMinutes: 0,
    hourlyRate: defaultHourlyRate,
    attendanceStatus: "Present",
    notes: "Finance reminders and audit follow-up.",
    payPeriodStart: defaultPayPeriod.start,
    payPeriodEnd: defaultPayPeriod.end,
    payDate: defaultPayPeriod.payDate,
  },
];

function nextSlot(daysFromNow: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return toInputDateTime(date);
}

function toInputDate(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function toInputDateTime(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function dayName(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(new Date(`${value}T12:00:00`));
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

function isTodayInterview(value: string) {
  if (!value) return false;
  const interviewDate = new Date(value);
  if (Number.isNaN(interviewDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return interviewDate >= today && interviewDate < tomorrow;
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

function loadSavedTimesheets() {
  try {
    const saved = localStorage.getItem("ops-timesheets");
    if (!saved) return starterTimesheets;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : starterTimesheets;
  } catch {
    return starterTimesheets;
  }
}

function createDailyReport(date = toInputDate(new Date())): DailyReport {
  return {
    id: date,
    reportDate: date,
    preparedBy: "Jedo",
    status: "Draft",
    summary: "",
    applicantUpdates: "",
    timesheetUpdates: "",
    taskUpdates: "",
    financeUpdates: "",
    reminderUpdates: "",
    appointmentUpdates: "",
    routeDataConfirmation: "",
    auditReportStatus: "",
    fleetScreenshotStatus: "",
    issues: "",
    pendingItems: "",
    recommendations: "",
    nextSteps: "",
    finalNotes: "",
    tasks: recurringDailyTaskNames.map((name) => ({
      id: crypto.randomUUID(),
      name,
      status: "Not started",
      notes: "",
      recurring: true,
    })),
  };
}

function loadSavedDailyReports() {
  const today = toInputDate(new Date());
  try {
    const saved = localStorage.getItem("ops-daily-reports");
    if (!saved) return [createDailyReport(today)];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [createDailyReport(today)];
    return parsed.some((report) => report.reportDate === today) ? parsed : [createDailyReport(today), ...parsed];
  } catch {
    return [createDailyReport(today)];
  }
}

function calculateHours(entry: TimesheetEntry) {
  if (!entry.clockIn || !entry.clockOut) return 0;
  const start = new Date(`${entry.date}T${entry.clockIn}`);
  const end = new Date(`${entry.date}T${entry.clockOut}`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return 0;
  return Math.max(0, (end.getTime() - start.getTime()) / 36e5 - entry.breakMinutes / 60);
}

function calculateOvertime(hours: number) {
  return Math.max(0, hours - 8);
}

function currency(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
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
  const [activeTab, setActiveTab] = useState<ActiveTab>("Dashboard");
  const [applicants, setApplicants] = useState<Applicant[]>(loadSavedApplicants);
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>(loadSavedTimesheets);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>(loadSavedDailyReports);
  const [selectedId, setSelectedId] = useState(applicants[0]?.id ?? "new");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [viewMode, setViewMode] = useState<"Kanban" | "List">("Kanban");
  const [timesheetSearch, setTimesheetSearch] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("First Message");
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [importSummary, setImportSummary] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [preferredMessageType, setPreferredMessageType] = useState<MessageType | null>(null);

  useEffect(() => {
    localStorage.setItem("ats-applicants", JSON.stringify(applicants));
  }, [applicants]);

  useEffect(() => {
    localStorage.setItem("ops-timesheets", JSON.stringify(timesheets));
  }, [timesheets]);

  useEffect(() => {
    localStorage.setItem("ops-daily-reports", JSON.stringify(dailyReports));
  }, [dailyReports]);

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
    const activeInterviewStatuses: Status[] = ["Scheduled", "Confirmed"];
    const todayInterviews = applicants.filter(
      (applicant) => isTodayInterview(applicant.interviewDateTime) && activeInterviewStatuses.includes(applicant.status),
    ).length;
    const tomorrowInterviews = applicants.filter(
      (applicant) => isTomorrowInterview(applicant.interviewDateTime) && activeInterviewStatuses.includes(applicant.status),
    ).length;
    return {
      total: applicants.length,
      scheduled: applicants.filter((a) => ["Scheduled", "Confirmed"].includes(a.status)).length,
      needsFollowUp: applicants.filter((a) => ["Follow-Up", "No Show"].includes(a.status)).length,
      todayInterviews,
      tomorrowInterviews,
    };
  }, [applicants]);

  const message = buildMessage(selected, messageType);
  const currentReport = dailyReports.find((report) => report.reportDate === toInputDate(new Date())) ?? dailyReports[0] ?? createDailyReport();
  const filteredTimesheets = useMemo(() => {
    return timesheets.filter((entry) => entry.employeeName.toLowerCase().includes(timesheetSearch.toLowerCase()));
  }, [timesheets, timesheetSearch]);
  const timesheetTotals = useMemo(() => {
    const totalHours = timesheets.reduce((sum, entry) => sum + calculateHours(entry), 0);
    const overtimeHours = timesheets.reduce((sum, entry) => sum + calculateOvertime(calculateHours(entry)), 0);
    const totalPayroll = timesheets.reduce((sum, entry) => sum + calculateHours(entry) * entry.hourlyRate, 0);
    return {
      totalHours,
      overtimeHours,
      regularHours: Math.max(0, totalHours - overtimeHours),
      totalPayroll,
      employees: new Set(timesheets.map((entry) => entry.employeeName)).size,
      missingEntries: timesheets.filter((entry) => !entry.clockIn || !entry.clockOut || entry.attendanceStatus === "Incomplete").length,
    };
  }, [timesheets]);
  const dailyMetrics = useMemo(() => {
    const tasks = currentReport.tasks;
    return {
      total: tasks.length,
      completed: tasks.filter((task) => task.status === "Completed").length,
      pending: tasks.filter((task) => !["Completed", "Skipped"].includes(task.status)).length,
      skipped: tasks.filter((task) => task.status === "Skipped").length,
      followUp: tasks.filter((task) => task.status === "Needs follow-up").length,
      issues: currentReport.issues ? 1 : 0,
      sentThisWeek: dailyReports.filter((report) => report.status === "Sent").length,
    };
  }, [currentReport, dailyReports]);

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

  function addTimesheetEntry() {
    const today = toInputDate(new Date());
    setTimesheets((current) => [
      {
        id: crypto.randomUUID(),
        employeeName: "New Employee",
        date: today,
        clockIn: "08:00",
        clockOut: "16:00",
        breakMinutes: 30,
        hourlyRate: defaultHourlyRate,
        attendanceStatus: "Present",
        notes: "",
        payPeriodStart: defaultPayPeriod.start,
        payPeriodEnd: defaultPayPeriod.end,
        payDate: defaultPayPeriod.payDate,
      },
      ...current,
    ]);
  }

  function updateTimesheetEntry(id: string, patch: Partial<TimesheetEntry>) {
    setTimesheets((current) => current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  }

  function deleteTimesheetEntry(id: string) {
    setTimesheets((current) => current.filter((entry) => entry.id !== id));
  }

  function exportTimesheetsCsv() {
    const header = ["Employee", "Date", "Day", "Clock In", "Clock Out", "Break Minutes", "Hours", "Rate", "Estimated Pay", "Status", "Notes"];
    const rows = timesheets.map((entry) => [
      entry.employeeName,
      entry.date,
      dayName(entry.date),
      entry.clockIn,
      entry.clockOut,
      String(entry.breakMinutes),
      calculateHours(entry).toFixed(2),
      String(entry.hourlyRate),
      (calculateHours(entry) * entry.hourlyRate).toFixed(2),
      entry.attendanceStatus,
      entry.notes,
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "timesheets.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function updateCurrentReport(patch: Partial<DailyReport>) {
    setDailyReports((current) => current.map((report) => (report.id === currentReport.id ? { ...report, ...patch } : report)));
  }

  function updateDailyTask(id: string, patch: Partial<DailyTask>) {
    setDailyReports((current) =>
      current.map((report) =>
        report.id === currentReport.id
          ? { ...report, tasks: report.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)) }
          : report,
      ),
    );
  }

  function addDailyTask() {
    setDailyReports((current) =>
      current.map((report) =>
        report.id === currentReport.id
          ? {
              ...report,
              tasks: [...report.tasks, { id: crypto.randomUUID(), name: "New daily report task", status: "Not started", notes: "", recurring: false }],
            }
          : report,
      ),
    );
  }

  function generateEodReport() {
    updateCurrentReport({ status: "Generated", summary: currentReport.summary || "Daily report generated from current operations dashboard data." });
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

      <nav className="main-tabs" aria-label="Main operations pages">
        {tabs.map((tab) => (
          <button className={activeTab === tab ? "active" : ""} key={tab} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </nav>

      {importSummary && <p className="import-summary">{importSummary}</p>}

      {activeTab === "Dashboard" && (
        <>
          <section className="metrics dashboard-metrics" aria-label="Operations dashboard metrics">
            <Metric label="Total Applicants" value={metrics.total} icon={<Icon name="applicant" />} />
            <Metric label="Confirmed Interviews" value={applicants.filter((a) => a.status === "Confirmed").length} icon={<Icon name="check" />} />
            <Metric label="Pending Confirmations" value={applicants.filter((a) => a.status === "Scheduled").length} icon={<Icon name="clock" />} />
            <Metric label="Canceled Interviews" value={applicants.filter((a) => a.status === "Cancelled").length} icon={<Icon name="close" />} />
            <Metric label="Timesheet Hours" value={Number(timesheetTotals.totalHours.toFixed(1))} icon={<Icon name="clock" />} />
            <Metric label="Estimated Payroll" value={currency(timesheetTotals.totalPayroll)} icon={<Icon name="check" />} />
            <Metric label="Daily Report Status" value={currentReport.status === "Sent" ? 100 : currentReport.status === "Generated" ? 75 : 25} icon={<Icon name="message" />} />
            <Metric label="Pending EOD Items" value={dailyMetrics.pending} icon={<Icon name="clock" />} />
          </section>

          <section className="dashboard-grid">
            <DashboardPanel title="Applicant status breakdown">
              {statuses.map((status) => (
                <ChartBar key={status} label={status} value={applicants.filter((applicant) => applicant.status === status).length} max={Math.max(1, applicants.length)} />
              ))}
            </DashboardPanel>
            <DashboardPanel title="Timesheet hours by employee">
              {Array.from(new Set(timesheets.map((entry) => entry.employeeName))).map((employee) => {
                const hours = timesheets.filter((entry) => entry.employeeName === employee).reduce((sum, entry) => sum + calculateHours(entry), 0);
                return <ChartBar key={employee} label={employee} value={Number(hours.toFixed(1))} max={Math.max(1, timesheetTotals.totalHours)} />;
              })}
            </DashboardPanel>
            <DashboardPanel title="Daily report completion">
              <ChartBar label="Completed daily tasks" value={dailyMetrics.completed} max={Math.max(1, dailyMetrics.total)} />
              <ChartBar label="Pending daily tasks" value={dailyMetrics.pending} max={Math.max(1, dailyMetrics.total)} />
              <ChartBar label="Issues or reminders" value={dailyMetrics.issues + dailyMetrics.followUp} max={Math.max(1, dailyMetrics.total)} />
            </DashboardPanel>
          </section>

          <section className="quick-links panel">
            <span className="eyebrow">Quick Links</span>
            <div className="button-row">
              {tabs.filter((tab) => tab !== "Dashboard").map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}>
                  {tab}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === "Applicant Tracker" && (
        <>
      <section className="metrics" aria-label="Pipeline metrics">
        <Metric label="Total Applicants" value={metrics.total} icon={<Icon name="applicant" />} />
        <Metric label="Scheduled Interviews" value={metrics.scheduled} icon={<Icon name="clock" />} />
        <Metric label="Tomorrow Reminders" value={metrics.tomorrowInterviews} icon={<Icon name="clock" />} />
        <Metric label="Today Schedule" value={metrics.todayInterviews} icon={<Icon name="clock" />} />
        <Metric label="Needs Follow-Up" value={metrics.needsFollowUp} icon={<Icon name="message" />} />
      </section>

      <section className="workspace kanban-workspace">
        <section className="panel kanban-panel">
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
            <div className="view-toggle" aria-label="Applicant view">
              {(["Kanban", "List"] as const).map((mode) => (
                <button className={viewMode === mode ? "active" : ""} key={mode} onClick={() => setViewMode(mode)}>
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {viewMode === "Kanban" ? (
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
          ) : (
            <div className="applicant-table-wrap">
              <table className="applicant-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Job Post</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Interview</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((applicant) => (
                    <tr className={applicant.id === selected.id ? "active" : ""} key={applicant.id}>
                      <td>
                        <button className="table-name" onClick={() => openApplicantDetails(applicant.id)}>
                          <strong>{applicant.name || "Unnamed applicant"}</strong>
                          <span>{applicant.email || "No email"}</span>
                        </button>
                      </td>
                      <td>{applicant.jobPost || "No job post entered"}</td>
                      <td>{applicant.phone || "No phone"}</td>
                      <td>
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
                      </td>
                      <td>
                        <span>{formatDateTime(applicant.interviewDateTime)}</span>
                        <small>{applicant.interviewType}</small>
                      </td>
                      <td>{applicant.notes || "No notes"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filteredApplicants.length === 0 && <p className="empty-state">No applicants match the current filters.</p>}
        </section>

      </section>
        </>
      )}

      {activeTab === "Timesheet" && (
        <section className="page-stack">
          <section className="metrics" aria-label="Timesheet metrics">
            <Metric label="Current Pay Period" value={`${defaultPayPeriod.start} to ${defaultPayPeriod.end}`} icon={<Icon name="clock" />} />
            <Metric label="Pay Date" value={defaultPayPeriod.payDate} icon={<Icon name="check" />} />
            <Metric label="Total Employees" value={timesheetTotals.employees} icon={<Icon name="applicant" />} />
            <Metric label="Total Hours" value={Number(timesheetTotals.totalHours.toFixed(1))} icon={<Icon name="clock" />} />
            <Metric label="Regular Hours" value={Number(timesheetTotals.regularHours.toFixed(1))} icon={<Icon name="clock" />} />
            <Metric label="Overtime Hours" value={Number(timesheetTotals.overtimeHours.toFixed(1))} icon={<Icon name="clock" />} />
            <Metric label="Estimated Payroll" value={currency(timesheetTotals.totalPayroll)} icon={<Icon name="check" />} />
            <Metric label="Missing Entries" value={timesheetTotals.missingEntries} icon={<Icon name="close" />} />
          </section>

          <section className="panel">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Timesheet</span>
                <h2>Pay period {defaultPayPeriod.start} to {defaultPayPeriod.end}</h2>
              </div>
              <div className="button-row">
                <button onClick={addTimesheetEntry}><Icon name="add" />Add Entry</button>
                <button onClick={exportTimesheetsCsv}><Icon name="copy" />Export CSV</button>
              </div>
            </div>
            <div className="list-tools one-field">
              <label className="search-field">
                <Icon name="search" />
                <input value={timesheetSearch} onChange={(event) => setTimesheetSearch(event.target.value)} placeholder="Search employee name" />
              </label>
            </div>
            <div className="applicant-table-wrap">
              <table className="applicant-table">
                <thead>
                  <tr>
                    <th>Employee</th><th>Date</th><th>Day</th><th>Clock In</th><th>Clock Out</th><th>Break</th><th>Hours</th><th>Rate</th><th>Pay</th><th>Status</th><th>Notes</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimesheets.map((entry) => {
                    const hours = calculateHours(entry);
                    return (
                      <tr key={entry.id}>
                        <td><input value={entry.employeeName} onChange={(event) => updateTimesheetEntry(entry.id, { employeeName: event.target.value })} /></td>
                        <td><input type="date" value={entry.date} onChange={(event) => updateTimesheetEntry(entry.id, { date: event.target.value })} /></td>
                        <td>{dayName(entry.date)}</td>
                        <td><input type="time" value={entry.clockIn} onChange={(event) => updateTimesheetEntry(entry.id, { clockIn: event.target.value })} /></td>
                        <td><input type="time" value={entry.clockOut} onChange={(event) => updateTimesheetEntry(entry.id, { clockOut: event.target.value })} /></td>
                        <td><input type="number" value={entry.breakMinutes} onChange={(event) => updateTimesheetEntry(entry.id, { breakMinutes: Number(event.target.value) })} /></td>
                        <td>{hours.toFixed(2)}</td>
                        <td><input type="number" value={entry.hourlyRate} onChange={(event) => updateTimesheetEntry(entry.id, { hourlyRate: Number(event.target.value) })} /></td>
                        <td>{currency(hours * entry.hourlyRate)}</td>
                        <td>
                          <select value={entry.attendanceStatus} onChange={(event) => updateTimesheetEntry(entry.id, { attendanceStatus: event.target.value as TimesheetEntry["attendanceStatus"] })}>
                            <option>Present</option><option>Absent</option><option>Late</option><option>Incomplete</option>
                          </select>
                        </td>
                        <td><input value={entry.notes} onChange={(event) => updateTimesheetEntry(entry.id, { notes: event.target.value })} /></td>
                        <td><button className="icon-button danger" onClick={() => deleteTimesheetEntry(entry.id)}><Icon name="trash" /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="dashboard-grid">
            <DashboardPanel title="Hours worked by date">
              {Array.from(new Set(timesheets.map((entry) => entry.date))).map((date) => (
                <ChartBar key={date} label={date} value={Number(timesheets.filter((entry) => entry.date === date).reduce((sum, entry) => sum + calculateHours(entry), 0).toFixed(1))} max={Math.max(1, timesheetTotals.totalHours)} />
              ))}
            </DashboardPanel>
            <DashboardPanel title="Estimated payroll by employee">
              {Array.from(new Set(timesheets.map((entry) => entry.employeeName))).map((employee) => {
                const pay = timesheets.filter((entry) => entry.employeeName === employee).reduce((sum, entry) => sum + calculateHours(entry) * entry.hourlyRate, 0);
                return <ChartBar key={employee} label={employee} value={Math.round(pay)} max={Math.max(1, timesheetTotals.totalPayroll)} />;
              })}
            </DashboardPanel>
          </section>
        </section>
      )}

      {activeTab === "Daily Report" && (
        <section className="page-stack">
          <section className="metrics" aria-label="Daily report metrics">
            <Metric label="Report Status" value={currentReport.status === "Sent" ? 100 : currentReport.status === "Generated" ? 75 : 25} icon={<Icon name="message" />} />
            <Metric label="Total Daily Tasks" value={dailyMetrics.total} icon={<Icon name="message" />} />
            <Metric label="Completed" value={dailyMetrics.completed} icon={<Icon name="check" />} />
            <Metric label="Pending" value={dailyMetrics.pending} icon={<Icon name="clock" />} />
            <Metric label="Skipped" value={dailyMetrics.skipped} icon={<Icon name="close" />} />
            <Metric label="Follow-Up Items" value={dailyMetrics.followUp} icon={<Icon name="message" />} />
            <Metric label="Issues Reported" value={dailyMetrics.issues} icon={<Icon name="close" />} />
            <Metric label="Reports Sent" value={dailyMetrics.sentThisWeek} icon={<Icon name="send" />} />
          </section>
          <section className="panel">
            <div className="section-heading">
              <div><span className="eyebrow">Daily Report</span><h2>{currentReport.reportDate} · {dayName(currentReport.reportDate)}</h2></div>
              <div className="button-row">
                <button onClick={addDailyTask}><Icon name="add" />Add Task</button>
                <button onClick={generateEodReport}><Icon name="check" />Generate EOD Report</button>
                <button onClick={() => updateCurrentReport({ status: "Sent" })}><Icon name="send" />Send to Steve</button>
              </div>
            </div>
            <div className="daily-layout">
              <div className="form-grid">
                <TextField label="Prepared By" value={currentReport.preparedBy} onChange={(preparedBy) => updateCurrentReport({ preparedBy })} />
                <label><span>Status</span><select value={currentReport.status} onChange={(event) => updateCurrentReport({ status: event.target.value as DailyReport["status"] })}><option>Draft</option><option>Generated</option><option>Sent</option></select></label>
                <TextAreaField label="Summary of Work Completed" value={currentReport.summary} onChange={(summary) => updateCurrentReport({ summary })} />
                <TextAreaField label="Applicant Tracker Updates" value={currentReport.applicantUpdates} onChange={(applicantUpdates) => updateCurrentReport({ applicantUpdates })} />
                <TextAreaField label="Timesheet Updates" value={currentReport.timesheetUpdates} onChange={(timesheetUpdates) => updateCurrentReport({ timesheetUpdates })} />
                <TextAreaField label="Task Updates" value={currentReport.taskUpdates} onChange={(taskUpdates) => updateCurrentReport({ taskUpdates })} />
                <TextAreaField label="Issues or Concerns" value={currentReport.issues} onChange={(issues) => updateCurrentReport({ issues })} />
                <TextAreaField label="Pending Items / Next Steps" value={currentReport.pendingItems} onChange={(pendingItems) => updateCurrentReport({ pendingItems })} />
              </div>
              <div className="daily-task-list">
                {currentReport.tasks.map((task) => (
                  <article className="daily-task" key={task.id}>
                    <input value={task.name} onChange={(event) => updateDailyTask(task.id, { name: event.target.value })} />
                    <select value={task.status} onChange={(event) => updateDailyTask(task.id, { status: event.target.value as DailyTaskStatus })}>{dailyTaskStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                    <input value={task.notes} onChange={(event) => updateDailyTask(task.id, { notes: event.target.value })} placeholder="Notes or screenshot reference" />
                    <label className="inline-check"><input type="checkbox" checked={task.recurring} onChange={(event) => updateDailyTask(task.id, { recurring: event.target.checked })} />Recurring</label>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </section>
      )}

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

function Metric({ label, value, icon }: { label: string; value: number | string; icon: ReactNode }) {
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

function DashboardPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel chart-panel">
      <h3>{title}</h3>
      <div className="chart-bars">{children}</div>
    </section>
  );
}

function ChartBar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = Math.max(4, Math.min(100, (value / max) * 100));
  return (
    <div className="chart-row">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <em>
        <i style={{ width: `${width}%` }} />
      </em>
    </div>
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

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="wide">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} />
    </label>
  );
}
