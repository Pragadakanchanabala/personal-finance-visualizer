// app/api/transactions/route.js
import dbConnect from '../../../lib/dbConnect';
import Transaction from '../../../models/Transaction';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await dbConnect();
  try {
    const transactions = await Transaction.find({}).sort({ date: -1 }); // Sort by date descending
    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const transaction = await Transaction.create(body);
    return NextResponse.json({ success: true, data: transaction }, { status: 201 });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return NextResponse.json({ success: false, message: errors.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}