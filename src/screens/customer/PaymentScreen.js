import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    useColorScheme,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { COLORS } from '../../styles/globalStyles';

const PaymentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { orderId, amount } = route.params;

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#000000' : '#ffffff',
        },
        content: {
            flex: 1,
            padding: 16,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 16,
        },
        paymentMethodContainer: {
            flexDirection: 'row',
            marginBottom: 24,
        },
        paymentMethodButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            marginHorizontal: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? '#38383a' : '#e5e5ea',
        },
        selectedPaymentMethod: {
            borderColor: '#007aff',
            backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7',
        },
        paymentMethodText: {
            marginLeft: 8,
            fontSize: 16,
            color: isDark ? '#ffffff' : '#000000',
        },
        inputContainer: {
            marginBottom: 16,
        },
        inputLabel: {
            fontSize: 16,
            color: isDark ? '#8e8e93' : '#8e8e93',
            marginBottom: 8,
        },
        input: {
            backgroundColor: isDark ? '#1c1c1e' : '#f2f2f7',
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: isDark ? '#ffffff' : '#000000',
            borderWidth: 1,
            borderColor: isDark ? '#38383a' : '#e5e5ea',
        },
        cardDetailsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        expiryInput: {
            flex: 1,
            marginRight: 8,
        },
        cvvInput: {
            width: '30%',
        },
        summaryContainer: {
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            borderRadius: 12,
            padding: 16,
            marginTop: 24,
            borderWidth: 1,
            borderColor: isDark ? '#38383a' : '#e5e5ea',
        },
        summaryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        summaryLabel: {
            fontSize: 16,
            color: isDark ? '#8e8e93' : '#8e8e93',
        },
        summaryValue: {
            fontSize: 16,
            color: isDark ? '#ffffff' : '#000000',
            fontWeight: 'bold',
        },
        totalRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#38383a' : '#e5e5ea',
        },
        totalLabel: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
        },
        totalValue: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#007aff',
        },
        payButton: {
            backgroundColor: '#007aff',
            borderRadius: 12,
            padding: 16,
            marginTop: 24,
            alignItems: 'center',
        },
        payButtonText: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 'bold',
        },
        disabledButton: {
            backgroundColor: isDark ? '#38383a' : '#e5e5ea',
        },
        centerContent: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        errorText: {
            color: COLORS.danger,
            fontSize: 16,
            textAlign: 'center',
            marginTop: 12,
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

    const formatCardNumber = (text) => {
        const cleaned = text.replace(/\s/g, '');
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

    const handleCardNumberChange = (text) => {
        const formatted = formatCardNumber(text);
        setCardNumber(formatted);
    };

    const handleExpiryDateChange = (text) => {
        const formatted = formatExpiryDate(text);
        setExpiryDate(formatted);
    };

    const validateCardNumber = (number) => {
        // Luhn algoritması ile kart numarası doğrulama
        const digits = number.replace(/\s/g, '').split('').map(Number);
        const lastDigit = digits.pop();
        const sum = digits
            .reverse()
            .map((digit, index) => {
                if (index % 2 === 0) {
                    const doubled = digit * 2;
                    return doubled > 9 ? doubled - 9 : doubled;
                }
                return digit;
            })
            .reduce((acc, digit) => acc + digit, 0);
        return (sum + lastDigit) % 10 === 0;
    };

    const validateExpiryDate = (date) => {
        const [month, year] = date.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        const expMonth = parseInt(month, 10);
        const expYear = parseInt(year, 10);

        if (expMonth < 1 || expMonth > 12) return false;
        if (expYear < currentYear) return false;
        if (expYear === currentYear && expMonth < currentMonth) return false;

        return true;
    };

    const isFormValid = () => {
        if (selectedPaymentMethod === 'card') {
            const cardNumberValid = validateCardNumber(cardNumber.replace(/\s/g, ''));
            const expiryDateValid = validateExpiryDate(expiryDate);
            const cvvValid = /^\d{3,4}$/.test(cvv);

            if (!cardNumberValid) {
                Alert.alert('Hata', 'Geçersiz kart numarası');
                return false;
            }
            if (!expiryDateValid) {
                Alert.alert('Hata', 'Geçersiz son kullanma tarihi');
                return false;
            }
            if (!cvvValid) {
                Alert.alert('Hata', 'Geçersiz CVV');
                return false;
            }
            if (!cardHolder.trim()) {
                Alert.alert('Hata', 'Lütfen kart sahibinin adını girin');
                return false;
            }

            return true;
        }
        return true;
    };

    const handlePayment = async () => {
        if (!isFormValid()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    orderId,
                    amount,
                    paymentMethod: selectedPaymentMethod,
                    cardDetails: selectedPaymentMethod === 'card' ? {
                        number: cardNumber.replace(/\s/g, ''),
                        holder: cardHolder,
                        expiry: expiryDate,
                        cvv,
                    } : null,
                }),
            });

            if (!response.ok) {
                throw new Error('Ödeme işlemi başarısız oldu');
            }

            const data = await response.json();

            Alert.alert(
                'Başarılı',
                'Ödemeniz başarıyla tamamlandı.',
                [
                    {
                        text: 'Tamam',
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [
                                    {
                                        name: 'CustomerTabs',
                                        params: { screen: 'Siparişlerim' },
                                    },
                                ],
                            });
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error processing payment:', error);
            setError(error.message);
            Alert.alert('Hata', 'Ödeme işlemi sırasında bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Ionicons name="alert-circle" size={48} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => setError(null)}
                >
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>Ödeme Yöntemi</Text>
                <View style={styles.paymentMethodContainer}>
                    <TouchableOpacity
                        style={[
                            styles.paymentMethodButton,
                            selectedPaymentMethod === 'card' && styles.selectedPaymentMethod,
                        ]}
                        onPress={() => setSelectedPaymentMethod('card')}
                    >
                        <Ionicons
                            name="card-outline"
                            size={24}
                            color={isDark ? '#ffffff' : '#000000'}
                        />
                        <Text style={styles.paymentMethodText}>Kredi Kartı</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.paymentMethodButton,
                            selectedPaymentMethod === 'cash' && styles.selectedPaymentMethod,
                        ]}
                        onPress={() => setSelectedPaymentMethod('cash')}
                    >
                        <Ionicons
                            name="cash-outline"
                            size={24}
                            color={isDark ? '#ffffff' : '#000000'}
                        />
                        <Text style={styles.paymentMethodText}>Nakit</Text>
                    </TouchableOpacity>
                </View>

                {selectedPaymentMethod === 'card' && (
                    <>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Kart Numarası</Text>
                            <TextInput
                                style={styles.input}
                                value={cardNumber}
                                onChangeText={handleCardNumberChange}
                                placeholder="1234 5678 9012 3456"
                                placeholderTextColor={isDark ? '#8e8e93' : '#8e8e93'}
                                keyboardType="numeric"
                                maxLength={19}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Kart Sahibi</Text>
                            <TextInput
                                style={styles.input}
                                value={cardHolder}
                                onChangeText={setCardHolder}
                                placeholder="Ad Soyad"
                                placeholderTextColor={isDark ? '#8e8e93' : '#8e8e93'}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.cardDetailsContainer}>
                            <View style={[styles.inputContainer, styles.expiryInput]}>
                                <Text style={styles.inputLabel}>Son Kullanma Tarihi</Text>
                                <TextInput
                                    style={styles.input}
                                    value={expiryDate}
                                    onChangeText={handleExpiryDateChange}
                                    placeholder="MM/YY"
                                    placeholderTextColor={isDark ? '#8e8e93' : '#8e8e93'}
                                    keyboardType="numeric"
                                    maxLength={5}
                                />
                            </View>

                            <View style={[styles.inputContainer, styles.cvvInput]}>
                                <Text style={styles.inputLabel}>CVV</Text>
                                <TextInput
                                    style={styles.input}
                                    value={cvv}
                                    onChangeText={setCvv}
                                    placeholder="123"
                                    placeholderTextColor={isDark ? '#8e8e93' : '#8e8e93'}
                                    keyboardType="numeric"
                                    maxLength={4}
                                    secureTextEntry
                                />
                            </View>
                        </View>
                    </>
                )}

                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Toplam Tutar</Text>
                        <Text style={styles.summaryValue}>{amount} TL</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.payButton,
                        (!isFormValid() || loading) && styles.disabledButton,
                    ]}
                    onPress={handlePayment}
                    disabled={!isFormValid() || loading}
                >
                    <Text style={styles.payButtonText}>
                        {loading ? 'İşleniyor...' : `${amount} TL Öde`}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default PaymentScreen; 