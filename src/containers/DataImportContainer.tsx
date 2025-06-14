import React, { useState, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import { Box, Typography, Button, Fab } from '@mui/material';
import { 
  Upload as UploadIcon, 
  Add as AddIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { type MRT_Row } from 'material-react-table';

import FileUploadSection from '../components/FileUploadSection';
import ColumnMappingSection from '../components/ColumnMappingSection';
import DataGridSection from '../components/DataGridSection';
import EditRowDialog from '../components/EditRowDialog';
import ProductDataGrid from '../components/ProductDataGrid';
import AddProductDialog from '../components/AddProductDialog';
import { useCustomToast } from '../hooks/useCustomToast';

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

interface ProductTypeDto {
  id?: string;
  companyID: string;
  productTypeID: string;
  companyName: string;
  productName: string;
  productDescription: any;
  productImage: string;
  globalProductCategory: string;
  netContent: number;
  metaData?: Record<string, any>;
}

type ViewMode = 'productGrid' | 'csvImport';

const DataImportContainer: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('productGrid');
  const [productData, setProductData] = useState<ProductTypeDto[]>([]);
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [originalColumns, setOriginalColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<EditDialogData>({
    open: false,
    rowData: null,
    rowIndex: null,
  });
  const [editFormData, setEditFormData] = useState<CSVData>({});

  const { showSuccess, showError, ToastComponent } = useCustomToast();

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

  // Simulate API call to fetch existing products
  useEffect(() => {
    const fetchProducts = async () => {
      // Simulate API delay
      setTimeout(() => {
        const mockProducts: ProductTypeDto[] = [
          {
            id: '1',
            companyID: 'COMP001',
            productTypeID: 'PT001',
            companyName: 'Acme Corp',
            productName: 'Premium Widget',
            productDescription: 'High-quality widget for professional use',
            productImage: 'https://via.placeholder.com/150',
            globalProductCategory: 'Electronics',
            netContent: 250,
            metaData: { weight: '1.5kg', color: 'blue' }
          },
          {
            id: '2',
            companyID: 'COMP002',
            productTypeID: 'PT002',
            companyName: 'Tech Solutions',
            productName: 'Smart Device',
            productDescription: 'IoT enabled smart device',
            productImage: 'https://via.placeholder.com/150',
            globalProductCategory: 'Technology',
            netContent: 500,
            metaData: { connectivity: 'WiFi', battery: '10 hours' }
          }
        ];
        setProductData(mockProducts);
        showSuccess('Products loaded successfully');
      }, 1000);
    };

    fetchProducts();
  }, [showSuccess]);

  const validateAllColumnMappings = (mappings: ColumnMapping[]): ColumnMapping[] => {
    const updatedMappings = [...mappings];
    const dtoFieldUsage = new Map<string, number>(); // Track how many times each DTO field is used
    
    // Count usage of each DTO field
    mappings.forEach(mapping => {
      if (!mapping.isMetadata && mapping.mappedName && mapping.mappedName !== '' && mapping.mappedName !== 'metaData') {
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
      showError('Please upload a valid CSV file');
      return;
    }

    Papa.parse(file, {
      complete: (results) => {
        console.log('CSV Parse Results:', results);
        
        if (results.errors.length > 0) {
          showError('Error parsing CSV file');
          return;
        }

        const data = results.data as string[][];
        if (data.length < 2) {
          showError('CSV file must contain header and at least one data row');
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

        // Initialize mappings with metaData as default
        const initialMappings: ColumnMapping[] = headers.map(header => ({
          originalName: header,
          mappedName: 'metaData',
          isValid: true,
          isMetadata: true,
          errorMessage: undefined,
        }));

        setOriginalColumns(headers);
        setColumnMappings(initialMappings);
        setCsvData(csvObjects);
        showSuccess(`Successfully loaded ${csvObjects.length} rows`);
      },
      header: false,
      skipEmptyLines: true,
    });

    event.target.value = '';
  }, [showError, showSuccess]);

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
    showSuccess('Row deleted successfully');
  };

  const handleSaveEdit = () => {
    if (editDialog.rowIndex !== null) {
      const updatedData = [...csvData];
      updatedData[editDialog.rowIndex] = editFormData;
      setCsvData(updatedData);
      setEditDialog({ open: false, rowData: null, rowIndex: null });
      setEditFormData({});
      showSuccess('Row updated successfully');
    }
  };

  const handleCloseEdit = () => {
    setEditDialog({ open: false, rowData: null, rowIndex: null });
    setEditFormData({});
  };

  const handleUploadToAPI = () => {
    const invalidMappings = columnMappings.filter(mapping => !mapping.isValid);
    if (invalidMappings.length > 0) {
      showError('Please fix all column mapping issues before uploading');
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
      showError(`Missing required fields: ${missingFields.join(', ')}`);
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
      showError(`Duplicate mappings found for: ${duplicatedFields.join(', ')}`);
      return;
    }

    const transformedData = csvData.map((row, index) => {
      const newRow: any = {
        id: `temp-${index}`, // Temporary ID for testing
      };
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

      return newRow as ProductTypeDto;
    });

    console.log('Data ready for API upload:', transformedData);
    
    // Simulate API upload and add to existing product data
    setTimeout(() => {
      const updatedProducts = [...productData, ...transformedData];
      setProductData(updatedProducts);
      setViewMode('productGrid');
      showSuccess(`Successfully uploaded ${transformedData.length} records!`);
    }, 1000);
  };

  // ProductDataGrid handlers
  const handleProductUpdate = (id: string, updatedData: ProductTypeDto) => {
    console.log('Updating product:', id, updatedData);
    const updatedProducts = productData.map(product => 
      product.id === id ? updatedData : product
    );
    setProductData(updatedProducts);
    showSuccess('Product updated successfully');
  };

  const handleProductDelete = (id: string) => {
    console.log('Deleting product:', id);
    const updatedProducts = productData.filter(product => product.id !== id);
    setProductData(updatedProducts);
    showSuccess('Product deleted successfully');
  };

  const handleImageUpload = (id: string, file: File) => {
    console.log('Uploading image for product:', id, file);
    // Simulate S3 upload - in real implementation, this would get signed URL and upload
    const mockImageUrl = URL.createObjectURL(file);
    const updatedProducts = productData.map(product => 
      product.id === id ? { ...product, productImage: mockImageUrl } : product
    );
    setProductData(updatedProducts);
    showSuccess('Image uploaded successfully');
  };

  const handleAddProduct = (newProduct: Omit<ProductTypeDto, 'id'>) => {
    const productWithId = {
      ...newProduct,
      id: `new-${Date.now()}`,
    };
    setProductData([...productData, productWithId]);
    setAddProductDialogOpen(false);
    showSuccess('Product added successfully');
  };

  if (viewMode === 'csvImport') {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setViewMode('productGrid')}
            variant="outlined"
          >
            Back to Products
          </Button>
          <Typography variant="h4">
            CSV Data Import & Mapping Tool
          </Typography>
        </Box>
        
        <FileUploadSection
          onFileUpload={handleFileUpload}
          dataCount={csvData.length}
          columnCount={originalColumns.length}
          onUploadToAPI={handleUploadToAPI}
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

        <EditRowDialog
          open={editDialog.open}
          originalColumns={originalColumns}
          editFormData={editFormData}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
          onFormDataChange={setEditFormData}
        />

        {ToastComponent}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Product Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setViewMode('csvImport')}
          >
            Import CSV Data
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddProductDialogOpen(true)}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      <ProductDataGrid
        data={productData}
        onUpdate={handleProductUpdate}
        onDelete={handleProductDelete}
        onImageUpload={handleImageUpload}
      />

      <AddProductDialog
        open={addProductDialogOpen}
        onClose={() => setAddProductDialogOpen(false)}
        onSave={handleAddProduct}
        requiredApiFields={requiredApiFields}
      />

      {ToastComponent}
    </Box>
  );
};

export default DataImportContainer;
