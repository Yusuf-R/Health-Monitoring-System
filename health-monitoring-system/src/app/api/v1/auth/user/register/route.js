'use server';
import { NextResponse } from 'next/server';
import dbClient from '@/server/db/mongoDb';
import UserController from '@/server/controllers/UserController';

export async function POST(request) {
    try {

        // Retrieve data from the request and parse JSON
        const obj = await request.json();
        const newUser = await UserController.RegisterNew(obj);
        const data = {
            email: newUser.email,
            role: newUser.role,
            id: newUser._id
        }

        // Return a response with the newly registered user
        return NextResponse.json(
            { message: 'User registered successfully', data },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration failed:", error);
        return NextResponse.json(
            { message: 'Registration failed', error: error.message },
            { status: 400 }
        );
    }
}
