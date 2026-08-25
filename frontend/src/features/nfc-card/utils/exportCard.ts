import { toPng } from "html-to-image"
import { jsPDF } from "jspdf"

/** Standard CR80 card size — the universal NFC/business card format. */
const CARD_WIDTH_MM = 85.6
const CARD_HEIGHT_MM = 53.98
/** Small print-sheet-style spacing between the two cards and around the composition — not the card design itself, just how the two captures are laid out on the page/canvas. */
const GAP_MM = 4
const MARGIN_MM = 4
/** On the 400×252px on-screen card, renders ~1600×1008px per side — well over 300dpi at the card's true 85.6×53.98mm size. */
const PIXEL_RATIO = 4

function download(dataUrl: string, filename: string) {
  const a = document.createElement("a")
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load captured card image"))
    img.src = dataUrl
  })
}

/**
 * Captures each side exactly as it currently renders in the Designer — no
 * re-layout, just a screenshot of the live node the caller passes in.
 *
 * `cacheBust` matters here: the company logo / employee photo `<img>` tags
 * render without a `crossOrigin` attribute, so their first load is a
 * no-cors request the browser caches without any CORS headers attached.
 * html-to-image then re-fetches the same URL in cors mode to inline it as a
 * data URL — Chromium can serve that second fetch from the same cache
 * entry, which fails the CORS check even though the backend's CORS config
 * is correct (a fresh request gets the right header). `cacheBust` appends a
 * throwaway query param so this fetch always misses the cache.
 */
async function captureSides(frontNode: HTMLElement, backNode: HTMLElement) {
  const [frontPng, backPng] = await Promise.all([
    toPng(frontNode, { pixelRatio: PIXEL_RATIO, cacheBust: true }),
    toPng(backNode, { pixelRatio: PIXEL_RATIO, cacheBust: true }),
  ])
  return { frontPng, backPng }
}

/**
 * Stacks the two already-captured card renders into one artwork — front on
 * top, back underneath, a small gap between them, like a printed card
 * sheet — and downloads it as a single PNG.
 */
export async function exportCardPng(frontNode: HTMLElement, backNode: HTMLElement, filename: string): Promise<void> {
  const { frontPng, backPng } = await captureSides(frontNode, backNode)
  const [frontImg, backImg] = await Promise.all([loadImage(frontPng), loadImage(backPng)])

  const pxPerMm = frontImg.width / CARD_WIDTH_MM
  const marginPx = Math.round(MARGIN_MM * pxPerMm)
  const gapPx = Math.round(GAP_MM * pxPerMm)
  const cardWidthPx = frontImg.width
  const cardHeightPx = frontImg.height

  const canvas = document.createElement("canvas")
  canvas.width = cardWidthPx + marginPx * 2
  canvas.height = cardHeightPx * 2 + gapPx + marginPx * 2

  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D context unavailable")
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(frontImg, marginPx, marginPx, cardWidthPx, cardHeightPx)
  ctx.drawImage(backImg, marginPx, marginPx + cardHeightPx + gapPx, cardWidthPx, cardHeightPx)

  download(canvas.toDataURL("image/png"), filename)
}

/**
 * Same front-over-back composition as `exportCardPng`, but as a single PDF
 * page sized to just fit the two cards plus margins — not a fixed A4 sheet
 * and not one page per side.
 */
export async function exportCardsPdf(frontNode: HTMLElement, backNode: HTMLElement, filename: string): Promise<void> {
  const { frontPng, backPng } = await captureSides(frontNode, backNode)

  const pageWidth = CARD_WIDTH_MM + MARGIN_MM * 2
  const pageHeight = CARD_HEIGHT_MM * 2 + GAP_MM + MARGIN_MM * 2

  const doc = new jsPDF({ unit: "mm", format: [pageWidth, pageHeight] })
  doc.addImage(frontPng, "PNG", MARGIN_MM, MARGIN_MM, CARD_WIDTH_MM, CARD_HEIGHT_MM)
  doc.addImage(backPng, "PNG", MARGIN_MM, MARGIN_MM + CARD_HEIGHT_MM + GAP_MM, CARD_WIDTH_MM, CARD_HEIGHT_MM)
  doc.save(filename)
}
