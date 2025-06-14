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
  isMetadata: boolean;
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

  const validateAllColumnMappings = (mappings: ColumnMapping[]): ColumnMapping[] => {
    const updatedMappings = [...mappings];
    const dtoFieldUsage = new Map<string, number>(); // Track how many times each DTO field is used
    
    // Count usage of each DTO field
    mappings.forEach(mapping => {
      if (!mapping.isMetadata && mapping.mappedName && mapping.mappedName !== '') {
        const currentCount = dtoFieldUsage.get(mapping.mappedName) || 0;
        dtoFieldUsage.set(mapping.mappedName, currentCount + 1);
      }
    });

    // Validate each mapping
    updatedMappings.forEach((mapping, index) => {
      if (!mapping.mappedName || mapping.mappedName.trim() === '') {
        updatedMappings[index] = {
          ...mapping,
          isValid: false,
          errorMessage: 'Please select a mapping for this column',
        };
      } else if (mapping.mappedName === 'metaData') {
        updatedMappings[index] = {
          ...mapping,
          isValid: true,
          isMetadata: true,
          errorMessage: undefined,
        };
      } else if (requiredApiFields.includes(mapping.mappedName)) {
        const usageCount = dtoFieldUsage.get(mapping.mappedName) || 0;
        if (usageCount > 1) {
          updatedMappings[index] = {
            ...mapping,
            isValid: false,
            isMetadata: false,
            errorMessage: `"${mapping.mappedName}" is already mapped to another column. Each DTO field can only be mapped once.`,
          };
        } else {
          updatedMappings[index] = {
            ...mapping,
            isValid: true,
            isMetadata: false,
            errorMessage: undefined,
          };
        }
      } else {
        updatedMappings[index] = {
          ...mapping,
          isValid: false,
          isMetadata: false,
          errorMessage: `"${mapping.mappedName}" is not a valid ProductTypeDto field. Please select from the available fields or choose metaData.`,
        };
      }
    });

    return updatedMappings;
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

        // Initialize mappings with empty values for proper validation
        const initialMappings: ColumnMapping[] = headers.map(header => ({
          originalName: header,
          mappedName: '',
          isValid: false,
          isMetadata: false,
          errorMessage: 'Please select a mapping for this column',
        }));

        const validatedMappings = validateAllColumnMappings(initialMappings);

        setOriginalColumns(headers);
        setColumnMappings(validatedMappings);
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
    updatedMappings[index] = {
      ...updatedMappings[index],
      mappedName: newMappedName,
    };
    
    // Validate all mappings after the change
    const validatedMappings = validateAllColumnMappings(updatedMappings);
    setColumnMappings(validatedMappings);
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
    const mappedDtoFields = columnMappings
      .filter(m => !m.isMetadata && m.isValid)
      .map(m => m.mappedName);
    
    const missingFields = requiredApiFields.filter(field => 
      !mappedDtoFields.includes(field)
    );

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Check for duplicate mappings (extra safety check)
    const dtoFieldCounts = new Map<string, number>();
    mappedDtoFields.forEach(field => {
      dtoFieldCounts.set(field, (dtoFieldCounts.get(field) || 0) + 1);
    });

    const duplicatedFields = Array.from(dtoFieldCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([field]) => field);

    if (duplicatedFields.length > 0) {
      toast.error(`Duplicate mappings found for: ${duplicatedFields.join(', ')}`);
      return;
    }

    const transformedData = csvData.map(row => {
      const newRow: CSVData = {};
      const metaDataObj: CSVData = {};

      columnMappings.forEach(mapping => {
        if (mapping.isMetadata) {
          metaDataObj[mapping.originalName] = row[mapping.originalName];
        } else {
          newRow[mapping.mappedName] = row[mapping.originalName];
        }
      });

      // Add metadata container if there are metadata fields
      if (Object.keys(metaDataObj).length > 0) {
        newRow.metaData = metaDataObj;
      }

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
