import moment from 'moment'
import Colors from '../../common/Colors'
import { Milliseconds } from '../../common/data/typealiases/UnitAliases'
import config from '../../bitcoin/HexaConfig'
const LAST_SEEN_ACTIVE_DURATION = config.LAST_SEEN_ACTIVE_DURATION
const LAST_SEEN_AWAY_DURATION = config.LAST_SEEN_AWAY_DURATION

export function colorForLastSeenActive( lastSeenActiveTime: Milliseconds ) {
  if ( !lastSeenActiveTime ) {
    return Colors.gray2
  }

  const startTime = moment( lastSeenActiveTime )
  const endTime = moment( Date.now() )
  const minutesSince = endTime.diff( startTime, 'minutes' )

  if ( minutesSince < LAST_SEEN_ACTIVE_DURATION ) {
    return Colors.green
  } else if ( minutesSince < LAST_SEEN_AWAY_DURATION ) {
    return Colors.red
  } else {
    return Colors.gray2
  }
}


export function agoTextForLastSeen( lastSeenActiveTime: Milliseconds ) {
  const daysDiff = moment( lastSeenActiveTime ).diff( Date.now(), 'days' )

  if ( daysDiff == 0 ) {
    return 'today'
  } else {
    return moment( lastSeenActiveTime ).fromNow()
  }
}
