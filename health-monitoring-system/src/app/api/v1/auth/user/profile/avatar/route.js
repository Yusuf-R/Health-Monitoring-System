
import { NextResponse } from "next/server";
import AuthController from '@/server/controllers/AuthController';
import UserController from '@/server/controllers/UserController';
import cloudinary from "@/server/cloudinary/cloudinary";

export const dynamic = 'force-dynamic'; // Ensure all routes in /client are dynamic

// Backend PATCH endpoint
export async function PATCH(req) {
    try {
        const userId = await AuthController.headlessCheck(req);
        if (userId instanceof Error) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file'); // Changed from 'image' to 'file'

        if (!file) {
            return NextResponse.json({ message: "No file provided" }, { status: 400 });
        }

        // Convert the file to a buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload directly to Cloudinary
        const result = await cloudinary.uploader.upload(
            `data:${file.type};base64,${buffer.toString('base64')}`,
            {
                folder: `CommunityHealthMonitor/User/ProfilePic/${userId}`,
                public_id: 'image',
                overwrite: true,
                invalidate: true,
                resource_type: 'auto',
                transformation: [
                    {width: 500, height: 500, crop: 'limit'},
                    {quality: 'auto', fetch_format: 'auto'},
                ],
            }
        );

        // Update the user's avatar URL in the database
        const userProfile = await UserController.UpdateAvatar(userId, result.secure_url);

        if (userProfile instanceof Error) {
            return NextResponse.json({ message: "Failed to update avatar" }, { status: 400 });
        }

        return NextResponse.json(userProfile, { status: 201 });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({
            error: error.message || 'Image upload failed'
        }, { status: 500 });
    }
}