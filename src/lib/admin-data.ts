import { MONTHLY_PLAN_AMOUNT } from "@/lib/billing";
import { hasSupabaseBrowserConfig } from "@/lib/env";
import { getSiteUrl } from "@/lib/domains";
import { sampleClientSite } from "@/lib/sample-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminClient = {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  subscriptionStatus: string;
  sitePublished: boolean;
  publishedAt: string | null;
  subdomain: string | null;
  customDomain: string | null;
  siteUrl: string | null;
  currentStep: number;
  completedSteps: number[];
  nextBillingDate: string | null;
  paymentFailedAt: string | null;
  subscriptionEndsAt: string | null;
  createdAt: string;
};

export type AdminEvent = {
  id: string;
  clientId: string | null;
  eventType: string;
  status: string;
  amount: number | null;
  createdAt: string;
};

export type AdminDashboardData = {
  mode: "local" | "supabase";
  authorized: boolean;
  clients: AdminClient[];
  events: AdminEvent[];
  stats: {
    totalClients: number;
    activeClients: number;
    publishedSites: number;
    pastDueClients: number;
    monthlyRevenue: number;
    onboardingCompletionRate: number;
  };
};

export async function isCurrentUserAdmin() {
  const supabase = createSupabaseAdminClient();
  if (!supabase || !hasSupabaseBrowserConfig()) return true;

  const user = (await createSupabaseServerClient().auth.getUser()).data.user;
  if (!user) return false;

  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return Boolean(data);
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return buildDashboardData({
      mode: "local",
      authorized: true,
      clients: [
        {
          id: sampleClientSite.id,
          businessName: sampleClientSite.businessName,
          ownerName: sampleClientSite.ownerName,
          email: sampleClientSite.email,
          subscriptionStatus: "active",
          sitePublished: true,
          publishedAt: new Date().toISOString(),
          subdomain: sampleClientSite.subdomain ?? null,
          customDomain: null,
          siteUrl: sampleClientSite.subdomain ? `/sites/${sampleClientSite.subdomain}` : null,
          currentStep: 6,
          completedSteps: [1, 2, 3, 4, 5, 6],
          nextBillingDate: null,
          paymentFailedAt: null,
          subscriptionEndsAt: null,
          createdAt: new Date().toISOString()
        },
        {
          id: "sample-past-due",
          businessName: "Jozi Air Masters",
          ownerName: "Lerato Naidoo",
          email: "accounts@joziair.example",
          subscriptionStatus: "past_due",
          sitePublished: true,
          publishedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
          subdomain: "jozi-air-masters",
          customDomain: null,
          siteUrl: "/sites/jozi-air-masters",
          currentStep: 6,
          completedSteps: [1, 2, 3, 4, 5, 6],
          nextBillingDate: null,
          paymentFailedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          subscriptionEndsAt: new Date(Date.now() + 86400000 * 5).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 35).toISOString()
        },
        {
          id: "sample-draft",
          businessName: "Durban Cool Works",
          ownerName: "Aisha Khan",
          email: "hello@durbancool.example",
          subscriptionStatus: "pending",
          sitePublished: false,
          publishedAt: null,
          subdomain: null,
          customDomain: null,
          siteUrl: null,
          currentStep: 4,
          completedSteps: [1, 2, 3, 4],
          nextBillingDate: null,
          paymentFailedAt: null,
          subscriptionEndsAt: null,
          createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
        }
      ],
      events: [
        {
          id: "evt-local-1",
          clientId: sampleClientSite.id,
          eventType: "site_published",
          status: "published",
          amount: null,
          createdAt: new Date().toISOString()
        }
      ]
    });
  }

  const authorized = await isCurrentUserAdmin();
  if (!authorized) {
    return buildDashboardData({ mode: "supabase", authorized: false, clients: [], events: [] });
  }

  const { data: clients } = await supabase
    .from("clients")
    .select(
      "id,business_name,trading_name,owner_name,email,subscription_status,site_published,published_at,subdomain,custom_domain,next_billing_date,payment_failed_at,subscription_ends_at,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  const clientIds = (clients ?? []).map((client) => client.id);
  const { data: progressRows } = clientIds.length
    ? await supabase
        .from("onboarding_progress")
        .select("client_id,current_step,completed_steps")
        .in("client_id", clientIds)
    : { data: [] };

  const progressByClient = new Map(
    (progressRows ?? []).map((row) => [
      row.client_id,
      {
        currentStep: Number(row.current_step ?? 1),
        completedSteps: Array.isArray(row.completed_steps) ? row.completed_steps : []
      }
    ])
  );

  const { data: events } = await supabase
    .from("billing_events")
    .select("id,client_id,event_type,status,amount,created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  return buildDashboardData({
    mode: "supabase",
    authorized: true,
    clients: (clients ?? []).map((client) => {
      const progress = progressByClient.get(client.id);
      const subdomain = client.subdomain ?? null;
      return {
        id: client.id,
        businessName: client.business_name ?? client.trading_name ?? "Unnamed client",
        ownerName: client.owner_name ?? "Unknown owner",
        email: client.email ?? "",
        subscriptionStatus: client.subscription_status ?? "pending",
        sitePublished: Boolean(client.site_published),
        publishedAt: client.published_at ?? null,
        subdomain,
        customDomain: client.custom_domain ?? null,
        siteUrl: subdomain ? getSiteUrl(subdomain) : null,
        currentStep: progress?.currentStep ?? (client.site_published ? 6 : 1),
        completedSteps: progress?.completedSteps ?? [],
        nextBillingDate: client.next_billing_date ?? null,
        paymentFailedAt: client.payment_failed_at ?? null,
        subscriptionEndsAt: client.subscription_ends_at ?? null,
        createdAt: client.created_at ?? new Date().toISOString()
      };
    }),
    events: (events ?? []).map((event) => ({
      id: event.id,
      clientId: event.client_id,
      eventType: event.event_type,
      status: event.status,
      amount: event.amount ? Number(event.amount) : null,
      createdAt: event.created_at
    }))
  });
}

function buildDashboardData({
  mode,
  authorized,
  clients,
  events
}: {
  mode: "local" | "supabase";
  authorized: boolean;
  clients: AdminClient[];
  events: AdminEvent[];
}): AdminDashboardData {
  const activeClients = clients.filter((client) => client.subscriptionStatus === "active").length;
  const completedClients = clients.filter((client) => client.currentStep >= 6 || client.sitePublished).length;

  return {
    mode,
    authorized,
    clients,
    events,
    stats: {
      totalClients: clients.length,
      activeClients,
      publishedSites: clients.filter((client) => client.sitePublished).length,
      pastDueClients: clients.filter((client) => client.subscriptionStatus === "past_due").length,
      monthlyRevenue: activeClients * MONTHLY_PLAN_AMOUNT,
      onboardingCompletionRate: clients.length ? Math.round((completedClients / clients.length) * 100) : 0
    }
  };
}
