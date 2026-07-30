import {get} from 'idb-keyval';


self.addEventListener("sync", (event) => {
  if (event.tag === "offline_form_submit") {
    event.waitUntil(
      (async () => 
      {
        try {
          const cachedDataFromOffline = await get("offline_form_submit");
          if (!cachedDataFromOffline) return;

          const response = await fetch("/api/submit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(cachedDataFromOffline),
          });

          const data = await response.json();

          const options = {
            body: "Your offline form was successfully submitted!",
            icon: "/icon-192.png",
            data: {
              url: "/form",
            },
          };

          if (data.success) {
            await self.registration.showNotification("Form Submitted", options);
          }
        } catch (error) {
          console.error("Background sync failed:", error);
          throw error; // Rethrow so the browser tries again later if network is still down
        }
      })()
    );
  }
});

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }
  console.log("🔔 PUSH EVENT RECEIVED IN WORKER!", data);
  const title = data.title || "Nexus Store";
  const options = {
    body: data.body || "New notification from Nexus!",
    icon: "/icon-192.png",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || "/";
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
