import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    useColorScheme,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';

    const handleLogout = () => {
        Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istiyor musunuz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
        ]);
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: isDarkMode ? '#000' : '#fff' },
            ]}
        >
            <Text style={[styles.greeting, { color: isDarkMode ? '#fff' : '#000' }]}>
                👋 Merhaba, {user.name}
            </Text>

            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: isDarkMode ? '#111' : '#f7f7f7',
                        shadowColor: isDarkMode ? '#000' : '#ccc',
                    },
                ]}
            >
                <View style={styles.row}>
                    <Text style={[styles.label, { color: isDarkMode ? '#ccc' : '#555' }]}>
                        📧 Email:
                    </Text>
                    <Text style={[styles.value, { color: isDarkMode ? '#eee' : '#222' }]}>
                        {user.email}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={[styles.label, { color: isDarkMode ? '#ccc' : '#555' }]}>
                        🧩 Rol:
                    </Text>
                    <Text style={[styles.value, { color: isDarkMode ? '#eee' : '#222' }]}>
                        {user.role}
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>🚪 Çıkış Yap</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    greeting: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 32,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 40,
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    row: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
    },
    value: {
        fontSize: 17,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#ff3b30',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
