import { type FormEvent, type ReactNode, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { LockIcon } from "lucide-react"
import { ApiError, apiFetchAdmin } from "@/lib/apiClient"
import { getAdminKey, setAdminKey } from "@/lib/adminAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { scaleIn } from "@/components/motion/presets"

type Status = "checking" | "prompt" | "ready"

/** A lightweight, always-gated endpoint used only to confirm a key is valid — its response is discarded. */
function verifyAdminKey() {
  return apiFetchAdmin<unknown>("/api/companies")
}

/**
 * Everything under /dashboard renders through this. There's no login form
 * with an email/password — just a single access-key prompt, entered once
 * and remembered in this browser (see lib/adminAuth.ts for why that's
 * localStorage rather than a build-time env var). The key travels as
 * `Authorization: Bearer <key>` on every request apiFetchAdmin/apiUploadAdmin
 * make; the backend's require_admin dependency is the actual enforcement
 * point — this gate only avoids showing a broken dashboard while unauthorized.
 */
export function AdminAccessGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("checking")
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!getAdminKey()) {
      setStatus("prompt")
      return
    }
    verifyAdminKey()
      .then(() => setStatus("ready"))
      .catch(() => setStatus("prompt"))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!input.trim()) return
    setSubmitting(true)
    setError(null)
    setAdminKey(input.trim())
    try {
      await verifyAdminKey()
      setStatus("ready")
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? "Incorrect access key." : "Couldn't reach the server.")
    } finally {
      setSubmitting(false)
    }
  }

  if (status === "checking") return null

  if (status === "prompt") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-4">
        <motion.div initial="hidden" animate="visible" variants={scaleIn} className="w-full max-w-sm">
          <Card>
            <CardHeader className="items-center text-center">
              <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted">
                <LockIcon className="size-4 text-muted-foreground" />
              </div>
              <CardTitle>Adriva access</CardTitle>
              <CardDescription>Enter the access key for this dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="admin-key" className="sr-only">
                    Access key
                  </Label>
                  <Input
                    id="admin-key"
                    type="password"
                    autoFocus
                    autoComplete="off"
                    placeholder="Access key"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    aria-invalid={Boolean(error)}
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <Button type="submit" disabled={submitting || !input.trim()}>
                  {submitting ? "Checking…" : "Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
