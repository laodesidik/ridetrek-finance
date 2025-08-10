import { createClient } from '@supabase/supabase-js'

// Types for our expense data
import { Expense } from '@/types'

// Get these from your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define the structure of our transactions table
export type Transaction = Expense

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

// Function to fetch all transactions
export const fetchTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching transactions:', error)
    throw error
  }
  
  return data.map(toCamelCase) as Transaction[]
}

// Function to add a new transaction
export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const snakeTransaction = toSnakeCase(transaction);
  const { data, error } = await supabase
    .from('transactions')
    .insert([snakeTransaction])
    .select()
  
  if (error) {
    console.error('Error adding transaction:', error)
    throw error
  }
  
  return toCamelCase(data[0]) as Transaction
}

// Function to update a transaction
export const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
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
  
  return toCamelCase(data[0]) as Transaction
}

// Function to delete a transaction
export const deleteTransaction = async (id: string) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting transaction:', error)
    throw error
  }
  
  return true
}

// Function to update payment status
export const updatePaymentStatus = async (
  expenseId: string, 
  userId: string, 
  paid: boolean, 
  partialAmount?: number
) => {
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
  
  return toCamelCase(data[0]) as Transaction
}
