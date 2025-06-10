import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to an error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    handleRestart = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <Ionicons name="warning-outline" size={64} color="#ff3b30" />
                        <Text style={styles.title}>Bir şeyler ters gitti</Text>
                        <Text style={styles.message}>
                            Beklenmeyen bir hata oluştu. Lütfen uygulamayı yeniden başlatın.
                        </Text>
                        
                        {__DEV__ && (
                            <View style={styles.errorDetails}>
                                <Text style={styles.errorTitle}>Hata Detayları:</Text>
                                <Text style={styles.errorText}>
                                    {this.state.error && this.state.error.toString()}
                                </Text>
                                <Text style={styles.errorText}>
                                    {this.state.errorInfo.componentStack}
                                </Text>
                            </View>
                        )}
                        
                        <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
                            <Text style={styles.buttonText}>Tekrar Dene</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        maxWidth: 300,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#007aff',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    errorDetails: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        width: '100%',
    },
    errorTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    errorText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
});

export default ErrorBoundary;
