'use server';
import { NextResponse } from 'next/server';
import dbClient from '@/server/db/mongoDb';
import HealthWorkerController from '@/server/controllers/HealthWorkerController';

export async function POST(request) {
    try {

        // Retrieve data from the request and parse JSON
        const obj = await request.json();
        const user = await HealthWorkerController.RegisterNew(obj);
        const data = {
            email: user.email,
            role: user.role,
            id: user._id
        }
        // Return a response with the newly registered user
        return NextResponse.json( {message: 'Login successful', data}, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Registration failed', error: error.message }, { status: 400 }
        );
    }
}
