import { supabase } from '@/lib/supabase'
import { Expense } from '@/types'

// Helper function to convert camelCase keys to snake_case for database operations
const toSnakeCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  
  const snakeObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      snakeObj[snakeKey] = toSnakeCase(obj[key]);
    }
  }
  return snakeObj;
};

// Helper function to convert snake_case keys to camelCase from database operations
const toCamelCase = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  
  const camelObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      camelObj[camelKey] = toCamelCase(obj[key]);
    }
  }
  return camelObj;
};

export const DatabaseService = {
  // Fetch all transactions
  fetchTransactions: async (): Promise<Expense[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
    
    return data.map(toCamelCase) as Expense[]
  },

  // Add a new transaction
  addTransaction: async (transaction: Omit<Expense, 'id'>): Promise<Expense> => {
    const snakeTransaction = toSnakeCase(transaction);
    const { data, error } = await supabase
      .from('transactions')
      .insert([snakeTransaction])
      .select()
    
    if (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
    
    return toCamelCase(data[0]) as Expense
  },

  // Update a transaction
  updateTransaction: async (id: string, updates: Partial<Expense>): Promise<Expense | null> => {
    const snakeUpdates = toSnakeCase(updates);
    const { data, error } = await supabase
      .from('transactions')
      .update(snakeUpdates)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
    
    return data.length > 0 ? (toCamelCase(data[0]) as Expense) : null
  },

  // Delete a transaction
  deleteTransaction: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
    
    return true
  },

  // Update payment status
  updatePaymentStatus: async (
    expenseId: string,
    userId: string,
    paid: boolean,
    partialAmount?: number
  ): Promise<Expense | null> => {
    // First, get the current transaction
    const { data: transactions, error: fetchError } = await supabase
      .from('transactions')
      .select('payment_status')
      .eq('id', expenseId)
    
    if (fetchError) {
      console.error('Error fetching transaction:', fetchError)
      throw fetchError
    }
    
    if (transactions.length === 0) {
      throw new Error('Transaction not found')
    }
    
    // Update the payment status
    const currentPaymentStatus = transactions[0].payment_status || {}
    const updatedPaymentStatus = {
      ...currentPaymentStatus,
      [userId]: {
        paid,
        partialAmount: paid ? undefined : partialAmount
      }
    }
    
    // Update the transaction with new payment status
    const { data, error } = await supabase
      .from('transactions')
      .update({ payment_status: updatedPaymentStatus })
      .eq('id', expenseId)
      .select()
    
    if (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
    
    return data.length > 0 ? (toCamelCase(data[0]) as Expense) : null
  }
}
