<template>
  <v-app>
    <v-app-bar 
      color="surface" 
      elevation="0"
      border
      class="dark-app-bar"
    >
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="drawer = !drawer"
      ></v-app-bar-nav-icon>
      
      <v-toolbar-title class="font-weight-light text-h6">
        Admin Panel
      </v-toolbar-title>
      
      <v-spacer></v-spacer>
      
      <v-chip 
        class="me-4 user-chip" 
        prepend-icon="mdi-account-circle"
        variant="flat"
        size="small"
      >
        {{ authStore.user?.email }}
      </v-chip>
      
      <v-btn
        icon="mdi-logout"
        variant="text"
        @click="authStore.logout()"
      ></v-btn>
    </v-app-bar>
    
    <v-navigation-drawer 
      v-model="drawer" 
      temporary
      color="surface"
      elevation="0"
    >
      <v-list class="pa-2">
        <v-list-item
          prepend-icon="mdi-table"
          title="Registros"
          value="records"
          :to="{ name: 'records' }"
          variant="flat"
          class="mb-1"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    
    <v-main class="dark-main">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const drawer = ref(false);
</script>

<style scoped>
.dark-app-bar {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.dark-main {
  background-color: rgb(var(--v-theme-background));
}

:deep(.v-navigation-drawer) {
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

:deep(.v-list-item--active) {
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

/* Estilos para el chip del usuario - Mejor visibilidad */
.user-chip {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.user-chip :deep(.v-chip__content) {
  color: #ffffff !important;
  font-weight: 400;
}

.user-chip :deep(.v-chip__prepend) {
  color: rgba(255, 255, 255, 0.9) !important;
}

.user-chip:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(255, 255, 255, 0.25);
}
</style>


