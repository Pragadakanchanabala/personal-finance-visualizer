// File Path: app/api/budgets/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Corrected import path
import dbConnect from '../../../lib/dbConnect';
import Budget from '../../../models/Budget';
import { NextResponse } from 'next/server';

async function getSession() { return await getServerSession(authOptions); }

export async function GET(request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const budgets = await Budget.find({ userId: session.user.id }).populate('category');
  return NextResponse.json({ success: true, data: budgets });
}

export async function POST(request) {
  const session = await getSession();
  if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const body = await request.json();
  const newBudget = await Budget.create({ ...body, userId: session.user.id });
  return NextResponse.json({ success: true, data: newBudget }, { status: 201 });
}

