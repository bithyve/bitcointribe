import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { subAccountSettingsUpdateCompleted } from "../../../store/actions/accounts";


export default function useAccountSettingsUpdatedEffect(
  onComplete: () => void
) {
  const dispatch = useDispatch();
  const { hasAccountSettingsUpdateSucceeded } = useSelector(state => state.accounts);

  useEffect(() => {
    if (hasAccountSettingsUpdateSucceeded) {
      dispatch(subAccountSettingsUpdateCompleted());
      onComplete();
    }
  }, [hasAccountSettingsUpdateSucceeded]);
}
