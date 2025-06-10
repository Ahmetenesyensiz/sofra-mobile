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
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';
import PrimaryButton from '../../components/PrimaryButton';

const CartScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { cartItems, updateCartItem, removeFromCart, clearCart } = useCart();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#000000' : '#ffffff',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#38383a' : '#e5e5ea',
        },
        backButton: {
            marginRight: 16,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
        },
        content: {
            flex: 1,
            padding: 16,
        },
        restaurantSection: {
            marginBottom: 24,
        },
        restaurantHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        restaurantImage: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 12,
        },
        restaurantName: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
        },
        itemCard: {
            flexDirection: 'row',
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: isDark ? '#38383a' : '#e5e5ea',
        },
        itemImage: {
            width: 80,
            height: 80,
            borderRadius: 8,
            marginRight: 12,
        },
        itemInfo: {
            flex: 1,
        },
        itemName: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 4,
        },
        itemPrice: {
            fontSize: 16,
            color: '#007aff',
            fontWeight: 'bold',
        },
        quantityContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
        },
        quantityButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isDark ? '#38383a' : '#f2f2f7',
            justifyContent: 'center',
            alignItems: 'center',
        },
        quantityText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginHorizontal: 12,
        },
        removeButton: {
            position: 'absolute',
            top: 12,
            right: 12,
        },
        summaryContainer: {
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            borderRadius: 12,
            padding: 16,
            marginTop: 16,
            borderWidth: 1,
            borderColor: isDark ? '#38383a' : '#e5e5ea',
        },
        summaryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        summaryLabel: {
            fontSize: 16,
            color: isDark ? '#8e8e93' : '#8e8e93',
        },
        summaryValue: {
            fontSize: 16,
            color: isDark ? '#ffffff' : '#000000',
        },
        totalRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#38383a' : '#e5e5ea',
        },
        totalLabel: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
        },
        totalValue: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#007aff',
        },
        footer: {
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#38383a' : '#e5e5ea',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
        },
        emptyText: {
            fontSize: 16,
            color: isDark ? '#8e8e93' : '#8e8e93',
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
        browseButton: {
            marginTop: 16,
            width: '80%',
        },
    });

    const updateQuantity = async (itemId, newQuantity) => {
        try {
            if (newQuantity < 1) {
                Alert.alert(
                    'Ürünü Kaldır',
                    'Bu ürünü sepetten kaldırmak istediğinizden emin misiniz?',
                    [
                        {
                            text: 'Vazgeç',
                            style: 'cancel',
                        },
                        {
                            text: 'Kaldır',
                            style: 'destructive',
                            onPress: () => removeFromCart(itemId),
                        },
                    ]
                );
                return;
            }

            updateCartItem(itemId, newQuantity);
        } catch (error) {
            console.error('Error updating cart item:', error);
            Alert.alert('Hata', 'Ürün miktarı güncellenemedi');
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const calculateDeliveryFee = () => {
        return 15; // Sabit teslimat ücreti
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateDeliveryFee();
    };

    const handleCheckout = async () => {
        try {
            setLoading(true);
            setError(null);

            // Sipariş oluştur
            const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    items: cartItems,
                    totalAmount: calculateTotal(),
                    deliveryFee: calculateDeliveryFee(),
                }),
            });

            if (!response.ok) {
                throw new Error('Sipariş oluşturulamadı');
            }

            const order = await response.json();
            clearCart(); // Sepeti temizle
            navigation.navigate('Payment', {
                orderId: order.id,
                amount: calculateTotal(),
            });
        } catch (error) {
            console.error('Error creating order:', error);
            setError(error.message);
            Alert.alert('Hata', 'Sipariş oluşturulamadı');
        } finally {
            setLoading(false);
        }
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
                    onPress={() => setError(null)}
                >
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (cartItems.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={isDark ? '#ffffff' : '#000000'}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Sepetim</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons
                        name="cart-outline"
                        size={64}
                        color={isDark ? '#8e8e93' : '#8e8e93'}
                    />
                    <Text style={styles.emptyText}>
                        Sepetinizde ürün bulunmuyor
                    </Text>
                    <PrimaryButton
                        title="Restoranlara Göz At"
                        onPress={() => navigation.navigate('Home')}
                        style={styles.browseButton}
                    />
                </View>
            </View>
        );
    }

    // Restoranları grupla
    const restaurants = [...new Set(cartItems.map(item => item.restaurantId))];
    const groupedItems = restaurants.map(restaurantId => ({
        restaurantId,
        restaurantName: cartItems.find(item => item.restaurantId === restaurantId)?.restaurant,
        items: cartItems.filter(item => item.restaurantId === restaurantId),
    }));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={isDark ? '#ffffff' : '#000000'}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sepetim</Text>
            </View>

            <ScrollView style={styles.content}>
                {groupedItems.map(group => (
                    <View key={group.restaurantId} style={styles.restaurantSection}>
                        <View style={styles.restaurantHeader}>
                            <Text style={styles.restaurantName}>
                                {group.restaurantName}
                            </Text>
                        </View>

                        {group.items.map(item => (
                            <View key={item.id} style={styles.itemCard}>
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.itemImage}
                                />
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemPrice}>
                                        {item.price} TL
                                    </Text>
                                    <View style={styles.quantityContainer}>
                                        <TouchableOpacity
                                            style={styles.quantityButton}
                                            onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Ionicons
                                                name="remove"
                                                size={20}
                                                color={isDark ? '#ffffff' : '#000000'}
                                            />
                                        </TouchableOpacity>
                                        <Text style={styles.quantityText}>
                                            {item.quantity}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.quantityButton}
                                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Ionicons
                                                name="add"
                                                size={20}
                                                color={isDark ? '#ffffff' : '#000000'}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => updateQuantity(item.id, 0)}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={24}
                                        color={isDark ? '#8e8e93' : '#8e8e93'}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ))}

                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Ara Toplam</Text>
                        <Text style={styles.summaryValue}>
                            {calculateSubtotal()} TL
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Teslimat Ücreti</Text>
                        <Text style={styles.summaryValue}>
                            {calculateDeliveryFee()} TL
                        </Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Toplam</Text>
                        <Text style={styles.totalValue}>
                            {calculateTotal()} TL
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Siparişi Tamamla"
                    onPress={handleCheckout}
                    disabled={loading}
                />
            </View>
        </View>
    );
};

export default CartScreen; 