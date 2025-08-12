import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle, MinusCircle } from 'lucide-react';
import { DatabaseService } from '@/services/database';
import { Expense, User } from '@/types';

const PublicTransactionsPage = () => {
  const users: User[] = [
    { id: '1', name: 'Laode', color: '#3b82f6' },
    { id: '2', name: 'Frankie', color: '#ef4444' },
    { id: '3', name: 'Rasad', color: '#10b981' },
    { id: '4', name: 'Fajar', color: '#f59e0b' },
    { id: '5', name: 'Panji', color: '#8b5cf6' },
    { id: '6', name: 'Jerry', color: '#ec4899' },
  ];

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const fetchedExpenses = await DatabaseService.fetchTransactions();
        setExpenses(fetchedExpenses);
        setError(null);
      } catch (error) {
        console.error('Error fetching expenses:', error);
        setError('Gagal memuat data transaksi');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const getUserById = (id: string) => users.find(user => user.id === id);

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate unpaid amounts per person
  const calculateUnpaidPerPerson = () => {
    const unpaidAmounts: Record<string, number> = {};
    
    // Initialize for each user
    users.forEach(user => {
      unpaidAmounts[user.id] = 0;
    });
    
    // Calculate based on expenses
    expenses.forEach(expense => {
      expense.splits.forEach(split => {
        const userId = split.userId;
        const splitAmount = split.amount;
        
        // Check payment status
        const paymentStatus = expense.paymentStatus?.[userId];
        if (!paymentStatus || !paymentStatus.paid) {
          // If not fully paid, add to unpaid amount
          const paidAmount = paymentStatus?.partialAmount || 0;
          unpaidAmounts[userId] += (splitAmount - paidAmount);
        }
      });
    });
    
    return unpaidAmounts;
  };

  const unpaidAmounts = calculateUnpaidPerPerson();

  // Get payment status for a user in a specific expense
  const getUserPaymentStatus = (expense: Expense, userId: string) => {
    const paymentStatus = expense.paymentStatus?.[userId];
    if (!paymentStatus) return { status: 'Belum bayar', remaining: expense.splits.find(s => s.userId === userId)?.amount || 0 };
    
    if (paymentStatus.paid) return { status: 'Lunas', remaining: 0 };
    
    const split = expense.splits.find(s => s.userId === userId);
    const splitAmount = split?.amount || 0;
    const paidAmount = paymentStatus.partialAmount || 0;
    const remaining = splitAmount - paidAmount;
    
    return { 
      status: 'Sebagian', 
      remaining,
      partialAmount: paidAmount
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Transaksi</h1>
          <p className="text-gray-600">Versi publik - hanya untuk melihat</p>
        </div>

        {/* Summary Section per Person */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ringkasan per Orang</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => {
              const unpaidAmount = unpaidAmounts[user.id];
              const isFullyPaid = unpaidAmount <= 0;
              
              let statusText = 'Lunas';
              let statusIcon = <CheckCircle className="w-5 h-5" />;
              let statusColor = 'text-green-600';
              
              if (!isFullyPaid) {
                statusText = 'Belum';
                statusIcon = <MinusCircle className="w-5 h-5" />;
                statusColor = 'text-red-600';
              }
              
              return (
                <div key={user.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
                  <div className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: user.color }}
                        />
                        <span className="text-lg font-semibold">{user.name}</span>
                      </div>
                      <div className={`flex items-center ${statusColor}`}>
                        {statusIcon}
                        <span className="ml-1 text-sm">{statusText}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <p className="text-xl font-bold text-gray-900">
                      {isFullyPaid 
                        ? 'Lunas ✅' 
                        : Math.round(unpaidAmount).toLocaleString('id-ID', { 
                            style: 'currency', 
                            currency: 'IDR', 
                            minimumFractionDigits: 0, 
                            maximumFractionDigits: 0 
                          })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Riwayat Transaksi</h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              <span className="ml-2">Memuat data...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-32">
              <span className="text-red-500">{error}</span>
            </div>
          ) : sortedExpenses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="py-8 text-center">
                <p className="text-gray-500">Tidak ada data transaksi</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedExpenses.map((expense) => {
                const payer = getUserById(expense.paidBy);
                
                // Calculate payment progress
                const totalSplitAmount = expense.splits.reduce((sum, split) => sum + split.amount, 0);
                const paidAmount = expense.splits.reduce((sum, split) => {
                  const paymentStatus = expense.paymentStatus?.[split.userId];
                  if (paymentStatus?.paid) {
                    return sum + split.amount;
                  } else if (paymentStatus?.partialAmount && paymentStatus.partialAmount > 0) {
                    return sum + paymentStatus.partialAmount;
                  }
                  return sum;
                }, 0);
                
                const progressPercentage = totalSplitAmount > 0 
                  ? Math.round((paidAmount / totalSplitAmount) * 100) 
                  : 0;
                
                return (
                  <div key={expense.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border">
                    <div className="p-4 pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-lg font-semibold">{expense.description}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {expense.category}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>{format(new Date(expense.date), 'dd MMM yyyy', { locale: id })}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {Math.round(expense.amount).toLocaleString('id-ID', { 
                            style: 'currency', 
                            currency: 'IDR', 
                            minimumFractionDigits: 0, 
                            maximumFractionDigits: 0 
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Dibayar oleh: {payer?.name || 'Tidak diketahui'}</span>
                          <span className="font-medium">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Peserta:</h4>
                        <div className="flex flex-wrap gap-2">
                          {expense.splits.map((split) => {
                            const user = getUserById(split.userId);
                            if (!user) return null;
                            
                            const paymentStatus = getUserPaymentStatus(expense, split.userId);
                            
                            return (
                              <div 
                                key={`${expense.id}-${split.userId}`} 
                                className="relative group"
                                title={`${user.name}: ${paymentStatus.status}${paymentStatus.remaining > 0 ? ` (${Math.round(paymentStatus.remaining).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 })})` : ''}`}
                              >
                                <span 
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white hover:opacity-90 cursor-pointer"
                                  style={{ backgroundColor: user.color }}
                                >
                                  {user.name}
                                </span>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                  {paymentStatus.status}
                                  {paymentStatus.remaining > 0 && (
                                    <div>
                                      {Math.round(paymentStatus.remaining).toLocaleString('id-ID', { 
                                        style: 'currency', 
                                        currency: 'IDR', 
                                        minimumFractionDigits: 0, 
                                        maximumFractionDigits: 0 
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicTransactionsPage;