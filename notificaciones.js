'use strict';

const btnNotificar = document.getElementById('btnNotificar');

const showNotification = () => {
    const permission = Notification.permission;
    
    if (permission === 'granted') {
        console.info("Notificaciones aceptadas");
        
        // Notificación con opciones completas
        let titulo = 'Notificación desde PWA';
        let opciones = {
            body: 'Esta es el cuerpo de la notificación',
            icon: 'img/icons/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: { 
                fecha: Date.now(), 
                info: 'Información adicional de la notificación' 
            },
            actions: [
                { action: 'aceptar', title: 'Aceptar' },
                { action: 'rechazar', title: 'Rechazar' }
            ]
        };
        
        let notificacion = new Notification(titulo, opciones);
        
        // Cerrar automáticamente después de 5 segundos
        setTimeout(() => {
            notificacion.close();
        }, 5000);
        
        // Manejar clics en la notificación
        notificacion.onclick = function() {
            console.log('Notificación clickeada');
            window.focus();
        };
        
    } else if (permission === 'default') {
        // Solicitar permiso si aún no se ha decidido
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.info("Permiso concedido, mostrando notificación...");
                // Llamar recursivamente para mostrar la notificación
                showNotification();
            } else {
                console.warn('El usuario no permitió las notificaciones');
                alert('Para recibir notificaciones, por favor permite los permisos cuando se te solicite.');
            }
        });
    } else {
        console.warn('El usuario denegó las notificaciones');
        alert('Los permisos de notificación están bloqueados. Puedes habilitarlos en la configuración de tu navegador.');
    }
};

// Función para inicializar notificaciones automáticas
const initAutoNotifications = () => {
    // Esperar a que la página esté completamente cargada
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Pequeño retraso para mejor experiencia de usuario
            setTimeout(() => {
                console.log('Inicializando notificaciones automáticas...');
                showNotification();
            }, 2000);
        });
    } else {
        // La página ya está cargada
        setTimeout(() => {
            console.log('Inicializando notificaciones automáticas...');
            showNotification();
        }, 2000);
    }
};

// Inicializar notificaciones automáticamente
initAutoNotifications();

// Hacer la función global para el botón HTML
window.showNotification = showNotification;

// También crear la función que menciona el error (por si acaso)
window.requestNotificationPermission = () => {
    return Notification.requestPermission();
};

// Mensaje de consola para verificar que el script se cargó
console.log('notificaciones.js cargado correctamente');
console.log('Estado de permisos:', Notification.permission);