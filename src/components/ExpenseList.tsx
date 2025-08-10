import React from 'react';
import { Expense, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import PaymentProgress from '@/components/PaymentProgress';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExpenseListProps {
  expenses: Expense[];
  users: User[];
  onDelete?: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, users, onDelete }) => {
  const getUserById = (id: string) => users.find(user => user.id === id);
  
  // Urutkan berdasarkan tanggal terbaru
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Pengeluaran</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedExpenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Belum ada pengeluaran yang dicatat
            </p>
          ) : (
            sortedExpenses.map(expense => {
              const payer = getUserById(expense.paidBy);
              const participants = expense.splits.map(split => getUserById(split.userId)).filter(Boolean) as User[];
              
              return (
                <div key={expense.id} className="border rounded-lg p-4 relative">
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={() => {
                        onDelete(expense.id);
                        toast.success('Transaksi berhasil dihapus');
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{expense.description}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{expense.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(expense.date), 'dd MMM yyyy', { locale: id })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {Math.round(expense.amount).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dibayar oleh {payer?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground mb-1">Dibagi dengan:</p>
                    <div className="flex flex-wrap gap-1">
                      {participants.map((user, index) => (
                        <div 
                          key={user.id} 
                          className="flex items-center text-xs bg-secondary px-2 py-1 rounded"
                        >
                          <div 
                            className="w-2 h-2 rounded-full mr-1" 
                            style={{ backgroundColor: user.color }}
                          ></div>
                          <span>{user.name}</span>
                          {expense.splitType !== 'equal' && (
                            <span className="ml-1">
                              ({Math.round(expense.splits.find(s => s.userId === user.id)?.amount || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 })})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <PaymentProgress expense={expense} />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseList;