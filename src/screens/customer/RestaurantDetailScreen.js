import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    useColorScheme,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';
import { useCart } from '../../contexts/CartContext';

const { width } = Dimensions.get('window');

const RestaurantDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState(['Tümü']);

    useEffect(() => {
        fetchRestaurantDetails();
    }, []);

    const fetchRestaurantDetails = async () => {
        try {
            const restaurantId = route.params?.id;
            if (!restaurantId) {
                throw new Error('Restoran ID bulunamadı');
            }

            const response = await fetch(`${API_URL}/restaurants/${restaurantId}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Restoran bilgileri alınamadı');
            }

            const data = await response.json();
            setRestaurant(data);
            setMenuItems(data.menuItems || []);
            
            // Kategorileri menü öğelerinden çıkar
            const uniqueCategories = ['Tümü', ...new Set(data.menuItems?.map(item => item.category) || [])];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
            setError(error.message);
            Alert.alert('Hata', 'Restoran bilgileri alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (item) => {
        try {
            addToCart({
                ...item,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
            });
            Alert.alert('Başarılı', 'Ürün sepete eklendi');
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Hata', 'Ürün sepete eklenemedi');
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
                    onPress={fetchRestaurantDetails}
                >
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const filteredMenuItems = selectedCategory === 'Tümü'
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: restaurant?.imageUrl || 'https://picsum.photos/400' }}
                    style={styles.headerImage}
                />
                <View style={styles.headerOverlay} />
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.restaurantName}>{restaurant?.name}</Text>
                    <View style={styles.restaurantInfo}>
                        <Ionicons name="star" size={16} color="#ffd700" />
                        <Text style={styles.infoText}>
                            {restaurant?.rating?.toFixed(1)} ({restaurant?.reviewCount || 0} değerlendirme)
                        </Text>
                    </View>
                    <View style={styles.restaurantInfo}>
                        <Ionicons name="location-outline" size={16} color="#ffffff" />
                        <Text style={styles.infoText}>{restaurant?.distance || '0'} km uzaklıkta</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryContainer}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category && styles.selectedCategoryButton,
                            ]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    selectedCategory === category && styles.selectedCategoryText,
                                ]}
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {filteredMenuItems.map((item) => (
                    <View key={item.id} style={styles.menuItem}>
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.menuItemImage}
                        />
                        <View style={styles.menuItemContent}>
                            <Text style={styles.menuItemName}>{item.name}</Text>
                            <Text style={styles.menuItemDescription}>
                                {item.description}
                            </Text>
                            <Text style={styles.menuItemPrice}>{item.price} TL</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => handleAddToCart(item)}
                        >
                            <Ionicons name="add" size={24} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDark ? '#000000' : '#ffffff',
    },
    header: {
        height: 250,
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    headerContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    restaurantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        color: '#ffffff',
        marginLeft: 4,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
    },
    content: {
        padding: 16,
    },
    categoryContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: isDark ? '#2c2c2e' : '#f2f2f7',
    },
    selectedCategoryButton: {
        backgroundColor: '#007aff',
    },
    categoryText: {
        color: isDark ? '#ffffff' : '#000000',
    },
    selectedCategoryText: {
        color: '#ffffff',
    },
    menuItem: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: isDark ? '#38383a' : '#e5e5ea',
    },
    menuItemImage: {
        width: 100,
        height: 100,
    },
    menuItemContent: {
        flex: 1,
        padding: 12,
    },
    menuItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: isDark ? '#ffffff' : '#000000',
        marginBottom: 4,
    },
    menuItemDescription: {
        fontSize: 14,
        color: isDark ? '#8e8e93' : '#8e8e93',
        marginBottom: 8,
    },
    menuItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007aff',
    },
    addButton: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        backgroundColor: '#007aff',
        borderRadius: 20,
        padding: 8,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#007aff',
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
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

export default RestaurantDetailScreen;
