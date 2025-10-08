// File Path: app/api/expenses/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '../../../lib/dbConnect';
import Expense from '../../../models/Expense'; // Correctly import the Expense model
import { NextResponse } from 'next/server';

async function getSession() {
  return await getServerSession(authOptions);
}

// GET handler to fetch all expenses for the logged-in user
export async function GET(request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    // Find expenses for the current user and populate the category details
    const expenses = await Expense.find({ userId: session.user.id }).populate('categoryId');
    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch expenses.' }, { status: 500 });
  }
}

// POST handler to create a new expense for the logged-in user
export async function POST(request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await request.json();
    
    // Combine the form data with the user's ID to link the expense to the user
    const expenseData = { ...body, userId: session.user.id };
    
    const newExpense = await Expense.create(expenseData);
    return NextResponse.json({ success: true, data: newExpense }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create expense.' }, { status: 400 });
  }
}

