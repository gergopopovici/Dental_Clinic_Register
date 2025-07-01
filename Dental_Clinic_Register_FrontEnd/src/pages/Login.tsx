import React, { useState } from "react";
import {
  Box,
  Button,
  Link,
  TextField,
  Typography,
  CircularProgress, FormControlLabel, Checkbox,
} from '@mui/material';
import { loginLeftSvg, loginRightSvg } from "../assets";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginIn } from "../services/AuthorisationService";
import { Login } from "../models/Login";

function LoginPage() {
  const [hoveredSection, setHoveredSection] = useState<"login" | "signup" | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const loginMutation = useMutation<{ token: string }, Error, Login>({
    mutationFn: (loginData: Login) => loginIn(loginData),
    onSuccess: (data) => {
      const cookieOptions = rememberMe ? {expires:7} : undefined;
      Cookies.set("auth_token", data.token, cookieOptions);
      navigate(redirect);
    },
    onError: (error) => {
      console.error("Login failed:", error);
      alert("Invalid username or password.");
    },
  });

  const isLoading = loginMutation.isPending;

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  const sharedSectionStyles = {
    transition: "width 0.5s ease-in-out, opacity 0.5s ease-in-out",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "black",
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "100%",
    minHeight: "100vh",
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          minWidth:"100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Logging in...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          minHeight: "100%",
          width: "100%",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* LOGIN SECTION */}
        <Box
          onMouseEnter={() => setHoveredSection("login")}
          onMouseLeave={() => setHoveredSection(null)}
          sx={{
            ...sharedSectionStyles,
            width:
              hoveredSection === "login"
                ? "66.67%"
                : hoveredSection === "signup"
                  ? "33.33%"
                  : "50%",
            opacity: hoveredSection === "signup" ? 0.5 : 1,
            backgroundColor: "#f9f9f9",
            backgroundImage: loginLeftSvg,
          }}
        >
          <form
            onSubmit={handleLoginSubmit}
            style={{
              width: "100%",
              maxWidth: 320,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "rgba(255,255,255,0.85)",
              padding: 24,
              borderRadius: 16,
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 3 }}>
              Welcome Back!
            </Typography>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <FormControlLabel control={<Checkbox
              checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
              color="primary"/>} label={"Remember Me"}>
            </FormControlLabel>
            <Box sx={{ width: "100%", textAlign: "right", mb: 2 }}>
              <Link href="/forgot-password" underline="hover">
                Forgot your password?
              </Link>
            </Box>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              Login
            </Button>
            <Box display="flex" justifyContent="center" mt={2}>
              <Typography variant="body2" sx={{ color: "red", textAlign: "center" }}>
                <Link
                  href="http://www.freepik.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  color="red"
                >
                  Design from publicdomainvectors.org
                </Link>
              </Typography>
            </Box>
          </form>
        </Box>

        {/* SIGNUP SECTION */}
        <Box
          onMouseEnter={() => setHoveredSection("signup")}
          onMouseLeave={() => setHoveredSection(null)}
          sx={{
            ...sharedSectionStyles,
            width:
              hoveredSection === "signup"
                ? "66.67%"
                : hoveredSection === "login"
                  ? "33.33%"
                  : "50%",
            opacity: hoveredSection === "login" ? 0.5 : 1,
            backgroundColor: "#e0f7fa",
            backgroundImage: loginRightSvg,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 320,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              backgroundColor: "rgba(255,255,255,0.85)",
              padding: 3,
              borderRadius: 2,
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
            }}
          >
            <Typography variant="h4" gutterBottom>
              Are you new to our clinic?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Create an account to get started!
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              sx={{ py: 1.5, px: 5, fontWeight: "bold" }}
              onClick={() => navigate("/register")}
            >
              Sign Up
            </Button>
            <Typography variant="body2" sx={{ mt: 2, color: "red" }}>
              <Link
                href="http://www.freepik.com"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                color="red"
              >
                Designed by macrovector / Freepik
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;
