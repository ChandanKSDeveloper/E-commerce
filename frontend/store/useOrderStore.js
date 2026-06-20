import { create } from "zustand";
import api from "../src/config/axios";

const getErrorMessage = (error, fallback) =>
    error.response?.data?.message || error.response?.data?.error || error.message || fallback;

const useOrderStore = create((set) => ({
    order: null,
    orders: [],
    loading: false,
    error: null,
    success: false,

    clearError: () => set({ error: null }),
    clearSuccess: () => set({ success: false }),

    createOrder: async (orderData) => {
        set({ loading: true, error: null, success: false });
        try {
            const { data } = await api.post('/order/new', orderData);
            set({ order: data.order, loading: false, success: true });
            return { success: true, order: data.order };
        } catch (error) {
            set({ error: getErrorMessage(error, 'Failed to create order'), loading: false, success: false });
            return { success: false, error: getErrorMessage(error, 'Failed to create order') };
        }
    },

    getMyOrders: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.get('/orders/me');
            set({ orders: data.orders, loading: false });
            return { success: true, orders: data.orders };
        } catch (error) {
            set({ error: getErrorMessage(error, 'Failed to fetch orders'), loading: false });
            return { success: false, error: getErrorMessage(error, 'Failed to fetch orders') };
        }
    },

    getOrderDetails: async (id) => {
        set({ loading: true, error: null });
        try {
            const { data } = await api.get(`/order/${id}`);
            set({ order: data.order, loading: false });
            return { success: true, order: data.order };
        } catch (error) {
            set({ error: getErrorMessage(error, 'Failed to fetch order'), loading: false });
            return { success: false, error: getErrorMessage(error, 'Failed to fetch order') };
        }
    },
}));

export default useOrderStore;
