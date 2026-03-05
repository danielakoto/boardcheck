// ── extension/license.js ───────────────────────────────────────────────────
// Drop this in your Chrome extension to verify license keys offline.
// Uses the Web Crypto API (built into browsers — no extra libraries needed).

const PUBLIC_KEY_PEM = `-----BEGIN RSA PUBLIC KEY-----
PASTE_YOUR_PUBLIC_KEY_HERE
-----END RSA PUBLIC KEY-----`;

// Convert PEM to CryptoKey
async function importPublicKey(pem) {
  const base64 = pem.replace(/-----.*?-----/g, "").replace(/\s/g, "");
  const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "spki",
    binary.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

// Verify a JWT (RS256) without any library
async function verifyLicenseKey(token) {
  try {
    const [headerB64, payloadB64, sigB64] = token.split(".");

    const sigBytes = Uint8Array.from(
      atob(sigB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const publicKey = await importPublicKey(PUBLIC_KEY_PEM);

    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      sigBytes,
      data
    );

    if (!valid) return null;

    const payload = JSON.parse(atob(payloadB64));
    return payload; // { soundId, email, purchasedAt }
  } catch (e) {
    return null;
  }
}

// ── Usage in your extension ────────────────────────────────────────────────

// Listen for the key coming back from the success page
window.addEventListener("message", async (event) => {
  if (event.data?.type !== "PURCHASE_SUCCESS") return;

  const { soundId, licenseKey } = event.data;
  const payload = await verifyLicenseKey(licenseKey);

  if (payload && payload.soundId === soundId) {
    // Save to local storage — no internet needed from here on
    chrome.storage.local.set({ [`license_${soundId}`]: licenseKey });
    console.log(`✅ ${soundId} unlocked!`);
  } else {
    console.warn("❌ Invalid license key");
  }
});

// Check if a sound is already purchased (fully offline)
async function isSoundUnlocked(soundId) {
  return new Promise((resolve) => {
    chrome.storage.local.get(`license_${soundId}`, async (result) => {
      const token = result[`license_${soundId}`];
      if (!token) return resolve(false);

      const payload = await verifyLicenseKey(token);
      resolve(payload?.soundId === soundId);
    });
  });
}

// ── Trigger a purchase ─────────────────────────────────────────────────────
async function buySound(soundId) {
  const res = await fetch("https://YOUR_BACKEND_URL/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ soundId }),
  });
  const { url } = await res.json();
  window.open(url, "_blank"); // opens Stripe checkout in new tab
}