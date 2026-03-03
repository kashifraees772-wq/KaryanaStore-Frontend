import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        api.get('/api/auth/me')
            .then(res => setAdmin(res.data.admin))
            .catch(() => {
                setToken(null);
                localStorage.removeItem('token');
            })
            .finally(() => setLoading(false));
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await api.post('/api/auth/login', { email, password });
            console.log("Login Response:", res.data);
            if (res.data.success) {
                setToken(res.data.token);
                localStorage.setItem('token', res.data.token);
                return { success: true };
            }
            return { success: false, message: 'Invalid credentials' };
        } catch (error) {
            console.error("Login Error:", error.response?.data || error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Server error'
            };
        }
    };

    const logout = () => {
        setToken(null);
        setAdmin(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ token, admin, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
