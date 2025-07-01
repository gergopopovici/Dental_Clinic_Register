import { FormEvent, useState } from "react";
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
import { requestPasswordReset } from "../services/AuthorisationService";
import { genericBackground } from '../assets';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const resetMutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setSuccessMessage("If the email exists, a password reset link has been sent.");
      setErrorMessage("");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data?.message || "Something went wrong. Please try again later.";
      setErrorMessage(message);
      setSuccessMessage("");
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMutation.mutate({ email });
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
            Forgot your password?
          </Typography>
          <Typography variant={"body2"} align={"center"} mb={3}>
            Enter your email and we&apos;ll send you a link to reset your password.
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
              label={"Email Address"}
              type={"email"}
              variant={"outlined"}
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                "Send Reset Link"
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

export default ForgotPassword;
