/**
 * ClientFlow - Gestión de Clientes
 * Lógica principal de la aplicación y almacenamiento local
 */

// Claves de almacenamiento
const STORAGE_KEY = 'clientflow_clients_data';

// Definición de estados válidos
const CLIENT_STATUSES = {
  prospecto: { label: 'Prospecto', class: 'status-prospecto', color: '#0284c7' },
  contactado: { label: 'Contactado', class: 'status-contactado', color: '#d97706' },
  negociacion: { label: 'En Negociación', class: 'status-negociacion', color: '#7c3aed' },
  activo: { label: 'Activo', class: 'status-activo', color: '#16a34a' },
  inactivo: { label: 'Inactivo', class: 'status-inactivo', color: '#64748b' }
};

// Datos de prueba iniciales
const INITIAL_CLIENTS = [
  {
    id: 'cli-1',
    name: 'Carlos Mendoza',
    company: 'Soluciones Tecnológicas S.A.',
    email: 'carlos.mendoza@solucionestec.com',
    phone: '+54 9 11 4589-2311',
    status: 'activo',
    notes: 'Cliente corporativo desde 2025. Contrato de soporte anual renovado.',
    createdAt: '2026-01-15T10:30:00.000Z'
  },
  {
    id: 'cli-2',
    name: 'Valentina Rossi',
    company: 'Inversiones del Sur',
    email: 'vrossi@inversionessur.cl',
    phone: '+56 9 8765-4321',
    status: 'negociacion',
    notes: 'Reunión de propuesta económica realizada. Esperando aprobación final.',
    createdAt: '2026-03-02T14:15:00.000Z'
  },
  {
    id: 'cli-3',
    name: 'Mateo Fernández',
    company: 'Logística Express',
    email: 'mateo@logisticaexpress.com',
    phone: '+52 55 1234-5678',
    status: 'contactado',
    notes: 'Mostró interés en la demo del módulo de automatización.',
    createdAt: '2026-04-10T09:00:00.000Z'
  },
  {
    id: 'cli-4',
    name: 'Lucía Gómez',
    company: 'Estudio Creativo Alpha',
    email: 'lucia.gomez@alphaestudio.com',
    phone: '+34 612 345 678',
    status: 'prospecto',
    notes: 'Registrada desde el formulario web. Requiere llamada de diagnóstico.',
    createdAt: '2026-04-21T16:45:00.000Z'
  }
];

// Clase que encapsula la lógica de negocio (testeable independientemente)
class ClientManager {
  constructor(storageAdapter = null) {
    this.storage = storageAdapter || (typeof localStorage !== 'undefined' ? localStorage : null);
    this.clients = [];
    this.init();
  }

  init() {
    if (this.storage) {
      const saved = this.storage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          this.clients = JSON.parse(saved);
        } catch (e) {
          console.error('Error al cargar datos locales, inicializando por defecto:', e);
          this.clients = [...INITIAL_CLIENTS];
          this.save();
        }
      } else {
        this.clients = [...INITIAL_CLIENTS];
        this.save();
      }
    } else {
      this.clients = [...INITIAL_CLIENTS];
    }
  }

  save() {
    if (this.storage) {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.clients));
    }
  }

  getAll() {
    return [...this.clients];
  }

  getById(id) {
    return this.clients.find(c => c.id === id) || null;
  }

  add(clientData) {
    if (!clientData.name || clientData.name.trim() === '') {
      throw new Error('El nombre del cliente es obligatorio');
    }
    const status = clientData.status && CLIENT_STATUSES[clientData.status] ? clientData.status : 'prospecto';
    const newClient = {
      id: 'cli-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      name: clientData.name.trim(),
      company: (clientData.company || '').trim(),
      email: (clientData.email || '').trim(),
      phone: (clientData.phone || '').trim(),
      status: status,
      notes: (clientData.notes || '').trim(),
      createdAt: new Date().toISOString()
    };
    this.clients.unshift(newClient);
    this.save();
    return newClient;
  }

  update(id, updatedData) {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Cliente no encontrado');
    }
    if (updatedData.name !== undefined && updatedData.name.trim() === '') {
      throw new Error('El nombre del cliente no puede estar vacío');
    }

    const current = this.clients[index];
    this.clients[index] = {
      ...current,
      name: updatedData.name !== undefined ? updatedData.name.trim() : current.name,
      company: updatedData.company !== undefined ? updatedData.company.trim() : current.company,
      email: updatedData.email !== undefined ? updatedData.email.trim() : current.email,
      phone: updatedData.phone !== undefined ? updatedData.phone.trim() : current.phone,
      status: updatedData.status && CLIENT_STATUSES[updatedData.status] ? updatedData.status : current.status,
      notes: updatedData.notes !== undefined ? updatedData.notes.trim() : current.notes
    };
    this.save();
    return this.clients[index];
  }

  updateStatus(id, newStatus) {
    if (!CLIENT_STATUSES[newStatus]) {
      throw new Error(`Estado inválido: "${newStatus}"`);
    }
    return this.update(id, { status: newStatus });
  }

  delete(id) {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Cliente no encontrado');
    }
    const removed = this.clients.splice(index, 1)[0];
    this.save();
    return removed;
  }

  filter(searchTerm = '', statusFilter = 'todos', sortBy = 'newest') {
    let result = [...this.clients];

    // Filtro por estado
    if (statusFilter && statusFilter !== 'todos') {
      result = result.filter(c => c.status === statusFilter);
    }

    // Búsqueda por término (nombre, empresa, email, teléfono)
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(c => 
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.company && c.company.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.phone && c.phone.toLowerCase().includes(term))
      );
    }

    // Ordenamiento
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }

  getStats() {
    const counts = {
      total: this.clients.length,
      prospecto: 0,
      contactado: 0,
      negociacion: 0,
      activo: 0,
      inactivo: 0
    };
    this.clients.forEach(c => {
      if (counts[c.status] !== undefined) {
        counts[c.status]++;
      }
    });
    return counts;
  }

  resetDemoData() {
    this.clients = [...INITIAL_CLIENTS];
    this.save();
  }
}

// Exportación para entornos Node.js / Testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ClientManager,
    CLIENT_STATUSES,
    INITIAL_CLIENTS
  };
}

// Inicialización de la Interfaz en el navegador
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const manager = new ClientManager();
    let currentFilter = 'todos';
    let currentSearch = '';
    let currentSort = 'newest';
    let editingClientId = null;

    // Elementos del DOM
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const sortBy = document.getElementById('sortBy');
    const clientsTableBody = document.getElementById('clientsTableBody');
    const emptyState = document.getElementById('emptyState');
    const totalCount = document.getElementById('totalCount');
    const prospectosCount = document.getElementById('prospectosCount');
    const negociacionCount = document.getElementById('negociacionCount');
    const activosCount = document.getElementById('activosCount');
    const inactivosCount = document.getElementById('inactivosCount');

    // Botones y modales
    const btnNewClient = document.getElementById('btnNewClient');
    const clientModal = document.getElementById('clientModal');
    const modalTitle = document.getElementById('modalTitle');
    const clientForm = document.getElementById('clientForm');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const btnExportCsv = document.getElementById('btnExportCsv');
    const btnResetData = document.getElementById('btnResetData');

    // Campos del formulario
    const inputName = document.getElementById('inputName');
    const inputCompany = document.getElementById('inputCompany');
    const inputEmail = document.getElementById('inputEmail');
    const inputPhone = document.getElementById('inputPhone');
    const selectStatus = document.getElementById('selectStatus');
    const inputNotes = document.getElementById('inputNotes');

    // Funciones de renderizado
    function render() {
      const clients = manager.filter(currentSearch, currentFilter, currentSort);
      const stats = manager.getStats();

      // Actualizar contadores
      if (totalCount) totalCount.textContent = stats.total;
      if (prospectosCount) prospectosCount.textContent = stats.prospecto;
      if (negociacionCount) negociacionCount.textContent = stats.negociacion;
      if (activosCount) activosCount.textContent = stats.activo;
      if (inactivosCount) inactivosCount.textContent = stats.inactivo;

      // Renderizar tabla
      clientsTableBody.innerHTML = '';
      if (clients.length === 0) {
        emptyState.style.display = 'block';
        clientsTableBody.parentElement.style.display = 'none';
      } else {
        emptyState.style.display = 'none';
        clientsTableBody.parentElement.style.display = 'table';

        clients.forEach(client => {
          const tr = document.createElement('tr');
          const statusInfo = CLIENT_STATUSES[client.status] || CLIENT_STATUSES.prospecto;

          // Generar opciones del selector rápido de estado
          const statusOptions = Object.keys(CLIENT_STATUSES).map(key => `
            <option value="${key}" ${client.status === key ? 'selected' : ''}>
              ${CLIENT_STATUSES[key].label}
            </option>
          `).join('');

          const formattedDate = new Date(client.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });

          tr.innerHTML = `
            <td>
              <div class="client-info">
                <span class="client-name">${escapeHtml(client.name)}</span>
                <span class="client-company">${escapeHtml(client.company || 'Sin empresa')}</span>
              </div>
            </td>
            <td>
              <div class="contact-info">
                <span class="contact-email">${escapeHtml(client.email || '—')}</span>
                <span class="contact-phone">${escapeHtml(client.phone || '—')}</span>
              </div>
            </td>
            <td>
              <select class="status-select-inline" data-id="${client.id}">
                ${statusOptions}
              </select>
            </td>
            <td>
              <span title="${escapeHtml(client.notes || '')}">
                ${client.notes ? escapeHtml(truncateText(client.notes, 40)) : '<span style="color:#94a3b8">—</span>'}
              </span>
            </td>
            <td>
              <span style="font-size: 0.8125rem; color: var(--text-muted);">${formattedDate}</span>
            </td>
            <td>
              <div class="actions-cell">
                <button class="btn-icon btn-edit" data-id="${client.id}" title="Editar cliente">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="btn-icon btn-delete" data-id="${client.id}" title="Eliminar cliente" style="color: var(--danger);">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </td>
          `;

          clientsTableBody.appendChild(tr);
        });
      }

      // Actualizar filtros en stat cards
      document.querySelectorAll('.stat-card').forEach(card => {
        const filter = card.getAttribute('data-status');
        if (filter === currentFilter) {
          card.classList.add('active-filter');
        } else {
          card.classList.remove('active-filter');
        }
      });
    }

    // Modal Handlers
    function openModal(isEdit = false, clientId = null) {
      editingClientId = clientId;
      if (isEdit && clientId) {
        const client = manager.getById(clientId);
        if (!client) return;
        modalTitle.textContent = 'Modificar Cliente';
        inputName.value = client.name || '';
        inputCompany.value = client.company || '';
        inputEmail.value = client.email || '';
        inputPhone.value = client.phone || '';
        selectStatus.value = client.status || 'prospecto';
        inputNotes.value = client.notes || '';
      } else {
        modalTitle.textContent = 'Nuevo Cliente';
        clientForm.reset();
        selectStatus.value = 'prospecto';
      }
      clientModal.classList.add('active');
      inputName.focus();
    }

    function closeModal() {
      clientModal.classList.remove('active');
      clientForm.reset();
      editingClientId = null;
    }

    // Toast Notifications
    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    // Eventos
    btnNewClient.addEventListener('click', () => openModal(false));
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);

    clientModal.addEventListener('click', (e) => {
      if (e.target === clientModal) closeModal();
    });

    clientForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const clientData = {
        name: inputName.value,
        company: inputCompany.value,
        email: inputEmail.value,
        phone: inputPhone.value,
        status: selectStatus.value,
        notes: inputNotes.value
      };

      try {
        if (editingClientId) {
          manager.update(editingClientId, clientData);
          showToast('Cliente actualizado correctamente', 'success');
        } else {
          manager.add(clientData);
          showToast('Cliente añadido con éxito', 'success');
        }
        closeModal();
        render();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // Delegación de eventos para la tabla
    clientsTableBody.addEventListener('change', (e) => {
      if (e.target.classList.contains('status-select-inline')) {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        try {
          manager.updateStatus(id, newStatus);
          showToast(`Estado actualizado a: ${CLIENT_STATUSES[newStatus].label}`, 'success');
          render();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });

    clientsTableBody.addEventListener('click', (e) => {
      const btnEdit = e.target.closest('.btn-edit');
      const btnDelete = e.target.closest('.btn-delete');

      if (btnEdit) {
        const id = btnEdit.getAttribute('data-id');
        openModal(true, id);
      } else if (btnDelete) {
        const id = btnDelete.getAttribute('data-id');
        const client = manager.getById(id);
        if (client && confirm(`¿Estás seguro de que deseas eliminar al cliente "${client.name}"?`)) {
          manager.delete(id);
          showToast('Cliente eliminado', 'success');
          render();
        }
      }
    });

    // Búsqueda y filtros
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      render();
    });

    statusFilter.addEventListener('change', (e) => {
      currentFilter = e.target.value;
      render();
    });

    sortBy.addEventListener('change', (e) => {
      currentSort = e.target.value;
      render();
    });

    // Clicks en las tarjetas de estadísticas para filtrar rápido
    document.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('click', () => {
        const status = card.getAttribute('data-status');
        currentFilter = status;
        statusFilter.value = status;
        render();
      });
    });

    // Exportar a CSV
    btnExportCsv.addEventListener('click', () => {
      const clients = manager.getAll();
      if (clients.length === 0) {
        showToast('No hay clientes para exportar', 'error');
        return;
      }

      const headers = ['ID', 'Nombre', 'Empresa', 'Email', 'Telefono', 'Estado', 'Notas', 'Fecha_Registro'];
      const rows = clients.map(c => [
        `"${c.id}"`,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.company || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.phone || '').replace(/"/g, '""')}"`,
        `"${CLIENT_STATUSES[c.status] ? CLIENT_STATUSES[c.status].label : c.status}"`,
        `"${(c.notes || '').replace(/"/g, '""')}"`,
        `"${c.createdAt}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `clientes_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Archivo CSV exportado exitosamente', 'success');
    });

    // Reiniciar datos de prueba
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('¿Restablecer los datos de ejemplo iniciales? Se sobrescribirán los cambios.')) {
          manager.resetDemoData();
          showToast('Datos de prueba cargados', 'success');
          render();
        }
      });
    }

    // Utilidades
    function escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    }

    // Render inicial
    render();
  });
}
