import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
    try {
        const token = await getToken({
            req,
            secret: process.env.AUTH_SECRET,
            secureCookie: process.env.NODE_ENV === 'production', // Ensure secure cookies in production
            debug: true, // Enable detailed logs for debugging
        });

        // Redirect to login if no token is found
        if (!token) {
            console.error('No token found');
            return NextResponse.redirect(new URL('/', req.url));
        }

        const userRole = token.role;
        const { pathname } = req.nextUrl;
        console.log(`Pathname: ${pathname}, Role: ${userRole}`);

        // Role-based authorization logic
        const rolePaths = {
            Admin: '/admin',
            User: '/user',
            HealthWorker: '/health-worker',
            StakeHolder: '/stakeholder',
        };

        // Check if the role matches the path
        const expectedPath = rolePaths[userRole];
        if (expectedPath && pathname.startsWith(expectedPath)) {
            return NextResponse.next();
        }

        // If role doesn't match, redirect to the homepage
        console.warn(`Access denied for Role: ${userRole} on Path: ${pathname}`);
        return NextResponse.redirect(new URL('/', req.url));
    } catch (error) {
        console.error('Middleware Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export const config = {
    matcher: ['/user/:path*', '/health-worker/:path*', '/admin/:path*', '/stakeholder/:path*'], // Match protected routes
};
