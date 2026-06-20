const { google } = require("googleapis");

const DEFAULT_RANGE = "Leads!A:F";
const allowedPurposes = new Set(["live", "rent", "flip"]);

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getSheetsClient() {
  const clientEmail = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = getRequiredEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

async function appendLeadToSheet(lead) {
  const sheets = getSheetsClient();
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const range = process.env.GOOGLE_SHEET_RANGE || DEFAULT_RANGE;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          new Date().toISOString(),
          lead.name,
          lead.email,
          lead.whatsapp,
          lead.budget,
          lead.purpose,
        ],
      ],
    },
  });
}

function normalizeLead(body) {
  return {
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    whatsapp: String(body.whatsapp || "").trim(),
    budget: String(body.budget || "").trim(),
    purpose: String(body.purpose || "").trim().toLowerCase(),
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateLead(lead) {
  const errors = [];

  if (!lead.name) errors.push("name is required");
  if (!isValidEmail(lead.email)) errors.push("valid email is required");
  if (!lead.whatsapp) errors.push("whatsapp is required");
  if (!lead.budget) errors.push("budget is required");
  if (!allowedPurposes.has(lead.purpose)) errors.push("purpose must be live, rent, or flip");

  return errors;
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body;
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  let lead;

  try {
    lead = normalizeLead(parseBody(req));
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON body",
    });
  }

  const errors = validateLead(lead);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  try {
    await appendLeadToSheet(lead);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to save lead:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to save lead",
    });
  }
};
