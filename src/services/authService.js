import api from './api';

const authService = {
    login: async (email, password) => {
        try {
            // Validate inputs
            if (!email || !password) {
                throw new Error('Email ve şifre zorunludur');
            }

            if (!/\S+@\S+\.\S+/.test(email)) {
                throw new Error('Geçerli bir email adresi girin');
            }

            const response = await api.post('/auth/login', {
                email: email.trim().toLowerCase(),
                password
            });

            console.log('🔑 Login response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Login error:', error);

            // Handle different error types
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message;

                switch (status) {
                    case 400:
                        throw new Error(message || 'Geçersiz giriş bilgileri');
                    case 401:
                        throw new Error('Email veya şifre hatalı');
                    case 403:
                        throw new Error('Hesabınız askıya alınmış');
                    case 500:
                        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin');
                    default:
                        throw new Error(message || 'Giriş başarısız');
                }
            } else if (error.request) {
                throw new Error('Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin');
            } else {
                throw new Error(error.message || 'Beklenmeyen bir hata oluştu');
            }
        }
    },

    register: async (data) => {
        try {
            // Validate required fields
            const requiredFields = ['name', 'surname', 'email', 'password', 'role'];
            for (const field of requiredFields) {
                if (!data[field] || !data[field].toString().trim()) {
                    throw new Error(`${field} alanı zorunludur`);
                }
            }

            // Validate email format
            if (!/\S+@\S+\.\S+/.test(data.email)) {
                throw new Error('Geçerli bir email adresi girin');
            }

            // Validate password strength
            if (data.password.length < 6) {
                throw new Error('Şifre en az 6 karakter olmalıdır');
            }

            const response = await api.post('/auth/register', {
                ...data,
                email: data.email.trim().toLowerCase(),
                name: data.name.trim(),
                surname: data.surname.trim(),
            });

            return response.data;
        } catch (error) {
            console.error('Register error:', error.response?.data || error.message);

            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message;

                switch (status) {
                    case 400:
                        throw new Error(message || 'Geçersiz kayıt bilgileri');
                    case 409:
                        throw new Error('Bu email adresi zaten kayıtlı');
                    case 500:
                        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin');
                    default:
                        throw new Error(message || 'Kayıt başarısız');
                }
            } else if (error.request) {
                throw new Error('Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin');
            } else {
                throw new Error(error.message || 'Beklenmeyen bir hata oluştu');
            }
        }
    }
};

export default authService;
