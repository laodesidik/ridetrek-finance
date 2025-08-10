export interface User {
  id: string;
  name: string;
  color: string; // untuk identifikasi visual
}

export type Category = 'Hotel' | 'Makan' | 'Tiket Wisata' | 'Ferry';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: string; // ISO string
  paidBy: string; // user id
  splitType: 'equal' | 'unequal' | 'specific';
  splits: {
    userId: string;
    amount: number;
  }[];
}

export interface Balance {
  userId: string;
  name: string;
  balance: number;
  color: string;
}