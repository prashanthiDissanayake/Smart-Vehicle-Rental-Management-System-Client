import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  Calendar,
  User as UserIcon,
  Hash,
  Car,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCcw,
  Download,
  Printer,
  Info,
  Trash2,
} from "lucide-react";
import { Payment, User, Vehicle, Booking } from "../types";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import html2pdf from "html2pdf.js";

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  payment: Payment | null;
  user: User | null;
  vehicle: Vehicle | null;
  booking: Booking | null;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  payment,
  user,
  vehicle,
  booking,
}) => {
  if (!isOpen || !payment) return null;

  const statusColors = {
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Pending: "bg-amber-50 text-amber-700 border-amber-100",
    Partially_Paid: "bg-amber-50 text-amber-700 border-amber-100",
    Refunded: "bg-blue-50 text-blue-700 border-blue-100",
    Failed: "bg-red-50 text-red-700 border-red-100",
  };
  const pdfRef = useRef<HTMLDivElement>(null);

  const StatusIcon = {
    Paid: CheckCircle2,
    Pending: Clock,
    Partially_Paid: Clock,
    Refunded: RefreshCcw,
    Failed: AlertCircle,
  }[payment.status];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Transaction Details
                </h3>
                <p className="text-xs text-slate-500 font-mono uppercase">
                  ID: {payment.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete Record"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                title="Print"
              >
                <Printer size={18} />
              </button>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-8 overflow-y-auto max-h-[80vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Summary & Status */}
              <div className="space-y-8">
                <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    Total Amount
                  </p>
                  {payment.status === "Paid" ? (
                    <h4 className="text-4xl font-black text-slate-900 mt-1">
                      Rs.{payment.finalCost.toLocaleString()}
                    </h4>
                  ) : (
                    <h4 className="text-4xl font-black text-slate-900 mt-1">
                      Rs.{payment.finalCost + payment.ad_amount}
                    </h4>
                  )}
                  {payment.status === "Paid" && (
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-4 border",
                        statusColors[payment.status],
                      )}
                    >
                      <StatusIcon size={14} />
                      {payment.status}
                    </div>
                  )}

                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-4 border",
                      statusColors[payment.status],
                    )}
                  ></div>

                  {payment.status !== "Paid" && (
                    <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Advanced Amount
                      </p>
                      <h4 className="text-4xl font-black text-slate-900 mt-1">
                        Rs.{payment.ad_amount.toLocaleString()}
                      </h4>
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-4 border",
                          statusColors[payment.status],
                        )}
                      >
                        <StatusIcon size={14} />
                        {payment.status}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Info size={16} className="text-brand-600" />
                    Payment Information
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white border border-slate-100 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Method
                      </p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        {payment.method}
                      </p>
                    </div>
                    <div className="p-3 bg-white border border-slate-100 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        Date
                      </p>
                      <p className="text-sm font-semibold text-slate-700 mt-0.5">
                        {format(new Date(payment.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Hash size={16} className="text-brand-600" />
                    Booking Reference
                  </h5>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Booking #{booking?.id}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking?.startDate} to {booking?.endDate}
                      </p>
                    </div>
                    <button className="text-xs font-bold text-brand-600 hover:underline">
                      View Booking
                    </button>
                  </div>
                </div>

                {/* Add-ons & Driver */}
                {(booking?.addOns?.length || booking?.driverId) && (
                  <div className="space-y-4">
                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <DollarSign size={16} className="text-brand-600" />
                      Additional Services
                    </h5>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-200/60 overflow-hidden">
                      {booking?.driverId && (
                        <div className="p-3 flex justify-between items-center bg-brand-50/30">
                          <span className="text-xs font-medium text-slate-600">
                            Professional Driver
                          </span>
                          <span className="text-xs font-bold text-brand-600">
                            Included
                          </span>
                        </div>
                      )}
                      {booking?.addOns?.map((addon) => (
                        <div
                          key={addon.id}
                          className="p-3 flex justify-between items-center"
                        >
                          <span className="text-xs font-medium text-slate-600">
                            {addon.name}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            Rs.{addon.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: User & Vehicle */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <UserIcon size={16} className="text-brand-600" />
                    User Details
                  </h5>
                  <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-100">
                      <img
                        src={user?.avatar}
                        alt={user?.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                      <p className="text-xs text-slate-500">{user?.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Car size={16} className="text-brand-600" />
                    Vehicle Rented
                  </h5>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex gap-4">
                    <div className="w-20 h-16 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                      <img
                        src={vehicle?.image}
                        alt={vehicle?.model}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">
                        {vehicle?.make} {vehicle?.model}
                      </p>
                      <p className="text-xs text-slate-500">
                        {vehicle?.year} • {vehicle?.type}
                      </p>
                      <div className="mt-2 inline-block font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                        {vehicle?.licensePlate}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-700 mb-2">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Payment Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This transaction was successfully processed and verified by
                    the payment gateway on{" "}
                    {format(new Date(payment.date), "MMMM d, yyyy")}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Record
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              {payment.status === "Paid" && (
                <button className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200">
                  Send Receipt
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentDetailsModal;
