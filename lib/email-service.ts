/**
 * Simplified email service that logs emails instead of sending them
 * This can be replaced with a real email service later
 */

type EmailOptions = {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; message: string }> {
  // Log the email details for demonstration purposes
  console.log("📧 Email would be sent with the following details:")
  console.log(`To: ${options.to}`)
  console.log(`Subject: ${options.subject}`)
  console.log(`From: ${options.from || "notifications@layerleap.com"}`)
  console.log(`Content: ${options.html.substring(0, 100)}...`)

  // In a real implementation, this would connect to an email service

  // Simulate successful sending
  return {
    success: true,
    message: "Email logged (would be sent in production)",
  }
}

/**
 * Function to send a welcome email to new subscribers
 */
export async function sendWelcomeEmail(
  email: string,
  unsubscribeUrl: string,
): Promise<{ success: boolean; message: string }> {
  const subject = "Welcome to LayerLeap Notifications!"

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6;">Welcome to LayerLeap Notifications!</h1>
      <p>Thank you for subscribing to LayerLeap notifications. You'll now receive updates about:</p>
      <ul>
        <li>New airdrop opportunities</li>
        <li>Guide updates and additions</li>
        <li>Tips for maximizing your airdrop farming</li>
      </ul>
      <p>Stay tuned for our next update!</p>
      <p>The LayerLeap Team</p>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #6b7280;">
        If you didn't subscribe to LayerLeap notifications, you can 
        <a href="${unsubscribeUrl}" style="color: #3b82f6;">unsubscribe here</a>.
      </p>
    </div>
  `

  return sendEmail({
    to: email,
    subject,
    html,
  })
}

/**
 * Function to send a notification email to subscribers
 */
export async function sendNotificationEmail(
  email: string,
  subject: string,
  content: string,
  unsubscribeUrl: string,
): Promise<{ success: boolean; message: string }> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6;">${subject}</h1>
      ${content}
      <p>Happy airdrop farming!</p>
      <p>The LayerLeap Team</p>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #6b7280;">
        You're receiving this email because you subscribed to LayerLeap notifications.
        <a href="${unsubscribeUrl}" style="color: #3b82f6;">Unsubscribe here</a>.
      </p>
    </div>
  `

  return sendEmail({
    to: email,
    subject,
    html,
  })
}
