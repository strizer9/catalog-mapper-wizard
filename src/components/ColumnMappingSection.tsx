
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stack, 
  Chip, 
  TextField,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon,
  Storage as StorageIcon
} from '@mui/icons-material';

interface ColumnMapping {
  originalName: string;
  mappedName: string;
  isValid: boolean;
  isMetadata: boolean;
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
      
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Required ProductTypeDto fields:</strong> {requiredApiFields.join(', ')}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Columns that don't match DTO fields can be mapped to <strong>metaData</strong> container.
        </Typography>
      </Alert>
      
      <Stack spacing={2}>
        {columnMappings.map((mapping, index) => (
          <Box key={mapping.originalName} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={mapping.originalName}
              variant="outlined"
              sx={{ minWidth: 120 }}
            />
            <Typography variant="body2">→</Typography>
            
            {mapping.isMetadata ? (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Field Mapping</InputLabel>
                <Select
                  value={mapping.mappedName}
                  onChange={(e) => onColumnMappingChange(index, e.target.value)}
                  label="Field Mapping"
                >
                  <MenuItem value="metaData">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StorageIcon fontSize="small" />
                      metaData (container)
                    </Box>
                  </MenuItem>
                  {requiredApiFields.map(field => (
                    <MenuItem key={field} value={field}>{field}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                size="small"
                value={mapping.mappedName}
                onChange={(e) => onColumnMappingChange(index, e.target.value)}
                error={!mapping.isValid}
                helperText={mapping.errorMessage}
                placeholder="Enter ProductTypeDto field name or 'metaData'"
                sx={{ minWidth: 200 }}
              />
            )}
            
            {mapping.isValid ? (
              mapping.isMetadata ? (
                <Chip 
                  icon={<StorageIcon />} 
                  label="Metadata" 
                  color="secondary" 
                  size="small" 
                />
              ) : (
                <CheckCircleIcon color="success" fontSize="small" />
              )
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
