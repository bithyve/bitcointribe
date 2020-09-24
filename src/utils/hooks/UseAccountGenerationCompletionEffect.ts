import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { newAccountAddCompleted } from "../../store/actions/accounts";


export default function useAccountGenerationCompletionEffect(onComplete: () => void) {
  const dispatch = useDispatch();
  const { hasNewAccountGenerationSucceeded } = useSelector(state => state.accounts);

  useEffect(() => {
    if (hasNewAccountGenerationSucceeded) {
      dispatch(newAccountAddCompleted());
      onComplete();
    }
  }, [hasNewAccountGenerationSucceeded]);
}
