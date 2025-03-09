document.addEventListener("DOMContentLoaded", function () {
  checkRegistrationStatus();
});

let maintanence = document.querySelector(".maintenance");
let isMaintanence = false;

if(isMaintanence == false){
  maintanence.style.display = "none"
}else if(isMaintanence == true){
  maintanence.style.display = "flex"
}

document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    if (localStorage.getItem("registeredUser")) return;
    let telegram = document.getElementById("telegram").value.trim();
    let name = document.getElementById("name").value.trim();
    let phone = document.getElementById("phone").value.trim();

    if (!name || !phone || !telegram) {
      alert("All fields are required!");
      return;
    }

    if (!telegram.startsWith("@")) {
      telegram = "@" + telegram;
    }

    let candidateID = "PASS-" + Math.floor(10000 + Math.random() * 90000);
    let examDate = calculateExamTime();
    let formattedDate = formatExamDate(examDate);

    let userData = {
      name,
      phone,
      telegram,
      candidateID,
      examDate: formattedDate,
    };
    localStorage.setItem("registeredUser", JSON.stringify(userData));

    let message = `\ud83d\udccc New Registration!\n\ud83d\udc64 Name: ${name}\n\ud83d\udcde Phone: ${phone}\n✈️ Telegram: ${telegram}\n🆔 ID: ${candidateID}\n📅 Exam Date: ${formattedDate}`;

    let success = await sendTelegramMessage(message);
    if (success) checkRegistrationStatus();
    else alert("Failed to send registration. Please try again.");
  });

function checkRegistrationStatus() {
  let storedUser = localStorage.getItem("registeredUser");
  if (storedUser) {
    let user = JSON.parse(storedUser);
    let now = new Date();
    let examDate = new Date(user.examDate);

    if (now < examDate) {
      document.getElementById("registrationSection").classList.add("hidden");
      document.getElementById("examDetails").classList.remove("hidden");
      document.getElementById(
        "examDetails"
      ).innerText = `✅ Registered!\n🆔 ${user.candidateID}\n📅 Exam Date: ${user.examDate}`;
    } else {
      localStorage.removeItem("registeredUser");
      document.getElementById("registrationSection").classList.remove("hidden");
      document.getElementById("examDetails").classList.add("hidden");
    }
  }
}

function calculateExamTime() {
  let lastExamTime = localStorage.getItem("lastExamTime");
  let today = new Date();
  let examDate = new Date();
  let daysUntilSunday = (7 - today.getDay()) % 7;
  examDate.setDate(today.getDate() + daysUntilSunday);
  examDate.setHours(0, 0, 0, 0);

  if (lastExamTime) {
    let lastExamDate = new Date(lastExamTime);
    if (lastExamDate > today) {
      lastExamDate.setDate(lastExamDate.getDate());
      examDate = lastExamDate;
    }
  }

  localStorage.setItem("lastExamTime", examDate.toISOString());
  return examDate;
}

function formatExamDate(date) {
  let options = {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  };
  return date.toLocaleDateString("en-GB", options).replace(",", "");
}

async function sendTelegramMessage(message) {
  let botToken = "8097728064:AAE_JtxnYG1tfIcgNiIgTyvK8n7kO0B5Mvc";
  let chatId = "-1002493313713";

  let url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  let response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });

  let uri_api = "https://67c8964c0acf98d07087272b.mockapi.io/exams";

  let storedUser = localStorage.getItem("registeredUser");
  if (storedUser) {
    let user = JSON.parse(storedUser);
    let now = new Date();
    let examDate = new Date(user.examDate);

    if (now < examDate) {
      document.getElementById("registrationSection").classList.add("hidden");
      document.getElementById("examDetails").classList.remove("hidden");
      document.getElementById(
        "examDetails"
      ).innerText = `✅ Registered!\n🆔 ${user.candidateID}\n📅 Exam Date: ${user.examDate}`;
    } else {
      localStorage.removeItem("registeredUser");
      document.getElementById("registrationSection").classList.remove("hidden");
      document.getElementById("examDetails").classList.add("hidden");
    }

    axios.post(uri_api, {
      name: user.name,
      phoneNumber: user.phone,
      telegram: user.telegram,
      examDate: user.examDate,
      candidateID: user.candidateID,
    });
  }

  return response.ok;
}

