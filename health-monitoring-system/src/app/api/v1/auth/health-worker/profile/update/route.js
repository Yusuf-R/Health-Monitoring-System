
import { NextResponse } from "next/server";
import AuthController from '@/server/controllers/AuthController';
import HealthWorkerController from '@/server/controllers/HealthWorkerController';

export const dynamic = 'force-dynamic';
// Backend PATCH endpoint
export async function PATCH(req) {
    try {
        const userId = await AuthController.headlessCheck(req);
        if (userId instanceof Error) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const obj = await req.json();
        if (!obj) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 });
        }
        const healthWorkerProfile = await HealthWorkerController.UpdateProfile(userId, obj);
        if (healthWorkerProfile instanceof Error) {
            return NextResponse.json({ message: "Failed to update location" }, { status: 400 });
        }
        return NextResponse.json(healthWorkerProfile, { status: 201 });
    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
