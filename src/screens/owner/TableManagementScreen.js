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
    Share,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';
import QRCode from 'react-native-qrcode-svg';
import io from 'socket.io-client';

const TableManagementScreen = () => {
    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';

    const [restaurantId, setRestaurantId] = useState(null);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const [tableNumber, setTableNumber] = useState('');
    const [capacity, setCapacity] = useState('');
    const [editingTable, setEditingTable] = useState(null);
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

            const tablesRes = await fetch(`${API_URL}/tables/restaurant/${restaurant.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (!tablesRes.ok) {
                throw new Error('Masa verileri alınamadı');
            }

            const tablesData = await tablesRes.json();
            setTables(tablesData);
        } catch (err) {
            console.error('Masa verileri alınamadı:', err);
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

        newSocket.on('tableStatusChanged', () => {
            fetchData();
        });

        newSocket.on('tableUpdated', () => {
            fetchData();
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [user.id, user.token]);

    const validateTable = () => {
        if (!tableNumber.trim()) {
            Alert.alert('Hata', 'Masa numarası zorunludur');
            return false;
        }

        if (!capacity.trim()) {
            Alert.alert('Hata', 'Kapasite zorunludur');
            return false;
        }

        const capacityNum = parseInt(capacity);
        if (isNaN(capacityNum) || capacityNum <= 0) {
            Alert.alert('Hata', 'Kapasite geçerli bir sayı olmalıdır');
            return false;
        }

        if (capacityNum > 20) {
            Alert.alert('Hata', 'Kapasite 20 kişiden fazla olamaz');
            return false;
        }

        // Check for duplicate table numbers
        const existingTable = tables.find(table =>
            table.tableNumber.toString() === tableNumber.trim() &&
            (!editingTable || table.id !== editingTable.id)
        );
        if (existingTable) {
            Alert.alert('Hata', 'Bu masa numarası zaten mevcut');
            return false;
        }

        return true;
    };

    const handleAddTable = async () => {
        if (!validateTable()) {
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/tables`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    restaurantId,
                    tableNumber: tableNumber.trim(),
                    capacity: parseInt(capacity),
                }),
            });

            if (!response.ok) {
                throw new Error('Masa eklenemedi');
            }

            setTableNumber('');
            setCapacity('');
            fetchData();
            Alert.alert('Başarılı', 'Masa başarıyla eklendi');
        } catch (err) {
            Alert.alert('Hata', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateTable = async () => {
        if (!editingTable || !validateTable()) {
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/tables/${editingTable.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    tableNumber: tableNumber.trim(),
                    capacity: parseInt(capacity),
                }),
            });

            if (!response.ok) {
                throw new Error('Masa güncellenemedi');
            }

            setEditingTable(null);
            setTableNumber('');
            setCapacity('');
            fetchData();
            Alert.alert('Başarılı', 'Masa başarıyla güncellendi');
        } catch (err) {
            Alert.alert('Hata', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTable = async (tableId) => {
        Alert.alert(
            'Onay',
            'Bu masayı silmek istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/tables/${tableId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${user.token}`,
                                },
                            });

                            if (!response.ok) {
                                throw new Error('Masa silinemedi');
                            }

                            fetchData();
                            Alert.alert('Başarılı', 'Masa başarıyla silindi');
                        } catch (err) {
                            Alert.alert('Hata', err.message);
                        }
                    },
                },
            ],
        );
    };

    const handleShareQR = async (table) => {
        try {
            const qrData = `${API_URL}/menu/${restaurantId}?table=${table.tableNumber}`;
            await Share.share({
                message: `Masa ${table.tableNumber} için QR kod: ${qrData}`,
            });
        } catch (err) {
            Alert.alert('Hata', 'QR kod paylaşılamadı');
        }
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
            <Text style={styles.title}>🪑 Masa Yönetimi</Text>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Masa Numarası"
                    value={tableNumber}
                    onChangeText={setTableNumber}
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Kapasite (kişi)"
                    value={capacity}
                    onChangeText={setCapacity}
                    keyboardType="number-pad"
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                />

                {editingTable ? (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.updateButton]}
                            onPress={handleUpdateTable}
                            disabled={submitting}
                        >
                            <Text style={styles.buttonText}>
                                {submitting ? 'Güncelleniyor...' : '💾 Kaydet'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => {
                                setEditingTable(null);
                                setTableNumber('');
                                setCapacity('');
                            }}
                        >
                            <Text style={styles.buttonText}>❌ İptal</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.addButton]}
                        onPress={handleAddTable}
                        disabled={submitting}
                    >
                        <Text style={styles.buttonText}>
                            {submitting ? 'Ekleniyor...' : '➕ Masa Ekle'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.subtitle}>📋 Mevcut Masalar</Text>
            <FlatList
                data={tables}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.itemName}>Masa: {item.tableNumber}</Text>
                                <Text style={styles.itemDesc}>Kapasite: {item.capacity} kişi</Text>
                                <Text style={[
                                    styles.statusText,
                                    { color: item.isOccupied ? COLORS.danger : COLORS.success }
                                ]}>
                                    {item.isOccupied ? '🟢 Dolu' : '⚪ Boş'}
                                </Text>
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity
                                    onPress={() => handleShareQR(item)}
                                    style={styles.actionButton}
                                >
                                    <Text style={styles.actionButtonText}>📱</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setEditingTable(item);
                                        setTableNumber(item.tableNumber);
                                        setCapacity(item.capacity.toString());
                                    }}
                                    style={styles.actionButton}
                                >
                                    <Text style={styles.actionButtonText}>✏️</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleDeleteTable(item.id)}
                                    style={styles.actionButton}
                                >
                                    <Text style={styles.actionButtonText}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.qrContainer}>
                            <QRCode
                                value={`${API_URL}/menu/${restaurantId}?table=${item.tableNumber}`}
                                size={100}
                                backgroundColor={isDarkMode ? '#000' : '#fff'}
                                color={isDarkMode ? '#fff' : '#000'}
                            />
                        </View>
                    </View>
                )}
            />
        </ScrollView>
    );
};

export default TableManagementScreen;

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
            marginTop: 30,
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
        statusText: {
            fontSize: 14,
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
        qrContainer: {
            alignItems: 'center',
            marginTop: 10,
            padding: 10,
            backgroundColor: isDarkMode ? '#000' : '#fff',
            borderRadius: 8,
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
