import { Box, Button, Popover, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as Calendar } from 'assets/svg/calendar.svg';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { DateRange } from 'react-date-range';
import { formatDate } from 'src/helper/utilityFunctions';

const useStyles = makeStyles((_theme) => ({
  rangePicker: {
    '& .MuiFormControl-root': {
      '& .MuiInputBase-root': {
        '& .MuiButtonBase-root': {
          minWidth: '16px',
          padding: '0',
          marginLeft: '8px',
        },
      },
    },
  },
}));

const NewDateRangePicker = ({ setDates, selectedDates, minDate, maxDate, format, placeHolder }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();

  const handleDateSelect = (ranges) => {
    if (Array.isArray(ranges)) {
      setDates([dayjs(ranges[0]?.dates?.startDate), dayjs(ranges[0]?.dates?.endDate)]);
    } else {
      setDates([dayjs(ranges?.dates?.startDate), dayjs(ranges?.dates?.endDate)]);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const ranges = useMemo(() => {
    return [
      {
        startDate: selectedDates?.[0]?.toDate(),
        endDate: selectedDates?.[1]?.toDate(),
        key: 'dates',
      },
    ];
  }, [selectedDates, selectedDates?.[0], selectedDates?.[1]]);

  const getPlaceholderSelectedValue = (startDate, endDate, format) => {
    let selectedVal = '';

    if (startDate) {
      let startVal = formatDate(startDate, format);
      selectedVal = startVal;
    }

    if (endDate) {
      let endVal = formatDate(endDate, format);
      selectedVal += ' - ';
      selectedVal += endVal;
    }

    return selectedVal;
  };

  const open = Boolean(anchorEl);
  const id = open ? 'date-picker-popover' : undefined;

  const validationProps = {};

  if (minDate) {
    validationProps.minDate = minDate.toDate();
  }
  if (maxDate) {
    validationProps.maxDate = maxDate.toDate();
  }

  const val = getPlaceholderSelectedValue(selectedDates?.[0], selectedDates?.[1], format);

  return (
    <Box className={classes.rangePicker}>
      <TextField
        placeholder={placeHolder}
        InputProps={{
          endAdornment: (
            <Button onClick={handleClick}>
              <Calendar />
            </Button>
          ),
        }}
        value={val}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <DateRange
          ranges={ranges}
          onChange={handleDateSelect}
          moveRangeOnFirstSelection={false}
          ariaLabels={{}}
          staticRanges={[]}
          inputRanges={[]}
          showPreview={true}
          showSelectionPreview={true}
          {...validationProps}
        />
      </Popover>
    </Box>
  );
};

NewDateRangePicker.propTypes = {
  selectedDates: PropTypes.array.isRequired,
  setDates: PropTypes.func.isRequired,
  format: PropTypes.string,
  enableSingleDateSelection: PropTypes.bool,
  placeHolder: PropTypes.string,
  styleClass: PropTypes.string,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
};

NewDateRangePicker.defaultProps = {
  placeHolder: 'mm/dd/yyyy – mm/dd/yyyy',
  onClose: () => {},
  onOpen: () => {},
  format: 'MM/DD/YYYY',
  minDate: null,
  maxDate: null,
  styleClass: '',
};

export default NewDateRangePicker;
