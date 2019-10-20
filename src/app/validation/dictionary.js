// eslint-disable-next-line import/prefer-default-export
export const validationDictionary = {
  generic: {
    presence: {
      allowEmpty: false,
      message: '^This is required',
    },
  },

  answer: {
    presence: {
      allowEmpty: false,
      message: '^This is required',
    },
    length: {
      minimum: 3,
      message: '^Answer must be at least 3 charater long',
    },
  },

  confirmAnswer: {
    presence: {
      allowEmpty: false,
      message: '^This is required',
    },
    length: {
      minimum: 3,
      message: '^Answer must be at least 3 charater long',
    },
  },

  email: {
    presence: {
      allowEmpty: false,
      message: '^This is required',
    },
    email: {
      message: '^Email address must be valid',
    },
  },

  zip: {
    presence: {
      allowEmpty: false,
      message: '^This is required',
    },
    length: {
      is: 6,
      message: '^Zip must be 6 digits long',
    },
  },

  phone: {
    presence: {
      allowEmpty: false,
      message: '^This is required',
    },
    length: {
      minimum: 10,
      message: '^Phone must be at least 10 number long',
    },
  },

  password: {
    presence: {
      allowEmpty: false,
      message: '^This is required',
    },
    length: {
      minimum: 6,
      message: '^Password must be at least 6 characters long',
    },
  },

  confirmPassword: {
    presence: {
      allowEmpty: false,
      message: '^This is required',
    },
    // equality: "password"
  },

  bool: {
    presence: {
      allowEmpty: false,
      message: '^This is required',
    },
  },

  day: {
    presence: {
      allowEmpty: false,
      message: '^This is required',
    },
    numericality: {
      greaterThan: 0,
      lessThanOrEqualTo: 31,
      message: '^Must be valid',
    },
  },

  integer: {
    presence: {
      allowEmpty: false,
      message: '^This is required',
    },
    numericality: {
      greaterThan: 0,
      onlyInteger: true,
      message: '^Must be valid',
    },
  },

  month: {
    presence: {
      allowEmpty: false,
      message: '^This is required',
    },
    numericality: {
      greaterThan: 0,
      lessThanOrEqualTo: 12,
      message: '^Must be valid',
    },
  },

  state: {
    presence: {
      allowEmpty: false,
      message: '^This is required',
    },
    inclusion: {
      within: [
        'AK',
        'AL',
        'AR',
        'AZ',
        'CA',
        'CO',
        'CT',
        'DC',
        'DE',
        'FL',
        'GA',
        'HI',
        'IA',
        'ID',
        'IL',
        'IN',
        'KS',
        'KY',
        'LA',
        'MA',
        'MD',
        'ME',
        'MI',
        'MN',
        'MO',
        'MS',
        'MT',
        'NC',
        'ND',
        'NE',
        'NH',
        'NJ',
        'NM',
        'NV',
        'NY',
        'OH',
        'OK',
        'OR',
        'PA',
        'RI',
        'SC',
        'SD',
        'TN',
        'TX',
        'UT',
        'VA',
        'VT',
        'WA',
        'WI',
        'WV',
        'WY',
      ],
      message: '^Must be valid',
    },
  },
};
