
import React, { useState } from 'react';
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

// Simulate S3 signed URL API call
const getSignedUrl = async (fileName: string, fileType: string): Promise<string> => {
  // In real implementation, this would call your API
  console.log('Requesting signed URL for:', fileName, fileType);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock signed URL
  return `https://mock-s3-bucket.s3.amazonaws.com/products/${fileName}?signature=mock-signature`;
};

const uploadToS3 = async (signedUrl: string, file: File): Promise<void> => {
  // In real implementation, this would upload to S3 using the signed URL
  console.log('Uploading to S3:', signedUrl, file);
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
};

const AddProductDialog: React.FC<AddProductDialogProps> = ({
  open,
  onClose,
  onSave,
  onImageUpload,
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
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (field: keyof Omit<ProductTypeDto, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    setIsUploading(true);
    
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      
      // Get signed URL
      const signedUrl = await getSignedUrl(fileName, file.type);
      
      // Upload to S3
      await uploadToS3(signedUrl, file);
      
      // Update form data with the filename (not the full URL)
      handleInputChange('productImage', fileName);
      
      // Create temporary URL for preview
      const previewUrl = URL.createObjectURL(file);
      
      console.log('Image uploaded successfully:', fileName);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    handleInputChange('productImage', '');
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
      <DialogTitle sx={{ pb: 2, fontSize: '1.5rem', fontWeight: 600 }}>
        Add New Product
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {/* Image Upload Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
            <Avatar
              src={formData.productImage ? URL.createObjectURL(new Blob()) : undefined}
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
                  id="image-upload-add"
                  type="file"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <label htmlFor="image-upload-add">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    size="small"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </label>
                {formData.productImage && (
                  <IconButton
                    size="small"
                    onClick={handleRemoveImage}
                    color="error"
                    disabled={isUploading}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              {formData.productImage && (
                <Typography variant="caption" color="text.secondary">
                  File: {formData.productImage}
                </Typography>
              )}
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
        <Button onClick={handleClose} variant="outlined" size="large">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!isFormValid() || isUploading}
          size="large"
          sx={{ minWidth: 120 }}
        >
          Add Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductDialog;
