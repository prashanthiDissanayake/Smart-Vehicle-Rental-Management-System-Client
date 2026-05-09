import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  User,
  Car,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Edit2,
  Info,
  Hash,
  MapPin,
} from "lucide-react";
import { Booking, Vehicle, User as UserType } from "../types";
import { cn } from "../lib/utils";
import { format } from "date-fns";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  user: UserType | null;
  vehicle: Vehicle | null;
  onEdit: () => void;
  onDelete: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  user,
  vehicle,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !booking) return null;

  const statusColors = {
    Confirmed: "bg-brand-50 text-brand-700 border-brand-100",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Pending: "bg-amber-50 text-amber-700 border-amber-100",
    Cancelled: "bg-red-50 text-red-700 border-red-100",
  };

  const StatusIcon = {
    Confirmed: CheckCircle2,
    Completed: CheckCircle2,
    Pending: Clock,
    Cancelled: XCircle,
  }[booking.status];

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
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Booking Details
                </h3>
                <p className="text-xs text-slate-500 font-mono uppercase">
                  Reference: #{booking.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                title="Edit Booking"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Delete Booking"
              >
                <Trash2 size={18} />
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
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Info size={16} className="text-brand-600" />
                    Reservation Info
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="text-xs text-slate-500">
                          Pick-up Date
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        {format(new Date(booking.startDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="text-xs text-slate-500">
                          Return Date
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        {format(new Date(booking.endDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-slate-400" />
                        <span className="text-xs text-slate-500">Duration</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        {Math.ceil(
                          (new Date(booking.endDate).getTime() -
                            new Date(booking.startDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        Days
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: User & Vehicle */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <User size={16} className="text-brand-600" />
                    Customer Details
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
                    Vehicle Details
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
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            {booking.status === "Confirmed" && (
              <button className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200">
                Resend Confirmation
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingDetailsModal;
