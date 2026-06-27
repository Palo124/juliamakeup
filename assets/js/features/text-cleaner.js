/** Slovak diacritics → ASCII; preserves spaces, tabs, and line breaks. */
const SK_DIACRITICS = new Map([
  ["á", "a"],
  ["ä", "a"],
  ["č", "c"],
  ["ď", "d"],
  ["é", "e"],
  ["í", "i"],
  ["ľ", "l"],
  ["ĺ", "l"],
  ["ň", "n"],
  ["ó", "o"],
  ["ô", "o"],
  ["ŕ", "r"],
  ["š", "s"],
  ["ť", "t"],
  ["ú", "u"],
  ["ý", "y"],
  ["ž", "z"],
  ["Á", "A"],
  ["Ä", "A"],
  ["Č", "C"],
  ["Ď", "D"],
  ["É", "E"],
  ["Í", "I"],
  ["Ľ", "L"],
  ["Ĺ", "L"],
  ["Ň", "N"],
  ["Ó", "O"],
  ["Ô", "O"],
  ["Ŕ", "R"],
  ["Š", "S"],
  ["Ť", "T"],
  ["Ú", "U"],
  ["Ý", "Y"],
  ["Ž", "Z"],
]);

export function removeSlovakDiacritics(text) {
  let result = "";
  for (const char of text) {
    result += SK_DIACRITICS.get(char) ?? char;
  }
  return result;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.left = "-9999px";
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  helper.remove();
}

function showCopyFeedback(button, label) {
  const original = button.textContent;
  button.textContent = label;
  button.disabled = true;
  window.setTimeout(() => {
    button.textContent = original;
    button.disabled = false;
  }, 1600);
}

export function initTextCleaner() {
  const input = document.getElementById("text-cleaner-input");
  const output = document.getElementById("text-cleaner-output");
  const copyBtn = document.getElementById("text-cleaner-copy");
  const clearBtn = document.getElementById("text-cleaner-clear");

  if (!input || !output || !copyBtn || !clearBtn) {
    return;
  }

  function refreshOutput() {
    output.value = removeSlovakDiacritics(input.value);
  }

  input.addEventListener("input", refreshOutput);
  input.addEventListener("paste", () => {
    window.requestAnimationFrame(refreshOutput);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    output.value = "";
    input.focus();
  });

  copyBtn.addEventListener("click", async () => {
    if (!output.value) {
      return;
    }

    try {
      await copyText(output.value);
      showCopyFeedback(copyBtn, "Skopírované");
    } catch {
      showCopyFeedback(copyBtn, "Chyba");
    }
  });

  refreshOutput();
}
