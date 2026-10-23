# ClientFlow - Sistema de Gestión de Clientes

Una aplicación web moderna, rápida y ligera diseñada para la administración y seguimiento integral de clientes según su ciclo de vida y estado.

## 🚀 Características Principales

- **Gestión de Clientes (CRUD Completo):**
  - Registro de nuevos clientes con datos de contacto (Nombre, Empresa, Email, Teléfono, Notas).
  - Modificación rápida de estado directamente desde la tabla o mediante el modal de edición.
  - Eliminación de registros con confirmación de seguridad.
- **Ciclo de Vida por Estados:**
  - 🎯 **Prospecto:** Primer contacto o cliente potencial no evaluado.
  - 📞 **Contactado:** Primer acercamiento o reunión inicial realizada.
  - 💼 **En Negociación:** Propuesta comercial enviada o en discusión.
  - ✨ **Activo:** Cliente cerrado con contrato o servicio vigente.
  - ⏸️ **Inactivo:** Relación en pausa o finalizada.
- **Filtros y Búsqueda en Tiempo Real:**
  - Búsqueda dinámica por nombre, empresa, email o teléfono.
  - Filtrado por estado con tarjetas de estadísticas interactivas.
  - Ordenamiento por fecha de creación o alfabéticamente.
- **Persistencia y Utilidades:**
  - Persistencia automática de datos en `localStorage` (sin necesidad de configurar base de datos externa).
  - Exportación de la lista completa a formato **CSV** para abrir en Excel o Google Sheets.
  - Datos de demostración listos para probar inmediatamente.

---

## 📁 Estructura del Proyecto

```
L:\test-antigravity\
├── index.html         # Interfaz de usuario responsiva
├── css\
│   └── styles.css     # Estilos modernos, temas y variables CSS
├── js\
│   └── app.js         # Lógica de negocio, estados y persistencia
├── test.js            # Suite de pruebas automatizadas (Node.js)
└── README.md          # Documentación del proyecto
```

---

## 💻 Cómo Ejecutar la Aplicación

1. **Directamente en tu navegador:**
   - Haz doble clic sobre el archivo `index.html` en tu explorador de archivos para abrirlo de inmediato en Chrome, Edge o tu navegador preferido.

2. **O usando un servidor local (opcional):**
   ```bash
   # Con Python
   python -m http.server 8000

   # Con Node.js (npx)
   npx serve .
   ```
   Luego abre `http://localhost:8000` en tu navegador.

---

## 🧪 Pruebas Automatizadas

La aplicación cuenta con una suite completa de pruebas unitarias y de integración que validan:
- Creación, modificación y eliminación de clientes.
- Transición y validación de estados (`prospecto`, `contactado`, `negociacion`, `activo`, `inactivo`).
- Filtrado, búsqueda y cálculo de estadísticas.
- Persistencia y recuperación en el almacenamiento.

Para ejecutar las pruebas:
```bash
node test.js
```
