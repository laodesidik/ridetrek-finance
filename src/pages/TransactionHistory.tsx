import React, { useState, useEffect } from 'react';
import { Expense, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import { CheckCircle, Circle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DatabaseService } from '@/services/database';
import { useAuth } from '@/contexts/AuthContext';

const TransactionHistory = ({ isAdmin: propIsAdmin }: { isAdmin?: boolean }) => {
  const { isAdmin: contextIsAdmin } = useAuth();
  const effectiveIsAdmin = propIsAdmin !== undefined ? propIsAdmin : contextIsAdmin;

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
        toast.error('Gagal memuat data transaksi');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const getUserById = (id: string) => users.find(user => user.id === id);

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const handlePaymentToggle = async (expenseId: string, userId: string, paid: boolean) => {
    try {
      const updatedExpense = await DatabaseService.updatePaymentStatus(expenseId, userId, paid);

      if (updatedExpense) {
        setExpenses(prev =>
          prev.map(expense =>
            expense.id === expenseId ? updatedExpense : expense
          )
        );

        if (paid) {
          toast.success('Status pembayaran diperbarui menjadi lunas');
        }
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Gagal memperbarui status pembayaran');
    }
  };

  const handlePartialPayment = async (expenseId: string, userId: string, amount: number) => {
    try {
      const updatedExpense = await DatabaseService.updatePaymentStatus(
        expenseId,
        userId,
        false,
        Math.round(amount)
      );

      if (updatedExpense) {
        setExpenses(prev =>
          prev.map(expense =>
            expense.id === expenseId ? updatedExpense : expense
          )
        );
      }
    } catch (error) {
      console.error('Error updating partial payment:', error);
      toast.error('Gagal memperbarui pembayaran sebagian');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Transaksi</h1>
          <p className="text-gray-600">Kelola status pembayaran untuk setiap transaksi</p>

          <div className="mt-4">
            <Link to="/">
              <Button variant="outline">Kembali ke Dashboard</Button>
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
            {/* Ringkasan Pengeluaran per Kategori */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pengeluaran per Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(categoryTotals).map(([category, amount]) => (
                    <div key={category} className="flex justify-between">
                      <span>{category}</span>
                      <span className="font-medium">
                        {Math.round(amount).toLocaleString('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {sortedExpenses.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">Belum ada transaksi yang dicatat</p>
                  </CardContent>
                </Card>
              ) : (
                sortedExpenses.map(expense => {
                  const payer = getUserById(expense.paidBy);

                  return (
                    <Card key={expense.id} className="overflow-hidden relative">
                      {effectiveIsAdmin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="absolute top-2 right-2 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}

                      <CardHeader className="bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{expense.description}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary">{expense.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(expense.date), 'dd MMM yyyy', { locale: id })}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {Math.round(expense.amount).toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Dibayar oleh {payer?.name}
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <h3 className="font-medium">Status Pembayaran:</h3>

                          <div className="space-y-3">
                            {expense.splits.map(split => {
                              const user = getUserById(split.userId);
                              if (!user) return null;

                              const paymentStatus = expense.paymentStatus?.[split.userId] || { paid: false };
                              const isFullyPaid = paymentStatus.paid;
                              const partialAmount = paymentStatus.partialAmount || 0;

                              return (
                                <div
                                  key={`${expense.id}-${split.userId}`}
                                  className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: user.color }}
                                    ></div>
                                    <span className="font-medium">{user.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      ({Math.round(split.amount).toLocaleString('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                      })})
                                    </span>
                                  </div>

                                  <div className="flex items-center space-x-4">
                                    {isFullyPaid ? (
                                      <div className="flex items-center text-green-600">
                                        <CheckCircle className="w-5 h-5 mr-1" />
                                        <span className="text-sm">Lunas</span>
                                      </div>
                                    ) : partialAmount > 0 ? (
                                      <div className="text-sm">
                                        Dibayar:{' '}
                                        <span className="font-medium">
                                          {Math.round(partialAmount).toLocaleString('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0
                                          })}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center text-muted-foreground">
                                        <Circle className="w-5 h-5 mr-1" />
                                        <span className="text-sm">Belum dibayar</span>
                                      </div>
                                    )}

                                    {effectiveIsAdmin ? (
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          checked={isFullyPaid}
                                          onCheckedChange={checked =>
                                            handlePaymentToggle(expense.id, split.userId, checked)
                                          }
                                        />
                                        <Label className="text-sm">Lunas</Label>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-2 opacity-50">
                                        <Switch checked={isFullyPaid} disabled />
                                        <Label className="text-sm">Lunas</Label>
                                      </div>
                                    )}

                                    {!isFullyPaid && (
                                      <div className="flex items-center space-x-2">
                                        <Input
                                          type="number"
                                          placeholder="Jumlah"
                                          value={partialAmount > 0 ? partialAmount : ''}
                                          onChange={e =>
                                            handlePartialPayment(
                                              expense.id,
                                              split.userId,
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          className="w-24"
                                          min="0"
                                          max={split.amount}
                                          step="1000"
                                        />
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            if (partialAmount > 0) {
                                              toast.success(
                                                `Pembayaran sebagian untuk ${user.name} berhasil dicatat`
                                              );
                                            }
                                          }}
                                        >
                                          Simpan
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
