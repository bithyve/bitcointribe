import { UPDATE_APP_PREFERENCE } from "../constants"
import { chain } from 'icepick'

const initialState = {
    isInternetModalCome: false
}

export default (state = initialState, { type, payload }) => {
    switch (type) {
        case UPDATE_APP_PREFERENCE:
            return chain(state).setIn([payload.key], payload.value).value()

        default:
            return state
    }
}
