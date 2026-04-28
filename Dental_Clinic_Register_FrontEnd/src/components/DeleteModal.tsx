import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface DeleteModalprops {
  open: boolean;
  onClose: () => void;

  successMessage: string;
  errorMessage: string;

  isLoadingDelete: boolean;
  onDelete: () => void;
}
function DeleteModal({ open, onClose, successMessage, errorMessage, isLoadingDelete, onDelete }: DeleteModalprops) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('confirmDeletion')}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" gutterBottom>
          {t('confirmDeletionMessage')}
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
          {t('cancel')}
        </Button>
        <Button
          onClick={onDelete}
          color="error"
          variant="contained"
          disabled={isLoadingDelete}
          startIcon={isLoadingDelete ? <CircularProgress size={20} /> : null}
        >
          {isLoadingDelete ? t('deleting') : t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default DeleteModal;
