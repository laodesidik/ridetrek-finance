import React, { useState, useEffect } from 'react';
import { Expense, User, Balance } from '@/types';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import BalanceList from '@/components/BalanceList';
import FinancialSummary from '@/components/FinancialSummary';
import UnpaidSummary from '@/components/UnpaidSummary';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DatabaseService } from '@/services/database';

const Index = () => {
  // Data pengguna awal (6 orang)
  const initialUsers: User[] = [
    { id: '1', name: 'Laode', color: '#3b82f6' },
    { id: '2', name: 'Frankie', color: '#ef4444' },
    { id: '3', name: 'Rasad', color: '#10b981' },
    { id: '4', name: 'Fajar', color: '#f59e0b' },
    { id: '5', name: 'Panji', color: '#8b5cf6' },
    { id: '6', name: 'Jerry', color: '#ec4899' },
  ];

  const [users] = useState<User[]>(initialUsers);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses from database on component mount
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const fetchedExpenses = await DatabaseService.fetchTransactions();
        setExpenses(fetchedExpenses);
        setError(null);
      } catch (error) {
        console.error('Error fetching expenses:', error);
        setError('Gagal memuat data transaksi');
        toast.error('Gagal memuat data transaksi');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // Hitung saldo untuk setiap pengguna
  const calculateBalances = (): Balance[] => {
    const balances: Record<string, Balance> = {};
    
    // Inisialisasi saldo untuk setiap pengguna
    users.forEach(user => {
      balances[user.id] = {
        userId: user.id,
        name: user.name,
        color: user.color,
        balance: 0
      };
    });
    
    // Hitung berdasarkan pengeluaran
    expenses.forEach(expense => {
      // Tambahkan ke saldo orang yang membayar
      balances[expense.paidBy].balance += expense.amount;
      
      // Kurangi saldo orang yang terlibat dalam pembagian
      expense.splits.forEach(split => {
        balances[split.userId].balance -= split.amount;
      });
    });
    
    return Object.values(balances);
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const newExpense = await DatabaseService.addTransaction(expense);
      setExpenses(prev => [...prev, newExpense]);
      toast.success('Pengeluaran berhasil ditambahkan');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Gagal menambahkan pengeluaran');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await DatabaseService.deleteTransaction(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast.success('Transaksi berhasil dihapus');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Gagal menghapus transaksi');
    }
  };

  const handleUpdatePayment = async (expenseId: string, userId: string, paid: boolean, partialAmount?: number) => {
    try {
      const updatedExpense = await DatabaseService.updatePaymentStatus(
        expenseId,
        userId,
        paid,
        partialAmount
      );
      
      if (updatedExpense) {
        setExpenses(prev => 
          prev.map(expense => 
            expense.id === expenseId ? updatedExpense : expense
          )
        );
        
        if (paid) {
          toast.success('Status pembayaran diperbarui menjadi lunas');
        } else if (partialAmount && partialAmount > 0) {
          toast.success('Pembayaran sebagian berhasil dicatat');
        }
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Gagal memperbarui status pembayaran');
    }
  };

  const balances = calculateBalances();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ridetrek - Finance</h1>
          <p className="text-gray-600">Pencatatan Pengeluaran KOMA 6</p>
          
          <div className="mt-4">
            <Link to="/transactions">
              <Button variant="outline">Lihat Riwayat Transaksi</Button>
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Memuat data...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-32">
            <span className="text-red-500">{error}</span>
          </div>
        ) : (
          <>
            <FinancialSummary expenses={expenses} users={users} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2 space-y-6">
                <ExpenseForm users={users} onSubmit={handleAddExpense} />
                <ExpenseList expenses={expenses} users={users} onDelete={handleDeleteExpense} />
              </div>
              
              <div className="space-y-6">
                <UnpaidSummary expenses={expenses} users={users} />
              </div>
            </div>
          </>
        )}
        
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;