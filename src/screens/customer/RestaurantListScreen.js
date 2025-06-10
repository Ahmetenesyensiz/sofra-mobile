import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    useColorScheme,
} from 'react-native';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';

const RestaurantListScreen = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const isDarkMode = useColorScheme() === 'dark';

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await api.get('/restaurants');
                setRestaurants(response.data);
            } catch (error) {
                console.error('Restoranlar alınamadı:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const styles = getStyles(isDarkMode);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007aff" />
            </View>
        );
    }

    if (restaurants.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.emptyText}>Henüz restoran bulunamadı.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Restoranlar</Text>
            <FlatList
                data={restaurants}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('Menu', { restaurantId: item._id })}
                    >
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.location}>{item.location}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

export default RestaurantListScreen;

const getStyles = (isDark) =>
    StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
            paddingTop: 40,
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
            paddingBottom: 24,
        },
        card: {
            backgroundColor: isDark ? '#111' : '#f9f9f9',
            padding: 16,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 6,
            elevation: 3,
        },
        name: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#eee' : '#000',
        },
        location: {
            fontSize: 14,
            color: isDark ? '#aaa' : '#666',
            marginTop: 4,
        },
        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyText: {
            fontSize: 16,
            color: isDark ? '#888' : '#666',
        },
    });
