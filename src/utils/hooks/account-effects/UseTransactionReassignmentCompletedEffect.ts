import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { transactionReassignmentCompleted } from "../../../store/actions/accounts";

type Props = {
  onSuccess: (transactionReassignmentDestinationID: string) => void;
  onError: () => void;
};

export default function useTransactionReassignmentCompletedEffect({
  onSuccess,
  onError,
}: Props) {
  const dispatch = useDispatch();

  const {
    hasTransactionReassignmentSucceeded,
    hasTransactionReassignmentFailed,
    transactionReassignmentDestinationID,
  } = useSelector(state => state.accounts);

  useEffect(() => {
    if (hasTransactionReassignmentSucceeded) {
      onSuccess(transactionReassignmentDestinationID);
    } else if (hasTransactionReassignmentFailed) {
      onError();
    }

    dispatch(transactionReassignmentCompleted());
  }, [hasTransactionReassignmentSucceeded, hasTransactionReassignmentFailed]);
}
