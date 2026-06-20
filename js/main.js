const form = document.querySelector("#lead-form");
const statusMessage = document.querySelector("#form-status");

const budgetLabels = {
  "100k_eur": "EUR 100k",
  "200k_eur": "EUR 200k",
  "500k_eur": "EUR 500k",
  "1m_plus_eur": "EUR 1M+",
};

async function sendLeadToCRM(lead) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    throw new Error("Submission failed");
  }

  return response.json();
}

function createLeadPayload(formData) {
  return {
    name: formData.get("name").trim(),
    email: formData.get("email").trim(),
    whatsapp: formData.get("whatsapp").trim(),
    budget: budgetLabels[formData.get("budget")] || formData.get("budget"),
    purpose: formData.get("purpose"),
    source: "dubai-invest-desk-landing-page",
    submittedAt: new Date().toISOString(),
  };
}

function validateLead(lead) {
  return Boolean(lead.name && lead.email && lead.whatsapp && lead.budget && lead.purpose);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    statusMessage.textContent = "Please complete all fields.";
    statusMessage.classList.add("is-error");
    return;
  }

  const lead = createLeadPayload(new FormData(form));

  if (!validateLead(lead)) {
    statusMessage.textContent = "Please complete all fields.";
    statusMessage.classList.add("is-error");
    return;
  }

  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  statusMessage.textContent = "";
  statusMessage.classList.remove("is-error");

  try {
    await sendLeadToCRM(lead);
    statusMessage.textContent = "Thanks. Your investment request has been received.";
    form.reset();
  } catch (error) {
    console.error("Lead submission failed:", error);
    statusMessage.textContent = "Something went wrong. Please try again or use WhatsApp.";
    statusMessage.classList.add("is-error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Get Investment Options";
  }
});
