// File Path: app/api/expenses/route.js
import { getServerSession } from 'next-auth/next';
// THE FIX: Import from the correct, combined route handler.
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '../../../lib/dbConnect';
import Expense from '../../../models/Expense';
import { NextResponse } from 'next/server';

async function getSession() {
  return await getServerSession(authOptions);
}

// GET handler
export async function GET(request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  
  try {
    const expenses = await Expense.find({ userId: session.user.id }).populate('categoryId');
    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch expenses.' }, { status: 500 });
  }
}

// POST handler
export async function POST(request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  try {
    const body = await request.json();
    const expenseData = { ...body, userId: session.user.id };
    const newExpense = await Expense.create(expenseData);
    return NextResponse.json({ success: true, data: newExpense }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create expense.' }, { status: 400 });
  }
}
