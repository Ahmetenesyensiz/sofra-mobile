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
    Modal,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';
import io from 'socket.io-client';
import { BarCodeScanner } from 'expo-barcode-scanner';

const TableStatusScreen = () => {
    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';

    const [restaurantId, setRestaurantId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);

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

            const tablesRes = await fetch(`${API_URL}/tables/restaurant/${restaurant.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (!tablesRes.ok) {
                throw new Error('Masalar alınamadı');
            }

            const tablesData = await tablesRes.json();
            setTables(tablesData);
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

        newSocket.on('tableStatusChanged', () => {
            fetchData();
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [user.id, user.token]);

    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const handleTableTransfer = async (fromTableId, toTableId) => {
        try {
            const response = await fetch(`${API_URL}/tables/${fromTableId}/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({ toTableId }),
            });

            if (!response.ok) {
                throw new Error('Masa transferi yapılamadı');
            }

            Alert.alert('Başarılı', 'Masa transferi tamamlandı');
            setShowTransferModal(false);
            fetchData();
        } catch (err) {
            Alert.alert('Hata', err.message);
        }
    };

    const handleBarCodeScanned = ({ data }) => {
        try {
            const tableData = JSON.parse(data);
            if (tableData.tableId) {
                handleTableTransfer(selectedTable.id, tableData.tableId);
            }
        } catch (err) {
            Alert.alert('Hata', 'Geçersiz QR kod');
        }
        setShowScanner(false);
    };

    const getTableStatusColor = (status) => {
        switch (status) {
            case 'occupied':
                return COLORS.danger;
            case 'reserved':
                return COLORS.warning;
            case 'available':
                return COLORS.success;
            default:
                return COLORS.gray;
        }
    };

    const getTableStatusText = (status) => {
        switch (status) {
            case 'occupied':
                return 'Dolu';
            case 'reserved':
                return 'Rezerve';
            case 'available':
                return 'Boş';
            default:
                return 'Bilinmiyor';
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
            <Text style={styles.title}>🍽️ Masa Durumları</Text>

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
            >
                {tables.length === 0 ? (
                    <Text style={styles.emptyText}>Masa bulunmuyor.</Text>
                ) : (
                    tables.map((table) => (
                        <View key={table.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.tableNumber}>
                                        Masa {table.number}
                                    </Text>
                                    <Text style={styles.capacity}>
                                        Kapasite: {table.capacity} kişi
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: getTableStatusColor(table.status) }
                                ]}>
                                    <Text style={styles.statusText}>
                                        {getTableStatusText(table.status)}
                                    </Text>
                                </View>
                            </View>

                            {table.status === 'occupied' && (
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.transferButton]}
                                        onPress={() => {
                                            setSelectedTable(table);
                                            setShowTransferModal(true);
                                        }}
                                    >
                                        <Text style={styles.actionButtonText}>🔄 Transfer</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            <Modal
                visible={showTransferModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowTransferModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Masa Transferi</Text>
                        <Text style={styles.modalText}>
                            Masa {selectedTable?.number} için transfer yapmak istediğiniz masayı seçin:
                        </Text>

                        <ScrollView style={styles.tableList}>
                            {tables
                                .filter(t => t.id !== selectedTable?.id && t.status === 'available')
                                .map(table => (
                                    <TouchableOpacity
                                        key={table.id}
                                        style={styles.tableItem}
                                        onPress={() => {
                                            handleTableTransfer(selectedTable.id, table.id);
                                        }}
                                    >
                                        <Text style={styles.tableItemText}>
                                            Masa {table.number}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.scanButton}
                            onPress={() => {
                                setShowTransferModal(false);
                                setShowScanner(true);
                            }}
                        >
                            <Text style={styles.scanButtonText}>📷 QR Kod ile Tara</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowTransferModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>İptal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {showScanner && (
                <Modal
                    visible={showScanner}
                    animationType="slide"
                    onRequestClose={() => setShowScanner(false)}
                >
                    <View style={styles.scannerContainer}>
                        <BarCodeScanner
                            onBarCodeScanned={handleBarCodeScanned}
                            style={StyleSheet.absoluteFillObject}
                        />
                        <TouchableOpacity
                            style={styles.closeScannerButton}
                            onPress={() => setShowScanner(false)}
                        >
                            <Text style={styles.closeScannerButtonText}>❌ Kapat</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            )}
        </View>
    );
};

export default TableStatusScreen;

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
            alignItems: 'center',
            marginBottom: 10,
        },
        tableNumber: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000',
            marginBottom: 4,
        },
        capacity: {
            fontSize: 14,
            color: isDarkMode ? '#aaa' : '#666',
        },
        statusBadge: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
        },
        statusText: {
            color: '#fff',
            fontSize: 14,
            fontWeight: '600',
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#333' : '#ddd',
        },
        actionButton: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 6,
            alignItems: 'center',
        },
        transferButton: {
            backgroundColor: COLORS.primary,
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
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
            backgroundColor: isDarkMode ? '#111' : '#fff',
            borderRadius: 10,
            padding: 20,
            width: '90%',
            maxHeight: '80%',
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000',
            marginBottom: 15,
            textAlign: 'center',
        },
        modalText: {
            fontSize: 16,
            color: isDarkMode ? '#eee' : '#333',
            marginBottom: 20,
            textAlign: 'center',
        },
        tableList: {
            maxHeight: 200,
        },
        tableItem: {
            backgroundColor: isDarkMode ? '#222' : '#f5f5f5',
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
        },
        tableItemText: {
            fontSize: 16,
            color: isDarkMode ? '#fff' : '#000',
            textAlign: 'center',
        },
        scanButton: {
            backgroundColor: COLORS.primary,
            padding: 15,
            borderRadius: 8,
            marginTop: 10,
        },
        scanButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
        },
        cancelButton: {
            padding: 15,
            marginTop: 10,
        },
        cancelButtonText: {
            color: COLORS.danger,
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
        },
        scannerContainer: {
            flex: 1,
            backgroundColor: '#000',
        },
        closeScannerButton: {
            position: 'absolute',
            top: 40,
            right: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: 15,
            borderRadius: 8,
        },
        closeScannerButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
        },
    });
