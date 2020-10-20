export default function getFormattedStringFromQRString(qrString: string): string {
  qrString = qrString.split('"').join('Dquote');
  qrString = qrString.split(':').join('Qutation');
  qrString = qrString.split('{').join('Lbrace');
  qrString = qrString.split('}').join('Rbrace');
  qrString = qrString.split('/').join('Slash');
  qrString = qrString.split(',').join('Comma');
  qrString = qrString.split("'").join('Squote');
  qrString = qrString.split(' ').join('Space');

  return qrString;
}
