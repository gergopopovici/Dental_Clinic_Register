import { useSearchParams } from "react-router-dom";
import { useState, FormEvent } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress, Link,
} from '@mui/material';
import LockResetIcon from "@mui/icons-material/LockReset";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { resetPassword } from "../services/AuthorisationService";
import { ResponsePasswordResetTokenDTO } from "../models/ForgotPassword";
import { genericBackground } from '../assets';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const resetMutation = useMutation({
    mutationFn: (data: ResponsePasswordResetTokenDTO) => resetPassword(data),
    onSuccess: () => {
      setSuccessMessage("Your password has been reset successfully.");
      setErrorMessage("");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || "An error occurred.";
      setErrorMessage(message);
      setSuccessMessage("");
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      setErrorMessage("Invalid or missing token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }

    if(newPassword.length<8){
      setSuccessMessage("Password must be at least 8 characters.");
      return;
    }

    const data: ResponsePasswordResetTokenDTO = {
      token,
      password: newPassword,
      passwordConfirmation: confirmPassword,
    };

    resetMutation.mutate(data);
  };

  return (
    <Box
      display={'flex'}
      flexDirection="column"
      minHeight="100vh"
      minWidth="100vw"
      bgcolor="#f4f6f8"
      sx={{
        backgroundImage:genericBackground,
        width: '100%',
        height: '100%',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
        backgroundSize: 'contain'
      }}
    >
      <Box
        display="flex"
        flexGrow={1}
        justifyContent="center"
        alignItems="center"
      >
      <Card sx={{ maxWidth: 400, width: "90%", p: 3 }}>
        <Box display={"flex"} justifyContent={"center"} mb={2}>
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <LockResetIcon fontSize={"large"} />
          </Avatar>
        </Box>
        <CardContent>
          <Typography variant={"h5"} align={"center"} gutterBottom>
            Reset Password
          </Typography>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label={"New Password"}
              type={"password"}
              fullWidth
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label={"Confirm Password"}
              type={"password"}
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              type={"submit"}
              variant={"contained"}
              color={"primary"}
              fullWidth
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
          <Box component="footer" textAlign="center" py={2}>
            <Link
              href="http://www.vecteezy.com"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="red">
              Background designed by vecteezy.com
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
    </Box>
  );
}

export default ResetPassword;
