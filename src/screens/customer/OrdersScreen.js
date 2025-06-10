import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    useColorScheme,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';

const OrdersScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('active');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orders, setOrders] = useState({
        active: [],
        past: [],
    });

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Siparişler yüklenemedi');
            }

            const data = await response.json();
            
            // Siparişleri aktif ve geçmiş olarak ayır
            const now = new Date();
            const activeOrders = data.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate > now || order.status !== 'delivered';
            });
            
            const pastOrders = data.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate <= now && order.status === 'delivered';
            });

            setOrders({
                active: activeOrders,
                past: pastOrders,
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error.message);
            Alert.alert('Hata', 'Siparişler yüklenemedi');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchOrders();
    }, []);

    const getStatusText = (status) => {
        switch (status) {
            case 'preparing':
                return 'Hazırlanıyor';
            case 'onTheWay':
                return 'Yolda';
            case 'delivered':
                return 'Teslim Edildi';
            case 'cancelled':
                return 'İptal Edildi';
            default:
                return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'preparing':
                return COLORS.warning;
            case 'onTheWay':
                return COLORS.primary;
            case 'delivered':
                return COLORS.success;
            case 'cancelled':
                return COLORS.danger;
            default:
                return COLORS.gray;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Ionicons name="alert-circle" size={48} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchOrders}
                >
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderOrderCard = (order) => (
        <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
        >
            <View style={styles.orderHeader}>
                <Image
                    source={{ uri: order.restaurantImage }}
                    style={styles.restaurantImage}
                />
                <View style={styles.orderInfo}>
                    <Text style={styles.restaurantName}>
                        {order.restaurant}
                    </Text>
                    <Text style={styles.orderDate}>
                        {formatDate(order.date)}
                    </Text>
                    <Text
                        style={[
                            styles.orderStatus,
                            { color: getStatusColor(order.status) },
                        ]}
                    >
                        {getStatusText(order.status)}
                    </Text>
                </View>
            </View>

            <View style={styles.orderItems}>
                {order.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemName}>
                            {item.quantity}x {item.name}
                        </Text>
                        <Text style={styles.itemPrice}>
                            {item.price * item.quantity} TL
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>Toplam</Text>
                <Text style={styles.totalValue}>{order.total} TL</Text>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="receipt-outline"
                size={64}
                color={isDarkMode ? '#8e8e93' : '#8e8e93'}
            />
            <Text style={styles.emptyText}>
                {activeTab === 'active'
                    ? 'Aktif siparişiniz bulunmuyor'
                    : 'Geçmiş siparişiniz bulunmuyor'}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'active' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'active' && styles.activeTabText,
                        ]}
                    >
                        Aktif Siparişler
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'past' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('past')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'past' && styles.activeTabText,
                        ]}
                    >
                        Geçmiş Siparişler
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
            >
                {orders[activeTab].length > 0 ? (
                    orders[activeTab].map(renderOrderCard)
                ) : (
                    renderEmptyState()
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? '#000000' : '#ffffff',
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#38383a' : '#e5e5ea',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#007aff',
    },
    tabText: {
        fontSize: 16,
        color: isDarkMode ? '#8e8e93' : '#8e8e93',
    },
    activeTabText: {
        color: '#007aff',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    orderCard: {
        backgroundColor: isDarkMode ? '#1c1c1e' : '#ffffff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: isDarkMode ? '#38383a' : '#e5e5ea',
    },
    orderHeader: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#38383a' : '#e5e5ea',
    },
    restaurantImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    orderInfo: {
        flex: 1,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: isDarkMode ? '#ffffff' : '#000000',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 14,
        color: isDarkMode ? '#8e8e93' : '#8e8e93',
    },
    orderStatus: {
        fontSize: 14,
        color: '#007aff',
        marginTop: 4,
    },
    orderItems: {
        padding: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 14,
        color: isDarkMode ? '#ffffff' : '#000000',
    },
    itemQuantity: {
        fontSize: 14,
        color: isDarkMode ? '#8e8e93' : '#8e8e93',
    },
    itemPrice: {
        fontSize: 14,
        color: isDarkMode ? '#ffffff' : '#000000',
        fontWeight: 'bold',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? '#38383a' : '#e5e5ea',
    },
    totalLabel: {
        fontSize: 16,
        color: isDarkMode ? '#8e8e93' : '#8e8e93',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007aff',
    },
    actionButton: {
        backgroundColor: '#007aff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    emptyText: {
        fontSize: 16,
        color: isDarkMode ? '#8e8e93' : '#8e8e93',
        textAlign: 'center',
        marginTop: 16,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: COLORS.danger,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
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

export default OrdersScreen; 