// 


const sendEmail = async ({ to, subject, html }) => {
  console.log("EMAIL: starting Brevo request");
  console.log("EMAIL: recipient:", to);
  console.log("EMAIL: API key exists:", !!process.env.BREVO_API_KEY);
  console.log("EMAIL: sender:", process.env.EMAIL_USER);

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "MentraLink",
          email: process.env.EMAIL_USER,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
      signal: controller.signal,
    });

    const responseBody = await response.text();

    console.log("EMAIL: Brevo status:", response.status);
    console.log("EMAIL: Brevo response:", responseBody);

    if (!response.ok) {
      throw new Error(
        `Email API error (${response.status}): ${responseBody}`
      );
    }
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = sendEmail;