import { useMemo } from 'react'
import Tor from '../../../../common/data/models/Tor'
import useTorSettingsState from './UseTorSettingsState'


export default function useActiveTor(): PersonalNode | null {
  const torSettingsState = useTorSettingsState()

  return useMemo( () => {
    return torSettingsState.activeTor
  }, [ torSettingsState.activeTor ] )
}
