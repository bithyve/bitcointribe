import React from 'react'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import Halloween from '../../assets/images/svgs/halloween.svg'
import Birthday from '../../assets/images/svgs/birthday.svg'
import Diwali from '../../assets/images/svgs/diwali.svg'
import Colors from '../../common/Colors'
import { GiftThemeId } from '../../bitcoin/utilities/Interface'

const ThemeList = [
  {
    'id': GiftThemeId.ONE, 'title': 'Bitcoin', 'subText': 'Lorem ipsum dolor', 'avatar': <GiftCard />, color: Colors.lightBlue
  },
  {
    'id': GiftThemeId.TWO, 'title': 'Halloween', 'subText': 'Lorem ipsum dolor', 'avatar': <Halloween />, color: Colors.greenShade
  },
  {
    'id': GiftThemeId.THREE, 'title': 'Birthday', 'subText': 'Lorem ipsum dolor', 'avatar': <Birthday />, color: Colors.pink
  },
  {
    'id': GiftThemeId.FOUR, 'title': 'Diwali', 'subText': 'Lorem ipsum dolor', 'avatar': <Diwali />, color: Colors.purple
  },
  // {
  //   "id": "5","title": "Congratulations", "subText": "Lorem ipsum dolor", "avatar": <Birthday />
  // }
]
export default ThemeList
