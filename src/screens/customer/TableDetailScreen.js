import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    Alert,
    useColorScheme,
    ActivityIndicator,
    Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import QRCode from 'react-native-qrcode-svg';

const TableDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [loading, setLoading] = useState(true);
    const [table, setTable] = useState(null);
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);

    const { tableId, restaurantId } = route.params;

    useEffect(() => {
        fetchTableDetails();
        fetchFriends();
    }, []);

    const fetchTableDetails = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/tables/${tableId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }
            );
            const data = await response.json();
            setTable(data);
        } catch (error) {
            console.error('Error fetching table details:', error);
            Alert.alert('Hata', 'Masa bilgileri alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFriends = async () => {
        try {
            const response = await fetch(`${API_URL}/api/friends`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });
            const data = await response.json();
            setFriends(data);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const handleInviteFriend = async (friendId) => {
        try {
            const response = await fetch(
                `${API_URL}/api/tables/${tableId}/invite`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ friendId }),
                }
            );

            if (response.ok) {
                Alert.alert('Başarılı', 'Arkadaşınız davet edildi.');
                setSelectedFriends(prev => [...prev, friendId]);
            } else {
                throw new Error('Davet gönderilemedi.');
            }
        } catch (error) {
            console.error('Error inviting friend:', error);
            Alert.alert('Hata', 'Davet gönderilemedi.');
        }
    };

    const handleShareTable = async () => {
        try {
            const qrData = {
                type: 'table',
                id: tableId,
                restaurantId: restaurantId,
            };

            const message = `Sofra uygulamasında bana katılmak ister misin? Masa: ${table?.name}`;
            await Share.share({
                message,
                url: `sofra://table/${restaurantId}/${tableId}`,
            });
        } catch (error) {
            console.error('Error sharing table:', error);
            Alert.alert('Hata', 'Masa paylaşılamadı.');
        }
    };

    const renderFriendItem = ({ item }) => (
        <View style={styles.friendItem}>
            <Image
                source={
                    item.profileImage
                        ? { uri: item.profileImage }
                        : require('../../assets/default-avatar.png')
                }
                style={styles.friendImage}
            />
            <View style={styles.friendInfo}>
                <Text style={styles.friendName}>
                    {item.name} {item.surname}
                </Text>
                <Text style={styles.friendEmail}>{item.email}</Text>
            </View>
            <TouchableOpacity
                style={[
                    styles.inviteButton,
                    selectedFriends.includes(item.id) && styles.invitedButton,
                ]}
                onPress={() => handleInviteFriend(item.id)}
                disabled={selectedFriends.includes(item.id)}
            >
                <Ionicons
                    name={selectedFriends.includes(item.id) ? 'checkmark' : 'add'}
                    size={24}
                    color={selectedFriends.includes(item.id) ? '#34c759' : '#007aff'}
                />
            </TouchableOpacity>
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
            padding: 16,
        },
        tableInfo: {
            backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
        },
        tableName: {
            fontSize: 24,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 8,
        },
        tableStatus: {
            fontSize: 16,
            color: isDark ? '#8e8e93' : '#8e8e93',
        },
        qrContainer: {
            alignItems: 'center',
            marginBottom: 24,
        },
        qrCode: {
            backgroundColor: '#ffffff',
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
        },
        shareButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#007aff',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
        },
        shareButtonText: {
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 'bold',
            marginLeft: 8,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 16,
        },
        friendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#38383a' : '#e5e5ea',
        },
        friendImage: {
            width: 50,
            height: 50,
            borderRadius: 25,
            marginRight: 12,
        },
        friendInfo: {
            flex: 1,
        },
        friendName: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 4,
        },
        friendEmail: {
            fontSize: 14,
            color: isDark ? '#8e8e93' : '#8e8e93',
        },
        inviteButton: {
            padding: 8,
            backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7',
            borderRadius: 8,
        },
        invitedButton: {
            backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
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
                <Text style={styles.title}>Masa Detayı</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.tableInfo}>
                    <Text style={styles.tableName}>{table?.name}</Text>
                    <Text style={styles.tableStatus}>
                        {table?.status === 'available'
                            ? 'Müsait'
                            : table?.status === 'occupied'
                            ? 'Dolu'
                            : 'Rezerve'}
                    </Text>
                </View>

                <View style={styles.qrContainer}>
                    <View style={styles.qrCode}>
                        <QRCode
                            value={JSON.stringify({
                                type: 'table',
                                id: tableId,
                                restaurantId: restaurantId,
                            })}
                            size={200}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={handleShareTable}
                    >
                        <Ionicons name="share-outline" size={24} color="#ffffff" />
                        <Text style={styles.shareButtonText}>Masa Kodunu Paylaş</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Arkadaşlarını Davet Et</Text>
                <FlatList
                    data={friends}
                    renderItem={renderFriendItem}
                    keyExtractor={item => item.id}
                />
            </View>
        </View>
    );
};

export default TableDetailScreen; 