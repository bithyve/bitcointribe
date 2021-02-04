export const SET_VERSIONS = 'SET_VERSIONS'


export const setVersions = ( versions ) => {
    return {
      type: SET_VERSIONS,
      payload: {
        versions
      },
    }
  }