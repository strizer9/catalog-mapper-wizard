
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
  InputLabel,
  FormHelperText
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon,
  Storage as StorageIcon,
  Warning as WarningIcon
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

  // Count how many times each DTO field is mapped
  const fieldUsageCount = new Map<string, number>();
  columnMappings.forEach(mapping => {
    if (!mapping.isMetadata && mapping.mappedName && mapping.mappedName !== '') {
      fieldUsageCount.set(mapping.mappedName, (fieldUsageCount.get(mapping.mappedName) || 0) + 1);
    }
  });

  const mappedFields = Array.from(fieldUsageCount.keys());
  const unmappedRequiredFields = requiredApiFields.filter(field => !mappedFields.includes(field));
  const duplicatedFields = Array.from(fieldUsageCount.entries())
    .filter(([, count]) => count > 1)
    .map(([field]) => field);

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
          Each DTO field can only be mapped to <strong>one column</strong>. Unmapped columns should be assigned to <strong>metaData</strong>.
        </Typography>
      </Alert>

      {/* Validation Alerts */}
      {unmappedRequiredFields.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Missing required fields:</strong> {unmappedRequiredFields.join(', ')}
          </Typography>
        </Alert>
      )}

      {duplicatedFields.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Duplicate mappings detected:</strong> {duplicatedFields.join(', ')}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Each DTO field can only be mapped once. Please fix the duplicate mappings.
          </Typography>
        </Alert>
      )}
      
      <Stack spacing={2}>
        {columnMappings.map((mapping, index) => (
          <Box key={mapping.originalName} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Chip 
              label={mapping.originalName}
              variant="outlined"
              sx={{ minWidth: 120, mt: 1 }}
            />
            <Typography variant="body2" sx={{ mt: 1.5 }}>→</Typography>
            
            <Box sx={{ flex: 1 }}>
              <FormControl 
                size="small" 
                sx={{ minWidth: 200 }} 
                error={!mapping.isValid}
                fullWidth
              >
                <InputLabel>Field Mapping</InputLabel>
                <Select
                  value={mapping.mappedName}
                  onChange={(e) => onColumnMappingChange(index, e.target.value)}
                  label="Field Mapping"
                >
                  <MenuItem value="">
                    <em>Select mapping...</em>
                  </MenuItem>
                  <MenuItem value="metaData">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StorageIcon fontSize="small" />
                      metaData (container)
                    </Box>
                  </MenuItem>
                  {requiredApiFields.map(field => (
                    <MenuItem 
                      key={field} 
                      value={field}
                      disabled={fieldUsageCount.get(field) > 0 && mapping.mappedName !== field}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <span>{field}</span>
                        {fieldUsageCount.get(field) > 0 && mapping.mappedName !== field && (
                          <Chip 
                            size="small" 
                            label="Used" 
                            color="secondary" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {mapping.errorMessage && (
                  <FormHelperText error>
                    {mapping.errorMessage}
                  </FormHelperText>
                )}
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 100, mt: 1 }}>
              {mapping.isValid ? (
                mapping.isMetadata ? (
                  <Chip 
                    icon={<StorageIcon />} 
                    label="Metadata" 
                    color="secondary" 
                    size="small" 
                  />
                ) : (
                  <Chip 
                    icon={<CheckCircleIcon />} 
                    label="Mapped" 
                    color="success" 
                    size="small" 
                  />
                )
              ) : (
                <Chip 
                  icon={<ErrorIcon />} 
                  label="Invalid" 
                  color="error" 
                  size="small" 
                />
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default ColumnMappingSection;
