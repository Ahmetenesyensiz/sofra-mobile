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

const OwnerRegisterScreen = () => {
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
        restaurantName: '',
        restaurantAddress: '',
        taxNumber: '',
        taxOffice: '',
        businessType: 'RESTAURANT', // RESTAURANT, CAFE, BAR, etc.
        documentNumber: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateForm = () => {
        if (!formData.name || !formData.surname || !formData.email || 
            !formData.password || !formData.confirmPassword || !formData.phone ||
            !formData.restaurantName || !formData.restaurantAddress || 
            !formData.taxNumber || !formData.taxOffice || !formData.documentNumber) {
            setError('Lütfen tüm alanları doldurun.');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır.');
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

        const taxNumberRegex = /^[0-9]{10}$/;
        if (!taxNumberRegex.test(formData.taxNumber)) {
            setError('Geçerli bir vergi numarası giriniz (10 haneli).');
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
            const response = await authService.register({
                ...formData,
                role: 'OWNER',
            });

            // Başarılı kayıt sonrası ödeme ekranına yönlendir
            navigation.navigate('OwnerPayment', {
                ownerId: response.data.id,
                restaurantName: formData.restaurantName,
            });
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
                        name="restaurant"
                        size={60}
                        color={isDarkMode ? '#fff' : '#007aff'}
                    />
                    <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
                        Restoran Sahibi Kaydı
                    </Text>
                    <Text style={[styles.subtitle, { color: isDarkMode ? '#ccc' : '#666' }]}>
                        İşletmenizi Sofra'ya ekleyin ve müşterilerinizle buluşun
                    </Text>
                </View>

                <View style={styles.form}>
                    <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                        Kişisel Bilgiler
                    </Text>
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

                    <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                        İşletme Bilgileri
                    </Text>
                    <CustomInput
                        label="Restoran Adı"
                        value={formData.restaurantName}
                        onChangeText={(value) => updateFormData('restaurantName', value)}
                        placeholder="Restoran adı"
                        icon="business-outline"
                    />
                    <CustomInput
                        label="Restoran Adresi"
                        value={formData.restaurantAddress}
                        onChangeText={(value) => updateFormData('restaurantAddress', value)}
                        placeholder="Adres"
                        icon="location-outline"
                    />
                    <CustomInput
                        label="Vergi Numarası"
                        value={formData.taxNumber}
                        onChangeText={(value) => updateFormData('taxNumber', value.replace(/\D/g, ''))}
                        placeholder="10 haneli vergi numarası"
                        keyboardType="number-pad"
                        icon="card-outline"
                    />
                    <CustomInput
                        label="Vergi Dairesi"
                        value={formData.taxOffice}
                        onChangeText={(value) => updateFormData('taxOffice', value)}
                        placeholder="Vergi dairesi"
                        icon="business-outline"
                    />
                    <CustomInput
                        label="Belge Numarası"
                        value={formData.documentNumber}
                        onChangeText={(value) => updateFormData('documentNumber', value)}
                        placeholder="İşletme belge numarası"
                        icon="document-text-outline"
                    />

                    {error && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color="#ff3b30" />
                            <Text style={styles.error}>{error}</Text>
                        </View>
                    )}

                    <PrimaryButton
                        title="Kayıt Ol ve Devam Et"
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

export default OwnerRegisterScreen;

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
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 16,
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
