import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

async function sendApprovalEmail(targetEmail: string, password: string): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'onboarding@yourdomain.com',
      to: [targetEmail],
      subject: 'Your Account Has Been Approved',
      html: `<p>Hello,</p><p>Your account has been approved. Your temporary password is: <strong>${password}</strong></p><p>Please log in and change your password.</p>`,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to send email via Resend:', errorText);
    return false;
  }

  return true;
}

// async function sendApprovalEmail(targetEmail: string, password: string): Promise<boolean> {
//   const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

//   const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${SENDGRID_API_KEY}`,
//     },
//     body: JSON.stringify({
//       personalizations: [{ to: [{ email: targetEmail }] }],
//       from: { email: 'noreply@yourdomain.com' }, 
//       subject: 'Your Account Has Been Approved',
//       content: [{
//         type: 'text/html',
//         value: `<p>Hello,</p><p>Your account has been approved. Your temporary password is: <strong>${password}</strong></p>`
//       }],
//     }),
//   });

//   if (!res.ok) {
//     const errorText = await res.text();
//     console.error('Failed to send email via SendGrid:', errorText);
//     return false;
//   }

//   return true;
// }

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json();

    const { email, password, full_name } = body;

    if (!email || !password || !full_name) {
      console.error("Validation failed: Missing fields");
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name },
      email_confirm: true
    });

    if (error) {
      console.error("Supabase Admin createUser error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    sendApprovalEmail(body.email, body.password);

    console.log("User successfully created with ID:", data.user.id);
    return new Response(JSON.stringify({ id: data.user.id }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error("Edge Function caught internal error:", err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), { status: 500 });
  }
});