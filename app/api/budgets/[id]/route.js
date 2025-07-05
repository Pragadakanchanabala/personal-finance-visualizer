// app/api/budgets/[id]/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Budget from '@/models/Budget';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params; // Get ID from dynamic route segment
    const budget = await Budget.findById(id).populate('category'); // Populate for single fetch too
    
    if (!budget) {
      return NextResponse.json({ success: false, message: "Budget not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error("Error fetching single budget:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch budget.", error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params; // Get ID from dynamic route segment
    
    const body = await request.json();
    const updatedBudget = await Budget.findByIdAndUpdate(id, body, { new: true, runValidators: true }); // Add runValidators for schema validation
    
    if (!updatedBudget) {
      return NextResponse.json({ success: false, message: "Budget not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updatedBudget });
  } catch (error) {
    console.error("Error updating budget:", error);
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return NextResponse.json({ success: false, message: errors.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to update budget.", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params; // Get ID from dynamic route segment

    const deletedBudget = await Budget.findByIdAndDelete(id); // Use findByIdAndDelete directly
    if (!deletedBudget) {
      return NextResponse.json({ success: false, message: "Budget not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Budget deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json({ success: false, message: "Failed to delete budget.", error: error.message }, { status: 500 });
  }
}