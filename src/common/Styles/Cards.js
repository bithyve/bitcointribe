import { StyleSheet } from 'react-native';
import Colors from '../Colors';

const CardStyles = StyleSheet.create({
  horizontalScrollViewCardContainer: {
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowColor: Colors.borderColor,
    elevation: 6,
  },

  horizontalScrollViewCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CardStyles;
