import Joi from 'joi';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const fileUploadSchema = Joi.object({
  type: Joi.string()
    .valid(...ALLOWED_MIME_TYPES)
    .required()
    .messages({
      'any.only': 'Please upload file in the following format: pdf/doc/docx/JPG/JPEG/PNG',
      'any.required': 'Please upload file in the following format: pdf/doc/docx/JPG/JPEG/PNG',
      'string.empty': 'Please upload file in the following format: pdf/doc/docx/JPG/JPEG/PNG',
    }),
  size: Joi.number().max(MAX_FILE_SIZE).required().messages({
    'number.max': 'Size cannot exceed 10MB.',
  }),
}).unknown(true);

export const validateFileUpload = (file) => {
  const { error } = fileUploadSchema.validate(
    { type: file.type, size: file.size },
    { abortEarly: true, errors: { wrap: { label: '' } } },
  );
  if (error) {
    return error.details[0].message;
  }
  return null;
};
