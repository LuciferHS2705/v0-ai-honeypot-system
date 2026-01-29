import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
            <CardDescription className="mt-2">
              Something went wrong during authentication
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <p className="text-sm text-muted-foreground">
            We encountered an error while trying to authenticate you. This could be due to an expired link, invalid credentials, or a temporary issue.
          </p>

          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/auth/login">Try Again</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
