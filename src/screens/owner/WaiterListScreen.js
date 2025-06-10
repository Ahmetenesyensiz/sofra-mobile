// src/screens/owner/WaiterListScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import PrimaryButton from '../../components/PrimaryButton';

const WaiterListScreen = () => {
    const { user } = useAuth();
    const [waiters, setWaiters] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWaiters = async () => {
        setLoading(true);
        try {
            const data = await userService.getWaiters(user.restaurantId);
            setWaiters(data);
        } catch (err) {
            Alert.alert('Hata', 'Garsonlar alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (waiterId) => {
        Alert.alert(
            "Garsonu Sil",
            "Bu garsonu silmek istediğine emin misin?",
            [
                { text: "İptal", style: "cancel" },
                {
                    text: "Sil",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await userService.deleteUser(waiterId);
                            setWaiters(waiters.filter(w => w.id !== waiterId));
                        } catch (err) {
                            Alert.alert("Hata", "Silme işlemi başarısız oldu.");
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        fetchWaiters();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.waiterCard}>
            <View>
                <Text style={styles.name}>{item.name} {item.surname}</Text>
                <Text style={styles.email}>{item.email}</Text>
            </View>
            <PrimaryButton
                title="Sil"
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Garsonlar</Text>
            <FlatList
                data={waiters}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                refreshing={loading}
                onRefresh={fetchWaiters}
            />
        </View>
    );
};

export default WaiterListScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    waiterCard: {
        backgroundColor: '#f4f4f4',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    name: { fontSize: 16, fontWeight: 'bold' },
    email: { color: '#666' },
    deleteButton: {
        backgroundColor: '#ff3b30',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8
    }
});
