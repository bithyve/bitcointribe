import { useMemo } from 'react'
import AccountShell from '../../../../common/data/models/AccountShell'
import useAccountShellForID from './UseAccountShellForID'

//TODO: test this properly
function useAccountShellFromRoute( route: any ): AccountShell | undefined {
  const accountShellID: string = useMemo( () => {
    return route.params?.accountShellID ) || ''
  }, [ route ] )

  return useAccountShellForID( accountShellID )
}

export default useAccountShellFromRoute
