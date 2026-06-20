import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
    persist(
        (set, get) => ({
            cartItems: [],
            shippingInfo: {},

            addToCart: (item) => {
                const existing = get().cartItems.find(i => i.product === item.product);
                if (existing) {
                    set({
                        cartItems: get().cartItems.map(i =>
                            i.product === item.product
                                ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
                                : i
                        )
                    });
                } else {
                    set({ cartItems: [...get().cartItems, { ...item, quantity: 1 }] });
                }
            },

            removeFromCart: (productId) => {
                set({ cartItems: get().cartItems.filter(i => i.product !== productId) });
            },

            updateQuantity: (productId, qty) => {
                set({
                    cartItems: get().cartItems.map(i =>
                        i.product === productId
                            ? { ...i, quantity: Math.min(Math.max(1, qty), i.stock) }
                            : i
                    )
                });
            },

            saveShippingInfo: (info) => set({ shippingInfo: info }),

            clearCart: () => set({ cartItems: [], shippingInfo: {} }),
        }),
        { name: "cart-storage" }
    )
);

export default useCartStore;
