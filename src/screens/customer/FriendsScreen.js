import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    useColorScheme,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';

const FriendsScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        fetchFriends();
    }, []);

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
            Alert.alert('Hata', 'Arkadaş listesi alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(
                `${API_URL}/api/users/search?query=${query}`,
                {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }
            );
            const data = await response.json();
            setSearchResults(data.filter(user => !friends.some(friend => friend.id === user.id)));
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleAddFriend = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/api/friends/request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (response.ok) {
                Alert.alert('Başarılı', 'Arkadaşlık isteği gönderildi.');
                setSearchResults(prev => prev.filter(user => user.id !== userId));
            } else {
                throw new Error('Arkadaşlık isteği gönderilemedi.');
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
            Alert.alert('Hata', 'Arkadaşlık isteği gönderilemedi.');
        }
    };

    const handleRemoveFriend = async (friendId) => {
        Alert.alert(
            'Arkadaşı Kaldır',
            'Bu arkadaşı listeden kaldırmak istediğinizden emin misiniz?',
            [
                {
                    text: 'Vazgeç',
                    style: 'cancel',
                },
                {
                    text: 'Kaldır',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(
                                `${API_URL}/api/friends/${friendId}`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${user.token}`,
                                    },
                                }
                            );

                            if (response.ok) {
                                setFriends(prev =>
                                    prev.filter(friend => friend.id !== friendId)
                                );
                            } else {
                                throw new Error('Arkadaş kaldırılamadı.');
                            }
                        } catch (error) {
                            console.error('Error removing friend:', error);
                            Alert.alert('Hata', 'Arkadaş kaldırılamadı.');
                        }
                    },
                },
            ]
        );
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
                style={styles.removeButton}
                onPress={() => handleRemoveFriend(item.id)}
            >
                <Ionicons
                    name="person-remove"
                    size={24}
                    color="#ff3b30"
                />
            </TouchableOpacity>
        </View>
    );

    const renderSearchResult = ({ item }) => (
        <View style={styles.searchItem}>
            <Image
                source={
                    item.profileImage
                        ? { uri: item.profileImage }
                        : require('../../assets/default-avatar.png')
                }
                style={styles.searchImage}
            />
            <View style={styles.searchInfo}>
                <Text style={styles.searchName}>
                    {item.name} {item.surname}
                </Text>
                <Text style={styles.searchEmail}>{item.email}</Text>
            </View>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddFriend(item.id)}
            >
                <Ionicons
                    name="person-add"
                    size={24}
                    color="#007aff"
                />
            </TouchableOpacity>
        </View>
    );

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDarkMode ? '#000000' : '#ffffff',
        },
        header: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#38383a' : '#e5e5ea',
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? '#1c1c1e' : '#f2f2f7',
            borderRadius: 8,
            paddingHorizontal: 12,
        },
        searchInput: {
            flex: 1,
            height: 40,
            color: isDarkMode ? '#ffffff' : '#000000',
            fontSize: 16,
        },
        searchIcon: {
            marginRight: 8,
        },
        content: {
            flex: 1,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : '#000000',
            margin: 16,
        },
        friendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#38383a' : '#e5e5ea',
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
            color: isDarkMode ? '#ffffff' : '#000000',
            marginBottom: 4,
        },
        friendEmail: {
            fontSize: 14,
            color: isDarkMode ? '#8e8e93' : '#8e8e93',
        },
        removeButton: {
            padding: 8,
        },
        searchItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#38383a' : '#e5e5ea',
        },
        searchImage: {
            width: 50,
            height: 50,
            borderRadius: 25,
            marginRight: 12,
        },
        searchInfo: {
            flex: 1,
        },
        searchName: {
            fontSize: 16,
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : '#000000',
            marginBottom: 4,
        },
        searchEmail: {
            fontSize: 14,
            color: isDarkMode ? '#8e8e93' : '#8e8e93',
        },
        addButton: {
            padding: 8,
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
                <View style={styles.searchContainer}>
                    <Ionicons
                        name="search"
                        size={20}
                        color={isDarkMode ? '#8e8e93' : '#8e8e93'}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Arkadaş ara..."
                        placeholderTextColor={isDarkMode ? '#8e8e93' : '#8e8e93'}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
            </View>

            <View style={styles.content}>
                {searchQuery.length > 0 ? (
                    <>
                        <Text style={styles.sectionTitle}>Arama Sonuçları</Text>
                        {searching ? (
                            <ActivityIndicator
                                size="small"
                                color="#007aff"
                                style={{ marginTop: 20 }}
                            />
                        ) : (
                            <FlatList
                                data={searchResults}
                                renderItem={renderSearchResult}
                                keyExtractor={item => item.id}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Arkadaşlarım</Text>
                        <FlatList
                            data={friends}
                            renderItem={renderFriendItem}
                            keyExtractor={item => item.id}
                        />
                    </>
                )}
            </View>
        </View>
    );
};

export default FriendsScreen; 