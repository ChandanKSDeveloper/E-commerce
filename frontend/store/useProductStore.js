import { create } from "zustand";
import axios from "axios";

// ─── Server URL Config ───────────────────────────────────────────────────────
// Add or change URLs here to support additional environments.
// The active URL is controlled by VITE_API_URL in your .env file:
//   - Development : frontend/.env              → http://localhost:4000/api/v1
//   - Production  : frontend/.env.production   → https://your-production-api.com/api/v1
const SERVER_URLS = {
    dev:  "http://localhost:4000/api/v1",
    prod: "https://your-production-api.com/api/v1",
};

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL = envApiUrl
    ? envApiUrl.replace(/\/$/, "")       // use .env value (dev or prod)
    : SERVER_URLS.dev;                   // safe fallback to local backend

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

const getErrorMessage = (error, fallbackMessage) =>
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallbackMessage;

const useProductStore = create((set) => ({
    products: [],
    product: null,
    reviews: [],
    loading: false,
    error: null,
    message: null,
    count: 0,
    productsCount: 0,
    currentPage: 1,
    resultPerPage: 10,
    totalPages: 0,
    filteredProductsCount: 0,
    isChangingPage: false,

    

    clearError: () => set({ error: null }),
    clearMessage: () => set({ message: null }),
    setProducts: (products) => set({ products }),
    setProduct: (product) => set({ product }),

    getAllProducts: async (params = {}) => {
        // Determine if this is a page change
        const isPageChange = params.page > 1;

        set({ loading: true, isPageChange, error: null });

        try {
            const { data } = await api.get("/products", { params });

            // calculate total pages
            const totalPages = Math.ceil(data.productsCount / data.resultPerPage);

            const currentPage = parseInt(params.page) || 1;
            set({
                products: Array.isArray(data.products) ? data.products : [],
                count: data.count ?? 0,
                productsCount: data.productsCount ?? 0,
                currentPage: currentPage,
                resultPerPage: data.resultPerPage ?? 10,
                totalPages: totalPages,
                loading: false,
                isChangingPage: false,
            });

            return data;
        } catch (error) {
            set({
                products: [],
                loading: false,
                error: getErrorMessage(error, "Failed to fetch products"),
                count: 0,
                productsCount: 0,
                currentPage: 1,
                resultPerPage: 10,
                totalPages: 0,
                filteredProductsCount: 0,
                isChangingPage : false
            });

            return null;
        }
    },

    getProductById: async (id) => {
        set({ loading: true, error: null });

        try {
            const { data } = await api.get(`/product/${id}`);

            set({
                product: data.product ?? null,
                loading: false,
            });

            return data;
        } catch (error) {
            set({
                product: null,
                loading: false,
                error: getErrorMessage(error, "Failed to fetch product"),
            });

            return null;
        }
    },

    createProduct: async (payload) => {
        set({ loading: true, error: null, message: null });

        try {
            const { data } = await api.post("/admin/product/new", payload);

            set({
                product: data.product ?? null,
                loading: false,
                message: "Product created successfully",
            });

            return data;
        } catch (error) {
            set({
                loading: false,
                error: getErrorMessage(error, "Failed to create product"),
            });

            return null;
        }
    },

    updateProduct: async (id, payload) => {
        set({ loading: true, error: null, message: null });

        try {
            const { data } = await api.put(`/admin/product/${id}`, payload);

            set({
                product: data.product ?? null,
                loading: false,
                message: "Product updated successfully",
            });

            return data;
        } catch (error) {
            set({
                loading: false,
                error: getErrorMessage(error, "Failed to update product"),
            });

            return null;
        }
    },

    deleteProduct: async (id) => {
        set({ loading: true, error: null, message: null });

        try {
            const { data } = await api.delete(`/admin/product/${id}`);

            set((state) => ({
                products: state.products.filter((product) => product._id !== id),
                product: state.product?._id === id ? null : state.product,
                loading: false,
                message: data.message ?? "Product deleted successfully",
            }));

            return data;
        } catch (error) {
            set({
                loading: false,
                error: getErrorMessage(error, "Failed to delete product"),
            });

            return null;
        }
    },

    createProductReview: async (payload) => {
        set({ loading: true, error: null, message: null });

        try {
            const { data } = await api.put("/review", payload);

            set({
                loading: false,
                message: data.message ?? "Review saved successfully",
            });

            return data;
        } catch (error) {
            set({
                loading: false,
                error: getErrorMessage(error, "Failed to save review"),
            });

            return null;
        }
    },

    getProductReviews: async (id) => {
        set({ loading: true, error: null });

        try {
            const { data } = await api.get("/reviews", {
                params: { id },
            });

            set({
                reviews: Array.isArray(data.reviews) ? data.reviews : [],
                loading: false,
            });

            return data;
        } catch (error) {
            set({
                reviews: [],
                loading: false,
                error: getErrorMessage(error, "Failed to fetch reviews"),
            });

            return null;
        }
    },

    deleteProductReview: async ({ productId, id }) => {
        set({ loading: true, error: null, message: null });

        try {
            const { data } = await api.delete("/reviews", {
                params: { productId, id },
            });

            set({
                reviews: Array.isArray(data.reviews) ? data.reviews : [],
                loading: false,
                message: data.message ?? "Review deleted successfully",
            });

            return data;
        } catch (error) {
            set({
                loading: false,
                error: getErrorMessage(error, "Failed to delete review"),
            });

            return null;
        }
    },
}));

export default useProductStore;
