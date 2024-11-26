import { NextResponse } from 'next/server'
import AuthController from '@/server/controllers/AuthController'
import MedicalHistoryController from "@/server/controllers/MedicalHistoryController";

export const dynamic = 'force-dynamic';
export async function POST(req) {
    try {
        const obj = await req.json();
        if (!obj) {
            return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
        }
        const userId = await AuthController.headlessCheck(req)
        if (userId instanceof Error) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }
        await MedicalHistoryController.NewRecord(obj)
        return NextResponse.json({ message: 'Record created successfully' }, { status: 200 });
    } catch (error) {
        console.error('Logout Error:', error)
        return NextResponse.json({ message: 'Logout failed' }, { status: 500 })
    }
}

