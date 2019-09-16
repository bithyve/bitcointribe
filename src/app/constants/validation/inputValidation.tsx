const restrict = ( event: any ) => {
    const regex = new RegExp( "/^[^!-\\/:-@\\[-`{-~]+$/;" );
    const key = String.fromCharCode( !event.charCode ? event.which : event.charCode );
    if ( !regex.test( key ) ) {
        event.preventDefault(); return false;
    }
}


module.exports = {
    restrict
};





