type MailRecipient = {
  emailAddress: {
    address: string
  }
}

async function getGraphAccessToken() {
  const tenantId = process.env.MS_GRAPH_TENANT_ID
  const clientId = process.env.MS_GRAPH_CLIENT_ID
  const clientSecret = process.env.MS_GRAPH_CLIENT_SECRET

  if (!tenantId || !clientId || !clientSecret) {
    return null
  }

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
  })

  if (!response.ok) {
    return null
  }

  const json = await response.json()
  return (json as { access_token?: string }).access_token ?? null
}

export async function sendTicketEmail(options: {
  subject: string
  html: string
  recipients: string[]
}) {
  const token = await getGraphAccessToken()
  const sender = process.env.MS_GRAPH_SENDER_EMAIL

  if (!token || !sender || options.recipients.length === 0) {
    return { sent: false }
  }

  const body = {
    message: {
      subject: options.subject,
      body: {
        contentType: 'HTML',
        content: options.html,
      },
      toRecipients: options.recipients.map<MailRecipient>((recipient) => ({
        emailAddress: { address: recipient },
      })),
    },
    saveToSentItems: true,
  }

  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return { sent: response.ok }
}