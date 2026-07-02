import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

type Status =
  | "New Applicant"
  | "Contacted"
  | "Follow-Up"
  | "Scheduled"
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
};

type BookingSettings = {
  bookingTitle: string;
  bookingDescription: string;
  availableDays: string[];
  timeSlots: string[];
  blockedSlots: string[];
  faceToFaceLocations: string[];
  cancelBehavior: "Cancelled" | "Contacted";
};

type BookingForm = {
  name: string;
  email: string;
  phone: string;
  jobPost: string;
  date: string;
  time: string;
  interviewType: InterviewType;
  interviewLocation: string;
  notes: string;
};

const statuses: Status[] = ["New Applicant", "Contacted", "Follow-Up", "Scheduled", "Passed", "Failed", "Cancelled", "No Show"];

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
  calendar: "Book",
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

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const defaultBookingSettings: BookingSettings = {
  bookingTitle: "Schedule Your Interview",
  bookingDescription: "Choose an available date and time for a 30-minute interview with System Oriented LLC.",
  availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  timeSlots: ["09:00", "10:00", "11:30", "13:00", "14:30", "16:00"],
  blockedSlots: [],
  faceToFaceLocations: [defaultInterviewLocation],
  cancelBehavior: "Cancelled",
};

const emptyBookingForm: BookingForm = {
  name: "",
  email: "",
  phone: "",
  jobPost: "",
  date: "",
  time: "",
  interviewType: "Face-to-Face",
  interviewLocation: defaultInterviewLocation,
  notes: "",
};

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

function combineDateTime(date: string, time: string) {
  if (!date || !time) return "";
  return `${date}T${time}`;
}

function addMinutes(value: string, minutes: number) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

function toGoogleCalendarDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function getWeekday(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(new Date(`${value}T12:00`));
}

function listFromText(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatTimeSlot(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(`2026-01-01T${value}`));
}

function loadBookingSettings() {
  try {
    const saved = localStorage.getItem("ats-booking-settings");
    if (!saved) return defaultBookingSettings;
    const parsed = JSON.parse(saved) as Partial<BookingSettings>;
    return {
      ...defaultBookingSettings,
      ...parsed,
      availableDays: parsed.availableDays?.length ? parsed.availableDays : defaultBookingSettings.availableDays,
      timeSlots: parsed.timeSlots?.length ? parsed.timeSlots : defaultBookingSettings.timeSlots,
      faceToFaceLocations: parsed.faceToFaceLocations?.length ? parsed.faceToFaceLocations : defaultBookingSettings.faceToFaceLocations,
      cancelBehavior: parsed.cancelBehavior === "Contacted" ? "Contacted" : "Cancelled",
    };
  } catch {
    return defaultBookingSettings;
  }
}

function buildGoogleCalendarUrl(applicant: Applicant) {
  if (!applicant.interviewDateTime) return "";
  const start = new Date(applicant.interviewDateTime);
  const end = addMinutes(applicant.interviewDateTime, 30);
  if (!end || Number.isNaN(start.getTime())) return "";
  const location = applicant.interviewType === "Face-to-Face" ? applicant.interviewLocation : "Online interview";
  const details = [
    `Applicant: ${applicant.name}`,
    `Phone: ${applicant.phone || "Not provided"}`,
    `Email: ${applicant.email || "Not provided"}`,
    `Job Position: ${applicant.jobPost || "Not provided"}`,
    `Interview Type: ${applicant.interviewType}`,
    applicant.interviewType === "Online"
      ? "Google Meet: connect Google Calendar API with conferenceData enabled to automatically generate a Meet link."
      : `Interview Location: ${applicant.interviewLocation || "Not provided"}`,
    applicant.notes ? `Notes: ${applicant.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${applicant.name || "Applicant"} Interview - ${applicant.jobPost || "Position"}`,
    dates: `${toGoogleCalendarDate(start)}/${toGoogleCalendarDate(end)}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildConfirmationMessage(applicant: Applicant, calendarUrl: string) {
  const locationLine =
    applicant.interviewType === "Face-to-Face"
      ? `Interview Location:\n${applicant.interviewLocation || defaultInterviewLocation}`
      : "Interview Type:\nOnline";

  return `Hello ${applicant.name || "there"},

Your interview has been scheduled successfully.

Position:
${applicant.jobPost || "The position"}

Interview Date and Time:
${formatDateTime(applicant.interviewDateTime)}

${locationLine}

To add this appointment to Google Calendar, please use this link:
${calendarUrl}

If you need to cancel or reschedule, please contact us as soon as possible.

Thank you,
${senderName}
${companyName}`;
}

function normalizeApplicant(applicant: Partial<Applicant>): Applicant {
  return {
    ...defaultApplicant,
    ...applicant,
    id: applicant.id || crypto.randomUUID(),
    createdAt: applicant.createdAt || new Date().toISOString(),
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

I hope you are doing well.

This is a reminder that you have a scheduled interview tomorrow for the ${job} position.

Kindly confirm by 10:00 AM tomorrow if you will be able to attend your appointment at ${interviewTime} ${reminderLocation}.

If we do not receive your confirmation by 10:00 AM, we will cancel your appointment and ask you to reschedule.

Thank you, and we look forward to hearing from you.`,
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
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingMode, setBookingMode] = useState<"admin" | "public">("admin");
  const [bookingForm, setBookingForm] = useState<BookingForm>(emptyBookingForm);
  const [bookingSettings, setBookingSettings] = useState<BookingSettings>(loadBookingSettings);
  const [bookingConfirmationId, setBookingConfirmationId] = useState("");
  const [bookingFilter, setBookingFilter] = useState({ date: "", status: "All" as Status | "All", type: "All" as InterviewType | "All", location: "" });

  useEffect(() => {
    localStorage.setItem("ats-applicants", JSON.stringify(applicants));
  }, [applicants]);

  useEffect(() => {
    localStorage.setItem("ats-booking-settings", JSON.stringify(bookingSettings));
  }, [bookingSettings]);

  useEffect(() => {
    const bookingParam = new URLSearchParams(window.location.search).get("booking");
    if (bookingParam === "public" || bookingParam === "1") {
      setBookingMode(bookingParam === "public" ? "public" : "admin");
      setBookingOpen(true);
    }
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
      scheduled: applicants.filter((a) => a.status === "Scheduled").length,
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
  const bookedSlotKeys = useMemo(() => {
    return new Set(applicants.filter((applicant) => applicant.status === "Scheduled").map((applicant) => applicant.interviewDateTime).filter(Boolean));
  }, [applicants]);
  const availableTimes = useMemo(() => {
    if (!bookingForm.date || !bookingSettings.availableDays.includes(getWeekday(bookingForm.date))) return [];
    return bookingSettings.timeSlots.filter((time) => {
      const slot = combineDateTime(bookingForm.date, time);
      return !bookedSlotKeys.has(slot) && !bookingSettings.blockedSlots.includes(slot);
    });
  }, [bookedSlotKeys, bookingForm.date, bookingSettings]);
  const scheduledInterviews = useMemo(() => {
    return applicants
      .filter((applicant) => applicant.interviewDateTime)
      .filter((applicant) => bookingFilter.status === "All" || applicant.status === bookingFilter.status)
      .filter((applicant) => bookingFilter.type === "All" || applicant.interviewType === bookingFilter.type)
      .filter((applicant) => !bookingFilter.date || applicant.interviewDateTime.startsWith(bookingFilter.date))
      .filter((applicant) => !bookingFilter.location || applicant.interviewLocation.toLowerCase().includes(bookingFilter.location.toLowerCase()))
      .sort((a, b) => new Date(a.interviewDateTime).getTime() - new Date(b.interviewDateTime).getTime());
  }, [applicants, bookingFilter]);
  const confirmedBooking = applicants.find((applicant) => applicant.id === bookingConfirmationId);
  const confirmedCalendarUrl = confirmedBooking ? buildGoogleCalendarUrl(confirmedBooking) : "";

  function openApplicantDetails(id: string, type?: MessageType) {
    if (type) {
      setPreferredMessageType(type);
      setMessageType(type);
    }
    setSelectedId(id);
    setDetailsOpen(true);
  }

  function updateBookingForm(patch: Partial<BookingForm>) {
    setBookingConfirmationId("");
    setBookingForm((current) => ({ ...current, ...patch }));
  }

  function updateBookingSettings(patch: Partial<BookingSettings>) {
    setBookingSettings((current) => ({ ...current, ...patch }));
  }

  function resetBookingForm() {
    setBookingForm({ ...emptyBookingForm, interviewLocation: bookingSettings.faceToFaceLocations[0] || defaultInterviewLocation });
    setBookingConfirmationId("");
  }

  function submitBooking() {
    const interviewDateTime = combineDateTime(bookingForm.date, bookingForm.time);
    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone || !bookingForm.jobPost || !interviewDateTime) return;
    if (bookedSlotKeys.has(interviewDateTime) || bookingSettings.blockedSlots.includes(interviewDateTime)) return;

    const interviewLocation = bookingForm.interviewType === "Face-to-Face" ? bookingForm.interviewLocation || defaultInterviewLocation : "";
    let confirmedId = "";

    setApplicants((current) => {
      const existing = current.find((applicant) => {
        const emailMatch = applicant.email && applicant.email.toLowerCase() === bookingForm.email.toLowerCase();
        const phoneMatch = normalizePhone(applicant.phone) && normalizePhone(applicant.phone) === normalizePhone(bookingForm.phone);
        return emailMatch || phoneMatch;
      });
      const notes = [existing?.notes, bookingForm.notes ? `Booking Notes: ${bookingForm.notes}` : "", "Booked through booking page."].filter(Boolean).join("\n");
      const nextApplicant = normalizeApplicant({
        ...(existing ?? {}),
        id: existing?.id ?? crypto.randomUUID(),
        name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        source: existing?.source ?? "Booking Page",
        jobPost: bookingForm.jobPost,
        interviewType: bookingForm.interviewType,
        interviewLocation,
        interviewDateTime,
        status: "Scheduled",
        notes,
      });

      confirmedId = nextApplicant.id;
      return existing ? current.map((applicant) => (applicant.id === existing.id ? nextApplicant : applicant)) : [nextApplicant, ...current];
    });

    window.setTimeout(() => {
      setSelectedId(confirmedId);
      setBookingConfirmationId(confirmedId);
    }, 0);
  }

  function cancelBooking(applicant: Applicant) {
    saveApplicant({ ...applicant, status: bookingSettings.cancelBehavior, interviewDateTime: "" });
  }

  function saveApplicant(next: Applicant) {
    const applicant = next.id === "new" ? { ...next, id: crypto.randomUUID(), createdAt: new Date().toISOString() } : next;
    setApplicants((current) => {
      const exists = current.some((item) => item.id === applicant.id);
      return exists ? current.map((item) => (item.id === applicant.id ? applicant : item)) : [applicant, ...current];
    });
    setSelectedId(applicant.id);
  }

  function updateSelected(patch: Partial<Applicant>) {
    saveApplicant({ ...selected, ...patch });
  }

  function createApplicant() {
    const applicant = { ...defaultApplicant, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
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
          <button
            className="secondary-action"
            onClick={() => {
              setBookingMode("admin");
              setBookingOpen(true);
            }}
          >
            <Icon name="calendar" />
            Booking Page
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

      {bookingOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Booking page">
          <section className={bookingMode === "public" ? "modal-panel booking-modal public-booking-modal" : "modal-panel booking-modal"}>
            <div className="panel-heading modal-heading">
              <div>
                <span className="eyebrow">{bookingMode === "public" ? companyName : "Booking Page"}</span>
                <h2>{bookingMode === "public" ? bookingSettings.bookingTitle : "Interview scheduling"}</h2>
              </div>
              <div className="modal-actions">
                {bookingMode === "admin" && (
                  <button
                    className="secondary-action"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?booking=public`);
                    }}
                  >
                    <Icon name="copy" />
                    Copy Public Link
                  </button>
                )}
                <button className="icon-button" onClick={() => setBookingOpen(false)} aria-label="Close booking page">
                  <Icon name="close" />
                </button>
              </div>
            </div>

            {confirmedBooking ? (
              <section className="booking-confirmation">
                <span className="eyebrow">Confirmed</span>
                <h3>{confirmedBooking.name} is scheduled</h3>
                <p>{formatDateTime(confirmedBooking.interviewDateTime)}</p>
                <div className="button-row">
                  <a href={confirmedCalendarUrl} target="_blank" rel="noreferrer">
                    <Icon name="calendar" />
                    Add to Google Calendar
                  </a>
                  <a
                    href={`mailto:${confirmedBooking.email}?subject=${encodeURIComponent("Interview Confirmation")}&body=${encodeURIComponent(
                      buildConfirmationMessage(confirmedBooking, confirmedCalendarUrl),
                    )}`}
                  >
                    <Icon name="mail" />
                    Email Applicant
                  </a>
                  <button onClick={resetBookingForm}>
                    <Icon name="add" />
                    New Booking
                  </button>
                </div>
              </section>
            ) : null}

            <div className={bookingMode === "public" ? "booking-grid public-booking-grid" : "booking-grid"}>
              <section className="booking-card">
                <div>
                  <span className="eyebrow">{bookingMode === "public" ? "Interview Booking" : "Applicant Booking"}</span>
                  <h3>{bookingSettings.bookingTitle}</h3>
                  <p className="booking-description">{bookingSettings.bookingDescription}</p>
                </div>
                <div className="form-grid">
                  <TextField label="Full Name" value={bookingForm.name} onChange={(name) => updateBookingForm({ name })} />
                  <TextField label="Email Address" value={bookingForm.email} onChange={(email) => updateBookingForm({ email })} />
                  <TextField label="Phone Number" value={bookingForm.phone} onChange={(phone) => updateBookingForm({ phone })} />
                  <TextField label="Position Applied For" value={bookingForm.jobPost} onChange={(jobPost) => updateBookingForm({ jobPost })} />
                  <label>
                    <span>Preferred Interview Date</span>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(event) => updateBookingForm({ date: event.target.value, time: "" })}
                    />
                  </label>
                  <label>
                    <span>Preferred Interview Time</span>
                    <select value={bookingForm.time} onChange={(event) => updateBookingForm({ time: event.target.value })}>
                      <option value="">
                        {bookingForm.date && availableTimes.length === 0 ? "No available times for this date" : "Select available time"}
                      </option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {formatTimeSlot(time)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Interview Type</span>
                    <select value={bookingForm.interviewType} onChange={(event) => updateBookingForm({ interviewType: event.target.value as InterviewType })}>
                      <option>Face-to-Face</option>
                      <option>Online</option>
                    </select>
                  </label>
                  {bookingForm.interviewType === "Face-to-Face" ? (
                    <label>
                      <span>Interview Location</span>
                      <select value={bookingForm.interviewLocation} onChange={(event) => updateBookingForm({ interviewLocation: event.target.value })}>
                        {bookingSettings.faceToFaceLocations.map((location) => (
                          <option key={location}>{location}</option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <div className="field-note">
                      <span>Online Interview</span>
                      <p>Google Meet is requested when the Google Calendar API connection is enabled.</p>
                    </div>
                  )}
                  <label className="wide">
                    <span>Notes or Additional Information</span>
                    <textarea value={bookingForm.notes} onChange={(event) => updateBookingForm({ notes: event.target.value })} rows={3} />
                  </label>
                </div>
                <div className="button-row booking-actions">
                  <button className="primary-action" onClick={submitBooking}>
                    <Icon name="check" />
                    Confirm Booking
                  </button>
                  {bookingMode === "admin" && (
                    <a
                      href={`mailto:?subject=${encodeURIComponent("New interview booking")}&body=${encodeURIComponent(
                        bookingForm.name
                          ? `${bookingForm.name} requested an interview on ${bookingForm.date} at ${bookingForm.time} for ${bookingForm.jobPost}.`
                          : "A new interview booking was started.",
                      )}`}
                    >
                      <Icon name="mail" />
                      Notify Admin
                    </a>
                  )}
                </div>
              </section>

              {bookingMode === "admin" && (
              <section className="booking-card admin-card">
                <div>
                  <span className="eyebrow">Admin Controls</span>
                  <h3>Availability and bookings</h3>
                </div>
                <div className="integration-note">
                  Google Calendar event links are generated with the booking details. Automatic event creation, confirmation emails, and Google Meet links require a connected Google OAuth backend.
                </div>

                <TextField label="Booking Page Title" value={bookingSettings.bookingTitle} onChange={(bookingTitle) => updateBookingSettings({ bookingTitle })} />
                <label>
                  <span>Booking Page Description</span>
                  <textarea
                    value={bookingSettings.bookingDescription}
                    onChange={(event) => updateBookingSettings({ bookingDescription: event.target.value })}
                    rows={3}
                  />
                </label>

                <div className="settings-block">
                  <strong>Available Days</strong>
                  <div className="checkbox-grid">
                    {weekdays.map((day) => (
                      <label key={day} className="checkbox-line">
                        <input
                          type="checkbox"
                          checked={bookingSettings.availableDays.includes(day)}
                          onChange={(event) => {
                            const next = event.target.checked
                              ? [...bookingSettings.availableDays, day]
                              : bookingSettings.availableDays.filter((item) => item !== day);
                            updateBookingSettings({ availableDays: weekdays.filter((weekday) => next.includes(weekday)) });
                          }}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label>
                  <span>Available Time Slots</span>
                  <textarea
                    value={bookingSettings.timeSlots.join(", ")}
                    onChange={(event) => updateBookingSettings({ timeSlots: listFromText(event.target.value).sort() })}
                    rows={2}
                  />
                </label>
                <label>
                  <span>Blocked Date/Time Slots</span>
                  <textarea
                    value={bookingSettings.blockedSlots.join(", ")}
                    onChange={(event) => updateBookingSettings({ blockedSlots: listFromText(event.target.value) })}
                    rows={2}
                    placeholder="2026-07-10T11:30"
                  />
                </label>
                <label>
                  <span>Face-to-Face Interview Locations</span>
                  <textarea
                    value={bookingSettings.faceToFaceLocations.join("\n")}
                    onChange={(event) => updateBookingSettings({ faceToFaceLocations: listFromText(event.target.value) })}
                    rows={4}
                  />
                </label>
                <label>
                  <span>Cancel Behavior</span>
                  <select
                    value={bookingSettings.cancelBehavior}
                    onChange={(event) => updateBookingSettings({ cancelBehavior: event.target.value as "Cancelled" | "Contacted" })}
                  >
                    <option>Cancelled</option>
                    <option>Contacted</option>
                  </select>
                </label>

                <div className="booking-filters">
                  <label>
                    <span>Date</span>
                    <input type="date" value={bookingFilter.date} onChange={(event) => setBookingFilter((current) => ({ ...current, date: event.target.value }))} />
                  </label>
                  <label>
                    <span>Status</span>
                    <select value={bookingFilter.status} onChange={(event) => setBookingFilter((current) => ({ ...current, status: event.target.value as Status | "All" }))}>
                      <option>All</option>
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Type</span>
                    <select value={bookingFilter.type} onChange={(event) => setBookingFilter((current) => ({ ...current, type: event.target.value as InterviewType | "All" }))}>
                      <option>All</option>
                      <option>Online</option>
                      <option>Face-to-Face</option>
                    </select>
                  </label>
                  <TextField label="Location" value={bookingFilter.location} onChange={(location) => setBookingFilter((current) => ({ ...current, location }))} />
                </div>

                <div className="scheduled-list">
                  {scheduledInterviews.map((applicant) => (
                    <article className="scheduled-row" key={applicant.id}>
                      <button className="reminder-main" onClick={() => openApplicantDetails(applicant.id)}>
                        <strong>{applicant.name || "Unnamed applicant"}</strong>
                        <span>{formatDateTime(applicant.interviewDateTime)} · {applicant.interviewType}</span>
                        <small>{applicant.jobPost || "No job post entered"}</small>
                      </button>
                      <div className="scheduled-actions">
                        <a href={buildGoogleCalendarUrl(applicant)} target="_blank" rel="noreferrer">
                          <Icon name="calendar" />
                        </a>
                        <button onClick={() => cancelBooking(applicant)}>
                          <Icon name="close" />
                        </button>
                      </div>
                    </article>
                  ))}
                  {scheduledInterviews.length === 0 && <p className="reminder-empty">No interviews match the current filters.</p>}
                </div>
              </section>
              )}
            </div>
          </section>
        </div>
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
