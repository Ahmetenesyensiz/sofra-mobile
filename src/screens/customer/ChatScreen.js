import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';

const ChatScreen = () => {
    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const response = await fetch(`${API_URL}/chat/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    message: newMessage.trim(),
                }),
            });

            if (!response.ok) throw new Error('Mesaj gönderilemedi');
            
            setNewMessage('');
            // Mesajlar otomatik olarak güncellenecek
        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: isDarkMode ? COLORS.background.dark : COLORS.background.light }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={[
                        styles.messageContainer,
                        item.senderId === user.id ? styles.sentMessage : styles.receivedMessage
                    ]}>
                        <Text style={styles.messageText}>{item.text}</Text>
                    </View>
                )}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, { color: isDarkMode ? COLORS.text.darkPrimary : COLORS.text.primary }]}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Mesajınızı yazın..."
                    placeholderTextColor={isDarkMode ? COLORS.text.darkTertiary : COLORS.text.tertiary}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Ionicons name="send" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messageContainer: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginVertical: 4,
        marginHorizontal: 8,
    },
    sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
    },
    receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.gray200,
    },
    messageText: {
        color: COLORS.white,
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.light,
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: COLORS.gray100,
        borderRadius: 20,
        paddingHorizontal: 16,
        marginRight: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatScreen;
