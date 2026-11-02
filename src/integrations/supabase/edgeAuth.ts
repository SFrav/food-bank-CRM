export async function sendApprovalEmail(targetEmail: string, password: string): Promise<boolean> {
  // TODO: Replace with selected provider (e.g., SendGrid, Mailgun, AWS SES)
  console.log(`[Email Placeholder] Sending approval to ${targetEmail} with password: ${password}`);
  return true;
}

export default async function handler(req: Request, ctx: { env: Record<string, string> }) {
  const { email, password, full_name } = await req.json();

  if (!email || !password || !full_name) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const res = await fetch(`${ctx.env.SUPABASE_URL}/v1/auth/users`, {
    method: 'POST',
    body: JSON.stringify({ email, password, user_metadata: { full_name } }),
    headers: { 'Content-Type': 'application/json', 'apikey': ctx.env.SUPABASE_SERVICE_KEY }
  });

  if (!res.ok) {
    const err = await res.text();
    return new Response(JSON.stringify({ error: err || 'Auth creation failed' }), { status: res.status });
  }
  sendApprovalEmail(email, password);
  const { id } = await res.json();
  return new Response(JSON.stringify({ id }));
}