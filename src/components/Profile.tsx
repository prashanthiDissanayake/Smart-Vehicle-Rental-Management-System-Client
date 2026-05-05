import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Save,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  CreditCard,
  Tag,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AuthUser, updateProfile } from "../services/authService";
import { fetchBookings, BookingData } from "../services/bookingService";
import {
  fetchPayments,
  updatePayment,
  PaymentData,
} from "../services/paymentService";

interface ProfileProps {
  user: AuthUser;
  onUpdate: (user: AuthUser) => void;
  onBack: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState<"info" | "bookings">("info");
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(
    null,
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "bookings") {
      const loadData = async () => {
        setIsLoadingBookings(true);
        try {
          const [bookingsData, paymentsData] = await Promise.all([
            fetchBookings(),
            fetchPayments(),
          ]);
          console.log(paymentsData);

          setBookings(bookingsData);
          setPayments(paymentsData);
        } catch (err) {
          console.error("Failed to load data");
        } finally {
          setIsLoadingBookings(false);
        }
      };
      loadData();
    }
  }, [activeTab]);

  const handleUpdatePayment = async (payment: PaymentData) => {
    setIsLoading(true);
    try {
      await updatePayment(payment.id, {
        amount: payment.amount,
        ad_amount: Number(paymentAmount),
        status: "Paid",
        method:
          paymentMethod === "Card Payment" ? "Credit Card" : paymentMethod,
        date: new Date().toISOString().split("T")[0],
      });

      // Refresh data
      const [bookingsData, paymentsData] = await Promise.all([
        fetchBookings(),
        fetchPayments(),
      ]);
      setBookings(bookingsData);
      setPayments(paymentsData);
      setSelectedPayment(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedUser = await updateProfile({ name, email });
      onUpdate(updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full">
      <div
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 mb-8 cursor-pointer hover:text-slate-600 transition-colors inline-flex"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 space-y-2">
            <button
              onClick={() => setActiveTab("info")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === "info" ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-500 hover:bg-slate-100"}`}
            >
              <User className="w-4 h-4" />
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === "bookings" ? "bg-white text-indigo-600 shadow-sm border border-slate-100" : "text-slate-500 hover:bg-slate-100"}`}
            >
              <Calendar className="w-4 h-4" />
              My Bookings
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 lg:p-10">
            <AnimatePresence mode="wait">
              {activeTab === "info" ? (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Your Profile
                      </h2>
                      <p className="text-sm text-slate-500">
                        Manage your personal information
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Profile updated successfully!
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">
                        Role
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          disabled
                          value={user.role}
                          className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-500 cursor-not-allowed outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 ml-1">
                        Role cannot be changed by the user.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        My Bookings
                      </h2>
                      <p className="text-sm text-slate-500">
                        Track your current and past rentals
                      </p>
                    </div>
                  </div>

                  {isLoadingBookings ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-24 bg-slate-50 animate-pulse rounded-2xl border border-slate-100"
                        />
                      ))}
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">
                        No bookings found yet.
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Start your journey by booking a vehicle!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => {
                        const payment = payments.find(
                          (p) => p.bookingId === booking._id,
                        );
                        const isExpanded = expandedBooking === booking.id;

                        return (
                          <div
                            key={booking.id}
                            className="group bg-white border border-slate-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all space-y-4"
                          >
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div className="flex gap-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <Tag className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === "Confirmed" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                                    >
                                      {booking.status}
                                    </span>
                                    {payment && (
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${payment.status === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                                      >
                                        Payment: {payment.status}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-bold text-slate-900">
                                    Vehicle ID: {booking.vehicleId}
                                  </h4>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {booking.startDate} - {booking.endDate}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {booking.duration} Days
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end justify-center">
                                <div className="text-sm text-slate-400 mb-1">
                                  Total Amount
                                </div>
                                <div className="text-xl font-bold text-slate-900">
                                  Rs.{booking.totalAmount.toFixed(2)}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    onClick={() =>
                                      setExpandedBooking(
                                        isExpanded ? null : booking.id,
                                      )
                                    }
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                                  >
                                    {isExpanded ? (
                                      <>
                                        Hide Details{" "}
                                        <ChevronUp className="w-3 h-3" />
                                      </>
                                    ) : (
                                      <>
                                        Show Details{" "}
                                        <ChevronDown className="w-3 h-3" />
                                      </>
                                    )}
                                  </button>
                                  {/* {payment && payment.status !== "Paid" && (
                                    <button
                                      onClick={() => {
                                        setSelectedPayment(payment);
                                        setPaymentAmount(
                                          String(payment.amount),
                                        );
                                      }}
                                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
                                    >
                                      Complete Payment
                                    </button>
                                  )} */}
                                </div>
                              </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pt-4 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Charges Breakdown
                                      </h5>
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-slate-600">
                                          <span>
                                            Vehicle ({booking.duration} days)
                                          </span>
                                          <span className="font-semibold text-slate-900">
                                            Rs.
                                            {(
                                              booking.vehiclePerDay *
                                              booking.duration
                                            ).toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-600">
                                          <span>
                                            Driver Service ({booking.duration} *{" "}
                                            {booking.driverPerDay}){" "}
                                          </span>

                                          <span className="font-semibold text-slate-900">
                                            Rs.
                                            {(
                                              booking.driverPerDay *
                                              booking.duration
                                            ).toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-600">
                                          <span>Add-ons Total</span>
                                          <span className="font-semibold text-slate-900">
                                            Rs.{booking.addonsTotal.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Payment Information
                                      </h5>
                                      {payment ? (
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-xs text-slate-600">
                                            <span>Method</span>
                                            <span className="font-semibold text-slate-900">
                                              {payment.method}
                                            </span>
                                          </div>
                                          <div className="flex justify-between text-xs text-slate-600">
                                            <span>Date</span>
                                            <span className="font-semibold text-slate-900">
                                              {payment.date}
                                            </span>
                                          </div>
                                          <div className="flex justify-between text-xs text-slate-600">
                                            <span>Status</span>
                                            <span
                                              className={`font-bold ${payment.status === "Paid" ? "text-emerald-600" : "text-amber-600"}`}
                                            >
                                              {payment.status}
                                            </span>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-xs text-slate-400">
                                          No payment record found.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {payment && payment.status === "Paid" && (
                                    <div className="mt-6 flex justify-end">
                                      <button
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
                                      >
                                        <Download className="w-4 h-4" />
                                        Print Payment Bill
                                      </button>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Payment Update Modal */}
                  <AnimatePresence>
                    {selectedPayment && (
                      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl"
                        >
                          <h3 className="text-xl font-bold text-slate-900 mb-6">
                            Complete Payment
                          </h3>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">
                                Payment Amount
                              </label>
                              <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) =>
                                  setPaymentAmount(e.target.value)
                                }
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-700">
                                Payment Method
                              </label>
                              <select
                                value={paymentMethod}
                                onChange={(e) =>
                                  setPaymentMethod(e.target.value)
                                }
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                              >
                                <option value="Credit Card">Credit Card</option>
                                <option value="Bank Transfer">
                                  Bank Transfer
                                </option>
                                <option value="Cash">Cash</option>
                              </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={() => setSelectedPayment(null)}
                                className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdatePayment(selectedPayment)
                                }
                                disabled={isLoading}
                                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                              >
                                {isLoading
                                  ? "Processing..."
                                  : "Confirm Payment"}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
