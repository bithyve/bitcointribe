import { useSelector } from 'react-redux';
import { SendingState } from '../../../../store/reducers/sending';


export default function useSendingState(): SendingState {
  return useSelector(state => state.sending);
}
