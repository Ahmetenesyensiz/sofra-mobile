import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    useColorScheme,
} from 'react-native';

const SearchScreen = () => {
    const isDarkMode = useColorScheme() === 'dark';

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: isDarkMode ? '#000' : '#fff' },
            ]}
        >
            <Text style={[styles.text, { color: isDarkMode ? '#fff' : '#333' }]}>
                🔍 Arama ekranı buraya gelecek
            </Text>
        </View>
    );
};

export default SearchScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        fontWeight: '500',
    },
});
