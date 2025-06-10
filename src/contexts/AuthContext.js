import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const TOKEN_KEY = 'sofra_auth_token';
const USER_KEY = 'sofra_user_info';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = useCallback(async () => {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            const userInfo = await SecureStore.getItemAsync(USER_KEY);

            if (token && userInfo) {
                try {
                    const decoded = jwtDecode(token);
                    const currentTime = Date.now() / 1000;

                    // Token'ın geçerliliğini kontrol et
                    if (decoded.exp > currentTime) {
                        setUser(JSON.parse(userInfo));
                    } else {
                        // Token süresi dolmuşsa temizle
                        await SecureStore.deleteItemAsync(TOKEN_KEY);
                        await SecureStore.deleteItemAsync(USER_KEY);
                    }
                } catch (error) {
                    console.error('Token decode hatası:', error);
                    // Geçersiz token'ı temizle
                    await SecureStore.deleteItemAsync(TOKEN_KEY);
                    await SecureStore.deleteItemAsync(USER_KEY);
                }
            }
        } catch (err) {
            console.error('Kullanıcı bilgisi yüklenemedi:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = useCallback(async (userData) => {
        try {
            const { token } = userData;
            const decoded = jwtDecode(token);

            const fullUser = {
                token,
                role: decoded.role,
                email: decoded.email,
                id: decoded.id,
                name: decoded.name,
            };

            // Token ve kullanıcı bilgilerini güvenli depolama alanına kaydet
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(fullUser));
            
            setUser(fullUser);
        } catch (err) {
            console.error('Giriş işlemi başarısız:', err);
            throw new Error('Giriş işlemi sırasında bir hata oluştu.');
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            // Güvenli depolama alanından token ve kullanıcı bilgilerini temizle
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);
            setUser(null);
        } catch (err) {
            console.error('Çıkış işlemi başarısız:', err);
            throw new Error('Çıkış işlemi sırasında bir hata oluştu.');
        }
    }, []);

    const contextValue = useMemo(
        () => ({
            user,
            login,
            logout,
            isLoading,
        }),
        [user, login, logout, isLoading]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
