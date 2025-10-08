// File Path: app/api/expenses/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '../../../lib/dbConnect';
import Expense from '../../../models/Expense';
import { NextResponse } from 'next/server';

async function getSession() { return await getServerSession(authOptions); }

export async function GET(request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const expenses = await Expense.find({ userId: session.user.id }).populate('categoryId').sort({ date: -1 });
  return NextResponse.json({ success: true, data: expenses });
}

export async function POST(request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const body = await request.json();
  const newExpense = await Expense.create({ ...body, userId: session.user.id });
  return NextResponse.json({ success: true, data: newExpense }, { status: 201 });
}

