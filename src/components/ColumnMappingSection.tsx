
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
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon,
  Storage as StorageIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon
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
    <Paper elevation={2} sx={{ p: 4, mb: 3, backgroundColor: '#fafafa', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
          Step 2: Map Your Columns
        </Typography>
        <Tooltip title="Map your CSV columns to ProductTypeDto fields. Unmapped columns will be stored as metadata.">
          <InfoIcon color="action" />
        </Tooltip>
      </Box>
      
      {/* API Fields Reference Card */}
      <Card sx={{ mb: 3, border: '2px solid #e3f2fd', backgroundColor: '#f8faff' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon />
            ProductTypeDto Fields Reference
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {requiredApiFields.map(field => (
              <Chip 
                key={field}
                label={field}
                variant={mappedFields.includes(field) ? 'filled' : 'outlined'}
                color={mappedFields.includes(field) ? 'success' : 'default'}
                size="medium"
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Important:</strong> Each DTO field can only be mapped to one column. 
              Columns that don't match any DTO field should use <strong>metaData</strong> (selected by default).
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Validation Alerts */}
      {unmappedRequiredFields.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Missing required mappings:</strong> {unmappedRequiredFields.join(', ')}
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
      
      {/* Mapping Table */}
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600, minWidth: 180 }}>CSV Column</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 60 }}></TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 300 }}>Map to DTO Field</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {columnMappings.map((mapping, index) => (
              <TableRow 
                key={mapping.originalName}
                sx={{ 
                  backgroundColor: mapping.isValid ? '#f9fff9' : '#fff5f5',
                  '&:hover': { backgroundColor: mapping.isValid ? '#f0fff0' : '#ffebee' }
                }}
              >
                <TableCell>
                  <Chip 
                    label={mapping.originalName}
                    variant="filled"
                    color="primary"
                    sx={{ fontWeight: 600, maxWidth: '100%' }}
                  />
                </TableCell>
                
                <TableCell align="center">
                  <ArrowForwardIcon color="action" />
                </TableCell>
                
                <TableCell>
                  <FormControl 
                    size="small" 
                    fullWidth
                    error={!mapping.isValid}
                  >
                    <InputLabel>Select Field Mapping</InputLabel>
                    <Select
                      value={mapping.mappedName}
                      onChange={(e) => onColumnMappingChange(index, e.target.value)}
                      label="Select Field Mapping"
                    >
                      <MenuItem value="metaData">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StorageIcon fontSize="small" color="secondary" />
                          <Typography sx={{ fontWeight: 500 }}>metaData (recommended)</Typography>
                        </Box>
                      </MenuItem>
                      <Divider />
                      {requiredApiFields.map(field => (
                        <MenuItem 
                          key={field} 
                          value={field}
                          disabled={fieldUsageCount.get(field) > 0 && mapping.mappedName !== field}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'space-between' }}>
                            <span>{field}</span>
                            {fieldUsageCount.get(field) > 0 && mapping.mappedName !== field && (
                              <Chip size="small" label="Used" color="secondary" variant="outlined" />
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
                </TableCell>
                
                <TableCell>
                  {mapping.isValid ? (
                    mapping.isMetadata ? (
                      <Chip 
                        icon={<StorageIcon />} 
                        label="Metadata" 
                        color="secondary" 
                        size="small"
                        variant="filled"
                      />
                    ) : (
                      <Chip 
                        icon={<CheckCircleIcon />} 
                        label="Mapped" 
                        color="success" 
                        size="small"
                        variant="filled"
                      />
                    )
                  ) : (
                    <Chip 
                      icon={<ErrorIcon />} 
                      label="Invalid" 
                      color="error" 
                      size="small"
                      variant="filled"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ColumnMappingSection;
