// File Path: app/api/budgets/route.js
import { auth } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '../../../lib/dbConnect';
import Budget from '../../../models/Budget';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const budgets = await Budget.find({ userId: session.user.id }).populate('category');
  return NextResponse.json({ success: true, data: budgets });
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  
  await dbConnect();
  const body = await request.json();
  const newBudget = await Budget.create({ ...body, userId: session.user.id });
  return NextResponse.json({ success: true, data: newBudget }, { status: 201 });
}

