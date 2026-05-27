import React, { useState } from "react";
import axios from "axios";

function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      let res;

      if (isLogin) {
        res = await axios.post("http://127.0.0.1:8000/login", {
          email,
          password,
        });
      } else {
        res = await axios.post("http://127.0.0.1:8000/signup", {
          name,
          email,
          password,
        });
      }

      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);

    } catch (err) {
      alert(
        "Error: " +
          (err.response?.data?.detail ||
            "Something went wrong")
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? "Login" : "Signup"}</h2>

        {!isLogin && (
          <input
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleSubmit}>
          {isLogin ? "Login" : "Signup"}
        </button>

        <p
          onClick={() => {
            setIsLogin(!isLogin);
            setName("");
            setEmail("");
            setPassword("");
          }}
        >
          {isLogin
            ? "New user? Signup"
            : "Already have account? Login"}
        </p>
      </div>
    </div>
  );
}

export default Auth;