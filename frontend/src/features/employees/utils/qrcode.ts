import QRCode from "qrcode"

/** Data URL (PNG) of a QR code pointing at `url`. */
export function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, width: 320 })
}
