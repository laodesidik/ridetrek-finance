import React from 'react';
import { Expense, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FinancialSummaryProps {
  expenses: Expense[];
  users: User[];
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ expenses, users }) => {
  // Hitung total pengeluaran
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Hitung pengeluaran per kategori
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Hitung pengeluaran per orang
  const userTotals = users.reduce((acc, user) => {
    acc[user.id] = {
      name: user.name,
      color: user.color,
      paid: 0,
      owed: 0
    };
    return acc;
  }, {} as Record<string, { name: string; color: string; paid: number; owed: number }>);
  
  // Hitung berapa banyak yang dibayar dan diutang setiap orang
  expenses.forEach(expense => {
    // Tambahkan ke jumlah yang dibayar oleh orang ini
    userTotals[expense.paidBy].paid += expense.amount;
    
    // Tambahkan ke jumlah yang diutang setiap orang
    expense.splits.forEach(split => {
      userTotals[split.userId].owed += split.amount;
    });
  });
  
  // Hitung saldo akhir untuk setiap orang
  const balances = Object.entries(userTotals).map(([userId, data]) => ({
    userId,
    name: data.name,
    color: data.color,
    balance: data.paid - data.owed
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {totalExpenses.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Pengeluaran per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div key={category} className="flex justify-between">
                <span>{category}</span>
                <span className="font-medium">
                  {amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummary;