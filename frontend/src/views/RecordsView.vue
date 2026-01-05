<template>
  <v-container class="pa-4">
    <v-row>
      <v-col cols="12">
        <v-card class="elevation-0" variant="flat">
          <v-card-title class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center gap-3 pa-4">
            <span class="text-h5 font-weight-light">Registros</span>
            <div class="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
              <input
                ref="fileInput"
                type="file"
                accept=".pdf,application/pdf"
                style="display: none"
                @change="handleFileSelect"
              />
              <v-btn
                color="primary"
                prepend-icon="mdi-upload"
                @click="fileInput?.click()"
                :loading="ingesting"
                size="small"
                class="flex-grow-1 flex-sm-grow-0"
              >
                <span class="d-none d-sm-inline">Importar PDF</span>
                <span class="d-sm-none">Importar</span>
              </v-btn>
              <v-btn
                color="success"
                prepend-icon="mdi-plus"
                @click="openDialog"
                size="small"
                class="flex-grow-1 flex-sm-grow-0"
              >
                <span class="d-none d-sm-inline">Nuevo Registro</span>
                <span class="d-sm-none">Nuevo</span>
              </v-btn>
            </div>
          </v-card-title>
          
          <v-card-text>
            <!-- Barra de búsqueda y ordenamiento -->
            <div class="d-flex flex-column flex-md-row gap-3 mb-4">
              <v-text-field
                v-model="searchQuery"
                prepend-inner-icon="mdi-magnify"
                label="Buscar registros..."
                variant="outlined"
                density="compact"
                clearable
                hide-details
                :loading="isSearching"
                loading-text="Buscando..."
                class="flex-grow-1 search-field"
                color="primary"
              ></v-text-field>
              
              <v-select
                v-model="selectedSort"
                :items="sortOptions"
                label="Ordenar por"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                return-object
                class="flex-grow-1 flex-md-grow-0 sort-field"
                style="min-width: 200px;"
                color="primary"
                @update:model-value="handleSortChange"
              ></v-select>
            </div>
            
            <!-- Tabla responsiva -->
            <div class="d-none d-md-block">
              <v-data-table
                :headers="headers"
                :items="filteredRecords"
                :loading="loading"
                item-key="id"
                v-model:sort-by="sortBy"
                class="elevation-0 dark-table"
                :items-per-page="25"
                :items-per-page-options="[10, 25, 50, 100]"
              >
                <template v-slot:item.amount="{ item }">
                  ${{ formatAmount(item.amount) }}
                </template>
                
                <template v-slot:item.date="{ item }">
                  {{ formatDate(item.date) }}
                </template>
                
                <template v-slot:item.actions="{ item }">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    @click="editRecord(item)"
                    class="me-2"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    color="error"
                    @click="deleteRecord(item.id)"
                  ></v-btn>
                </template>
              </v-data-table>
            </div>
            
            <!-- Vista móvil (cards) -->
            <div class="d-md-none">
              <v-card
                v-for="item in filteredRecords"
                :key="item.id"
                class="mb-3"
                variant="outlined"
              >
                <v-card-text>
                  <div class="d-flex justify-space-between align-start mb-2">
                    <div>
                      <div class="text-subtitle-1 font-weight-bold">{{ item.sourceId }}</div>
                      <div class="text-caption text-medium-emphasis">{{ formatDate(item.date) }}</div>
                    </div>
                    <div class="d-flex gap-1">
                      <v-btn
                        icon="mdi-pencil"
                        size="small"
                        variant="text"
                        @click="editRecord(item)"
                      ></v-btn>
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        color="error"
                        variant="text"
                        @click="deleteRecord(item.id)"
                      ></v-btn>
                    </div>
                  </div>
                  <v-divider class="my-2"></v-divider>
                  <div class="d-flex flex-column gap-1">
                    <div class="d-flex justify-space-between">
                      <span class="text-caption text-medium-emphasis">Categoría:</span>
                      <span class="text-body-2 font-weight-medium">{{ item.category }}</span>
                    </div>
                    <div class="d-flex justify-space-between">
                      <span class="text-caption text-medium-emphasis">Monto:</span>
                      <span class="text-body-2 font-weight-medium">${{ formatAmount(item.amount) }}</span>
                    </div>
                    <div class="d-flex justify-space-between">
                      <span class="text-caption text-medium-emphasis">Estado:</span>
                      <v-chip
                        :color="getStatusColor(item.status)"
                        size="small"
                        variant="flat"
                      >
                        {{ item.status }}
                      </v-chip>
                    </div>
                    <div v-if="item.description" class="mt-1">
                      <span class="text-caption text-medium-emphasis">Descripción:</span>
                      <div class="text-body-2">{{ item.description }}</div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
              <v-alert
                v-if="filteredRecords.length === 0 && !loading"
                type="info"
                variant="tonal"
                class="mt-3"
              >
                No se encontraron registros
              </v-alert>
            </div>
            
            <!-- Contador de resultados -->
            <div class="mt-3 text-caption text-medium-emphasis">
              Mostrando {{ filteredRecords.length }} de {{ records.length }} registros
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Dialog para crear/editar -->
    <v-dialog v-model="dialog" max-width="600" :fullscreen="mobile">
      <v-card class="elevation-0">
        <v-card-title class="d-flex justify-space-between align-center pa-4 border-b">
          <span class="font-weight-light">{{ editingRecord ? 'Editar Registro' : 'Nuevo Registro' }}</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialog = false"
            class="d-md-none"
          ></v-btn>
        </v-card-title>
        
        <v-card-text>
          <v-form ref="formRef">
            <v-text-field
              v-model="form.sourceId"
              label="Source ID"
              variant="outlined"
              :rules="[v => !!v || 'Requerido']"
              class="mb-2"
            ></v-text-field>
            
            <v-text-field
              v-model="form.date"
              label="Fecha"
              type="date"
              variant="outlined"
              :rules="[v => !!v || 'Requerido']"
              class="mb-2"
            ></v-text-field>
            
            <v-text-field
              v-model="form.category"
              label="Categoría"
              variant="outlined"
              :rules="[v => !!v || 'Requerido']"
              class="mb-2"
            ></v-text-field>
            
            <v-text-field
              v-model.number="form.amount"
              label="Monto"
              type="number"
              variant="outlined"
              :rules="[v => !!v || 'Requerido']"
              class="mb-2"
            ></v-text-field>
            
            <v-text-field
              v-model="form.status"
              label="Estado"
              variant="outlined"
              :rules="[v => !!v || 'Requerido']"
              class="mb-2"
            ></v-text-field>
            
            <v-textarea
              v-model="form.description"
              label="Descripción"
              variant="outlined"
            ></v-textarea>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveRecord" :loading="saving">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useDisplay } from 'vuetify';
import api from '../services/api';

const { mobile } = useDisplay();

interface Record {
  id: number;
  sourceId: string;
  date: string;
  category: string;
  amount: number;
  status: string;
  description?: string;
}

const records = ref<Record[]>([]);
const loading = ref(false);
const ingesting = ref(false);
const dialog = ref(false);
const editingRecord = ref<Record | null>(null);
const saving = ref(false);
const formRef = ref<any>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const searchQuery = ref('');
const debouncedSearchQuery = ref('');
const isSearching = ref(false);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const form = ref({
  sourceId: '',
  date: '',
  category: '',
  amount: 0,
  status: '',
  description: '',
});

const sortBy = ref<{ key: string; order: 'asc' | 'desc' }[]>([]);
const selectedSort = ref<{ title: string; value: { key: string; order: 'asc' | 'desc' } } | null>(null);
const sortOptions = [
  { title: 'ID', value: { key: 'id', order: 'asc' } },
  { title: 'Source ID', value: { key: 'sourceId', order: 'asc' } },
  { title: 'Fecha', value: { key: 'date', order: 'desc' } },
  { title: 'Categoría', value: { key: 'category', order: 'asc' } },
  { title: 'Monto', value: { key: 'amount', order: 'desc' } },
  { title: 'Estado', value: { key: 'status', order: 'asc' } },
];

const handleSortChange = (value: { title: string; value: { key: string; order: 'asc' | 'desc' } } | null) => {
  if (value) {
    sortBy.value = [value.value];
  } else {
    sortBy.value = [];
  }
};

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Source ID', key: 'sourceId', sortable: true },
  { title: 'Fecha', key: 'date', sortable: true },
  { title: 'Categoría', key: 'category', sortable: true },
  { title: 'Monto', key: 'amount', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Descripción', key: 'description', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false },
];

// Watcher para debounce de búsqueda
watch(searchQuery, (newValue) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // Si se limpia el campo, aplicar inmediatamente sin delay
  if (!newValue || newValue.trim() === '') {
    debouncedSearchQuery.value = '';
    isSearching.value = false;
    return;
  }
  
  // Activar indicador de búsqueda si hay texto
  isSearching.value = true;
  
  searchTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newValue;
    isSearching.value = false;
  }, 300); // 300ms de delay
});

// Filtrar registros según la búsqueda (usando debouncedSearchQuery)
// Optimizado para mejor rendimiento con muchos datos
const filteredRecords = computed(() => {
  let results: Record[] = [];
  
  // Aplicar filtro de búsqueda
  if (!debouncedSearchQuery.value || debouncedSearchQuery.value.trim() === '') {
    results = [...records.value];
  } else {
    const query = debouncedSearchQuery.value.toLowerCase().trim();
    const queryLength = query.length;
    
    // Si la búsqueda es muy corta, retornar todos (mejora UX)
    if (queryLength < 2) {
      results = [...records.value];
    } else {
      const recordsLength = records.value.length;
      
      // Usar un bucle simple para mejor rendimiento
      for (let i = 0; i < recordsLength; i++) {
        const record = records.value[i];
        let match = false;
        
        // Búsqueda optimizada: verificar campos más comunes primero
        if (record.sourceId?.toLowerCase().includes(query)) {
          match = true;
        } else if (record.category?.toLowerCase().includes(query)) {
          match = true;
        } else if (record.status?.toLowerCase().includes(query)) {
          match = true;
        } else if (record.description?.toLowerCase().includes(query)) {
          match = true;
        } else {
          // Solo formatear fecha y monto si es necesario (más costoso)
          const formattedDate = formatDate(record.date);
          if (formattedDate.toLowerCase().includes(query)) {
            match = true;
          } else {
            const formattedAmount = formatAmount(record.amount);
            if (formattedAmount.includes(query)) {
              match = true;
            }
          }
        }
        
        if (match) {
          results.push(record);
        }
      }
    }
  }
  
  return results;
});

// Obtener color según el estado
const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'activo':
      return 'success';
    case 'pendiente':
      return 'warning';
    case 'completado':
      return 'info';
    case 'cancelado':
      return 'error';
    default:
      return 'grey';
  }
};

onMounted(() => {
  loadRecords();
});

const loadRecords = async () => {
  loading.value = true;
  try {
    const response = await api.get<Record[]>('/records');
    records.value = response.data;
  } catch (error) {
    console.error('Error al cargar registros:', error);
  } finally {
    loading.value = false;
  }
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  if (file.type !== 'application/pdf') {
    alert('Por favor selecciona un archivo PDF');
    return;
  }
  
  await ingestPdf(file);
  
  // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
  if (target) {
    target.value = '';
  }
};

const ingestPdf = async (file: File) => {
  ingesting.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/records/ingest', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    await loadRecords();
    alert(`PDF importado exitosamente. Importados: ${response.data.imported}, Actualizados: ${response.data.updated}`);
  } catch (error: any) {
    console.error('Error al importar PDF:', error);
    alert(error.response?.data?.message || error.message || 'Error al importar PDF');
  } finally {
    ingesting.value = false;
  }
};

const openDialog = (record?: Record) => {
  if (record) {
    editingRecord.value = record;
    // Manejar diferentes formatos de fecha
    let dateValue = '';
    if (record.date) {
      if (typeof record.date === 'string') {
        dateValue = record.date.includes('T') ? record.date.split('T')[0] : record.date;
      } else {
        // Si es un objeto Date o similar
        dateValue = new Date(record.date).toISOString().split('T')[0];
      }
    }
    
    form.value = {
      sourceId: record.sourceId || '',
      date: dateValue,
      category: record.category || '',
      amount: record.amount || 0,
      status: record.status || '',
      description: record.description || '',
    };
  } else {
    editingRecord.value = null;
    form.value = {
      sourceId: '',
      date: '',
      category: '',
      amount: 0,
      status: '',
      description: '',
    };
  }
  dialog.value = true;
};

const editRecord = (record: Record) => {
  openDialog(record);
};

const saveRecord = async () => {
  if (!formRef.value?.validate()) return;
  
  saving.value = true;
  try {
    // Verificar que editingRecord tenga un id válido para actualizar
    if (editingRecord.value && editingRecord.value.id) {
      await api.patch(`/records/${editingRecord.value.id}`, form.value);
    } else {
      // Crear nuevo registro
      await api.post('/records', form.value);
    }
    dialog.value = false;
    await loadRecords();
  } catch (error: any) {
    console.error('Error al guardar registro:', error);
    alert(error.response?.data?.message || error.message || 'Error al guardar registro');
  } finally {
    saving.value = false;
  }
};

const deleteRecord = async (id: number) => {
  if (!confirm('¿Está seguro de eliminar este registro?')) return;
  
  try {
    await api.delete(`/records/${id}`);
    await loadRecords();
  } catch (error: any) {
    console.error('Error al eliminar registro:', error);
    alert(error.response?.data?.message || error.message || 'Error al eliminar registro');
  }
};

const formatAmount = (amount: number | string) => {
  // Convertir a número si es string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0';
  }
  
  // Verificar si realmente es un entero (sin parte decimal significativa)
  const isWholeNumber = numAmount % 1 === 0;
  
  if (isWholeNumber) {
    // Si es entero, mostrar sin decimales pero con separador de miles
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  }
  
  // Si tiene decimales, mostrar siempre 2 decimales
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

const formatDate = (date: string | Date) => {
  if (!date) return '';
  
  let dateObj: Date;
  if (typeof date === 'string') {
    // Si viene como string "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss.sssZ"
    if (date.includes('T')) {
      // Si tiene tiempo, usar directamente
      dateObj = new Date(date);
    } else {
      // Si es solo fecha "YYYY-MM-DD", parsear manualmente para evitar problemas de zona horaria
      const [year, month, day] = date.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    }
  } else {
    dateObj = date;
  }
  
  // Formatear como DD/MM/YYYY
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};
</script>

<style scoped>
.dark-table :deep(.v-data-table__thead) {
  background-color: rgb(var(--v-theme-surface-variant));
}

.dark-table :deep(.v-data-table__th) {
  color: rgb(var(--v-theme-on-surface)) !important;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.dark-table :deep(.v-data-table__td) {
  color: rgb(var(--v-theme-on-surface));
  border-color: rgba(255, 255, 255, 0.05);
}

.dark-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(255, 255, 255, 0.03);
}

.dark-table :deep(.v-data-table-header__sort-badge) {
  background-color: rgb(var(--v-theme-primary));
}

.v-card {
  background-color: rgb(var(--v-theme-surface)) !important;
}

.v-card-title {
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.v-card-text {
  color: rgb(var(--v-theme-on-surface));
}

.border-b {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Estilos para campos de búsqueda y ordenamiento - Mejor visibilidad */
.search-field :deep(.v-field) {
  background-color: rgba(255, 255, 255, 0.08) !important;
  border-radius: 4px;
}

.search-field :deep(.v-field__input) {
  color: #ffffff !important;
  min-height: 40px;
}

.search-field :deep(.v-field__outline) {
  border-color: rgba(255, 255, 255, 0.3) !important;
  border-width: 1px !important;
}

.search-field :deep(.v-field--focused .v-field__outline) {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}

.search-field :deep(.v-label) {
  color: rgba(255, 255, 255, 0.85) !important;
  font-weight: 400;
}

.search-field :deep(.v-field--focused .v-label),
.search-field :deep(.v-field--active .v-label) {
  color: rgb(var(--v-theme-primary)) !important;
}

.search-field :deep(input::placeholder) {
  color: rgba(255, 255, 255, 0.6) !important;
}

.search-field :deep(input) {
  color: #ffffff !important;
}

.search-field :deep(.v-field__prepend-inner) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.sort-field :deep(.v-field) {
  background-color: rgba(255, 255, 255, 0.08) !important;
  border-radius: 4px;
}

.sort-field :deep(.v-field__input) {
  color: #ffffff !important;
  min-height: 40px;
}

.sort-field :deep(.v-field__outline) {
  border-color: rgba(255, 255, 255, 0.3) !important;
  border-width: 1px !important;
}

.sort-field :deep(.v-field--focused .v-field__outline) {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}

.sort-field :deep(.v-label) {
  color: rgba(255, 255, 255, 0.85) !important;
  font-weight: 400;
}

.sort-field :deep(.v-field--focused .v-label),
.sort-field :deep(.v-field--active .v-label) {
  color: rgb(var(--v-theme-primary)) !important;
}

.sort-field :deep(.v-select__selection) {
  color: #ffffff !important;
}

.sort-field :deep(.v-field__prepend-inner) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.sort-field :deep(.v-select__menu-icon) {
  color: rgba(255, 255, 255, 0.8) !important;
}
</style>

