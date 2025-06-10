import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SelectRoleScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Kayıt Tipini Seç</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Register')}
            >
                <Text style={styles.buttonText}>👤 Müşteri Olarak Kayıt Ol</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('OwnerRegister')}
            >
                <Text style={styles.buttonText}>🍽️ Restoran Sahibi Olarak Kayıt Ol</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SelectRoleScreen;
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, marginBottom: 40 },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: { color: '#fff', fontSize: 16 },
});
