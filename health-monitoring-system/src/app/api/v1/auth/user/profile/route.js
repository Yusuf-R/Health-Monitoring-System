// src/app/api/client/profile/route.js
import { NextResponse } from "next/server";
import AuthController from "@/server/controllers/AuthController";
import UserController from "@/server/controllers/UserController";
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const userId = await AuthController.headlessCheck(request);
        if (userId instanceof Error) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userProfile = await UserController.Profile(userId);
        if (userProfile instanceof Error) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json(
            userProfile,
            {
                status: 200
            }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}