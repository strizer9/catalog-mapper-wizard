
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  Typography,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';

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

interface EditProductDialogProps {
  open: boolean;
  product: ProductTypeDto | null;
  onClose: () => void;
  onSave: (product: ProductTypeDto) => void;
  onImageUpload: (productId: string, file: File) => void;
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

const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  product,
  onClose,
  onSave,
  onImageUpload,
}) => {
  const [formData, setFormData] = useState<ProductTypeDto>({
    id: '',
    companyID: '',
    productTypeID: '',
    companyName: '',
    productName: '',
    productDescription: '',
    productImage: '',
    globalProductCategory: '',
    netContent: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleInputChange = (field: keyof ProductTypeDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && formData.id) {
      if (file.type.startsWith('image/')) {
        onImageUpload(formData.id, file);
        // Create temporary URL for preview
        const imageUrl = URL.createObjectURL(file);
        handleInputChange('productImage', imageUrl);
      }
    }
  };

  const handleRemoveImage = () => {
    handleInputChange('productImage', '');
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 2, fontSize: '1.5rem', fontWeight: 600 }}>
        Edit Product
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {/* Image Upload Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
            <Avatar
              src={formData.productImage}
              sx={{ width: 80, height: 80 }}
              variant="rounded"
            >
              {!formData.productImage && 'IMG'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Product Image
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload-edit"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload-edit">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    size="small"
                  >
                    Upload Image
                  </Button>
                </label>
                {formData.productImage && (
                  <IconButton
                    size="small"
                    onClick={handleRemoveImage}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Company ID"
              value={formData.companyID}
              onChange={(e) => handleInputChange('companyID', e.target.value)}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              label="Product Type ID"
              value={formData.productTypeID}
              onChange={(e) => handleInputChange('productTypeID', e.target.value)}
              fullWidth
              required
              variant="outlined"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              label="Product Name"
              value={formData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              fullWidth
              required
              variant="outlined"
            />
          </Box>

          <TextField
            label="Product Description"
            value={formData.productDescription}
            onChange={(e) => handleInputChange('productDescription', e.target.value)}
            fullWidth
            multiline
            rows={3}
            required
            variant="outlined"
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
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
            
            <TextField
              label="Net Content"
              type="number"
              value={formData.netContent}
              onChange={(e) => handleInputChange('netContent', parseFloat(e.target.value) || 0)}
              fullWidth
              required
              variant="outlined"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} variant="outlined" size="large">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!isFormValid()}
          size="large"
          sx={{ minWidth: 120 }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductDialog;
