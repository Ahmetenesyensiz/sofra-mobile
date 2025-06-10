import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    useColorScheme,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';
import CustomInput from '../../components/CustomInput';
import PrimaryButton from '../../components/PrimaryButton';
import io from 'socket.io-client';

const MenuManagementScreen = () => {
    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';

    const [restaurantId, setRestaurantId] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [editingItem, setEditingItem] = useState(null);
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

            const [menuRes, categoriesRes] = await Promise.all([
                fetch(`${API_URL}/menu-items/restaurant/${restaurant.id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }),
                fetch(`${API_URL}/categories/restaurant/${restaurant.id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }),
            ]);

            if (!menuRes.ok || !categoriesRes.ok) {
                throw new Error('Veriler alınamadı');
            }

            const [menuData, categoriesData] = await Promise.all([
                menuRes.json(),
                categoriesRes.json(),
            ]);

            setMenuItems(menuData);
            setCategories(categoriesData);
        } catch (err) {
            console.error('Menü verisi alınamadı:', err);
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

        newSocket.on('menuItemUpdated', () => {
            fetchData();
        });

        newSocket.on('categoryUpdated', () => {
            fetchData();
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [user.id, user.token]);

    const handleAddCategory = async () => {
        if (!newCategory) {
            Alert.alert('Hata', 'Kategori adı zorunludur.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    restaurantId,
                    name: newCategory,
                }),
            });

            if (!response.ok) {
                throw new Error('Kategori eklenemedi');
            }

            setNewCategory('');
            fetchData();
        } catch (err) {
            Alert.alert('Hata', err.message);
        }
    };

    const handleAddItem = async () => {
        if (!name || !price || !category) {
            Alert.alert('Hata', 'İsim, fiyat ve kategori zorunludur.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/menu-items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    restaurantId,
                    name,
                    description,
                    price: parseFloat(price),
                    stock: parseInt(stock) || 0,
                    categoryId: category,
                }),
            });

            if (!response.ok) {
                throw new Error('Ürün eklenemedi');
            }

            setName('');
            setDescription('');
            setPrice('');
            setStock('');
            setCategory('');
            fetchData();
        } catch (err) {
            Alert.alert('Hata', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateItem = async (item) => {
        setEditingItem(item);
        setName(item.name);
        setDescription(item.description || '');
        setPrice(item.price.toString());
        setStock(item.stock?.toString() || '');
        setCategory(item.categoryId);
    };

    const handleSaveUpdate = async () => {
        if (!editingItem) return;

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/menu-items/${editingItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    name,
                    description,
                    price: parseFloat(price),
                    stock: parseInt(stock) || 0,
                    categoryId: category,
                }),
            });

            if (!response.ok) {
                throw new Error('Ürün güncellenemedi');
            }

            setEditingItem(null);
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
            setCategory('');
            fetchData();
        } catch (err) {
            Alert.alert('Hata', err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteItem = async (itemId) => {
        Alert.alert(
            'Onay',
            'Bu ürünü silmek istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/menu-items/${itemId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${user.token}`,
                                },
                            });

                            if (!response.ok) {
                                throw new Error('Ürün silinemedi');
                            }

                            fetchData();
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
            <Text style={styles.title}>🍽️ Menü Yönetimi</Text>

            <View style={styles.section}>
                <Text style={styles.subtitle}>📑 Kategori Ekle</Text>
                <CustomInput
                    label="Kategori Adı"
                    value={newCategory}
                    onChangeText={setNewCategory}
                    placeholder="Yeni Kategori"
                />
                <PrimaryButton
                    title="➕ Kategori Ekle"
                    onPress={handleAddCategory}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>
                    {editingItem ? '✏️ Ürün Düzenle' : '➕ Yeni Ürün Ekle'}
                </Text>
                <CustomInput
                    label="Ürün Adı"
                    value={name}
                    onChangeText={setName}
                    placeholder="Ad"
                />
                <CustomInput
                    label="Açıklama"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Açıklama"
                />
                <CustomInput
                    label="Fiyat"
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                />
                <CustomInput
                    label="Stok"
                    value={stock}
                    onChangeText={setStock}
                    placeholder="0"
                    keyboardType="number-pad"
                />
                <CustomInput
                    label="Kategori"
                    value={category}
                    onChangeText={setCategory}
                    placeholder="Kategori Seçin"
                    picker
                    pickerItems={categories.map(cat => ({
                        label: cat.name,
                        value: cat.id,
                    }))}
                />

                {editingItem ? (
                    <View style={styles.buttonRow}>
                        <PrimaryButton
                            title="💾 Kaydet"
                            onPress={handleSaveUpdate}
                            loading={submitting}
                        />
                        <PrimaryButton
                            title="❌ İptal"
                            onPress={() => {
                                setEditingItem(null);
                                setName('');
                                setDescription('');
                                setPrice('');
                                setStock('');
                                setCategory('');
                            }}
                            style={styles.cancelButton}
                        />
                    </View>
                ) : (
                    <PrimaryButton
                        title="➕ Ürün Ekle"
                        onPress={handleAddItem}
                        loading={submitting}
                    />
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>📋 Mevcut Ürünler</Text>
                {categories.map(category => (
                    <View key={category.id}>
                        <Text style={styles.categoryTitle}>{category.name}</Text>
                        {menuItems
                            .filter(item => item.categoryId === category.id)
                            .map(item => (
                                <View key={item.id} style={styles.card}>
                                    <View style={styles.itemHeader}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <View style={styles.itemActions}>
                                            <TouchableOpacity
                                                onPress={() => handleUpdateItem(item)}
                                                style={styles.actionButton}
                                            >
                                                <Text style={styles.actionButtonText}>✏️</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleDeleteItem(item.id)}
                                                style={styles.actionButton}
                                            >
                                                <Text style={styles.actionButtonText}>🗑️</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <Text style={styles.itemDescription}>{item.description}</Text>
                                    <View style={styles.itemFooter}>
                                        <Text style={styles.itemPrice}>{item.price} ₺</Text>
                                        <Text style={styles.itemStock}>
                                            Stok: {item.stock || 0}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

export default MenuManagementScreen;

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
        section: {
            marginBottom: 30,
        },
        card: {
            backgroundColor: isDarkMode ? '#111' : '#f2f2f2',
            padding: 16,
            borderRadius: 10,
            marginBottom: 10,
        },
        itemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        itemName: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000',
            flex: 1,
        },
        itemActions: {
            flexDirection: 'row',
            gap: 10,
        },
        actionButton: {
            padding: 5,
        },
        actionButtonText: {
            fontSize: 16,
        },
        itemDescription: {
            fontSize: 14,
            color: isDarkMode ? '#aaa' : '#666',
            marginTop: 4,
        },
        itemFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 6,
        },
        itemPrice: {
            fontWeight: 'bold',
            color: COLORS.success,
        },
        itemStock: {
            color: isDarkMode ? '#aaa' : '#666',
        },
        categoryTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#fff' : '#000',
            marginTop: 20,
            marginBottom: 10,
        },
        buttonRow: {
            flexDirection: 'row',
            gap: 10,
        },
        cancelButton: {
            backgroundColor: COLORS.danger,
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
