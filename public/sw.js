/*
  Minimal fallback Service Worker
  Purpose: Ensure /sw.js exists in production to avoid 404s.
  In production builds, vite-plugin-pwa may overwrite this file with a generated Workbox SW.
*/

self.addEventListener('install', () => {
  // Activate updated SW immediately
  self.skipWaiting?.()
})

self.addEventListener('activate', (event) => {
  // Take control of all clients ASAP
  event.waitUntil(Promise.resolve())
  self.clients && self.clients.claim?.()
})

self.addEventListener('fetch', (event) => {
  // Pass-through: do not interfere with network
  // This keeps behavior safe in case the generated SW is not present
  // If vite-plugin-pwa generates a SW, it will replace this file and handle caching.
  return
})
