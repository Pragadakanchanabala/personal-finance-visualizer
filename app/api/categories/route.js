// File Path: app/api/categories/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // Correct import path
import dbConnect from '../../../lib/dbConnect';
import Category from '../../../models/Category';
import { NextResponse } from 'next/server';

// Security Check: Still require a user to be logged in to interact with categories
async function getSession() {
  return await getServerSession(authOptions);
}

export async function GET(request) {
  const session = await getSession();
  if (!session) { // User must be logged in to see categories
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    // Fetches ALL categories, not filtered by user
    const categories = await Category.find({});
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch categories.' }, { status: 400 });
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session) { // User must be logged in to create a category
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await request.json();
    // Creates a new global category, no userId is attached
    const category = await Category.create(body);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
     if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'A category with this name already exists.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Failed to create category.' }, { status: 400 });
  }
}

