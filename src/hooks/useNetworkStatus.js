import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [connectionType, setConnectionType] = useState('wifi');

    useEffect(() => {
        // Simple network status - always assume connected for now
        // In a real app, you would use @react-native-netinfo/netinfo
        setIsConnected(true);
        setConnectionType('wifi');
    }, []);

    return {
        isConnected,
        connectionType,
        isOnline: isConnected,
        isOffline: !isConnected,
    };
};
