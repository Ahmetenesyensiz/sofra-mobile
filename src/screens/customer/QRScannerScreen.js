import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    useColorScheme,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const QRScannerScreen = () => {
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        try {
            const qrData = JSON.parse(data);
            if (qrData.type === 'restaurant') {
                navigation.navigate('RestaurantDetail', {
                    restaurantId: qrData.id,
                });
            } else if (qrData.type === 'table') {
                navigation.navigate('RestaurantDetail', {
                    restaurantId: qrData.restaurantId,
                    tableId: qrData.id,
                });
            } else {
                Alert.alert('Hata', 'Geçersiz QR kod formatı.');
            }
        } catch (error) {
            Alert.alert('Hata', 'QR kod okunamadı.');
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#000000' : '#ffffff',
        },
        scanner: {
            flex: 1,
        },
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        scanArea: {
            width: 250,
            height: 250,
            borderWidth: 2,
            borderColor: '#007aff',
            backgroundColor: 'transparent',
        },
        header: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
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
        instructions: {
            position: 'absolute',
            bottom: 32,
            left: 32,
            right: 32,
            backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
            padding: 16,
            borderRadius: 12,
        },
        instructionText: {
            fontSize: 16,
            color: isDark ? '#ffffff' : '#000000',
            textAlign: 'center',
        },
    });

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text style={styles.instructionText}>Kamera izni isteniyor...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={styles.instructionText}>Kamera erişimi reddedildi.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={styles.scanner}
            />
            <View style={styles.overlay}>
                <View style={styles.scanArea} />
            </View>
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
                <Text style={styles.title}>QR Kod Tara</Text>
            </View>
            <View style={styles.instructions}>
                <Text style={styles.instructionText}>
                    Restoran veya masa QR kodunu tarayın
                </Text>
            </View>
        </View>
    );
};

export default QRScannerScreen; 