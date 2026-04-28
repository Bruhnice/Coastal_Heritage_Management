import { useState } from "react";
import API from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // Helper to clear errors when user starts typing
  const handleInputChange = (setter) => (e) => {
    setError("");
    setSuccessMessage("");
    setter(e.target.value);
  };

  const login = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);

      setIsTransitioning(true);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);
    } catch (err) {
      // Improved: This will now catch the 403 "Pending Approval" message
      setError(err.response?.data?.message || "Invalid credentials.");
      setLoading(false);
    }
  };

  const signUp = async () => {
    if (!email || !password || !name) {
      setError("All fields are required for Sign Up.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await API.post("/auth/register", { name, email, password, role });

      // Logic: If role is REPORTER, inform them about the pending status
      if (role === "REPORTER") {
        setSuccessMessage(
          "Account request sent! Please wait for admin approval.",
        );
      } else {
        setSuccessMessage("Account created! You can now log in.");
      }

      setIsSignUp(false);

      // Clear inputs
      setName("");
      setEmail("");
      setPassword("");
      setRole("VIEWER"); // Reset to default
    } catch (err) {
      setError(
        err.response?.data?.message || "Sign up failed. Email might be taken.",
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      minHeight: "100vh",
      paddingTop: "5vh",
      backgroundColor: "#f0f4f8",
      backgroundImage: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    card: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      padding: "40px",
      borderRadius: "24px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      width: "90%",
      maxWidth: "400px",
      textAlign: "center",
      zIndex: 10,
      transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: isTransitioning
        ? "translateY(-50px) scale(0.95)"
        : "translateY(0)",
      opacity: isTransitioning ? 0 : 1,
    },
    header: {
      color: "#1a5f7a",
      marginBottom: "8px",
      fontSize: "28px",
      fontWeight: "800",
    },
    subtext: {
      color: "#64748b",
      fontSize: "14px",
      marginBottom: "30px",
      letterSpacing: "1px",
    },
    inputGroup: { marginBottom: "20px", textAlign: "left" },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: "600",
      color: "#475569",
      marginBottom: "8px",
    },
    input: {
      width: "100%",
      padding: "14px 16px",
      borderRadius: "12px",
      border: "2px solid #e2e8f0",
      fontSize: "15px",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
    },
    errorBox: {
      backgroundColor: "#fef2f2",
      color: "#991b1b",
      border: "1px solid #fecaca",
      padding: "12px",
      borderRadius: "10px",
      fontSize: "13px",
      marginBottom: "20px",
      textAlign: "left",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      animation: "shake 0.4s ease-in-out",
    },
    successBox: {
      backgroundColor: "#f0fdf4",
      color: "#166534",
      border: "1px solid #bbf7d0",
      padding: "12px",
      borderRadius: "10px",
      fontSize: "13px",
      marginBottom: "20px",
      textAlign: "left",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    button: {
      width: "100%",
      padding: "14px",
      backgroundColor: "#1a5f7a",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s",
      marginTop: "10px",
      boxShadow: "0 4px 12px rgba(26, 95, 122, 0.3)",
    },
    footer: {
      marginTop: "30px",
      fontSize: "12px",
      color: "#94a3b8",
      fontWeight: "500",
    },
    toggleButton: {
      padding: "8px 16px",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      margin: "0 5px",
      transition: "all 0.3s",
    },
    waveWrapper: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: isTransitioning ? "100%" : "25%",
      opacity: isTransitioning ? 0 : 1,
      transition:
        "height 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease 0.5s",
      zIndex: 15,
      overflow: "hidden",
      lineHeight: 0,
      pointerEvents: "none",
    },
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes move-forever { 0% { transform: translate3d(-90px, 0, 0); } 100% { transform: translate3d(85px, 0, 0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .parallax > use { animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite; }
        .parallax > use:nth-child(1) { animation-delay: -2s; animation-duration: 7s; }
        .parallax > use:nth-child(2) { animation-delay: -3s; animation-duration: 10s; }
        .parallax > use:nth-child(3) { animation-delay: -4s; animation-duration: 13s; }
        .parallax > use:nth-child(4) { animation-delay: -5s; animation-duration: 20s; }
        input:focus { border-color: #1a5f7a !important; }
        button:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(26, 95, 122, 0.4); }
        button:active { transform: translateY(0); }
      `}</style>

      <div style={styles.card}>
        <h2 style={styles.header}>Coastal Heritage</h2>
        <p style={styles.subtext}>ICPE 3 MARITIME PORTAL</p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <button
            style={{
              ...styles.toggleButton,
              backgroundColor: !isSignUp ? "#1a5f7a" : "#e2e8f0",
              color: !isSignUp ? "white" : "#475569",
            }}
            onClick={() => {
              setIsSignUp(false);
              setError("");
              setSuccessMessage("");
            }}
          >
            Login
          </button>
          <button
            style={{
              ...styles.toggleButton,
              backgroundColor: isSignUp ? "#1a5f7a" : "#e2e8f0",
              color: isSignUp ? "white" : "#475569",
            }}
            onClick={() => {
              setIsSignUp(true);
              setError("");
              setSuccessMessage("");
            }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div style={styles.successBox}>
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {isSignUp && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              style={{
                ...styles.input,
                borderColor: error && !name ? "#fca5a5" : "#e2e8f0",
              }}
              value={name}
              onChange={handleInputChange(setName)}
              placeholder="John Doe"
            />
          </div>
        )}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            style={{
              ...styles.input,
              borderColor: error && !email ? "#fca5a5" : "#e2e8f0",
            }}
            value={email}
            onChange={handleInputChange(setEmail)}
            placeholder="researcher@heritage.gov"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            style={{
              ...styles.input,
              borderColor: error && !password ? "#fca5a5" : "#e2e8f0",
            }}
            value={password}
            onChange={handleInputChange(setPassword)}
            placeholder="••••••••"
          />
        </div>

        {isSignUp && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>Role</label>
            <select
              style={styles.input}
              onChange={(e) => setRole(e.target.value)}
              value={role}
            >
              <option value="VIEWER">User</option>
              <option value="REPORTER">Reporter</option>
            </select>
          </div>
        )}

        <button
          style={{
            ...styles.button,
            backgroundColor: loading ? "#64748b" : "#1a5f7a",
            opacity: loading ? 0.8 : 1,
          }}
          onClick={isSignUp ? signUp : login}
          disabled={loading || isTransitioning}
        >
          {loading
            ? "Processing..."
            : isSignUp
              ? "Create Account"
              : "Access Portal"}
        </button>

        <div style={styles.footer}>System Design by Timothy Josh</div>
      </div>

      <div style={styles.waveWrapper}>
        <svg
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
          style={{ width: "100%", height: "80px" }}
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="parallax">
            <use
              href="#gentle-wave"
              x="48"
              y="0"
              fill="rgba(26, 95, 122, 0.7)"
            />
            <use
              href="#gentle-wave"
              x="48"
              y="3"
              fill="rgba(26, 95, 122, 0.5)"
            />
            <use
              href="#gentle-wave"
              x="48"
              y="5"
              fill="rgba(26, 95, 122, 0.3)"
            />
            <use href="#gentle-wave" x="48" y="7" fill="#1a5f7a" />
          </g>
        </svg>
        <div
          style={{ backgroundColor: "#1a5f7a", height: "100vh", width: "100%" }}
        />
      </div>
    </div>
  );
}
