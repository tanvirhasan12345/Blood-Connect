var ADMIN_USERNAME = "admin";
var ADMIN_PASSWORD = "admin123";

var bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

var donorList = JSON.parse(localStorage.getItem("lifeblood_donors")) || [];
var requestList = JSON.parse(localStorage.getItem("lifeblood_requests")) || [];
var stockData = JSON.parse(localStorage.getItem("lifeblood_stock")) || {};

if (Object.keys(stockData).length === 0) {
  for (var i = 0; i < bloodGroups.length; i++) {
    stockData[bloodGroups[i]] = 0;
  }
}

function saveData() {
  localStorage.setItem("lifeblood_donors", JSON.stringify(donorList));
  localStorage.setItem("lifeblood_requests", JSON.stringify(requestList));
  localStorage.setItem("lifeblood_stock", JSON.stringify(stockData));
}

// ---------------- Login ----------------

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  var username = document.getElementById("adminUser").value;
  var password = document.getElementById("adminPass").value;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem("loggedIn", "yes");
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("adminPage").style.display = "block";
    loadEverything();
  } else {
    document.getElementById("loginError").innerHTML = "Wrong username or password";
  }
});

document.getElementById("logoutBtn").addEventListener("click", function () {
  sessionStorage.removeItem("loggedIn");
  location.reload();
});

// if already logged in before (page refresh), skip login page
if (sessionStorage.getItem("loggedIn") === "yes") {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("adminPage").style.display = "block";
  loadEverything();
}

// ---------------- Page Switching ----------------

function showPage(pageName) {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("donors").style.display = "none";
  document.getElementById("requests").style.display = "none";
  document.getElementById("stock").style.display = "none";

  document.getElementById(pageName).style.display = "block";
}

// ---------------- Load Everything ----------------

function loadEverything() {
  showDashboard();
  showDonorTable();
  showRequestList();
  showStockList();
}

// ---------------- Dashboard ----------------

function showDashboard() {
  document.getElementById("totalDonors").innerHTML = donorList.length;
  document.getElementById("totalRequests").innerHTML = requestList.length;

  var totalUnits = 0;
  for (var i = 0; i < bloodGroups.length; i++) {
    totalUnits = totalUnits + Number(stockData[bloodGroups[i]] || 0);
  }
  document.getElementById("totalUnits").innerHTML = totalUnits;
}

// ---------------- Donor Table ----------------

function showDonorTable() {
  var tableBody = document.getElementById("donorTableBody");
  tableBody.innerHTML = "";

  for (var i = 0; i < donorList.length; i++) {
    var d = donorList[i];

    var row = "<tr>";
    row += "<td>" + (d.name || "N/A") + "</td>";
    row += "<td>" + (d.blood || "N/A") + "</td>";
    row += "<td>" + (d.phone || "N/A") + "</td>";
    row += "<td>" + (d.location || "N/A") + "</td>";
    row += "<td>" + (d.availability || d.status || "Available") + "</td>";
    row += "<td>";
    row += "<button onclick='editDonor(" + d.id + ")'>Edit</button> ";
    row += "<button onclick='deleteDonor(" + d.id + ")'>Delete</button>";
    row += "</td>";
    row += "</tr>";

    tableBody.innerHTML += row;
  }
}

// ---------------- Add / Edit Donor Popup ----------------

document.getElementById("addDonorBtn").addEventListener("click", function () {
  document.getElementById("popupTitle").innerHTML = "Add Donor";
  document.getElementById("donorId").value = "";
  document.getElementById("donorName").value = "";
  document.getElementById("donorPhone").value = "";
  document.getElementById("donorBlood").value = "A+";
  document.getElementById("donorLocation").value = "";
  document.getElementById("donorStatus").value = "Available";
  document.getElementById("donorPopup").style.display = "flex";
});

document.getElementById("closePopupBtn").addEventListener("click", function () {
  document.getElementById("donorPopup").style.display = "none";
});

function editDonor(id) {
  var donor = null;
  for (var i = 0; i < donorList.length; i++) {
    if (donorList[i].id === id) {
      donor = donorList[i];
    }
  }
  if (donor == null) {
    return;
  }

  document.getElementById("popupTitle").innerHTML = "Edit Donor";
  document.getElementById("donorId").value = donor.id;
  document.getElementById("donorName").value = donor.name || "";
  document.getElementById("donorPhone").value = donor.phone || "";
  document.getElementById("donorBlood").value = donor.blood || "A+";
  document.getElementById("donorLocation").value = donor.location || "";
  document.getElementById("donorStatus").value = donor.availability || donor.status || "Available";
  document.getElementById("donorPopup").style.display = "flex";
}

function deleteDonor(id) {
  var sure = confirm("Are you sure you want to delete this donor?");
  if (sure == false) {
    return;
  }

  var newList = [];
  for (var i = 0; i < donorList.length; i++) {
    if (donorList[i].id !== id) {
      newList.push(donorList[i]);
    }
  }
  donorList = newList;

  saveData();
  showDonorTable();
  showDashboard();
}

document.getElementById("donorForm").addEventListener("submit", function (e) {
  e.preventDefault();

  var id = document.getElementById("donorId").value;
  var name = document.getElementById("donorName").value;
  var phone = document.getElementById("donorPhone").value;
  var blood = document.getElementById("donorBlood").value;
  var location = document.getElementById("donorLocation").value;
  var status = document.getElementById("donorStatus").value;

  if (id === "") {
    // add new donor
    var newDonor = {
      id: Date.now(),
      name: name,
      phone: phone,
      blood: blood,
      location: location,
      availability: status
    };
    donorList.push(newDonor);
  } else {
    // update existing donor
    for (var i = 0; i < donorList.length; i++) {
      if (donorList[i].id == id) {
        donorList[i].name = name;
        donorList[i].phone = phone;
        donorList[i].blood = blood;
        donorList[i].location = location;
        donorList[i].availability = status;
      }
    }
  }

  saveData();
  document.getElementById("donorPopup").style.display = "none";
  showDonorTable();
  showDashboard();
});

// ---------------- Blood Requests ----------------

function showRequestList() {
  var box = document.getElementById("requestList");
  box.innerHTML = "";

  if (requestList.length === 0) {
    box.innerHTML = "<p>No requests found.</p>";
    return;
  }

  for (var i = 0; i < requestList.length; i++) {
    var r = requestList[i];

    var card = "<div class='request-card'>";
    card += "<h4>" + (r.patient || "Patient") + "</h4>";
    card += "<p>Hospital: " + (r.hospital || "N/A") + "</p>";
    card += "<p>Blood Group: " + (r.blood || "N/A") + " | Units: " + (r.units || 1) + "</p>";
    card += "<p>Urgency: " + (r.urgency || "Normal") + "</p>";
    card += "<button onclick='deleteRequest(" + r.id + ")'>Delete</button>";
    card += "</div>";

    box.innerHTML += card;
  }
}

function deleteRequest(id) {
  var sure = confirm("Delete this request?");
  if (sure == false) {
    return;
  }

  var newList = [];
  for (var i = 0; i < requestList.length; i++) {
    if (requestList[i].id !== id) {
      newList.push(requestList[i]);
    }
  }
  requestList = newList;

  saveData();
  showRequestList();
  showDashboard();
}

// ---------------- Blood Stock ----------------

function showStockList() {
  var box = document.getElementById("stockList");
  box.innerHTML = "";

  for (var i = 0; i < bloodGroups.length; i++) {
    var group = bloodGroups[i];
    var units = stockData[group] || 0;

    var item = "<div class='stock-box'>";
    item += "<b>" + group + "</b><br>";
    item += "<input type='number' min='0' id='stock_" + group + "' value='" + units + "'>";
    item += "</div>";

    box.innerHTML += item;
  }
}

document.getElementById("saveStockBtn").addEventListener("click", function () {
  for (var i = 0; i < bloodGroups.length; i++) {
    var group = bloodGroups[i];
    var input = document.getElementById("stock_" + group);
    var value = Number(input.value);

    if (value < 0) {
      value = 0;
    }

    stockData[group] = value;
  }

  saveData();
  showDashboard();
  alert("Stock updated successfully!");
});