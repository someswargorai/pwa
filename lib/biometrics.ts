// A helper function to manage cookies
function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Convert a string to an ArrayBuffer
function strToArrayBuffer(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// Convert an ArrayBuffer to a string
function arrayBufferToStr(buf: ArrayBuffer): string {
  return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
}

export async function setupBiometrics(): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    console.error("WebAuthn is not supported on this device.");
    return false;
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "Nexus Notes", id: window.location.hostname },
        user: {
          id: new Uint8Array(16),
          name: "nexus_user",
          displayName: "Nexus User"
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000
      }
    }) as PublicKeyCredential;

    if (credential) {
      const idStr = arrayBufferToStr(credential.rawId);
      const b64Id = btoa(idStr);
      setCookie("nexus_biometric_id", b64Id);
      return true;
    }
  } catch (error) {
    console.error("Failed to setup biometrics:", error);
  }
  return false;
}

export async function unlockNote(): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    return false;
  }

  const savedIdBase64 = getCookie("nexus_biometric_id");
  if (!savedIdBase64) {
    console.error("No biometric credential found in cookies.");
    return false;
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  try {
    const rawIdStr = atob(savedIdBase64);
    const rawId = strToArrayBuffer(rawIdStr);

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        allowCredentials: [{
          type: "public-key",
          id: rawId,
          transports: ["internal"]
        }],
        userVerification: "required"
      }
    });

    if (assertion) {
      return true;
    }
  } catch (error) {
    console.error("Biometric verification failed", error);
  }
  
  return false;
}
