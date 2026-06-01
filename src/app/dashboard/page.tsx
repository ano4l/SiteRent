import { WaasDashboard } from "@/components/dashboard/waas-dashboard";
import { getDashboardData } from "@/lib/dashboard-data";
import { getSiteUrl } from "@/lib/domains";

const sections = ["overview", "website", "view", "domain", "database", "business", "templates", "photos", "leads", "traffic", "billing", "reviews", "settings", "support"] as const;

export default async function DashboardPage({ searchParams }: { searchParams?: { section?: string } }) {
  const data = await getDashboardData();
  const siteUrl = data.client.subdomain ? getSiteUrl(data.client.subdomain) : null;
  const initialSection = sections.includes(searchParams?.section as (typeof sections)[number])
    ? (searchParams?.section as (typeof sections)[number])
    : "overview";

  return <WaasDashboard data={data} siteUrl={siteUrl} initialSection={initialSection} />;
}
