import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Building2, Home, Compass, Globe } from 'lucide-react';
import { toast } from 'sonner';
import useCartStore from '../../store/useCartStore';
import { Button, Input } from '@/components/ui';
import MetaData from '@/components/common/Metadata';
import CheckoutSteps from '@/components/common/CheckoutSteps';

const countries = [
    { code: "IN", name: "India" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "AU", name: "Australia" }
];

export default function Shipping() {
    const navigate = useNavigate();
    const { shippingInfo, saveShippingInfo } = useCartStore();

    const [address, setAddress] = useState(shippingInfo.address || '');
    const [city, setCity] = useState(shippingInfo.city || '');
    const [state, setState] = useState(shippingInfo.state || '');
    const [country, setCountry] = useState(shippingInfo.country || 'IN');
    const [pinCode, setPinCode] = useState(shippingInfo.pinCode || '');
    const [phoneNo, setPhoneNo] = useState(shippingInfo.phoneNo || '');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!address || !city || !state || !country || !pinCode || !phoneNo) {
            toast.error('Please fill in all shipping details');
            return;
        }

        if (phoneNo.length !== 10 || isNaN(phoneNo)) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        if (isNaN(pinCode)) {
            toast.error('Please enter a valid numeric PIN/postal code');
            return;
        }

        saveShippingInfo({ address, city, state, country, pinCode, phoneNo });
        navigate('/order/confirm');
    };

    return (
        <>
            <MetaData title="Shipping Info | ShopHub" />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <CheckoutSteps activeStep={0} />

                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl p-6 md:p-8 mt-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-primary" /> Delivery Details
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Address */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                <Home className="h-4 w-4 text-gray-400" /> Street Address
                            </label>
                            <Input
                                type="text"
                                placeholder="Flat/House No, Building, Street, Area"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* City */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                    <Building2 className="h-4 w-4 text-gray-400" /> City
                                </label>
                                <Input
                                    type="text"
                                    placeholder="New Delhi"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                />
                            </div>

                            {/* State */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                    <Compass className="h-4 w-4 text-gray-400" /> State
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Delhi"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Country */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                    <Globe className="h-4 w-4 text-gray-400" /> Country
                                </label>
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    required
                                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                >
                                    {countries.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Pin Code */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-gray-400" /> PIN / Postal Code
                                </label>
                                <Input
                                    type="text"
                                    placeholder="110001"
                                    value={pinCode}
                                    onChange={(e) => setPinCode(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                                <Phone className="h-4 w-4 text-gray-400" /> Phone Number (10 digits)
                            </label>
                            <Input
                                type="tel"
                                placeholder="9876543210"
                                value={phoneNo}
                                onChange={(e) => setPhoneNo(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full py-6 text-base rounded-xl mt-4">
                            Continue to Confirm Order
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}
