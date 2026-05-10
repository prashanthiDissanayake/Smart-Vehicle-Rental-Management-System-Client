import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, DollarSign, Info, CheckCircle2, RefreshCcw } from 'lucide-react';
import { Payment, User } from '../types';
import { cn } from '../lib/utils';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  user: User | null;
  onUpdate?: (updatedPayment: Payment) => void;
}

const RefundModal: React.FC<RefundModalProps> = ({ isOpen, onClose, payment, user, onUpdate }) => {
  const [refundAmount, setRefundAmount] = useState<string>(payment?.finalamount || '');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsProcessing(false);
    setIsSuccess(true);

    if (onUpdate) {
      onUpdate({
        ...payment,
        refund: refundAmount,
        status: 'Refunded'
      });
    }
    
    // Close after success
    setTimeout(() => {
      onClose();
      setIsSuccess(false);
      setReason('');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800">Process Refund</h3>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-800">Refund Successful</h4>
                <p className="text-slate-500 mt-2">The amount of Rs.{refundAmount} has been credited back to {user?.name}.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleRefund} className="space-y-6">
                {/* Transaction Info */}
                <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4 flex items-start gap-3">
                  <Info size={18} className="text-brand-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider">Transaction Details</p>
                    <p className="text-sm text-slate-700 mt-1">
                      Refunding <span className="font-bold">#{payment?.id}</span> for <span className="font-bold">{user?.name}</span>.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Original Amount: Rs.{payment?.amount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Refund Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Refund Amount</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      max={payment?.amount}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-bold text-slate-800"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">Maximum refundable amount: Rs.{payment?.amount}</p>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Reason for Refund</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 transition-all min-h-[100px] resize-none"
                    placeholder="e.g., Booking cancelled, Vehicle issue..."
                    required
                  />
                </div>

                {/* Warning */}
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <AlertCircle size={16} />
                  <p className="text-[11px] font-medium">This action cannot be undone once processed.</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className={cn(
                      "flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2",
                      isProcessing && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCcw size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm Refund'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RefundModal;
