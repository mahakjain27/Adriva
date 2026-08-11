import {
  Briefcase,
  Calendar,
  Camera,
  CreditCard,
  Download,
  FileText,
  Gift,
  Globe,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Music2,
  Phone,
  PlayCircle,
  ShoppingBag,
  Star,
  Ticket,
  ThumbsUp,
  Video,
  type LucideIcon,
} from "lucide-react"

/**
 * Single source of truth for every icon a `ProfileQuickAction.icon` string
 * can resolve to — both `luxury/QuickActions.tsx` and `modern/QuickActions.tsx`
 * render from this map, and `IconPicker` (the admin's custom-button icon
 * picker) builds its grid from it too, so the picker and the renderer can
 * never drift out of sync.
 */
export const QUICK_ACTION_ICONS: Record<string, LucideIcon> = {
  // Contact — existing keys, unchanged.
  phone: Phone,
  whatsapp: MessageCircle,
  mail: Mail,
  globe: Globe,
  // Social — lucide-react dropped brand/logo icons some versions back, so
  // these are generic stand-ins rather than the real platform marks.
  linkedin: Briefcase,
  instagram: Camera,
  facebook: ThumbsUp,
  twitter: MessageSquare,
  youtube: PlayCircle,
  // Curated set for admin-defined custom buttons.
  calendar: Calendar,
  "shopping-bag": ShoppingBag,
  "credit-card": CreditCard,
  "file-text": FileText,
  "map-pin": MapPin,
  star: Star,
  gift: Gift,
  music: Music2,
  video: Video,
  link: Link2,
  download: Download,
  ticket: Ticket,
}

/** Only the curated set offered in the Custom Button icon picker — contact/social icons are assigned automatically by type, never hand-picked. */
export const CUSTOM_BUTTON_ICON_KEYS = [
  "calendar",
  "shopping-bag",
  "credit-card",
  "file-text",
  "map-pin",
  "star",
  "gift",
  "music",
  "video",
  "link",
  "download",
  "ticket",
] as const

export type CustomButtonIcon = (typeof CUSTOM_BUTTON_ICON_KEYS)[number]
