import { Box, Skeleton } from '@mui/material';
import PropTypes from 'prop-types';

import { useStyles } from './addServices.js';

const ServiceCardSkeleton = () => {
  const classes = useStyles();

  return (
    <Box className={classes.serviceBox}>
      <Box className={classes.serviceHeader}>
        <Skeleton animation="wave" variant="rounded" width="55%" height={22} />
        <Skeleton animation="wave" variant="rounded" width={72} height={22} />
      </Box>
      <Box className={classes.servicesInnerBox}>
        <Skeleton animation="wave" variant="rounded" width="40%" height={14} sx={{ mb: 1 }} />
        <Skeleton animation="wave" variant="rounded" width="100%" height={40} sx={{ mb: 2 }} />
        <Skeleton animation="wave" variant="rounded" width="50%" height={14} sx={{ mb: 1 }} />
        <Skeleton animation="wave" variant="rounded" width="100%" height={40} sx={{ mb: 2 }} />
        <Skeleton animation="wave" variant="rounded" width="35%" height={14} sx={{ mb: 1 }} />
        <Skeleton animation="wave" variant="rounded" width="100%" height={40} sx={{ mb: 2 }} />
        <Skeleton animation="wave" variant="rounded" width="30%" height={14} sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <Skeleton key={day} animation="wave" variant="circular" width={32} height={32} />
          ))}
        </Box>
        <Skeleton animation="wave" variant="rounded" width="45%" height={14} sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton animation="wave" variant="rounded" width="48%" height={40} />
          <Skeleton animation="wave" variant="rounded" width="48%" height={40} />
        </Box>
      </Box>
    </Box>
  );
};

ServiceCardSkeleton.propTypes = {
  index: PropTypes.number,
};

export default ServiceCardSkeleton;
