// app/page.js
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { CalendarIcon, TrendingUp, TrendingDown, Wallet, Landmark, PiggyBank, AlertTriangle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const categoryShortcuts = {
  'Groceries': 'Gro', 'Utilities': 'Uti', 'Rent': 'Ren', 'Entertainment': 'Ent',
  'Transport': 'Tra', 'Dining Out': 'Din', 'Healthcare': 'Hea', 'Salary': 'Sal',
  'Miscellaneous': 'Mis', 'Uncategorized': 'Unc',
};
const formatCategoryName = (name) => categoryShortcuts[name] || name;

export default function Home() {
  const { data: session, status } = useSession();

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [earnings, setEarnings] = useState([]);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEarningModalOpen, setIsEarningModalOpen] = useState(false);

  const [currentExpense, setCurrentExpense] = useState(null);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);

  const [expenseForm, setExpenseForm] = useState({ amount: '', date: new Date(), description: '', categoryId: '' });
  const [budgetForm, setBudgetForm] = useState({ category: '', amount: '', month: getMonth(new Date()) + 1, year: getYear(new Date()) });
  const [categoryForm, setCategoryForm] = useState({ name: '', color: '#8884d8' });
  const [earningForm, setEarningForm] = useState({ amount: '', month: getMonth(new Date()) + 1, year: getYear(new Date()) });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState({ month: getMonth(new Date()) + 1, year: getYear(new Date()) });

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: format(new Date(0, i), 'MMMM') }));
  const years = Array.from({ length: getYear(new Date()) - 2023 }, (_, i) => getYear(new Date()) - i);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAllData();
    }
  }, [status]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, expensesRes, budgetsRes, earningsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/expenses'),
        fetch('/api/budgets'),
        fetch('/api/earnings'),
      ]);
      const [categoriesData, expensesData, budgetsData, earningsData] = await Promise.all([
        categoriesRes.json(),
        expensesRes.json(),
        budgetsRes.json(),
        earningsRes.json(),
      ]);

      if (categoriesData.success) setCategories(categoriesData.data);
      if (expensesData.success) setExpenses(expensesData.data.map(e => ({ ...e, categoryName: e.categoryId?.name || 'Uncategorized' })));
      if (budgetsData.success) setBudgets(budgetsData.data);
      if (earningsData.success) setEarnings(earningsData.data);

    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFormChange = (setter) => (e) => setter(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (setter, field) => (value) => setter(prev => ({ ...prev, [field]: value }));
  const handleDateChange = (setter, field) => (date) => setter(prev => ({ ...prev, [field]: date }));

  const openAddEarningModal = () => {
    const currentEarning = earnings.find(e => e.month === selectedDate.month && e.year === selectedDate.year);
    setEarningForm({ amount: currentEarning?.amount || '', month: selectedDate.month, year: selectedDate.year });
    setIsEarningModalOpen(true);
  };
  
  const openAddExpenseModal = () => {
    setCurrentExpense(null);
    setExpenseForm({ amount: '', date: new Date(), description: '', categoryId: '' });
    setIsExpenseModalOpen(true);
  };

  const openAddBudgetModal = () => {
    setCurrentBudget(null);
    setBudgetForm({ category: '', amount: '', month: selectedDate.month, year: selectedDate.year });
    setIsBudgetModalOpen(true);
  };

  const openAddCategoryModal = () => {
    setCurrentCategory(null);
    setCategoryForm({ name: '', color: '#8884d8' });
    setIsCategoryModalOpen(true);
  };

  const handleEditExpense = (exp) => {
    setCurrentExpense(exp);
    setExpenseForm({ amount: exp.amount, date: parseISO(exp.date), description: exp.description, categoryId: exp.categoryId?._id });
    setIsExpenseModalOpen(true);
  };
  
  const handleEditBudget = (b) => {
    setCurrentBudget(b);
    setBudgetForm({ category: b.category?._id, amount: b.amount, month: b.month, year: b.year });
    setIsBudgetModalOpen(true);
  };

  const handleEditCategory = (cat) => {
    setCurrentCategory(cat);
    setCategoryForm({ name: cat.name, color: cat.color });
    setIsCategoryModalOpen(true);
  };
  
  const handleApiSubmit = async (url, method, body, callback) => {
    setError(null);
    console.log(`🚀 Sending API request: ${method} ${url}`, body);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      console.log(`🚦 API Response Status: ${res.status}`);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ API Error Response Body:', errorText);
        setError(`API Error: ${res.statusText} (${res.status}). See console for details.`);
        return;
      }

      const data = await res.json();
      console.log('📦 API Response Data:', data);

      if (data.success) {
        console.log('✅ Success! Refetching all data.');
        fetchAllData();
        callback();
      } else {
        console.error('❌ API returned success:false. Message:', data.message);
        setError(data.message || 'An unknown error occurred.');
      }
    } catch (err) {
      console.error('💥 Uncaught Fetch Error:', err);
      setError('A network or parsing error occurred. Please check the browser console.');
    }
  };

  const handleExpenseSubmit = (e) => { e.preventDefault(); handleApiSubmit(currentExpense ? `/api/expenses/${currentExpense._id}` : '/api/expenses', currentExpense ? 'PUT' : 'POST', { ...expenseForm, amount: parseFloat(expenseForm.amount) }, () => setIsExpenseModalOpen(false)); };
  const handleBudgetSubmit = (e) => { e.preventDefault(); handleApiSubmit(currentBudget ? `/api/budgets/${currentBudget._id}` : '/api/budgets', currentBudget ? 'PUT' : 'POST', { ...budgetForm, amount: parseFloat(budgetForm.amount) }, () => setIsBudgetModalOpen(false)); };
  const handleCategorySubmit = (e) => { e.preventDefault(); handleApiSubmit(currentCategory ? `/api/categories/${currentCategory._id}` : '/api/categories', currentCategory ? 'PUT' : 'POST', categoryForm, () => setIsCategoryModalOpen(false)); };
  const handleEarningSubmit = (e) => { e.preventDefault(); handleApiSubmit('/api/earnings', 'POST', { ...earningForm, amount: parseFloat(earningForm.amount) }, () => setIsEarningModalOpen(false)); };

  const handleDelete = async (type, id) => { if (confirm('Are you sure?')) { await fetch(`/api/${type}/${id}`, { method: 'DELETE' }); fetchAllData(); } };
  
  const { monthlyPieChartData, monthlyBudgetVsActualData, monthlyInsights, budgetAlert } = useMemo(() => {
    const monthlyExpenses = expenses.filter(e => getMonth(parseISO(e.date)) + 1 === selectedDate.month && getYear(parseISO(e.date)) === selectedDate.year);
    const pieData = Object.values(monthlyExpenses.reduce((acc, e) => {
      if (e.categoryName !== 'Uncategorized') {
        if (!acc[e.categoryName]) acc[e.categoryName] = { name: e.categoryName, value: 0, color: categories.find(c => c.name === e.categoryName)?.color || '#CCCCCC' };
        acc[e.categoryName].value += e.amount;
      }
      return acc;
    }, {}));
    const budgetVsActual = categories.map(cat => {
      const actualSpent = monthlyExpenses.filter(e => e.categoryId?._id === cat._id).reduce((sum, e) => sum + e.amount, 0);
      const budgetForCategory = budgets.find(b => b.category?._id === cat._id && b.month === selectedDate.month && b.year === selectedDate.year);
      return { name: cat.name, Budget: budgetForCategory?.amount || 0, 'Actual Spent': actualSpent };
    }).filter(item => item.Budget > 0 || item['Actual Spent'] > 0);
    const totalBudget = budgetVsActual.reduce((sum, item) => sum + item.Budget, 0);
    const totalSpent = budgetVsActual.reduce((sum, item) => sum + item['Actual Spent'], 0);
    
    const monthlyEarning = earnings.find(e => e.month === selectedDate.month && e.year === selectedDate.year)?.amount || 0;
    const difference = monthlyEarning - totalSpent;
    
    const newBudgetTotal = budgets.filter(b => b.month === budgetForm.month && b.year === budgetForm.year && b.category !== (currentBudget?.category?._id || budgetForm.category)).reduce((sum, b) => sum + b.amount, 0) + (parseFloat(budgetForm.amount) || 0);
    const budgetAlert = monthlyEarning > 0 && newBudgetTotal > monthlyEarning ? `Warning: Your total budget of $${newBudgetTotal.toFixed(2)} for this month exceeds your earnings of $${monthlyEarning.toFixed(2)}.` : null;

    return { monthlyPieChartData: pieData, monthlyBudgetVsActualData: budgetVsActual, monthlyInsights: { totalBudget, totalSpent, difference, monthlyEarning }, budgetAlert };
  }, [expenses, budgets, categories, selectedDate, earnings, budgetForm, currentBudget]);
  
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (status === "loading") return <div className="flex items-center justify-center min-h-screen bg-slate-50">Loading...</div>;
  if (!session) return <div className="flex h-full items-center justify-center bg-slate-100"><Card className="w-full max-w-sm p-8"><CardHeader className="text-center"><CardTitle className="text-2xl">Finance Visualizer</CardTitle></CardHeader><CardContent><Button className="w-full" size="lg" onClick={() => signIn("google")}>Sign in with Google</Button></CardContent></Card></div>;

  return (
    <main className="bg-slate-50 min-h-screen">
      <header className="bg-white border-b sticky top-0 z-10"><div className="container mx-auto p-4 flex justify-between items-center"><h1 className="text-xl font-bold">Finance Dashboard</h1><div><span className="mr-4 text-sm text-slate-600 hidden sm:inline">Welcome, {session.user.name}!</span><Button variant="outline" size="sm" onClick={() => signOut()}>Sign Out</Button></div></div></header>
      <div className="container mx-auto p-4 md:p-8">
        {!loading && (
          <div className="space-y-8">
            <Card><CardHeader className="flex flex-row justify-between items-center"><CardTitle>Monthly Snapshot</CardTitle><Button variant="outline" onClick={openAddEarningModal}>Set Monthly Earnings</Button></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"><div className="md:col-span-1"><Label>Month</Label><Select value={String(selectedDate.month)} onValueChange={handleSelectChange(setSelectedDate, 'month')}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent></Select></div><div className="md:col-span-1"><Label>Year</Label><Select value={String(selectedDate.year)} onValueChange={handleSelectChange(setSelectedDate, 'year')}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center p-4 bg-slate-100 rounded-lg"><div className="flex flex-col items-center justify-center"><Landmark className="w-8 h-8 text-slate-500 mb-2"/><p className="text-sm text-muted-foreground">Monthly Earnings</p><p className="text-2xl font-bold">${monthlyInsights.monthlyEarning.toFixed(2)}</p></div><div className="flex flex-col items-center justify-center"><Wallet className="w-8 h-8 text-slate-500 mb-2"/><p className="text-sm text-muted-foreground">Total Spent</p><p className="text-2xl font-bold">${monthlyInsights.totalSpent.toFixed(2)}</p></div><div className={`flex flex-col items-center justify-center rounded-lg p-4 ${monthlyInsights.difference >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{monthlyInsights.difference >= 0 ? <PiggyBank className="w-8 h-8 mb-2"/> : <TrendingDown className="w-8 h-8 mb-2"/>}<p className="text-sm">{monthlyInsights.difference >= 0 ? 'Net Savings' : 'Net Deficit'}</p><p className="text-2xl font-bold">${Math.abs(monthlyInsights.difference).toFixed(2)}</p></div></div></CardContent></Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card><CardHeader><CardTitle>Expense Breakdown for {months.find(m=>m.value===selectedDate.month)?.label}</CardTitle></CardHeader><CardContent>{monthlyPieChartData.length > 0 ? <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={monthlyPieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>{monthlyPieChartData.map((e, i) => <Cell key={`cell-${i}`} fill={e.color} />)}</Pie><Tooltip formatter={(v) => `$${v.toFixed(2)}`}/><Legend formatter={formatCategoryName} /></PieChart></ResponsiveContainer> : <p className="text-center text-slate-500 py-10">No expenses this month.</p>}</CardContent></Card>
              <Card><CardHeader><CardTitle>Budget vs. Spent for {months.find(m=>m.value===selectedDate.month)?.label}</CardTitle></CardHeader><CardContent>{monthlyBudgetVsActualData.length > 0 ? <ResponsiveContainer width="100%" height={250}><BarChart data={monthlyBudgetVsActualData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tickFormatter={formatCategoryName} /><YAxis /><Tooltip formatter={(v) => `$${v.toFixed(2)}`}/><Legend /><Bar dataKey="Budget" fill="#8884d8" /><Bar dataKey="Actual Spent" fill="#82ca9d" /></BarChart></ResponsiveContainer> : <p className="text-center text-slate-500 py-10">No data for this month.</p>}</CardContent></Card>
            </div>

            <section><div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold tracking-tight text-slate-800">All Expenses (Total: ${totalExpenses.toFixed(2)})</h2><Button onClick={openAddExpenseModal}>Add Expense</Button></div><Card><CardContent className="p-0">{expenses.length > 0 ? <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{expenses.map(e => <TableRow key={e._id}><TableCell>{format(parseISO(e.date), 'PPP')}</TableCell><TableCell>{e.description}</TableCell><TableCell>{e.categoryName}</TableCell><TableCell className="text-right">${e.amount.toFixed(2)}</TableCell><TableCell className="text-right"><Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditExpense(e)}>Edit</Button><Button variant="destructive" size="sm" onClick={() => handleDelete( 'expenses', e._id)}>Delete</Button></TableCell></TableRow>)}</TableBody></Table> : <p className="p-6 text-center text-gray-500">No expenses recorded yet.</p>}</CardContent></Card></section>
            
            <section className="space-y-4"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold tracking-tight text-slate-800">All Monthly Budgets</h2><Button onClick={openAddBudgetModal}>Set Budget</Button></div><Card><CardContent className="p-0">{budgets.length > 0 ? <Table><TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Month</TableHead><TableHead>Year</TableHead><TableHead className="text-right">Budget</TableHead><TableHead className="text-right">Spent</TableHead><TableHead>Progress</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{budgets.map(b => { if (!b.category) return null; const spent = expenses.filter(e => e.categoryId?._id === b.category._id && getMonth(parseISO(e.date)) + 1 === b.month && getYear(parseISO(e.date)) === b.year).reduce((s, e) => s + e.amount, 0); const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0; return ( <TableRow key={b._id}><TableCell>{b.category.name}</TableCell><TableCell>{months.find(m=>m.value===b.month)?.label}</TableCell><TableCell>{b.year}</TableCell><TableCell className="text-right">${b.amount.toFixed(2)}</TableCell><TableCell className="text-right">${spent.toFixed(2)}</TableCell><TableCell className="w-[120px]"><Progress value={Math.min(pct, 100)} className={pct > 100 ? "bg-red-500" : ""} /><span className="text-xs ml-2">{pct.toFixed(0)}%</span></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditBudget(b)}>Edit</Button><Button variant="destructive" size="sm" onClick={() => handleDelete('budgets', b._id)}>Delete</Button></TableCell></TableRow> ); }).filter(Boolean)}</TableBody></Table> : <p className="p-6 text-center text-gray-500">No budgets set yet.</p>}</CardContent></Card></section>
            
            <section className="space-y-4"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold tracking-tight text-slate-800">Manage Categories</h2><Button onClick={openAddCategoryModal}>Add Category</Button></div><Card><CardContent className="p-0">{categories.length > 0 ? <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Color</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{categories.map(cat => <TableRow key={cat._id}><TableCell>{cat.name}</TableCell><TableCell><div className="w-6 h-6 rounded-full border" style={{ backgroundColor: cat.color }}></div></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditCategory(cat)}>Edit</Button><Button variant="destructive" size="sm" onClick={() => handleDelete('categories', cat._id)}>Delete</Button></TableCell></TableRow>)}</TableBody></Table> : <p className="p-6 text-center text-gray-500">No categories created yet.</p>}</CardContent></Card></section>
          </div>
        )}
        
        {/* Modals */}
        <Dialog open={isEarningModalOpen} onOpenChange={() => setIsEarningModalOpen(false)}><DialogContent><DialogHeader><DialogTitle>Set Earnings for {months.find(m=>m.value===earningForm.month)?.label} {earningForm.year}</DialogTitle></DialogHeader><form onSubmit={handleEarningSubmit} className="grid gap-4 py-4"><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="earning-amount" className="text-right">Amount</Label><Input id="earning-amount" name="amount" type="number" value={earningForm.amount} onChange={handleFormChange(setEarningForm)} required className="col-span-3"/></div><DialogFooter><Button type="submit">Save Earnings</Button></DialogFooter></form></DialogContent></Dialog>
        <Dialog open={isCategoryModalOpen} onOpenChange={() => setIsCategoryModalOpen(false)}><DialogContent><DialogHeader><DialogTitle>{currentCategory ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader><form onSubmit={handleCategorySubmit} className="grid gap-4 py-4"><div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Name</Label><Input name="name" value={categoryForm.name} onChange={handleFormChange(setCategoryForm)} className="col-span-3" required /></div><div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Color</Label><Input name="color" type="color" value={categoryForm.color} onChange={handleFormChange(setCategoryForm)} className="col-span-3" /></div><DialogFooter><Button type="submit">Save</Button></DialogFooter></form></DialogContent></Dialog>
        <Dialog open={isExpenseModalOpen} onOpenChange={() => setIsExpenseModalOpen(false)}><DialogContent><DialogHeader><DialogTitle>{currentExpense ? 'Edit' : 'Add'} Expense</DialogTitle></DialogHeader><form onSubmit={handleExpenseSubmit} className="grid gap-4 py-4"><div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Amount</Label><Input name="amount" type="number" value={expenseForm.amount} onChange={handleFormChange(setExpenseForm)} required className="col-span-3"/></div><div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className={cn("col-span-3", !expenseForm.date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{expenseForm.date ? format(expenseForm.date, "PPP") : "Pick date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={expenseForm.date} onSelect={handleDateChange(setExpenseForm, 'date')} /></PopoverContent></Popover></div><div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Category</Label><Select onValueChange={handleSelectChange(setExpenseForm, 'categoryId')} value={expenseForm.categoryId}><SelectTrigger className="col-span-3"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent></Select></div><div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Description</Label><Input name="description" value={expenseForm.description} onChange={handleFormChange(setExpenseForm)} className="col-span-3"/></div><DialogFooter><Button type="submit">Save</Button></DialogFooter></form></DialogContent></Dialog>
        <Dialog open={isBudgetModalOpen} onOpenChange={() => setIsBudgetModalOpen(false)}><DialogContent><DialogHeader><DialogTitle>{currentBudget ? 'Edit' : 'Set'} Budget</DialogTitle></DialogHeader><form onSubmit={handleBudgetSubmit} className="grid gap-4 py-4">{budgetAlert && <div className="col-span-4 flex items-center gap-2 rounded-md bg-yellow-100 p-3 text-sm text-yellow-800"><AlertTriangle className="h-4 w-4" />{budgetAlert}</div>}<div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Category</Label><Select onValueChange={handleSelectChange(setBudgetForm, 'category')} value={budgetForm.category}><SelectTrigger className="col-span-3"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent></Select></div><div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Amount</Label><Input name="amount" type="number" value={budgetForm.amount} onChange={handleFormChange(setBudgetForm)} required className="col-span-3"/></div><div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Month</Label><Select onValueChange={handleSelectChange(setBudgetForm, 'month')} value={String(budgetForm.month)}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent>{months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent></Select></div><div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Year</Label><Select onValueChange={handleSelectChange(setBudgetForm, 'year')} value={String(budgetForm.year)}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select></div><DialogFooter><Button type="submit">Save</Button></DialogFooter></form></DialogContent></Dialog>
      </div>
    </main>
  );
}


