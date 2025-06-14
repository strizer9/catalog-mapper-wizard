
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Input,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  useMaterialReactTable,
} from 'material-react-table';
import { useCustomToast } from '../hooks/useCustomToast';

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

interface ProductDataGridProps {
  data: ProductTypeDto[];
  onUpdate: (id: string, updatedData: ProductTypeDto) => void;
  onDelete: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
}

interface ConfirmationDialogState {
  open: boolean;
  type: 'delete' | 'update' | null;
  itemId: string | null;
  itemData?: ProductTypeDto;
}

const ProductDataGrid: React.FC<ProductDataGridProps> = ({
  data,
  onUpdate,
  onDelete,
  onImageUpload,
}) => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialogState>({
    open: false,
    type: null,
    itemId: null,
  });
  const { showSuccess, showError, ToastComponent } = useCustomToast();

  const handleEdit = (row: MRT_Row<ProductTypeDto>) => {
    setConfirmDialog({
      open: true,
      type: 'update',
      itemId: row.original.id || '',
      itemData: row.original,
    });
  };

  const handleDelete = (row: MRT_Row<ProductTypeDto>) => {
    setConfirmDialog({
      open: true,
      type: 'delete',
      itemId: row.original.id || '',
    });
  };

  const handleConfirm = () => {
    if (!confirmDialog.itemId) return;

    if (confirmDialog.type === 'delete') {
      onDelete(confirmDialog.itemId);
      showSuccess('Product deleted successfully');
    } else if (confirmDialog.type === 'update' && confirmDialog.itemData) {
      onUpdate(confirmDialog.itemId, confirmDialog.itemData);
      showSuccess('Product updated successfully');
    }

    setConfirmDialog({ open: false, type: null, itemId: null });
  };

  const handleImageUpload = (productId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onImageUpload(productId, file);
        showSuccess('Image upload initiated');
      } else {
        showError('Please select a valid image file');
      }
    }
  };

  const columns: MRT_ColumnDef<ProductTypeDto>[] = [
    {
      accessorKey: 'companyID',
      header: 'Company ID',
      size: 120,
    },
    {
      accessorKey: 'productTypeID',
      header: 'Product Type ID',
      size: 130,
    },
    {
      accessorKey: 'companyName',
      header: 'Company Name',
      size: 150,
    },
    {
      accessorKey: 'productName',
      header: 'Product Name',
      size: 150,
    },
    {
      accessorKey: 'globalProductCategory',
      header: 'Category',
      size: 130,
    },
    {
      accessorKey: 'netContent',
      header: 'Net Content',
      size: 100,
    },
    {
      accessorKey: 'productImage',
      header: 'Image',
      size: 100,
      Cell: ({ cell, row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {cell.getValue() && (
            <img
              src={cell.getValue() as string}
              alt="Product"
              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id={`image-upload-${row.original.id}`}
            type="file"
            onChange={(e) => handleImageUpload(row.original.id || '', e)}
          />
          <label htmlFor={`image-upload-${row.original.id}`}>
            <IconButton color="primary" component="span" size="small">
              <CloudUploadIcon fontSize="small" />
            </IconButton>
          </label>
        </Box>
      ),
    },
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
            onClick={() => handleEdit(row)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(row)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data,
    enableRowSelection: false,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    muiTableContainerProps: {
      sx: {
        maxHeight: '600px',
      },
    },
  });

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Product Data Management
      </Typography>
      <MaterialReactTable table={table} />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: null, itemId: null })}
      >
        <DialogTitle>
          {confirmDialog.type === 'delete' ? 'Confirm Delete' : 'Confirm Update'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.type === 'delete'
              ? 'Are you sure you want to delete this product? This action cannot be undone.'
              : 'Are you sure you want to update this product?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, type: null, itemId: null })}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" variant="contained">
            {confirmDialog.type === 'delete' ? 'Delete' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {ToastComponent}
    </Paper>
  );
};

export default ProductDataGrid;
