import { useState } from "react";
import "../App.css";

function Register({
  onRegister,
  switchToLogin
}) {

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [mobile, setMobile] =
    useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {

    onRegister({
      firstName,
      lastName,
      mobile,
      email,
      password
    });
  };

  return (

    <div className="container">

      <div className="box">

        <h2>Register</h2>

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) =>
            setFirstName(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) =>
            setLastName(e.target.value)
          }
        />

        <input
          type="tel"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) =>
            setMobile(e.target.value)
          }
        />

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

        <button onClick={handleSubmit}>
          Register
        </button>

        <p>

          Already have an account?

          <span onClick={switchToLogin}>
            Login
          </span>

        </p>

      </div>

    </div>
  );
}

export default Register;