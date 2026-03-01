function processAllOldInvoices() {
  const ui = getUiOrNull_();
  
  // Mostrar un mensaje de "Cargando" al usuario utilizando el archivo HTML
  const htmlOutput = HtmlService.createHtmlOutputFromFile('Cargando')
    .setWidth(200)
    .setHeight(100);
  
  // Mostrar la ventana de "Cargando"
  if (ui) ui.showModalDialog(htmlOutput, 'Por favor espere');

  try {
    // ID de la carpeta que contiene los archivos de facturación antiguos
    const folder = DriveApp.getFolderById(CONFIG.OLD_INVOICES_FOLDER_ID);

    // ID del archivo de Google Sheets "Finanzas 2"
    const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
    const movFacturadosSheet = sheet.getSheetByName('Mov_facturados_historicos');

    // Borrar todo el contenido desde la fila 2 en adelante en la hoja "Mov_facturados_historicos"
    const lastRow = movFacturadosSheet.getLastRow();
    if (lastRow > 1) {
      movFacturadosSheet.getRange(2, 1, lastRow - 1, movFacturadosSheet.getLastColumn()).clearContent();
    }

    // Obtener todos los archivos en la carpeta
    const files = folder.getFiles();

    let allData = [];  // Array para almacenar todos los datos antes de pegarlos

    // Procesar cada archivo en la carpeta
    while (files.hasNext()) {
      const file = files.next();
      const tempSheet = SpreadsheetApp.openById(file.getId()).getSheets()[0]; // Primera hoja

      // Obtener la fecha desde la celda J15
      let billingDate = tempSheet.getRange("J15").getValue();
      let month;

      // Convertir la fecha si es una cadena de texto
      if (typeof billingDate === 'string') {
        billingDate = new Date(billingDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'));
      }

      if (billingDate instanceof Date && !isNaN(billingDate)) {
        month = ("0" + (billingDate.getMonth() + 1)).slice(-2); // Obtener el mes como 'mm'
      } else {
        Logger.log('La fecha en J15 no es válida.');
        continue;  // Saltar al siguiente archivo si la fecha no es válida
      }

      // Obtener los datos desde la fila 19 y columnas necesarias, manejando las combinaciones
      const dataRange = tempSheet.getRange("B19:K" + tempSheet.getLastRow()).getValues(); // Leer desde columna B hasta K

      // Expresión regular para verificar el formato de fecha "xx/xx/xxxx"
      const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;

      for (let i = 0; i < dataRange.length; i++) {
        const categoria = dataRange[i][0];  // Categoría en columna B
        const dateValue = dataRange[i][1];  // Fecha en columna C
        const cuotas = dataRange[i][5];  // Cuotas en columna G

        // Verificar si la columna C contiene una fecha válida antes de proceder
        if (!datePattern.test(dateValue)) continue;

        // Eliminar filas con "00/xx" en "Cuotas"
        if (cuotas.startsWith("00")) continue;

        const dateParts = dateValue.split('/'); // Separar la fecha en partes
        const day = dateParts[0];
        const year = dateParts[2];  // Extraer el año

        const description = dataRange[i][2];  // Descripción (columnas D, E y F combinadas)

        // Clasificar la descripción en una categoría
        const classification = classifyCardDescription_(description, { extended: true });

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

        // Determinar el tipo de pago
        let pagoType = (cuotas === "01/01") ? "simple" : "cuotas";

        const tipo = "Facturado";  // Tipo de transacción

        // Construir la fila completa para agregarla a allData, incluyendo la clasificación y el tipo de pago
        allData.push([categoria, dateValue, description, cuotas, monto, month, year, classification, pagoType]);
      }
    }

    // Pegar todos los datos en la hoja "Mov_facturados_historicos" de una sola vez
    if (allData.length > 0) {
      movFacturadosSheet.getRange(movFacturadosSheet.getLastRow() + 1, 1, allData.length, allData[0].length).setValues(allData);
    }

    Logger.log('Todos los movimientos facturados antiguos procesados correctamente.');
    
  } catch (e) {
    if (ui) ui.alert('Error durante la ejecución: ' + e.message);
    Logger.log('Error durante processAllOldInvoices: ' + e.message);
  } finally {
    // Cerrar el mensaje de "Cargando" al terminar
    closeLoadingDialog(ui);
  }
}
