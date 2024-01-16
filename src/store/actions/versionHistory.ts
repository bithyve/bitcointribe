export const SET_VERSIONS_HISTORY = 'SET_VERSIONS_HISTORY'
export const SET_VERSION = 'SET_VERSION'
export const RESTORED_VERSIONS_HISTORY = 'RESTORED_VERSIONS_HISTORY'

export const setVersion = ( versionType ) => {
  return {
    type: SET_VERSION,
    payload: {
      versionType
    },
  }
}

export const setVersionHistory = ( versions ) => {
  return {
    type: SET_VERSIONS_HISTORY,
    payload: {
      versions
    },
  }
}

export const restoredVersionHistory = ( versions ) => {
  return {
    type: RESTORED_VERSIONS_HISTORY,
    payload: {
      restoreVersions : versions
    },
  }
}
