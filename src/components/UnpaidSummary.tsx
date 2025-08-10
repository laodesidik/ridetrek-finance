import React from 'react';
import { User, Expense } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface UnpaidSummaryProps {
  expenses: Expense[];
  users: User[];
}

const UnpaidSummary: React.FC<UnpaidSummaryProps> = ({ expenses, users }) => {
  // Hitung total belum terbayar untuk setiap pengguna
  const calculateUnpaidAmounts = () => {
    const unpaidAmounts: Record<string, number> = {};
    
    // Inisialisasi untuk setiap pengguna
    users.forEach(user => {
      unpaidAmounts[user.id] = 0;
    });
    
    // Hitung berdasarkan pengeluaran
    expenses.forEach(expense => {
      expense.splits.forEach(split => {
        const userId = split.userId;
        const splitAmount = split.amount;
        
        // Cek status pembayaran
        const paymentStatus = expense.paymentStatus?.[userId];
        if (!paymentStatus || !paymentStatus.paid) {
          // Jika belum lunas, tambahkan ke jumlah belum terbayar
          const paidAmount = paymentStatus?.partialAmount || 0;
          unpaidAmounts[userId] += (splitAmount - paidAmount);
        }
      });
    });
    
    return unpaidAmounts;
  };

  const unpaidAmounts = calculateUnpaidAmounts();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Belum Terbayar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map(user => {
            const unpaidAmount = unpaidAmounts[user.id];
            const isFullyPaid = unpaidAmount <= 0;
            
            return (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: user.color }}
                  ></div>
                  <span className="font-medium">{user.name}</span>
                </div>
                {isFullyPaid ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    <span className="text-sm">Lunas</span>
                  </div>
                ) : (
                  <Badge variant="destructive" className="text-sm">
                    {Math.round(unpaidAmount).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnpaidSummary;