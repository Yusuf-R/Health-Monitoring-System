'use server';
import { NextResponse } from 'next/server';
import dbClient from '@/server/db/mongoDb';
import UserController from '@/server/controllers/UserController';

export async function POST(request) {
    try {
        // Connect to the database inside the function, not at the top level
        await dbClient.connect();

        // Retrieve data from the request and parse JSON
        const obj = await request.json();
        console.log('A');
        console.log({ obj });
        const newUser = await UserController.RegisterNew(obj);

        // Close the DB connection
        await dbClient.close();

        // Return a response with the newly registered user
        return NextResponse.json(
            { message: 'User registered successfully', user: newUser },
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
