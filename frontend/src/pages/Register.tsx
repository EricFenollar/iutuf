import "./Auth.css";
import {Link} from "react-router-dom";

function Register() {
    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Register</h2>

                <input className="auth-input" placeholder="Full name"/>
                <input className="auth-input" placeholder="User"/>
                <input className="auth-input" placeholder="Email"/>
                <input className="auth-input" type="password" placeholder="Password"/>
                <input className="auth-input" type="password" placeholder="Confirm password"/>

                <button className="auth-button">Create Account</button>

                <Link to="/login">
                    <button className="auth-button secondary">Back to Login</button>
                </Link>
            </div>
        </div>
    );
}

export default Register