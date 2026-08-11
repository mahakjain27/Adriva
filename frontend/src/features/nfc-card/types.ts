import type { CuratedFont } from "@/features/theme-builder/curatedFonts"

export type NfcElementId = "logo" | "qr" | "name" | "designation" | "companyName"

/** Text elements size via font-size (px); image elements (logo/qr) size via width (% of card). Shared by CardCanvas/DraggableElement (resize-handle range) and ElementsPanel (Size slider range) so both agree. */
export const TEXT_ELEMENT_IDS: NfcElementId[] = ["name", "designation", "companyName"]
export const SCALE_RANGE: Record<"image" | "text", { min: number; max: number }> = {
  image: { min: 10, max: 70 },
  text: { min: 8, max: 48 },
}

export type NfcCardSideName = "front" | "back"

export interface NfcElementConfig {
  visible: boolean
  /** Center position as a percentage of the card, 0-100 — resolution-independent so export at any pixel ratio lines up with the on-screen design. */
  xPct: number
  yPct: number
  /** Image elements (logo/qr): width as a percentage of card width. Text elements (name/designation/companyName): font size in px. */
  scale: number
  /** Degrees, 0-359. */
  rotation: number
  /** Text elements only. */
  bold: boolean
  italic: boolean
  /** Text elements only — overrides the default employee/company-derived text (name/designation/company name) when set. Empty string falls back to the default. */
  text: string
}

export interface NfcCardSide {
  backgroundColor: string
  /** Uploaded via UploadZone — overrides backgroundColor when set. */
  backgroundImagePath: string | null
  textColor: string
  /** One font for the whole side, not per element — reuses the Theme Builder's curated list. */
  fontFamily: CuratedFont
  elements: Record<NfcElementId, NfcElementConfig>
}

export interface NfcCardDesign {
  front: NfcCardSide
  back: NfcCardSide
}
