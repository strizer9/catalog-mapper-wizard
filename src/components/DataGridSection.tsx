
import React, { useMemo } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  useMaterialReactTable,
} from 'material-react-table';

interface CSVData {
  [key: string]: any;
}

interface DataGridSectionProps {
  csvData: CSVData[];
  originalColumns: string[];
  onEditRow: (row: MRT_Row<CSVData>) => void;
  onDeleteRow: (row: MRT_Row<CSVData>) => void;
}

const DataGridSection: React.FC<DataGridSectionProps> = ({
  csvData,
  originalColumns,
  onEditRow,
  onDeleteRow,
}) => {
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
              onClick={() => onEditRow(row)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDeleteRow(row)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ];
  }, [originalColumns, onEditRow, onDeleteRow]);

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

  if (csvData.length === 0) return null;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        3. Review & Edit Data
      </Typography>
      <MaterialReactTable table={table} />
    </Paper>
  );
};

export default DataGridSection;
