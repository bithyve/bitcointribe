import { Easing } from 'react-native-reanimated'
import BottomSheetHandle from '../../components/bottom-sheets/BottomSheetHandle'
import { BottomSheetModalConfigs } from '@gorhom/bottom-sheet/lib/typescript/types'
import { BottomSheetOverlay } from '@gorhom/bottom-sheet'


const defaultBottomSheetConfigs: BottomSheetModalConfigs = {
  snapPoints: [ 0, '60%' ],
  initialSnapIndex: 1,
  animationDuration: 425,
  animationEasing: Easing.out(Easing.cubic),
  handleComponent: BottomSheetHandle,
  overlayComponent: BottomSheetOverlay,
  overlayOpacity: 0.75,
  dismissOnOverlayPress: true,
}


export default defaultBottomSheetConfigs
