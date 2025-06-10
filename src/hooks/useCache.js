import { useState, useEffect, useCallback } from 'react';
import cacheService from '../services/cacheService';

export const useCache = (key, fetchData, options = {}) => {
    const {
        expiry = 1000 * 60 * 5, // 5 dakika
        enabled = true,
        onError = () => {},
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAndCache = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Önce cache'i kontrol et
            const cachedData = await cacheService.get(key);
            if (cachedData) {
                setData(cachedData);
                setLoading(false);
                return;
            }

            // Cache'de yoksa yeni veri çek
            const freshData = await fetchData();
            setData(freshData);

            // Veriyi cache'e kaydet
            await cacheService.set(key, freshData, expiry);
        } catch (err) {
            setError(err);
            onError(err);
        } finally {
            setLoading(false);
        }
    }, [key, fetchData, expiry, onError]);

    const invalidate = useCallback(async () => {
        await cacheService.remove(key);
        await fetchAndCache();
    }, [key, fetchAndCache]);

    useEffect(() => {
        if (enabled) {
            fetchAndCache();
        }
    }, [enabled, fetchAndCache]);

    return {
        data,
        loading,
        error,
        refetch: fetchAndCache,
        invalidate,
    };
};

export default useCache; 