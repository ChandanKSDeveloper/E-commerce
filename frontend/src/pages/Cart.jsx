import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import useCartStore from '../../store/useCartStore';
import useUserStore from '../../store/useUserStore';
import { Button } from '@/components/ui';
import MetaData from '@/components/common/Metadata';

export default function Cart() {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCartStore();
    const { isAuthenticated } = useUserStore();

    const increaseQty = (id, quantity, stock) => {
        const newQty = quantity + 1;
        if (newQty > stock) return;
        updateQuantity(id, newQty);
    };

    const decreaseQty = (id, quantity) => {
        const newQty = quantity - 1;
        if (newQty <= 0) return;
        updateQuantity(id, newQty);
    };

    const checkoutHandler = () => {
        if (isAuthenticated) {
            navigate('/shipping');
        } else {
            navigate('/login?redirect=shipping');
        }
    };

    const totalAmount = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    if (cartItems.length === 0) {
        return (
            <>
                <MetaData title="Shopping Cart | ShopHub" />
                <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
                    <div className="p-6 bg-primary/5 rounded-full mb-4">
                        <ShoppingBag className="h-16 w-16 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Cart is Empty</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                        Looks like you haven't added any products to your cart yet. Let's find some awesome items for you!
                    </p>
                    <Link to="/">
                        <Button className="gap-2">
                            Go Shopping <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <MetaData title="Shopping Cart | ShopHub" />
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
                    Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-8 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.product}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm gap-4"
                            >
                                {/* Product Info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <Link
                                            to={`/product/${item.product}`}
                                            className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-1"
                                        >
                                            {item.name}
                                        </Link>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                            Price: ₹{item.price.toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {item.stock > 0 ? (
                                                <span className="text-green-500 font-medium">In Stock</span>
                                            ) : (
                                                <span className="text-red-500 font-medium">Out of Stock</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Controls & Pricing */}
                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 pt-4 sm:pt-0">
                                    {/* Quantity Selector */}
                                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                                        <button
                                            type="button"
                                            onClick={() => decreaseQty(item.product, item.quantity)}
                                            className="p-2 text-gray-500 hover:text-primary transition-colors disabled:opacity-30"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="px-3 text-sm font-semibold text-gray-900 dark:text-white">
                                            {item.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => increaseQty(item.product, item.quantity, item.stock)}
                                            className="p-2 text-gray-500 hover:text-primary transition-colors disabled:opacity-30"
                                            disabled={item.quantity >= item.stock}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Subtotal */}
                                    <div className="text-right min-w-[80px]">
                                        <span className="block font-bold text-gray-900 dark:text-white">
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </span>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            removeFromCart(item.product);
                                            toast.success(`${item.name} removed from cart`);
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-4 mb-4">
                                Order Summary
                            </h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Total Items</span>
                                    <span className="font-medium text-gray-950 dark:text-white">{totalItems}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-950 dark:text-white">₹{totalAmount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Shipping</span>
                                    <span className="font-medium text-green-500">{totalAmount > 1000 ? 'Free' : '₹99'}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Tax (18% GST)</span>
                                    <span className="font-medium text-gray-950 dark:text-white">₹{Math.round(totalAmount * 0.18).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-3 border-t">
                                    <span>Estimated Total</span>
                                    <span>₹{(totalAmount + (totalAmount > 1000 ? 0 : 99) + Math.round(totalAmount * 0.18)).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <Button onClick={checkoutHandler} className="w-full py-6 text-base gap-2 rounded-xl">
                                Proceed to Checkout <ArrowRight className="h-5 w-5" />
                            </Button>

                            <button
                                type="button"
                                onClick={() => {
                                    clearCart();
                                    toast.success('Cart cleared');
                                }}
                                className="w-full mt-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            >
                                Clear Entire Cart
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-4">
                                Free shipping on orders above ₹1,000
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
