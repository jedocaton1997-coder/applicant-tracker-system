const clickUpBaseUrl = "https://api.clickup.com/api/v2";
const jsonStart = "ATS_APPLICANT_JSON_START";
const jsonEnd = "ATS_APPLICANT_JSON_END";

function config() {
  const apiToken = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID;
  return apiToken && listId ? { apiToken, listId } : null;
}

function send(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) return JSON.parse(req.body);

  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

async function clickUpFetch(path, init = {}) {
  const settings = config();
  if (!settings) throw new Error("Missing CLICKUP_API_TOKEN or CLICKUP_LIST_ID in Vercel environment variables.");

  const response = await fetch(`${clickUpBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: settings.apiToken,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data?.err || data?.ECODE || `ClickUp request failed with status ${response.status}`);
  return data;
}

function taskIdCanUpdate(id) {
  return Boolean(id && id !== "new" && !String(id).includes("-"));
}

function digits(value = "") {
  return String(value).replace(/\D/g, "");
}

function applicantKey(applicant) {
  const email = String(applicant.email || "").trim().toLowerCase();
  if (email) return `email:${email}`;
  const phone = digits(applicant.phone);
  if (phone) return `phone:${phone}`;
  return `name:${String(applicant.name || "").trim().toLowerCase()}|job:${String(applicant.jobPost || "").trim().toLowerCase()}`;
}

function applicantScore(applicant) {
  const statusScore = {
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
    (statusScore[applicant.status] || 0) * 100000 +
    (applicant.interviewDateTime ? 20000 : 0) +
    (applicant.interviewLocation ? 5000 : 0) +
    (applicant.phone ? 1000 : 0) +
    (applicant.email ? 1000 : 0) +
    Math.min(String(applicant.notes || "").length, 999)
  );
}

function dedupeApplicants(applicants) {
  const groups = new Map();
  for (const applicant of applicants) {
    const key = applicantKey(applicant);
    groups.set(key, [...(groups.get(key) || []), applicant]);
  }
  return [...groups.values()].map((group) =>
    group.sort(
      (a, b) =>
        applicantScore(b) - applicantScore(a) ||
        String(b.statusUpdatedAt || b.createdAt || "").localeCompare(String(a.statusUpdatedAt || a.createdAt || "")),
    )[0],
  );
}

function taskMarkdown(applicant) {
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
    JSON.stringify(applicant, null, 2),
    jsonEnd,
  ].join("\n");
}

function parseTask(task) {
  const content = [task.markdown_description, task.description, task.text_content].filter(Boolean).join("\n");
  const match = content.match(new RegExp(`${jsonStart}\\s*([\\s\\S]*?)\\s*${jsonEnd}`));
  if (!match?.[1]) return null;
  try {
    const parsed = JSON.parse(match[1]);
    return { ...parsed, id: task.id, name: parsed.name || task.name || "Unnamed applicant" };
  } catch {
    return null;
  }
}

async function listApplicants() {
  const settings = config();
  if (!settings) throw new Error("Missing CLICKUP_API_TOKEN or CLICKUP_LIST_ID in Vercel environment variables.");

  const applicants = [];
  for (let page = 0; page < 20; page += 1) {
    const data = await clickUpFetch(`/list/${settings.listId}/task?archived=false&include_closed=true&page=${page}`);
    const tasks = data.tasks || [];
    applicants.push(...tasks.map(parseTask).filter(Boolean));
    if (tasks.length < 100) break;
  }
  return dedupeApplicants(applicants);
}

async function deleteApplicant(id) {
  if (!taskIdCanUpdate(id)) return;
  await clickUpFetch(`/task/${id}`, { method: "DELETE" });
}

async function saveApplicant(applicant) {
  const payload = {
    name: applicant.name || "Unnamed applicant",
    markdown_content: taskMarkdown(applicant),
  };

  if (taskIdCanUpdate(applicant.id)) {
    try {
      const task = await clickUpFetch(`/task/${applicant.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return parseTask(task) || { ...applicant, id: task.id };
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      if (!message.includes("not found") && !message.includes("deleted")) throw error;
    }
  }

  const existing = (await listApplicants()).find((item) => applicantKey(item) === applicantKey(applicant));
  if (existing?.id && existing.id !== applicant.id) {
    const task = await clickUpFetch(`/task/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: applicant.name || existing.name || "Unnamed applicant",
        markdown_content: taskMarkdown({ ...existing, ...applicant, id: existing.id }),
      }),
    });
    return parseTask(task) || { ...existing, ...applicant, id: existing.id };
  }

  const settings = config();
  const task = await clickUpFetch(`/list/${settings.listId}/task`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseTask(task) || { ...applicant, id: task.id };
}

export default async function handler(req, res) {
  try {
    if (!config()) {
      send(res, 501, { error: "Missing CLICKUP_API_TOKEN or CLICKUP_LIST_ID in Vercel environment variables." });
      return;
    }

    if (req.method === "GET") {
      send(res, 200, { applicants: await listApplicants() });
      return;
    }

    if (req.method === "POST" || req.method === "PUT") {
      const body = await readBody(req);
      if (body.applicant) {
        send(res, 200, { applicant: await saveApplicant(body.applicant) });
        return;
      }
      if (Array.isArray(body.applicants)) {
        if (body.replace) {
          const existingApplicants = await listApplicants();
          for (const applicant of existingApplicants) await deleteApplicant(applicant.id);
        }
        const applicants = [];
        for (const applicant of dedupeApplicants(body.applicants)) applicants.push(await saveApplicant(applicant));
        send(res, 200, { applicants });
        return;
      }
      send(res, 400, { error: "Missing applicant data." });
      return;
    }

    if (req.method === "DELETE") {
      const id = new URL(req.url || "", "http://localhost").searchParams.get("id");
      if (!id) {
        send(res, 400, { error: "Missing applicant id." });
        return;
      }
      await deleteApplicant(id);
      send(res, 200, { ok: true });
      return;
    }

    send(res, 405, { error: "Method not allowed." });
  } catch (error) {
    send(res, 500, {
      error: error instanceof Error ? error.message : "Shared applicant request failed.",
    });
  }
}
