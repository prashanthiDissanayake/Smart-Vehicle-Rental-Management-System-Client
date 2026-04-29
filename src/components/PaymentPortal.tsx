import React, { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Smartphone,
  Wallet,
  ArrowLeft,
  Info,
  ShoppingBag,
  Building2,
  Banknote,
  Car,
  Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { processPayment } from "../services/paymentService";

type PaymentMethod = "bank" | "card" | "cash";

interface Addon {
  id: string;
  name: string;
  price: number;
}

interface PaymentPortalProps {
  onBack: () => void;
  onSuccess: () => void;
  car?: {
    id?: string;
    name: string;
    price: number;
    image: string;
  };
  addons?: Addon[];
  drivingMode?: "self" | "driver";
  dates?: { pickup: string; return: string };
  bookingId: string;
  user: any;
}

export const PaymentPortal: React.FC<PaymentPortalProps> = ({
  onBack,
  onSuccess,
  car,
  addons = [],
  drivingMode = "self",
  dates = { pickup: "", return: "" },
  bookingId,
  user,
}) => {
  const [showSummary, setShowSummary] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [paymentType, setPaymentType] = useState<"full" | "advance">("full");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  const driverPrice = drivingMode === "driver" ? 50 : 0;

  // Calculate days
  const pickupDate = new Date(dates.pickup);
  const returnDate = new Date(dates.return);
  const diffTime = Math.abs(returnDate.getTime() - pickupDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const addonsTotal =
    (addons.reduce((sum, a) => sum + a.price, 0) + driverPrice) * diffDays;
  const total = (car?.price || 114.5) * diffDays + addonsTotal;
  const advanceAmount = total * 0.3; // 30% advance
  const payableNow = paymentType === "full" ? total : advanceAmount;

  const handlePayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsProcessing(true);

    try {
      await processPayment({
        id: `PAY-${Date.now()}`,
        bookingId,
        userId: user?.id,
        vehicleId: car?.id,
        ad_amount: payableNow,
        amount: total,
        type: paymentType,
        method:
          method === "card"
            ? "Credit Card"
            : method === "bank"
              ? "Bank Transfer"
              : "Cash",
        date: new Date().toISOString(),
        status: paymentType === "advance" ? "Partially_Paid" : "Paid",
      });
      onSuccess();
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  if (showSummary) {
    return (
      <div className="max-w-xl w-full mx-auto">
        <div
          onClick={() => setShowSummary(false)}
          className="flex items-center gap-2 text-slate-400 mb-6 cursor-pointer hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to payment options</span>
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
        >
          <div className="bg-slate-900 p-8 text-white">
            <h2 className="text-2xl font-bold mb-2 text-center">
              Payment Summary
            </h2>
            <p className="text-slate-400 text-center text-sm">
              Please review the final details before confirming
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Vehicle</span>
                <span className="font-bold text-slate-900">{car?.name}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-slate-500 font-medium">
                  Payment Method
                </span>
                <span className="font-bold text-slate-900 capitalize">
                  {method === "card"
                    ? "Credit Card"
                    : method === "bank"
                      ? "Bank Transfer"
                      : "Cash on Delivery"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Payment Type</span>
                <span className="font-bold text-slate-900">
                  {paymentType === "full"
                    ? "Full Payment"
                    : "30% Advance Payment"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-slate-500 font-medium">
                  Rental Period
                </span>
                <span className="font-bold text-slate-900">
                  {diffDays} Day{diffDays > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600 font-medium">
                  Total Rental Amount
                </span>
                <span className="text-slate-600 font-medium">
                  Rs.{total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-2xl font-black text-indigo-600">
                <span>Payable Now</span>
                <span>Rs.{payableNow.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handlePayment()}
                disabled={isProcessing}
                className="w-full bg-indigo-600 text-white rounded-2xl py-5 font-bold text-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Finalizing Booking...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-6 h-6" />
                    Confirm and Pay Rs.{payableNow.toFixed(2)}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
                <Lock className="w-3 h-3" />
                <span>Encrypted secure transaction</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Payment Form */}
      <div className="lg:col-span-7 space-y-6">
        <div
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 mb-4 cursor-pointer hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Payment Options</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentType("full")}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentType === "full" ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 hover:border-slate-200"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <CheckCircle2
                    className={`w-5 h-5 ${paymentType === "full" ? "text-indigo-600" : "text-slate-200"}`}
                  />
                  <span className="text-lg font-bold">
                    Rs.{total.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900">Full Payment</p>
                <p className="text-xs text-slate-500">
                  Pay the entire amount now
                </p>
              </button>
              <button
                onClick={() => setPaymentType("advance")}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentType === "advance" ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 hover:border-slate-200"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <CheckCircle2
                    className={`w-5 h-5 ${paymentType === "advance" ? "text-indigo-600" : "text-slate-200"}`}
                  />
                  <span className="text-lg font-bold">
                    Rs.{advanceAmount.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  Advanced Payment
                </p>
                <p className="text-xs text-slate-500">
                  Pay 30% now, rest later
                </p>
              </button>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-6">Select Method</h2>

          {/* Method Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setMethod("bank")}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${method === "bank" ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 hover:border-slate-200"}`}
            >
              <Building2
                className={`w-6 h-6 mb-2 ${method === "bank" ? "text-indigo-600" : "text-slate-400"}`}
              />
              <span
                className={`text-xs font-semibold ${method === "bank" ? "text-indigo-600" : "text-slate-500"}`}
              >
                Bank Transfer
              </span>
            </button>
            <button
              onClick={() => setMethod("card")}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${method === "card" ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 hover:border-slate-200"}`}
            >
              <CreditCard
                className={`w-6 h-6 mb-2 ${method === "card" ? "text-indigo-600" : "text-slate-400"}`}
              />
              <span
                className={`text-xs font-semibold ${method === "card" ? "text-indigo-600" : "text-slate-500"}`}
              >
                Card Payment
              </span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {method === "card" ? (
              <motion.form
                key="card-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowSummary(true);
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Cardholder Name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all pr-12"
                      value={formData.cardNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cardNumber: formatCardNumber(e.target.value),
                        })
                      }
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                      <div className="w-6 h-4 bg-slate-200 rounded-sm"></div>
                      <div className="w-6 h-4 bg-slate-300 rounded-sm"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      value={formData.expiry}
                      onChange={(e) =>
                        setFormData({ ...formData, expiry: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                      CVC <Info className="w-3 h-3 text-slate-400" />
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="•••"
                      maxLength={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      value={formData.cvc}
                      onChange={(e) =>
                        setFormData({ ...formData, cvc: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="save"
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="save" className="text-sm text-slate-500">
                    Save card for future payments
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-indigo-600 text-white rounded-xl py-4 font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Pay Rs.{payableNow.toFixed(2)}</>
                  )}
                </button>
              </motion.form>
            ) : method === "bank" ? (
              <motion.form
                key="bank-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
                onSubmit={handlePayment}
              >
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    Bank Transfer Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Bank Name</span>
                      <span className="text-sm font-semibold">
                        People's Bank
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        Account Number
                      </span>
                      <span className="text-sm font-mono font-semibold">
                        8829 1002 4491
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Branch</span>
                      <span className="text-sm font-mono font-semibold">
                        Colombo
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        Account Name
                      </span>
                      <span className="text-sm font-mono font-bold text-indigo-600">
                        VehicleHub
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Please transfer the total amount to the account above. Use the
                  reference code to ensure your payment is processed quickly.
                  Your order will be confirmed once funds are received.
                </p>
                <button
                  onClick={() => setShowSummary(true)}
                  className="w-full bg-slate-900 text-white rounded-xl py-4 font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.98]"
                >
                  I've Made the Transfer
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="cash-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-8 text-center space-y-6"
                onSubmit={handlePayment}
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <Banknote className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Cash on Delivery</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">
                    Pay with cash when your order arrives at your doorstep.
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 border border-slate-100 italic">
                  "Please have the exact amount ready to ensure a smooth
                  delivery process."
                </div>
                <button
                  onClick={() => setShowSummary(true)}
                  className="w-full bg-emerald-600 text-white rounded-xl py-4 font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                >
                  Confirm Order
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2 text-xs">
              <Lock className="w-3 h-3" />
              <span>Secure SSL Encryption</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-5 bg-slate-100 rounded"></div>
              <div className="w-8 h-5 bg-slate-100 rounded"></div>
              <div className="w-8 h-5 bg-slate-100 rounded"></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-5">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sticky top-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Booking Summary</h3>
            <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Car className="w-3 h-3" />1 Vehicle
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                <img
                  src={car?.image || "https://picsum.photos/seed/tech/200/200"}
                  alt="Product"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">
                  {car?.name || "Premium Vehicle"}
                </h4>
                <p className="text-sm text-slate-500 mb-1">Luxury Rental</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">
                    Duration: {diffDays} Day{diffDays > 1 ? "s" : ""}
                  </span>
                  <span className="font-bold">
                    Rs.{((car?.price || 0) * diffDays).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Rental Period
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pick-up</span>
                <span className="font-bold text-slate-900">{dates.pickup}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Return</span>
                <span className="font-bold text-slate-900">{dates.return}</span>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Driving Mode
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {drivingMode === "self"
                    ? "Self Drive"
                    : "With Professional Driver"}
                </span>
                <span className="font-bold text-slate-900">
                  {drivingMode === "driver" ? "+Rs.50.00" : "Included"}
                </span>
              </div>
            </div>

            {addons.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Selected Add-ons
                </p>
                {addons.map((addon) => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span className="text-slate-500">{addon.name}</span>
                    <span className="font-bold text-slate-900">
                      +Rs.{addon.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>Rs.{total.toFixed(2)}</span>
            </div>
            {/* <div className="flex justify-between text-slate-500">
              <span>Service Fee</span>
              <span className="text-emerald-600 font-medium">Included</span>
            </div> */}
            <div className="flex justify-between text-xl font-bold pt-4 text-slate-900">
              <span>Total</span>
              <span>Rs.{total.toFixed(2)}</span>
            </div>
            {paymentType === "advance" && (
              <div className="flex justify-between text-lg font-bold pt-2 text-indigo-600 border-t border-dashed border-indigo-100 mt-2">
                <span>Payable Now (30%)</span>
                <span>Rs.{payableNow.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-900">
                Buyer Protection
              </p>
              <p className="text-xs text-emerald-700">
                Your purchase is protected by our 30-day money-back guarantee.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
