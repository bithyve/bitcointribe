import { useMemo } from 'react'
import AccountShell from '../../../../common/data/models/AccountShell'
import useAccountShellForID from './UseAccountShellForID'
import { useSelector } from 'react-redux'

function useAccountShellFromRoute( route: any ): AccountShell | undefined {
  const tempAccId = useSelector( ( state ) => state.doNotStore.tempAccShellID )
  const accountShellID: string = useMemo( () => {
    const id = route.params?.accountShellID?route.params?.accountShellID:tempAccId
    return id
  }, [ route, tempAccId ] )
  return useAccountShellForID( accountShellID )
}

export default useAccountShellFromRoute
