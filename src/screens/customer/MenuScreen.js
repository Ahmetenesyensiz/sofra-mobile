import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    useColorScheme,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const MenuScreen = () => {
    const { params } = useRoute();
    const { restaurantId } = params;

    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calling, setCalling] = useState(false);
    const [basket, setBasket] = useState([]); // [{ menuItemId, quantity }]

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await api.get(`/menu-items/restaurant/${restaurantId}`);
                setMenuItems(response.data);
            } catch (error) {
                console.error('Menü alınamadı:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [restaurantId]);

    const handleCallWaiter = async () => {
        setCalling(true);
        try {
            await api.post('/call-requests', {
                restaurantId,
                customerId: user.id,
                tableId: 'example-table-id-1',
            });
            Alert.alert('✔️ Garson çağrıldı!');
        } catch (error) {
            Alert.alert('❌ Çağrı başarısız!', error.message || 'Bir hata oluştu.');
        } finally {
            setCalling(false);
        }
    };

    const handleSubmitOrder = async () => {
        if (basket.length === 0) {
            Alert.alert('Sepet boş', 'Sipariş vermek için ürün seçmelisin.');
            return;
        }

        try {
            await api.post('/orders', {
                restaurantId,
                customerId: user.id,
                tableId: 'example-table-id-1',
                items: basket,
            });
            Alert.alert('✔️ Sipariş alındı!');
            setBasket([]);
        } catch (error) {
            Alert.alert('❌ Sipariş gönderilemedi', error.message || 'Bir hata oluştu.');
        }
    };

    const increaseQuantity = (menuItemId) => {
        setBasket((prev) => {
            const existing = prev.find((item) => item.menuItemId === menuItemId);
            if (existing) {
                return prev.map((item) =>
                    item.menuItemId === menuItemId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prev, { menuItemId, quantity: 1 }];
            }
        });
    };

    const decreaseQuantity = (menuItemId) => {
        setBasket((prev) =>
            prev
                .map((item) =>
                    item.menuItemId === menuItemId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const styles = getStyles(isDarkMode);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007aff" />
            </View>
        );
    }

    if (menuItems.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.emptyText}>Henüz menü eklenmemiş.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Menü</Text>
            <FlatList
                data={menuItems}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    const quantity = basket.find((i) => i.menuItemId === item._id)?.quantity || 0;
                    return (
                        <View style={styles.card}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.description}>{item.description}</Text>
                            <Text style={styles.price}>{item.price} ₺</Text>
                            <View style={styles.quantityRow}>
                                <TouchableOpacity style={styles.qtyButton} onPress={() => decreaseQuantity(item._id)}>
                                    <Text style={styles.qtyText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.qtyValue}>{quantity}</Text>
                                <TouchableOpacity style={styles.qtyButton} onPress={() => increaseQuantity(item._id)}>
                                    <Text style={styles.qtyText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />

            <TouchableOpacity
                style={[styles.callButton, calling && { opacity: 0.6 }]}
                onPress={handleCallWaiter}
                disabled={calling}
            >
                <Text style={styles.callButtonText}>
                    {calling ? 'Garson çağrılıyor...' : '🔔 Garsonu Çağır'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.orderButton} onPress={handleSubmitOrder}>
                <Text style={styles.orderButtonText}>🛒 Siparişi Onayla</Text>
            </TouchableOpacity>
        </View>
    );
};

export default MenuScreen;

const getStyles = (isDark) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
            backgroundColor: isDark ? '#000' : '#fff',
        },
        title: {
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 16,
            color: isDark ? '#fff' : '#000',
        },
        list: {
            gap: 12,
            paddingBottom: 16,
        },
        card: {
            backgroundColor: isDark ? '#111' : '#fff',
            borderRadius: 12,
            padding: 16,
            elevation: 2,
            shadowColor: '#000',
        },
        name: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#eee' : '#000',
        },
        description: {
            fontSize: 14,
            color: isDark ? '#aaa' : '#666',
            marginTop: 4,
        },
        price: {
            marginTop: 8,
            fontWeight: 'bold',
            fontSize: 16,
            color: '#007aff',
        },
        quantityRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 12,
            gap: 8,
        },
        qtyButton: {
            backgroundColor: isDark ? '#333' : '#eee',
            paddingVertical: 4,
            paddingHorizontal: 12,
            borderRadius: 6,
        },
        qtyText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#fff' : '#000',
        },
        qtyValue: {
            fontSize: 16,
            fontWeight: '600',
            color: isDark ? '#fff' : '#000',
        },
        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyText: {
            fontSize: 16,
            color: isDark ? '#888' : '#777',
        },
        orderButton: {
            backgroundColor: '#28a745',
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center',
            marginTop: 12,
        },
        orderButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        callButton: {
            backgroundColor: '#ff9500',
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center',
            marginTop: 12,
        },
        callButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
        },
    });
