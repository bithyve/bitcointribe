import React from 'react'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import Birthday from '../../assets/images/svgs/birthday.svg'
import Colors from '../../common/Colors'
import { GiftThemeId } from '../../bitcoin/utilities/Interface'

const ThemeList = [
  {
    'id': GiftThemeId.ONE, 'title': 'Gift sats', 'subText': 'Here\'s some sats for your stack', 'avatar': <GiftCard />, color: Colors.darkBlue
  },
  {
    'id': GiftThemeId.THREE, 'title': 'Happy Birthday!', 'subText': 'Have an amazing year ahead', 'avatar': <Birthday />, color: Colors.pink
  },
]
export default ThemeList
