import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    useColorScheme,
    ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import CustomInput from '../../components/CustomInput';
import PrimaryButton from '../../components/PrimaryButton';

const AddWaiterScreen = () => {
    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';

    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [restaurantId, setRestaurantId] = useState(null);
    const [error, setError] = useState('');

    // Fetch restaurant ID on component mount
    React.useEffect(() => {
        const fetchRestaurantId = async () => {
            try {
                const response = await api.get(`/restaurants/owner/${user.id}`);
                if (response.data && response.data.length > 0) {
                    setRestaurantId(response.data[0].id);
                } else {
                    setError('Restoran bilgisi bulunamadı. Lütfen önce restoran oluşturun.');
                }
            } catch (error) {
                console.error('Restaurant fetch error:', error);
                setError('Restoran bilgisi alınamadı.');
            }
        };

        fetchRestaurantId();
    }, [user.id]);

    const validateForm = () => {
        if (!name.trim()) {
            setError('Ad alanı zorunludur');
            return false;
        }
        if (!surname.trim()) {
            setError('Soyad alanı zorunludur');
            return false;
        }
        if (!email.trim()) {
            setError('Email alanı zorunludur');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Geçerli bir email adresi girin');
            return false;
        }
        if (!password || password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır');
            return false;
        }
        if (!restaurantId) {
            setError('Restoran bilgisi bulunamadı');
            return false;
        }
        return true;
    };

    const handleAddWaiter = async () => {
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/add-waiter', {
                name: name.trim(),
                surname: surname.trim(),
                email: email.trim().toLowerCase(),
                password,
                restaurantId,
            });

            Alert.alert('Başarılı', 'Garson başarıyla eklendi', [
                {
                    text: 'Tamam',
                    onPress: () => {
                        setName('');
                        setSurname('');
                        setEmail('');
                        setPassword('');
                    }
                }
            ]);
        } catch (error) {
            console.error('Add waiter error:', error);
            const errorMessage = error.response?.data?.message || 'Garson eklenirken bir hata oluştu';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={[
                styles.container,
                { backgroundColor: isDarkMode ? '#000' : '#fff' },
            ]}
        >
            <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
                👨‍🍳 Yeni Garson Ekle
            </Text>

            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <CustomInput
                label="Ad"
                value={name}
                onChangeText={setName}
                placeholder="Garson adı"
                error={error && error.includes('Ad') ? error : null}
            />
            <CustomInput
                label="Soyad"
                value={surname}
                onChangeText={setSurname}
                placeholder="Garson soyadı"
                error={error && error.includes('Soyad') ? error : null}
            />
            <CustomInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="email@mail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={error && error.includes('email') ? error : null}
            />
            <CustomInput
                label="Şifre"
                value={password}
                onChangeText={setPassword}
                placeholder="En az 6 karakter"
                secureTextEntry
                error={error && error.includes('Şifre') ? error : null}
            />

            <PrimaryButton
                title="Garsonu Ekle"
                onPress={handleAddWaiter}
                loading={loading}
                disabled={!restaurantId || loading}
            />
        </ScrollView>
    );
};

export default AddWaiterScreen;

const styles = StyleSheet.create({
    container: {
        padding: 24,
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 28,
        textAlign: 'center',
    },
    errorContainer: {
        backgroundColor: '#ffebee',
        borderColor: '#ff3b30',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 14,
        textAlign: 'center',
    },
});
