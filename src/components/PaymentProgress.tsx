import React from 'react';
import { Expense } from '@/types';
import { Progress } from '@/components/ui/progress';

interface PaymentProgressProps {
  expense: Expense;
}

const PaymentProgress: React.FC<PaymentProgressProps> = ({ expense }) => {
  // Hitung progress pembayaran
  const calculateProgress = () => {
    if (!expense.splits || expense.splits.length === 0) return 100;
    
    let paidCount = 0;
    
    expense.splits.forEach(split => {
      const paymentStatus = expense.paymentStatus?.[split.userId];
      if (paymentStatus && paymentStatus.paid) {
        paidCount++;
      }
    });
    
    return Math.round((paidCount / expense.splits.length) * 100);
  };

  const progress = calculateProgress();
  const isFullyPaid = progress === 100;

  return (
    <div className="mt-2">
      <div className="flex justify-between text-sm mb-1">
        <span>Progress Pembayaran</span>
        <span>{progress}%</span>
      </div>
      <Progress 
        value={progress} 
        className={isFullyPaid ? "bg-green-500" : "bg-orange-500"} 
      />
    </div>
  );
};

export default PaymentProgress;