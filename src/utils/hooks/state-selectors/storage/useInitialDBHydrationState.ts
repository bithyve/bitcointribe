import { useSelector } from 'react-redux'

function useInitialDBHydrationState( ): Boolean {
  return useSelector( ( state ) => state.storage.databaseHydrated )
}

export default useInitialDBHydrationState
