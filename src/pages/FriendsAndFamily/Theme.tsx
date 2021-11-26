import React from 'react'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import Birthday from '../../assets/images/svgs/birthday.svg'
import Wedding from '../../assets/images/svgs/icon_wedding.svg'
import Christmas from '../../assets/images/svgs/christmas.svg'
import Colors from '../../common/Colors'
import { GiftThemeId } from '../../bitcoin/utilities/Interface'

const ThemeList = [
  {
    'id': GiftThemeId.ONE, 'title': 'Gift sats', 'subText': 'Something that appreciates with time', 'avatar': <GiftCard />, color: Colors.darkBlue
  },
  {
    'id': GiftThemeId.THREE, 'title': 'Birthday', 'subText': 'The only better birthday gift is time.', 'avatar': <Birthday />, color: Colors.pink
  },
  {
    'id': GiftThemeId.FIVE, 'title': 'Christmas', 'subText': 'This Christmas be the Santa who gifts sats', 'avatar': <Christmas />, color: Colors.pink
  },
  {
    'id': GiftThemeId.SIX, 'title': 'Wedding', 'subText': 'Give a gift fit to be an heirloom', 'avatar': <Wedding />, color: Colors.pink
  },
]
export default ThemeList
