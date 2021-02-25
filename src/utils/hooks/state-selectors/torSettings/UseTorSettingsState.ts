import { useSelector } from 'react-redux'
import { TorSettingsState } from '../../../../store/reducers/torSettings'


export default function useTorSettingsState(): TorSettingsState {
  return useSelector( state => state.torSettings )
}
