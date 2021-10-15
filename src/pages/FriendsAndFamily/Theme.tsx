import React from 'react'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import Halloween from '../../assets/images/svgs/halloween.svg'
import Birthday from '../../assets/images/svgs/birthday.svg'
import Colors from '../../common/Colors'

const ThemeList = [
  {
    'id': '1', 'title': 'Bitcoin', 'subText': 'Lorem ipsum dolor', 'avatar': <GiftCard />, color: Colors.lightBlue
  },
  {
    'id': '2', 'title': 'Halloween', 'subText': 'Lorem ipsum dolor', 'avatar': <Birthday />, color: Colors.greenShade
  },
  {
    'id': '3', 'title': 'Birthday', 'subText': 'Lorem ipsum dolor', 'avatar': <Halloween />, color: Colors.pink
  },
  {
    'id': '4', 'title': 'Wedding', 'subText': 'Lorem ipsum dolor', 'avatar': <Birthday />, color: Colors.lightBlue
  },
  // {
  //   "id": "5","title": "Congratulations", "subText": "Lorem ipsum dolor", "avatar": <Birthday />
  // }
]
export default ThemeList
