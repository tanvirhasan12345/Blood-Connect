
const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const defaultDonors = [];

const defaultStock = { "A+": 2, "A-": 2, "B+": 5, "B-": 2, "AB+": 2, "AB-": 2, "O+": 3, "O-": 1};


function get(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch (e) {
    return fallback;
  }
}

let donors = get("lifeblood_donors", defaultDonors);
let requests = get("lifeblood_requests", []);
let stock = get("lifeblood_stock", defaultStock);

function save() {
  localStorage.setItem("lifeblood_donors", JSON.stringify(donors));
  localStorage.setItem("lifeblood_requests", JSON.stringify(requests));
  localStorage.setItem("lifeblood_stock", JSON.stringify(stock));
}


function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

function initials(name) {
  if (!name) return "U";
  return name.split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();
}

function toggleMenu() {
  document.querySelector(".navbar")?.classList.toggle("open");
}


function renderDonors() {
  const bg = document.getElementById("bloodFilter")?.value || "";
  const loc = (document.getElementById("locationFilter")?.value || "").toLowerCase();
  
  const list = donors.filter(d => 
    (!bg || d.blood === bg) && 
    (!loc || d.location.toLowerCase().includes(loc)) && 
    d.availability === "Available"
  );
  
  const box = document.getElementById("donorResults");
  if (!box) return;
  
  box.innerHTML = list.length ? list.map(d => `
    <article class="donor-card">
      <div class="donor-top">
        <div class="avatar">${initials(d.name)}</div>
        <div><strong>${d.name}</strong><p>${d.location}</p></div>
        <span class="group">${d.blood}</span>
      </div>
      <p>📞 ${d.phone}</p>
      <p>Last donation: ${d.lastDonation || "Not provided"}</p>
      <div class="status">● Available to donate</div>
    </article>
  `).join("") : `<div class="empty">No available donors found. Try another blood group or location.</div>`;
}

function clearFilters() {
  if (document.getElementById("bloodFilter")) document.getElementById("bloodFilter").value = "";
  if (document.getElementById("locationFilter")) document.getElementById("locationFilter").value = "";
  renderDonors();
}

function renderStock() {
  const box = document.getElementById("stockGrid");
  if (!box) return;
  const max = 30;
  
  box.innerHTML = groups.map(g => `
    <div class="stock-card">
      <div class="blood">${g}</div>
      <div class="units">${stock[g] || 0} <small>units</small></div>
      <div class="bar">
        <span style="width:${Math.min(100, ((stock[g] || 0) / max) * 100)}%"></span>
      </div>
    </div>
  `).join("");
}

function renderRequests() {
  const box = document.getElementById("requestList");
  if (!box) return;
  
  box.innerHTML = requests.length ? requests.slice().reverse().map(r => `
    <div class="request">
      <span class="tag">${r.urgency}</span>
      <strong>${r.patient}</strong>
      <p>🩸 ${r.blood} · ${r.units} unit(s)</p>
      <p>🏥 ${r.hospital}</p>
      <p>📞 ${r.phone}</p>
    </div>
  `).join("") : `<div class="empty">No blood requests yet.</div>`;
}

function updateStats() {
  const donorCount = document.getElementById("donorCount");
  const requestCount = document.getElementById("requestCount");
  const availableUnits = document.getElementById("availableUnits");
  
  if (donorCount) donorCount.textContent = donors.length;
  if (requestCount) requestCount.textContent = requests.length;
  if (availableUnits) availableUnits.textContent = Object.values(stock).reduce((a, b) => a + b, 0);
}

function renderDonorDetails() {
  const box = document.getElementById("donorDetails");
  if (!box) return;
  
  box.innerHTML = donors.length ? donors.map(d => `
    <article class="donor-card">
      <div class="donor-top">
        <div class="avatar">${initials(d.name)}</div>
        <div><strong>${d.name}</strong><p>${d.location}</p></div>
        <span class="group">${d.blood}</span>
      </div>
      <p>📞 ${d.phone}</p>
      <p>Last donation: ${d.lastDonation || "Not provided"}</p>
      <div class="status ${d.availability === "Available" ? "" : "unavailable"}">● ${d.availability}</div>
    </article>
  `).join("") : `<div class="empty">No donor details available.</div>`;
}

function saveProfile() {
  const p = {
    name: document.getElementById("profileName")?.value.trim() || "",
    phone: document.getElementById("profilePhone")?.value.trim() || "",
    blood: document.getElementById("profileBlood")?.value || "",
    location: document.getElementById("profileLocation")?.value.trim() || ""
  };
  localStorage.setItem("lifeblood_profile", JSON.stringify(p));
  showToast("Profile saved successfully!");
  renderProfile();
}

function renderProfile() {
  const p = get("lifeblood_profile", { name: "", phone: "", blood: "", location: "" });
  
  const ids = ["profileName", "profilePhone", "profileBlood", "profileLocation"];
  const vals = [p.name, p.phone, p.blood, p.location];
  
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.value = vals[i] || "";
  });
  
  const box = document.getElementById("profileSummary");
  if (!box) return;
  
  box.innerHTML = `
    <article class="donor-card">
      <div class="donor-top">
        <div class="avatar">${initials(p.name || "User")}</div>
        <div><strong>${p.name || "User profile"}</strong><p>${p.location || "Location not provided"}</p></div>
        <span class="group">${p.blood || "—"}</span>
      </div>
      <p>📞 ${p.phone || "Phone not provided"}</p>
    </article>
    <article class="donor-card">
      <div class="donor-top">
        <div class="avatar">ST</div>
        <div><strong>${donors.length}</strong><p>Registered donors</p></div>
      </div>
      <p>${requests.length} blood request(s) submitted</p>
    </article>
  `;
}


document.getElementById("donorForm")?.addEventListener("submit", e => {
  e.preventDefault();
  donors.push({
    id: Date.now(),
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    blood: document.getElementById("blood").value,
    location: document.getElementById("location").value.trim(),
    lastDonation: document.getElementById("lastDonation").value,
    availability: document.getElementById("availability").value
  });
  save();
  e.target.reset();
  renderDonors();
  updateStats();
  showToast("Donor registered successfully!");
});

document.getElementById("requestForm")?.addEventListener("submit", e => {
  e.preventDefault();
  requests.push({
    id: Date.now(),
    patient: document.getElementById("patient").value.trim(),
    phone: document.getElementById("requestPhone").value.trim(),
    blood: document.getElementById("requestBlood").value,
    hospital: document.getElementById("hospital").value.trim(),
    units: Number(document.getElementById("units").value),
    urgency: document.getElementById("urgency").value
  });
  save();
  e.target.reset();
  renderRequests();
  updateStats();
  showToast("Blood request submitted!");
});


renderDonors();
renderStock();
renderRequests();
updateStats();
renderDonorDetails();
renderProfile();