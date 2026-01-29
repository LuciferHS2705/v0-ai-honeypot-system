import Link from "next/link"
import { Shield, CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center border border-success/20">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription className="mt-2">
              We&apos;ve sent you a confirmation link
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <Mail className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Please check your email inbox and click the confirmation link to activate your account and access the AI Honeypot System.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or try signing up again.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link href="/auth/sign-up">Try Again</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
