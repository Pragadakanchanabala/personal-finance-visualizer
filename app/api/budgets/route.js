// app/api/budgets/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Budget from '@/models/Budget';
// Category model is not strictly needed here if just populating, but good to keep if schema validation indirectly uses it.
// import Category from '@/models/Category'; 

export async function GET() {
  try {
    await dbConnect();
    // Ensure 'category' is populated so frontend gets the full category object
    const budgets = await Budget.find({}).populate('category'); 
    return NextResponse.json({ success: true, data: budgets });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch budgets.", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    // Assuming 'category' field in body is the Category's _id
    const newBudget = await Budget.create(body);
    return NextResponse.json({ success: true, data: newBudget }, { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json({ success: false, message: "Failed to create budget.", error: error.message }, { status: 500 });
  }
}