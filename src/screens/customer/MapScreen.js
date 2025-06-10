import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';

const { width, height } = Dimensions.get('window');

const MapScreen = () => {
    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';
    const [location, setLocation] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    throw new Error('Konum izni reddedildi');
                }

                const location = await Location.getCurrentPositionAsync({});
                setLocation(location);

                // Restoranları getir
                const response = await fetch(`${API_URL}/restaurants/nearby`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                });

                if (!response.ok) throw new Error('Restoranlar alınamadı');
                
                const data = await response.json();
                setRestaurants(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: location?.coords.latitude || 41.0082,
                    longitude: location?.coords.longitude || 28.9784,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation
                showsMyLocationButton
            >
                {restaurants.map((restaurant) => (
                    <Marker
                        key={restaurant.id}
                        coordinate={{
                            latitude: restaurant.latitude,
                            longitude: restaurant.longitude,
                        }}
                        title={restaurant.name}
                        description={restaurant.description}
                    />
                ))}
            </MapView>
            <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={async () => {
                    try {
                        const location = await Location.getCurrentPositionAsync({});
                        setLocation(location);
                    } catch (error) {
                        console.error('Konum alınamadı:', error);
                    }
                }}
            >
                <Ionicons name="locate" size={24} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width,
        height,
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
        color: COLORS.danger,
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
    },
    currentLocationButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: COLORS.primary,
        width: 50,
        height: 50,
        borderRadius: 25,
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
});

export default MapScreen;
