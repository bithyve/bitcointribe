import { CommonActions } from '@react-navigation/native';

export const goHomeAction = ( ) => {
  return CommonActions.reset({
    index: 0,
    routes: [{ name: 'Landing' }],
  });
}

export const resetToHomeAction = ( params = {
} ) => {
  return CommonActions.navigate({
    name: 'Home',
    params,
  });
}

export const resetStackToAccountDetails = ( params ) => {
  return CommonActions.reset({
    index: 0,
    routes: [
      {
        name: 'Landing',
        state: {
          routes: [
            {
              name: 'AccountDetails',
              params,
            },
          ],
        },
      },
    ],
  });
}

export const resetStackToAccountDetailsSendScreen = ( params ) => {
  return CommonActions.reset({
    index: 0,
    routes: [
      {
        name: 'Landing',
        state: {
          routes: [
            {
              name: 'AccountDetails',
              state: {
                routes: [
                  {
                    name: 'Send',
                    params,
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  });
}

export const resetStackToSend = ( params ) => {
  return CommonActions.reset({
    index: 0,
    routes: [
      {
        name: 'Landing',
        state: {
          routes: [
            {
              name: 'AccountDetails',
              state: {
                routes: [
                  {
                    name: 'Send',
                    state: {
                      routes: [
                        {
                          name: 'SentAmountForContactForm',
                          params,
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  });
}
