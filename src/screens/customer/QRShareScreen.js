import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    useColorScheme,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import QRCode from 'react-native-qrcode-svg';

const QRShareScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [qrRef, setQrRef] = useState(null);

    const { type, id, restaurantId } = route.params;
    const qrData = {
        type,
        id,
        ...(type === 'table' && { restaurantId }),
    };

    const handleShare = async () => {
        try {
            if (!qrRef) return;

            const qrDataUrl = await qrRef.toDataURL();
            const fileUri = FileSystem.documentDirectory + 'qrcode.png';
            await FileSystem.writeAsStringAsync(fileUri, qrDataUrl, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await Sharing.shareAsync(fileUri, {
                mimeType: 'image/png',
                dialogTitle: 'QR Kodu Paylaş',
            });
        } catch (error) {
            Alert.alert('Hata', 'QR kod paylaşılırken bir hata oluştu.');
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#000000' : '#ffffff',
        },
        header: {
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#38383a' : '#e5e5ea',
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
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        qrContainer: {
            backgroundColor: '#ffffff',
            padding: 20,
            borderRadius: 12,
            marginBottom: 24,
        },
        description: {
            fontSize: 16,
            color: isDark ? '#ffffff' : '#000000',
            textAlign: 'center',
            marginBottom: 24,
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
    });

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
                <Text style={styles.title}>QR Kod Paylaş</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.qrContainer}>
                    <QRCode
                        value={JSON.stringify(qrData)}
                        size={200}
                        getRef={setQrRef}
                    />
                </View>

                <Text style={styles.description}>
                    {type === 'restaurant'
                        ? 'Restoran QR kodunu paylaşın'
                        : 'Masa QR kodunu paylaşın'}
                </Text>

                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Ionicons name="share-outline" size={24} color="#ffffff" />
                    <Text style={styles.shareButtonText}>Paylaş</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default QRShareScreen; 