# 🧪 INTERACTIVE ELEMENTS TEST CHECKLIST

## **✅ AUTHENTICATION FLOW TESTS**

### **LoginScreen Tests**
- [ ] **Valid Login**: Email + Password → Success → Navigate to appropriate dashboard
- [ ] **Invalid Email**: Show "Geçerli bir email adresi girin" error
- [ ] **Invalid Password**: Show "Email veya şifre hatalı" error
- [ ] **Empty Fields**: Show "Email ve şifre zorunludur" error
- [ ] **Network Error**: Show "Sunucuya bağlanılamıyor" error
- [ ] **Register Customer Button**: Navigate to RegisterScreen
- [ ] **Register Owner Button**: Navigate to OwnerRegisterScreen
- [ ] **Loading State**: Button shows spinner during API call

### **RegisterScreen Tests**
- [ ] **Valid Registration**: All fields → Success → Navigate to Login
- [ ] **Weak Password**: Show password strength error
- [ ] **Password Mismatch**: Show "Şifreler eşleşmiyor" error
- [ ] **Invalid Email**: Show email format error
- [ ] **Invalid Phone**: Show phone format error
- [ ] **Duplicate Email**: Show "Bu email adresi zaten kayıtlı" error
- [ ] **Network Error**: Show appropriate error message
- [ ] **Login Link**: Navigate to LoginScreen

### **OwnerRegisterScreen Tests**
- [ ] **Valid Registration**: All fields → Success → Navigate to Payment
- [ ] **Missing Restaurant Info**: Show validation errors
- [ ] **Invalid Business Data**: Show appropriate errors
- [ ] **Payment Navigation**: Pass correct data to payment screen

## **✅ OWNER DASHBOARD TESTS**

### **TableManagementScreen Tests**
- [ ] **Add Valid Table**: Table number + Capacity → Success → Refresh list
- [ ] **Duplicate Table Number**: Show "Bu masa numarası zaten mevcut" error
- [ ] **Invalid Capacity**: Show "Kapasite geçerli bir sayı olmalıdır" error
- [ ] **Empty Fields**: Show validation errors
- [ ] **Delete Table**: Confirm dialog → Success → Remove from list
- [ ] **QR Code Generation**: Each table has unique QR code
- [ ] **Loading States**: Show spinners during operations

### **AddWaiterScreen Tests**
- [ ] **Valid Waiter Creation**: All fields → Success → Clear form
- [ ] **Missing Restaurant ID**: Show "Restoran bilgisi bulunamadı" error
- [ ] **Invalid Email**: Show email validation error
- [ ] **Weak Password**: Show password strength error
- [ ] **Duplicate Email**: Show "Bu e-posta zaten kayıtlı" error
- [ ] **Network Error**: Show appropriate error message
- [ ] **Form Validation**: Real-time validation feedback

## **✅ WAITER DASHBOARD TESTS**

### **ActiveCallsScreen Tests**
- [ ] **Fetch Active Calls**: Load calls on screen mount
- [ ] **Auto Refresh**: Refresh every 10 seconds
- [ ] **Resolve Call**: Delete call → Remove from list → Show success
- [ ] **Network Error**: Show error + Retry button
- [ ] **Empty State**: Show "Aktif çağrı bulunmamaktadır" message
- [ ] **Memory Leak Prevention**: Clear interval on unmount
- [ ] **Retry Mechanism**: Retry button works after error

## **✅ CUSTOMER DASHBOARD TESTS**

### **HomeScreen Tests**
- [ ] **Load Restaurants**: Fetch and display restaurant list
- [ ] **Restaurant Navigation**: Tap restaurant → Navigate to details
- [ ] **Search Functionality**: Filter restaurants by name
- [ ] **Location Services**: Request and use location permissions
- [ ] **Refresh**: Pull-to-refresh functionality
- [ ] **Error Handling**: Network errors show appropriate messages

### **ProfileScreen Tests**
- [ ] **Load Profile**: Fetch and display user data
- [ ] **Avatar Upload**: Camera/gallery selection works
- [ ] **Edit Profile**: Update user information
- [ ] **Logout**: Clear session → Navigate to Login
- [ ] **Order History**: Display past orders
- [ ] **Favorite Restaurants**: Display and manage favorites

## **✅ NAVIGATION TESTS**

### **Tab Navigation Tests**
- [ ] **Customer Tabs**: Home, Orders, Friends, Profile work
- [ ] **Owner Tabs**: Dashboard, Tables, Menu, Reports work
- [ ] **Waiter Tabs**: Calls, Orders, Tables work
- [ ] **Badge Notifications**: Show unread counts
- [ ] **Deep Linking**: Handle external navigation

### **Stack Navigation Tests**
- [ ] **Back Navigation**: Hardware/software back button works
- [ ] **Parameter Passing**: Data passed correctly between screens
- [ ] **Navigation State**: Proper state management
- [ ] **Auth Guards**: Unauthorized access prevented

## **✅ FORM VALIDATION TESTS**

### **Real-time Validation**
- [ ] **Email Format**: Validate on blur
- [ ] **Password Strength**: Show strength indicator
- [ ] **Phone Format**: Auto-format phone numbers
- [ ] **Required Fields**: Show * indicators
- [ ] **Character Limits**: Enforce max lengths

### **Error Handling**
- [ ] **Field-level Errors**: Show errors under specific fields
- [ ] **Form-level Errors**: Show general form errors
- [ ] **API Errors**: Display server validation errors
- [ ] **Network Errors**: Handle connection issues

## **✅ API INTEGRATION TESTS**

### **Authentication API**
- [ ] **Login Endpoint**: POST /auth/login with correct payload
- [ ] **Register Endpoint**: POST /auth/register with validation
- [ ] **Token Handling**: Store and use JWT tokens
- [ ] **Token Refresh**: Handle expired tokens
- [ ] **Logout**: Clear tokens and session data

### **CRUD Operations**
- [ ] **Create Operations**: POST requests with validation
- [ ] **Read Operations**: GET requests with proper filtering
- [ ] **Update Operations**: PUT/PATCH with optimistic updates
- [ ] **Delete Operations**: DELETE with confirmation dialogs

### **Error Responses**
- [ ] **400 Bad Request**: Show validation errors
- [ ] **401 Unauthorized**: Redirect to login
- [ ] **403 Forbidden**: Show access denied message
- [ ] **404 Not Found**: Show resource not found
- [ ] **500 Server Error**: Show generic error message

## **✅ EDGE CASE TESTS**

### **Network Conditions**
- [ ] **Offline Mode**: Show offline indicator
- [ ] **Slow Network**: Show loading states
- [ ] **Network Recovery**: Retry failed requests
- [ ] **Timeout Handling**: Handle request timeouts

### **Data States**
- [ ] **Empty Lists**: Show empty state messages
- [ ] **Loading States**: Show skeletons/spinners
- [ ] **Error States**: Show error messages with retry
- [ ] **Success States**: Show confirmation messages

### **User Input Edge Cases**
- [ ] **Special Characters**: Handle in all text inputs
- [ ] **Very Long Text**: Truncate or scroll appropriately
- [ ] **Copy/Paste**: Support clipboard operations
- [ ] **Keyboard Navigation**: Support tab navigation

## **✅ PERFORMANCE TESTS**

### **Memory Management**
- [ ] **Component Unmounting**: Clean up listeners/timers
- [ ] **Image Loading**: Lazy load and cache images
- [ ] **List Performance**: Virtualize long lists
- [ ] **Memory Leaks**: No memory leaks in navigation

### **Rendering Performance**
- [ ] **Smooth Animations**: 60fps animations
- [ ] **Fast Navigation**: Quick screen transitions
- [ ] **Efficient Re-renders**: Minimize unnecessary renders
- [ ] **Bundle Size**: Optimize app size

## **🔧 TESTING COMMANDS**

```bash
# Run the app
npm start

# Test on iOS
npm run ios

# Test on Android
npm run android

# Run tests
npm test

# Check for memory leaks
npm run analyze
```

## **📱 DEVICE TESTING**

### **iOS Testing**
- [ ] iPhone SE (small screen)
- [ ] iPhone 12 (standard)
- [ ] iPhone 12 Pro Max (large screen)
- [ ] iPad (tablet)

### **Android Testing**
- [ ] Small Android phone
- [ ] Standard Android phone
- [ ] Large Android phone
- [ ] Android tablet

## **🚨 CRITICAL ISSUES TO VERIFY**

1. **IP Address Updated**: All API calls use 10.67.17.151
2. **Token Authentication**: All protected routes include Bearer token
3. **Error Boundaries**: App doesn't crash on errors
4. **Form Validation**: All forms validate before submission
5. **Navigation Guards**: Unauthorized access prevented
6. **Memory Management**: No memory leaks or performance issues
7. **Offline Handling**: Graceful degradation without network
8. **Loading States**: All async operations show loading indicators
9. **Error Messages**: User-friendly error messages throughout
10. **Data Persistence**: User session persists across app restarts
