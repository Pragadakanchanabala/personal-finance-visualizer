// File Path: app/api/budgets/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // Corrected import path
import dbConnect from '../../../lib/dbConnect';
import Budget from '../../../models/Budget';
import { NextResponse } from 'next/server';

async function getSession() {
  return await getServerSession(authOptions);
}

export async function GET(request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    try {
        const budgets = await Budget.find({ userId: session.user.id }).populate('category');
        return NextResponse.json({ success: true, data: budgets });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to fetch budgets.' }, { status: 400 });
    }
}

export async function POST(request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    try {
        const body = await request.json();
        const budgetData = { ...body, userId: session.user.id };
        const budget = await Budget.create(budgetData);
        return NextResponse.json({ success: true, data: budget }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to create budget.' }, { status: 400 });
    }
}

