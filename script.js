
async function AiIntegration() {
  const script_prompt = `I am a speaking examiner of B2 level groups at Innovative Centre and I am examining a candidate named ${document.querySelector("#name").value}. Make the structure of test like IELTS test. Give me word-by-word script that can be followed. Do not use general terms like explain ${document.querySelector("#name").value} the test format, or Follows up with questions based on ${document.querySelector("#name").value} 's answer. Be very specific. By the way, do not include any other font rather than the basic one.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization":"Bearer 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",
          "HTTP-Referer": "http://localhost",
          "X-Title": "ExaminerAI"
      },
      body: JSON.stringify({
          model: "google/gemini-pro", 
          messages: [{ role: "user", content: script_prompt }]
      })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

document.addEventListener("DOMContentLoaded", function () {
  checkRegistrationStatus();
});

document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    if (localStorage.getItem("registeredUser")) return; // Prevent duplicate registration

    let name = document.getElementById("name").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let telegram = document.getElementById("telegram").value.trim();

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

    let response = await AiIntegration();  // ✅ Wait for the AI response

    let message = `📌 New Registration!\n👤 Name: ${name}\n📞 Phone: ${phone}\n✈️ Telegram: ${telegram}\n🆔 ID: ${candidateID}\n📅 Exam Date: ${formattedDate} \n Script: ${response}`;
    

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