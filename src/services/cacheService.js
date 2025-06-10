import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_EXPIRY = 1000 * 60 * 5; // 5 dakika

class CacheService {
    constructor() {
        this.cache = new Map();
    }

    // Cache'e veri ekle
    async set(key, data, expiry = CACHE_EXPIRY) {
        const item = {
            data,
            timestamp: Date.now(),
            expiry,
        };

        try {
            await AsyncStorage.setItem(key, JSON.stringify(item));
            this.cache.set(key, item);
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    // Cache'den veri al
    async get(key) {
        try {
            // Önce memory cache'i kontrol et
            if (this.cache.has(key)) {
                const item = this.cache.get(key);
                if (!this.isExpired(item)) {
                    return item.data;
                }
                this.cache.delete(key);
            }

            // AsyncStorage'dan al
            const item = await AsyncStorage.getItem(key);
            if (!item) return null;

            const parsedItem = JSON.parse(item);
            if (this.isExpired(parsedItem)) {
                await this.remove(key);
                return null;
            }

            // Memory cache'e ekle
            this.cache.set(key, parsedItem);
            return parsedItem.data;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    // Cache'den veri sil
    async remove(key) {
        try {
            await AsyncStorage.removeItem(key);
            this.cache.delete(key);
        } catch (error) {
            console.error('Cache remove error:', error);
        }
    }

    // Cache'i temizle
    async clear() {
        try {
            await AsyncStorage.clear();
            this.cache.clear();
        } catch (error) {
            console.error('Cache clear error:', error);
        }
    }

    // Cache'in süresi dolmuş mu kontrol et
    isExpired(item) {
        return Date.now() - item.timestamp > item.expiry;
    }

    // Belirli bir pattern'e uyan cache'leri temizle
    async clearByPattern(pattern) {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const matchingKeys = keys.filter(key => key.includes(pattern));
            await Promise.all(matchingKeys.map(key => this.remove(key)));
        } catch (error) {
            console.error('Cache clearByPattern error:', error);
        }
    }
}

export default new CacheService(); 