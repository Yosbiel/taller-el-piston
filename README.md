# Taller El Pistón - Sistema de Gestión

Proyecto web para la gestión del taller mecánico "El Pistón". Consta de un servidor con PocketBase y un cliente en HTML, CSS y JavaScript.

## Autor
- **Nombre:** Yosbiel Alejandro Díaz Cala
- **Asignatura:** Programación Web
- **Año:** 3er Año de Ingeniería Informática

## Estructura del proyecto
- `servidor/`: Contiene las carpetas `pb_data` (base de datos) y `pb_migrations` (historial de cambios) de PocketBase.
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

## Funcionalidades implementadas

### 1. Autenticación
- Inicio de sesión con correo y contraseña usando la colección `_superusers` de PocketBase.
- Botón para mostrar u ocultar la contraseña.
- Cierre de sesión que elimina el token almacenado.

### 2. Gestión de Datos (CRUD completo)
- **Clientes:** Crear, listar, editar y eliminar.
- **Vehículos:** Crear, listar, editar y eliminar (con relación al cliente).
- **Mecánicos:** Crear, listar, editar y eliminar.
- **Repuestos:** Crear, listar, editar y eliminar (con alerta de pocas existencias).
- **Órdenes:** Crear, listar, editar estado y eliminar.

### 3. Panel de Detalle de Orden
- Al hacer clic en una orden, se abre un panel con toda la información.
- **Trabajos (Mano de obra):** Añadir descripción y precio.
- **Repuestos Usados:** Añadir repuesto y cantidad (descuenta automáticamente del inventario).
- **Pagos:** Registrar pagos parciales.
- **Cálculos automáticos:** Total de la orden, total pagado y saldo pendiente.

### 4. Eliminación Inteligente de Órdenes
- Al eliminar una orden, el sistema pregunta si se desean devolver los repuestos al inventario.
- Si el usuario acepta, las existencias se restauran automáticamente.
- Se eliminan en cascada los trabajos, repuestos usados y pagos asociados.

### 5. Interfaz de Usuario
- Navegación tipo SPA (Single Page Application) sin recargar la página.
- Modales propios para editar y eliminar (sin usar `alert`, `confirm` o `prompt`).
- Diseño responsivo y limpio.
- Validaciones y mensajes de error en la página.

## Decisiones de diseño

- **Base de datos:** Se crearon 8 colecciones (clientes, vehiculos, mecanicos, repuestos, ordenes, trabajos, repuestos_usados, pagos) con sus respectivas relaciones.
- **Asincronía:** Todas las peticiones al servidor se realizan con `fetch` y `async/await`, manejando los errores con `try/catch`.
- **Seguridad:** No se usa `innerHTML` con datos del usuario para evitar inyecciones de código (XSS). Se usa `textContent` y `createElement`.
- **Restricciones cumplidas:** No se usan `alert`, `confirm` ni `prompt`. Los modales son propios y se cierran con el botón o con la tecla Escape.
- **Separación de responsabilidades:** La lógica de negocio (cálculos, validaciones) está separada de la manipulación del DOM.

## Capturas

Puedes ver las capturas de la aplicación en funcionamiento en la carpeta [capturas](./capturas/).
