document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    let phone = document.getElementById("phone").value;
    const comments = document.getElementById("comments").value;
    const messageDiv = document.getElementById("message");



    const telegramMessage = `
  New Registration:
  Name: ${name}
  Phone: ${phone}
  Comments: ${comments || "No comments"}
  `;

    const botToken = "8097728064:AAE_JtxnYG1tfIcgNiIgTyvK8n7kO0B5Mvc";
    const chatId = "-1002493313713";
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
        }),
      });

      if (response.ok) {
        messageDiv.textContent = "Registration successful! ";
        messageDiv.className = "message success";
        this.reset(); // Clear form
      } else {
        throw new Error("Failed to send to Telegram");
      }
    } catch (error) {
      messageDiv.textContent = "Something went wrong. Please try again.";
      messageDiv.className = "message error";
    }
  });
