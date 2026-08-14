const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.className = isError ? "error" : "";
}

function renderImage(data) {
  resultEl.innerHTML = "";
  const img = document.createElement("img");
  img.src = `data:${data.mime_type};base64,${data.image_base64}`;
  img.alt = "Generated image";
  resultEl.appendChild(img);

  const link = document.createElement("a");
  link.href = img.src;
  link.download = "banana-image.png";
  link.textContent = "Download image";
  link.className = "download-link";
  resultEl.appendChild(link);

  if (data.text) {
    const p = document.createElement("p");
    p.className = "response-text";
    p.textContent = data.text;
    resultEl.appendChild(p);
  }
}

async function handleResponse(resp) {
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data;
}

document.getElementById("generate-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  setStatus("Generating…");
  resultEl.innerHTML = "";
  try {
    const resp = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: form.get("prompt"),
        aspect_ratio: form.get("aspect_ratio"),
        resolution: form.get("resolution"),
      }),
    });
    const data = await handleResponse(resp);
    renderImage(data);
    setStatus("Done.");
  } catch (err) {
    setStatus(err.message, true);
  }
});

document.getElementById("edit-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  setStatus("Editing…");
  resultEl.innerHTML = "";
  try {
    const resp = await fetch("/api/edit", { method: "POST", body: form });
    const data = await handleResponse(resp);
    renderImage(data);
    setStatus("Done.");
  } catch (err) {
    setStatus(err.message, true);
  }
});
