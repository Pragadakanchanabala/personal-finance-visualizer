// app/api/categories/route.js
import dbConnect from '../../../lib/dbConnect';
import Category from '../../../models/Category';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await dbConnect();
    const categories = await Category.find({});
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const category = await Category.create(body);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error (for unique name)
        return NextResponse.json({ success: false, message: 'Category name already exists.' }, { status: 400 });
    }
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return NextResponse.json({ success: false, message: errors.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}