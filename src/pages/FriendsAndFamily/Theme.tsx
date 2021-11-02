import React from 'react'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import Halloween from '../../assets/images/svgs/halloween.svg'
import Birthday from '../../assets/images/svgs/birthday.svg'
import Diwali from '../../assets/images/svgs/diwali.svg'
import Colors from '../../common/Colors'
import { GiftThemeId } from '../../bitcoin/utilities/Interface'

const ThemeList = [
  {
    'id': GiftThemeId.ONE, 'title': 'Gift sats', 'subText': 'Here\'s some sats for your stack', 'avatar': <GiftCard />, color: Colors.darkBlue
  },
  {
    'id': GiftThemeId.TWO, 'title': 'Happy Halloween!', 'subText': 'Trick or Treat?', 'avatar': <Halloween />, color: Colors.greenShade
  },
  {
    'id': GiftThemeId.THREE, 'title': 'Happy Birthday!', 'subText': 'Have an amazing year ahead', 'avatar': <Birthday />, color: Colors.pink
  },
  {
    'id': GiftThemeId.FOUR, 'title': 'Happy Diwali!', 'subText': 'Wishing good health and prosperity to you', 'avatar': <Diwali />, color: Colors.purple
  },
  // {
  //   "id": "5","title": "Congratulations", "subText": "Lorem ipsum dolor", "avatar": <Birthday />
  // }
]
export default ThemeList
