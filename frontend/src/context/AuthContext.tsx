import { createContext, useContext, useState } from "react";

// @ts-ignore
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [username, setUsername] = useState(localStorage.getItem("username") || null);

    const login = (user) => {
        localStorage.setItem("username", user);
        setUsername(user);
    };

    const logout = () => {
        localStorage.removeItem("username");
        setUsername(null);
    };

    const isAuthenticated = !!username;

    return (
        <AuthContext.Provider value={{ username, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
