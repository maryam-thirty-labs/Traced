import { post } from "@/shared/lib/api/http";

// VAPID public key is served by the deployment; browsers call applicationServerKey.
// Until a VAPID key is generated and wired to env, subscriptions will fail gracefully.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(b64: string): Uint8Array {
  const padding = "=".repeat((4 - (b64.length % 4)) % 4);
  const base64 = (b64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

export async function subscribeToPush(reminderTime: string): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  if (!VAPID_PUBLIC_KEY) {
    console.warn("VAPID public key missing — skipping push subscription");
    return false;
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const reg = await registerServiceWorker();
  if (!reg) return false;

  const existing = await reg.pushManager.getSubscription();
  const keyBytes = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
  const sub = existing ?? (await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: keyBytes.buffer as ArrayBuffer,
  }));

  const json = sub.toJSON() as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return false;

  await post("/api/notifications/subscribe", {
    endpoint: json.endpoint,
    p256dhKey: json.keys.p256dh,
    authKey: json.keys.auth,
    userAgent: navigator.userAgent,
    reminderTime,
  });
  return true;
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await post("/api/notifications/unsubscribe", { endpoint: sub.endpoint });
  await sub.unsubscribe();
}
