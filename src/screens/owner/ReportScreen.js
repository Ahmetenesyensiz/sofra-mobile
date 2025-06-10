import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    useColorScheme,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { VictoryPie, VictoryBar, VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';
import io from 'socket.io-client';

const ReportScreen = () => {
    const { user } = useAuth();
    const isDarkMode = useColorScheme() === 'dark';

    const [restaurantId, setRestaurantId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const [dateRange, setDateRange] = useState('week');
    const [topSellingItems, setTopSellingItems] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);

    const fetchData = async () => {
        try {
            setError(null);
            const response = await fetch(`${API_URL}/restaurants/owner/${user.id}`, {
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

            const [topItemsRes, salesRes, revenueRes, categoryRes] = await Promise.all([
                fetch(`${API_URL}/reporting/top-selling-items/${restaurant.id}?dateRange=${dateRange}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }),
                fetch(`${API_URL}/reporting/sales/${restaurant.id}?dateRange=${dateRange}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }),
                fetch(`${API_URL}/reporting/revenue/${restaurant.id}?dateRange=${dateRange}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }),
                fetch(`${API_URL}/reporting/categories/${restaurant.id}?dateRange=${dateRange}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                }),
            ]);

            if (!topItemsRes.ok || !salesRes.ok || !revenueRes.ok || !categoryRes.ok) {
                throw new Error('Rapor verileri alınamadı');
            }

            const [topItemsData, salesData, revenueData, categoryData] = await Promise.all([
                topItemsRes.json(),
                salesRes.json(),
                revenueRes.json(),
                categoryRes.json(),
            ]);

            setTopSellingItems(topItemsData);
            setSalesData(salesData);
            setRevenueData(revenueData);
            setCategoryData(categoryData);
        } catch (err) {
            console.error('Rapor alınamadı:', err);
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

        newSocket.on('newOrder', () => {
            fetchData();
        });

        newSocket.on('orderStatusChanged', () => {
            fetchData();
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [user.id, user.token, dateRange]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

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

    const screenWidth = Dimensions.get('window').width;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[COLORS.primary]}
                />
            }
        >
            <Text style={styles.title}>📊 Raporlar</Text>

            <View style={styles.dateRangeContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[
                            styles.dateRangeButton,
                            dateRange === 'week' && styles.dateRangeButtonActive,
                        ]}
                        onPress={() => setDateRange('week')}
                    >
                        <Text style={styles.dateRangeButtonText}>Haftalık</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.dateRangeButton,
                            dateRange === 'month' && styles.dateRangeButtonActive,
                        ]}
                        onPress={() => setDateRange('month')}
                    >
                        <Text style={styles.dateRangeButtonText}>Aylık</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.dateRangeButton,
                            dateRange === 'year' && styles.dateRangeButtonActive,
                        ]}
                        onPress={() => setDateRange('year')}
                    >
                        <Text style={styles.dateRangeButtonText}>Yıllık</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>💰 Gelir Raporu</Text>
                <VictoryChart
                    width={screenWidth - 40}
                    height={250}
                    theme={VictoryTheme.material}
                    domainPadding={20}
                >
                    <VictoryAxis
                        tickFormat={(t) => t}
                        style={{
                            tickLabels: {
                                fontSize: 10,
                                fill: isDarkMode ? '#eee' : '#333',
                            },
                        }}
                    />
                    <VictoryAxis
                        dependentAxis
                        tickFormat={(t) => `${t}₺`}
                        style={{
                            tickLabels: {
                                fontSize: 10,
                                fill: isDarkMode ? '#eee' : '#333',
                            },
                        }}
                    />
                    <VictoryLine
                        data={revenueData}
                        x="date"
                        y="amount"
                        style={{
                            data: {
                                stroke: COLORS.primary,
                                strokeWidth: 2,
                            },
                        }}
                    />
                </VictoryChart>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📈 Satış Grafiği</Text>
                <VictoryChart
                    width={screenWidth - 40}
                    height={250}
                    theme={VictoryTheme.material}
                    domainPadding={20}
                >
                    <VictoryAxis
                        tickFormat={(t) => t}
                        style={{
                            tickLabels: {
                                fontSize: 10,
                                fill: isDarkMode ? '#eee' : '#333',
                            },
                        }}
                    />
                    <VictoryAxis
                        dependentAxis
                        style={{
                            tickLabels: {
                                fontSize: 10,
                                fill: isDarkMode ? '#eee' : '#333',
                            },
                        }}
                    />
                    <VictoryBar
                        data={salesData}
                        x="date"
                        y="count"
                        style={{
                            data: {
                                fill: COLORS.success,
                            },
                        }}
                    />
                </VictoryChart>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🍽️ Kategori Dağılımı</Text>
                <VictoryPie
                    data={categoryData}
                    x="category"
                    y="count"
                    colorScale="qualitative"
                    height={300}
                    padding={{ top: 20, bottom: 60 }}
                    style={{
                        labels: {
                            fontSize: 14,
                            fill: isDarkMode ? '#eee' : '#333',
                        },
                    }}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏆 En Çok Satılan Ürünler</Text>
                {topSellingItems.length === 0 ? (
                    <Text style={styles.emptyText}>Veri bulunamadı.</Text>
                ) : (
                    <VictoryPie
                        data={topSellingItems}
                        x="menuItemName"
                        y="totalSold"
                        colorScale="qualitative"
                        height={300}
                        padding={{ top: 20, bottom: 60 }}
                        style={{
                            labels: {
                                fontSize: 14,
                                fill: isDarkMode ? '#eee' : '#333',
                            },
                        }}
                    />
                )}
            </View>
        </ScrollView>
    );
};

export default ReportScreen;

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
        dateRangeContainer: {
            paddingHorizontal: 20,
            marginBottom: 20,
        },
        dateRangeButton: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: isDarkMode ? '#111' : '#f2f2f2',
            marginRight: 8,
        },
        dateRangeButtonActive: {
            backgroundColor: COLORS.primary,
        },
        dateRangeButtonText: {
            color: isDarkMode ? '#fff' : '#000',
            fontSize: 14,
            fontWeight: '500',
        },
        section: {
            marginBottom: 30,
            paddingHorizontal: 20,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 15,
            color: isDarkMode ? '#fff' : '#000',
        },
        emptyText: {
            fontSize: 16,
            color: isDarkMode ? '#aaa' : '#777',
            textAlign: 'center',
            marginTop: 20,
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
