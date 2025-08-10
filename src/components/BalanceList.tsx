import React from 'react';
import { Balance } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BalanceListProps {
  balances: Balance[];
}

const BalanceList: React.FC<BalanceListProps> = ({ balances }) => {
  // Urutkan berdasarkan saldo (positif di atas, negatif di bawah)
  const sortedBalances = [...balances].sort((a, b) => b.balance - a.balance);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saldo Teman</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedBalances.map((balance) => (
            <div key={balance.userId} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: balance.color }}
                ></div>
                <span className="font-medium">{balance.name}</span>
              </div>
              <Badge 
                variant={balance.balance >= 0 ? "default" : "destructive"}
                className="text-sm"
              >
                {balance.balance >= 0 ? '+' : ''}{balance.balance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceList;