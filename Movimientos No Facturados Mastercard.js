function processNoFacturadosMastercard() {
  const ui = SpreadsheetApp.getUi();
  
  // Mostrar un mensaje de "Cargando"
  const htmlOutput = HtmlService.createHtmlOutputFromFile('Cargando')
    .setWidth(200)
    .setHeight(100);
  ui.showModalDialog(htmlOutput, 'Por favor espere');

  try {
    const folder = DriveApp.getFolderById(CONFIG.UNBILLED_MOVEMENTS_FOLDER_ID);
    const fileName = CONFIG.UNBILLED_MOVEMENTS_MASTERCARD_FILE_NAME;
    const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const movNoFacturadosSheet = sheet.getSheetByName('Mov_No_facturados_Mastercard');

    // Limpiar hoja destino
    const lastRow = movNoFacturadosSheet.getLastRow();
    if (lastRow > 1) {
      movNoFacturadosSheet.getRange(2, 1, lastRow - 1, movNoFacturadosSheet.getLastColumn()).clearContent();
    }

    // Abrir archivo origen
    const files = folder.getFilesByName(fileName);
    if (!files.hasNext()) {
      Logger.log('El archivo no se encontró en la carpeta especificada.');
      return;
    }
    const file = files.next();
    const tempSheet = SpreadsheetApp.openById(file.getId()).getSheets()[0];

    // Leer datos desde la columna B a L
    const dataRange = tempSheet.getRange("B2:L" + tempSheet.getLastRow()).getValues();
    let allData = [];
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;

    for (let i = 0; i < dataRange.length; i++) {
      const dateValue = dataRange[i][0]; // Fecha
      if (!datePattern.test(dateValue)) continue;

      const [day, month, year] = dateValue.split('/');
      const tipoTarjeta = dataRange[i][1];  
      const description = dataRange[i][3];  
      const ciudad = dataRange[i][5];  
      const cuotas = dataRange[i][6];  

      // Leer monto (col K o L)
      let monto = dataRange[i][9] || dataRange[i][10];
      if (typeof monto === 'string') {
        monto = monto.replace(/\./g, '').replace(',', '.');
        monto = parseFloat(monto);
      } else if (typeof monto !== 'number') {
        monto = 0;
      }

      // 👉 Calcular monto real
      let montoReal = monto;
      if (cuotas && typeof cuotas === "string" && cuotas.includes("/")) {
        const partes = cuotas.split("/");
        const totalCuotas = parseInt(partes[1], 10);
        if (!isNaN(totalCuotas) && totalCuotas > 1) {
          montoReal = monto / totalCuotas;
        }
      }

      const tipo = "No Facturado";  

      allData.push([dateValue, tipoTarjeta, description, ciudad, cuotas, monto, montoReal, month, year, tipo]);
    }

    // Pegar datos en la hoja destino
    if (allData.length > 0) {
      movNoFacturadosSheet
        .getRange(2, 1, allData.length, allData[0].length)
        .setValues(allData);
    }

    Logger.log('Movimientos no facturados procesados correctamente.');

  } catch (e) {
    ui.alert('Error durante la ejecución: ' + e.message);
  } finally {
    const closeDialogScript = '<script>google.script.host.close();</script>';
    const closeDialogOutput = HtmlService.createHtmlOutput(closeDialogScript);
    SpreadsheetApp.getUi().showModalDialog(closeDialogOutput, 'Cerrando');
  }
}
