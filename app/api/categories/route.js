// File Path: app/api/categories/route.js
import { auth } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '../../../lib/dbConnect';
import Category from '../../../models/Category';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = await auth();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const categories = await Category.find({});
  return NextResponse.json({ success: true, data: categories });
}

export async function POST(request) {
  const session = await auth();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await request.json();
  const category = await Category.create(body);
  return NextResponse.json({ success: true, data: category }, { status: 201 });
}

