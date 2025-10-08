// File Path: app/api/categories/[id]/route.js
import { auth } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '../../../../lib/dbConnect';
import Category from '../../../../models/Category';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    const updatedCategory = await Category.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!updatedCategory) return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: updatedCategory });
}

export async function DELETE(request, { params }) {
    const session = await auth();
    if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    
    await dbConnect();
    const deletedCategory = await Category.findByIdAndDelete(params.id);
    if (!deletedCategory) return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Category deleted successfully.' });
}


