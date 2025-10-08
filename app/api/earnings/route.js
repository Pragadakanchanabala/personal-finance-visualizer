// File Path: app/api/earnings/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Corrected import path
import dbConnect from '../../../lib/dbConnect';
import Earning from '../../../models/Earning';
import { NextResponse } from 'next/server';

async function getSession() { return await getServerSession(authOptions); }

export async function GET(request) {
    const session = await getSession();
    if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const earnings = await Earning.find({ userId: session.user.id });
    return NextResponse.json({ success: true, data: earnings });
}

export async function POST(request) {
    const session = await getSession();
    if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    await dbConnect();
    const { amount, month, year } = await request.json();
    const earning = await Earning.findOneAndUpdate({ userId: session.user.id, month, year }, { amount }, { new: true, upsert: true, runValidators: true });
    return NextResponse.json({ success: true, data: earning }, { status: 201 });
}

