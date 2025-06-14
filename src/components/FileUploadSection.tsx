
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Chip,
  Alert,
  Stack
} from '@mui/material';
import { 
  Upload as UploadIcon, 
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon 
} from '@mui/icons-material';

interface FileUploadSectionProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  dataCount: number;
  columnCount: number;
  onUploadToAPI?: () => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  onFileUpload,
  dataCount,
  columnCount,
  onUploadToAPI,
}) => {
  return (
    <Paper elevation={2} sx={{ p: 4, mb: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
        Step 1: Upload Your CSV File
      </Typography>
      
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-file-upload"
            type="file"
            onChange={onFileUpload}
          />
          <label htmlFor="csv-file-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              size="large"
              sx={{ minWidth: 200 }}
            >
              Choose CSV File
            </Button>
          </label>
          
          {dataCount > 0 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                icon={<CheckCircleIcon />} 
                label={`${dataCount} rows`} 
                color="success" 
                variant="filled"
              />
              <Chip 
                label={`${columnCount} columns`} 
                color="primary" 
                variant="outlined"
              />
            </Box>
          )}
        </Box>

        {dataCount > 0 && (
          <Alert severity="success">
            <Typography variant="body2">
              CSV file loaded successfully! Now map your columns in Step 2, then upload to API.
            </Typography>
          </Alert>
        )}

        {dataCount > 0 && onUploadToAPI && (
          <Box sx={{ pt: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CloudUploadIcon />}
              onClick={onUploadToAPI}
              size="large"
              sx={{ minWidth: 200 }}
            >
              Upload to API
            </Button>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default FileUploadSection;
