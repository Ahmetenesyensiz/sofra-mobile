import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    useColorScheme,
    RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';
import io from 'socket.io-client';

const DashboardScreen = () => {
    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';

    const [orderCount, setOrderCount] = useState(0);
    const [callCount, setCallCount] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const fetchDashboardData = async () => {
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

            const [orderRes, callRes, salesRes] = await Promise.all([
                fetch(`${API_URL}/orders/restaurant/${restaurant.id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }),
                fetch(`${API_URL}/call-requests/restaurant/${restaurant.id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }),
                fetch(`${API_URL}/sales/restaurant/${restaurant.id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }),
            ]);

            if (!orderRes.ok || !callRes.ok || !salesRes.ok) {
                throw new Error('Veriler alınamadı');
            }

            const [orders, calls, sales] = await Promise.all([
                orderRes.json(),
                callRes.json(),
                salesRes.json(),
            ]);

            setOrderCount(orders.length);
            setCallCount(calls.length);

            const total = sales.reduce((acc, sale) => acc + (sale.totalAmount || sale.totalPrice || 0), 0);
            setTotalRevenue(total);
        } catch (err) {
            console.error('Dashboard verileri alınamadı:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // WebSocket bağlantısı
        const newSocket = io(API_URL, {
            auth: {
                token: user.token,
            },
        });

        newSocket.on('connect', () => {
            console.log('WebSocket bağlantısı kuruldu');
        });

        newSocket.on('newOrder', () => {
            fetchDashboardData();
        });

        newSocket.on('orderStatusChanged', () => {
            fetchDashboardData();
        });

        newSocket.on('newCallRequest', () => {
            fetchDashboardData();
        });

        newSocket.on('callRequestStatusChanged', () => {
            fetchDashboardData();
        });

        newSocket.on('newSale', () => {
            fetchDashboardData();
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
        fetchDashboardData();
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
                    onPress={fetchDashboardData}
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
            <Text style={styles.title}>📊 Yönetim Paneli</Text>

            <View style={styles.card}>
                <Text style={styles.label}>📦 Toplam Sipariş</Text>
                <Text style={styles.value}>{orderCount}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>🔔 Aktif Çağrı</Text>
                <Text style={styles.value}>{callCount}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>💰 Toplam Gelir</Text>
                <Text style={styles.value}>{(totalRevenue || 0).toFixed(2)} ₺</Text>
            </View>
        </ScrollView>
    );
};

export default DashboardScreen;

const getStyles = (isDarkMode) =>
    StyleSheet.create({
        container: {
            padding: 24,
            gap: 16,
            backgroundColor: isDarkMode ? '#000' : '#fff',
        },
        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#000' : '#fff',
        },
        title: {
            fontSize: 26,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 16,
            color: isDarkMode ? '#fff' : '#000',
        },
        card: {
            backgroundColor: isDarkMode ? '#111' : '#f2f2f2',
            padding: 20,
            borderRadius: 12,
            elevation: 3,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 6,
        },
        label: {
            fontSize: 16,
            marginBottom: 6,
            color: isDarkMode ? '#ccc' : '#444',
        },
        value: {
            fontSize: 22,
            fontWeight: 'bold',
            color: COLORS.primary,
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
