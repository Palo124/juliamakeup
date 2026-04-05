import { CONFIG } from "../config.js";
import { t } from "../i18n.js";

export async function postToGoogleSheets(payload) {
  const response = await fetch(CONFIG.googleScriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(t("toast.syncFailed"));
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(t("toast.badResponse"));
  }
}

export async function syncAction(action, data) {
  if (CONFIG.useGoogleSheets && CONFIG.googleScriptUrl) {
    const result = await postToGoogleSheets({ action, ...data });

    if (result && result.ok === false) {
      throw new Error(result.message || t("toast.sheetsFailed"));
    }

    return result;
  }

  return { ok: true, mode: "local" };
}
