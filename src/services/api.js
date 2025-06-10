import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const TOKEN_KEY = 'sofra_auth_token';

// Use environment variable or fallback to specific IP
const API_BASE_URL = process.env.API_BASE_URL || 'http://10.67.17.151:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 saniye timeout
});

// Request interceptor
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token && !config.url.includes('/auth/')) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        } catch (error) {
            console.error('Request interceptor error:', error);
            return Promise.reject(error);
        }
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response error:', error.response.data);
            
            // Handle specific error cases
            if (error.response.status === 403) {
                console.error('Access forbidden. Please check your credentials and permissions.');
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Request setup error:', error.message);
        }
        return Promise.reject(error);
    }
);

// API isteklerini yönetmek için yardımcı fonksiyonlar
export const handleApiError = (error) => {
    if (error.response) {
        // Sunucudan gelen hata
        const status = error.response.status;
        const message = error.response.data?.message || 'Bir hata oluştu';

        switch (status) {
            case 400:
                return 'Geçersiz istek. Lütfen girdiğiniz bilgileri kontrol edin.';
            case 401:
                return 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
            case 403:
                return 'Bu işlem için yetkiniz bulunmuyor.';
            case 404:
                return 'İstenen kaynak bulunamadı.';
            case 500:
                return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
            default:
                return message;
        }
    } else if (error.request) {
        // İstek yapıldı ama cevap alınamadı
        return 'Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.';
    } else {
        // İstek oluşturulurken hata oluştu
        return 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
};

export default api;
