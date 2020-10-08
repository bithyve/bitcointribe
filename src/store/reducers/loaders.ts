import { SWITCH_TC_LOADING } from "../actions/trustedContacts";
import { chain } from 'icepick'

const INITIAL_STATE = {
    initialLoadingCompleted: false,
};


const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case SWITCH_TC_LOADING:
            if (action.payload.beingLoaded === "trustedChannelsSync") {
                return chain(state).setIn(['initialLoadingCompleted'], !state.initialLoadingCompleted).value()
            } else {
                return state
            }
        default:
            return state
    }

}



export default reducer