
import React, { useState, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  useMaterialReactTable,
} from 'material-react-table';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Alert,
  Paper,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';

interface CSVData {
  [key: string]: any;
}

interface ColumnMapping {
  originalName: string;
  mappedName: string;
  isValid: boolean;
  errorMessage?: string;
}

interface EditDialogData {
  open: boolean;
  rowData: CSVData | null;
  rowIndex: number | null;
}

const CSVUploader: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [originalColumns, setOriginalColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [editDialog, setEditDialog] = useState<EditDialogData>({
    open: false,
    rowData: null,
    rowIndex: null,
  });
  const [editFormData, setEditFormData] = useState<CSVData>({});

  // Required API fields for validation
  const requiredApiFields = [
    'productName',
    'price',
    'category',
    'description',
    'sku',
    'stock',
  ];

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a valid CSV file');
      return;
    }

    Papa.parse(file, {
      complete: (results) => {
        console.log('CSV Parse Results:', results);
        
        if (results.errors.length > 0) {
          toast.error('Error parsing CSV file');
          return;
        }

        const data = results.data as string[][];
        if (data.length < 2) {
          toast.error('CSV file must contain header and at least one data row');
          return;
        }

        const headers = data[0];
        const rows = data.slice(1).filter(row => row.some(cell => cell.trim() !== ''));

        // Convert to objects
        const csvObjects = rows.map(row => {
          const obj: CSVData = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });

        // Initialize column mappings
        const mappings: ColumnMapping[] = headers.map(header => ({
          originalName: header,
          mappedName: header,
          isValid: validateColumnName(header),
          errorMessage: validateColumnName(header) ? undefined : 'Column name should match API requirements',
        }));

        setOriginalColumns(headers);
        setColumnMappings(mappings);
        setCsvData(csvObjects);
        toast.success(`Successfully loaded ${csvObjects.length} rows`);
      },
      header: false,
      skipEmptyLines: true,
    });

    // Reset file input
    event.target.value = '';
  }, []);

  const validateColumnName = (columnName: string): boolean => {
    // Basic validation - check if it matches common patterns or required fields
    const normalizedName = columnName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return requiredApiFields.some(field => 
      field.toLowerCase().includes(normalizedName) || 
      normalizedName.includes(field.toLowerCase())
    ) || normalizedName.length > 2;
  };

  const handleColumnMappingChange = (index: number, newMappedName: string) => {
    const updatedMappings = [...columnMappings];
    updatedMappings[index] = {
      ...updatedMappings[index],
      mappedName: newMappedName,
      isValid: validateColumnName(newMappedName),
      errorMessage: validateColumnName(newMappedName) ? undefined : 'Invalid column name for API',
    };
    setColumnMappings(updatedMappings);
  };

  const handleEditRow = (row: MRT_Row<CSVData>) => {
    console.log('Editing row:', row.original);
    setEditFormData({ ...row.original });
    setEditDialog({
      open: true,
      rowData: row.original,
      rowIndex: row.index,
    });
  };

  const handleDeleteRow = (row: MRT_Row<CSVData>) => {
    const updatedData = csvData.filter((_, index) => index !== row.index);
    setCsvData(updatedData);
    toast.success('Row deleted successfully');
  };

  const handleSaveEdit = () => {
    if (editDialog.rowIndex !== null) {
      const updatedData = [...csvData];
      updatedData[editDialog.rowIndex] = editFormData;
      setCsvData(updatedData);
      setEditDialog({ open: false, rowData: null, rowIndex: null });
      setEditFormData({});
      toast.success('Row updated successfully');
    }
  };

  const handleCloseEdit = () => {
    setEditDialog({ open: false, rowData: null, rowIndex: null });
    setEditFormData({});
  };

  const handleUploadToAPI = () => {
    const invalidMappings = columnMappings.filter(mapping => !mapping.isValid);
    if (invalidMappings.length > 0) {
      toast.error('Please fix all column mapping issues before uploading');
      return;
    }

    // Transform data according to column mappings
    const transformedData = csvData.map(row => {
      const newRow: CSVData = {};
      columnMappings.forEach(mapping => {
        newRow[mapping.mappedName] = row[mapping.originalName];
      });
      return newRow;
    });

    console.log('Data ready for API upload:', transformedData);
    toast.success(`Ready to upload ${transformedData.length} records to API`);
    // Here you would make the actual API call
  };

  const columns = useMemo<MRT_ColumnDef<CSVData>[]>(() => {
    if (originalColumns.length === 0) return [];

    return [
      ...originalColumns.map((column): MRT_ColumnDef<CSVData> => ({
        accessorKey: column,
        header: column,
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2" noWrap>
            {cell.getValue() as string}
          </Typography>
        ),
      })),
      {
        id: 'actions',
        header: 'Actions',
        size: 120,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => handleEditRow(row)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteRow(row)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ];
  }, [originalColumns, csvData]);

  const table = useMaterialReactTable({
    columns,
    data: csvData,
    enableRowSelection: false,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    muiTableContainerProps: {
      sx: {
        maxHeight: '500px',
      },
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        CSV Data Import & Mapping Tool
      </Typography>
      
      {/* File Upload Section */}
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
            onChange={handleFileUpload}
          />
        </Button>
        
        {csvData.length > 0 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Successfully loaded {csvData.length} rows with {originalColumns.length} columns
          </Alert>
        )}
      </Paper>

      {/* Column Mapping Section */}
      {columnMappings.length > 0 && (
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
                  onChange={(e) => handleColumnMappingChange(index, e.target.value)}
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
      )}

      {/* Data Table Section */}
      {csvData.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            3. Review & Edit Data
          </Typography>
          <MaterialReactTable table={table} />
        </Paper>
      )}

      {/* Upload Button */}
      {csvData.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleUploadToAPI}
            disabled={columnMappings.some(mapping => !mapping.isValid)}
          >
            Upload to API ({csvData.length} records)
          </Button>
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={handleCloseEdit} maxWidth="md" fullWidth>
        <DialogTitle>Edit Row</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {originalColumns.map((column) => (
              <TextField
                key={column}
                label={column}
                value={editFormData[column] || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, [column]: e.target.value })
                }
                fullWidth
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CSVUploader;
