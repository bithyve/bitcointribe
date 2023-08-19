import { columns } from './BorderWalletGridScreen'

export const generateGridHtmlString = ( array, mnemonic ) => {
  const data = [ ...array ]
  let htmlTable1 = '<table>'
  let htmlTable2 = '<table>'

  let tableHeader = '<tr><th> </th>'
  columns.forEach( ( col ) => {
    tableHeader += `<th>${col}</th>`
  } )
  tableHeader += '<th> </th></tr>'
  htmlTable1 += tableHeader
  htmlTable2 += tableHeader

  const table1 = data.slice( 0, data.length / 2 )
  const table2 = data.slice( data.length / 2, data.length )

  for ( let i = 0; i < table1.length; i++ ) {
    if ( i % 16 === 0 ) {
      if ( i !== 0 ) {
        htmlTable1 += `<th>${i / 16}</th></tr>`
      }
      htmlTable1 += `<tr><th>${i / 16 + 1}</th>`
    }
    htmlTable1 += '<td>' + table1[ i ].slice( 0, 4 ) + '</td>'
  }

  for ( let i = 0; i < table2.length; i++ ) {
    if ( i % 16 === 0 ) {
      if ( i !== 0 ) {
        htmlTable2 += `<th>${i / 16 + 64}</th></tr>`
      }
      htmlTable2 += `<tr><th>${i / 16 + 65}</th>`
    }
    htmlTable2 += '<td>' + table2[ i ].slice( 0, 4 ) + '</td>'
  }

  htmlTable1 += `<th>64</th></tr>${tableHeader}</table>`
  htmlTable2 += `<th>128</th></tr>${tableHeader}</table>`
  const html = `
  <!DOCTYPE html>
<html>
<head>
<style>
p, h4 {
font-size: 10px;
text-align: center;
}
table {
border-collapse: collapse;
width: 100%;
font-size: 8.5px;
text-align: center;
}
th, td {
border: 0.8px solid gray;
padding: 0.1;
nargin: 0;
}
th {
background-color: #f2f2f2;
}
@media print {
.pagebreak { page-break-before: always; } /* page-break-after works, as well */
}
</style>
</head>
<body>
<h4>Bitcoin Tribe Border Wallets</h4>
${htmlTable1}
<p>Recovery Phrase: ${mnemonic}</p>
<div class="pagebreak"> </div>
<h4>Bitcoin Tribe Border Wallets</h4>
${htmlTable2}
<p>Recovery Phrase: ${mnemonic}</p>
</body>
</html>`

  return html
}
