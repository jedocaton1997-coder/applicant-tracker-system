import type { IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";

type Status =
  | "New Applicant"
  | "Contacted"
  | "Follow-Up"
  | "Scheduled"
  | "Confirmed"
  | "Interview Completed"
  | "Passed"
  | "Failed"
  | "Cancelled"
  | "No Show";

type InterviewType = "Online" | "Face-to-Face";

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

type ClickUpTask = {
  id: string;
  name: string;
  description?: string;
  markdown_description?: string;
  text_content?: string;
  date_created?: string;
  date_updated?: string;
};

const clickUpBaseUrl = "https://api.clickup.com/api/v2";
const jsonStart = "ATS_APPLICANT_JSON_START";
const jsonEnd = "ATS_APPLICANT_JSON_END";

function getConfig() {
  const apiToken = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID;
  if (!apiToken || !listId) return null;
  return { apiToken, listId };
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) reject(new Error("Request body is too large."));
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const body = await readBody(req);
  return body ? JSON.parse(body) : ({} as T);
}

async function clickUpFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = getConfig();
  if (!config) throw new Error("Shared applicant storage is not configured.");

  const response = await fetch(`${clickUpBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: config.apiToken,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data?.err ?? data?.ECODE ?? `ClickUp request failed with status ${response.status}`);
  return data as T;
}

function taskIdCanUpdate(id: string) {
  return Boolean(id && id !== "new" && !id.includes("-"));
}

function applicantKey(applicant: Applicant) {
  const email = applicant.email.trim().toLowerCase();
  if (email) return `email:${email}`;
  const phone = applicant.phone.replace(/\D/g, "");
  if (phone) return `phone:${phone}`;
  return `name:${applicant.name.trim().toLowerCase()}|job:${applicant.jobPost.trim().toLowerCase()}`;
}

function applicantScore(applicant: Applicant) {
  const statusScore: Record<Status, number> = {
    "New Applicant": 1,
    Contacted: 2,
    "Follow-Up": 3,
    Scheduled: 6,
    Confirmed: 7,
    "Interview Completed": 8,
    Passed: 9,
    Failed: 4,
    Cancelled: 0,
    "No Show": 2,
  };
  return (
    statusScore[applicant.status] * 100_000 +
    (applicant.interviewDateTime ? 20_000 : 0) +
    (applicant.interviewLocation ? 5_000 : 0) +
    (applicant.phone ? 1_000 : 0) +
    (applicant.email ? 1_000 : 0) +
    Math.min(applicant.notes.length, 999)
  );
}

function dedupeApplicants(applicants: Applicant[]) {
  const groups = applicants.reduce(
    (record, applicant) => {
      const key = applicantKey(applicant);
      record[key] = [...(record[key] ?? []), applicant];
      return record;
    },
    {} as Record<string, Applicant[]>,
  );
  return Object.values(groups).map((group) =>
    group.sort(
      (a, b) =>
        applicantScore(b) - applicantScore(a) ||
        (b.statusUpdatedAt || b.createdAt).localeCompare(a.statusUpdatedAt || a.createdAt),
    )[0],
  );
}

function taskMarkdown(applicant: Applicant) {
  const payload = JSON.stringify(applicant, null, 2);
  return [
    "## Applicant Details",
    `Applicant Name: ${applicant.name || "Unnamed applicant"}`,
    `Phone Number: ${applicant.phone || "Not provided"}`,
    `Email Address: ${applicant.email || "Not provided"}`,
    `Job Post Applied For: ${applicant.jobPost || "Not provided"}`,
    `Interview Date and Time: ${applicant.interviewDateTime || "Not scheduled"}`,
    `Status: ${applicant.status}`,
    "",
    "## Notes",
    applicant.notes || "No notes.",
    "",
    jsonStart,
    payload,
    jsonEnd,
  ].join("\n");
}

function parseTask(task: ClickUpTask): Applicant | null {
  const content = [task.markdown_description, task.description, task.text_content].filter(Boolean).join("\n");
  const match = content.match(new RegExp(`${jsonStart}\\s*([\\s\\S]*?)\\s*${jsonEnd}`));
  if (!match?.[1]) return null;

  try {
    const parsed = JSON.parse(match[1]) as Applicant;
    return {
      ...parsed,
      id: task.id,
      name: parsed.name || task.name || "Unnamed applicant",
    };
  } catch {
    return null;
  }
}

async function listApplicants() {
  const config = getConfig();
  if (!config) throw new Error("Shared applicant storage is not configured.");

  const applicants: Applicant[] = [];
  for (let page = 0; page < 20; page += 1) {
    const data = await clickUpFetch<{ tasks?: ClickUpTask[] }>(`/list/${config.listId}/task?archived=false&include_closed=true&page=${page}`);
    const tasks = data.tasks ?? [];
    applicants.push(...tasks.map(parseTask).filter(Boolean) as Applicant[]);
    if (tasks.length < 100) break;
  }
  return dedupeApplicants(applicants);
}

async function saveApplicant(applicant: Applicant) {
  const payload = {
    name: applicant.name || "Unnamed applicant",
    markdown_content: taskMarkdown(applicant),
  };

  if (taskIdCanUpdate(applicant.id)) {
    try {
      const task = await clickUpFetch<ClickUpTask>(`/task/${applicant.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return parseTask(task) ?? { ...applicant, id: task.id };
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      if (!message.includes("not found") && !message.includes("deleted")) throw error;
    }
  }

  const existing = (await listApplicants()).find((item) => applicantKey(item) === applicantKey(applicant));
  if (existing?.id && existing.id !== applicant.id) {
    const task = await clickUpFetch<ClickUpTask>(`/task/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: applicant.name || existing.name || "Unnamed applicant",
        markdown_content: taskMarkdown({ ...existing, ...applicant, id: existing.id }),
      }),
    });
    return parseTask(task) ?? { ...existing, ...applicant, id: existing.id };
  }

  const config = getConfig();
  if (!config) throw new Error("Shared applicant storage is not configured.");
  const task = await clickUpFetch<ClickUpTask>(`/list/${config.listId}/task`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseTask(task) ?? { ...applicant, id: task.id };
}

async function deleteApplicant(id: string) {
  if (!taskIdCanUpdate(id)) return;
  await clickUpFetch(`/task/${id}`, { method: "DELETE" });
}

export async function handleSharedApplicants(req: IncomingMessage, res: ServerResponse) {
  if (!getConfig()) {
    sendJson(res, 501, { error: "Shared applicant storage is not configured." });
    return;
  }

  try {
    if (req.method === "GET") {
      sendJson(res, 200, { applicants: await listApplicants() });
      return;
    }

    if (req.method === "POST" || req.method === "PUT") {
      const body = await readJson<{ applicant?: Applicant; applicants?: Applicant[]; replace?: boolean }>(req);
      if (body.applicant) {
        sendJson(res, 200, { applicant: await saveApplicant(body.applicant) });
        return;
      }
      if (Array.isArray(body.applicants)) {
        if (body.replace) {
          const existingApplicants = await listApplicants();
          for (const applicant of existingApplicants) await deleteApplicant(applicant.id);
        }
        const applicants = [];
        for (const applicant of dedupeApplicants(body.applicants)) applicants.push(await saveApplicant(applicant));
        sendJson(res, 200, { applicants });
        return;
      }
      sendJson(res, 400, { error: "Missing applicant data." });
      return;
    }

    if (req.method === "DELETE") {
      const requestUrl = new URL(req.url ?? "", "http://localhost");
      const id = requestUrl.searchParams.get("id");
      if (!id) {
        sendJson(res, 400, { error: "Missing applicant id." });
        return;
      }
      await deleteApplicant(id);
      sendJson(res, 200, { ok: true });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : "Shared applicant request failed." });
  }
}
