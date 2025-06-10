import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    useColorScheme,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import authService from '../../services/authService';
import CustomInput from '../../components/CustomInput';
import PrimaryButton from '../../components/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = () => {
    const navigation = useNavigation();
    const headerHeight = useHeaderHeight();
    const isDarkMode = useColorScheme() === 'dark';

    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateForm = () => {
        if (!formData.name || !formData.surname || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
            setError('Lütfen tüm alanları doldurun.');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
            return false;
        }

        // Password strength validation
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            setError('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Geçerli bir email adresi giriniz.');
            return false;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
            setError('Geçerli bir telefon numarası giriniz (10 haneli).');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await authService.register({
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: 'CUSTOMER',
            });

            Alert.alert(
                'Başarılı',
                'Kayıt işleminiz tamamlandı. Giriş yapabilirsiniz.',
                [
                    {
                        text: 'Giriş Yap',
                        onPress: () => navigation.navigate('Login'),
                    },
                ]
            );
        } catch (err) {
            setError(err.message || 'Kayıt sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={headerHeight}
            style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Ionicons
                        name="person-add"
                        size={60}
                        color={isDarkMode ? '#fff' : '#007aff'}
                    />
                    <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
                        Müşteri Kaydı
                    </Text>
                    <Text style={[styles.subtitle, { color: isDarkMode ? '#ccc' : '#666' }]}>
                        Sofra'ya katıl ve lezzetli deneyimlerin tadını çıkar
                    </Text>
                </View>

                <View style={styles.form}>
                    <CustomInput
                        label="Ad"
                        value={formData.name}
                        onChangeText={(value) => updateFormData('name', value)}
                        placeholder="Adınız"
                        icon="person-outline"
                    />
                    <CustomInput
                        label="Soyad"
                        value={formData.surname}
                        onChangeText={(value) => updateFormData('surname', value)}
                        placeholder="Soyadınız"
                        icon="person-outline"
                    />
                    <CustomInput
                        label="Email"
                        value={formData.email}
                        onChangeText={(value) => updateFormData('email', value)}
                        placeholder="email@mail.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        icon="mail-outline"
                    />
                    <CustomInput
                        label="Telefon"
                        value={formData.phone}
                        onChangeText={(value) => updateFormData('phone', value.replace(/\D/g, ''))}
                        placeholder="5XX XXX XX XX"
                        keyboardType="phone-pad"
                        icon="call-outline"
                    />
                    <CustomInput
                        label="Şifre"
                        value={formData.password}
                        onChangeText={(value) => updateFormData('password', value)}
                        placeholder="••••••"
                        secureTextEntry
                        icon="lock-closed-outline"
                    />
                    <CustomInput
                        label="Şifre Tekrar"
                        value={formData.confirmPassword}
                        onChangeText={(value) => updateFormData('confirmPassword', value)}
                        placeholder="••••••"
                        secureTextEntry
                        icon="lock-closed-outline"
                    />

                    {error && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color="#ff3b30" />
                            <Text style={styles.error}>{error}</Text>
                        </View>
                    )}

                    <PrimaryButton
                        title="Kayıt Ol"
                        onPress={handleRegister}
                        loading={loading}
                        style={styles.registerButton}
                    />
                </View>

                <View style={styles.loginOptions}>
                    <Text style={[styles.loginTitle, { color: isDarkMode ? '#ccc' : '#666' }]}>
                        Zaten hesabın var mı?
                    </Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginButtonText}>Giriş Yap</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        marginBottom: 24,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    error: {
        color: '#ff3b30',
        marginLeft: 8,
        flex: 1,
    },
    registerButton: {
        marginTop: 8,
    },
    loginOptions: {
        alignItems: 'center',
        marginTop: 24,
    },
    loginTitle: {
        fontSize: 16,
        marginBottom: 12,
    },
    loginButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: '#007aff',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
