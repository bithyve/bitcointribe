import React from 'react'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import Birthday from '../../assets/images/svgs/birthday.svg'
import Wedding from '../../assets/images/svgs/icon_wedding.svg'
import Christmas from '../../assets/images/svgs/christmas.svg'
import Colors from '../../common/Colors'
import { GiftThemeId } from '../../bitcoin/utilities/Interface'

const ThemeList = [
  {
    'id': GiftThemeId.ONE, 'title': 'Gift sats', 'subText': 'Here\'s some sats for your stack', 'avatar': <GiftCard />, color: Colors.darkBlue
  },
  {
    'id': GiftThemeId.THREE, 'title': 'Happy Birthday!', 'subText': 'Have an amazing year ahead', 'avatar': <Birthday />, color: Colors.pink
  },
  {
    'id': GiftThemeId.FIVE, 'title': 'Merry Christmas', 'subText': 'Yuletide cheers to you and yours', 'avatar': <Christmas />, color: Colors.pink
  },
  {
    'id': GiftThemeId.SIX, 'title': 'Wedding best wishes!', 'subText': 'A special gift for a special couple', 'avatar': <Wedding />, color: Colors.pink
  },
]
export default ThemeList
