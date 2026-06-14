import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PublishConfirmationInput = {
  clientId: string;
  businessName: string;
  recipient?: string | null;
  siteUrl: string;
  dashboardUrl: string;
  visualDirection?: string | null;
  nextBillingDate?: string | null;
};

export async function queuePublishConfirmationEmail(input: PublishConfirmationInput) {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !input.recipient) {
    return {
      queued: false,
      skippedReason: !input.recipient ? "No recipient email available." : "Supabase is not configured."
    };
  }

  const { error } = await supabase.from("email_events").insert({
    client_id: input.clientId,
    template_key: "website_ready_dashboard_handoff",
    recipient: input.recipient,
    provider: process.env.RESEND_API_KEY ? "resend" : process.env.SENDGRID_API_KEY ? "sendgrid" : "pending",
    status: "queued",
    provider_message_id: null
  });

  if (error) {
    return {
      queued: false,
      skippedReason: error.message
    };
  }

  return {
    queued: true
  };
}
