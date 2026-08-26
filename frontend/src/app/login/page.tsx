"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as React from "react";
import Image from "next/image";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import toast from "react-hot-toast";
import { loginUser } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form, 
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    console.log("Login button clicked");
    try {
      setLoading(true);

      const res = await loginUser(form);
      console.log("Response:", res);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      toast.success("Login Successful");

      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        bgcolor: "#fff",
      }}
    >
      {/* Left Image Panel */}
      {isMdUp && (
        <Box
          sx={{
            position: "relative",
            width: { md: "45%", lg: "42%" },
            minHeight: "100vh",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <Image
            src="/login/ChatGPT Image Jul 14, 2026, 11_32_46 PM.png"
            alt="Shri Om Logistics"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center" }}
            sizes="(max-width: 900px) 0px, 45vw"
          />
        </Box>
      )}

      {/* Right Form Panel */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, sm: 6, md: 8 },
          py: 6,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              color: "#1a1a2e",
            }}
          >
            Welcome Back!
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
            Login to your account to continue
          </Typography>

          <Typography
            variant="body2"
            sx={{ fontWeight: 600, mb: 1, color: "#1a1a2e" }}
          >
            Username
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter your username"
            name="username"
            value={form.username}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon sx={{ color: "action.active" }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2.5 }}
          />

          <Typography
            variant="body2"
            sx={{ fontWeight: 600, mb: 1, color: "#1a1a2e" }}
          >
            Password
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: "action.active" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 1,
              mb: 3,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#f5730c",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Forgot Password?
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            disabled={loading}
            onClick={handleLogin}
            startIcon={<LoginIcon />}
            sx={{
              py: 1.4,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              bgcolor: "#f5730c",
              "&:hover": { bgcolor: "#e0650a" },
            }}
          >
            {loading ? "Please Wait..." : "Login"}
          </Button>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              color: "text.secondary",
              mt: 4,
            }}
          >
            © {new Date().getFullYear()} Shri Om Logistics. All rights
            reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}