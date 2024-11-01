'use server';
import dbClient from "@/server/db/mongoDb";
import { NextResponse } from "next/server";


// Test connection to MongoDB
export async function GET() {
    try {
        await dbClient.connect();
        return NextResponse.json({ message: 'Connection successful' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Connection failed', error: error.message }, { status: 400 });
    }
}