import { Box } from '@mui/material';
import NewDateRangePicker from 'commonComponents/newDateRangePicker';
import React, { useState } from 'react';

const QaModule = () => {
  const [selectedDates, setSelectedDates] = useState([]);

  return (
    <>
      <Box>
        <NewDateRangePicker selectedDates={selectedDates} setDates={setSelectedDates} />
      </Box>
    </>
  );
};

export default QaModule;
