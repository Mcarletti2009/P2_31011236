import express from 'express';
import passport from 'passport';
import { UserModel, User } from '../models/User';

const router = express.Router();

// Middleware para verificar si el usuario es administrador
const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.isAuthenticated() && req.user && (req.user as User).is_admin === true) {
        return next();
    }
    res.status(403).render('error', { 
        message: 'Acceso denegado. Se requieren privilegios de administrador.' 
    });
};

// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
};

// Rutas de vistas
router.get('/login', (req: express.Request, res: express.Response) => {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.render('loginForm', { error: req.query.error });
});

router.get('/register', isAdmin, (req: express.Request, res: express.Response) => {
    res.render('register', { error: req.query.error, success: req.query.success });
});

// Ruta de registro (solo para administradores)
router.post('/register', isAdmin, async (req: express.Request, res: express.Response) => {
    try {
        const { username, password, isAdmin } = req.body;
        const userModel = new UserModel(req.app.get('db'));
        await userModel.createUser(username, password, isAdmin === 'on');
        res.redirect('/auth/register?success=Usuario creado exitosamente');
    } catch (error) {
        res.redirect('/auth/register?error=Error al crear usuario');
    }
});

// Ruta de login local
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/auth/login?error=Usuario o contraseña incorrectos',
    successRedirect: '/'
}));

// Ruta de login con GitHub
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// Callback de GitHub
router.get('/github/callback',
    passport.authenticate('github', { 
        failureRedirect: '/auth/login?error=Error en la autenticación con GitHub'
    }),
    (req: express.Request, res: express.Response) => {
        res.redirect('/');
    }
);

// Ruta de logout
router.get('/logout', (req: express.Request, res: express.Response) => {
    req.logout(() => {
        res.redirect('/auth/login');
    });
});

// Ruta para obtener el usuario actual (API)
router.get('/me', isAuthenticated, (req: express.Request, res: express.Response) => {
    res.json({ user: req.user });
});

export default router; 