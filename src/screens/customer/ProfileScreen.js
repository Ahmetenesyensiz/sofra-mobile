import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    useColorScheme,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../styles/globalStyles';
import PrimaryButton from '../../components/PrimaryButton';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Heading, BodyText, Caption } from '../../components/Typography';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserData();
        fetchRecentOrders();
        fetchFavoriteRestaurants();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetch(`${API_URL}/users/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('Kullanıcı bilgileri alınamadı');
            }
            
            const data = await response.json();
            setUserData(data);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setError(error.message);
            Alert.alert('Hata', 'Kullanıcı bilgileri alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentOrders = async () => {
        try {
            const response = await fetch(`${API_URL}/orders/user/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('Siparişler alınamadı');
            }
            
            const data = await response.json();
            setRecentOrders(data.slice(0, 5)); // Son 5 sipariş
        } catch (error) {
            console.error('Error fetching recent orders:', error);
            // Siparişler yüklenemese bile uygulama çalışmaya devam etsin
        }
    };

    const fetchFavoriteRestaurants = async () => {
        try {
            const response = await fetch(`${API_URL}/restaurants/favorites/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });
            
            if (!response.ok) {
                throw new Error('Favori restoranlar alınamadı');
            }
            
            const data = await response.json();
            setFavoriteRestaurants(data);
        } catch (error) {
            console.error('Error fetching favorite restaurants:', error);
            // Favori restoranlar yüklenemese bile uygulama çalışmaya devam etsin
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Çıkış Yap',
            'Çıkış yapmak istediğinizden emin misiniz?',
            [
                {
                    text: 'Vazgeç',
                    style: 'cancel',
                },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: logout,
                },
            ]
        );
    };

    const styles = getStyles(isDarkMode);

    if (loading) {
        return (
            <LoadingSpinner
                text="Profil bilgileri yükleniyor..."
                overlay
            />
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.errorContainer]}>
                <Ionicons name="alert-circle" size={48} color={COLORS.danger} />
                <BodyText style={styles.errorText}>{error}</BodyText>
                <PrimaryButton
                    title="Tekrar Dene"
                    onPress={fetchUserData}
                    style={styles.retryButton}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Card style={styles.profileCard}>
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={
                                    userData?.profileImage
                                        ? { uri: userData.profileImage }
                                        : require('../../assets/default-avatar.png')
                                }
                                style={styles.profileImage}
                            />
                            <TouchableOpacity style={styles.editAvatarButton}>
                                <Ionicons
                                    name="camera-outline"
                                    size={16}
                                    color={COLORS.white}
                                />
                            </TouchableOpacity>
                        </View>
                        <Heading level={3} style={styles.userName}>
                            {userData?.name} {userData?.surname}
                        </Heading>
                        <Caption style={styles.userEmail}>{userData?.email}</Caption>

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <BodyText weight="bold" style={styles.statNumber}>
                                    {recentOrders.length}
                                </BodyText>
                                <Caption>Sipariş</Caption>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <BodyText weight="bold" style={styles.statNumber}>
                                    {favoriteRestaurants.length}
                                </BodyText>
                                <Caption>Favori</Caption>
                            </View>
                        </View>
                    </View>
                </Card>

                <Card style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Heading level={4}>Favori Restoranlar</Heading>
                        <TouchableOpacity>
                            <Caption color={COLORS.primary}>Tümünü Gör</Caption>
                        </TouchableOpacity>
                    </View>

                    {favoriteRestaurants.length > 0 ? (
                        favoriteRestaurants.map(restaurant => (
                            <TouchableOpacity
                                key={restaurant.id}
                                style={styles.restaurantCard}
                                onPress={() =>
                                    navigation.navigate('RestaurantDetail', {
                                        restaurantId: restaurant.id,
                                    })
                                }
                            >
                                <Image
                                    source={{ uri: restaurant.image }}
                                    style={styles.restaurantImage}
                                />
                                <View style={styles.restaurantInfo}>
                                    <BodyText weight="semiBold" style={styles.restaurantName}>
                                        {restaurant.name}
                                    </BodyText>
                                    <Caption style={styles.restaurantAddress}>
                                        {restaurant.address}
                                    </Caption>
                                </View>
                                <Ionicons
                                    name="chevron-forward-outline"
                                    size={20}
                                    color={isDarkMode ? COLORS.gray500 : COLORS.gray400}
                                />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons
                                name="heart-outline"
                                size={48}
                                color={isDarkMode ? COLORS.gray600 : COLORS.gray300}
                            />
                            <Caption style={styles.emptyText}>
                                Henüz favori restoranınız yok
                            </Caption>
                        </View>
                    )}
                </Card>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Son Siparişler</Text>
                    {recentOrders.map(order => (
                        <TouchableOpacity
                            key={order.id}
                            style={styles.orderCard}
                            onPress={() =>
                                navigation.navigate('OrderDetail', {
                                    orderId: order.id,
                                })
                            }
                        >
                            <View style={styles.orderHeader}>
                                <Text style={styles.orderDate}>
                                    {new Date(order.createdAt).toLocaleDateString(
                                        'tr-TR'
                                    )}
                                </Text>
                                <Text style={styles.orderStatus}>
                                    {order.status}
                                </Text>
                            </View>
                            <Text style={styles.orderTotal}>
                                {order.totalPrice} TL
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton
                    title="Çıkış Yap"
                    onPress={handleLogout}
                    variant="danger"
                    size="lg"
                    fullWidth
                    icon="log-out-outline"
                />
            </View>
        </View>
    );
};

const getStyles = (isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? COLORS.background.dark : COLORS.background.light,
    },
    profileCard: {
        margin: SPACING.md,
        marginBottom: SPACING.lg,
    },
    profileSection: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: SPACING.lg,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: COLORS.primary,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: isDarkMode ? COLORS.surface.darkElevated : COLORS.surface.light,
    },
    userName: {
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    userEmail: {
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? COLORS.gray700 : COLORS.border.light,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    statNumber: {
        fontSize: TYPOGRAPHY.fontSize.xl,
        marginBottom: SPACING.xs,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: isDarkMode ? COLORS.gray700 : COLORS.border.light,
    },
    sectionCard: {
        margin: SPACING.md,
        marginTop: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    restaurantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDarkMode ? COLORS.gray800 : COLORS.gray50,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.xs,
    },
    restaurantImage: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.md,
        marginRight: SPACING.md,
    },
    restaurantInfo: {
        flex: 1,
    },
    restaurantName: {
        marginBottom: SPACING.xs,
    },
    restaurantAddress: {
        // No additional styles needed, using Caption component
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    emptyText: {
        marginTop: SPACING.md,
        textAlign: 'center',
    },
    orderCard: {
        backgroundColor: isDarkMode ? COLORS.gray800 : COLORS.gray50,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.xs,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    orderDate: {
        // Using Caption component
    },
    orderStatus: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    orderTotal: {
        // Using BodyText component
    },
    footer: {
        padding: SPACING.lg,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginBottom: SPACING.md,
    },
    retryButton: {
        width: '50%',
    },
});

export default ProfileScreen; 