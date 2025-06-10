import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../screens/customer/HomeScreen';
import { useAuth } from '../contexts/AuthContext';
import useCache from '../hooks/useCache';

// Mock the hooks
jest.mock('../contexts/AuthContext');
jest.mock('../hooks/useCache');

describe('HomeScreen', () => {
    const mockUser = {
        token: 'test-token',
        id: '1',
        name: 'Test User',
    };

    const mockRestaurants = [
        {
            id: '1',
            name: 'Test Restaurant 1',
            description: 'Test Description 1',
            imageUrl: 'https://example.com/image1.jpg',
            rating: 4.5,
            deliveryTime: 30,
        },
        {
            id: '2',
            name: 'Test Restaurant 2',
            description: 'Test Description 2',
            imageUrl: 'https://example.com/image2.jpg',
            rating: 4.2,
            deliveryTime: 25,
        },
    ];

    beforeEach(() => {
        // Mock useAuth hook
        useAuth.mockReturnValue({
            user: mockUser,
        });

        // Mock useCache hook
        useCache.mockReturnValue({
            data: mockRestaurants,
            loading: false,
            error: null,
            refetch: jest.fn(),
            invalidate: jest.fn(),
        });
    });

    it('renders loading state correctly', () => {
        useCache.mockReturnValue({
            data: null,
            loading: true,
            error: null,
            refetch: jest.fn(),
            invalidate: jest.fn(),
        });

        const { getByTestId } = render(<HomeScreen />);
        expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('renders error state correctly', () => {
        const errorMessage = 'Test error message';
        useCache.mockReturnValue({
            data: null,
            loading: false,
            error: new Error(errorMessage),
            refetch: jest.fn(),
            invalidate: jest.fn(),
        });

        const { getByText } = render(<HomeScreen />);
        expect(getByText(errorMessage)).toBeTruthy();
    });

    it('renders restaurants correctly', () => {
        const { getByText } = render(<HomeScreen />);
        expect(getByText('Test Restaurant 1')).toBeTruthy();
        expect(getByText('Test Restaurant 2')).toBeTruthy();
    });

    it('handles refresh correctly', async () => {
        const mockInvalidate = jest.fn();
        useCache.mockReturnValue({
            data: mockRestaurants,
            loading: false,
            error: null,
            refetch: jest.fn(),
            invalidate: mockInvalidate,
        });

        const { getByTestId } = render(<HomeScreen />);
        const refreshControl = getByTestId('refresh-control');
        
        fireEvent(refreshControl, 'refresh');
        
        await waitFor(() => {
            expect(mockInvalidate).toHaveBeenCalled();
        });
    });

    it('navigates to restaurant detail when restaurant is pressed', () => {
        const mockNavigate = jest.fn();
        const { getByText } = render(
            <HomeScreen navigation={{ navigate: mockNavigate }} />
        );

        fireEvent.press(getByText('Test Restaurant 1'));
        expect(mockNavigate).toHaveBeenCalledWith('RestaurantDetail', {
            id: '1',
        });
    });

    it('renders empty state correctly', () => {
        useCache.mockReturnValue({
            data: [],
            loading: false,
            error: null,
            refetch: jest.fn(),
            invalidate: jest.fn(),
        });

        const { getByText } = render(<HomeScreen />);
        expect(getByText('Henüz restoran bulunmuyor')).toBeTruthy();
    });
}); 