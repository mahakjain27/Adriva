/** Opens a print dialog for just the QR code — not the whole dashboard. */
export function printQr(qrDataUrl: string, employeeName: string) {
  const printWindow = window.open("", "_blank", "width=420,height=560")
  if (!printWindow) return

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${employeeName} — Adriva QR</title>
        <style>
          body { display: flex; flex-direction: column; align-items: center; gap: 12px; font-family: system-ui, sans-serif; padding: 32px; }
          img { width: 280px; height: 280px; }
        </style>
      </head>
      <body>
        <img src="${qrDataUrl}" alt="QR code" />
        <p>${employeeName}</p>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
