// File Path: app/api/expenses/[id]/route.js
import { auth } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '../../../../lib/dbConnect';
import Expense from '../../../../models/Expense';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await request.json();
  const expense = await Expense.findOneAndUpdate({ _id: params.id, userId: session.user.id }, body, { new: true, runValidators: true });
  if (!expense) return NextResponse.json({ success: false, message: 'Expense not found or unauthorized.' }, { status: 404 });
  return NextResponse.json({ success: true, data: expense });
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const deleted = await Expense.deleteOne({ _id: params.id, userId: session.user.id });
  if (deleted.deletedCount === 0) return NextResponse.json({ success: false, message: 'Expense not found or unauthorized.' }, { status: 404 });
  return NextResponse.json({ success: true, message: 'Expense deleted successfully.' });
}

