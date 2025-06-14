
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

interface ProductTypeDto {
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

interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Omit<ProductTypeDto, 'id'>) => void;
  requiredApiFields: string[];
}

const categories = [
  'Electronics',
  'Technology',
  'Food & Beverage',
  'Clothing',
  'Home & Garden',
  'Health & Beauty',
  'Sports & Outdoors',
  'Books & Media',
];

const AddProductDialog: React.FC<AddProductDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Omit<ProductTypeDto, 'id'>>({
    companyID: '',
    productTypeID: '',
    companyName: '',
    productName: '',
    productDescription: '',
    productImage: '',
    globalProductCategory: '',
    netContent: 0,
  });

  const handleInputChange = (field: keyof Omit<ProductTypeDto, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    // Reset form
    setFormData({
      companyID: '',
      productTypeID: '',
      companyName: '',
      productName: '',
      productDescription: '',
      productImage: '',
      globalProductCategory: '',
      netContent: 0,
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setFormData({
      companyID: '',
      productTypeID: '',
      companyName: '',
      productName: '',
      productDescription: '',
      productImage: '',
      globalProductCategory: '',
      netContent: 0,
    });
  };

  const isFormValid = () => {
    return (
      formData.companyID &&
      formData.productTypeID &&
      formData.companyName &&
      formData.productName &&
      formData.productDescription &&
      formData.globalProductCategory &&
      formData.netContent > 0
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Company ID"
              value={formData.companyID}
              onChange={(e) => handleInputChange('companyID', e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Product Type ID"
              value={formData.productTypeID}
              onChange={(e) => handleInputChange('productTypeID', e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Product Name"
              value={formData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Product Description"
              value={formData.productDescription}
              onChange={(e) => handleInputChange('productDescription', e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Global Product Category</InputLabel>
              <Select
                value={formData.globalProductCategory}
                onChange={(e) => handleInputChange('globalProductCategory', e.target.value)}
                label="Global Product Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Net Content"
              type="number"
              value={formData.netContent}
              onChange={(e) => handleInputChange('netContent', parseFloat(e.target.value) || 0)}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Product Image URL (optional)"
              value={formData.productImage}
              onChange={(e) => handleInputChange('productImage', e.target.value)}
              fullWidth
              placeholder="https://example.com/image.jpg"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!isFormValid()}
        >
          Add Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductDialog;
