import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

import { Box } from '@mui/material';
import { ReactComponent as CloseSliderIcon } from 'assets/svg/CloseSliderIcon.svg';
import { ReactComponent as LeftArrow } from 'assets/svg/LeftArrow.svg';
import { ReactComponent as RightArrow } from 'assets/svg/RightArrow.svg';
import PropTypes from 'prop-types';
import React from 'react';
import { useRef } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Video from 'yet-another-react-lightbox/plugins/video';

import { useStyles } from './thumbnailSlider';
const ThumbnailSlider = ({ files, open, setOpen }) => {
  const thumbnailsRef = useRef(null);
  const classes = useStyles();

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggleThumbnails = () => {
    if (thumbnailsRef.current?.visible) {
      thumbnailsRef.current?.hide?.();
    } else {
      thumbnailsRef.current?.show?.();
    }
  };

  return (
    <Box className={classes.liteBox}>
      <Lightbox
        styles={{ root: { '--yarl__color_backdrop': 'rgba(0, 0, 0, .5)' } }}
        open={open}
        close={handleClose}
        slides={files}
        plugins={[Thumbnails, Video]}
        thumbnails={{
          ref: thumbnailsRef,
          width: 80,
          height: 130,
          imageFit: 'cover',
          borderRadius: 8,
          padding: 0,
          gap: 19,
          borderColor: 'transparent',
        }}
        carousel={{
          padding: '50px',
          borderRadius: 8,
        }}
        video={{
          controls: true,
          autoPlay: true,
          muted: true,
          disablePictureInPicture: true,
          disableRemotePlayback: true,
        }}
        on={{
          click: handleToggleThumbnails,
        }}
        render={{
          iconPrev: () => <LeftArrow />,
          iconNext: () => <RightArrow />,
          iconClose: () => <CloseSliderIcon />,
        }}
      />
    </Box>
  );
};

ThumbnailSlider.propTypes = {
  files: PropTypes.string,
  usedFrom: PropTypes.string,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export default ThumbnailSlider;
