import { Router } from 'express';
import {
    login,
    register,
    getProfile,
    changePassword,
    refreshToken,
    logout,
    forgotPassword,
    validateResetToken,
    resetPassword
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { authRateLimiter } from '../middleware/security';

const router = Router();

// Rutas públicas
router.post('/login', authRateLimiter, login);
router.post('/register', register);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.get('/validate-reset-token', validateResetToken);
router.post('/reset-password', resetPassword);

// Rutas protegidas (requieren autenticación)
router.get('/profile', protect, getProfile);
router.post('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;
