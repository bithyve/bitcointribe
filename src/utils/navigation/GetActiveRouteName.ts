import { useNavigationState } from '@react-navigation/native'

export default function getActiveRouteName( ) {

  return useNavigationState( ( state ) =>
    state.routes[ state.index - 1 ]?.name
      ? state.routes[ state.index - 1 ].name
      : 'None'
  )

}
