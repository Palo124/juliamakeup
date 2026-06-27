/** 48 mm thermal roll at 203 DPI (~8 dots/mm). */
const RECEIPT_WIDTH_MM = 48;
const RECEIPT_DPI = 203;
const RECEIPT_WIDTH_PX = Math.round((RECEIPT_WIDTH_MM / 25.4) * RECEIPT_DPI);
const RECEIPT_PADDING_PX = 12;
const RECEIPT_FONT_SIZE_PX = 22;
const RECEIPT_LINE_HEIGHT_PX = 28;
const RECEIPT_FONT = `${RECEIPT_FONT_SIZE_PX}px "Courier New", Courier, monospace`;

function wrapLine(ctx, line, maxWidth) {
  if (!line) {
    return [""];
  }

  const words = line.split(/(\s+)/);
  const wrapped = [];
  let current = "";

  for (const segment of words) {
    const candidate = current + segment;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
      continue;
    }

    wrapped.push(current);
    current = segment.trimStart() === segment ? segment : segment.trimStart();
  }

  if (current) {
    wrapped.push(current);
  }

  if (wrapped.length === 0) {
    return [""];
  }

  const result = [];
  for (const row of wrapped) {
    if (ctx.measureText(row).width <= maxWidth) {
      result.push(row);
      continue;
    }

    let chunk = "";
    for (const char of row) {
      const next = chunk + char;
      if (ctx.measureText(next).width > maxWidth && chunk) {
        result.push(chunk);
        chunk = char;
      } else {
        chunk = next;
      }
    }
    if (chunk) {
      result.push(chunk);
    }
  }

  return result;
}

function layoutReceiptLines(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of text.replace(/\r\n/g, "\n").split("\n")) {
    lines.push(...wrapLine(ctx, paragraph, maxWidth));
  }
  return lines.length ? lines : [""];
}

export function renderReceiptCanvas(text) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not supported.");
  }

  const maxTextWidth = RECEIPT_WIDTH_PX - RECEIPT_PADDING_PX * 2;
  ctx.font = RECEIPT_FONT;
  const lines = layoutReceiptLines(ctx, text, maxTextWidth);

  canvas.width = RECEIPT_WIDTH_PX;
  canvas.height = RECEIPT_PADDING_PX * 2 + lines.length * RECEIPT_LINE_HEIGHT_PX;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#000000";
  ctx.font = RECEIPT_FONT;
  ctx.textBaseline = "top";

  lines.forEach((line, index) => {
    const y = RECEIPT_PADDING_PX + index * RECEIPT_LINE_HEIGHT_PX;
    ctx.fillText(line, RECEIPT_PADDING_PX, y);
  });

  return canvas;
}

function downloadCanvasPng(canvas, filename) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("PNG export failed."));
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

function showButtonFeedback(button, label) {
  const original = button.textContent;
  button.textContent = label;
  button.disabled = true;
  window.setTimeout(() => {
    button.textContent = original;
    button.disabled = false;
  }, 1600);
}

export function initInvocePrinter() {
  const input = document.getElementById("invoce-printer-input");
  const preview = document.getElementById("invoce-printer-preview");
  const previewMeta = document.getElementById("invoce-printer-preview-meta");
  const downloadBtn = document.getElementById("invoce-printer-download");
  const clearBtn = document.getElementById("invoce-printer-clear");

  if (!input || !preview || !previewMeta || !downloadBtn || !clearBtn) {
    return;
  }

  let latestCanvas = null;

  function refreshPreview() {
    latestCanvas = renderReceiptCanvas(input.value);
    preview.src = latestCanvas.toDataURL("image/png");
    preview.alt = input.value.trim()
      ? "Náhľad faktúry 48 mm"
      : "Prázdny náhľad faktúry 48 mm";
    previewMeta.textContent = `${RECEIPT_WIDTH_MM} mm × ${(
      latestCanvas.height / RECEIPT_DPI * 25.4
    ).toFixed(1)} mm · ${RECEIPT_WIDTH_PX} × ${latestCanvas.height} px`;
    downloadBtn.disabled = !input.value.trim();
  }

  input.addEventListener("input", refreshPreview);
  input.addEventListener("paste", () => {
    window.requestAnimationFrame(refreshPreview);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    refreshPreview();
    input.focus();
  });

  downloadBtn.addEventListener("click", async () => {
    if (!latestCanvas || !input.value.trim()) {
      return;
    }

    try {
      await downloadCanvasPng(latestCanvas, "faktura-48mm.png");
      showButtonFeedback(downloadBtn, "Stiahnuté");
    } catch {
      showButtonFeedback(downloadBtn, "Chyba");
    }
  });

  refreshPreview();
}
