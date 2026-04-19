// Traced service worker — handles web-push events and opens the lesson page.
/* eslint-env serviceworker */

self.addEventListener("push", (event) => {
  const data = (event.data && event.data.json && event.data.json()) || {};
  const title = data.title || "Time to learn today \uD83E\uDDE0";
  const body = data.body || "Keep your streak going.";
  const options = {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/lesson" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/lesson";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
