import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    useColorScheme,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';
import io from 'socket.io-client';

const ReservationScreen = () => {
    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';

    const [restaurantId, setRestaurantId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const [reservations, setReservations] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');

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

            const reservationsRes = await fetch(`${API_URL}/reservations/restaurant/${restaurant.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (!reservationsRes.ok) {
                throw new Error('Rezervasyonlar alınamadı');
            }

            const reservationsData = await reservationsRes.json();
            setReservations(reservationsData);
        } catch (err) {
            console.error('Veriler alınamadı:', err);
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

        newSocket.on('newReservation', () => {
            fetchData();
        });

        newSocket.on('reservationStatusChanged', () => {
            fetchData();
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [user.id, user.token]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const handleStatusChange = async (reservationId, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/reservations/${reservationId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Rezervasyon durumu güncellenemedi');
            }

            Alert.alert('Başarılı', 'Rezervasyon durumu güncellendi');
            fetchData();
        } catch (err) {
            Alert.alert('Hata', err.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return COLORS.warning;
            case 'confirmed':
                return COLORS.success;
            case 'cancelled':
                return COLORS.danger;
            default:
                return COLORS.gray;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return '⏳ Beklemede';
            case 'confirmed':
                return '✅ Onaylandı';
            case 'cancelled':
                return '❌ İptal Edildi';
            default:
                return status;
        }
    };

    const filteredReservations = reservations.filter(
        (reservation) => reservation.status === activeTab
    );

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
        <View style={styles.container}>
            <Text style={styles.title}>📅 Rezervasyonlar</Text>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'pending' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text style={styles.tabText}>Bekleyen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'confirmed' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('confirmed')}
                >
                    <Text style={styles.tabText}>Onaylanan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'cancelled' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('cancelled')}
                >
                    <Text style={styles.tabText}>İptal</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
            >
                {filteredReservations.length === 0 ? (
                    <Text style={styles.emptyText}>
                        {activeTab === 'pending'
                            ? 'Bekleyen rezervasyon yok.'
                            : activeTab === 'confirmed'
                            ? 'Onaylanan rezervasyon yok.'
                            : 'İptal edilen rezervasyon yok.'}
                    </Text>
                ) : (
                    filteredReservations.map((reservation) => (
                        <View key={reservation.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.customerName}>
                                        {reservation.customerName}
                                    </Text>
                                    <Text style={styles.phoneNumber}>
                                        {reservation.phoneNumber}
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.statusText,
                                        { color: getStatusColor(reservation.status) },
                                    ]}
                                >
                                    {getStatusText(reservation.status)}
                                </Text>
                            </View>

                            <View style={styles.details}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Tarih:</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(reservation.date).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Saat:</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(reservation.date).toLocaleTimeString()}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Kişi Sayısı:</Text>
                                    <Text style={styles.detailValue}>
                                        {reservation.guestCount} kişi
                                    </Text>
                                </View>
                                {reservation.notes && (
                                    <View style={styles.notes}>
                                        <Text style={styles.notesLabel}>Notlar:</Text>
                                        <Text style={styles.notesText}>
                                            {reservation.notes}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {reservation.status === 'pending' && (
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.confirmButton]}
                                        onPress={() =>
                                            handleStatusChange(reservation.id, 'confirmed')
                                        }
                                    >
                                        <Text style={styles.actionButtonText}>✅ Onayla</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.cancelButton]}
                                        onPress={() =>
                                            handleStatusChange(reservation.id, 'cancelled')
                                        }
                                    >
                                        <Text style={styles.actionButtonText}>❌ İptal</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default ReservationScreen;

const getStyles = (isDarkMode) =>
    StyleSheet.create({
        container: {
            flex: 1,
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
            marginVertical: 20,
            textAlign: 'center',
            color: isDarkMode ? '#fff' : '#000',
        },
        tabs: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            marginBottom: 20,
        },
        tab: {
            flex: 1,
            paddingVertical: 10,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: isDarkMode ? '#333' : '#ddd',
        },
        activeTab: {
            borderBottomColor: COLORS.primary,
        },
        tabText: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#fff' : '#000',
        },
        emptyText: {
            fontSize: 16,
            color: isDarkMode ? '#aaa' : '#777',
            textAlign: 'center',
            marginTop: 20,
        },
        card: {
            backgroundColor: isDarkMode ? '#111' : '#f2f2f2',
            marginHorizontal: 20,
            marginBottom: 15,
            padding: 15,
            borderRadius: 10,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 15,
        },
        customerName: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000',
            marginBottom: 4,
        },
        phoneNumber: {
            fontSize: 14,
            color: isDarkMode ? '#aaa' : '#666',
        },
        statusText: {
            fontSize: 14,
            fontWeight: '600',
        },
        details: {
            marginBottom: 15,
        },
        detailRow: {
            flexDirection: 'row',
            marginBottom: 8,
        },
        detailLabel: {
            width: 80,
            fontSize: 14,
            color: isDarkMode ? '#aaa' : '#666',
        },
        detailValue: {
            flex: 1,
            fontSize: 14,
            color: isDarkMode ? '#fff' : '#000',
        },
        notes: {
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#333' : '#ddd',
        },
        notesLabel: {
            fontSize: 14,
            color: isDarkMode ? '#aaa' : '#666',
            marginBottom: 4,
        },
        notesText: {
            fontSize: 14,
            color: isDarkMode ? '#fff' : '#000',
            fontStyle: 'italic',
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 15,
            paddingTop: 15,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#333' : '#ddd',
        },
        actionButton: {
            flex: 1,
            paddingVertical: 8,
            marginHorizontal: 5,
            borderRadius: 6,
            alignItems: 'center',
        },
        confirmButton: {
            backgroundColor: COLORS.success,
        },
        cancelButton: {
            backgroundColor: COLORS.danger,
        },
        actionButtonText: {
            color: '#fff',
            fontSize: 14,
            fontWeight: '600',
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