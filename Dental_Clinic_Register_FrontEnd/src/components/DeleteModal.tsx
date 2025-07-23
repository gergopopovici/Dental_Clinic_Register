import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

interface DeleteModalprops {
  open: boolean;
  onClose: () => void;

  successMessage: string;
  errorMessage: string;

  isLoadingDelete: boolean;
  onDelete: () => void;
}
function DeleteModal({ open, onClose, successMessage, errorMessage, isLoadingDelete, onDelete }: DeleteModalprops) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete your account? This action cannot be undone.
        </Typography>
        {successMessage && (
          <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
            {successMessage}
          </Typography>
        )}
        {errorMessage && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ pt: 2, pb: 0, px: 0 }}>
        <Button onClick={onClose} disabled={isLoadingDelete}>
          Cancel
        </Button>
        <Button
          onClick={onDelete}
          color="error"
          variant="contained"
          disabled={isLoadingDelete}
          startIcon={isLoadingDelete ? <CircularProgress size={20} /> : null}
        >
          {isLoadingDelete ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default DeleteModal;
