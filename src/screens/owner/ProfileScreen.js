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
        inputLabel: {
            fontSize: 16,
            color: isDarkMode ? '#ccc' : '#333',
            marginBottom: 8,
        },
        input: {
            borderWidth: 1,
            borderColor: isDarkMode ? '#333' : '#ccc',
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            color: isDarkMode ? '#fff' : '#000',
            backgroundColor: isDarkMode ? '#111' : '#fff',
        },
        card: {
            backgroundColor: isDarkMode ? '#111' : '#f2f2f2',
            marginHorizontal: 20,
            marginBottom: 15,
            padding: 15,
            borderRadius: 10,
        },
        profileName: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000',
            marginBottom: 4,
        },
        profileEmail: {
            fontSize: 14,
            color: isDarkMode ? '#aaa' : '#666',
        },
    }); 