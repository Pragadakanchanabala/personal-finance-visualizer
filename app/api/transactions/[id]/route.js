// app/api/transactions/[id]/route.js
import dbConnect from '../../../../lib/dbConnect';
import Transaction from '../../../../models/Transaction';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return NextResponse.json({ success: false, message: 'Transaction not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    const body = await request.json();
    const transaction = await Transaction.findByIdAndUpdate(id, body, {
      new: true, // Return the modified document rather than the original
      runValidators: true, // Run schema validators on update
    });
    if (!transaction) {
      return NextResponse.json({ success: false, message: 'Transaction not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return NextResponse.json({ success: false, message: errors.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = params;
  try {
    const deletedTransaction = await Transaction.deleteOne({ _id: id });
    if (!deletedTransaction.deletedCount) {
      return NextResponse.json({ success: false, message: 'Transaction not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Transaction deleted successfully.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}