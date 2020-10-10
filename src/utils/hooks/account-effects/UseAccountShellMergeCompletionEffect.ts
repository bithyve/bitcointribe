import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import AccountShell from "../../../common/data/models/AccountShell";
import { accountShellMergeCompleted } from "../../../store/actions/accounts";

type SuccessCallbackProps = {
  source: AccountShell;
  destination: AccountShell;
};

type Props = {
  onSuccess: (props: SuccessCallbackProps) => void;
  onError: () => void;
};

export default function useAccountShellMergeCompletionEffect({
  onSuccess,
  onError,
}: Props) {
  const dispatch = useDispatch();

  const {
    hasAccountShellMergeSucceeded,
    hasAccountShellMergeFailed,
    accountShellMergeSource,
    accountShellMergeDestination,
  } = useSelector(state => state.accounts);

  useEffect(() => {
    if (hasAccountShellMergeSucceeded) {
      onSuccess({
        source: accountShellMergeSource,
        destination: accountShellMergeDestination,
      });
    } else if (hasAccountShellMergeFailed) {
      onError();
    }

    dispatch(accountShellMergeCompleted());
  }, [hasAccountShellMergeSucceeded, hasAccountShellMergeFailed]);
}
