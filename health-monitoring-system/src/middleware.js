import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
    try {
        const { pathname } = req.nextUrl;

        // Define public routes that don't require authentication
        const publicRoutes = [
            '/api/v1/auth/user/register',
            '/api/v1/auth/user/login',
            '/api/v1/auth/health-worker/register',
            '/api/v1/auth/health-worker/login',
            '/api/v1/auth/db/test',
            '/api/v1/auth/decrypt',
        ];

        // Allow public routes to proceed without token validation
        if (publicRoutes.some((route) => pathname.startsWith(route))) {
            console.log(`Public route accessed: ${pathname}`);
            return NextResponse.next();
        }

        // Check token for protected routes
        const token = await getToken({
            req,
            secret: process.env.AUTH_SECRET,
            secureCookie: process.env.NODE_ENV === 'production', // Ensure secure cookies in production
            debug: true,
        });

        if (!token) {
            const headers = Object.fromEntries(req.headers.entries());
            console.log('Request Headers:', headers);
            console.log('Request Cookies:', req.cookies);
            console.error('No token found');
            return NextResponse.redirect(new URL('/', req.url));
        }

        const userRole = token.role;
        console.log(`Pathname: ${pathname}, Role: ${userRole}`);

        // Role-based authorization logic
        const rolePaths = {
            Admin: '/admin',
            User: '/user',
            HealthWorker: '/health-worker',
            StakeHolder: '/stakeholder',
        };

        const expectedPath = rolePaths[userRole];
        if (expectedPath && pathname.startsWith(expectedPath)) {
            return NextResponse.next();
        }

        console.warn(`Access denied for Role: ${userRole} on Path: ${pathname}`);
        return NextResponse.redirect(new URL('/', req.url));
    } catch (error) {
        console.error('Middleware Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export const config = {
    matcher: ['/api/v1/:path*', '/user/:path*', '/health-worker/:path*', '/admin/:path*', '/stakeholder/:path*'], // Match protected routes
};
