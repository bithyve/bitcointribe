import moment from 'moment'

export const timeFormatter=( current, previous ) =>{
  try {
    const msPerMinute = 60 * 1000
    const msPerHour = msPerMinute * 60
    const msPerDay = msPerHour * 24
    const msPerMonth = msPerDay * 30
    const msPerYear = msPerDay * 365

    const elapsed = current - previous

    if ( elapsed < msPerMinute ) {
      return Math.floor( elapsed/1000 ) + ' seconds ago'
    }

    else if ( elapsed < msPerHour ) {
      return Math.floor( elapsed/msPerMinute ) + ' minutes ago'
    }

    else if ( elapsed < msPerDay ) {
      return Math.floor( elapsed/msPerHour ) + ' hours ago'
    }

    else if ( elapsed < msPerMonth ) {
      return 'approximately ' + Math.floor( elapsed/msPerDay ) + ' days ago'
    }

    else if ( elapsed < msPerYear ) {
      return 'approximately ' + Math.floor( elapsed/msPerMonth ) + ' months ago'
    }

    else {
      return 'approximately ' + Math.floor( elapsed/msPerYear ) + ' years ago'
    }
  } catch ( error ) {
    return ''
  }
}

export const createRandomString = ( length, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-' ) => {
  let result = ''
  const charactersLength = characters.length
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt( Math.floor( Math.random() * charactersLength ) )
  }
  return result
}

export const getTime = ( item ) => {
  return ( item.toString() && item.toString() == '0' ) ||
    item.toString() == 'never'
    ? 'never'
    : timeFormatter( moment( new Date() ), moment( new Date( item ) ) )
}
