export const UsNumberFormat = ( amount, decimalCount = 0, decimal = '.', thousands = ',' ) => {
  try {
    decimalCount = Math.abs( decimalCount )
    decimalCount = isNaN( decimalCount ) ? 2 : decimalCount
    const negativeSign = amount < 0 ? '-' : ''
    const i = parseInt( amount = Math.abs( Number( amount ) || 0 ).toFixed( decimalCount ) ).toString()
    const j = ( i.length > 3 ) ? i.length % 3 : 0
    return negativeSign + ( j ? i.substr( 0, j ) + thousands : '' ) + i.substr( j ).replace( /(\d{3})(?=\d)/g, '$1' + thousands ) + ( decimalCount ? decimal + Math.abs( amount - i ).toFixed( decimalCount ).slice( 2 ) : '' )
  } catch ( e ) {
    // console.log(e)
  }
}

export const timeConvert = ( valueInMinutes ) => {
  const num = valueInMinutes
  const hours = Math.round( num / 60 )
  const days = Math.round( hours / 24 )
  if ( valueInMinutes < 60 ) {
    return valueInMinutes + ' minutes'
  } else if ( hours < 24 ) {
    return hours + ' hours'
  } else if ( days > 0 ) {
    return days == 1 ? days + ' day' : days + ' days'
  }
}

export const timeConvertNear30 = ( valueInMinutes ) => {
  if ( valueInMinutes < 60 ) {
    return '.5 hours'
  }
  const num = Math.ceil( valueInMinutes / 30 ) * 30
  const hours = ( num / 60 )
  const rhours = Math.floor( hours )
  const minutes = ( hours - rhours ) * 60
  const rminutes = Math.round( minutes )
  if ( rhours > 0 && rminutes <= 0 ) {
    return rhours + ' hours'
  } else if ( rhours > 0 && rminutes > 0 ) {
    return rhours + '.5 hours'
  } else {
    return rminutes + ' minutes'
  }
}

export const getVersions = (versionHistory, restoreVersions) => {
  let versions = [];
  let versionHistoryArray = [];
  let restoreVersionsArray = [];
  if(versionHistory){
  for (let i=0; i<versionHistory.length; i++) {
    versionHistoryArray.push(versionHistory[i]);
  }
}
//console.log("versionHistoryArray",versionHistoryArray);

  if(restoreVersions){
  for (let i=0; i<restoreVersions.length; i++) {
    restoreVersionsArray.push(restoreVersions[i]);
  }
}
//console.log("restoreVersionsArray",restoreVersionsArray);

  if(versionHistoryArray.length && restoreVersionsArray.length){
    versions = [...versionHistoryArray ,...restoreVersionsArray];
  } else if(versionHistoryArray.length){
    versions = [...versionHistoryArray]
  } else if(restoreVersionsArray.length){
    versions = [...restoreVersionsArray]
  }
  //console.log("versions",versions);

  return versions;
}