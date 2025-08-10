import React, { useState } from 'react';
import { Expense, User, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface ExpenseFormProps {
  users: User[];
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ users, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Makan');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState(users[0]?.id || '');
  const [splitType, setSplitType] = useState<'equal' | 'unequal' | 'specific'>('equal');
  const [selectedUsers, setSelectedUsers] = useState<string[]>(users.map(u => u.id));
  const [unequalAmounts, setUnequalAmounts] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !paidBy) {
      toast.error('Harap isi semua field yang wajib');
      return;
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Jumlah pengeluaran tidak valid');
      return;
    }
    
    if (selectedUsers.length === 0) {
      toast.error('Pilih minimal satu orang untuk dibagi');
      return;
    }
    
    // Membuat splits berdasarkan tipe pembagian
    let splits: { userId: string; amount: number }[] = [];
    
    if (splitType === 'equal') {
      const splitAmount = amountValue / selectedUsers.length;
      splits = selectedUsers.map(userId => ({
        userId,
        amount: splitAmount
      }));
    } else if (splitType === 'unequal') {
      // Hitung total dari input pengguna
      let totalSplit = 0;
      const validSplits: { userId: string; amount: number }[] = [];
      
      selectedUsers.forEach(userId => {
        const userAmountStr = unequalAmounts[userId];
        if (userAmountStr !== undefined && userAmountStr !== '') {
          const userAmount = parseFloat(userAmountStr);
          if (!isNaN(userAmount) && userAmount >= 0) {
            totalSplit += userAmount;
            validSplits.push({
              userId,
              amount: userAmount
            });
          }
        }
      });
      
      // Validasi total pembagian
      if (Math.abs(totalSplit - amountValue) > 0.01) {
        toast.error(`Total pembagian (${totalSplit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}) tidak sesuai dengan jumlah pengeluaran (${amountValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })})`);
        return;
      }
      
      splits = validSplits;
    } else {
      // specific - hanya satu orang
      splits = [{
        userId: selectedUsers[0],
        amount: amountValue
      }];
    }
    
    onSubmit({
      amount: amountValue,
      description,
      category,
      date,
      paidBy,
      splitType,
      splits
    });
    
    // Reset form
    setAmount('');
    setDescription('');
    setCategory('Makan');
    setDate(new Date().toISOString().split('T')[0]);
    setPaidBy(users[0]?.id || '');
    setSplitType('equal');
    setSelectedUsers(users.map(u => u.id));
    setUnequalAmounts({});
  };

  const handleUserToggle = (userId: string) => {
    if (splitType === 'specific') {
      // Hanya satu orang yang bisa dipilih untuk tipe specific
      setSelectedUsers([userId]);
      return;
    }
    
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  // Fungsi untuk menghitung total pembagian tidak rata
  const calculateUnequalTotal = () => {
    return selectedUsers.reduce((total, userId) => {
      const amountStr = unequalAmounts[userId];
      if (amountStr && amountStr !== '') {
        const amount = parseFloat(amountStr);
        return isNaN(amount) ? total : total + amount;
      }
      return total;
    }, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Pengeluaran</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah (IDR)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="0"
                step="1000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Makan siang di restoran..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select value={category} onValueChange={(value: Category) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Makan">Makan</SelectItem>
                <SelectItem value="Hotel">Hotel</SelectItem>
                <SelectItem value="Tiket Wisata">Tiket Wisata</SelectItem>
                <SelectItem value="Ferry">Ferry</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paidBy">Dibayar oleh</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: user.color }}
                      ></div>
                      {user.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Tipe Pembagian</Label>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={splitType === 'equal' ? 'default' : 'outline'}
                onClick={() => setSplitType('equal')}
                size="sm"
              >
                Dibagi Rata
              </Button>
              <Button
                type="button"
                variant={splitType === 'unequal' ? 'default' : 'outline'}
                onClick={() => setSplitType('unequal')}
                size="sm"
              >
                Tidak Rata
              </Button>
              <Button
                type="button"
                variant={splitType === 'specific' ? 'default' : 'outline'}
                onClick={() => setSplitType('specific')}
                size="sm"
              >
                Spesifik
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Dibagi dengan</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {users.map(user => (
                <div 
                  key={user.id} 
                  className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer ${
                    selectedUsers.includes(user.id) 
                      ? 'border-primary bg-primary/10' 
                      : 'border-input'
                  }`}
                  onClick={() => handleUserToggle(user.id)}
                >
                  <Checkbox 
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => handleUserToggle(user.id)}
                  />
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: user.color }}
                  ></div>
                  <span className="text-sm">{user.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {splitType === 'unequal' && (
            <div className="space-y-2">
              <Label>Pembagian Tidak Rata</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedUsers.map(userId => {
                  const user = users.find(u => u.id === userId);
                  if (!user) return null;
                  
                  return (
                    <div key={userId} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: user.color }}
                      ></div>
                      <span className="text-sm w-20 truncate">{user.name}</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={unequalAmounts[userId] || ''}
                        onChange={(e) => setUnequalAmounts(prev => ({
                          ...prev,
                          [userId]: e.target.value
                        }))}
                        className="flex-1"
                        min="0"
                        step="1000"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Total pembagian: {calculateUnequalTotal().toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                {amount && ` / ${parseFloat(amount).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`}
              </div>
            </div>
          )}
          
          <Button type="submit" className="w-full">
            Tambah Pengeluaran
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;