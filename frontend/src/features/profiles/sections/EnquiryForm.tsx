import { Send } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ICON_STROKE_WIDTH } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { SectionShell } from "./SectionShell"

export interface EnquiryFormSectionProps {
  /** The employee's primary email, already resolved off `ProfileData.quickActions` — section renders nothing without it. */
  enquiryEmail?: string
}

const fieldClassName =
  "w-full rounded-2xl border px-4 py-3.5 font-sans text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"

/** Client-side only — opens the visitor's email client, exactly like a plain `mailto:` link. No backend endpoint. */
export function EnquiryForm({ enquiryEmail }: EnquiryFormSectionProps) {
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  if (!enquiryEmail) return null

  function handleSubmit() {
    if (!name.trim() || !message.trim()) {
      toast.error("Please add your name and a short message.")
      return
    }
    const subject = `Enquiry from ${name}${company ? ` (${company})` : ""}`
    const body = `Name: ${name}\nCompany: ${company}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${message}`
    window.location.href = `mailto:${enquiryEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <SectionShell title="Send an Enquiry">
      <p className="mb-5 text-center text-caption text-[var(--muted-foreground)]">Enquiries are routed to {enquiryEmail}</p>
      <div className="flex flex-col gap-3">
        <input className={cn(fieldClassName, "border-[var(--border)] bg-[var(--card)]")} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={cn(fieldClassName, "border-[var(--border)] bg-[var(--card)]")} placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} />
        <input className={cn(fieldClassName, "border-[var(--border)] bg-[var(--card)]")} placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input
          type="email"
          className={cn(fieldClassName, "border-[var(--border)] bg-[var(--card)]")}
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          className={cn(fieldClassName, "min-h-[130px] resize-y border-[var(--border)] bg-[var(--card)]")}
          placeholder="How can we help?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-1 flex w-full items-center justify-center gap-2 py-4 font-heading font-semibold"
          style={{
            borderRadius: "var(--corner-radius, var(--radius-lg))",
            background: "var(--button-bg, var(--primary))",
            color: "var(--button-text, var(--primary-foreground))",
            border: "var(--button-border, none)",
          }}
        >
          <Send size={17} strokeWidth={ICON_STROKE_WIDTH} /> Submit Enquiry
        </button>
      </div>
    </SectionShell>
  )
}
