import { Close as CloseIcon } from '@mui/icons-material';
import { Box, Button, Drawer, IconButton, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const useStyles = makeStyles((_theme) => ({
  drawer: {
    '& .MuiDrawer-paper': {
      width: '400px',
      padding: '24px',
      backgroundColor: '#ffffff',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e0e0e0',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#262527',
  },
  closeButton: {
    color: '#6A6A70',
    '&:hover': {
      backgroundColor: '#f5f5f6',
    },
  },
  content: {
    marginBottom: '24px',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#262527',
    marginBottom: '12px',
  },
  formRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  label: {
    flex: '0 0 200px',
    fontSize: '14px',
    color: '#5B5B5F',
    fontWeight: '500',
  },
  inputField: {
    flex: '1',
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#146DFF',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#146DFF',
      },
    },
  },
  unitLabel: {
    marginLeft: '8px',
    fontSize: '14px',
    color: '#6A6A70',
    fontWeight: '400',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0',
  },
  suggestButton: {
    minWidth: '120px',
  },
}));

const SuggestRate = ({ open, onClose }) => {
  const classes = useStyles();
  const [suggestedRate, setSuggestedRate] = useState({
    hourlyRate: '',
    dailyRate: '',
    weeklyRate: '',
    monthlyRate: '',
    notes: '',
  });

  const handleInputChange = (field, value) => {
    setSuggestedRate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSuggest = () => {
    // Handle suggest rate logic here
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} className={classes.drawer}>
      <Box>
        <Box className={classes.header}>
          <Typography className={classes.title}>Suggest Rate</Typography>
          <IconButton onClick={onClose} className={classes.closeButton} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box className={classes.content}>
          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>Rate Suggestions</Typography>

            <Box className={classes.formRow}>
              <Typography className={classes.label}>Hourly Rate</Typography>
              <TextField
                className={classes.inputField}
                variant="outlined"
                size="small"
                value={suggestedRate.hourlyRate}
                onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                type="number"
                placeholder="Enter hourly rate"
              />
              <Typography className={classes.unitLabel}>$</Typography>
            </Box>

            <Box className={classes.formRow}>
              <Typography className={classes.label}>Daily Rate</Typography>
              <TextField
                className={classes.inputField}
                variant="outlined"
                size="small"
                value={suggestedRate.dailyRate}
                onChange={(e) => handleInputChange('dailyRate', e.target.value)}
                type="number"
                placeholder="Enter daily rate"
              />
              <Typography className={classes.unitLabel}>$</Typography>
            </Box>

            <Box className={classes.formRow}>
              <Typography className={classes.label}>Weekly Rate</Typography>
              <TextField
                className={classes.inputField}
                variant="outlined"
                size="small"
                value={suggestedRate.weeklyRate}
                onChange={(e) => handleInputChange('weeklyRate', e.target.value)}
                type="number"
                placeholder="Enter weekly rate"
              />
              <Typography className={classes.unitLabel}>$</Typography>
            </Box>

            <Box className={classes.formRow}>
              <Typography className={classes.label}>Monthly Rate</Typography>
              <TextField
                className={classes.inputField}
                variant="outlined"
                size="small"
                value={suggestedRate.monthlyRate}
                onChange={(e) => handleInputChange('monthlyRate', e.target.value)}
                type="number"
                placeholder="Enter monthly rate"
              />
              <Typography className={classes.unitLabel}>$</Typography>
            </Box>
          </Box>

          <Box className={classes.section}>
            <Typography className={classes.sectionTitle}>Additional Notes</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Add any additional notes or reasoning for the suggested rates..."
              value={suggestedRate.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </Box>
        </Box>

        <Box className={classes.footer}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={classes.suggestButton}
            onClick={handleSuggest}
          >
            Suggest Rate
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

SuggestRate.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SuggestRate;
