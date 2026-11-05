// URL base del servidor PocketBase
const PB_URL = 'http://127.0.0.1:8090';

// Elementos del DOM
const pantallaLogin = document.getElementById('pantalla-login');
const app = document.getElementById('app');
const formLogin = document.getElementById('form-login');
const errorLogin = document.getElementById('error-login');
const btnSalir = document.getElementById('btn-salir');
const navBtns = document.querySelectorAll('.nav-btn');
const vistas = document.querySelectorAll('.vista');

// Lógica para mostrar u ocultar la contraseña
const togglePassword = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassword.textContent = 'Ocultar';
    } else {
        passwordInput.type = 'password';
        togglePassword.textContent = 'Ver';
    }
});

// Inicio de sesión
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorLogin.textContent = '';

    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value;

    try {
        const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: email, password: password })
        });

        if (!res.ok) throw new Error('Credenciales incorrectas');

        const data = await res.json();
        localStorage.setItem('pb_token', data.token);
        
        pantallaLogin.classList.remove('activa');
        app.classList.remove('oculto');
        
        cargarVista('ordenes');

    } catch (error) {
        errorLogin.textContent = error.message;
    }
});

// Navegación entre vistas
navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const vista = e.target.getAttribute('data-vista');
        cargarVista(vista);
    });
});

function cargarVista(nombre) {
    vistas.forEach(v => v.classList.remove('activa'));
    navBtns.forEach(b => b.classList.remove('activo'));

    document.getElementById(`vista-${nombre}`).classList.add('activa');
    document.querySelector(`.nav-btn[data-vista="${nombre}"]`).classList.add('activo');

    if (nombre === 'ordenes') cargarOrdenes();
    if (nombre === 'clientes') cargarClientes();
    if (nombre === 'vehiculos') cargarVehiculos();
    if (nombre === 'repuestos') cargarRepuestos();
    if (nombre === 'mecanicos') cargarMecanicos();
}

// Petición GET
async function fetchAPI(endpoint) {
    const token = localStorage.getItem('pb_token');
    const res = await fetch(`${PB_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al obtener los datos');
    return await res.json();
}

// Petición POST
async function postAPI(endpoint, datos) {
    const token = localStorage.getItem('pb_token');
    const res = await fetch(`${PB_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al crear el registro');
    }
    return await res.json();
}

// Petición PATCH (actualizar)
async function patchAPI(endpoint, datos) {
    const token = localStorage.getItem('pb_token');
    const res = await fetch(`${PB_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error('Error al actualizar');
    return await res.json();
}

// Petición DELETE genérica
async function deleteAPI(endpoint) {
    const token = localStorage.getItem('pb_token');
    const res = await fetch(`${PB_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al eliminar');
    return true;
}

// Función auxiliar para crear tarjetas de forma segura (sin innerHTML con datos del usuario)
function crearTarjeta(titulo, datos, id, botonEditar, botonEliminar) {
    const div = document.createElement('div');
    div.className = 'lista-item';

    const h3 = document.createElement('h3');
    h3.textContent = titulo;
    div.appendChild(h3);

    datos.forEach(texto => {
        const p = document.createElement('p');
        p.textContent = texto;
        div.appendChild(p);
    });

    if (id) {
        const pId = document.createElement('p');
        pId.textContent = 'ID: ' + id;
        div.appendChild(pId);
    }

    const acciones = document.createElement('div');
    acciones.className = 'acciones';

    if (botonEditar) {
        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn-editar';
        btnEditar.textContent = botonEditar.texto;
        btnEditar.addEventListener('click', (e) => {
            e.stopPropagation();
            botonEditar.accion();
        });
        acciones.appendChild(btnEditar);
    }

    if (botonEliminar) {
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn-eliminar';
        btnEliminar.textContent = botonEliminar.texto;
        btnEliminar.addEventListener('click', (e) => {
            e.stopPropagation();
            botonEliminar.accion();
        });
        acciones.appendChild(btnEliminar);
    }

    div.appendChild(acciones);
    return div;
}

// Cargar órdenes
async function cargarOrdenes() {
    const contenedor = document.getElementById('lista-ordenes');
    contenedor.innerHTML = '<p>Cargando órdenes...</p>';
    try {
        const data = await fetchAPI('/api/collections/ordenes/records?expand=vehiculo,mecanico');
        contenedor.innerHTML = '';
        if (data.items.length === 0) { contenedor.innerHTML = '<p>No hay órdenes registradas.</p>'; return; }
        
        data.items.forEach(orden => {
            const tarjeta = crearTarjeta(
                `Orden #${orden.id.slice(0, 6)}`,
                [
                    `Problema: ${orden.problema}`,
                    `Estado: ${orden.estado}`,
                    `Vehículo: ${orden.expand?.vehiculo?.matricula || 'N/A'}`,
                    `Mecánico: ${orden.expand?.mecanico?.nombre || 'N/A'}`,
                    'Haz clic para ver detalles y añadir trabajos/repuestos'
                ],
                null,
                { texto: 'Editar Estado', accion: () => abrirModalEditar('/api/collections/ordenes/records', orden.id, orden) },
                { texto: 'Eliminar Orden', accion: () => abrirModalEliminarOrden(orden.id) }
            );
            tarjeta.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn-editar') && !e.target.classList.contains('btn-eliminar')) {
                    abrirDetalle(orden.id);
                }
            });
            contenedor.appendChild(tarjeta);
        });
    } catch (e) {
        contenedor.innerHTML = `<p class="mensaje-error">${e.message}</p>`;
    }
}

// Cargar clientes
async function cargarClientes() {
    const contenedor = document.getElementById('lista-clientes');
    contenedor.innerHTML = '<p>Cargando clientes...</p>';
    try {
        const data = await fetchAPI('/api/collections/clientes/records');
        contenedor.innerHTML = '';
        if (data.items.length === 0) { contenedor.innerHTML = '<p>No hay clientes.</p>'; return; }
        data.items.forEach(cliente => {
            const tarjeta = crearTarjeta(
                cliente.nombre,
                [`Tel: ${cliente.telefono}`, cliente.direccion || ''],
                cliente.id,
                { texto: 'Editar', accion: () => abrirModalEditar('/api/collections/clientes/records', cliente.id, cliente) },
                { texto: 'Eliminar', accion: () => abrirModalEliminar('/api/collections/clientes/records', cliente.id, cliente.nombre) }
            );
            contenedor.appendChild(tarjeta);
        });
    } catch (e) {
        contenedor.innerHTML = `<p class="mensaje-error">${e.message}</p>`;
    }
}

// Cargar vehículos
async function cargarVehiculos() {
    const contenedor = document.getElementById('lista-vehiculos');
    contenedor.innerHTML = '<p>Cargando vehículos...</p>';
    try {
        const data = await fetchAPI('/api/collections/vehiculos/records?expand=cliente');
        contenedor.innerHTML = '';
        if (data.items.length === 0) { contenedor.innerHTML = '<p>No hay vehículos.</p>'; return; }
        data.items.forEach(v => {
            const tarjeta = crearTarjeta(
                v.matricula,
                [
                    `Marca: ${v.marca || 'N/A'} | Modelo: ${v.modelo || 'N/A'}`,
                    `Año: ${v.anio || 'N/A'} | Kilometraje: ${v.kilometraje || 'N/A'}`,
                    `Dueño: ${v.expand?.cliente?.nombre || 'N/A'}`
                ],
                v.id,
                { texto: 'Editar', accion: () => abrirModalEditar('/api/collections/vehiculos/records', v.id, v) },
                { texto: 'Eliminar', accion: () => abrirModalEliminar('/api/collections/vehiculos/records', v.id, v.matricula) }
            );
            contenedor.appendChild(tarjeta);
        });
    } catch (e) {
        contenedor.innerHTML = `<p class="mensaje-error">${e.message}</p>`;
    }
}

// Cargar repuestos
async function cargarRepuestos() {
    const contenedor = document.getElementById('lista-repuestos');
    contenedor.innerHTML = '<p>Cargando repuestos...</p>';
    try {
        const data = await fetchAPI('/api/collections/repuestos/records');
        contenedor.innerHTML = '';
        if (data.items.length === 0) { contenedor.innerHTML = '<p>No hay repuestos.</p>'; return; }
        data.items.forEach(r => {
            let alerta = r.existencias <= 5 ? ' (Pocas existencias)' : '';
            const tarjeta = crearTarjeta(
                r.nombre + alerta,
                [`Código: ${r.codigo}`, `Precio: $${r.precio}`, `Existencias: ${r.existencias}`],
                r.id,
                { texto: 'Editar', accion: () => abrirModalEditar('/api/collections/repuestos/records', r.id, r) },
                { texto: 'Eliminar', accion: () => abrirModalEliminar('/api/collections/repuestos/records', r.id, r.nombre) }
            );
            contenedor.appendChild(tarjeta);
        });
    } catch (e) {
        contenedor.innerHTML = `<p class="mensaje-error">${e.message}</p>`;
    }
}

// Cargar mecánicos
async function cargarMecanicos() {
    const contenedor = document.getElementById('lista-mecanicos');
    contenedor.innerHTML = '<p>Cargando mecánicos...</p>';
    try {
        const data = await fetchAPI('/api/collections/mecanicos/records');
        contenedor.innerHTML = '';
        if (data.items.length === 0) { contenedor.innerHTML = '<p>No hay mecánicos.</p>'; return; }
        data.items.forEach(m => {
            const tarjeta = crearTarjeta(
                m.nombre,
                [m.activo ? 'Activo' : 'Inactivo'],
                m.id,
                { texto: 'Editar', accion: () => abrirModalEditar('/api/collections/mecanicos/records', m.id, m) },
                { texto: 'Eliminar', accion: () => abrirModalEliminar('/api/collections/mecanicos/records', m.id, m.nombre) }
            );
            contenedor.appendChild(tarjeta);
        });
    } catch (e) {
        contenedor.innerHTML = `<p class="mensaje-error">${e.message}</p>`;
    }
}

// Enviar formulario de Orden
document.getElementById('form-orden').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensaje = document.getElementById('mensaje-ordenes');
    mensaje.textContent = '';
    try {
        await postAPI('/api/collections/ordenes/records', {
            vehiculo: document.getElementById('orden-vehiculo').value.trim(),
            mecanico: document.getElementById('orden-mecanico').value.trim(),
            problema: document.getElementById('orden-problema').value.trim(),
            estado: document.getElementById('orden-estado').value,
            fecha_entrada: new Date().toISOString()
        });
        mensaje.textContent = 'Orden creada correctamente.';
        mensaje.style.color = 'green';
        e.target.reset();
        cargarOrdenes();
    } catch (error) {
        mensaje.textContent = error.message;
        mensaje.style.color = '#d9534f';
    }
});

// Enviar formulario de Cliente
document.getElementById('form-cliente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensaje = document.getElementById('mensaje-clientes');
    mensaje.textContent = '';
    try {
        await postAPI('/api/collections/clientes/records', {
            nombre: document.getElementById('cliente-nombre').value.trim(),
            telefono: document.getElementById('cliente-telefono').value.trim(),
            direccion: document.getElementById('cliente-direccion').value.trim()
        });
        mensaje.textContent = 'Cliente creado correctamente.';
        mensaje.style.color = 'green';
        e.target.reset();
        cargarClientes();
    } catch (error) {
        mensaje.textContent = error.message;
        mensaje.style.color = '#d9534f';
    }
});

// Enviar formulario de Vehículo
document.getElementById('form-vehiculo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensaje = document.getElementById('mensaje-vehiculos');
    mensaje.textContent = '';
    try {
        await postAPI('/api/collections/vehiculos/records', {
            matricula: document.getElementById('vehiculo-matricula').value.trim(),
            marca: document.getElementById('vehiculo-marca').value.trim(),
            modelo: document.getElementById('vehiculo-modelo').value.trim(),
            anio: parseInt(document.getElementById('vehiculo-anio').value) || null,
            kilometraje: parseInt(document.getElementById('vehiculo-kilometraje').value) || null,
            cliente: document.getElementById('vehiculo-cliente').value.trim()
        });
        mensaje.textContent = 'Vehículo creado correctamente.';
        mensaje.style.color = 'green';
        e.target.reset();
        cargarVehiculos();
    } catch (error) {
        mensaje.textContent = error.message;
        mensaje.style.color = '#d9534f';
    }
});

// Enviar formulario de Repuesto
document.getElementById('form-repuesto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensaje = document.getElementById('mensaje-repuestos');
    mensaje.textContent = '';
    try {
        await postAPI('/api/collections/repuestos/records', {
            nombre: document.getElementById('repuesto-nombre').value.trim(),
            codigo: document.getElementById('repuesto-codigo').value.trim(),
            precio: parseFloat(document.getElementById('repuesto-precio').value),
            existencias: parseInt(document.getElementById('repuesto-existencias').value)
        });
        mensaje.textContent = 'Repuesto creado correctamente.';
        mensaje.style.color = 'green';
        e.target.reset();
        cargarRepuestos();
    } catch (error) {
        mensaje.textContent = error.message;
        mensaje.style.color = '#d9534f';
    }
});

// Enviar formulario de Mecánico
document.getElementById('form-mecanico').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mensaje = document.getElementById('mensaje-mecanicos');
    mensaje.textContent = '';
    try {
        await postAPI('/api/collections/mecanicos/records', {
            nombre: document.getElementById('mecanico-nombre').value.trim(),
            activo: document.getElementById('mecanico-activo').value === 'true'
        });
        mensaje.textContent = 'Mecánico creado correctamente.';
        mensaje.style.color = 'green';
        e.target.reset();
        cargarMecanicos();
    } catch (error) {
        mensaje.textContent = error.message;
        mensaje.style.color = '#d9534f';
    }
});

// Lógica del Panel de Detalle de Orden
const panelDetalle = document.getElementById('panel-detalle');
const detalleTitulo = document.getElementById('detalle-titulo');
const detalleInfo = document.getElementById('detalle-info');
let ordenActualId = null;

document.getElementById('cerrar-detalle').addEventListener('click', () => {
    panelDetalle.classList.add('oculto');
});

async function abrirDetalle(id) {
    ordenActualId = id;
    panelDetalle.classList.remove('oculto');
    detalleTitulo.textContent = `Orden #${id.slice(0, 6)}`;
    detalleInfo.textContent = 'Cargando información...';
    
    document.getElementById('form-trabajo').reset();
    document.getElementById('form-repuesto-usado').reset();
    document.getElementById('form-pago').reset();
    document.getElementById('error-trabajo').textContent = '';
    document.getElementById('error-repuesto-usado').textContent = '';
    document.getElementById('error-pago').textContent = '';

    await actualizarDetalle();
}

async function actualizarDetalle() {
    if (!ordenActualId) return;

    // 1. Obtener la orden con su vehículo y mecánico
    const orden = await fetchAPI(`/api/collections/ordenes/records/${ordenActualId}?expand=vehiculo,mecanico`);
    detalleInfo.textContent = '';
    const p1 = document.createElement('p'); p1.textContent = 'Problema: ' + orden.problema; detalleInfo.appendChild(p1);
    const p2 = document.createElement('p'); p2.textContent = 'Vehículo: ' + (orden.expand?.vehiculo?.matricula || 'N/A'); detalleInfo.appendChild(p2);
    const p3 = document.createElement('p'); p3.textContent = 'Mecánico: ' + (orden.expand?.mecanico?.nombre || 'N/A'); detalleInfo.appendChild(p3);

    // 2. Cargar trabajos
    const trabajos = await fetchAPI(`/api/collections/trabajos/records?filter=(orden="${ordenActualId}")`);
    const listaTrabajos = document.getElementById('lista-trabajos');
    listaTrabajos.innerHTML = '';
    let totalManoObra = 0;
    if (trabajos.items.length === 0) {
        listaTrabajos.innerHTML = '<p>No hay trabajos registrados.</p>';
    } else {
        trabajos.items.forEach(t => {
            totalManoObra += t.precio_mano_obra;
            const div = document.createElement('div');
            div.className = 'lista-item';
            const p = document.createElement('p');
            p.textContent = `${t.descripcion}: $${t.precio_mano_obra}`;
            div.appendChild(p);
            listaTrabajos.appendChild(div);
        });
    }

    // 3. Cargar repuestos usados
    const usados = await fetchAPI(`/api/collections/repuestos_usados/records?filter=(orden="${ordenActualId}")&expand=repuesto`);
    const listaUsados = document.getElementById('lista-usados');
    listaUsados.innerHTML = '';
    let totalRepuestos = 0;
    if (usados.items.length === 0) {
        listaUsados.innerHTML = '<p>No hay repuestos usados.</p>';
    } else {
        usados.items.forEach(u => {
            const precio = u.expand?.repuesto?.precio || 0;
            totalRepuestos += precio * u.cantidad;
            const div = document.createElement('div');
            div.className = 'lista-item';
            const p = document.createElement('p');
            p.textContent = `${u.expand?.repuesto?.nombre || 'Repuesto'}: ${u.cantidad} x $${precio} = $${(precio * u.cantidad).toFixed(2)}`;
            div.appendChild(p);
            listaUsados.appendChild(div);
        });
    }

   // 4. Cargar pagos
    const pagos = await fetchAPI(`/api/collections/pagos/records?filter=(orden="${ordenActualId}")`);
    const listaPagos = document.getElementById('lista-pagos');
    listaPagos.innerHTML = '';
    let totalPagado = 0;
    if (pagos.items.length === 0) {
        listaPagos.innerHTML = '<p>No hay pagos registrados.</p>';
    } else {
        pagos.items.forEach(p => {
            totalPagado += p.monto;
            const div = document.createElement('div');
            div.className = 'lista-item';
            const pMonto = document.createElement('p');
            pMonto.textContent = `Pago: $${p.monto}`;
            div.appendChild(pMonto);
            listaPagos.appendChild(div);
        });
    }

    // 5. Calcular totales y saldo
    const totalOrden = totalManoObra + totalRepuestos;
    const saldo = totalOrden - totalPagado;

    document.getElementById('total-orden').textContent = totalOrden.toFixed(2);
    document.getElementById('total-pagado').textContent = totalPagado.toFixed(2);
    document.getElementById('saldo-pendiente').textContent = saldo.toFixed(2);
}

// Añadir trabajo
document.getElementById('form-trabajo').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('error-trabajo').textContent = '';
    try {
        await postAPI('/api/collections/trabajos/records', {
            orden: ordenActualId,
            descripcion: document.getElementById('trabajo-desc').value.trim(),
            precio_mano_obra: parseFloat(document.getElementById('trabajo-precio').value)
        });
        e.target.reset();
        await actualizarDetalle();
    } catch (error) {
        document.getElementById('error-trabajo').textContent = error.message;
    }
});

// Añadir repuesto usado (y restar existencias)
document.getElementById('form-repuesto-usado').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('error-repuesto-usado').textContent = '';
    const idRepuesto = document.getElementById('usado-repuesto').value.trim();
    const cantidad = parseInt(document.getElementById('usado-cantidad').value);

    try {
        const repuesto = await fetchAPI(`/api/collections/repuestos/records/${idRepuesto}`);
        
        if (repuesto.existencias < cantidad) {
            throw new Error('No hay suficientes existencias de este repuesto.');
        }

        await postAPI('/api/collections/repuestos_usados/records', {
            orden: ordenActualId,
            repuesto: idRepuesto,
            cantidad: cantidad
        });

        await patchAPI(`/api/collections/repuestos/records/${idRepuesto}`, {
            existencias: repuesto.existencias - cantidad
        });

        e.target.reset();
        await actualizarDetalle();
    } catch (error) {
        document.getElementById('error-repuesto-usado').textContent = error.message;
    }
});

// Registrar pago
document.getElementById('form-pago').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('error-pago').textContent = '';
    try {
        await postAPI('/api/collections/pagos/records', {
            orden: ordenActualId,
            monto: parseFloat(document.getElementById('pago-monto').value),
            fecha: new Date().toISOString()
        });
        e.target.reset();
        await actualizarDetalle();
    } catch (error) {
        document.getElementById('error-pago').textContent = error.message;
    }
});

// Lógica para Editar y Eliminar (Modal Genérico)
let registroEditando = null;
let registroEliminando = null;
let endpointEditando = '';
let endpointEliminando = '';

function abrirModalEditar(endpoint, id, campos) {
    endpointEditando = endpoint;
    registroEditando = id;
    
    const contenedorCampos = document.getElementById('campos-editar');
    contenedorCampos.innerHTML = '';
    
    for (let key in campos) {
        if (key === 'id' || key === 'collectionId' || key === 'collectionName' || key === 'created' || key === 'updated' || key === 'expand') continue;
        
        const label = document.createElement('label');
        label.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        
        const input = document.createElement('input');
        input.type = typeof campos[key] === 'number' ? 'number' : 'text';
        input.name = key;
        input.value = campos[key] || '';
        
        contenedorCampos.appendChild(label);
        contenedorCampos.appendChild(input);
    }
    
    document.getElementById('error-editar').textContent = '';
    document.getElementById('modal-editar').classList.remove('oculto');
}

function abrirModalEliminar(endpoint, id, nombre) {
    endpointEliminando = endpoint;
    registroEliminando = id;
    document.getElementById('texto-eliminar').textContent = `¿Estás seguro de que quieres eliminar "${nombre}"?`;
    document.getElementById('error-eliminar').textContent = '';
    document.getElementById('modal-eliminar').classList.remove('oculto');
}

// Modal especial para eliminar orden (con opción de inventario)
let idOrdenAEliminar = null;

function abrirModalEliminarOrden(id) {
    idOrdenAEliminar = id;
    document.getElementById('texto-eliminar-orden').textContent = `¿Estás seguro de que quieres eliminar la orden #${id.slice(0, 6)}?`;
    document.getElementById('devolver-inventario').checked = true;
    document.getElementById('error-eliminar-orden').textContent = '';
    document.getElementById('modal-eliminar-orden').classList.remove('oculto');
}

document.getElementById('cerrar-editar').addEventListener('click', () => {
    document.getElementById('modal-editar').classList.add('oculto');
});
document.getElementById('cerrar-eliminar').addEventListener('click', () => {
    document.getElementById('modal-eliminar').classList.add('oculto');
});
document.getElementById('cerrar-eliminar-orden').addEventListener('click', () => {
    document.getElementById('modal-eliminar-orden').classList.add('oculto');
});

document.getElementById('form-editar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = {};
    formData.forEach((value, key) => {
        datos[key] = isNaN(value) || value === '' ? value : Number(value);
    });
    
    try {
        await patchAPI(`${endpointEditando}/${registroEditando}`, datos);
        document.getElementById('modal-editar').classList.add('oculto');
        cargarVista(document.querySelector('.nav-btn.activo').getAttribute('data-vista'));
    } catch (error) {
        document.getElementById('error-editar').textContent = error.message;
    }
});

document.getElementById('btn-confirmar-eliminar').addEventListener('click', async () => {
    try {
        await deleteAPI(`${endpointEliminando}/${registroEliminando}`);
        document.getElementById('modal-eliminar').classList.add('oculto');
        cargarVista(document.querySelector('.nav-btn.activo').getAttribute('data-vista'));
    } catch (error) {
        document.getElementById('error-eliminar').textContent = error.message;
    }
});

// Confirmar eliminación de orden (con lógica de inventario)
document.getElementById('btn-confirmar-eliminar-orden').addEventListener('click', async () => {
    const devolver = document.getElementById('devolver-inventario').checked;
    const token = localStorage.getItem('pb_token');
    
    try {
        if (devolver) {
            const usados = await fetchAPI(`/api/collections/repuestos_usados/records?filter=(orden="${idOrdenAEliminar}")&expand=repuesto`);
            for (let u of usados.items) {
                const repuesto = u.expand?.repuesto;
                if (repuesto) {
                    const nuevasExistencias = repuesto.existencias + u.cantidad;
                    await patchAPI(`/api/collections/repuestos/records/${repuesto.id}`, {
                        existencias: nuevasExistencias
                    });
                }
            }
        }

        const trabajos = await fetchAPI(`/api/collections/trabajos/records?filter=(orden="${idOrdenAEliminar}")`);
        for (let t of trabajos.items) {
            await fetch(`${PB_URL}/api/collections/trabajos/records/${t.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }

        const usadosHijos = await fetchAPI(`/api/collections/repuestos_usados/records?filter=(orden="${idOrdenAEliminar}")`);
        for (let u of usadosHijos.items) {
            await fetch(`${PB_URL}/api/collections/repuestos_usados/records/${u.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }

        const pagos = await fetchAPI(`/api/collections/pagos/records?filter=(orden="${idOrdenAEliminar}")`);
        for (let p of pagos.items) {
            await fetch(`${PB_URL}/api/collections/pagos/records/${p.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }

        await fetch(`${PB_URL}/api/collections/ordenes/records/${idOrdenAEliminar}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        document.getElementById('modal-eliminar-orden').classList.add('oculto');
        cargarVista('ordenes');
    } catch (error) {
        document.getElementById('error-eliminar-orden').textContent = error.message;
    }
});

// Cerrar sesión
btnSalir.addEventListener('click', () => {
    localStorage.removeItem('pb_token');
    app.classList.add('oculto');
    pantallaLogin.classList.add('activa');
    formLogin.reset();
    passwordInput.type = 'password';
    togglePassword.textContent = 'Ver';
});
