/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Car,
  ChevronRight,
  RotateCcw,
  ArrowRight,
  Star,
  Shield,
  Clock,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { PaymentPortal } from "./components/PaymentPortal";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { CarCard } from "./components/CarCard";
import { Addons } from "./components/Addons";
import { Login } from "./components/Login";
import { FleetPage } from "./components/FleetPage";
import { Profile } from "./components/Profile";
import { SignUp } from "./components/SignUp";
import { fetchVehicles, Vehicle } from "./services/vehicleService";
import { getStoredUser, logout } from "./services/authService";
import { createBooking, BookingData } from "./services/bookingService";

const COMMON_CAR_IMAGE =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800";

const FLEET = [
  {
    id: "1",
    name: "Tesla Model S Plaid",
    type: "Luxury Electric",
    image: COMMON_CAR_IMAGE,
    price: 150,
    passengers: 5,
    fuel: "Electric",
    transmission: "Auto",
    rating: 4.9,
  },
  {
    id: "2",
    name: "Porsche 911 Carrera",
    type: "Sports",
    image: COMMON_CAR_IMAGE,
    price: 280,
    passengers: 2,
    fuel: "Petrol",
    transmission: "Auto",
    rating: 5.0,
  },
  {
    id: "3",
    name: "Range Rover Sport",
    type: "Luxury SUV",
    image: COMMON_CAR_IMAGE,
    price: 190,
    passengers: 7,
    fuel: "Diesel",
    transmission: "Auto",
    rating: 4.8,
  },
  {
    id: "4",
    name: "BMW M4 Competition",
    type: "Performance",
    image: COMMON_CAR_IMAGE,
    price: 220,
    passengers: 4,
    fuel: "Petrol",
    transmission: "Auto",
    rating: 4.7,
  },
  {
    id: "5",
    name: "Audi RS e-tron GT",
    type: "Electric GT",
    image: COMMON_CAR_IMAGE,
    price: 240,
    passengers: 4,
    fuel: "Electric",
    transmission: "Auto",
    rating: 4.9,
  },
  {
    id: "6",
    name: "Mercedes G-Wagon",
    type: "Luxury Off-road",
    image: COMMON_CAR_IMAGE,
    price: 350,
    passengers: 5,
    fuel: "Petrol",
    transmission: "Auto",
    rating: 5.0,
  },
];

export default function App() {
  const [step, setStep] = useState<
    | "landing"
    | "fleet"
    | "login"
    | "addons"
    | "checkout"
    | "success"
    | "profile"
  >("landing");
  const [user, setUser] = useState<any>(getStoredUser());
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [drivingMode, setDrivingMode] = useState<"self" | "driver">("self");
  const [selectedDates, setSelectedDates] = useState({
    pickup: "",
    return: "",
  });
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await fetchVehicles();
        setFleet(data);
      } catch (error) {
        console.error("Failed to load vehicles from API, using fallback data");
        // Fallback to initial data if API fails
        setFleet(
          FLEET.map((v) => ({
            ...v,
            specs: { year: 2024 },
          })),
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadVehicles();
  }, []);

  const handleBook = (car: any) => {
    setSelectedCar(car);
    setSelectedAddons([]);
    setDrivingMode("self");

    if (!user) {
      setStep("login");
    } else {
      setStep("addons");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    if (selectedCar) {
      setStep("addons");
    } else {
      setStep("landing");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setStep("landing");
  };

  const handleAddonsContinue = async (
    addons: any[],
    mode: "self" | "driver",
    dates: { pickup: string; return: string },
  ) => {
    setSelectedAddons(addons);
    setDrivingMode(mode);
    setSelectedDates(dates);

    console.log(selectedCar);

    // Calculate booking data as requested
    const pickupDate = new Date(dates.pickup);
    const returnDate = new Date(dates.return);
    const diffTime = Math.abs(returnDate.getTime() - pickupDate.getTime());
    const duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const vehiclePerDay = selectedCar?.price || 0;
    const driverPerDay = mode === "driver" ? 50 : 0;
    const addonsPerDay = addons.reduce((sum, a) => sum + a.price, 0);
    const addonsTotal = addonsPerDay;
    const addonsTotal_perDay = addonsPerDay + driverPerDay;
    const totalAmount = vehiclePerDay * duration + addonsTotal_perDay;

    const bookingData: BookingData = {
      id: `B${Math.floor(1000 + Math.random() * 9000)}`,
      userId: user?.id || "",
      vehicleId: selectedCar?.id || "",
      driverId: mode === "driver" ? "d1" : undefined,
      startDate: dates.pickup,
      endDate: dates.return,
      duration,
      vehiclePerDay,
      driverPerDay,
      addonsTotal,
      totalAmount,
      status: "Confirmed",
      addOns: addons,
    };

    try {
      const data = await createBooking(bookingData);
      setCurrentBookingId(data.booking._id);
      setStep("checkout");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to create booking:", error);
      // Still proceed to checkout for demo purposes, or show error
      setStep("checkout");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavigate = (page: string) => {
    if (page === "landing") setStep("landing");
    if (page === "fleet") setStep("fleet");
    if (page === "profile") setStep("profile");
    if (page === "login") setStep("login");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (step === "landing") {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900">
        <Navbar
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
        />
        <Hero onViewFleet={() => setStep("fleet")} />

        {/* Fleet Section */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-4xl font-bold mb-4">
                  Our Premium Vehicles
                </h2>
                <p className="text-lg text-slate-600">
                  Choose from our wide range of high-end Vehicles. Whether it's
                  for business or pleasure, we have the perfect ride for you.
                </p>
              </div>
              <div className="flex gap-2">
                {["All", "Luxury", "SUV", "Electric", "Sports"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${tab === "All" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading
                ? Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="h-[400px] bg-slate-100 animate-pulse rounded-[40px]"
                      />
                    ))
                : fleet
                    .slice(0, 3)
                    .map((car) => (
                      <CarCard key={car.id} {...car} onBook={handleBook} />
                    ))}
            </div>

            <div className="mt-16 text-center">
              <button
                onClick={() => setStep("fleet")}
                className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:gap-4 transition-all"
              >
                View All Vehicles
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl font-bold mb-6">
                Why Choose VehicleHub?
              </h2>
              <p className="text-lg text-slate-600">
                We provide more than just a car. We provide a premium experience
                with every rental.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: <Shield className="w-8 h-8 text-indigo-600" />,
                  title: "Fully Insured",
                  desc: "All our vehicles come with comprehensive insurance coverage for your peace of mind.",
                },
                {
                  icon: <Clock className="w-8 h-8 text-indigo-600" />,
                  title: "24/7 Support",
                  desc: "Our dedicated support team is available around the clock to assist you with any needs.",
                },
                {
                  icon: <Zap className="w-8 h-8 text-indigo-600" />,
                  title: "Instant Booking",
                  desc: "Book your car in less than 60 seconds with our streamlined checkout process.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-8 rounded-[40px] bg-slate-50 border border-slate-100"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">
                    VehicleHub
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Premium car rental service for those who demand the best.
                  Experience luxury and performance on every road.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-6">Quick Links</h4>
                <ul className="space-y-4 text-slate-400 text-sm">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Fleet
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Locations
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6">Support</h4>
                <ul className="space-y-4 text-slate-400 text-sm">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Insurance Details
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6">Newsletter</h4>
                <p className="text-slate-400 text-sm mb-4">
                  Subscribe to get special offers and news.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email address"
                    className="bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                  />
                  <button className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-700 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
              <p>© 2024 VehicleHub Premium Rentals. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">
                  Facebook
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Twitter
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (step === "fleet") {
    return (
      <FleetPage
        fleet={fleet}
        onBook={handleBook}
        onBack={() => setStep("landing")}
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  if (step === "login") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-12 font-sans text-slate-900">
        <Login
          onLogin={handleLogin}
          onBack={() => setStep("landing")}
          onSwitchToSignUp={() => setStep("signup")}
        />
      </div>
    );
  }

  if (step === "signup") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-12 font-sans text-slate-900">
        <SignUp
          onSignUp={handleLogin}
          onBack={() => setStep("landing")}
          onSwitchToLogin={() => setStep("login")}
        />
      </div>
    );
  }

  if (step === "addons") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-12 font-sans text-slate-900">
        <Addons
          car={selectedCar}
          onBack={() => setStep("landing")}
          onContinue={handleAddonsContinue}
          user={user}
        />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[40px] shadow-xl p-10 max-w-md w-full text-center border border-slate-100"
        >
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 10,
                delay: 0.2,
              }}
              className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-slate-500 mb-10 leading-relaxed">
            Your {selectedCar?.name} is ready for pickup.
          </p>
          <div className="bg-slate-50 rounded-3xl p-6 mb-10 text-left border border-slate-100">
            <div className="flex justify-between mb-3">
              <span className="text-slate-400 text-sm">Booking ID</span>
              <span className="text-slate-900 font-mono text-sm font-bold">
                #DS-2024-99X
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Vehicle</span>
              <span className="text-slate-900 font-bold">
                {selectedCar?.name}
              </span>
            </div>
          </div>
          <button
            onClick={() => setStep("landing")}
            className="w-full bg-slate-900 text-white rounded-2xl py-5 font-bold text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (step === "profile") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-12 font-sans text-slate-900">
        <Profile
          user={user}
          onUpdate={(updatedUser) => setUser(updatedUser)}
          onBack={() => setStep("landing")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-12 font-sans text-slate-900">
      <PaymentPortal
        onBack={() => setStep("addons")}
        onSuccess={() => setStep("success")}
        car={selectedCar}
        addons={selectedAddons}
        drivingMode={drivingMode}
        dates={selectedDates}
        bookingId={currentBookingId || ""}
        user={user}
      />
    </div>
  );
}
