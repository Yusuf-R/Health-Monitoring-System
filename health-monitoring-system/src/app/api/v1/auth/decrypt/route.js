'use server'
// api call to decrypt a data
import { NextResponse } from 'next/server';
import dbClient from '@/server/database/mongoDB';
import AuthController from '@/server/controllers/AuthController';

export async function POST(request) {
    try {
        await dbClient.connect();
        // Destructure both encryptedData and nonce from the request body
        const data = await request.json();
        const { encryptedData, nonce } = data;

        // Ensure these environment variables are properly set up in your .env file
        const privateKeyBase64 = process.env.TWEETNACL_PRIVATE_KEY;
        const publicKeyBase64 = process.env.NEXT_PUBLIC_TWEETNACL_PUBLIC_KEY;

        // Decrypt the data
        const decryptedData = AuthController.decryptData(encryptedData, nonce, privateKeyBase64, publicKeyBase64);

        await dbClient.close();
        return NextResponse.json(decryptedData, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}