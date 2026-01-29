import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EnhancedDashboard } from "@/components/honeypot/enhanced-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <EnhancedDashboard user={user} />
}
