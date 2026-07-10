import { Box } from '@mui/material';
import { ReactComponent as ResetIcon } from 'assets/svg/reset.svg';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
// import { useTranslation } from 'react-i18next';
import SignatureCanvas from 'react-signature-canvas';

import { useStyles } from './signaturePad.style';

const SignaturePad = (props) => {
  const [value, setValue] = useState(null);
  const classes = useStyles();
  // const { t } = useTranslation();
  const sigCanvas = useRef(null);

  const handleLocalChange = () => {
    if (!sigCanvas.current.isEmpty()) {
      const dataURL = sigCanvas.current.getCanvas().toDataURL('image/png');
      setValue(dataURL);
    }
  };

  // Populate canvas with saved signature image (safe via base64)
  useEffect(() => {
    const imgUrl = props?.answers?.[0]?.imgUrl;

    if (imgUrl && sigCanvas.current) {
      sigCanvas.current.clear(); // Optional: Clear any existing content before loading the image

      // Create an image element
      const image = new Image();
      image.crossOrigin = 'anonymous'; // Set CORS policy for the image
      image.src = imgUrl;

      // Once the image is loaded, draw it on the canvas
      image.onload = () => {
        const canvas = sigCanvas.current.getCanvas();
        const context = canvas.getContext('2d');

        // Draw the image on the canvas
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
      };

      image.onerror = () => {
        console.error('Error loading image');
      };
    }
  }, [props.answers?.length]);

  useEffect(() => {
    if (value !== null) {
      props?.handleChange({
        target: {
          value,
          name: props?.id,
        },
      });
    }
  }, [value]);

  useEffect(() => {
    if (props?.answers?.length) {
      const updatedAnswers = props?.answers?.map((answer) => {
        return {
          ...answer,
          alreadyUploaded: true,
        };
      });

      props?.handleChange({
        target: {
          value: updatedAnswers,
          name: props?.id,
        },
      });
    }
  }, [props?.answers]);

  return (
    <Box className={classes.signaturePadWrapper}>
      <Box className={classes.btn}>
        <Box
          onClick={() => {
            sigCanvas.current.clear();
            setValue(null);
            props?.handleChange({
              target: {
                value: '',
                name: props?.id,
              },
            });
          }}
        >
          <ResetIcon />
        </Box>
      </Box>
      <Box className={classes.borderSignature}>
        <SignatureCanvas
          penColor="black"
          canvasProps={{ className: `${classes.sigCanvas}` }}
          ref={sigCanvas}
          onEnd={handleLocalChange}
        />
      </Box>
    </Box>
  );
};

SignaturePad.propTypes = {
  handleChange: PropTypes.func.isRequired,
  nameField: PropTypes.string,
  id: PropTypes.number,
  answers: PropTypes.object,
};

export default SignaturePad;
