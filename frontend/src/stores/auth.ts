import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';
import router from '../router';

interface User {
  id: number;
  email: string;
}

interface LoginResponse {
  access_token: string;
  user: User;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      
      token.value = response.data.access_token;
      user.value = response.data.user;
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      router.push('/records');
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const isAuthenticated = () => {
    return !!token.value;
  };

  return {
    token,
    user,
    login,
    logout,
    isAuthenticated,
  };
});


