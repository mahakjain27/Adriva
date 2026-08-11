import type { Company } from "@/features/companies/types"
import type { Employee } from "@/features/employees/types"
import type { NfcCardDesign, NfcCardSide, NfcElementConfig } from "./types"

function element(overrides: Partial<NfcElementConfig> = {}): NfcElementConfig {
  return {
    visible: true,
    xPct: 50,
    yPct: 50,
    scale: 20,
    rotation: 0,
    bold: false,
    italic: false,
    text: "",
    ...overrides,
  }
}

/**
 * Sensible, non-overlapping starting layout seeded from the company's
 * brand color — the admin drags everything from here, this is just a
 * reasonable place to start rather than every card opening blank.
 */
export function buildDefaultCardDesign(company: Company, _employee: Employee): NfcCardDesign {
  const backgroundColor = company.brand?.color ?? company.brandColors.primary

  const front: NfcCardSide = {
    backgroundColor,
    backgroundImagePath: null,
    textColor: "#ffffff",
    fontFamily: "Playfair Display",
    elements: {
      logo: element({ xPct: 18, yPct: 20, scale: 28, visible: true }),
      companyName: element({ xPct: 50, yPct: 14, scale: 9, visible: false }),
      name: element({ xPct: 50, yPct: 62, scale: 18, visible: true, bold: true, italic: true }),
      designation: element({ xPct: 50, yPct: 76, scale: 11, visible: true }),
      // Hidden on the front by default — the QR lives on the back (see
      // below), where it already has full drag-to-move and Size-slider
      // resize like every other element (see DraggableElement/ElementsPanel).
      qr: element({ xPct: 84, yPct: 22, scale: 20, visible: false }),
    },
  }

  const back: NfcCardSide = {
    backgroundColor,
    backgroundImagePath: null,
    textColor: "#ffffff",
    fontFamily: "Playfair Display",
    elements: {
      qr: element({ xPct: 50, yPct: 48, scale: 38, visible: true }),
      companyName: element({ xPct: 50, yPct: 14, scale: 9, visible: true }),
      logo: element({ xPct: 18, yPct: 20, scale: 22, visible: false }),
      name: element({ xPct: 50, yPct: 62, scale: 16, visible: false }),
      designation: element({ xPct: 50, yPct: 76, scale: 10, visible: false }),
    },
  }

  return { front, back }
}
