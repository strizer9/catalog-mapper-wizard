import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Box, Button, Typography } from '@mui/material';
import { type MRT_Row } from 'material-react-table';
import { toast } from 'sonner';

import FileUploadSection from './FileUploadSection';
import ColumnMappingSection from './ColumnMappingSection';
import DataGridSection from './DataGridSection';
import EditRowDialog from './EditRowDialog';

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

  // Required API fields based on ProductTypeDto
  const requiredApiFields = [
    'companyID',
    'productTypeID',
    'companyName',
    'productName',
    'productDescription',
    'productImage',
    'globalProductCategory',
    'netContent',
  ];

  const validateColumnName = (columnName: string): boolean => {
    if (!columnName || columnName.trim() === '') return false;
    
    const normalizedName = columnName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return requiredApiFields.some(field => 
      field.toLowerCase() === normalizedName ||
      normalizedName.includes(field.toLowerCase()) ||
      field.toLowerCase().includes(normalizedName)
    );
  };

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

        const csvObjects = rows.map(row => {
          const obj: CSVData = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });

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

    event.target.value = '';
  }, []);

  const handleColumnMappingChange = (index: number, newMappedName: string) => {
    const updatedMappings = [...columnMappings];
    const isValid = validateColumnName(newMappedName);
    
    updatedMappings[index] = {
      ...updatedMappings[index],
      mappedName: newMappedName,
      isValid,
      errorMessage: isValid ? undefined : 'Must match one of the required ProductTypeDto fields',
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

    // Check if all required fields are mapped
    const mappedFields = columnMappings.map(m => m.mappedName.toLowerCase());
    const missingFields = requiredApiFields.filter(field => 
      !mappedFields.some(mapped => mapped.includes(field.toLowerCase()))
    );

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    const transformedData = csvData.map(row => {
      const newRow: CSVData = {};
      columnMappings.forEach(mapping => {
        newRow[mapping.mappedName] = row[mapping.originalName];
      });
      return newRow;
    });

    console.log('Data ready for API upload:', transformedData);
    toast.success(`Ready to upload ${transformedData.length} records to API`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        CSV Data Import & Mapping Tool
      </Typography>
      
      <FileUploadSection
        onFileUpload={handleFileUpload}
        dataCount={csvData.length}
        columnCount={originalColumns.length}
      />

      <ColumnMappingSection
        columnMappings={columnMappings}
        onColumnMappingChange={handleColumnMappingChange}
        requiredApiFields={requiredApiFields}
      />

      <DataGridSection
        csvData={csvData}
        originalColumns={originalColumns}
        onEditRow={handleEditRow}
        onDeleteRow={handleDeleteRow}
      />

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

      <EditRowDialog
        open={editDialog.open}
        originalColumns={originalColumns}
        editFormData={editFormData}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
        onFormDataChange={setEditFormData}
      />
    </Box>
  );
};

export default CSVUploader;
