// app/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress"; // For budget progress bar

// --- START: Added for Category Shortcuts ---
// Mapping of full category names to their shortcuts
const categoryShortcuts = {
  'Groceries': 'Gro',
  'Utilities': 'Uti',
  'Rent': 'Ren',
  'Entertainment': 'Ent',
  'Transport': 'Tra',
  'Dining Out': 'Din',
  'Healthcare': 'Hea',
  'Salary': 'Sal',
  'Miscellaneous': 'Mis',
  'Uncategorized': 'Unc',
};

// Function to format the category name for the axis and legends/tooltips
const formatCategoryName = (name) => {
  return categoryShortcuts[name] || name; // Returns shortcut if available, otherwise the original name
};
// --- END: Added for Category Shortcuts ---

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [transactionForm, setTransactionForm] = useState({ amount: '', date: new Date(), description: '', categoryId: '' });
  const [budgetForm, setBudgetForm] = useState({ category: '', amount: '', month: getMonth(new Date()) + 1, year: getYear(new Date()) });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgetError, setBudgetError] = useState(null);

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: format(new Date(0, i), 'MMMM') }));
  const years = Array.from({ length: 5 }, (_, i) => getYear(new Date()) - 2 + i);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [transactionsRes, categoriesRes, budgetsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/categories'),
        fetch('/api/budgets'),
      ]);

      const transactionsData = await transactionsRes.json();
      const categoriesData = await categoriesRes.json();
      const budgetsData = await budgetsRes.json();

      if (transactionsData.success && categoriesData.success && budgetsData.success) {
        const transactionsWithCategoryNames = transactionsData.data.map(t => {
          const foundCategory = categoriesData.data.find(c => c && c._id === t.categoryId);
          return {
            ...t,
            categoryName: foundCategory ? foundCategory.name : 'Uncategorized'
          };
        });
        setTransactions(transactionsWithCategoryNames);
        setCategories(categoriesData.data);
        setBudgets(budgetsData.data); // Budgets should now be correctly populated with category objects
      } else {
        setError(transactionsData.message || categoriesData.message || budgetsData.message || 'Failed to fetch data.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Transaction Form Handlers ---
  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setTransactionForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTransactionDateChange = (date) => {
    setTransactionForm(prev => ({ ...prev, date }));
  };

  const handleTransactionCategoryChange = (value) => {
    setTransactionForm(prev => ({ ...prev, categoryId: value }));
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isNaN(parseFloat(transactionForm.amount)) || parseFloat(transactionForm.amount) <= 0) {
      setError('Please enter a valid positive amount for the transaction.');
      return;
    }
    if (!transactionForm.categoryId) {
      setError('Please select a category for the transaction.');
      return;
    }

    const dataToSend = {
      ...transactionForm,
      amount: parseFloat(transactionForm.amount),
      date: transactionForm.date.toISOString(),
    };

    let res;
    if (currentTransaction) {
      res = await fetch(`/api/transactions/${currentTransaction._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
    } else {
      res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
    }

    const data = await res.json();
    if (data.success) {
      fetchAllData();
      setIsTransactionModalOpen(false);
      setTransactionForm({ amount: '', date: new Date(), description: '', categoryId: '' });
      setCurrentTransaction(null);
    } else {
      setError(data.message || 'Failed to save transaction.');
    }
  };

  const handleEditTransaction = (transaction) => {
    setCurrentTransaction(transaction);
    setTransactionForm({
      amount: transaction.amount,
      date: parseISO(transaction.date),
      description: transaction.description,
      categoryId: transaction.categoryId,
    });
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      } else {
        setError(data.message || 'Failed to delete transaction.');
      }
    } catch (err) {
      setError('Network error or server issue. ' + err.message);
    }
  };

  const openAddTransactionModal = () => {
    setCurrentTransaction(null);
    setTransactionForm({ amount: '', date: new Date(), description: '', categoryId: '' });
    setIsTransactionModalOpen(true);
  };

  const closeTransactionDialog = () => {
    setIsTransactionModalOpen(false);
    setError(null);
  };

  // --- Budget Form Handlers ---
  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setBudgetForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBudgetCategoryChange = (value) => {
    setBudgetForm(prev => ({ ...prev, category: value }));
  };

  const handleBudgetMonthChange = (value) => {
    setBudgetForm(prev => ({ ...prev, month: parseInt(value) }));
  };

  const handleBudgetYearChange = (value) => {
    setBudgetForm(prev => ({ ...prev, year: parseInt(value) }));
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    setBudgetError(null);

    if (isNaN(parseFloat(budgetForm.amount)) || parseFloat(budgetForm.amount) < 0) {
      setBudgetError('Please enter a valid non-negative amount for the budget.');
      return;
    }
    if (!budgetForm.category) {
      setBudgetError('Please select a category for the budget.');
      return;
    }

    const dataToSend = {
      ...budgetForm,
      amount: parseFloat(budgetForm.amount),
    };

    let res;
    if (currentBudget) {
      res = await fetch(`/api/budgets/${currentBudget._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
    } else {
      res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
    }

    const data = await res.json();
    if (data.success) {
      fetchAllData();
      setIsBudgetModalOpen(false);
      setBudgetForm({ category: '', amount: '', month: getMonth(new Date()) + 1, year: getYear(new Date()) });
      setCurrentBudget(null);
    } else {
      setBudgetError(data.message || 'Failed to save budget.');
    }
  };

  const handleEditBudget = (budget) => {
    setCurrentBudget(budget);
    setBudgetForm({
      // FIX: Access budget.category._id as the backend populates 'category'
      category: budget.category && typeof budget.category === 'object' ? budget.category._id : '',
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
    });
    setIsBudgetModalOpen(true);
  };

  const handleDeleteBudget = async (id) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    setBudgetError(null);
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      } else {
        setBudgetError(data.message || 'Failed to delete budget.');
      }
    } catch (err) {
      setBudgetError('Network error or server issue. ' + err.message);
    }
  };

  const openAddBudgetModal = () => {
    setCurrentBudget(null);
    setBudgetForm({ category: '', amount: '', month: getMonth(new Date()) + 1, year: getYear(new Date()) });
    setIsBudgetModalOpen(true);
  };

  const closeBudgetDialog = () => {
    setIsBudgetModalOpen(false);
    setBudgetError(null);
  };

  // --- Chart Data Preparation ---
  const monthlyExpenses = transactions.reduce((acc, transaction) => {
    const monthYear = format(parseISO(transaction.date), 'MMM yy');
    acc[monthYear] = (acc[monthYear] || 0) + transaction.amount;
    return acc;
  }, {});

  const barChartData = Object.keys(monthlyExpenses)
    .map(monthYear => ({
      name: monthYear,
      expenses: monthlyExpenses[monthYear],
    }))
    .sort((a, b) => new Date(a.name) - new Date(b.name));

  const categoryExpenses = transactions.reduce((acc, transaction) => {
    const category = categories.find(cat => cat._id === transaction.categoryId);
    if (category) {
      acc[category.name] = (acc[category.name] || 0) + transaction.amount;
    } else {
      acc['Uncategorized'] = (acc['Uncategorized'] || 0) + transaction.amount;
    }
    return acc;
  }, {});

  const pieChartData = Object.keys(categoryExpenses).map(categoryName => ({
    name: categoryName,
    value: categoryExpenses[categoryName],
    color: categories.find(cat => cat.name === categoryName)?.color || '#CCCCCC'
  }));

  // Dashboard Summary Cards
  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
  const mostRecentTransactions = transactions.slice(0, 5);

  // Budget vs Actual Comparison Chart
  const budgetVsActualData = categories.map(category => {
    if (!category || typeof category !== 'object' || !category._id) {
      console.warn("Skipping malformed category entry:", category);
      return null;
    }

    const actualSpent = transactions
      .filter(t => {
        return t.categoryId && t.categoryId === category._id &&
               getMonth(parseISO(t.date)) === getMonth(new Date()) &&
               getYear(parseISO(t.date)) === getYear(new Date());
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const budgetForCategory = budgets
      .find(b => {
        // FIX: Access b.category._id as the backend populates 'category'
        return b.category && typeof b.category === 'object' && b.category._id === category._id &&
               b.month === (getMonth(new Date()) + 1) &&
               b.year === getYear(new Date());
      });

    return {
      name: category.name,
      budget: budgetForCategory ? budgetForCategory.amount : 0,
      actual: actualSpent,
    };
  }).filter(Boolean); // Filter out any 'null' entries

  // Simple Spending Insights
  const insights = [];
  // Using current month and year from new Date()
  // const currentMonth = getMonth(new Date()) + 1; // Already available from budgetForm initialization
  // const currentYear = getYear(new Date()); // Already available from budgetForm initialization

  budgetVsActualData.forEach(item => {
    if (item.budget > 0 && item.actual > item.budget) {
      insights.push(`You are $${(item.actual - item.budget).toFixed(2)} over budget for ${item.name} this month.`);
    } else if (item.budget > 0 && item.actual < item.budget * 0.5) {
      insights.push(`You've only spent $${item.actual.toFixed(2)} out of your $${item.budget.toFixed(2)} ${item.name} budget this month. Great job saving!`);
    } else if (item.budget === 0 && item.actual > 0) {
      insights.push(`You spent $${item.actual.toFixed(2)} on ${item.name} this month without a set budget.`);
    }
  });


  if (loading) return <div className="p-8 text-center">Loading data...</div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Personal Finance Visualizer</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Transaction Error! </strong>
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.697l-2.651 2.652a1.2 1.2 0 1 1-1.697-1.697L8.303 10 5.651 7.348a1.2 1.2 0 1 1 1.697-1.697L10 8.303l2.651-2.652a1.2 1.2 0 0 1 1.697 1.697L11.697 10l2.652 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}
        {budgetError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Budget Error! </strong>
          <span className="block sm:inline">{budgetError}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setBudgetError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.697l-2.651 2.652a1.2 1.2 0 1 1-1.697-1.697L8.303 10 5.651 7.348a1.2 1.2 0 1 1 1.697-1.697L10 8.303l2.651-2.652a1.2 1.2 0 0 1 1.697 1.697L11.697 10l2.652 2.651a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across all recorded transactions</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                {pieChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                                labelLine={false}
                                // --- MODIFIED: Pie label to use formatter ---
                                label={({ name, percent }) => `${formatCategoryName(name)} ${(percent * 100).toFixed(0)}%`}
                                // --- END MODIFIED ---
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                            {/* --- MODIFIED: Legend formatter --- */}
                            <Legend layout="vertical" verticalAlign="middle" align="right" formatter={formatCategoryName} />
                            {/* --- END MODIFIED --- */}
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-gray-500 text-sm">No category data to display pie chart.</p>
                )}
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Monthly Expenses Bar Chart */}
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Monthly Expenses</h2>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  // --- ADDED: tickFormatter for category shortcuts ---
                  tickFormatter={formatCategoryName}
                  angle={-45} // Optional: Angle labels for better readability
                  textAnchor="end" // Optional: Adjust text alignment for angled labels
                  height={60} // Optional: Adjust height to accommodate angled labels
                  // --- END ADDED ---
                />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="expenses" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No transaction data to display chart.</p>
          )}
        </div>

        {/* Budget vs Actual Comparison Chart */}
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Budget vs Actual (This Month)</h2>
          {budgetVsActualData.filter(item => item.budget > 0 || item.actual > 0).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetVsActualData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickFormatter={formatCategoryName}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip
                  // --- MODIFIED LINE BELOW: Corrected formatter logic ---
                  formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'budget' ? 'Budget' : name === 'actual' ? 'Actual Spent' : name]}
                  // --- END MODIFIED ---
                  labelFormatter={formatCategoryName}
                />
                <Legend />
                <Bar dataKey="budget" fill="#82ca9d" name="Budget" />
                <Bar dataKey="actual" fill="#ffc658" name="Actual Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No budget or spending data for this month to display chart.</p>
          )}
        </div>
      </div>

      {/* Simple Spending Insights */}
      <div className="p-6 border rounded-lg shadow-sm mb-8">
        <h2 className="text-2xl font-semibold mb-4">Spending Insights (This Month)</h2>
        {insights.length > 0 ? (
          <ul className="list-disc list-inside space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="text-gray-700">{insight}</li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No specific insights for this month yet. Keep tracking your expenses!</p>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        <Button onClick={openAddTransactionModal}>Add New Transaction</Button>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm mb-8">
        {transactions.length > 0 ? (
          <Table>
            <TableHeader>
              {/* COMPRESSED: Removed whitespace between TableHead tags */}
              <TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                // COMPRESSED: Removed whitespace between TableCell tags
                <TableRow key={transaction._id}><TableCell>{format(parseISO(transaction.date), 'PPP')}</TableCell><TableCell>{transaction.description}</TableCell><TableCell>{transaction.categoryName}</TableCell><TableCell className="text-right">${transaction.amount.toFixed(2)}</TableCell><TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditTransaction(transaction)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTransaction(transaction._id)}>Delete</Button>
                  </TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="p-4 text-center text-gray-500">No transactions recorded yet. Add one to get started!</p>
        )}
      </div>

      {/* Budget Management Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Monthly Budgets</h2>
        <Button onClick={openAddBudgetModal}>Set New Budget</Button>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        {budgets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow><TableHead>Category</TableHead><TableHead>Month</TableHead><TableHead>Year</TableHead><TableHead className="text-right">Budget Amount</TableHead><TableHead className="text-right">Actual Spent (This Month)</TableHead><TableHead className="text-right">Progress</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget) => {
                  // Defensive check: if budget.category is not an object or missing _id, skip
                  if (!budget.category || typeof budget.category !== 'object' || !budget.category._id) {
                    console.warn("Skipping malformed budget entry (missing populated category):", budget);
                    return null; // Return null for malformed entries
                  }

                  const actualSpent = transactions
                  .filter(t => t.categoryId === budget.category._id && // FIX: Use budget.category._id
                  getMonth(parseISO(t.date)) + 1 === budget.month &&
                  getYear(parseISO(t.date)) === budget.year)
                  .reduce((sum, t) => sum + t.amount, 0);

                  const percentage = budget.amount > 0 ? (actualSpent / budget.amount) * 100 : (actualSpent > 0 ? 100 : 0);
                  const progressColor = percentage > 100 ? "bg-red-500" : "bg-primary";

                  return (
                    // FIX: Compressed TableRow content to remove whitespace causing hydration errors
                    <TableRow key={budget._id}><TableCell>{budget.category.name}</TableCell><TableCell>{months.find(m => m.value === budget.month)?.label}</TableCell><TableCell>{budget.year}</TableCell><TableCell className="text-right">${budget.amount.toFixed(2)}</TableCell><TableCell className="text-right">${actualSpent.toFixed(2)}</TableCell><TableCell className="w-[120px]"><Progress value={Math.min(percentage, 100)} className={progressColor} /><span className="text-xs text-gray-500">{percentage.toFixed(0)}%</span></TableCell><TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditBudget(budget)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteBudget(budget._id)}>Delete</Button>
                      </TableCell></TableRow>
                  );
                }).filter(Boolean)} {/* Filter out any 'null' entries */}
              </TableBody>
          </Table>
        ) : ( <p className="p-4 text-center text-gray-500">No budgets set yet. Set one to start tracking!</p> )}
      </div>

      {/* Transaction Modal */}
      <Dialog open={isTransactionModalOpen} onOpenChange={closeTransactionDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentTransaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransactionSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={transactionForm.amount}
                onChange={handleTransactionChange}
                required
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !transactionForm.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {transactionForm.date ? format(transactionForm.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={transactionForm.date}
                    onSelect={handleTransactionDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select onValueChange={handleTransactionCategoryChange} value={transactionForm.categoryId} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input
                id="description"
                name="description"
                value={transactionForm.description}
                onChange={handleTransactionChange}
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button type="submit">{currentTransaction ? 'Save Changes' : 'Add Transaction'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Budget Modal */}
      <Dialog open={isBudgetModalOpen} onOpenChange={closeBudgetDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentBudget ? 'Edit Budget' : 'Set New Monthly Budget'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBudgetSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budgetCategory" className="text-right">Category</Label>
              <Select onValueChange={handleBudgetCategoryChange} value={budgetForm.category} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budgetAmount" className="text-right">Budget Amount</Label>
              <Input
                id="budgetAmount"
                name="amount"
                type="number"
                step="0.01"
                value={budgetForm.amount}
                onChange={handleBudgetChange}
                required
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budgetMonth" className="text-right">Month</Label>
              <Select onValueChange={handleBudgetMonthChange} value={String(budgetForm.month)} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={String(month.value)}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budgetYear" className="text-right">Year</Label>
              <Select onValueChange={handleBudgetYearChange} value={String(budgetForm.year)} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{currentBudget ? 'Save Changes' : 'Set Budget'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}