// File Path: app/api/categories/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '../../../lib/dbConnect';
import Category from '../../../models/Category';
import { NextResponse } from 'next/server';

async function getSession() { return await getServerSession(authOptions); }

export async function GET(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const categories = await Category.find({});
  return NextResponse.json({ success: true, data: categories });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  try {
    const body = await request.json();
    const category = await Category.create(body);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) return NextResponse.json({ success: false, message: 'A category with this name already exists.' }, { status: 400 });
    return NextResponse.json({ success: false, message: 'Failed to create category.' }, { status: 400 });
  }
}

