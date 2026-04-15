self.addEventListener("push", (event) => {
  if (!event.data) return;
  const payload = event.data.json();
  const title = payload.title || "Boopy reminder";
  const options = {
    body: payload.body || "You have an upcoming renewal.",
    tag: payload.tag || "boopy-reminder",
    data: payload,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
