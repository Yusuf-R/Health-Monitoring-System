import { NextResponse } from 'next/server'
import AuthController from '@/server/controllers/AuthController'
import UserController from '@/server/controllers/UserController';

export const dynamic = 'force-dynamic';
export async function POST(req) {
    try {
        const userId = await AuthController.headlessCheck(req)
        if (userId instanceof Error) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }
        const userProfile = await UserController.Logout(userId)
        if (!userProfile) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
          }
        return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    } catch (error) {
        console.error('Logout Error:', error)
        return NextResponse.json({ message: 'Logout failed' }, { status: 500 })
    }
}

