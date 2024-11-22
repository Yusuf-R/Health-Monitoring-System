import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import AuthController from '@/server/controllers/AuthController';
import getCareBaseModels from '@/server/models/CareBase/CareBase';
import dbClient from '@/server/db/mongoDb';

const options = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {},
                password: {},
                role: {}, // Include role as part of the credentials
            },
            authorize: async (credentials) => {
                try {
                    // Ensure connection to the database
                    await dbClient.connect();

                    const { User, HealthWorker } = await getCareBaseModels();
                    const Model = credentials.role === 'HealthWorker' ? HealthWorker : User;

                    // Attempt to find the user and validate credentials
                    const user = await Model.findOne({ email: credentials.email }).select("+password");
                    if (!user) {
                        throw new Error("User not found");
                    }

                    const isPasswordValid = await AuthController.comparePassword(credentials.password, user.password);
                    if (!isPasswordValid) {
                        throw new Error("Invalid credentials");
                    }

                    console.log('User successfully authenticated:', user);

                    // Return user details for JWT and session
                    return { id: user._id, role: user.role };
                } catch (error) {
                    console.error("Error during login:", error);
                    return null;
                } finally {
                    await dbClient.close(); // Ensure the database connection is closed
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.role = token.role;
            return session;
        },
    },
    session: {
        strategy: 'jwt',
        maxAge: 3 * 30 * 24 * 60 * 60, // 3 months
        updateAge: 24 * 60 * 60, // 24 hours
    },
    jwt: {
        encryption: true, // Use JWE for JWT encryption
    },
    cookies: {
        sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
            },
        },
        callbackUrl: {
            name: `__Secure-next-auth.callback-url`,
            options: {
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
            },
        },
    },
    secret: process.env.AUTH_SECRET,
};

export default options;
