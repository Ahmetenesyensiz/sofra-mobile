import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import CustomInput from '../../components/CustomInput';
import PrimaryButton from '../../components/PrimaryButton';
import Card from '../../components/Card';
import { Heading, BodyText, Caption } from '../../components/Typography';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../config';

const LoginScreen = () => {
    const { login: contextLogin } = useAuth();
    const navigation = useNavigation();
    const isDarkMode = useColorScheme() === 'dark';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        if (!email || !password) {
            setError('Email ve şifre zorunludur.');
            return;
        }

        setLoading(true);
        try {
            const userData = await authService.login(email, password);
            await contextLogin(userData);
        } catch (error) {
            setError(error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <View style={[
                        styles.logoContainer,
                        { backgroundColor: isDarkMode ? COLORS.surface.darkElevated : COLORS.surface.light }
                    ]}>
                        <Ionicons
                            name="restaurant"
                            size={48}
                            color={COLORS.primary}
                        />
                    </View>
                    <Heading level={1} style={styles.title}>
                        Sofra'ya Hoşgeldin 👋
                    </Heading>
                    <Caption style={styles.subtitle}>
                        Hesabına giriş yap ve devam et
                    </Caption>
                </View>

                <Card style={styles.formCard}>
                    <CustomInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="ornek@mail.com"
                        keyboardType="email-address"
                        icon="mail-outline"
                        error={error && error.includes('email') ? error : null}
                    />
                    <CustomInput
                        label="Şifre"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••"
                        secureTextEntry
                        icon="lock-closed-outline"
                        error={error && error.includes('şifre') ? error : null}
                    />

                    {error && !error.includes('email') && !error.includes('şifre') && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle-outline" size={20} color={COLORS.danger} />
                            <BodyText style={styles.errorText}>{error}</BodyText>
                        </View>
                    )}

                    <PrimaryButton
                        title="Giriş Yap"
                        onPress={handleLogin}
                        loading={loading}
                        size="lg"
                        fullWidth
                        icon="log-in-outline"
                        style={styles.loginButton}
                    />
                </Card>

                <View style={styles.registerOptions}>
                    <Caption style={styles.registerTitle}>
                        Hesabın yok mu?
                    </Caption>

                    <PrimaryButton
                        title="Müşteri Olarak Kayıt Ol"
                        onPress={() => navigation.navigate('Register')}
                        variant="outline"
                        size="md"
                        fullWidth
                        icon="person-outline"
                        style={styles.registerButton}
                    />

                    <PrimaryButton
                        title="Restoran Sahibi Olarak Kayıt Ol"
                        onPress={() => navigation.navigate('OwnerRegister')}
                        variant="secondary"
                        size="md"
                        fullWidth
                        icon="restaurant-outline"
                        style={styles.registerButton}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.lg,
        justifyContent: 'center',
        minHeight: '100%',
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
        ...SHADOWS.md,
    },
    title: {
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    formCard: {
        marginBottom: SPACING.xl,
        padding: SPACING.xl,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.danger + '10',
        padding: SPACING.md,
        borderRadius: SPACING.sm,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.danger + '30',
    },
    errorText: {
        color: COLORS.danger,
        marginLeft: SPACING.sm,
        flex: 1,
    },
    loginButton: {
        marginTop: SPACING.md,
    },
    registerOptions: {
        alignItems: 'center',
        gap: SPACING.md,
    },
    registerTitle: {
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    registerButton: {
        marginBottom: SPACING.sm,
    },
});
