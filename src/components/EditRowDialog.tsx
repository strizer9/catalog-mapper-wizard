
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material';

interface CSVData {
  [key: string]: any;
}

interface EditRowDialogProps {
  open: boolean;
  originalColumns: string[];
  editFormData: CSVData;
  onClose: () => void;
  onSave: () => void;
  onFormDataChange: (data: CSVData) => void;
}

const EditRowDialog: React.FC<EditRowDialogProps> = ({
  open,
  originalColumns,
  editFormData,
  onClose,
  onSave,
  onFormDataChange,
}) => {
  const handleFieldChange = (column: string, value: string) => {
    onFormDataChange({ ...editFormData, [column]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Row</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {originalColumns.map((column) => (
            <TextField
              key={column}
              label={column}
              value={editFormData[column] || ''}
              onChange={(e) => handleFieldChange(column, e.target.value)}
              fullWidth
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditRowDialog;
