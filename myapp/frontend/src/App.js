import { useState } from "react";
import { setToken } from "./utils/token";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

function App() {

  const [isLogin, setIsLogin] =
    useState(true);

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  // LOGIN
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Login failed");
      } else if (data && data.token) {
        // Save the JWT token using our utility
        setToken(data.token);
        
        // Also save email for the dashboard if needed
        localStorage.setItem("email", email);
        setIsLoggedIn(true);
      } else {
        alert("Something went wrong during login");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend: " + err.message);
    }
  };

  // REGISTER
  const handleRegister = async (userData) => {
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      if (response.ok && data === "User Registered") {
        alert("Registration Successful");
        setIsLogin(true);
      } else {
        alert(data.error || data || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend: " + err.message);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    setToken(null);
    localStorage.clear();
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {

    return (
      <Dashboard
        onLogout={handleLogout}
      />
    );
  }

  return (

    <div>

      {
        isLogin ? (

          <Login
            onLogin={handleLogin}
            switchToRegister={() =>
              setIsLogin(false)
            }
          />

        ) : (

          <Register
            onRegister={handleRegister}
            switchToLogin={() =>
              setIsLogin(true)
            }
          />

        )
      }

    </div>
  );
}

export default App;