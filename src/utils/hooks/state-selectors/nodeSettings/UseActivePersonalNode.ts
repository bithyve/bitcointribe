import { useMemo } from 'react'
import PersonalNode from '../../../../common/data/models/PersonalNode'
import useNodeSettingsState from './UseNodeSettingsState'


export default function useActivePersonalNode(): PersonalNode | null {
  const nodeSettingsState = useNodeSettingsState()

  return useMemo( () => {
    return nodeSettingsState.activePersonalNode
  }, [ nodeSettingsState.activePersonalNode ] )
}
