
import React from 'react';
import { Box, Button, Typography, Alert, Paper } from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';

interface FileUploadSectionProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  dataCount: number;
  columnCount: number;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  onFileUpload,
  dataCount,
  columnCount,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        1. Upload CSV File
      </Typography>
      <Button
        variant="contained"
        component="label"
        startIcon={<UploadIcon />}
        sx={{ mb: 2 }}
      >
        Choose CSV File
        <input
          type="file"
          accept=".csv"
          hidden
          onChange={onFileUpload}
        />
      </Button>
      
      {dataCount > 0 && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Successfully loaded {dataCount} rows with {columnCount} columns
        </Alert>
      )}
    </Paper>
  );
};

export default FileUploadSection;
