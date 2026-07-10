import Joi from 'joi';
import {
  FormKeys as AddServicesFormKeys,
  serviceTypes,
} from 'src/app/components/salesComponents/contractCreation/addServices/helper';
import { ActiveStepsKeys as ContractFormKeys } from 'src/app/sales/pages/contractCreation/helper';

import { trimFormValues } from './utils';

//if form attributes have camelCase keys
const errorMessages = {
  sectionsAttributes: 'Section',
  questionStatement: 'Question statement',
  optionsAttributes: 'Question Option',
  reportTitle: 'Report Name',
  sectionTitle: 'Section Name',
  QuestionTitle: 'Question Name',
  questionsAttributes: 'Question',
  reqOfficers: 'Number of Officers',
  optionText: 'Option label',
  questionsIndustryVerticalAttributes: 'Industry Verticals',
  associatedSites: 'Sites',
  timeValue: 'Value',
  rateValue: 'Rate',
  leaveReason: 'Reason',
  pricePerHit: 'Price',
  zoneId: 'Zone',
  startsAt: 'Start Time',
  endsAt: 'End Time',
  dateRange: 'Job Duration',
  addressLine1: 'Billing Address',
};

//only for template
const enumTemplateResponseType = {
  text: 0,
  number: 1,
  multiselect: 2,
  datetime: 3,
  radio: 4,
  date: 5,
  imageVideo: 6,
  time: 7,
  dropdown: 8,
};

const contactSchema = (t) => {
  return Joi.object({
    name: Joi.string()
      .when('_destroy', {
        is: true,
        then: Joi.string().optional().allow('', null),
        otherwise: Joi.string()
          .min(1)
          .max(40)
          .regex(/^(?!.*[.']{2,})(?!^[.'])(?!^[ ])[a-zA-Z.' ]+$/),
      })
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': t('errors.notAString'),
      }),
    contact: phoneNumberValidator(t),
    _destroy: Joi.boolean().optional(),
  });
};
const usAndCanadaPhoneNumberRegex = /^\+1\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const internationalPhoneNumberRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/;

const phoneNumberValidator = (t) => {
  return Joi.string()
    .custom((value, helpers) => {
      if (!usAndCanadaPhoneNumberRegex.test(value) && !internationalPhoneNumberRegex.test(value)) {
        return helpers.message({
          custom: t('errors.string.pattern.base'),
        });
      }

      return value; // Return the value unchanged if it passes the regex test
    })
    .error((errors) => {
      errors.forEach((err) => {
        switch (err.code) {
          case 'string.empty':
            err.message = t('errors.any.required');
            break;
          case 'string.base':
            err.message = t('errors.any.required');
            break;
          default:
            break;
        }
      });
      return errors;
    });
};

const contactsWithEmergencySchema = (t) => {
  return Joi.object({
    email: Joi.string()
      .email({ tlds: false })
      .when('_destroy', {
        is: true,
        then: Joi.string().optional().allow('', null),
        otherwise: Joi.string(),
      }) // Specify whether top-level domains are required
      .messages({
        'string.email': t('errors.string.email'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    name: Joi.string()
      .when('_destroy', {
        is: true,
        then: Joi.string().optional().allow('', null),
        otherwise: Joi.string()
          .min(1)
          .max(40)
          .regex(/^(?!.*[.']{2,})(?!^[.'])(?!^[ ])[a-zA-Z.' ]+$/),
      })
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': t('errors.notAString'),
      }),
    contact: Joi.string().when('_destroy', {
      is: true,
      then: Joi.string().optional().allow('', null),
      otherwise: phoneNumberValidator(t),
    }),
    _destroy: Joi.boolean().optional(),
    isEmergencyContact: Joi.boolean().optional(),
  });
};

const tourSchema = (t) => {
  return Joi.object({
    tourName: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    tourCheckpoints: Joi.array()
      .min(1)
      .messages({
        'array.min': t('errors.any.required'),
      }),
    tourReport: Joi.object().min(1).message(t('errors.any.required')),
    startTime: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    endTime: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
  });
};

const shiftsOfficersSchema = (t, field = {}) => {
  return Joi.object({
    assignedOfficer: Joi.object()
      .min(field?.officersRequired ? 1 : 0)
      .message(t('errors.any.required')),
    hourlyRate: Joi.object({
      checked: Joi.boolean().optional(),
      amount: Joi.number().when('checked', {
        is: true,
        then: Joi.number()
          .min(field?.amount ?? 1)
          .required(),
      }),
    }),
  });
};
const locationNameSchema = Joi.object({
  locationName: Joi.string().exist().messages({
    'string.empty': ' is required',
  }),
});

const tourTemplateSchema = (t) => {
  return Joi.object({
    name: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    startTime: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    duration: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    report: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    checkpoints: Joi.array()
      .min(1)
      .messages({
        'array.min': t('errors.any.required'),
      }),
    occurances: Joi.object({
      repeatTour: Joi.string()
        .exist()
        .messages({
          'string.empty': t('errors.any.required'),
        }),
      repeatAfterTime: Joi.string()
        .exist()
        .messages({
          'string.empty': t('errors.any.required'),
        }),
    })
      .allow(null)
      .optional(),
  });
};

const nameSchema = (t, { required = true } = {}) => {
  let schema = Joi.string()
    .pattern(/^(?=.*\p{L})[\p{L} '-]+$/u)
    .min(1)
    .max(100)
    .messages({
      'any.min': t('errors.any.min'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
      'string.pattern.base': t('errors.notValidString'),
      'string.max': t('errors.alphabetsCharacterLength'),
    });

  if (required) {
    schema = schema.required();
  }

  return schema;
};

const tourTemplatePatrolSchema = (t) => {
  return Joi.object({
    name: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    report: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
    serviceTime: Joi.string()
      .exist()
      .messages({
        'string.empty': t('errors.any.required'),
      }),
  });
};

const timezoneSchema = (t) => {
  return Joi.string().messages({
    'any.required': t('errors.any.required'),
    'string.base': t('errors.any.required'),
    'string.empty': t('errors.any.required'),
  });
};

const multipleEmailSchema = (t) => {
  return Joi.array().items(
    Joi.string()
      .email({ tlds: false }) // Valid email format
      .messages({
        'string.email': t('errors.string.email'),
      }),
  );
};

const stringSchema = (t) => {
  return Joi.string().messages({
    'any.required': t('errors.any.required'),
    'string.base': t('errors.any.required'),
    'string.empty': t('errors.any.required'),
  });
};

const pricingConfigurationsSchema = (t) => {
  return Joi.object().pattern(
    Joi.string(),
    Joi.object({
      type: Joi.string().valid('integer', 'float').required(),
      required: Joi.boolean().required(),

      value: Joi.when('required', {
        is: true,
        then: Joi.when('type', {
          is: 'integer',
          then: Joi.number().integer().required(),
          otherwise: Joi.number().required(), // for decimal
        }),
        otherwise: Joi.when('type', {
          is: 'integer',
          then: Joi.number().integer().optional(),
          otherwise: Joi.number().optional(),
        }),
      }),
    }).messages({
      'string.pattern.base': t('errors.string.number'), // e.g. "must be a valid number"
      'number.base': t('errors.number.base'),
    }),
  );
  // return Joi.object().pattern(
  //   Joi.string(), // allow any key (dynamic)
  //   Joi.alternatives()
  //     .try(
  //       Joi.number(), // actual number
  //       Joi.string().pattern(/^\d+(\.\d+)?$/), // string number like "6.2"
  //     )
  //     .optional()
  //     .messages({
  //       'string.pattern.base': t('errors.string.number'), // e.g. "must be a valid number"
  //       'number.base': t('errors.number.base'),
  //     }),
  // );
};

const valueSchemaForDynamicForm = (t) => {
  return Joi.alternatives().try(
    Joi.string()
      .min(1)
      .messages({
        'any.required': t('errors.dynamic.required'),
        'string.base': t('errors.dynamic.required'),
        'string.empty': t('errors.dynamic.required'),
        'any.base': t('errors.dynamic.required'),
        'any.empty': t('errors.dynamic.required'),
      }), // Allow strings
    Joi.array()
      .min(1)
      .messages({
        'any.required': t('errors.dynamic.required'),
        'array.base': t('errors.dynamic.required'),
        'array.empty': t('errors.dynamic.required'),
        'any.base': t('errors.dynamic.required'),
        'any.empty': t('errors.dynamic.required'),
        'array.min': t('errors.dynamic.required'),
      }),
    Joi.object()
      .min(1)
      .messages({
        'any.required': t('errors.dynamic.required'),
        'array.base': t('errors.dynamic.required'),
        'array.empty': t('errors.dynamic.required'),
        'any.base': t('errors.dynamic.required'),
        'any.empty': t('errors.dynamic.required'),
        'array.min': t('errors.dynamic.required'),
      }),
  );
};

const WebsiteRegex = new RegExp(
  '^((ftp|http|https):\\/\\/)?(www\\.)?[a-zA-Z0-9_-]+(\\.[a-zA-Z]{2,})+(\\/[\\w\\-\\.\\/#]*)*(\\/?)(\\?[a-zA-Z0-9_%-]+(=[a-zA-Z0-9_%-]*)?(?:&[a-zA-Z0-9_%-]+(=[a-zA-Z0-9_%-]*)?)*)?(\\/)?$',
);

export default async function joiValidate(form, t, field = {}, shouldNotAttachLabel = false) {
  //templates schemas
  const questionOptionSchema = Joi.object({
    optionText: Joi.string()
      .exist()
      .messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    points: Joi.number().messages({
      'number.empty': t('errors.any.empty'),
    }),
  });

  const visitorLoadProfile = Joi.object({
    identifier: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    name: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    image: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
  });

  const billingDetailsSchema = Joi.object({
    firstName: nameSchema(t),
    lastName: nameSchema(t),

    email: Joi.string()
      .email({ tlds: false }) // Specify whether top-level domains are required
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.email': t('errors.string.email'),
      }),

    phoneNumber: phoneNumberValidator(t),

    recepientEmails: Joi.array().items(
      Joi.string()
        .email({ tlds: false }) // Valid email format
        .messages({
          'string.email': t('errors.string.email'),
        }),
    ),

    addressLine1: Joi.string()
      .max(200) // Maximum length of 200 characters
      .required() // Mandatory field
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.max': t('errors.addressCharacters'),
      }),

    city: Joi.string()
      .required() // Mandatory field
      .messages({
        'any.required': t('City is required.'),
      }),

    state: Joi.string()
      .required() // Mandatory field
      .messages({
        'any.required': t('City is required.'),
      }),

    country: Joi.string()
      .required() // Mandatory field
      .messages({
        'any.required': t('City is required.'),
      }),

    postalCode: Joi.string()
      .max(50) // Maximum length of 50 characters
      .required() // Mandatory field
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.max': t('errors.postalCodeCharacters'),
      }),
  });

  const userDetailsSchema = Joi.object({
    firstName: nameSchema(t),

    lastName: nameSchema(t),

    email: Joi.string()
      .email({ tlds: false })
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.email': t('errors.string.email'),
      }),

    phoneNumber: Joi.string()
      .pattern(/^\+?[0-9]+$/)
      .required()
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': t('errors.onlyPositiveIntegers'),
      }),

    fileNumber: Joi.string()
      .required()
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),

    employeeType: Joi.string()
      // .required()
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),

    perHourRate: Joi.number().messages({
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
  });

  const questionSchema = Joi.object({
    questionStatement: Joi.string()
      .exist()
      .messages({
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.max': t('errors.addressCharacters'),
      }),
    required: Joi.bool().allow(false).optional(),
    responseType: Joi.number().exist(),
    _destroy: Joi.boolean().optional(),
    optionsAttributes: Joi.array()
      .items(questionOptionSchema)
      .when('_destroy', {
        is: true,
        then: Joi.array().items().allow().optional(),
        otherwise: Joi.array()
          .items()
          .when('responseType', {
            is: Joi.number().valid(
              enumTemplateResponseType.multiselect,
              enumTemplateResponseType.radio,
              enumTemplateResponseType.dropdown,
            ),
            then: Joi.array()
              .items()
              .min(2)
              .messages({
                'array.min': t('errors.array.minTwo'),
              })
              .custom((value, helpers) => {
                const nonDestroyedObjects = value.filter((obj) => !obj._destroy);
                if (nonDestroyedObjects.length < 2) {
                  return helpers.error('array.min', { message: t('errors.array.minTwo') });
                }
                return value;
              }),
            otherwise: Joi.array().items().allow().optional(),
          }),
      }),
    questionsIndustryVerticalAttributes: Joi.array()
      .items(
        Joi.object({
          industryVerticalId: Joi.number().exist(),
          industryVerticalTitle: Joi.string().exist(),
        }),
      )
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      }),
  });

  const sectionSchema = Joi.object({
    title: Joi.string()
      .exist()
      .messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    _destroy: Joi.boolean().optional(),
    questionsAttributes: Joi.array()
      .items(questionSchema)
      .when('_destroy', {
        is: true,
        then: Joi.array().items().allow().optional(),
        otherwise: Joi.array()
          .items()
          .min(1)
          .messages({
            'array.min': t('errors.array.min'),
          })
          .custom((value, helpers) => {
            const nonDestroyedObjects = value.filter((obj) => !obj._destroy);
            if (nonDestroyedObjects.length < 1) {
              return helpers.error('array.min', { message: t('errors.array.min') });
            }
            return value;
          }),
      }),
  });
  // Line Items
  const lineItemsSchema = Joi.object({
    sageItem: Joi.object()
      .required() // Ensures 'sageItem' is required
      .messages({
        'any.required': t('errors.any.required'), // Message when 'sageItem' is missing
        'object.base': t('errors.any.required'), // Message when 'sageItem' is not an object
      }),
    _destroy: Joi.boolean().optional(),
    quantity: Joi.number()
      .precision(4)
      .min(0)
      .max(9999999999)
      .messages({
        'any.required': t('errors.any.required'),
        'number.base': t('errors.any.required'),
        'number.max': t('errors.number.maxQuantity'),
        'number.unsafe': t('errors.number.maxQuantity'),
        'number.min': t('errors.number.min'),
        'number.integer': t('errors.number.integer'),
      }),
    price: Joi.number()
      .precision(4)
      .min(0)
      .max(999999999999999)
      .messages({
        'any.required': t('errors.any.required'),
        'number.base': t('errors.any.required'),
        'number.max': t('errors.number.maxPrice'),
        'number.unsafe': t('errors.number.maxPrice'),
        'number.min': t('errors.number.min'),
        'number.precision': t('errors.number.precision'),
      }),
  });

  const schema = Joi.object({
    avatarRequired: Joi.boolean(),
    avatar: Joi.string().when('avatarRequired', {
      is: Joi.exist(),
      then: Joi.string().exist().messages({
        'any.required': 'Avatar name is required',
      }),
    }),
    productName: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.min': t('errors.any.required'),
        'string.max': t('errors.any.max'),
      }),
    dynamicValue1: Joi.string(),
    dynamicValue2: Joi.string(),
    contract: Joi.number().messages({
      'any.required': t('errors.any.required'),
      'number.base': t('errors.any.required'),
    }),
    glGroup: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    lineItem: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    site: Joi.number().messages({
      'any.required': t('errors.any.required'),
      'number.base': t('errors.any.required'),
    }),
    officer: Joi.number().messages({
      'any.required': t('errors.any.required'),
      'number.base': t('errors.any.required'),
    }),
    punchInTime: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
    }),
    punchOutTime: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
    }),

    template: Joi.number().messages({
      'any.required': t('errors.any.required'),
      'number.base': t('errors.any.required'),
    }),
    shiftStartTime: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
    }),
    shiftEndTime: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
    }),
    shiftStartDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
    }),
    extraDuties: Joi.array()
      .items(
        Joi.object({
          _destroy: Joi.boolean().optional(),
          dutyType: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.string(),
          }),
          dateRange: Joi.when('_destroy', {
            is: true,
            then: Joi.array().optional().allow('', null),
            otherwise: Joi.array()
              .min(1)
              .messages({
                'any.required': t('errors.any.required'),
                'array.base': t('errors.any.required'),
                'array.min': t('errors.any.required'),
              }),
          }),
          startsAt: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.date()
              .required()
              .messages({
                'any.required': t('errors.any.required'),
                'date.base': t('errors.any.required'),
              }),
          }),

          endsAt: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.date()
              .required()
              // .min(Joi.ref('startsAt'))
              .messages({
                'any.required': t('errors.any.required'),
                'date.base': t('errors.any.required'),
              }),
          }),
          officerCount: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.number()
              .required()
              .messages({
                'any.required': t('errors.any.required'),
                'number.base': t('errors.any.required'),
              }),
          }),
          officerType: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.object()
              .custom((value, helpers) => {
                if (Object.keys(value).length === 0) {
                  return helpers.error('object.empty');
                }
                return value;
              })
              .messages({
                'object.empty': t('errors.any.required'),
              }),
          }),
          hourlyRate: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.number()
              .precision(2)
              .required()
              .messages({
                'any.required': t('errors.any.required'),
                'number.base': t('errors.any.required'),
              }),
          }),
          loadManagement: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.boolean().optional(),
          }),

          visitManagement: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.boolean().optional(),
          }),
          dutyDays: Joi.when('_destroy', {
            is: true,
            then: Joi.string().optional().allow('', null),
            otherwise: Joi.array()
              .items(Joi.number().integer().min(0).max(6))
              .min(1)
              .required()
              .messages({
                'any.required': t('errors.any.required'),
                'array.base': t('errors.any.required'),
                'array.min': t('errors.any.required'),
              }),
          }),
        }), // Ensure at least one non-destroyed extrDuty object
      )
      .min(1),
    countryCode: Joi.string().empty(''),
    address: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    siteName: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    industryVertical: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    siteType: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    // siteLocations: Joi.array()
    //   .min(1)
    //   .items(Joi.string())
    //   .messages({
    //     'any.required': t('errors.any.required'),
    //     'string.base': t('errors.any.required'),
    //     'string.empty': t('errors.any.required'),
    //   }),
    siteServices: Joi.array()
      .items(
        Joi.object({
          serviceName: Joi.string()
            // .exist()
            .optional()
            .messages({
              'any.required': t('errors.any.required'),
              'string.base': t('errors.string.base'),
              'string.empty': t('errors.string.empty'),
            }),
          serviceType: Joi.string().messages({
            'any.required': t('errors.any.required'),
            'string.base': t('errors.any.required'),
            'string.empty': t('errors.any.required'),
          }),
          sageItem: Joi.object()
            // .min(1)
            .messages({
              'any.required': t('errors.any.required'), // Message when 'sageItem' is missing
              'object.base': t('errors.any.required'), // Message when 'sageItem' is not an object
              'object.min': t('errors.any.required'),
            }),
          officersRequired: Joi.number()
            .integer()
            .min(1)
            .messages({
              'any.required': t('errors.any.required'),
              'string.base': t('errors.any.required'),
              'string.empty': t('errors.any.required'),
            }),
          hourlyRate: Joi.number()
            .min(1)
            .messages({
              'number.min': t('errors.any.greaterThanZero'),
              'any.required': t('errors.any.required'),
              'number.base': t('errors.any.required'),
              'number.empty': t('errors.any.required'),
            }),

          startTime: Joi.string().messages({
            'any.required': t('errors.any.required'),
            'string.base': t('errors.any.required'),
            'string.empty': t('errors.any.required'),
          }),
          endTime: Joi.string().messages({
            'any.required': t('errors.any.required'),
            'string.base': t('errors.any.required'),
            'string.empty': t('errors.any.required'),
          }),
          weekDays: Joi.array().items(Joi.number()).min(1),
          // designation: Joi.string().messages({
          //   'any.required': t('errors.any.required'),
          //   'string.base': t('errors.any.required'),
          //   'string.empty': t('errors.any.required'),
          // }),
          officerType: Joi.string().messages({
            'any.required': t('errors.any.required'),
            'string.base': t('errors.any.required'),
            'string.empty': t('errors.any.required'),
          }),
          pricePerVisit: Joi.string()
            .min(1)
            .messages({
              'any.required': t('errors.any.required'),
              'string.base': t('errors.any.required'),
              'string.empty': t('errors.any.required'),
            }),
          dispatchBillingInfo: Joi.object({
            billingType: Joi.string().messages({
              'any.required': t('errors.any.required'),
              'string.base': t('errors.any.required'),
              'string.empty': t('errors.any.required'),
            }),
            billingRate: Joi.number()
              .integer()
              .messages({
                'any.required': t('errors.any.required'),
                'string.base': t('errors.any.required'),
                'string.empty': t('errors.any.required'),
              }),
          }),
          visits: Joi.array()
            .items(
              Joi.object({
                visitDays: Joi.array().items(Joi.number()).min(1),
                startTime: Joi.string().messages({
                  'any.required': t('errors.any.required'),
                  'string.base': t('errors.any.required'),
                  'string.empty': t('errors.any.required'),
                }),
                endTime: Joi.string().messages({
                  'any.required': t('errors.any.required'),
                  'string.base': t('errors.any.required'),
                  'string.empty': t('errors.any.required'),
                }),
                visitType: Joi.string().messages({
                  'any.required': t('errors.any.required'),
                  'string.base': t('errors.any.required'),
                  'string.empty': t('errors.any.required'),
                }),
                visitsPerDay: Joi.number()
                  .integer()
                  .min(1)
                  .messages({
                    'any.required': t('errors.any.required'),
                    'string.base': t('errors.any.required'),
                    'string.empty': t('errors.any.required'),
                  }),
                visitTime: Joi.string().messages({
                  'any.required': t('errors.any.required'),
                  'string.base': t('errors.any.required'),
                  'string.empty': t('errors.any.required'),
                }),
              }),
            )
            .min(1)
            .messages({
              'array.min': t('errors.array.min'),
            }),
        }),
      )
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      }),
    cycleRefDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    billingStartDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    contractName: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    companyCode: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    name: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    image: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    attachments: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'array.base': t('errors.any.required'),
      'array.min': t('errors.any.required'),
    }),
    zipCode: Joi.number().messages({
      'number.base': t('errors.number.base'),
      'number.empty': t('errors.number.empty'),
    }),
    postalCode: Joi.string().messages({
      'string.base': t('errors.number.base'),
      'any.required': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    sameAsFranchise: Joi.boolean(),
    siteLocation: Joi.object({
      lat: Joi.number().exist(),
      lng: Joi.number().exist(),
    }),
    billingFrequency: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    paymentTerm: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    billingType: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    franchiseLocation: Joi.object({
      lat: Joi.number().exist(),
      lng: Joi.number().exist(),
    }),
    zoneArea: Joi.array()
      .min(1)
      .items(
        Joi.array().items(
          Joi.object({
            lat: Joi.number().exist(),
            lng: Joi.number().exist(),
          }),
        ),
      )
      .messages({
        'any.required': t('errors.boundry.min'),
        'array.base': t('errors.boundry.min'),
        'array.min': t('errors.boundry.min'),
      }),
    siteArea: Joi.array()
      .min(1)
      .items(
        Joi.array().items(
          Joi.object({
            lat: Joi.number().exist(),
            lng: Joi.number().exist(),
          }),
        ),
      )
      .messages({
        'any.required': t('errors.boundry.min'),
        'array.base': t('errors.boundry.min'),
        'array.min': t('errors.boundry.min'),
      }),
    franchiseArea: Joi.array()
      .min(1)
      .items(
        Joi.array().items(
          Joi.object({
            lat: Joi.number().exist(),
            lng: Joi.number().exist(),
          }),
        ),
      )
      .messages({
        'any.required': t('errors.boundry.min'),
        'array.base': t('errors.boundry.min'),
        'array.min': t('errors.boundry.min'),
      }),
    zones: Joi.array()
      .min(1)
      .items(
        Joi.array().items(
          Joi.object({
            lat: Joi.number().exist(),
            lng: Joi.number().exist(),
          }),
        ),
      )
      .messages({
        'any.required': t('errors.any.required'),
        'array.base': t('errors.array.base'),
        'array.min': t('errors.array.min'),
      }),
    sites: Joi.array()
      .min(1)
      .items(
        Joi.array().items(
          Joi.object({
            lat: Joi.number().exist(),
            lng: Joi.number().exist(),
          }),
        ),
      )
      .messages({
        'any.required': t('errors.any.required'),
        'array.base': t('errors.array.base'),
        'array.min': t('errors.array.min'),
      }),
    emergencyContacts: Joi.array()
      .items(contactSchema(t))
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      })
      .custom((value, helpers) => {
        const nonDestroyedObjects = value.filter((obj) => !obj._destroy);
        if (nonDestroyedObjects.length === 0) {
          return helpers.error('array.min', { message: t('errors.array.min') });
        }
        return value;
      }),
    contacts: Joi.array()
      .items(contactsWithEmergencySchema(t))
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      })
      .custom((value, helpers) => {
        const nonDestroyedObjects = value.filter((obj) => !obj._destroy);
        if (nonDestroyedObjects.length === 0) {
          return helpers.error('array.min', { message: t('errors.array.min') });
        }
        return value;
      }),

    shiftsOfficers: Joi.array()
      .items(shiftsOfficersSchema(t, field))
      // .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      }),
    shiftsTours: Joi.array().items(
      Joi.object({
        tours: Joi.array()
          .items(tourSchema(t))
          .messages({
            'array.min': t('errors.array.min'),
          }),
      }),
    ),
    reassignment: Joi.object({
      officer: Joi.object().min(1).message(t('errors.any.required')),
      startTime: Joi.string()
        .exist()
        .messages({
          'string.empty': t('errors.any.required'),
        }),
    }),
    tourTemplate: tourTemplateSchema(t),
    tourTemplatePatrol: tourTemplatePatrolSchema(t),
    tours: Joi.array()
      .items(tourTemplateSchema(t))
      .messages({
        'array.min': t('errors.array.min'),
      }),
    [ContractFormKeys.ON_DEMAND_SERVICES]: Joi.array().items(
      Joi.object({
        title: Joi.string()
          .required()
          .messages({
            'string.base': t('errors.any.required'),
            'string.empty': t('errors.any.required'),
          }),
        dispatchRate: Joi.string().messages({
          'number.min': t('errors.any.greaterThanZero'),
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
          'number.empty': t('errors.any.required'),
          'number.base': t('errors.any.required'),
        }),
        price: Joi.number()
          .when('title', {
            is: Joi.valid('Extra Job', 'Dispatch Request'), // 'Extra Job' and 'Dispatch Request' titles are optional
            then: Joi.optional(), // price is required if title is not 'Extra Job' or 'Dispatch Request'
            otherwise: Joi.number().min(1).required(), // price is required and should be >= 1 for other titles
          })
          .messages({
            'number.min': t('errors.any.greaterThanZero'),
            'any.required': t('errors.any.required'),
            'string.base': t('errors.any.required'),
            'string.empty': t('errors.any.required'),
            'number.empty': t('errors.any.required'),
            'number.base': t('errors.any.required'),
          }),
        peakHoursPrice: Joi.number().messages({
          'number.min': t('errors.any.greaterThanZero'),
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
          'number.empty': t('errors.any.required'),
          'number.base': t('errors.any.required'),
        }),
      }),
    ),
    [ContractFormKeys.PAYMENT_TERMS]: Joi.object({
      fuelSurcharge: Joi.number()
        .allow('', 0, null)
        .messages({
          'number.min': t('errors.any.greaterThanZero'),
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
      discountType: Joi.string().allow('', null).valid('percentage', 'amount'),
      discount: Joi.when('discountType', {
        is: 'amount',
        then: Joi.number()
          .allow('', null)
          .min(0)
          .precision(1)
          .messages({
            'number.min': t('sales.contract.discountPositiveValue'),
            'number.precision': t('sales.contract.discountMaxDecimal'),
            'number.base': t('sales.contract.discountInvalidValue'),
          }),
        otherwise: Joi.number()
          .allow('', null)
          .min(0)
          .max(100)
          .precision(1)
          .messages({
            'number.min': t('sales.contract.discountPositiveValue'),
            'number.max': t('sales.contract.discountPercentageExceed'),
            'number.precision': t('sales.contract.discountMaxDecimal'),
            'number.base': t('sales.contract.discountInvalidValue'),
          }),
      }),
      taxRate: Joi.number()
        .allow('', 0, null)
        .messages({
          'number.min': t('errors.any.greaterThanZero'),
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
      flatRate: Joi.number()
        .min(1)
        .messages({
          'number.min': t('errors.any.greaterThanZero'),
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
      paymentMethod: Joi.string()
        // .empty('')
        .messages({
          'any.required': t('errors.annualRateIncrease'),
        }),
      holidayGroup: Joi.string()
        .allow('', null)
        .messages({
          'any.required': t('errors.any.required'),
          'number.base': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
      billingType: Joi.string()
        // .empty('')
        .messages({
          'any.required': t('errors.annualRateIncrease'),
        }),
      contractType: Joi.string()
        // .keys({})
        // .required()
        // .min(1)
        .messages({
          'any.required': t('errors.annualRateIncrease'),
        }),
      billingOwnerFirstName: nameSchema(t),
      billingOwnerLastName: nameSchema(t),
      billingOwnerEmail: Joi.string()
        .email({ tlds: false }) // Specify whether top-level domains are required
        .messages({
          'string.email': t('errors.string.email'),
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
      billingOwnerPhone: phoneNumberValidator(t),
      fax: Joi.string().messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
      billingMethod: Joi.string().messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
      plan: Joi.string().messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
      paymentDate: Joi.string()
        // .empty('')
        .messages({
          'any.required': t('errors.annualRateIncrease'),
        }),
      cycleRefDate: Joi.string().messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
      annualRateIncrease: Joi.number()
        .min(0)
        .messages({
          'number.min': t('errors.any.greaterThanZero'),
          'any.required': t('errors.any.required'),
          'number.base': t('errors.number.base'),
          'number.empty': t('errors.number.empty'),
          'string.base': t('errors.number.base'),
          'string.empty': t('errors.any.required'),
        }),
      holidayMultiplier: Joi.number()
        .min(1)
        .allow(null, '')
        .messages({
          'number.min': t('errors.any.greaterThanZero'),
          'any.required': t('errors.any.required'),
          'number.base': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
      countryCode: Joi.string().empty(''),
      address: Joi.string().messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
      country: Joi.string().messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
      state: Joi.string().messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
      city: Joi.string().messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
      postalCode: Joi.string().messages({
        'string.base': t('errors.number.base'),
        'any.required': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    }),
    publishServices: Joi.array().items(
      Joi.object({
        startDate: Joi.string().messages({
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
        endDate: Joi.string().messages({
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
        renewalDate: Joi.string().messages({
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
      }),
    ),
    billingDiscounts: Joi.array()
      .items(
        Joi.object({
          discountType: Joi.string().messages({
            'any.required': t('errors.any.required'),
            'string.base': t('errors.any.required'),
            'any.only': 'Invalid discount type',
          }),
          percentage: Joi.number()
            .min(0)
            .max(100)
            .precision(2)
            .messages({
              'any.required': t('errors.any.required'),
              'number.base': t('errors.any.required'),
              'number.empty': t('errors.any.required'),
              'number.min': t('errors.number.min'),
              'number.max': 'Discount cannot exceed 100%',
              'number.precision': 'Discount can have at most 2 decimal places',
            }),
        }),
      )
      .min(1)
      .messages({
        'array.min': 'At least one discount must be configured',
        'array.base': t('errors.array.base'),
      }),
    timezone: Joi.object()
      .empty('')
      .messages({
        'any.required': t('errors.annualRateIncrease'),
      }),
    [ContractFormKeys.SERVICES]: Joi.array().items(
      Joi.object({
        name: Joi.string().messages({
          'any.required': t('errors.any.required'),
          'string.base': t('errors.string.base'),
          'string.empty': t('errors.string.empty'),
        }),
        officerType: Joi.object()
          .min(1)
          .required()
          // .empty('')
          .messages({
            'any.required': t('errors.any.required'),
          }),
        lineItem: Joi.string().messages({
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
        [AddServicesFormKeys.SERVICE_START_DATE]: Joi.string().messages({
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
        // lineItem: Joi.object()
        //   .min(1)
        //   .required()
        //   // .empty('')
        //   .messages({
        //     'object.base': t('errors.any.required'),
        //     'object.empty': t('errors.any.required'),
        //     'any.required': t('errors.any.required'),
        //   }),
        visits: Joi.array().items(
          Joi.object({
            startTime: Joi.string().optional().allow('', null),
            endTime: Joi.string().optional().allow('', null),
            reqOfficers: Joi.number()
              .min(1)
              .messages({
                'number.min': t('errors.any.greaterThanZero'),
                'any.required': t('errors.any.required'),
                'number.base': t('errors.any.required'),
                'number.empty': t('errors.any.required'),
              }),
            numberOfVisits: Joi.when(Joi.ref('..type'), {
              is: serviceTypes.PATROL,
              then: Joi.number().min(1).optional().allow('', null),
              otherwise: Joi.number()
                .min(1)
                .messages({
                  'number.min': t('errors.any.greaterThanZero'),
                  'any.required': t('errors.any.required'),
                  'number.base': t('errors.any.required'),
                  'number.empty': t('errors.any.required'),
                }),
            }),
            dutyDays: Joi.array().items(Joi.number()).optional().allow(null),
            [AddServicesFormKeys.REPEAT_AFTER_FREQUENCY]: Joi.string().messages({
              'any.required': t('errors.any.required'),
              'string.base': t('errors.any.required'),
              'string.empty': t('errors.any.required'),
            }),
            [AddServicesFormKeys.REPEAT_AFTER_TENURE]: Joi.string().messages({
              'any.required': t('errors.any.required'),
              'string.base': t('errors.any.required'),
              'string.empty': t('errors.any.required'),
            }),
            [AddServicesFormKeys.PRODUCTS]: Joi.array()
              .items(
                Joi.object({
                  [AddServicesFormKeys.PRODUCT_NAME]: Joi.object()
                    .min(1)
                    .required()
                    .messages({
                      'any.required': t('errors.any.required'),
                      'object.base': t('errors.any.required'),
                      'object.min': t('errors.any.required'),
                    }),
                  [AddServicesFormKeys.PRODUCT_RATE]: Joi.number()
                    .min(0)
                    .required()
                    .messages({
                      'number.min': t('errors.any.greaterThanZero'),
                      'any.required': t('errors.any.required'),
                      'number.base': t('errors.any.required'),
                      'number.empty': t('errors.any.required'),
                    }),
                  [AddServicesFormKeys.PRODUCT_QUANTITY]: Joi.number()
                    .min(1)
                    .required()
                    .messages({
                      'number.min': t('errors.any.greaterThanZero'),
                      'any.required': t('errors.any.required'),
                      'number.base': t('errors.any.required'),
                      'number.empty': t('errors.any.required'),
                    }),
                }),
              )
              .min(1)
              .messages({
                'array.base': t('errors.array.base'),
              }),
          }),
        ),
        pricePerHit: Joi.number()
          .min(1)
          .messages({
            'number.min': t('errors.any.greaterThanZero'),
            'any.required': t('errors.any.required'),
            'number.base': t('errors.any.required'),
            'number.empty': t('errors.any.required'),
          }),
        hourlyRate: Joi.number()
          .min(1)
          .messages({
            'number.min': t('errors.any.greaterThanZero'),
            'any.required': t('errors.any.required'),
            'number.base': t('errors.any.required'),
            'number.empty': t('errors.any.required'),
          }),
        includeVehicle: Joi.boolean().required(),
        vehicleRate: Joi.when('includeVehicle', {
          is: true,
          then: Joi.number()
            .min(1)
            .required()
            .messages({
              'number.min': t('errors.any.greaterThanZero'),
              'any.required': t('errors.any.required'),
              'number.base': t('errors.any.required'),
              'number.empty': t('errors.any.required'),
            }),
          otherwise: Joi.number()
            .min(1)
            .optional()
            .allow('', null)
            .messages({
              'number.min': t('errors.any.greaterThanZero'),
              'number.base': t('errors.any.required'),
              'number.empty': t('errors.any.required'),
            }),
        }),
        noOfVehicles: Joi.when('includeVehicle', {
          is: true,
          then: Joi.number()
            .min(1)
            .required()
            .messages({
              'number.min': t('errors.any.greaterThanZero'),
              'any.required': t('errors.any.required'),
              'number.base': t('errors.any.required'),
              'number.empty': t('errors.any.required'),
            }),
          otherwise: Joi.number()
            .min(1)
            .optional()
            .allow('', null)
            .messages({
              'number.min': t('errors.any.greaterThanZero'),
              'number.base': t('errors.any.required'),
              'number.empty': t('errors.any.required'),
            }),
        }),
      }),
    ),
    createExtraDuty: Joi.object({
      dutyDate: Joi.string().messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
      startTime: Joi.string().messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
      endTime: Joi.string().messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
      // site: Joi.object().min(1).message(t('errors.any.required')),
      officersCount: Joi.number()
        .min(1)
        .messages({
          'any.min': t('errors.any.required'),
          'number.min': t('errors.any.required'),
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
      selectedReport: Joi.string()
        .min(1)
        .messages({
          'any.min': t('errors.any.required'),
          'array.min': t('errors.any.required'),
          'array.base': t('errors.any.required'),
          'number.min': t('errors.any.required'),
          'any.required': t('errors.any.required'),
          'string.base': t('errors.any.required'),
          'string.empty': t('errors.any.required'),
        }),
      officersAssigned: Joi.array().items(
        Joi.object({
          checked: Joi.boolean(),
          amount: Joi.number().when('checked', {
            is: true,
            then: Joi.number()
              .min(field?.amount ?? 1)
              .required(),
            // otherwise: Joi.forbidden(),
          }),
          officer: Joi.object().min(1).required(),
        }),
      ),
    }),

    locations: Joi.array()
      .items(locationNameSchema)
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      }),
    phoneNumber: phoneNumberValidator(t),
    fax: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    licenseNumber: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    priceRequired: Joi.boolean(),
    price: Joi.number().when('priceRequired', {
      is: Joi.exist(),
      then: Joi.number().exist().messages({
        'any.required': 'Price is required',
      }),
    }),
    quantity: Joi.number().when('priceRequired', {
      is: Joi.exist(),
      then: Joi.number().exist().messages({
        'any.required': 'Price is required',
      }),
    }),
    occurrence: Joi.object().min(1).message(t('errors.any.required')),
    supervisor: Joi.number()
      .allow('', null)
      .messages({
        'number.base': t('errors.dropdown.base'),
      }),
    termsRequired: Joi.boolean(),
    terms: Joi.boolean().when('termsRequired', {
      is: Joi.exist(),
      then: Joi.boolean().exist().valid(true).messages({
        'any.required': 'The terms and conditions must be accepted.',
        'any.only': 'Terms must be accepted',
      }),
    }),
    firstName: nameSchema(t, { required: false }),
    lastName: nameSchema(t, { required: false }),
    designation: Joi.string()
      .min(1)
      .max(40)
      .regex(/^(?!.*[.']{2,})(?!^[.'])(?!^[ ])[a-zA-Z.' ]+$/)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': t('errors.notAString'),
      }),

    city: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    genderRequired: Joi.boolean(),
    gender: Joi.string().when('genderRequired', {
      is: Joi.exist(),
      then: Joi.string().valid('male', 'female', 'other').exist().messages({
        'any.only': 'Invalid gender value',
        'any.required': 'gender is required',
      }),
    }),
    country: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    stateRequired: Joi.boolean(),
    state: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    userNameRequired: Joi.boolean(),
    userName: Joi.string().when('userNameRequired', {
      is: Joi.exist(),
      then: Joi.string()
        .min(3)
        .max(20)
        .regex(/^[A-Za-z ]*$/)
        .exist()
        .messages({
          'string.base': 'Please enter valid userName',
          'string.min': 'userName name must be at least 3 characters long',
          'string.max': 'userName name must be at most 20 characters long',
          'any.required': 'userName is required',
        }),
    }),
    email: Joi.string()
      .email({ tlds: false }) // Specify whether top-level domains are required
      .messages({
        'string.email': t('errors.string.email'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    primaryEmail: Joi.string()
      .email({ tlds: false }) // Specify whether top-level domains are required
      .messages({
        'string.email': t('errors.string.email'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    passwordRequired: Joi.boolean(),
    password: Joi.string().when('passwordRequired', {
      is: Joi.exist(),
      then: Joi.string().required().messages({
        'string.base': 'Please enter valid password',
        'any.required': 'password is required',
      }),
    }),
    timeZone: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    passwordConfirmationRequired: Joi.boolean(),
    // passwordConfirmation: Joi.string().when('passwordConfirmationRequired', {
    //   is: Joi.exist(),
    //   then: Joi.string().valid(Joi.ref('password')).exist().messages({
    //     'any.only': 'Passwords must match',
    //     'any.required': 'passwordConfirmation is required',
    //   }),
    // }),
    currentPasswordRequired: Joi.boolean(),
    // currentPassword: Joi.string().when('currentPasswordRequired', {
    //   is: Joi.exist(),
    //   then: Joi.string().exist().messages({
    //     'any.required': 'currentPassword is required',
    //   }),
    // }),
    vehicleIdentificationNumber: Joi.string().messages({
      'any.min': t('errors.any.min'),
      'any.max': t('errors.any.max'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    makeModelYear: Joi.string().messages({
      'any.min': t('errors.any.min'),
      'any.max': t('errors.any.max'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    registrationNumber: Joi.string().messages({
      'any.min': t('errors.any.min'),
      'any.max': t('errors.any.max'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    lastMaintenance: Joi.string()
      // .max(DateTime.now().toFormat('MM/dd/yyyy'))
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    createdAt: Joi.string().messages({
      'any.min': t('errors.any.min'),
      'any.max': t('errors.any.max'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    description: Joi.string()
      .min(1)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    startTime: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    endTime: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    // site: Joi.object().min(1).message(t('errors.any.required')),
    associatedSites: Joi.array()
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    billingDetails: billingDetailsSchema,
    userDetails: userDetailsSchema,
    title: Joi.string()
      .min(1)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    // addressLine1: Joi.string().messages({
    //   'any.required': t('errors.any.required'),
    //   'string.base': t('errors.any.required'),
    //   'string.empty': t('errors.any.required'),
    // }),
    sectionsAttributes: Joi.array()
      .items(sectionSchema)
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      })
      .custom((value, helpers) => {
        const nonDestroyedObjects = value.filter((obj) => !obj._destroy);
        if (nonDestroyedObjects.length === 0) {
          return helpers.error('array.min', { message: t('errors.array.min') });
        }
        return value;
      }),
    newPassword: Joi.string()
      .min(8)
      .max(20)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
      .messages({
        'string.base': t('errors.string.base'),
        'string.min': t('errors.password.string.min'),
        'string.max': t('errors.password.string.min'),
        'string.pattern.base': t('errors.password.string.pattern.base'),
        'any.required': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    passwordConfirmation: Joi.string()
      .valid(Joi.ref('newPassword'))
      .messages({
        'any.only': t('errors.passwordConfirmation.string.only'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    currentPassword: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    questionSchema,
    instructions: Joi.string()
      .min(1)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    content: Joi.string()
      .min(1)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    startDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    endDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    renewalDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    renewalReminderDays: Joi.number()
      .integer()
      .min(0)
      .messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'number.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
      }),
    location: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    device: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    checkpointType: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    company: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    referredByProperty: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    referredByContact: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    propertyName: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    locationSource: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),

    locationAffiliation: Joi.array()
      .min(1)
      .messages({
        'array.min': t('errors.any.required'),
      }),

    // contactAffiliation: Joi.object()
    //   .custom((value, helpers) => {
    //     if (Object.keys(value).length === 0) {
    //       return helpers.error('object.empty');
    //     }
    //     return value;
    //   })
    //   .messages({
    //     'object.empty': t('errors.any.required'),
    //     'array.min': t('errors.array.min'),
    //   }),
    contactAffiliation: Joi.object()
      .min(1)
      .messages({
        'object.empty': t('errors.any.required'),
        'object.min': t('errors.any.required'),
        'object.base': t('errors.any.required'),
      }),
    contactAffiliations: Joi.array()
      .min(1)
      .messages({
        'array.min': t('errors.any.required'),
      }),

    associatedFranchise: Joi.object()
      .empty('')
      .messages({
        'any.required': t('errors.associatedFranchise'),
      }),
    assignee: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.base': t('errors.any.required'),
        'object.empty': t('errors.any.required'),
        'object.type': t('errors.any.required'),
        'any.type': t('errors.any.required'),
        'any.required': t('errors.any.required'),
      }),
    associatedSupervisor: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.base': t('errors.any.required'),
        'object.empty': t('errors.any.required'),
        'object.type': t('errors.any.required'),
        'any.type': t('errors.any.required'),
        'any.required': t('errors.any.required'),
      }),
    stage: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    HubspotMap: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    property: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    pipeline: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    dealOwner: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    deal: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    companyDomain: Joi.string()
      .pattern(WebsiteRegex, { name: 'domain' })
      .messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'string.pattern.base': t('errors.domainPatternMismatch'),
        'string.pattern.name': t('errors.domainPatternMismatch'),
      }),
    companyName: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    companyIndustry: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    companyOwner: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    numberOfEmployees: Joi.number().greater(0).empty('').messages({
      'number.base': 'Please enter a valid number.',
      'number.empty': 'Number is required.',
      'number.greater': 'Number must be greater than 0.',
    }),
    revenue: Joi.number().greater(0).empty('').messages({
      'number.base': 'Please enter a valid number.',
      'number.empty': 'Number is required.',
      'number.greater': 'Number must be greater than 0.',
    }),
    googleAddress: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.empty': t('errors.any.required'),
      }),
    reason: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    leaveReason: Joi.string()
      .max(250)
      .messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    followUpDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    dealName: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    salesPerson: Joi.object()
      .custom((value, helpers) => {
        if (Object.keys(value).length === 0) {
          return helpers.error('object.empty');
        }
        return value;
      })
      .messages({
        'object.base': t('errors.any.required'),
        'object.empty': t('errors.any.required'),
        'object.type': t('errors.any.required'),
        'any.type': t('errors.any.required'),
        'any.required': t('errors.any.required'),
      }),
    templateableType: Joi.string()
      .min(1)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    availability: Joi.array()
      .items(
        Joi.object({
          startTime: Joi.string().required(),
          endTime: Joi.string().when('startTime', {
            is: 'none',
            then: Joi.forbidden(),
            otherwise: Joi.string().required(),
          }),
        }),
      )
      .messages({
        'any.min': t('errors.any.required'),
        'array.min': t('errors.any.required'),
        'array.base': t('errors.any.required'),
        'number.min': t('errors.any.required'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),
    thresholds: Joi.array()
      .items(
        Joi.object({
          timeValue: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    visitConfigurations: Joi.array()
      .items(
        Joi.object({
          timeValue: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),

    breakRules: Joi.array()
      .items(
        Joi.object({
          timeValue: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    runSheetDurations: Joi.array()
      .items(
        Joi.object({
          timeValue: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    shiftHits: Joi.array()
      .items(
        Joi.object({
          value: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    operationalServices: Joi.array()
      .items(
        Joi.object({
          minRate: Joi.number().required().min(0).max(9999),
          maxRate: Joi.number().required().min(1).max(9999).greater(Joi.ref('minRate')),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'number.greater': t('errors.number.greater'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    extraServices: Joi.array()
      .items(
        Joi.object({
          rateValue: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    additionalClientServices: Joi.array()
      .items(
        Joi.object({
          rateValue: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    devices: Joi.array()
      .items(
        Joi.object({
          rateValue: Joi.number().required().empty('').min(1).max(9999),
        }),
      )
      .messages({
        'number.required': t('errors.any.required'),
        'number.empty': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
        'number.unsafe': t('errors.value.max'),
      }),
    zoneId: Joi.string().messages({
      'any.min': t('errors.any.min'),
      'any.max': t('errors.any.max'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    recaptchaToken: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    numberOfUnits: Joi.number().greater(0).empty('').messages({
      'number.base': 'Please enter a valid number.',
      'number.empty': 'Number is required.',
      'number.greater': 'Number must be greater than 0.',
    }),
    occupancyRate: Joi.number().greater(0).empty('').messages({
      'number.base': 'Please enter a valid number.',
      'number.empty': 'Number is required.',
      'number.greater': 'Number must be greater than 0.',
    }),
    averageRent: Joi.number().greater(0).empty('').messages({
      'number.base': 'Please enter a valid number.',
      'number.empty': 'Number is required.',
      'number.greater': 'Number must be greater than 0.',
    }),
    managementCompany: Joi.string()
      .empty('')
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
      }),
    startsAt: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    endsAt: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    runsheetName: Joi.string()
      .min(1)
      .max(60)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),

    lineItems: Joi.array()
      .items(lineItemsSchema)
      .min(1)
      .messages({
        'array.min': t('errors.array.min'),
      })
      .custom((value, helpers) => {
        const nonDestroyedObjects = value.filter((obj) => !obj._destroy);
        if (nonDestroyedObjects.length === 0) {
          return helpers.error('array.min', { message: t('errors.array.min') });
        }
        return value;
      }),
    invoiceDate: timezoneSchema(t),
    dueDate: timezoneSchema(t),
    periodEnd: timezoneSchema(t),
    periodStart: timezoneSchema(t),
    dynamicFormField: Joi.object().pattern(/.*/, valueSchemaForDynamicForm(t)),

    dailySiteSummaryReceivers: Joi.array().items(
      Joi.string()
        .email({ tlds: false }) // Valid email format
        .messages({
          'string.email': t('errors.string.email'),
          'string.required': t('errors.string.email'),
        }),
    ),
    incidentReportReceivers: Joi.array().items(
      Joi.string()
        .email({ tlds: false }) // Valid email format
        .messages({
          'string.email': t('errors.string.email'),
          'string.required': t('errors.string.email'),
        }),
    ),
    visitor_load_profile: visitorLoadProfile,
    dispatchType: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    callerName: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    callerAddress: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    callerPhoneNumber: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    buildingNumber: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    apartmentNumber: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    dispatchDescription: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    callerRequestOfficerCallBack: Joi.boolean(),
    callFromMonitoringServiceType: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    contact: Joi.alternatives()
      .try(
        phoneNumberValidator(t),
        Joi.object()
          .custom((value, helpers) => {
            if (Object.keys(value).length === 0) {
              return helpers.error('object.empty');
            }
            return value;
          })
          .messages({
            'object.empty': t('errors.any.required'),
          }),
      )
      .match('one')
      .messages({
        'alternatives.any': t('errors.any.required'),
      }),
    cellNumber: phoneNumberValidator(t),

    taskTitle: Joi.string()
      .min(1)
      .max(80)
      .messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),

    taskDescription: Joi.string()
      .min(1)
      .messages({
        'any.min': t('errors.any.min'),
        'any.max': t('errors.any.max'),
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),

    taskType: Joi.string().messages({
      'any.min': t('errors.any.min'),
      'any.max': t('errors.any.max'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    taskPriority: Joi.string().messages({
      'any.min': t('errors.any.min'),
      'any.max': t('errors.any.max'),
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    taskFor: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    jobTitle: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    terminationDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),
    effectiveDate: Joi.string().messages({
      'any.required': t('errors.any.required'),
      'string.base': t('errors.any.required'),
      'string.empty': t('errors.any.required'),
    }),

    subject: Joi.string()
      .max(200) // Maximum length of 100 characters
      .messages({
        'any.required': t('errors.any.required'),
        'string.base': t('errors.any.required'),
        'string.empty': t('errors.any.required'),
      }),

    to: multipleEmailSchema(t).min(1),
    cc: multipleEmailSchema(t),
    bcc: multipleEmailSchema(t),

    date: stringSchema(t),
    time: stringSchema(t),
    meetingLink: Joi.string().when('provider', {
      switch: [
        {
          is: 'google_meet',
          then: stringSchema(t)
            .pattern(/^https?:\/\/(www\.)?meet\.google\.com/)
            .messages({
              'string.pattern.base': 'meetingLink is invalid.',
            }),
        },
        {
          is: 'microsoft_teams',
          then: stringSchema(t)
            .pattern(/^https?:\/\/(www\.)?teams\.live\.com/)
            .messages({
              'string.pattern.base': 'meetingLink is invalid.',
            }),
        },
        {
          is: 'zoom',
          then: stringSchema(t)
            .pattern(/^https?:\/\/([a-z0-9]+\.)?zoom\.us/)
            .messages({
              'string.pattern.base': 'meetingLink is invalid.',
            }),
        },
      ],
      otherwise: stringSchema(t),
    }),
    guests: multipleEmailSchema(t).min(1),
    meetingDescription: stringSchema(t).optional().allow('', null),
    provider: stringSchema(t),

    //
    pricingConfigurations: pricingConfigurationsSchema(t),
  });

  try {
    const options = {
      errors: {
        wrap: {
          label: '',
        },
      },
      abortEarly: false,
      allowUnknown: true,
    };
    const { error } = await schema.validateAsync(trimFormValues(form), options);
    if (error) {
      const errors = {};
      error.details.forEach((detail) => {
        const message = t(detail.message);
        const key = detail.context.key;
        const fallbackLabel = key.charAt(0).toUpperCase() + key.slice(1);
        const translatedLabel = t(`sales.errors.fields.${key}`);

        let label = translatedLabel !== `sales.errors.fields.${key}` ? translatedLabel : null;

        if (!label) {
          const errorMessageLabel = errorMessages[key];
          label = errorMessageLabel ? t(errorMessageLabel) : fallbackLabel;
        }

        let messageArray = message.split(' ');
        messageArray[0] = label;
        messageArray = messageArray.join(' ');
        errors[detail.path] = t(messageArray);
      });

      return errors;
    }

    return {}; // No errors
  } catch (err) {
    const errors = {};
    err.details.forEach((detail) => {
      const message = t(detail.message);
      if (!shouldNotAttachLabel) {
        let key = detail.context.key?.toString();
        if (typeof key !== 'string' && detail?.path?.[1]) {
          key = detail?.path?.[1];
        } else if (key) {
          key = key.replace(/([A-Z])/g, ' $1');
        }

        const fallbackLabel = key ? key.charAt(0).toUpperCase() + key.slice(1) : '';
        const originalKey = detail.context.key;
        const translatedLabel = t(`sales.errors.fields.${originalKey}`);

        let label =
          translatedLabel !== `sales.errors.fields.${originalKey}` ? translatedLabel : null;

        if (!label) {
          const errorMessageLabel = errorMessages[originalKey];
          label = errorMessageLabel ? t(errorMessageLabel) : fallbackLabel;
        }

        let messageArray = message.split(' ');
        messageArray[0] = label;
        messageArray = messageArray.join(' ');
        errors[detail.path] = t(messageArray);
      } else {
        errors[detail.path] = message;
      }
    });
    return errors;
  }
}

export const joiValidateErrors = async ({ data, t, field }) => {
  const errors = await joiValidate(data, t, field); // e.g; { tours } or { shifts }

  if (errors && Object.keys(errors).length) {
    return errors;
  }

  return null;
};
