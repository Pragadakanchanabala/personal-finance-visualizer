// File Path: app/api/categories/[id]/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // Correct import path
import dbConnect from '../../../../lib/dbConnect';
import Category from '../../../../models/Category';
import { NextResponse } from 'next/server';

async function getSession() {
    return await getServerSession(authOptions);
}

// Any logged-in user can update a category name or color.
// The logic is now public and does not check for a specific user.
export async function PUT(request, { params }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    try {
        const body = await request.json();
        // Finds by ID only, no user check.
        const updatedCategory = await Category.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
        if (!updatedCategory) {
            return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: updatedCategory });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ success: false, message: 'A category with this name already exists.' }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: 'Failed to update category.' }, { status: 400 });
    }
}

// Any logged-in user can delete a category.
// The logic is now public and does not check for a specific user.
export async function DELETE(request, { params }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    try {
        // Deletes by ID only, no user check.
        // Optional: You might add logic here to re-categorize existing transactions
        // before deleting the category itself.
        const deletedCategory = await Category.findByIdAndDelete(params.id);
        if (!deletedCategory) {
            return NextResponse.json({ success: false, message: 'Category not found.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Category deleted successfully.' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to delete category.' }, { status: 400 });
    }
}

