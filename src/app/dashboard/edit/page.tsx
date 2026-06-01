import { redirect } from "next/navigation";

export default function EditWebsitePage() {
  redirect("/dashboard?section=website");
}
