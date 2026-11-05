# Taller El Pistón - Sistema de Gestión

Proyecto web para la gestión del taller mecánico "El Pistón". Consta de un servidor con PocketBase y un cliente en HTML, CSS y JavaScript.

## Estructura del proyecto
- `servidor/`: Contiene la carpeta `pb_data` con la base de datos y las colecciones de PocketBase.
- `cliente/`: Contiene el HTML, CSS y JS de la interfaz web.
- `capturas/`: Imágenes de la aplicación en funcionamiento.

## Requisitos previos
- Tener instalado [PocketBase](https://pocketbase.io/docs/).
- Un navegador web moderno.

## Cómo ejecutar el proyecto

**1. Iniciar el servidor:**
- Descarga PocketBase desde su página oficial.
- Extrae el ejecutable en la carpeta `servidor/`.
- Abre una terminal en `servidor/` y ejecuta:
  - Windows: `.\pocketbase.exe serve`
  - Linux/Mac: `./pocketbase serve`

**2. Abrir la aplicación:**
- Ve a la carpeta `cliente/` y abre el archivo `index.html` en tu navegador.
- Inicia sesión con las siguientes credenciales de prueba:
  - **Correo:** admin@test.com
  - **Contraseña:** 1234567890

## Decisiones de diseño
- **Base de datos:** Se crearon 8 colecciones (clientes, vehiculos, mecanicos, repuestos, ordenes, trabajos, repuestos_usados, pagos) con sus respectivas relaciones.
- **Autenticación:** Se utiliza la colección `_superusers` de PocketBase para el login.
- **Asincronía:** Todas las peticiones al servidor se realizan con `fetch` y `async/await`, manejando los errores con `try/catch`.
- **Interfaz:** Navegación tipo SPA (Single Page Application) sin recargar la página.