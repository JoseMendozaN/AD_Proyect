// sw.js - Service Worker para Modern Dashboard
const CACHE_NAME = 'modern-dashboard-v1.3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/output.css',
  '/icons/mark.png',
  'https://cdn.jsdelivr.net/npm/@tailwindplus/elements@1'
];

// ===== INSTALACIÓN =====
self.addEventListener('install', event => {
  console.log('🟢 Service Worker: Instalando...');
  
  event.waitUntil(
    // 📍 CACHE STORAGE: Abre/Crea un cache específico en el sistema de Cache Storage
    caches.open(CACHE_NAME)  // ← CORREGIDO: Quitado el punto extra
      .then(cache => {
        // 📍 CACHE STORAGE: 'cache' es la instancia de TU cache específico
        console.log('📦 Service Worker: Cacheando recursos esenciales');
        
        // 📍 CACHE STORAGE: Guarda todos los archivos en TU cache
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalación completada');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch(error => {
        console.error('❌ Service Worker: Error en instalación', error);
      })
  );
});

// ===== ACTIVACIÓN =====
self.addEventListener('activate', event => {
  console.log('🟡 Service Worker: Activando...');
  
  event.waitUntil(
    // 📍 CACHE STORAGE: Obtiene todos los caches existentes en el sistema
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Eliminar caches antiguos
          if (cacheName !== CACHE_NAME) {
            // 📍 CACHE STORAGE: Elimina caches viejos del sistema
            console.log('🗑️ Service Worker: Eliminando cache antiguo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activación completada');
      return self.clients.claim(); // Tomar control inmediato
    })
  );
});

// ===== FETCH (Interceptar peticiones) =====
self.addEventListener('fetch', event => {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // 📍 CACHE STORAGE: Busca en TODOS los caches del sistema
    caches.match(event.request)
      .then(response => {
        // Si está en cache, devolverlo
        if (response) {
          // 📍 CACHE STORAGE: Encontrado en cache - sirve desde almacenamiento local
          console.log('💾 Service Worker: Sirviendo desde cache', event.request.url);
          return response;
        }

        // Si no está en cache, hacer petición y cachear
        return fetch(event.request)
          .then(response => {
            // Verificar que la respuesta es válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar la respuesta para cachear
            const responseToCache = response.clone();

            // 📍 CACHE STORAGE: Abre TU cache específico para guardar nuevo recurso
            caches.open(CACHE_NAME)
              .then(cache => {
                // 📍 CACHE STORAGE: Guarda el nuevo recurso en TU cache
                console.log('💾 Service Worker: Cacheando nuevo recurso', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('❌ Service Worker: Error en fetch', error);
            
            // Si es una página y falla, servir la página offline
            if (event.request.destination === 'document') {
              // 📍 CACHE STORAGE: Sirve página offline desde cache
              return caches.match('/index.html');
            }
            
            return new Response('🔴 Error de conexión', {
              status: 408,
              statusText: 'Offline'
            });
          });
      })
  );
});

// ===== MENSAJES =====
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🚀 Service Worker: Cargado correctamente');