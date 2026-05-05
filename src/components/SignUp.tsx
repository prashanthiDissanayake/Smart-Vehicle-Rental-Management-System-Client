import React, { useState } from "react";
import {
  Car,
  Mail,
  Lock,
  ArrowRight,
  Chrome,
  Github,
  ShieldCheck,
  User as UserIcon,
  Phone,
} from "lucide-react";
import { motion } from "motion/react";
import { signup } from "../services/authService";

interface SignUpProps {
  onSignUp: (user: any) => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({
  onSignUp,
  onBack,
  onSwitchToLogin,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role] = useState("Customer");
  const [avatar] = useState(
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80",
  );
  const [status] = useState("Active");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validatePassword(password) {
    const minLength = 8;
    const upperCase = /[A-Z]/;
    const lowerCase = /[a-z]/;
    const number = /[0-9]/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (password.length < minLength) {
      return "Password must be at least 8 characters";
    }
    if (!upperCase.test(password)) {
      return "Password must include at least one uppercase letter";
    }
    if (!lowerCase.test(password)) {
      return "Password must include at least one lowercase letter";
    }
    if (!number.test(password)) {
      return "Password must include at least one number";
    }
    if (!specialChar.test(password)) {
      return "Password must include at least one special character";
    }

    return "Valid password";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validatePassword(password) !== "Valid password") {
      alert(validatePassword(password));
      return;
    }

    const id: string = `u${crypto.randomUUID().slice(0, 8)}`;
    const joinDate: string = new Date().toISOString().split("T")[0];

    setIsLoading(true);
    setError(null);

    try {
      const response = await signup(
        name,
        email,
        password,
        phone,
        role,
        avatar,
        status,
        id,
        joinDate,
      );
      onSignUp(response.user);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Signup failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[40px] shadow-xl p-10 border border-slate-100"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Create Account
          </h2>
          <p className="text-slate-500">
            Join VehicleHub for a premium experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
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

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              phone
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07xxxxxxxxx"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
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
                Create Account
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-10 text-sm text-slate-500">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="font-bold text-indigo-600 hover:text-indigo-700"
          >
            Sign In
          </button>
        </p>

        <div onClick={onBack} className="mt-8 text-center">
          <button className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors">
            Return to Fleet
          </button>
        </div>
      </motion.div>

      <p className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        Secure Registration Powered by VehicleHub
      </p>
    </div>
  );
};
