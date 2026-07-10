// Import necessary modules and components
import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react'; // Update the import statement
import { Document } from 'react-pdf';

import DrawerHeader from '../../components/drawerHeader/index.jsx';
import { useStyles } from './previewDrawer.js';

// Declare the dummy PDF link outside of the component

const dummyPdfLink = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const PreviewPDFDrawer = ({ anchor, dealCloseDrawer, width }) => {
  const classes = useStyles();

  return (
    <Box
      className={classes?.siderBarBox}
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
      role="presentation"
      component="form"
    >
      <Stack className={classes?.boxInner} justifyContent="space-between">
        <DrawerHeader handleCloseDrawer={dealCloseDrawer} anchor={anchor} />

        <Box className={classes.pdfView}>
          ADD PDF LINK HERE
          <Document
            file={{
              url: dummyPdfLink, // Use the dummy PDF link here
            }}
          >
            {/* Render the PDF pages as needed */}
          </Document>
        </Box>
      </Stack>
    </Box>
  );
};

PreviewPDFDrawer.propTypes = {
  anchor: PropTypes.string,
  dealCloseDrawer: PropTypes.func,
  width: PropTypes.number,
};

export default PreviewPDFDrawer;
