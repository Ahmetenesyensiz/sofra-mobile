import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    ScrollView,
    useColorScheme,
    RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';
import io from 'socket.io-client';

const WaiterManagementScreen = () => {
    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';

    const [restaurantId, setRestaurantId] = useState(null);
    const [waiters, setWaiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [editingWaiter, setEditingWaiter] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setError(null);
            const response = await fetch(`${API_URL}/restaurants/owner/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Restoran bilgileri alınamadı');
            }

            const restaurant = (await response.json())[0];
            if (!restaurant?.id) return;

            setRestaurantId(restaurant.id);

            const waitersRes = await fetch(`${API_URL}/waiters/restaurant/${restaurant.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (!waitersRes.ok) {
                throw new Error('Garson verileri alınamadı');
            }

            const waitersData = await waitersRes.json();
            setWaiters(waitersData);
        } catch (err) {
            console.error('Garson verileri alınamadı:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();

        // WebSocket bağlantısı
        const newSocket = io(API_URL, {
            auth: {
                token: user.token,
            },
        });

        newSocket.on('connect', () => {
            console.log('WebSocket bağlantısı kuruldu');
        });

        newSocket.on('waiterUpdated', () => {
            fetchData();
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [user.id, user.token]);

    const validateWaiter = () => {
        if (!name.trim()) {
            Alert.alert('Hata', 'İsim zorunludur');
            return false;
        }

        if (!email.trim()) {
            Alert.alert('Hata', 'E-posta zorunludur');
            return false;
        }

        if (!editingWaiter && !password.trim()) {
            Alert.alert('Hata', 'Şifre zorunludur');
            return false;
        }

        if (!phone.trim()) {
            Alert.alert('Hata', 'Telefon zorunludur');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
            return false;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
            Alert.alert('Hata', 'Geçerli bir telefon numarası girin (10 haneli)');
            return false;
        }

        return true;
    };

    const handleAddWaiter = async () => {
        if (!validateWaiter()) {
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/waiters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    restaurantId,
                    name: name.trim(),
                    email: email.trim(),
                    password: password.trim(),
                    phone: phone.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error('Garson eklenemedi');
            }

            setName('');
            setEmail('');
            setPassword('');
            setPhone('');
            fetchData();
            Alert.alert('Başarılı', 'Garson başarıyla eklendi');
        } catch (err) {
            Alert.alert('Hata', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateWaiter = async () => {
        if (!editingWaiter || !validateWaiter()) {
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/waiters/${editingWaiter.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    ...(password.trim() && { password: password.trim() }),
                }),
            });

            if (!response.ok) {
                throw new Error('Garson güncellenemedi');
            }

            setEditingWaiter(null);
            setName('');
            setEmail('');
            setPassword('');
            setPhone('');
            fetchData();
            Alert.alert('Başarılı', 'Garson başarıyla güncellendi');
        } catch (err) {
            Alert.alert('Hata', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteWaiter = async (waiterId) => {
        Alert.alert(
            'Onay',
            'Bu garsonu silmek istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/waiters/${waiterId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${user.token}`,
                                },
                            });

                            if (!response.ok) {
                                throw new Error('Garson silinemedi');
                            }

                            fetchData();
                            Alert.alert('Başarılı', 'Garson başarıyla silindi');
                        } catch (err) {
                            Alert.alert('Hata', err.message);
                        }
                    },
                },
            ],
        );
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const styles = getStyles(isDarkMode);

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchData}
                >
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[COLORS.primary]}
                />
            }
        >
            <Text style={styles.title}>👨‍🍳 Garson Yönetimi</Text>

            <View style={styles.form}>
                <Text style={styles.subtitle}>
                    {editingWaiter ? '✏️ Garson Düzenle' : '➕ Yeni Garson Ekle'}
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="İsim"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                />
                <TextInput
                    style={styles.input}
                    placeholder="E-posta"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                />
                <TextInput
                    style={styles.input}
                    placeholder={editingWaiter ? "Şifre (Boş bırakılırsa değişmez)" : "Şifre"}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Telefon (5XX XXX XX XX)"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                />

                {editingWaiter ? (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.updateButton]}
                            onPress={handleUpdateWaiter}
                            disabled={submitting}
                        >
                            <Text style={styles.buttonText}>
                                {submitting ? 'Güncelleniyor...' : '💾 Kaydet'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => {
                                setEditingWaiter(null);
                                setName('');
                                setEmail('');
                                setPassword('');
                                setPhone('');
                            }}
                        >
                            <Text style={styles.buttonText}>❌ İptal</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.addButton]}
                        onPress={handleAddWaiter}
                        disabled={submitting}
                    >
                        <Text style={styles.buttonText}>
                            {submitting ? 'Ekleniyor...' : '➕ Garson Ekle'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.subtitle}>📋 Mevcut Garsonlar</Text>
            <FlatList
                data={waiters}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemDesc}>{item.email}</Text>
                                <Text style={styles.itemPhone}>{item.phone}</Text>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setEditingWaiter(item);
                                        setName(item.name);
                                        setEmail(item.email);
                                        setPhone(item.phone);
                                    }}
                                    style={styles.actionButton}
                                >
                                    <Text style={styles.actionButtonText}>✏️</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleDeleteWaiter(item.id)}
                                    style={styles.actionButton}
                                >
                                    <Text style={styles.actionButtonText}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            />
        </ScrollView>
    );
};

export default WaiterManagementScreen;

const getStyles = (isDarkMode) =>
    StyleSheet.create({
        container: {
            padding: 20,
            backgroundColor: isDarkMode ? '#000' : '#fff',
        },
        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#000' : '#fff',
        },
        title: {
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 20,
            color: isDarkMode ? '#fff' : '#000',
        },
        subtitle: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 10,
            color: isDarkMode ? '#ccc' : '#333',
        },
        form: {
            marginBottom: 20,
        },
        input: {
            borderWidth: 1,
            borderColor: isDarkMode ? '#333' : '#ccc',
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
            color: isDarkMode ? '#fff' : '#000',
            backgroundColor: isDarkMode ? '#111' : '#fff',
        },
        buttonRow: {
            flexDirection: 'row',
            gap: 10,
        },
        button: {
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            flex: 1,
        },
        addButton: {
            backgroundColor: COLORS.primary,
        },
        updateButton: {
            backgroundColor: COLORS.success,
        },
        cancelButton: {
            backgroundColor: COLORS.danger,
        },
        buttonText: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 16,
        },
        card: {
            backgroundColor: isDarkMode ? '#111' : '#f2f2f2',
            padding: 16,
            borderRadius: 10,
            marginBottom: 10,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        itemName: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000',
        },
        itemDesc: {
            fontSize: 14,
            color: isDarkMode ? '#aaa' : '#666',
            marginTop: 4,
        },
        itemPhone: {
            fontSize: 14,
            color: isDarkMode ? '#aaa' : '#666',
            marginTop: 4,
        },
        cardActions: {
            flexDirection: 'row',
            gap: 10,
        },
        actionButton: {
            padding: 5,
        },
        actionButtonText: {
            fontSize: 16,
        },
        errorText: {
            color: COLORS.danger,
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 20,
        },
        retryButton: {
            backgroundColor: COLORS.primary,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
        },
        retryButtonText: {
            color: COLORS.white,
            fontSize: 16,
            fontWeight: '600',
        },
    });
