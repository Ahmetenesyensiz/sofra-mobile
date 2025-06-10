import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    useColorScheme,
    Alert,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';

const OrderDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params;
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Sipariş detayları yüklenemedi');
            }

            const data = await response.json();
            setOrder(data);
        } catch (error) {
            console.error('Error fetching order details:', error);
            setError(error.message);
            Alert.alert('Hata', 'Sipariş detayları yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const handleCall = () => {
        if (order?.contactPhone) {
            Linking.openURL(`tel:${order.contactPhone}`);
        }
    };

    const handleCancel = async () => {
        Alert.alert(
            'Siparişi İptal Et',
            'Bu siparişi iptal etmek istediğinizden emin misiniz?',
            [
                {
                    text: 'Vazgeç',
                    style: 'cancel',
                },
                {
                    text: 'İptal Et',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${user.token}`,
                                },
                            });

                            if (!response.ok) {
                                throw new Error('Sipariş iptal edilemedi');
                            }

                            Alert.alert('Başarılı', 'Siparişiniz iptal edildi');
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error cancelling order:', error);
                            Alert.alert('Hata', 'Sipariş iptal edilemedi');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

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

    if (loading) {
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
                    onPress={fetchOrderDetails}
                >
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Ionicons name="alert-circle" size={48} color={COLORS.danger} />
                <Text style={styles.errorText}>Sipariş bulunamadı</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchOrderDetails}
                >
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <View style={styles.restaurantInfo}>
                        <Image
                            source={{ uri: order.restaurantImage }}
                            style={styles.restaurantImage}
                        />
                        <View>
                            <Text style={styles.restaurantName}>
                                {order.restaurant}
                            </Text>
                            <Text style={styles.orderDate}>
                                {formatDate(order.date)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statusContainer}>
                        <Text style={styles.statusTitle}>Sipariş Durumu</Text>
                        <Text
                            style={[
                                styles.statusText,
                                { color: getStatusColor(order.status) },
                            ]}
                        >
                            {getStatusText(order.status)}
                        </Text>
                        {order.estimatedTime && (
                            <Text style={styles.estimatedTime}>
                                Tahmini Teslimat: {order.estimatedTime}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sipariş Detayları</Text>
                        {order.items.map((item, index) => (
                            <View key={index} style={styles.itemRow}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.itemQuantity}>
                                        {item.quantity} adet
                                    </Text>
                                </View>
                                <Text style={styles.itemPrice}>
                                    {item.price * item.quantity} TL
                                </Text>
                            </View>
                        ))}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Toplam</Text>
                            <Text style={styles.totalValue}>
                                {order.total} TL
                            </Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Teslimat Bilgileri</Text>
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="location-outline"
                                size={24}
                                color={isDarkMode ? '#ffffff' : '#000000'}
                                style={styles.infoIcon}
                            />
                            <Text style={styles.infoText}>
                                {order.deliveryAddress}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="card-outline"
                                size={24}
                                color={isDarkMode ? '#ffffff' : '#000000'}
                                style={styles.infoIcon}
                            />
                            <Text style={styles.infoText}>
                                {order.paymentMethod}
                            </Text>
                        </View>
                        {order.notes && (
                            <View style={styles.infoRow}>
                                <Ionicons
                                    name="chatbubble-outline"
                                    size={24}
                                    color={isDarkMode ? '#ffffff' : '#000000'}
                                    style={styles.infoIcon}
                                />
                                <Text style={styles.infoText}>{order.notes}</Text>
                            </View>
                        )}
                    </View>

                    {order.status === 'preparing' && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>
                                Siparişi İptal Et
                            </Text>
                        </TouchableOpacity>
                    )}

                    {order.status === 'onTheWay' && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleCall}
                        >
                            <Text style={styles.actionButtonText}>
                                Kuryeyi Ara
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? '#000000' : '#ffffff',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#38383a' : '#e5e5ea',
    },
    restaurantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    restaurantImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
    },
    restaurantName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: isDarkMode ? '#ffffff' : '#000000',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 14,
        color: isDarkMode ? '#8e8e93' : '#8e8e93',
    },
    statusContainer: {
        backgroundColor: isDarkMode ? '#1c1c1e' : '#f2f2f7',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: isDarkMode ? '#ffffff' : '#000000',
        marginBottom: 8,
    },
    statusText: {
        fontSize: 14,
        color: '#007aff',
    },
    estimatedTime: {
        fontSize: 14,
        color: isDarkMode ? '#8e8e93' : '#8e8e93',
        marginTop: 4,
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: isDarkMode ? '#ffffff' : '#000000',
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        color: isDarkMode ? '#ffffff' : '#000000',
    },
    itemQuantity: {
        fontSize: 14,
        color: isDarkMode ? '#8e8e93' : '#8e8e93',
    },
    itemPrice: {
        fontSize: 16,
        color: isDarkMode ? '#ffffff' : '#000000',
        fontWeight: 'bold',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? '#38383a' : '#e5e5ea',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: isDarkMode ? '#ffffff' : '#000000',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007aff',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoIcon: {
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 16,
        color: isDarkMode ? '#ffffff' : '#000000',
    },
    actionButton: {
        backgroundColor: '#007aff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#ff3b30',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
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

export default OrderDetailScreen; 