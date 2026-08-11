import { forwardRef, useRef, type ReactNode } from "react"
import type { Company } from "@/features/companies/types"
import type { Employee } from "@/features/employees/types"
import { CURATED_FONT_STACKS } from "@/features/theme-builder/curatedFonts"
import { DraggableElement } from "./DraggableElement"
import { SCALE_RANGE, TEXT_ELEMENT_IDS, type NfcCardSide, type NfcElementConfig, type NfcElementId } from "../types"

export const CARD_WIDTH_PX = 400
export const CARD_HEIGHT_PX = 252

export interface CardCanvasProps {
  side: NfcCardSide
  company: Company
  employee: Employee
  qrDataUrl: string | undefined
  selectedElementId: NfcElementId | null
  onSelectElement: (id: NfcElementId | null) => void
  onUpdateElement: (id: NfcElementId, patch: Partial<NfcElementConfig>) => void
}

/**
 * Renders one physical side of the card at its true on-screen editing size
 * (`CARD_WIDTH_PX`×`CARD_HEIGHT_PX`, same aspect ratio as the real 85.6×54mm
 * card). The forwarded ref is the exact node `exportCard.ts` captures —
 * always fully rendered/interactive regardless of whether this side is the
 * currently active tab, so the designer page can keep both sides mounted
 * (just positioned off-screen when inactive) and export either one at any
 * time without a re-render.
 */
export const CardCanvas = forwardRef<HTMLDivElement, CardCanvasProps>(function CardCanvas(
  { side, company, employee, qrDataUrl, selectedElementId, onSelectElement, onUpdateElement },
  forwardedRef,
) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const content: Record<NfcElementId, ReactNode> = {
    logo: company.logoPath ? (
      <img
        src={company.logoPath}
        alt=""
        draggable={false}
        style={{ width: `${side.elements.logo.scale}%` }}
        className="object-contain"
      />
    ) : (
      <div
        className="flex items-center justify-center rounded bg-white/20 px-3 py-1.5 text-[10px] font-medium"
        style={{ width: `${side.elements.logo.scale}%`, aspectRatio: "2 / 1", color: side.textColor }}
      >
        LOGO
      </div>
    ),
    qr: qrDataUrl ? (
      <img
        src={qrDataUrl}
        alt=""
        draggable={false}
        style={{ width: `${side.elements.qr.scale}%` }}
        className="aspect-square rounded bg-white p-1"
      />
    ) : (
      <div
        className="flex aspect-square items-center justify-center rounded bg-white/80 text-[9px] text-black"
        style={{ width: `${side.elements.qr.scale}%` }}
      >
        QR
      </div>
    ),
    name: (
      <p
        style={{
          fontSize: side.elements.name.scale,
          color: side.textColor,
          fontFamily: CURATED_FONT_STACKS[side.fontFamily],
          fontWeight: side.elements.name.bold ? 700 : 600,
          fontStyle: side.elements.name.italic ? "italic" : "normal",
        }}
        className="whitespace-nowrap"
      >
        {side.elements.name.text || employee.name}
      </p>
    ),
    designation: (
      <p
        style={{
          fontSize: side.elements.designation.scale,
          color: side.textColor,
          fontFamily: CURATED_FONT_STACKS[side.fontFamily],
          fontWeight: side.elements.designation.bold ? 700 : 400,
          fontStyle: side.elements.designation.italic ? "italic" : "normal",
        }}
        className="whitespace-nowrap"
      >
        {side.elements.designation.text || employee.designation}
      </p>
    ),
    companyName: (
      <p
        style={{
          fontSize: side.elements.companyName.scale,
          color: side.textColor,
          fontFamily: CURATED_FONT_STACKS[side.fontFamily],
          fontWeight: side.elements.companyName.bold ? 700 : 500,
          fontStyle: side.elements.companyName.italic ? "italic" : "normal",
        }}
        className="tracking-wide whitespace-nowrap uppercase"
      >
        {side.elements.companyName.text || company.name}
      </p>
    ),
  }

  return (
    <div
      ref={(node) => {
        canvasRef.current = node
        if (typeof forwardedRef === "function") forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      }}
      className="relative shrink-0 overflow-hidden rounded-xl border border-[var(--border)] shadow-lg"
      style={{
        width: CARD_WIDTH_PX,
        height: CARD_HEIGHT_PX,
        backgroundColor: side.backgroundColor,
        backgroundImage: side.backgroundImagePath ? `url(${side.backgroundImagePath})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={() => onSelectElement(null)}
    >
      {(Object.keys(side.elements) as NfcElementId[])
        .filter((id) => side.elements[id].visible)
        .map((id) => {
          const isText = TEXT_ELEMENT_IDS.includes(id)
          const range = SCALE_RANGE[isText ? "text" : "image"]
          return (
            <DraggableElement
              key={id}
              xPct={side.elements[id].xPct}
              yPct={side.elements[id].yPct}
              rotation={side.elements[id].rotation}
              scale={side.elements[id].scale}
              minScale={range.min}
              maxScale={range.max}
              rotatable={id !== "qr"}
              canvasRef={canvasRef}
              selected={selectedElementId === id}
              onSelect={() => onSelectElement(id)}
              onPositionChange={(x, y) => onUpdateElement(id, { xPct: x, yPct: y })}
              onScaleChange={(scale) => onUpdateElement(id, { scale })}
              onRotationChange={(rotation) => onUpdateElement(id, { rotation })}
            >
              {content[id]}
            </DraggableElement>
          )
        })}
    </div>
  )
})
