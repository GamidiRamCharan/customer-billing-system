import { useState } from "react";
import "../App.css";

function Login({
  onLogin,
  switchToRegister
}) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (

    <div className="container">

      <div className="box">

        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", width: "100%", justifyContent: "flex-start" }}>
          <input
            type="checkbox"
            id="show-password"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            style={{ width: "18px", height: "18px", margin: 0, padding: 0, cursor: "pointer" }}
          />
          <label htmlFor="show-password" style={{ fontSize: "13px", color: "#475569", cursor: "pointer", userSelect: "none" }}>
            Show Password
          </label>
        </div>

        <button
          onClick={() =>
            onLogin(email, password)
          }
        >
          Login
        </button>

        <p>

          Don't have an account?

          <span onClick={switchToRegister}>
            Register
          </span>

        </p>

      </div>

    </div>
  );
}

export default Login;