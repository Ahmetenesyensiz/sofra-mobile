import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../../components/PrimaryButton';
import CustomInput from '../../components/CustomInput';

const PLANS = [
    {
        id: 'basic',
        name: 'Temel Paket',
        price: 999,
        features: [
            'Temel menü yönetimi',
            'Sipariş takibi',
            'Müşteri yorumları',
            'Email desteği',
        ],
    },
    {
        id: 'pro',
        name: 'Pro Paket',
        price: 1999,
        features: [
            'Tüm Temel Paket özellikleri',
            'Gelişmiş analitikler',
            'Müşteri sadakat programı',
            '7/24 destek',
            'Özel promosyonlar',
        ],
    },
    {
        id: 'enterprise',
        name: 'Kurumsal Paket',
        price: 3999,
        features: [
            'Tüm Pro Paket özellikleri',
            'Çoklu şube yönetimi',
            'Özel entegrasyonlar',
            'Öncelikli destek',
            'Özel eğitim',
        ],
    },
];

const OwnerPaymentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const isDarkMode = useColorScheme() === 'dark';
    const { ownerId, restaurantName } = route.params;

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [loading, setLoading] = useState(false);

    const formatCardNumber = (text) => {
        const cleaned = text.replace(/\D/g, '');
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
    };

    const formatExpiryDate = (text) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
        }
        return cleaned;
    };

    const handlePayment = async () => {
        if (!selectedPlan) {
            Alert.alert('Uyarı', 'Lütfen bir paket seçin.');
            return;
        }

        if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
            Alert.alert('Uyarı', 'Lütfen tüm kart bilgilerini doldurun.');
            return;
        }

        setLoading(true);
        try {
            // Burada gerçek ödeme işlemi yapılacak
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simüle edilmiş ödeme

            // Başarılı ödeme sonrası sözleşme ekranına yönlendir
            navigation.navigate('OwnerContract', {
                ownerId,
                restaurantName,
                planId: selectedPlan,
            });
        } catch (error) {
            Alert.alert('Hata', 'Ödeme işlemi sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}
            contentContainerStyle={styles.content}
        >
            <View style={styles.header}>
                <Ionicons
                    name="card"
                    size={60}
                    color={isDarkMode ? '#fff' : '#007aff'}
                />
                <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
                    Paket Seçimi ve Ödeme
                </Text>
                <Text style={[styles.subtitle, { color: isDarkMode ? '#ccc' : '#666' }]}>
                    {restaurantName} için en uygun paketi seçin
                </Text>
            </View>

            <View style={styles.plansContainer}>
                {PLANS.map((plan) => (
                    <TouchableOpacity
                        key={plan.id}
                        style={[
                            styles.planCard,
                            selectedPlan === plan.id && styles.selectedPlan,
                            { backgroundColor: isDarkMode ? '#111' : '#f8f9fa' },
                        ]}
                        onPress={() => setSelectedPlan(plan.id)}
                    >
                        <Text style={[styles.planName, { color: isDarkMode ? '#fff' : '#000' }]}>
                            {plan.name}
                        </Text>
                        <Text style={[styles.planPrice, { color: isDarkMode ? '#fff' : '#000' }]}>
                            ₺{plan.price}/yıl
                        </Text>
                        <View style={styles.featuresList}>
                            {plan.features.map((feature, index) => (
                                <View key={index} style={styles.featureItem}>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={20}
                                        color={isDarkMode ? '#4CAF50' : '#2E7D32'}
                                    />
                                    <Text style={[styles.featureText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                                        {feature}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.paymentSection}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                    Ödeme Bilgileri
                </Text>
                <CustomInput
                    label="Kart Numarası"
                    value={cardNumber}
                    onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                    placeholder="1234 5678 9012 3456"
                    keyboardType="number-pad"
                    maxLength={19}
                    icon="card-outline"
                />
                <CustomInput
                    label="Kart Sahibi"
                    value={cardHolder}
                    onChangeText={setCardHolder}
                    placeholder="Ad Soyad"
                    icon="person-outline"
                />
                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <CustomInput
                            label="Son Kullanma Tarihi"
                            value={expiryDate}
                            onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                            placeholder="MM/YY"
                            keyboardType="number-pad"
                            maxLength={5}
                            icon="calendar-outline"
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <CustomInput
                            label="CVV"
                            value={cvv}
                            onChangeText={(text) => setCvv(text.replace(/\D/g, ''))}
                            placeholder="123"
                            keyboardType="number-pad"
                            maxLength={3}
                            secureTextEntry
                            icon="lock-closed-outline"
                        />
                    </View>
                </View>
            </View>

            <PrimaryButton
                title="Ödemeyi Tamamla"
                onPress={handlePayment}
                loading={loading}
                style={styles.paymentButton}
            />
        </ScrollView>
    );
};

export default OwnerPaymentScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    plansContainer: {
        marginBottom: 32,
    },
    planCard: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedPlan: {
        borderColor: '#007aff',
        borderWidth: 2,
    },
    planName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    planPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    featuresList: {
        marginTop: 8,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureText: {
        marginLeft: 8,
        fontSize: 14,
    },
    paymentSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    paymentButton: {
        marginTop: 16,
    },
}); 