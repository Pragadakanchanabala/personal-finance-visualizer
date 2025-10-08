// File Path: app/api/budgets/[id]/route.js
import { auth } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '../../../../lib/dbConnect';
import Budget from '../../../../models/Budget';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await request.json();
  const budget = await Budget.findOneAndUpdate({ _id: params.id, userId: session.user.id }, body, { new: true, runValidators: true });
  if (!budget) return NextResponse.json({ success: false, message: 'Budget not found or unauthorized.' }, { status: 404 });
  return NextResponse.json({ success: true, data: budget });
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const deleted = await Budget.deleteOne({ _id: params.id, userId: session.user.id });
  if (deleted.deletedCount === 0) return NextResponse.json({ success: false, message: 'Budget not found or unauthorized.' }, { status: 404 });
  return NextResponse.json({ success: true, message: 'Budget deleted successfully.' });
}

