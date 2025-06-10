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

const CONTRACT_TEXT = `
1. TARAFLAR

1.1. Sofra Platformu ("Platform")
1.2. İşletme Sahibi ("İşletmeci")

2. KONU

İşbu sözleşme, Platform ile İşletmeci arasında, Platform'un sunduğu hizmetlerin kullanımına ilişkin hak ve yükümlülükleri düzenlemektedir.

3. SÖZLEŞMENİN KAPSAMI

3.1. Platform, İşletmeci'ye aşağıdaki hizmetleri sunar:
    - Menü yönetimi
    - Sipariş takibi
    - Müşteri yönetimi
    - Analitik raporlar
    - Pazarlama araçları

3.2. İşletmeci, Platform'un sunduğu hizmetleri kullanarak:
    - Menüsünü yönetebilir
    - Siparişleri takip edebilir
    - Müşteri geri bildirimlerini alabilir
    - Satış raporlarını görüntüleyebilir

4. YÜKÜMLÜLÜKLER

4.1. Platform'un Yükümlülükleri:
    - Hizmetlerin kesintisiz sunulması
    - Teknik destek sağlanması
    - Veri güvenliğinin sağlanması

4.2. İşletmeci'nin Yükümlülükleri:
    - Doğru ve güncel bilgi sağlanması
    - Ödemelerin zamanında yapılması
    - Platform kurallarına uyulması

5. GİZLİLİK

5.1. Taraflar, birbirlerine ait tüm bilgileri gizli tutmayı kabul eder.
5.2. Bu gizlilik yükümlülüğü sözleşmenin sona ermesinden sonra da devam eder.

6. SÖZLEŞMENİN SÜRESİ VE FESİH

6.1. Sözleşme, ödeme yapıldığı tarihte başlar ve seçilen paket süresi sonunda biter.
6.2. Taraflar, 30 gün önceden bildirimde bulunarak sözleşmeyi feshedebilir.

7. UYUŞMAZLIK ÇÖZÜMÜ

7.1. Taraflar arasında doğacak uyuşmazlıklar öncelikle görüşmeler yoluyla çözülmeye çalışılır.
7.2. Anlaşmazlık durumunda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.

8. YÜRÜRLÜK

8.1. İşbu sözleşme, taraflarca okunarak ve anlaşılarak kabul edilmiştir.
`;

const OwnerContractScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const isDarkMode = useColorScheme() === 'dark';
    const { ownerId, restaurantName, planId } = route.params;

    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAccept = async () => {
        if (!accepted) {
            Alert.alert('Uyarı', 'Lütfen sözleşmeyi kabul ettiğinizi onaylayın.');
            return;
        }

        setLoading(true);
        try {
            // Burada sözleşme onayı backend'e gönderilecek
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simüle edilmiş işlem

            Alert.alert(
                'Tebrikler!',
                'Kayıt işleminiz tamamlandı. Şimdi giriş yapabilirsiniz.',
                [
                    {
                        text: 'Giriş Yap',
                        onPress: () => navigation.navigate('Login'),
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
            <View style={styles.header}>
                <Ionicons
                    name="document-text"
                    size={60}
                    color={isDarkMode ? '#fff' : '#007aff'}
                />
                <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>
                    Sözleşme
                </Text>
                <Text style={[styles.subtitle, { color: isDarkMode ? '#ccc' : '#666' }]}>
                    {restaurantName} için hizmet sözleşmesi
                </Text>
            </View>

            <ScrollView
                style={styles.contractContainer}
                contentContainerStyle={styles.contractContent}
            >
                <Text style={[styles.contractText, { color: isDarkMode ? '#ccc' : '#333' }]}>
                    {CONTRACT_TEXT}
                </Text>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setAccepted(!accepted)}
                >
                    <View style={[
                        styles.checkbox,
                        accepted && styles.checkboxChecked,
                        { borderColor: isDarkMode ? '#fff' : '#000' }
                    ]}>
                        {accepted && (
                            <Ionicons
                                name="checkmark"
                                size={16}
                                color={isDarkMode ? '#000' : '#fff'}
                            />
                        )}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: isDarkMode ? '#fff' : '#000' }]}>
                        Sözleşmeyi okudum ve kabul ediyorum
                    </Text>
                </TouchableOpacity>

                <PrimaryButton
                    title="Sözleşmeyi Onayla"
                    onPress={handleAccept}
                    loading={loading}
                    style={styles.acceptButton}
                />
            </View>
        </View>
    );
};

export default OwnerContractScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
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
    contractContainer: {
        flex: 1,
    },
    contractContent: {
        padding: 24,
    },
    contractText: {
        fontSize: 14,
        lineHeight: 24,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderRadius: 4,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#007aff',
        borderColor: '#007aff',
    },
    checkboxLabel: {
        fontSize: 16,
        flex: 1,
    },
    acceptButton: {
        marginTop: 8,
    },
}); 