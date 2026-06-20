import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MapPin, Phone, User, ShoppingCart, CreditCard, ChevronRight } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import useUserStore from '../../store/useUserStore';
import useOrderStore from '../../store/useOrderStore';
import { Button } from '@/components/ui';
import MetaData from '@/components/common/Metadata';
import CheckoutSteps from '@/components/common/CheckoutSteps';

export default function ConfirmOrder() {
    const navigate = useNavigate();
    const { cartItems, shippingInfo, clearCart } = useCartStore();
    const { user } = useUserStore();
    const { createOrder, loading } = useOrderStore();

    // Calculate Prices
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice > 1000 ? 0 : 99;
    const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const addressStr = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}, ${shippingInfo.pinCode}, ${shippingInfo.country}`;

    const processOrder = async () => {
        const orderData = {
            orderItems: cartItems.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                product: item.product
            })),
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo: {
                id: `mock_pay_${Math.random().toString(36).substr(2, 9)}`,
                status: 'succeeded'
            }
        };

        const result = await createOrder(orderData);
        if (result.success) {
            toast.success('Order placed successfully!');
            clearCart();
            // Redirect to profile page or a thank you page
            navigate('/profile');
        } else {
            toast.error(result.error || 'Failed to place order');
        }
    };

    return (
        <>
            <MetaData title="Confirm Order | ShopHub" />
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <CheckoutSteps activeStep={1} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                    {/* Details Column */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Shipping Info Card */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" /> Shipping Information
                            </h3>
                            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="font-semibold text-gray-900 dark:text-white">Name:</span>
                                    <span>{user?.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="font-semibold text-gray-900 dark:text-white">Phone:</span>
                                    <span>{shippingInfo.phoneNo}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <span className="font-semibold text-gray-900 dark:text-white">Address:</span>
                                    <span className="flex-1">{addressStr}</span>
                                </div>
                            </div>
                        </div>

                        {/* Cart Items Card */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-primary" /> Your Cart Items
                            </h3>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[400px] overflow-y-auto pr-2">
                                {cartItems.map((item) => (
                                    <div key={item.product} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="max-w-[280px] sm:max-w-md">
                                                <Link to={`/product/${item.product}`} className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
                                                    {item.name}
                                                </Link>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right font-semibold text-gray-900 dark:text-white">
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary Column */}
                    <div className="lg:col-span-4">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-4 mb-4">
                                Order Summary
                            </h3>

                            <div className="space-y-3.5 mb-6 text-sm">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">₹{itemsPrice.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {shippingPrice === 0 ? (
                                            <span className="text-green-500">Free</span>
                                        ) : (
                                            `₹${shippingPrice}`
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Tax (18% GST)</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">₹{taxPrice.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-4 border-t">
                                    <span>Total Amount</span>
                                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <Button
                                onClick={processOrder}
                                disabled={loading}
                                className="w-full py-6 text-base gap-2 rounded-xl"
                            >
                                <CreditCard className="h-5 w-5" />
                                {loading ? 'Placing Order...' : 'Place Order & Pay'}
                            </Button>

                            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                                Secure checkout encryption <ChevronRight className="h-3 w-3" />
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
