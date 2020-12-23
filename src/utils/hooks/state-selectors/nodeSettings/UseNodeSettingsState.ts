import { useSelector } from 'react-redux'
import { NodeSettingsState } from '../../../../store/reducers/nodeSettings'


export default function useNodeSettingsState(): NodeSettingsState {
  return useSelector( state => state.nodeSettings )
}
