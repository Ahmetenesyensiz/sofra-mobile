import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    useColorScheme,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';

const FriendRequestsScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await fetch(`${API_URL}/api/friends/requests`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching friend requests:', error);
            Alert.alert('Hata', 'Arkadaşlık istekleri alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await fetch(
                `${API_URL}/api/friends/requests/${requestId}/accept`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }
            );

            if (response.ok) {
                setRequests(prev =>
                    prev.filter(request => request.id !== requestId)
                );
                Alert.alert('Başarılı', 'Arkadaşlık isteği kabul edildi.');
            } else {
                throw new Error('İstek kabul edilemedi.');
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
            Alert.alert('Hata', 'İstek kabul edilemedi.');
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            const response = await fetch(
                `${API_URL}/api/friends/requests/${requestId}/reject`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }
            );

            if (response.ok) {
                setRequests(prev =>
                    prev.filter(request => request.id !== requestId)
                );
            } else {
                throw new Error('İstek reddedilemedi.');
            }
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            Alert.alert('Hata', 'İstek reddedilemedi.');
        }
    };

    const renderRequestItem = ({ item }) => (
        <View style={styles.requestItem}>
            <Image
                source={
                    item.sender.profileImage
                        ? { uri: item.sender.profileImage }
                        : require('../../assets/default-avatar.png')
                }
                style={styles.requestImage}
            />
            <View style={styles.requestInfo}>
                <Text style={styles.requestName}>
                    {item.sender.name} {item.sender.surname}
                </Text>
                <Text style={styles.requestEmail}>{item.sender.email}</Text>
            </View>
            <View style={styles.requestActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAcceptRequest(item.id)}
                >
                    <Ionicons name="checkmark" size={24} color="#34c759" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleRejectRequest(item.id)}
                >
                    <Ionicons name="close" size={24} color="#ff3b30" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#000000' : '#ffffff',
        },
        header: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#38383a' : '#e5e5ea',
            flexDirection: 'row',
            alignItems: 'center',
        },
        backButton: {
            padding: 8,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginLeft: 16,
        },
        content: {
            flex: 1,
        },
        requestItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#38383a' : '#e5e5ea',
        },
        requestImage: {
            width: 50,
            height: 50,
            borderRadius: 25,
            marginRight: 12,
        },
        requestInfo: {
            flex: 1,
        },
        requestName: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 4,
        },
        requestEmail: {
            fontSize: 14,
            color: isDark ? '#8e8e93' : '#8e8e93',
        },
        requestActions: {
            flexDirection: 'row',
        },
        actionButton: {
            padding: 8,
            marginLeft: 8,
        },
        acceptButton: {
            backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7',
            borderRadius: 8,
        },
        rejectButton: {
            backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7',
            borderRadius: 8,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        emptyText: {
            fontSize: 16,
            color: isDark ? '#8e8e93' : '#8e8e93',
            textAlign: 'center',
        },
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007aff" />
            </View>
        );
    }

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
                <Text style={styles.title}>Arkadaşlık İstekleri</Text>
            </View>

            <View style={styles.content}>
                {requests.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            Bekleyen arkadaşlık isteği bulunmuyor.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={requests}
                        renderItem={renderRequestItem}
                        keyExtractor={item => item.id}
                    />
                )}
            </View>
        </View>
    );
};

export default FriendRequestsScreen; 