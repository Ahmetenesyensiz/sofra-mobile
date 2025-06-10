// src/services/userService.js

import api from './api';

const getWaiters = async (restaurantId) => {
    const res = await api.get(`/users?role=WAITER&restaurantId=${restaurantId}`);
    return res.data;
};

const deleteUser = async (userId) => {
    await api.delete(`/users/${userId}`);
};

export default {
    getWaiters,
    deleteUser,
};
