import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { UserModel, User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

// Verificar variables de entorno
console.log('Variables de entorno GitHub:');
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID);
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET);
console.log('GITHUB_CALLBACK_URL:', process.env.GITHUB_CALLBACK_URL);

export function configurePassport(userModel: UserModel) {
    // Serialización del usuario
    passport.serializeUser((user: Express.User, done) => {
        // Asegurarse de que solo se serialice el ID
        const typedUser = user as User;
        done(null, typedUser.id);
    });

    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await userModel.findById(id);
            if (!user) {
                return done(new Error('Usuario no encontrado'));
            }
            // Asegurarse de que todas las propiedades del usuario estén presentes
            const userWithAllProps: User = {
                id: user.id,
                username: user.username,
                password_hash: user.password_hash,
                github_id: user.github_id,
                is_admin: Boolean(user.is_admin), // Asegurar que is_admin sea booleano
                created_at: user.created_at
            };
            done(null, userWithAllProps);
        } catch (error) {
            done(error);
        }
    });

    // Estrategia local
    passport.use(new LocalStrategy(
        async (username: string, password: string, done) => {
            try {
                const user = await userModel.findByUsername(username);
                if (!user) {
                    return done(null, false, { message: 'Usuario no encontrado' });
                }

                const isValid = await userModel.verifyPassword(user, password);
                if (!isValid) {
                    return done(null, false, { message: 'Contraseña incorrecta' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    // Estrategia GitHub con credenciales directas
    passport.use(new GitHubStrategy(
        {
            clientID: 'Ov23litnGxyMPaNmRAxG',
            clientSecret: '4b512de234ddc4255bb1a975446a335e82155847',
            callbackURL: 'http://localhost:3000/auth/github/callback'
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            try {
                const user = await userModel.createOrUpdateGithubUser(
                    profile.id,
                    profile.username
                );
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));
} 