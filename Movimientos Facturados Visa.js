function processMovFacturadosVisa() {
  // ID de la carpeta que contiene el archivo "Mov_Facturados"
  const folder = DriveApp.getFolderById(CONFIG.UNBILLED_MOVEMENTS_FOLDER_ID);

  // Nombre del archivo de los movimientos facturados
  const fileName = CONFIG.BILLED_MOVEMENTS_VISA_FILE_NAME;

  // ID del archivo de Google Sheets "Finanzas 2"
  const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const movFacturadosSheet = sheet.getSheetByName('Mov_facturados_Visa');

  // Borrar todo el contenido desde la fila 2 en adelante en la hoja "Mov_facturados"
  const lastRow = movFacturadosSheet.getLastRow();
  if (lastRow > 1) {
    movFacturadosSheet.getRange(2, 1, lastRow - 1, movFacturadosSheet.getLastColumn()).clearContent();
  }

  // Obtener el archivo de los movimientos facturados
  const files = folder.getFilesByName(fileName);
  if (!files.hasNext()) {
    Logger.log('El archivo no se encontró en la carpeta especificada.');
    return;
  }

  const file = files.next();
  const tempSheet = SpreadsheetApp.openById(file.getId()).getSheets()[0]; // Primera hoja

  // Copiar la fecha de facturación de F15:G15 y pegarla en L2 en el archivo de destino
  const billingDate = tempSheet.getRange("F15:G15").getValue();
  movFacturadosSheet.getRange("L2").setValue(billingDate);

  // Obtener los datos desde la fila 19 y columnas necesarias, manejando las combinaciones
  const dataRange = tempSheet.getRange("B19:K" + tempSheet.getLastRow()).getValues(); // Leer desde columna B hasta K

  let allData = [];  // Array para almacenar todos los datos antes de pegarlos

  // Expresión regular para verificar el formato de fecha "xx/xx/xxxx"
  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;

  for (let i = 0; i < dataRange.length; i++) {
    const categoria = dataRange[i][0];  // Categoría en columna B
    const dateValue = dataRange[i][1];  // Fecha en columna C

    // Verificar si la columna C contiene una fecha válida antes de proceder
    if (!datePattern.test(dateValue)) continue;

    const dateParts = dateValue.split('/'); // Separar la fecha en partes
    const day = dateParts[0];
    const month = dateParts[1];  // Extraer el mes
    const year = dateParts[2];  // Extraer el año

    const description = dataRange[i][2];  // Descripción (columnas D, E y F combinadas)

    // Clasificar la descripción en una categoría
    const classification = classifyCardDescription_(description);

    // Cambiar el monto a 0 si la descripción contiene "Pago Pesos TEF"
    let monto;
    if (description.includes("Pago Pesos TEF")) {
      monto = 0;
    } else {
      // Monto en columnas H, I, J y K combinadas
      monto = dataRange[i][6] || dataRange[i][7] || dataRange[i][8] || dataRange[i][9];
      if (typeof monto === 'string') {
        monto = monto.replace(/\./g, '').replace(',', '.');  // Convertir a número si es string
        monto = parseFloat(monto);  // Convertir a número
      } else if (typeof monto !== 'number') {
        monto = 0;  // Si el monto no es un número válido, asignar 0
      }
    }

    const cuotas = dataRange[i][5];  // Cuotas (columna G)

    // Nueva columna: tipo de pago (simple o cuotas)
    let tipoPago = (cuotas && cuotas.endsWith("/01")) ? "simple" : "Cuotas";

    const tipo = "Facturado";  // Tipo de transacción

    // Construir la fila completa para agregarla a allData, incluyendo la clasificación
    allData.push([
      categoria,
      dateValue,
      description,
      cuotas,
      monto,
      month,
      year,
      classification,
      tipo,
      tipoPago // Nueva columna
    ]);
  }

  // Pegar todos los datos en la hoja "Mov_facturados" de una sola vez
  if (allData.length > 0) {
    movFacturadosSheet.getRange(movFacturadosSheet.getLastRow() + 1, 1, allData.length, allData[0].length).setValues(allData);
  }

  Logger.log('Movimientos facturados Visa procesados correctamente.');
}
