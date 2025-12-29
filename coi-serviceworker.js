if(typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
    self.addEventListener("message", (ev) => {
        if (!ev.data) return;
        if (ev.data.type === "deregister") {
            self.registration.unregister().then(() => self.clients.matchAll().then(clients => clients.forEach(client => client.navigate(client.url))));
        }
    });
    self.addEventListener("fetch", function (event) {
        if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") return;
        event.respondWith(fetch(event.request).then((response) => {
            if (response.status === 0) return response;
            const newHeaders = new Headers(response.headers);
            newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
            newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
            return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
        }).catch((e) => console.error(e)));
    });
} else {
    if (!window.crossOriginIsolated) {
        navigator.serviceWorker.register(window.document.currentScript.src).then((registration) => {
            console.log("COI: Registering Service Worker and reloading to enable headers...");
            window.location.reload();
        }, (err) => console.error("COI: Failed to register service worker", err));
    } else {
        console.log("COI: Page is already isolated. Ready to go.");
    }
}
