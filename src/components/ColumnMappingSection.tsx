
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stack, 
  Chip, 
  TextField 
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon 
} from '@mui/icons-material';

interface ColumnMapping {
  originalName: string;
  mappedName: string;
  isValid: boolean;
  errorMessage?: string;
}

interface ColumnMappingSectionProps {
  columnMappings: ColumnMapping[];
  onColumnMappingChange: (index: number, newMappedName: string) => void;
  requiredApiFields: string[];
}

const ColumnMappingSection: React.FC<ColumnMappingSectionProps> = ({
  columnMappings,
  onColumnMappingChange,
  requiredApiFields,
}) => {
  if (columnMappings.length === 0) return null;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        2. Map Column Names
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Map your CSV columns to API field names. Required fields: {requiredApiFields.join(', ')}
      </Typography>
      
      <Stack spacing={2}>
        {columnMappings.map((mapping, index) => (
          <Box key={mapping.originalName} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={mapping.originalName}
              variant="outlined"
              sx={{ minWidth: 120 }}
            />
            <Typography variant="body2">→</Typography>
            <TextField
              size="small"
              value={mapping.mappedName}
              onChange={(e) => onColumnMappingChange(index, e.target.value)}
              error={!mapping.isValid}
              helperText={mapping.errorMessage}
              sx={{ minWidth: 200 }}
            />
            {mapping.isValid ? (
              <CheckCircleIcon color="success" fontSize="small" />
            ) : (
              <ErrorIcon color="error" fontSize="small" />
            )}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default ColumnMappingSection;
