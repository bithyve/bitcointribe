export default function getFormattedStringFromQRString(qrString: string): string {
  let dataString = qrString
  dataString = dataString.split('Dquote').join('"');
  dataString = dataString.split('Qutation').join(':');
  dataString = dataString.split('Lbrace').join('{');
  dataString = dataString.split('Rbrace').join('}');
  dataString = dataString.split('Slash').join('/');
  dataString = dataString.split('Comma').join(',');
  dataString = dataString.split('Squote').join("'");
  dataString = dataString.split('Space').join(' ');
  return dataString;
}
