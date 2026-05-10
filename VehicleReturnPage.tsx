import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Camera,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Fuel,
  Gauge,
  Calendar as CalendarIcon,
  Upload,
  X,
} from "lucide-react";
import { Booking, Vehicle, User } from "../types";
import { cn } from "../lib/utils";
import { format } from "date-fns";

interface VehicleReturnPageProps {
  bookings: Booking[];
  vehicles: Vehicle[];
  users: User[];
  onComplete: (
    bookingId: string,
    vehicleId: string,
    finalAmount: number,
    mileage: number,
    fuelLevel: number,
    conditionNotes: string,
    damages: any[],
  ) => Promise<void>;
  onCancel: () => void;
  preSelectedBookingId?: string | null;
}

const VehicleReturnPage: React.FC<VehicleReturnPageProps> = ({
  bookings,
  vehicles,
  payments,
  users,
  onComplete,
  onCancel,
  preSelectedBookingId,
}) => {
  const initialBooking = preSelectedBookingId
    ? bookings.find((b) => b.id === preSelectedBookingId) || null
    : null;
  const [step, setStep] = useState(initialBooking ? 2 : 1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
    initialBooking,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Return Details State
  const [mileage, setMileage] = useState<string>("");
  const [fuelLevel, setFuelLevel] = useState<number>(100);
  const [returnDate, setReturnDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [conditionNotes, setConditionNotes] = useState("");
  const [damages, setDamages] = useState<
    {
      part: string;
      description: string;
      severity: "Minor" | "Moderate" | "Severe";
      price: number;
      image?: string;
    }[]
  >([]);
  const [newDamage, setNewDamage] = useState({
    part: "",
    description: "",
    severity: "Minor" as const,
    price: "",
  });
  const [isAddingDamage, setIsAddingDamage] = useState(false);

  // Checklist
  const [checklist, setChecklist] = useState({
    exteriorClean: true,
    interiorClean: true,
    tiresOk: true,
    lightsOk: true,
    fluidsOk: true,
    spareTireOk: true,
    toolsOk: true,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const activeBookings = useMemo(() => {
    const filtered = bookings.filter((b) => b.status === "Confirmed");
    if (!searchQuery) return filtered;
    return filtered.filter((b) => {
      const user = users.find((u) => u.id === b.userId);
      const vehicle = vehicles.find((v) => v.id === b.vehicleId);
      return (
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle?.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [bookings, searchQuery, users, vehicles]);

  const selectedVehicle = useMemo(
    () =>
      selectedBooking
        ? vehicles.find((v) => v.id === selectedBooking.vehicleId)
        : null,
    [selectedBooking, vehicles],
  );

  const selectedPayments = useMemo(
    () =>
      selectedBooking
        ? payments.find((p) => p.bookingId === selectedBooking.id)
        : null,
    [selectedBooking, payments],
  );

  const selectedUser = useMemo(
    () =>
      selectedBooking
        ? users.find((u) => u.id === selectedBooking.userId)
        : null,
    [selectedBooking, users],
  );

  const fuelCharge = useMemo(() => {
    if (fuelLevel >= 90) return 0;
    return Math.round((100 - fuelLevel) * 1.5);
  }, [fuelLevel]);

  const damageCharge = useMemo(() => {
    return damages.reduce((acc, d) => acc + d.price, 0);
  }, [damages]);

  const grandTotal = useMemo(() => {
    if (!selectedBooking) return 0;
    return selectedBooking.totalAmount + fuelCharge + damageCharge;
  }, [selectedBooking, fuelCharge, damageCharge]);

  const handleAddDamage = () => {
    if (!newDamage.part || !newDamage.description) return;
    setDamages([
      ...damages,
      {
        ...newDamage,
        price: Number(newDamage.price) || 0,
      },
    ]);
    setNewDamage({ part: "", description: "", severity: "Minor", price: "" });
    setIsAddingDamage(false);
  };

  const handleCompleteReturn = async () => {
    if (!selectedBooking || !selectedVehicle) return;
    setIsProcessing(true);

    try {
      await onComplete(
        selectedBooking.id,
        selectedVehicle.id,
        grandTotal,
        Number(mileage) || 0,
        fuelLevel,
        conditionNotes,
        damages,
      );
      setIsSuccess(true);
      setTimeout(() => {
        onCancel();
      }, 3000);
    } catch (error) {
      console.error("Error completing return:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-4xl font-black text-slate-900">
          Return Successful!
        </h2>
        <p className="text-slate-500 mt-4 max-w-md mx-auto font-medium">
          The vehicle has been successfully inspected and returned. The final
          settlement of{" "}
          <span className="text-slate-900 font-bold">
            Rs.{grandTotal.toLocaleString()}
          </span>{" "}
          has been processed.
        </p>
        <div className="mt-10 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm w-full max-w-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Vehicle Status
          </p>
          <div className="flex items-center justify-center gap-3 text-emerald-600 font-black">
            <Car size={20} />
            {selectedVehicle?.make} {selectedVehicle?.model} is now AVAILABLE
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Vehicle Return & Condition tracking
          </h2>
          <p className="text-slate-500 mt-1">
            Process vehicle returns with detailed condition tracking.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {[1, 2, 3, 4].map((i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all",
                  step === i
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-200"
                    : step > i
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-400",
                )}
              >
                {step > i ? <CheckCircle2 size={16} /> : i}
              </div>
              <span
                className={cn(
                  "text-sm font-bold whitespace-nowrap",
                  step === i ? "text-slate-900" : "text-slate-400",
                )}
              >
                {i === 1
                  ? "Select Booking"
                  : i === 2
                    ? "Condition & Mileage"
                    : i === 3
                      ? "Damage Report"
                      : "Final Settlement"}
              </span>
            </div>
            {i < 4 && <div className="flex-1 h-px bg-slate-100 min-w-[20px]" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search active bookings by ID, user, or vehicle..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-2 max-h-[500px] overflow-y-auto">
                {activeBookings.length > 0 ? (
                  activeBookings.map((booking) => {
                    const vehicle = vehicles.find(
                      (v) => v.id === booking.vehicleId,
                    );
                    const user = users.find((u) => u.id === booking.userId);
                    return (
                      <button
                        key={booking.id}
                        onClick={() => {
                          setSelectedBooking(booking);
                          setStep(2);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                          selectedBooking?.id === booking.id
                            ? "bg-brand-50 border border-brand-100"
                            : "hover:bg-slate-50",
                        )}
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-16 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                            <img
                              src={vehicle?.image}
                              alt={vehicle?.model}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              #{booking.id} • {vehicle?.make} {vehicle?.model}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user?.name} •{" "}
                              {format(new Date(booking.startDate), "MMM d")} -{" "}
                              {format(new Date(booking.endDate), "MMM d")}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          size={20}
                          className="text-slate-300 group-hover:text-brand-500 transition-colors"
                        />
                      </button>
                    );
                  })
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">
                      No active bookings found matching your search.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Mileage & Fuel */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <Gauge size={18} className="text-brand-600" />
                      Extra Mileage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Enter current odometer reading"
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-bold text-lg"
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                        KM
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <Fuel size={18} className="text-brand-600" />
                      Fuel Level ({fuelLevel}%)
                    </label>
                    <div className="pt-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={fuelLevel}
                        onChange={(e) => setFuelLevel(Number(e.target.value))}
                        className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                      />
                      <div className="flex justify-between mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Empty</span>
                        <span>Half</span>
                        <span>Full</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <CalendarIcon size={18} className="text-brand-600" />
                    Return Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-bold"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Checklist */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-brand-600" />
                  Inspection Checklist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(checklist).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setChecklist((prev) => ({ ...prev, [key]: !value }))
                      }
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all",
                        value
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-white border-slate-200 text-slate-400",
                      )}
                    >
                      <span className="text-sm font-bold capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </span>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                          value
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-300",
                        )}
                      >
                        <CheckCircle2 size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Damage Reporting */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle size={20} className="text-brand-600" />
                    Damage & Condition Report
                  </h3>
                  <button
                    onClick={() => setIsAddingDamage(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
                  >
                    <Plus size={18} />
                    Report Damage
                  </button>
                </div>

                {isAddingDamage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Vehicle Part
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Front Bumper"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={newDamage.part}
                          onChange={(e) =>
                            setNewDamage({ ...newDamage, part: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Severity
                        </label>
                        <select
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={newDamage.severity}
                          onChange={(e) =>
                            setNewDamage({
                              ...newDamage,
                              severity: e.target.value as any,
                            })
                          }
                        >
                          <option value="Minor">Minor</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Severe">Severe</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Repair Cost (Rs.)
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20"
                          value={newDamage.price}
                          onChange={(e) =>
                            setNewDamage({
                              ...newDamage,
                              price: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Description
                      </label>
                      <textarea
                        placeholder="Describe the damage in detail..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20 h-24 resize-none"
                        value={newDamage.description}
                        onChange={(e) =>
                          setNewDamage({
                            ...newDamage,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Simulated Image Upload */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Damage Photos
                      </label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-white hover:bg-slate-50 transition-all">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-slate-400" />
                            <p className="mb-2 text-sm text-slate-500 font-bold">
                              Click to upload damage photos
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                              PNG, JPG or GIF (MAX. 5MB)
                            </p>
                          </div>
                          <input type="file" className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => setIsAddingDamage(false)}
                        className="px-6 py-2 text-slate-500 font-bold text-sm hover:text-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddDamage}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                      >
                        Add to Report
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {damages.length > 0 ? (
                    damages.map((damage, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 group"
                      >
                        <div
                          className={cn(
                            "p-3 rounded-xl",
                            damage.severity === "Minor"
                              ? "bg-amber-100 text-amber-600"
                              : damage.severity === "Moderate"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-red-100 text-red-600",
                          )}
                        >
                          <AlertTriangle size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-black text-slate-800">
                                {damage.part}
                              </h4>
                              <p className="text-xs font-black text-brand-600 mt-0.5">
                                Repair Cost: Rs.{damage.price.toLocaleString()}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                                damage.severity === "Minor"
                                  ? "bg-amber-50 border-amber-200 text-amber-600"
                                  : damage.severity === "Moderate"
                                    ? "bg-orange-50 border-orange-200 text-orange-600"
                                    : "bg-red-50 border-red-200 text-red-600",
                              )}
                            >
                              {damage.severity}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1 font-medium">
                            {damage.description}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setDamages(damages.filter((_, i) => i !== idx))
                          }
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold">
                        No damages reported yet.
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        If the vehicle has new damages, please report them
                        above.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8 space-y-3">
                  <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    General Condition Notes
                  </label>
                  <textarea
                    placeholder="Any additional observations about the vehicle's condition..."
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium h-32 resize-none"
                    value={conditionNotes}
                    onChange={(e) => setConditionNotes(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Charge Breakdown */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-lg font-black text-slate-800 mb-8 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={20} className="text-brand-600" />
                  Final Settlement Breakdown
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <CalendarIcon size={16} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Base Rental Fee
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          Original Booking Amount
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-black text-slate-800">
                      Rs.{selectedBooking?.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  {fuelCharge > 0 && (
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Fuel size={16} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            Fuel Refill Charge
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            {100 - fuelLevel}% Missing
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-black text-slate-800">
                        +Rs.{fuelCharge.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {damageCharge > 0 && (
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-red-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <AlertTriangle size={16} className="text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            Damage Assessment
                          </p>
                          <p className="text-[10px] text-red-400 font-bold uppercase">
                            {damages.length} Items Reported
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-black text-red-600">
                        +Rs.{damageCharge.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <CalendarIcon size={16} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          Advanced Fee
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          Already paid
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-black text-slate-800">
                      -Rs.{selectedPayments?.ad_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmation */}
              <div className="bg-brand-600 rounded-3xl p-8 text-white shadow-xl shadow-brand-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black">Ready to finalize?</h4>
                    <p className="text-brand-100 text-sm font-medium">
                      This will complete the return and update the vehicle
                      status.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCompleteReturn}
                  disabled={isProcessing}
                  className={cn(
                    "px-8 py-4 bg-white text-brand-600 rounded-2xl font-black text-sm hover:bg-brand-50 transition-all shadow-lg",
                    isProcessing && "opacity-70 cursor-not-allowed",
                  )}
                >
                  {isProcessing ? "Processing..." : "Complete Return"}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 sticky top-8">
            <h3 className="text-xl font-black mb-8">Return Summary</h3>

            <div className="space-y-8">
              {/* Vehicle Summary */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Vehicle
                </p>
                {selectedVehicle ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 rounded-lg bg-slate-800 overflow-hidden border border-slate-700">
                      <img
                        src={selectedVehicle.image}
                        alt={selectedVehicle.model}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {selectedVehicle.make} {selectedVehicle.model}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {selectedVehicle.licensePlate}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 italic">
                    No vehicle selected
                  </p>
                )}
              </div>

              {/* User Summary */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Customer
                </p>
                {selectedUser ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-700">
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{selectedUser.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 italic">
                    No user selected
                  </p>
                )}
              </div>

              {/* Return Stats */}
              {selectedBooking && (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Mileage
                    </span>
                    <span className="text-sm font-black">
                      {mileage || "---"} KM
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Fuel
                    </span>
                    <span className="text-sm font-black">{fuelLevel}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Damages
                    </span>
                    <span className="text-sm font-black text-red-400">
                      {damages.length} Reported
                    </span>
                  </div>
                </div>
              )}

              <div className="h-px bg-slate-800" />

              {step < 4 && (
                <button
                  disabled={step === 1 && !selectedBooking}
                  onClick={() => setStep(step + 1)}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2",
                    (step === 1 && selectedBooking) || step > 1
                      ? "bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-900/20"
                      : "bg-slate-800 text-slate-600 cursor-not-allowed",
                  )}
                >
                  Continue to{" "}
                  {step === 1
                    ? "Condition"
                    : step === 2
                      ? "Damage Report"
                      : "Settlement"}
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>

          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-full py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors"
            >
              Back to Step {step - 1}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Plus: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default VehicleReturnPage;
