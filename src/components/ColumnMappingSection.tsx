
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Stack, 
  Chip, 
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon,
  Storage as StorageIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon
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
    <Paper sx={{ p: 4, mb: 3, backgroundColor: '#fafafa' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        2. Map Column Names
      </Typography>
      
      <Card sx={{ mb: 3, border: '1px solid #e3f2fd' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
            ProductTypeDto Required Fields
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {requiredApiFields.map(field => (
              <Chip 
                key={field}
                label={field}
                variant="outlined"
                color={mappedFields.includes(field) ? 'success' : 'default'}
                size="small"
              />
            ))}
          </Box>
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Each DTO field can only be mapped to <strong>one column</strong>. Unmapped columns should be assigned to <strong>metaData</strong>.
          </Typography>
        </CardContent>
      </Card>

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

      <Divider sx={{ my: 3 }} />
      
      <Grid container spacing={2}>
        {columnMappings.map((mapping, index) => (
          <Grid item xs={12} key={mapping.originalName}>
            <Card sx={{ 
              border: mapping.isValid ? '1px solid #4caf50' : '1px solid #f44336',
              backgroundColor: mapping.isValid ? '#f9fff9' : '#fff5f5'
            }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ minWidth: 150 }}>
                    <Chip 
                      label={mapping.originalName}
                      variant="filled"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  
                  <ArrowForwardIcon color="action" />
                  
                  <Box sx={{ flex: 1, maxWidth: 300 }}>
                    <FormControl 
                      size="small" 
                      fullWidth
                      error={!mapping.isValid}
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
                  
                  <Box sx={{ minWidth: 120 }}>
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ColumnMappingSection;
