// app/api/expenses/[id]/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '../../../../lib/dbConnect';
import Expense from '../../../../models/Expense'; // Changed from Transaction
import { NextResponse } from 'next/server';

async function getSession() {
  return await getServerSession(authOptions);
}

export async function PUT(request, { params }) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  try {
    const body = await request.json();
    const expense = await Expense.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      body,
      { new: true, runValidators: true }
    );
    if (!expense) {
      return NextResponse.json({ success: false, message: 'Expense not found or unauthorized.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update expense.' }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  try {
    const deletedExpense = await Expense.deleteOne({ _id: params.id, userId: session.user.id });
    if (deletedExpense.deletedCount === 0) {
      return NextResponse.json({ success: false, message: 'Expense not found or unauthorized.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Expense deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete expense.' }, { status: 400 });
  }
}
