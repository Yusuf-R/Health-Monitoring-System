// options.js
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
                password: {}
            },
            authorize: async (credentials) => {
                try {
                    // Ensure connection to the database
                    await dbClient.connect();
                    const { User } = await getCareBaseModels();

                    // Attempt to find the user and validate credentials
                    const user = await User.findOne({ email: credentials.email }).select("+password");
                    if (!user) {
                        throw new Error("User not found");
                    }

                    const isPasswordValid = await AuthController.comparePassword(credentials.password, user.password);
                    if (!isPasswordValid) {
                        throw new Error("Invalid credentials");
                    }

                    // Clean up connection after user validation
                    await dbClient.close();

                    // Return user details for JWT and session
                    return { id: user._id, role: user.role };
                } catch (error) {
                    console.error("Error during login:", error);
                    return null;
                }
            }
        })
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
        }
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default options;
