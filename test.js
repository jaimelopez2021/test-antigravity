/**
 * Suite de pruebas automatizadas para ClientFlow
 * Verifica toda la lógica de gestión de clientes, estados y filtros
 */

const assert = require('assert');
const { ClientManager, CLIENT_STATUSES, INITIAL_CLIENTS } = require('./js/app.js');

// Mock de localStorage para simular persistencia en entorno Node
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

console.log('====================================================');
console.log('🧪 INICIANDO PRUEBAS DE CLIENTFLOW (APP DE CLIENTES)');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASÓ: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FALLÓ: ${description}`);
    console.error(`     Error: ${err.message}\n`);
  }
}

// Inicialización de Manager con MockStorage
const mockStorage = new MockStorage();
const manager = new ClientManager(mockStorage);

// 1. Verificación de inicialización y datos por defecto
test('1. Inicializa con los clientes de prueba cuando el storage está vacío', () => {
  const clients = manager.getAll();
  assert.strictEqual(clients.length, INITIAL_CLIENTS.length);
  assert.strictEqual(clients[0].name, INITIAL_CLIENTS[0].name);
});

// 2. Agregar un nuevo cliente
let newClientId = null;
test('2. Añade un nuevo cliente correctamente con estado inicial asignado', () => {
  const newClient = manager.add({
    name: 'Ana Martínez',
    company: 'Innovatech Global',
    email: 'ana@innovatech.io',
    phone: '+1 555-0199',
    status: 'prospecto',
    notes: 'Primer contacto en feria tecnológica.'
  });

  assert.ok(newClient.id, 'Debe generar un ID');
  assert.strictEqual(newClient.name, 'Ana Martínez');
  assert.strictEqual(newClient.status, 'prospecto');
  assert.strictEqual(newClient.company, 'Innovatech Global');
  newClientId = newClient.id;

  // Verificar que el total de clientes aumentó en 1
  assert.strictEqual(manager.getAll().length, INITIAL_CLIENTS.length + 1);
});

// 3. Validación de campos obligatorios
test('3. Rechaza la creación de un cliente sin nombre', () => {
  assert.throws(() => {
    manager.add({ name: '   ', company: 'Sin Nombre S.A.' });
  }, /El nombre del cliente es obligatorio/);
});

// 4. Modificar según el estado en el que se encuentre (Requerimiento clave)
test('4. Modifica el estado de un cliente a "contactado"', () => {
  const updated = manager.updateStatus(newClientId, 'contactado');
  assert.strictEqual(updated.status, 'contactado');
  assert.strictEqual(manager.getById(newClientId).status, 'contactado');
});

test('5. Modifica el estado de un cliente a "negociacion"', () => {
  const updated = manager.updateStatus(newClientId, 'negociacion');
  assert.strictEqual(updated.status, 'negociacion');
  assert.strictEqual(manager.getById(newClientId).status, 'negociacion');
});

test('6. Modifica el estado de un cliente a "activo"', () => {
  const updated = manager.updateStatus(newClientId, 'activo');
  assert.strictEqual(updated.status, 'activo');
  assert.strictEqual(manager.getById(newClientId).status, 'activo');
});

test('7. Modifica el estado de un cliente a "inactivo"', () => {
  const updated = manager.updateStatus(newClientId, 'inactivo');
  assert.strictEqual(updated.status, 'inactivo');
  assert.strictEqual(manager.getById(newClientId).status, 'inactivo');
});

test('8. Rechaza la asignación de un estado inválido', () => {
  assert.throws(() => {
    manager.updateStatus(newClientId, 'estado_fantasma');
  }, /Estado inválido/);
});

// 5. Modificar otros datos del cliente
test('9. Modifica datos completos del cliente (email, teléfono, notas)', () => {
  const updated = manager.update(newClientId, {
    email: 'ana.martinez@innovatech.io',
    phone: '+1 555-9999',
    notes: 'Cliente reactivado con nuevo plan.'
  });

  assert.strictEqual(updated.email, 'ana.martinez@innovatech.io');
  assert.strictEqual(updated.phone, '+1 555-9999');
  assert.strictEqual(updated.notes, 'Cliente reactivado con nuevo plan.');
});

// 6. Filtrar por estado
test('10. Filtra clientes según el estado seleccionado', () => {
  // Ponemos a Ana en 'activo'
  manager.updateStatus(newClientId, 'activo');

  const activos = manager.filter('', 'activo');
  assert.ok(activos.length >= 1);
  activos.forEach(c => assert.strictEqual(c.status, 'activo'));

  const prospectos = manager.filter('', 'prospecto');
  prospectos.forEach(c => assert.strictEqual(c.status, 'prospecto'));
});

// 7. Búsqueda por término
test('11. Busca clientes por coincidencia de nombre o empresa', () => {
  const searchResults = manager.filter('Innovatech', 'todos');
  assert.strictEqual(searchResults.length, 1);
  assert.strictEqual(searchResults[0].id, newClientId);
});

// 8. Estadísticas
test('12. Calcula estadísticas de recuento de estados con precisión', () => {
  const stats = manager.getStats();
  const allClients = manager.getAll();
  assert.strictEqual(stats.total, allClients.length);
  const sumStatuses = stats.prospecto + stats.contactado + stats.negociacion + stats.activo + stats.inactivo;
  assert.strictEqual(sumStatuses, stats.total);
});

// 9. Persistencia de datos en Storage
test('13. Persiste y recupera clientes desde el storage correctamente', () => {
  const newInstance = new ClientManager(mockStorage);
  const retrievedClient = newInstance.getById(newClientId);
  assert.ok(retrievedClient, 'El cliente debe existir en la nueva instancia tras persistirse');
  assert.strictEqual(retrievedClient.name, 'Ana Martínez');
  assert.strictEqual(retrievedClient.status, 'activo');
});

// 10. Eliminar cliente
test('14. Elimina un cliente existente', () => {
  const countBefore = manager.getAll().length;
  manager.delete(newClientId);
  assert.strictEqual(manager.getAll().length, countBefore - 1);
  assert.strictEqual(manager.getById(newClientId), null);
});

console.log('\n----------------------------------------------------');
console.log(`RESUMEN: ${passedTests} de ${totalTests} pruebas pasadas con éxito.`);
console.log('----------------------------------------------------');

if (passedTests === totalTests) {
  console.log('🎉 TODAS LAS PRUEBAS COMPLETADAS SATISFACTORIAMENTE.\n');
  process.exit(0);
} else {
  console.error('⚠️ ALGUNAS PRUEBAS FALLARON.\n');
  process.exit(1);
}
