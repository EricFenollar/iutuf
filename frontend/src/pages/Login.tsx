import "./Auth.css";
import { Routes, Route, Link } from "react-router-dom";

function Login() {
    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Login</h2>

                <input className="auth-input" placeholder="User" />
                <input className="auth-input" type="password" placeholder="Password" />

                <button className="auth-button">Login</button>
                <Link to="/register">
                    <button className="auth-button secondary">Sign up</button>
                </Link>

                <Link className="auth-back" to="/home">← Back</Link>
            </div>
        </div>
    );
}



export default Login