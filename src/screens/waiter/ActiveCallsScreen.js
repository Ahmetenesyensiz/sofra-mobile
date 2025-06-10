import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    useColorScheme,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';
import io from 'socket.io-client';

const ActiveCallsScreen = () => {
    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';

    const [restaurantId, setRestaurantId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const [activeCalls, setActiveCalls] = useState([]);

    const fetchData = async () => {
        try {
            setError(null);
            const response = await fetch(`${API_URL}/restaurants/waiter/${user.id}`, {
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

            const callsRes = await fetch(`${API_URL}/calls/restaurant/${restaurant.id}?status=active`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (!callsRes.ok) {
                throw new Error('Çağrılar alınamadı');
            }

            const callsData = await callsRes.json();
            setActiveCalls(callsData);
        } catch (err) {
            console.error('Veriler alınamadı:', err);
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

        newSocket.on('newCall', () => {
            fetchData();
        });

        newSocket.on('callStatusChanged', () => {
            fetchData();
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [user.id, user.token]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const handleCallResponse = async (callId, status) => {
        try {
            const response = await fetch(`${API_URL}/calls/${callId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error('Çağrı durumu güncellenemedi');
            }

            Alert.alert('Başarılı', 'Çağrı durumu güncellendi');
            fetchData();
        } catch (err) {
            Alert.alert('Hata', err.message);
        }
    };

    const getCallTypeIcon = (type) => {
        switch (type) {
            case 'waiter':
                return '👨‍🍳';
            case 'bill':
                return '💵';
            case 'help':
                return '❓';
            default:
                return '📞';
        }
    };

    const getCallTypeText = (type) => {
        switch (type) {
            case 'waiter':
                return 'Garson Çağrısı';
            case 'bill':
                return 'Hesap İsteği';
            case 'help':
                return 'Yardım İsteği';
            default:
                return 'Çağrı';
        }
    };

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
        <View style={styles.container}>
            <Text style={styles.title}>📞 Aktif Çağrılar</Text>

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
            >
                {activeCalls.length === 0 ? (
                    <Text style={styles.emptyText}>Aktif çağrı bulunmuyor.</Text>
                ) : (
                    activeCalls.map((call) => (
                        <View key={call.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.tableNumber}>
                                        Masa {call.tableId}
                                    </Text>
                                    <Text style={styles.callTime}>
                                        {new Date(call.createdAt).toLocaleTimeString()}
                                    </Text>
                                </View>
                                <Text style={styles.callType}>
                                    {getCallTypeIcon(call.type)} {getCallTypeText(call.type)}
                                </Text>
                            </View>

                            {call.notes && (
                                <View style={styles.notes}>
                                    <Text style={styles.notesText}>{call.notes}</Text>
                                </View>
                            )}

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.respondButton]}
                                    onPress={() => handleCallResponse(call.id, 'responded')}
                                >
                                    <Text style={styles.actionButtonText}>✅ Yanıtlandı</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.completeButton]}
                                    onPress={() => handleCallResponse(call.id, 'completed')}
                                >
                                    <Text style={styles.actionButtonText}>🎉 Tamamlandı</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default ActiveCallsScreen;

const getStyles = (isDarkMode) =>
    StyleSheet.create({
        container: {
            flex: 1,
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
            marginVertical: 20,
            textAlign: 'center',
            color: isDarkMode ? '#fff' : '#000',
        },
        emptyText: {
            fontSize: 16,
            color: isDarkMode ? '#aaa' : '#777',
            textAlign: 'center',
            marginTop: 20,
        },
        card: {
            backgroundColor: isDarkMode ? '#111' : '#f2f2f2',
            marginHorizontal: 20,
            marginBottom: 15,
            padding: 15,
            borderRadius: 10,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 10,
        },
        tableNumber: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000',
            marginBottom: 4,
        },
        callTime: {
            fontSize: 14,
            color: isDarkMode ? '#aaa' : '#666',
        },
        callType: {
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#fff' : '#000',
        },
        notes: {
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#333' : '#ddd',
        },
        notesText: {
            fontSize: 14,
            color: isDarkMode ? '#eee' : '#222',
            fontStyle: 'italic',
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 15,
            paddingTop: 15,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#333' : '#ddd',
        },
        actionButton: {
            flex: 1,
            paddingVertical: 8,
            marginHorizontal: 5,
            borderRadius: 6,
            alignItems: 'center',
        },
        respondButton: {
            backgroundColor: COLORS.primary,
        },
        completeButton: {
            backgroundColor: COLORS.success,
        },
        actionButtonText: {
            color: '#fff',
            fontSize: 14,
            fontWeight: '600',
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
