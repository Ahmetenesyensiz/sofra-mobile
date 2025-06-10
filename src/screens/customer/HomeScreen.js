import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    useColorScheme,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import useCache from '../../hooks/useCache';
import { handleApiError } from '../../services/api';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';
    const [refreshing, setRefreshing] = useState(false);

    const fetchRestaurants = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/restaurants`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });
            if (!response.ok) throw new Error('Restoranlar alınamadı');
            return await response.json();
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }, [user.token]);

    const {
        data: restaurants,
        loading,
        error,
        refetch,
        invalidate,
    } = useCache('restaurants', fetchRestaurants, {
        onError: (error) => {
            console.error('Restoranlar yüklenirken hata:', error);
        },
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await invalidate();
        setRefreshing(false);
    }, [invalidate]);

    const renderRestaurantItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.restaurantCard,
                { backgroundColor: isDarkMode ? '#1c1c1e' : '#fff' },
            ]}
            onPress={() => navigation.navigate('RestaurantDetail', { id: item.id })}
        >
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.restaurantImage}
                resizeMode="cover"
            />
            <View style={styles.restaurantInfo}>
                <Text
                    style={[
                        styles.restaurantName,
                        { color: isDarkMode ? '#fff' : '#000' },
                    ]}
                >
                    {item.name}
                </Text>
                <Text
                    style={[
                        styles.restaurantDescription,
                        { color: isDarkMode ? '#ccc' : '#666' },
                    ]}
                >
                    {item.description}
                </Text>
                <View style={styles.restaurantMeta}>
                    <View style={styles.ratingContainer}>
                        <Ionicons
                            name="star"
                            size={16}
                            color="#ffd700"
                        />
                        <Text
                            style={[
                                styles.rating,
                                { color: isDarkMode ? '#fff' : '#000' },
                            ]}
                        >
                            {(item.rating || 0).toFixed(1)}
                        </Text>
                    </View>
                    <Text
                        style={[
                            styles.deliveryTime,
                            { color: isDarkMode ? '#ccc' : '#666' },
                        ]}
                    >
                        {item.deliveryTime || 30} dk
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007aff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#ff3b30" />
                <Text style={styles.errorText}>{error.message}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={refetch}
                >
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: isDarkMode ? '#000' : '#f2f2f7' },
            ]}
        >
            <FlatList
                data={restaurants}
                renderItem={renderRestaurantItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007aff']}
                        tintColor={isDarkMode ? '#fff' : '#007aff'}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="restaurant-outline"
                            size={48}
                            color={isDarkMode ? '#666' : '#999'}
                        />
                        <Text
                            style={[
                                styles.emptyText,
                                { color: isDarkMode ? '#666' : '#999' },
                            ]}
                        >
                            Henüz restoran bulunmuyor
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#007aff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    restaurantCard: {
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    restaurantImage: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    restaurantInfo: {
        padding: 16,
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    restaurantDescription: {
        fontSize: 14,
        marginBottom: 8,
    },
    restaurantMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
    },
    deliveryTime: {
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 12,
        textAlign: 'center',
    },
});

export default HomeScreen; 