import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { newAccountShellCreationCompleted } from "../../../store/actions/accounts";


export default function useAccountShellCreationCompletionEffect(onComplete: () => void) {
  const dispatch = useDispatch();
  const { hasNewAccountGenerationSucceeded } = useSelector(state => state.accounts);

  useEffect(() => {
    if (hasNewAccountGenerationSucceeded) {
      dispatch(newAccountShellCreationCompleted());
      onComplete();
    }
  }, [hasNewAccountGenerationSucceeded]);
}
