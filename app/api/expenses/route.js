// File Path: app/api/expenses/route.js
import { getServerSession } from 'next-auth/next';
// THE FINAL FIX: Import from the stable lib/auth.js file.
import { authOptions } from '@/lib/auth';
import dbConnect from '../../../lib/dbConnect';
import Expense from '../../../models/Expense';
import { NextResponse } from 'next/server';

// ... rest of the file remains the same
async function getSession() {
  return await getServerSession(authOptions);
}


