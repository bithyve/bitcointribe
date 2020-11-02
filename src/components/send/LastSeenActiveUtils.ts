import moment from "moment";
import Colors from '../../common/Colors';
import { Milliseconds } from "../../common/data/typealiases/UnitAliases";


export function colorForLastSeenActive(lastSeenActiveTime: Milliseconds) {
  const startDate = moment(lastSeenActiveTime);
  const endDate = moment(Date.now());
  const daysSince = endDate.diff(startDate, 'days');

  if (daysSince < 15) {
    return Colors.green;
  } else if (daysSince < 45) {
    return Colors.red;
  } else {
    return Colors.gray2;
  }
}
