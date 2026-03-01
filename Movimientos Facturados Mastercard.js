function processMovFacturadosMastercard() {
  const folder = DriveApp.getFolderById(CONFIG.UNBILLED_MOVEMENTS_FOLDER_ID);
  const fileName = CONFIG.BILLED_MOVEMENTS_MASTERCARD_FILE_NAME;
  const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const movFacturadosSheet = sheet.getSheetByName('Mov_facturados_Mastercard');

  // Limpiar hoja desde la fila 2
  const lastRow = movFacturadosSheet.getLastRow();
  if (lastRow > 1) {
    movFacturadosSheet.getRange(2, 1, lastRow - 1, movFacturadosSheet.getLastColumn()).clearContent();
  }

  const files = folder.getFilesByName(fileName);
  if (!files.hasNext()) {
    Logger.log('El archivo no se encontró en la carpeta especificada.');
    return;
  }

  const file = files.next();
  const tempSheet = SpreadsheetApp.openById(file.getId()).getSheets()[0]; // Primera hoja

  // Copiar fecha de facturación
  const billingDate = tempSheet.getRange("F15:G15").getValue();
  movFacturadosSheet.getRange("L2").setValue(billingDate);

  // Obtener datos
  const dataRange = tempSheet.getRange("B19:K" + tempSheet.getLastRow()).getValues();

  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
  let allData = [];

  for (let i = 0; i < dataRange.length; i++) {
    const categoria = dataRange[i][0];  // Col B
    const dateValue = dataRange[i][1];  // Col C

    if (!datePattern.test(dateValue)) continue;

    const [day, month, year] = dateValue.split('/');
    const description = dataRange[i][2];  // Descripción combinada
    const classification = classifyCardDescription_(description);

    // Procesar monto
    let monto;
    if (description.includes("Pago Pesos TEF")) {
      monto = 0;
    } else {
      monto = dataRange[i][6] || dataRange[i][7] || dataRange[i][8] || dataRange[i][9];
      if (typeof monto === 'string') {
        monto = monto.replace(/\./g, '').replace(',', '.');
        monto = parseFloat(monto);
      } else if (typeof monto !== 'number') {
        monto = 0;
      }
    }

    // Cuotas como texto seguro
    let cuotas = dataRange[i][5]; // Col G
    if (cuotas !== "" && cuotas !== null && cuotas !== undefined) {
      cuotas = `'${cuotas.toString()}`;  // Forzar string
    } else {
      cuotas = "'01/01";  // Valor por defecto seguro
    }

    // Nueva columna: tipo de pago (simple o cuotas)
    let tipoPago = cuotas.endsWith("/01") ? "simple" : "Cuotas";

    const tipo = "Facturado";

    allData.push([
      categoria,
      dateValue,
      description,
      cuotas, // Col D
      monto,
      month,
      year,
      classification,
      tipo,
      tipoPago // Nueva columna al final
    ]);
  }

  if (allData.length > 0) {
    movFacturadosSheet.getRange(movFacturadosSheet.getLastRow() + 1, 1, allData.length, allData[0].length).setValues(allData);
  }

  Logger.log('Movimientos facturados procesados correctamente.');
}
