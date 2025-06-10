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
    TextInput,
    Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';
import io from 'socket.io-client';

const OrderListScreen = () => {
    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';

    const [restaurantId, setRestaurantId] = useState(null);
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

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

            const [orderRes, menuRes] = await Promise.all([
                fetch(`${API_URL}/orders/restaurant/${restaurant.id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }),
                fetch(`${API_URL}/menu-items/restaurant/${restaurant.id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }),
            ]);

            if (!orderRes.ok || !menuRes.ok) {
                throw new Error('Veriler alınamadı');
            }

            const [ordersData, menuData] = await Promise.all([
                orderRes.json(),
                menuRes.json(),
            ]);

            setOrders(ordersData);
            setMenuItems(menuData);
        } catch (err) {
            console.error('Siparişler alınamadı:', err);
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

        newSocket.on('newOrder', () => {
            fetchData();
        });

        newSocket.on('orderStatusChanged', () => {
            fetchData();
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [user.id, user.token]);

    const getMenuName = (menuItemId) => {
        const found = menuItems.find((item) => item._id === menuItemId || item.id === menuItemId);
        return found ? found.name : 'Ürün';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return COLORS.warning;
            case 'confirmed':
                return COLORS.info;
            case 'preparing':
                return COLORS.primary;
            case 'ready':
                return COLORS.success;
            case 'completed':
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
            case 'preparing':
                return '👨‍🍳 Hazırlanıyor';
            case 'ready':
                return '🚀 Hazır';
            case 'completed':
                return '🎉 Tamamlandı';
            case 'cancelled':
                return '❌ İptal Edildi';
            default:
                return status;
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Sipariş durumu güncellenemedi');
            }

            fetchData();
        } catch (err) {
            Alert.alert('Hata', err.message);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = searchQuery === '' ||
            order.tableId.toString().includes(searchQuery) ||
            order.customerId.toString().includes(searchQuery) ||
            order.items.some(item => getMenuName(item.menuItemId).toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        const orderDate = new Date(order.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let matchesDate = true;
        if (dateFilter === 'today') {
            matchesDate = orderDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'yesterday') {
            matchesDate = orderDate.toDateString() === yesterday.toDateString();
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

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
            <Text style={styles.title}>🧾 Siparişler</Text>

            <View style={styles.filters}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Masa, Müşteri veya Ürün Ara..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={isDarkMode ? '#666' : '#999'}
                />

                <View style={styles.filterRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                statusFilter === 'all' && styles.filterButtonActive,
                            ]}
                            onPress={() => setStatusFilter('all')}
                        >
                            <Text style={styles.filterButtonText}>Tümü</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                statusFilter === 'pending' && styles.filterButtonActive,
                            ]}
                            onPress={() => setStatusFilter('pending')}
                        >
                            <Text style={styles.filterButtonText}>Beklemede</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                statusFilter === 'confirmed' && styles.filterButtonActive,
                            ]}
                            onPress={() => setStatusFilter('confirmed')}
                        >
                            <Text style={styles.filterButtonText}>Onaylandı</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                statusFilter === 'preparing' && styles.filterButtonActive,
                            ]}
                            onPress={() => setStatusFilter('preparing')}
                        >
                            <Text style={styles.filterButtonText}>Hazırlanıyor</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                statusFilter === 'ready' && styles.filterButtonActive,
                            ]}
                            onPress={() => setStatusFilter('ready')}
                        >
                            <Text style={styles.filterButtonText}>Hazır</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                statusFilter === 'completed' && styles.filterButtonActive,
                            ]}
                            onPress={() => setStatusFilter('completed')}
                        >
                            <Text style={styles.filterButtonText}>Tamamlandı</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                statusFilter === 'cancelled' && styles.filterButtonActive,
                            ]}
                            onPress={() => setStatusFilter('cancelled')}
                        >
                            <Text style={styles.filterButtonText}>İptal</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <View style={styles.filterRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                dateFilter === 'all' && styles.filterButtonActive,
                            ]}
                            onPress={() => setDateFilter('all')}
                        >
                            <Text style={styles.filterButtonText}>Tüm Zamanlar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                dateFilter === 'today' && styles.filterButtonActive,
                            ]}
                            onPress={() => setDateFilter('today')}
                        >
                            <Text style={styles.filterButtonText}>Bugün</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                dateFilter === 'yesterday' && styles.filterButtonActive,
                            ]}
                            onPress={() => setDateFilter('yesterday')}
                        >
                            <Text style={styles.filterButtonText}>Dün</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>

            {filteredOrders.length === 0 ? (
                <Text style={styles.emptyText}>Sipariş bulunamadı.</Text>
            ) : (
                filteredOrders.map((order) => (
                    <View key={order.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.orderTitle}>Masa: {order.tableId}</Text>
                                <Text style={styles.subText}>Müşteri: {order.customerId}</Text>
                                <Text style={styles.subText}>
                                    Tarih: {new Date(order.createdAt).toLocaleString()}
                                </Text>
                            </View>
                            <Text style={[
                                styles.statusText,
                                { color: getStatusColor(order.status) }
                            ]}>
                                {getStatusText(order.status)}
                            </Text>
                        </View>

                        <View style={styles.orderItems}>
                            {order.items.map((item, index) => (
                                <Text key={index} style={styles.orderItem}>
                                    • {getMenuName(item.menuItemId)} x {item.quantity}
                                </Text>
                            ))}
                        </View>

                        <View style={styles.orderFooter}>
                            <Text style={styles.totalText}>
                                Toplam: {order.totalAmount} ₺
                            </Text>

                            {order.status === 'pending' && (
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.confirmButton]}
                                        onPress={() => handleStatusChange(order.id, 'confirmed')}
                                    >
                                        <Text style={styles.actionButtonText}>✅ Onayla</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.cancelButton]}
                                        onPress={() => handleStatusChange(order.id, 'cancelled')}
                                    >
                                        <Text style={styles.actionButtonText}>❌ İptal</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {order.status === 'confirmed' && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.prepareButton]}
                                    onPress={() => handleStatusChange(order.id, 'preparing')}
                                >
                                    <Text style={styles.actionButtonText}>👨‍🍳 Hazırla</Text>
                                </TouchableOpacity>
                            )}

                            {order.status === 'preparing' && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.readyButton]}
                                    onPress={() => handleStatusChange(order.id, 'ready')}
                                >
                                    <Text style={styles.actionButtonText}>🚀 Hazır</Text>
                                </TouchableOpacity>
                            )}

                            {order.status === 'ready' && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.completeButton]}
                                    onPress={() => handleStatusChange(order.id, 'completed')}
                                >
                                    <Text style={styles.actionButtonText}>🎉 Tamamla</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
    );
};

export default OrderListScreen;

const getStyles = (isDark) =>
    StyleSheet.create({
        container: {
            padding: 20,
            backgroundColor: isDark ? '#000' : '#fff',
        },
        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDark ? '#000' : '#fff',
        },
        title: {
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 20,
            color: isDark ? '#fff' : '#000',
        },
        filters: {
            marginBottom: 20,
        },
        searchInput: {
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#ccc',
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
            color: isDark ? '#fff' : '#000',
            backgroundColor: isDark ? '#111' : '#fff',
        },
        filterRow: {
            marginBottom: 10,
        },
        filterButton: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: isDark ? '#111' : '#f2f2f2',
            marginRight: 8,
        },
        filterButtonActive: {
            backgroundColor: COLORS.primary,
        },
        filterButtonText: {
            color: isDark ? '#fff' : '#000',
            fontSize: 14,
            fontWeight: '500',
        },
        emptyText: {
            fontSize: 16,
            color: isDark ? '#aaa' : '#777',
            textAlign: 'center',
            marginTop: 20,
        },
        card: {
            backgroundColor: isDark ? '#111' : '#f2f2f2',
            padding: 16,
            borderRadius: 10,
            marginBottom: 14,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 10,
        },
        orderTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDark ? '#fff' : '#000',
        },
        subText: {
            fontSize: 14,
            color: isDark ? '#aaa' : '#666',
            marginTop: 4,
        },
        statusText: {
            fontSize: 14,
            fontWeight: '600',
        },
        orderItems: {
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#333' : '#ddd',
        },
        orderItem: {
            fontSize: 14,
            marginLeft: 8,
            color: isDark ? '#eee' : '#222',
            marginBottom: 4,
        },
        orderFooter: {
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#333' : '#ddd',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        totalText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDark ? '#fff' : '#000',
        },
        actionButtons: {
            flexDirection: 'row',
            gap: 8,
        },
        actionButton: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
        },
        confirmButton: {
            backgroundColor: COLORS.success,
        },
        cancelButton: {
            backgroundColor: COLORS.danger,
        },
        prepareButton: {
            backgroundColor: COLORS.primary,
        },
        readyButton: {
            backgroundColor: COLORS.info,
        },
        completeButton: {
            backgroundColor: COLORS.success,
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
