import { redirect } from "next/navigation";
import { dashboardForRole } from "@/lib/permissions";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  redirect(session ? dashboardForRole(session.role) : "/login");
}
