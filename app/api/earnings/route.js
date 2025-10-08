// File Path: app/api/earnings/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // Correct import path
import dbConnect from '../../../lib/dbConnect';
import Earning from '../../../models/Earning';
import { NextResponse } from 'next/server';

async function getSession() {
  return await getServerSession(authOptions);
}

// GET handler
export async function GET(request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    try {
        const earnings = await Earning.find({ userId: session.user.id });
        return NextResponse.json({ success: true, data: earnings });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to fetch earnings.' }, { status: 500 });
    }
}

// POST handler
export async function POST(request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    try {
        const body = await request.json();
        const { amount, month, year } = body;
        const earning = await Earning.findOneAndUpdate(
            { userId: session.user.id, month, year },
            { amount },
            { new: true, upsert: true, runValidators: true }
        );
        return NextResponse.json({ success: true, data: earning }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to save earning.' }, { status: 400 });
    }
}

