import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { CreditCard, Lock, ShieldCheck, AlertCircle, QrCode, Building2, Banknote, Sparkles, HelpCircle, Loader2, CheckCircle2 } from 'lucide-react';
import useCartStore from '../../store/useCartStore';
import useUserStore from '../../store/useUserStore';
import useOrderStore from '../../store/useOrderStore';
import { Button } from '@/components/ui';
import MetaData from '@/components/common/Metadata';
import CheckoutSteps from '@/components/common/CheckoutSteps';
import api from '@/config/axios';

// ─── Stripe Element Styles ─────────────────────────────────────────────
const ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            fontSmoothing: 'antialiased',
            color: '#1a1a2e',
            letterSpacing: '0.025em',
            '::placeholder': {
                color: '#94a3b8',
            },
        },
        invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
        },
    },
};

const POPULAR_BANKS = [
    { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
    { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
    { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
    { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
    { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KOTAK' },
];

export default function Payment() {
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();

    const { cartItems, shippingInfo, clearCart } = useCartStore();
    const { user } = useUserStore();
    const { createOrder } = useOrderStore();

    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'netbanking' | 'cod'
    const [processing, setProcessing] = useState(false);
    
    // Card state
    const [cardErrors, setCardErrors] = useState({
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
    });
    const [focusedField, setFocusedField] = useState(null);
    const payBtnRef = useRef(null);

    // UPI state
    const [upiId, setUpiId] = useState('');
    const [upiError, setUpiError] = useState('');

    // Netbanking state
    const [selectedBank, setSelectedBank] = useState('');

    // Auto-switch default payment method if stripe is not configured
    useEffect(() => {
        const checkStripeAvailability = async () => {
            try {
                const { data } = await api.get('/payment/config');
                if (!data.publishableKey) {
                    setPaymentMethod('cod');
                }
            } catch (error) {
                setPaymentMethod('cod');
            }
        };
        checkStripeAvailability();
    }, []);

    // ─── Price Calculations ─────────────────────────────────────────────
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice > 1000 ? 0 : 99;
    const taxPrice = Math.round(itemsPrice * 0.18);
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // ─── Handle card element changes ────────────────────────────────────
    const handleCardChange = (field) => (event) => {
        setCardErrors((prev) => ({
            ...prev,
            [field]: event.error ? event.error.message : '',
        }));
    };

    // ─── Direct Checkout Helper ──────────────────────────────────────────
    const placeOrder = async (paymentId, methodLabel) => {
        const orderData = {
            orderItems: cartItems.map((item) => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                product: item.product,
            })),
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo: {
                id: paymentId,
                status: 'succeeded',
            },
        };

        const orderResult = await createOrder(orderData);

        if (orderResult.success) {
            clearCart();
            toast.success(`Order placed successfully using ${methodLabel}!`);
            navigate('/orders/me');
        } else {
            toast.error(orderResult.error || 'Order creation failed');
        }
    };

    // ─── Stripe Card Submit ─────────────────────────────────────────────
    const handleCardSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            toast.error("Stripe gateway is not active. Please select another payment method.");
            return;
        }

        setProcessing(true);
        payBtnRef.current?.setAttribute('disabled', 'true');

        try {
            // 1. Create Payment Intent on backend
            const { data } = await api.post('/payment/process', {
                amount: Math.round(totalPrice * 100), // convert to paisa
            });

            const clientSecret = data.clientSecret;

            // 2. Confirm the payment with Stripe
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement),
                    billing_details: {
                        name: user?.name,
                        email: user?.email,
                        address: {
                            line1: shippingInfo.address,
                            city: shippingInfo.city,
                            state: shippingInfo.state,
                            postal_code: shippingInfo.pinCode,
                            country: shippingInfo.country,
                        },
                    },
                },
            });

            if (result.error) {
                toast.error(result.error.message);
                payBtnRef.current?.removeAttribute('disabled');
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    await placeOrder(result.paymentIntent.id, 'Stripe Card');
                } else {
                    toast.error('Payment was not completed. Please try again.');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
            payBtnRef.current?.removeAttribute('disabled');
        } finally {
            setProcessing(false);
        }
    };

    // ─── UPI Submit ─────────────────────────────────────────────────────
    const handleUpiSubmit = async (e) => {
        e.preventDefault();
        if (!upiId.trim() || !upiId.includes('@')) {
            setUpiError('Please enter a valid UPI ID (e.g. name@okhdfcbank)');
            return;
        }
        setUpiError('');
        setProcessing(true);

        try {
            const { data } = await api.post('/payment/process', {
                amount: Math.round(totalPrice * 100),
                method: 'upi'
            });

            if (data.success && data.isMock) {
                await placeOrder(data.paymentInfo.id, 'UPI');
            }
        } catch (error) {
            toast.error('UPI checkout failed.');
        } finally {
            setProcessing(false);
        }
    };

    // ─── Netbanking Submit ──────────────────────────────────────────────
    const handleNetbankingSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBank) {
            toast.error('Please select your bank');
            return;
        }
        setProcessing(true);

        try {
            const { data } = await api.post('/payment/process', {
                amount: Math.round(totalPrice * 100),
                method: 'netbanking'
            });

            if (data.success && data.isMock) {
                const bankName = POPULAR_BANKS.find(b => b.id === selectedBank)?.name || 'Netbanking';
                await placeOrder(data.paymentInfo.id, bankName);
            }
        } catch (error) {
            toast.error('Netbanking checkout failed.');
        } finally {
            setProcessing(false);
        }
    };

    // ─── COD / Skip Submit ──────────────────────────────────────────────
    const handleSkipSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const { data } = await api.post('/payment/process', {
                amount: Math.round(totalPrice * 100),
                method: 'cod'
            });

            if (data.success && data.isMock) {
                await placeOrder(data.paymentInfo.id, 'Cash On Delivery');
            }
        } catch (error) {
            toast.error('Mock checkout failed.');
        } finally {
            setProcessing(false);
        }
    };

    const hasCardErrors = Object.values(cardErrors).some((msg) => msg !== '');

    return (
        <>
            <MetaData title="Payment | ShopHub" />
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <CheckoutSteps activeStep={2} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                    {/* Navigation tabs & Forms wrapper */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl overflow-hidden p-6">
                        
                        {/* Left Tabs selection list */}
                        <div className="md:col-span-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 md:pr-6">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('card')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left whitespace-nowrap md:whitespace-normal ${
                                    paymentMethod === 'card'
                                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-sm'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <CreditCard className="h-5 w-5" />
                                <span>Card Payment</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod('upi')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left whitespace-nowrap md:whitespace-normal ${
                                    paymentMethod === 'upi'
                                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-sm'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <QrCode className="h-5 w-5" />
                                <span>UPI Payment</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod('netbanking')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left whitespace-nowrap md:whitespace-normal ${
                                    paymentMethod === 'netbanking'
                                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-sm'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <Building2 className="h-5 w-5" />
                                <span>Net Banking</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cod')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left whitespace-nowrap md:whitespace-normal ${
                                    paymentMethod === 'cod'
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 shadow-sm'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <Banknote className="h-5 w-5" />
                                <span>Cash / Skip Payment</span>
                            </button>
                        </div>

                        {/* Right Content Pane */}
                        <div className="md:col-span-8 md:pl-6 min-h-[320px] flex flex-col justify-between">
                            
                            {/* Card Content Form */}
                            {paymentMethod === 'card' && (
                                <form onSubmit={handleCardSubmit} className="space-y-5">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                                        <h3 className="font-bold text-gray-900 dark:text-white">Credit / Debit Card</h3>
                                        <span className="text-xs text-gray-400">(Stripe Secured)</span>
                                    </div>

                                    {!stripe && (
                                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-3 flex gap-2 text-xs text-amber-800 dark:text-amber-400">
                                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                            <span>Card payment is unavailable because Stripe publishable keys are not configured. Please use UPI, Netbanking, or Skip payment options.</span>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Card Number
                                        </label>
                                        <div
                                            className={`
                                                relative border rounded-xl px-4 py-3.5 transition-all duration-200
                                                ${focusedField === 'cardNumber'
                                                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                                                    : cardErrors.cardNumber
                                                        ? 'border-red-400 ring-2 ring-red-400/20'
                                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                                }
                                                bg-gray-50/50 dark:bg-gray-900/50
                                            `}
                                        >
                                            <CardNumberElement
                                                options={{ ...ELEMENT_OPTIONS, showIcon: true }}
                                                onChange={handleCardChange('cardNumber')}
                                                onFocus={() => setFocusedField('cardNumber')}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                        </div>
                                        {cardErrors.cardNumber && (
                                            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {cardErrors.cardNumber}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Expiry Date
                                            </label>
                                            <div
                                                className={`
                                                    border rounded-xl px-4 py-3.5 transition-all duration-200
                                                    ${focusedField === 'cardExpiry'
                                                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                                                        : cardErrors.cardExpiry
                                                            ? 'border-red-400 ring-2 ring-red-400/20'
                                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                                    }
                                                    bg-gray-50/50 dark:bg-gray-900/50
                                                `}
                                            >
                                                <CardExpiryElement
                                                    options={ELEMENT_OPTIONS}
                                                    onChange={handleCardChange('cardExpiry')}
                                                    onFocus={() => setFocusedField('cardExpiry')}
                                                    onBlur={() => setFocusedField(null)}
                                                />
                                            </div>
                                            {cardErrors.cardExpiry && (
                                                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> {cardErrors.cardExpiry}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                CVC
                                            </label>
                                            <div
                                                className={`
                                                    border rounded-xl px-4 py-3.5 transition-all duration-200
                                                    ${focusedField === 'cardCvc'
                                                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                                                        : cardErrors.cardCvc
                                                            ? 'border-red-400 ring-2 ring-red-400/20'
                                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                                    }
                                                    bg-gray-50/50 dark:bg-gray-900/50
                                                `}
                                            >
                                                <CardCvcElement
                                                    options={ELEMENT_OPTIONS}
                                                    onChange={handleCardChange('cardCvc')}
                                                    onFocus={() => setFocusedField('cardCvc')}
                                                    onBlur={() => setFocusedField(null)}
                                                />
                                            </div>
                                            {cardErrors.cardCvc && (
                                                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> {cardErrors.cardCvc}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        ref={payBtnRef}
                                        type="submit"
                                        disabled={processing || !stripe || hasCardErrors}
                                        className="w-full py-6 text-base gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Processing Card Payment...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-5 w-5" />
                                                Pay ₹{totalPrice.toLocaleString('en-IN')}
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}

                            {/* UPI Form */}
                            {paymentMethod === 'upi' && (
                                <form onSubmit={handleUpiSubmit} className="space-y-5">
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                        <h3 className="font-bold text-gray-900 dark:text-white">UPI Payment</h3>
                                        <span className="text-xs text-indigo-500 font-semibold">(Instant / Free)</span>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-5 items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-dashed">
                                        <div className="w-28 h-28 bg-white p-2 rounded-lg border flex flex-col items-center justify-center relative group">
                                            {/* Dummy QR code generation */}
                                            <div className="w-full h-full flex flex-wrap gap-[2px] opacity-80 filter blur-[0.3px]">
                                                {[...Array(16)].map((_, i) => (
                                                    <div key={i} className={`w-[22px] h-[22px] ${i % 3 === 0 || i % 4 === 1 ? 'bg-black' : 'bg-transparent'}`} />
                                                ))}
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] font-bold text-gray-700">Scan QR Code</span>
                                            </div>
                                        </div>
                                        <div className="text-center md:text-left space-y-1">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Scan the QR code or enter your VPA</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Supports GPay, PhonePe, Paytm, BHIM and net banking UPI apps.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="upiId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            UPI ID (VPA)
                                        </label>
                                        <input
                                            id="upiId"
                                            type="text"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                            placeholder="mobileNumber@upi or name@bank"
                                            className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-900/50 p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            required
                                        />
                                        {upiError && (
                                            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {upiError}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-6 text-base gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Processing UPI Checkout...
                                            </>
                                        ) : (
                                            <>
                                                <QrCode className="h-5 w-5" />
                                                Verify & Pay ₹{totalPrice.toLocaleString('en-IN')}
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}

                            {/* Netbanking Form */}
                            {paymentMethod === 'netbanking' && (
                                <form onSubmit={handleNetbankingSubmit} className="space-y-5">
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                        <h3 className="font-bold text-gray-900 dark:text-white">Net Banking</h3>
                                        <span className="text-xs text-gray-400">All major banks supported</span>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Select Popular Bank
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {POPULAR_BANKS.map((bank) => (
                                                <button
                                                    key={bank.id}
                                                    type="button"
                                                    onClick={() => setSelectedBank(bank.id)}
                                                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                                                        selectedBank === bank.id
                                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                                                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                                                    }`}
                                                >
                                                    {bank.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="bankSelect" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Or Choose Another Bank
                                        </label>
                                        <select
                                            id="bankSelect"
                                            value={selectedBank}
                                            onChange={(e) => setSelectedBank(e.target.value)}
                                            className="w-full text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-900/50 p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                                        >
                                            <option value="">-- Choose Bank --</option>
                                            <option value="sbi">State Bank of India</option>
                                            <option value="hdfc">HDFC Bank</option>
                                            <option value="icici">ICICI Bank</option>
                                            <option value="axis">Axis Bank</option>
                                            <option value="kotak">Kotak Mahindra Bank</option>
                                            <option value="pnb">Punjab National Bank</option>
                                            <option value="bob">Bank of Baroda</option>
                                            <option value="yes">Yes Bank</option>
                                        </select>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing || !selectedBank}
                                        className="w-full py-6 text-base gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Redirecting to Bank Portal...
                                            </>
                                        ) : (
                                            <>
                                                <Building2 className="h-5 w-5" />
                                                Pay ₹{totalPrice.toLocaleString('en-IN')} with Netbanking
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}

                            {/* Cash on Delivery (Skip) Form */}
                            {paymentMethod === 'cod' && (
                                <form onSubmit={handleSkipSubmit} className="space-y-5">
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                        <h3 className="font-bold text-gray-900 dark:text-white">Cash On Delivery (COD) / Skip</h3>
                                        <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                                            <Sparkles className="h-3 w-3" /> Recommended for Testing
                                        </span>
                                    </div>

                                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-2xl p-5 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Banknote className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-emerald-900 dark:text-emerald-400 text-sm">No payment required now</p>
                                                <p className="text-xs text-emerald-700/80 dark:text-emerald-500/80 mt-0.5 leading-relaxed">
                                                    You can use this payment option to immediately place your order. It is perfect for testing the purchase flow without setting up real Stripe keys.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-6 text-base gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Placing Order...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-5 w-5" />
                                                Skip Payment & Place Order (COD)
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}

                            {/* Security badge at bottom */}
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-4 border-t mt-4">
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                <span>Secured by industry-standard checkout encryption protocols</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                                Order Summary
                            </h3>

                            {/* Cart Items */}
                            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[250px] overflow-y-auto mb-4 pr-1">
                                {cartItems.map((item) => (
                                    <div key={item.product} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[160px]">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        ₹{itemsPrice.toLocaleString('en-IN')}
                                    </span>
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
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        ₹{taxPrice.toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <span>Total</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">
                                        ₹{totalPrice.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
