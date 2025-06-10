import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    useColorScheme,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';

const FriendListScreen = () => {
    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const response = await fetch(`${API_URL}/friends`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (!response.ok) throw new Error('Arkadaş listesi alınamadı');
            
            const data = await response.json();
            setFriends(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderFriendItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.friendItem, { backgroundColor: isDarkMode ? COLORS.background.darkSecondary : COLORS.background.light }]}
            onPress={() => {/* Arkadaş profiline git */}}
        >
            <Image
                source={{ uri: item.profileImage || 'https://via.placeholder.com/50' }}
                style={styles.profileImage}
            />
            <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: isDarkMode ? COLORS.text.darkPrimary : COLORS.text.primary }]}>
                    {item.name}
                </Text>
                <Text style={[styles.friendStatus, { color: isDarkMode ? COLORS.text.darkSecondary : COLORS.text.secondary }]}>
                    {item.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                </Text>
            </View>
            <TouchableOpacity style={styles.messageButton}>
                <Ionicons name="chatbubble-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

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
                <TouchableOpacity style={styles.retryButton} onPress={fetchFriends}>
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? COLORS.background.dark : COLORS.background.light }]}>
            <FlatList
                data={friends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="people-outline"
                            size={48}
                            color={isDarkMode ? COLORS.gray600 : COLORS.gray400}
                        />
                        <Text style={[styles.emptyText, { color: isDarkMode ? COLORS.text.darkSecondary : COLORS.text.secondary }]}>
                            Henüz arkadaşınız yok
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
    listContent: {
        padding: 16,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border.light,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    friendInfo: {
        flex: 1,
        marginLeft: 12,
    },
    friendName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    friendStatus: {
        fontSize: 14,
    },
    messageButton: {
        padding: 8,
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

export default FriendListScreen;
