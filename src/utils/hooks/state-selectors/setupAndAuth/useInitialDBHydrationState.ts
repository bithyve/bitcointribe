import { useSelector } from 'react-redux'

function useInitialDBHydrationState( ): Boolean {
  return useSelector( ( state ) => state.setupAndAuth.databaseHydrated )
}

export default useInitialDBHydrationState
