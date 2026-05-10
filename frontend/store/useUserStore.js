import { create } from "zustand";
import api from "../src/config/axios";
import { persist } from "zustand/middleware";

const getErrorMessage = (error, fallbackMessage) =>
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallbackMessage;


const useUserStore = create(
    persist(
        (set, get) => ({
            // state
            user: null,
            isAuthenticated: false,
            loading: false,
            authChecked: false, // tracks if initial auth check completed
            error: null,
            message: null,
            isUpdating: false,

            // clear function
            clearError: () => set({ error: null, message: null }),
            clearMessage: () => set({ message: null }),
            clearUpdating: () => set({ isUpdating: false }),

            clearUser: () => set(
                {
                    user: null,
                    isAuthenticated: false,
                    authChecked: true,
                    error: null,
                    message: null
                }),



            // actions
            // register action
            registerUser: async (userData) => {
                set({ loading: true, error: null });
                try {
                    const { data } = await api.post('/auth/register', userData);

                    if (data.token) {
                        localStorage.setItem('token', data.token);
                        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

                        set({
                            user: data.user,
                            isAuthenticated: true,
                            loading: false,
                            error: null,
                            message: data.message
                        })
                    }
                    return { success: true, data };

                } catch (error) {
                    set({
                        error: getErrorMessage(error, 'Registration failed'),
                        loading: false,
                        isAuthenticated: false,
                        user: null
                    })
                    return { success: false, error: getErrorMessage(error, 'Registration failed') };
                }
            },

            // login action
            loginUser: async (userData) => {
                set({ loading: true, error: null });
                try {
                    const { data } = await api.post('/auth/login', userData);

                    if (data.token) {
                        localStorage.setItem('token', data.token);
                        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

                        set({
                            user: data.user,
                            isAuthenticated: true,
                            loading: false,
                            error: null,
                            message: data.message
                        })
                    }
                    return { success: true, data };

                } catch (error) {
                    set({
                        error: getErrorMessage(error, 'Login failed'),
                        loading: false,
                        isAuthenticated: false,
                        user: null
                    })
                    return { success: false, error: getErrorMessage(error, 'Login failed') };
                }
            },

            // logout action
            logoutUser: async () => {
                set({
                    loading: true,
                    error: null,
                    message: null
                })

                try {
                    await api.post('/auth/logout');
                    localStorage.removeItem('token');
                    delete api.defaults.headers.common['Authorization'];

                    set({
                        user: null,
                        isAuthenticated: false,
                        loading: false,
                        error: null,
                        message: 'Logout successful'
                    })
                    return { success: true, message: 'Logout successful' };
                } catch (error) {
                    localStorage.removeItem('token');
                    delete api.defaults.headers.common['Authorization'];

                    set({
                        error: getErrorMessage(error, 'Logout failed'),
                        loading: false,
                        isAuthenticated: false,
                        user: null
                    })

                    return { success: false, error: getErrorMessage(error, 'Logout failed') };
                }
            },

            // get user action
            getUserProfile: async () => {
                set({
                    loading: true,
                    error: null,
                    message: null
                })

                try {
                    const { data } = await api.get('/auth/me');
                    set({
                        user: data.user,
                        isAuthenticated: true,
                        loading: false,
                        error: null,
                        message: data.message
                    })
                    return { success: true, data };
                } catch (error) {
                    localStorage.removeItem('token');
                    delete api.defaults.headers.common['Authorization'];
                    set({
                        error: getErrorMessage(error, 'Failed to get user'),
                        loading: false,
                        isAuthenticated: false,
                        user: null
                    })
                    return { success: false, error: getErrorMessage(error, 'Failed to get user') };
                }
            },

            // update profile action
            updateProfile: async (userData) => {
                set({
                    loading: true,
                    error: null,
                    message: null
                })

                try {
                    const { data } = await api.put('/auth/me/update', userData);
                    set({
                        user: data.user,
                        isAuthenticated: true,
                        loading: false,
                        error: null,
                        message: data.message
                    })
                    return { success: true, data };
                } catch (error) {
                    set({
                        error: getErrorMessage(error, 'Failed to update profile'),
                        loading: false,
                        isAuthenticated: false,
                        user: null
                    })
                    return { success: false, error: getErrorMessage(error, 'Failed to update profile') };
                }
            },

            // update password action
            updatePassword: async (userData) => {
                set({
                    loading: true,
                    error: null,
                    message: null
                })

                try {
                    const { data } = await api.put('/auth/password/update', userData);

                    if (data.token) {
                        localStorage.setItem('token', data.token);
                        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                    }
                    set({
                        user: data.user,
                        isAuthenticated: true,
                        loading: false,
                        error: null,
                        message: data.message,

                    })
                    return { success: true, data };
                } catch (error) {
                    set({
                        error: getErrorMessage(error, 'Failed to update password'),
                        loading: false,

                    })
                    return { success: false, error: getErrorMessage(error, 'Failed to update password') };
                }
            },

            // forgot password action
            forgotPassword: async (userData) => {
                set({
                    loading: true,
                    error: null,
                    message: null
                })

                try {
                    const { data } = await api.post('/auth/password/forgot', userData);
                    set({
                        loading: false,
                        error: null,
                        message: data.message || " Password reset link sent to your email"
                    })
                    return { success: true, message: data.message || " Password reset link sent to your email" };
                } catch (error) {
                    set({
                        error: getErrorMessage(error, 'Failed to forgot password'),
                        loading: false,

                    })
                    return { success: false, error: getErrorMessage(error, 'Failed to forgot password') };
                }
            },

            // reset password action
            resetPassword: async (token, passwordData) => {
                set({
                    loading: true,
                    error: null,
                    message: null
                })

                try {
                    const { data } = await api.put(`/auth/password/reset/${token}`, passwordData);

                    if (data.token) {
                        localStorage.setItem('token', data.token);
                        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                    }

                    set({
                        user: data.user,
                        isAuthenticated: true,
                        loading: false,
                        error: null,
                        message: data.message || " Password reset successfully"
                    })
                    return { success: true, message: data.message || " Password reset successfully" };
                } catch (error) {
                    set({
                        error: getErrorMessage(error, 'Failed to reset password'),
                        loading: false,

                    })
                    return { success: false, error: getErrorMessage(error, 'Failed to reset password') };
                }
            },

            // check if token is valid on app start --web
            checkAuth: async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    set({
                        isAuthenticated: false, user: null, loading: false, authChecked: true, error: null, message: null
                    })
                    return { success: false, error: 'No token found' };
                }

                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const result = await get().getUserProfile();
                if (result.success) {
                    set({
                        user: result.data?.user || result.user,
                        isAuthenticated: true,
                        loading: false,
                        authChecked: true,
                        error: null,
                        message: result.message
                    })
                    return { success: true, data: result.data };
                } else {
                    set({
                        error: null, // don't show auth check errors to user
                        loading: false,
                        authChecked: true,
                        isAuthenticated: false,
                        user: null
                    })
                    return { success: false, error: result.error };
                }
            }
        }),
        {
            name: 'user-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                // loading: state.loading,
                // error: state.error,
                // message: state.message
            })
        }

    )
);


export default useUserStore;