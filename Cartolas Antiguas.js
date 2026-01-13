function extractAndCopyCartolasFromGoogleSheets() {
  // ID de la carpeta que contiene los archivos convertidos a Google Sheets
  const folder = DriveApp.getFolderById(CONFIG.OLD_CARTOLAS_FOLDER_ID);
  convertExcelToGoogleSheets(CONFIG.OLD_CARTOLAS_FOLDER_ID)

  // ID del archivo de Google Sheets "Finanzas 2"
  const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const cartolasSheet = sheet.getSheetByName('Cartolas');

  // Borrar todo el contenido desde la fila 2 en adelante
  const lastRow = cartolasSheet.getLastRow();
  if (lastRow > 1) {
    cartolasSheet.getRange(2, 1, lastRow - 1, cartolasSheet.getLastColumn()).clearContent();
  }

  // Obtener todos los archivos en la carpeta
  const files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
  
  
  // Expresión regular para verificar el formato de fecha "xx/xx"
  const datePattern = /^\d{2}\/\d{2}$/;
  
  let allData = [];  // Array para almacenar todos los datos antes de pegarlos
  
  while (files.hasNext()) {
    const file = files.next();
    Logger.log(file)
    const tempSheet = SpreadsheetApp.openById(file.getId()).getSheets()[0]; // Primera hoja

    // Obtener el año de la celda E14
    const dateValueE14 = tempSheet.getRange("E14").getValue();
    Logger.log(dateValueE14)
    let year;

    // Verificar si dateValueE14 es un string (si es una fecha almacenada como texto)
    if (typeof dateValueE14 === 'string') {
      const dateParts = dateValueE14.split('/'); // Asumimos formato "dd/mm/yyyy"
      year = dateParts[2]; // Extraer el año
    } else if (Object.prototype.toString.call(dateValueE14) === '[object Date]') {
      year = dateValueE14.getFullYear(); // Extraer el año si es un objeto Date
    } else {
      year = ""; // Si no es un formato reconocido, dejar el año en blanco
    }

    // Encontrar la última fila con el formato "xx/xx"
    let lastRow = 26;  // Empezar desde la fila 26 (índice 25)
    const dataRange = tempSheet.getRange("B26:G" + tempSheet.getLastRow()).getValues(); // Leer desde columna B hasta G
    
    for (let i = 0; i < dataRange.length; i++) {
      if (datePattern.test(dataRange[i][0])) { // Verificar si la columna B contiene una fecha válida
        lastRow = i + 26;  // Ajuste porque i es un índice basado en 0 y necesitamos el número de fila real
      }
    }

    // Obtener los datos desde la fila 26 hasta la última fila con formato "xx/xx"
    const range = tempSheet.getRange("B26:G" + lastRow);
    const values = range.getValues();
      
    // Agregar los datos a la matriz allData
    for (let i = 0; i < values.length; i++) {
      const dateValue = values[i][0];
      const month = dateValue.split('/')[1];  // Extraer el mes de la fecha (asumiendo formato "dd/mm")
      const description = values[i][1];  // Descripción (columna C)
      const channel = values[i][2];  // Canal o Sucursal (columna D)
      
      // Verificar que el valor no sea nulo y convertir a string antes de aplicar replace
      const charges = values[i][3] ? parseFloat(String(values[i][3]).replace(/\./g, '').replace(',', '.')) : 0;
      const credits = values[i][4] ? parseFloat(String(values[i][4]).replace(/\./g, '').replace(',', '.')) : 0;
      const balance = values[i][5] ? parseFloat(String(values[i][5]).replace(/\./g, '').replace(',', '.')) : 0;
      
      // Clasificación basada en la descripción
      const classification = classifyCC_(description.toLowerCase());

      

      // Construir la fila completa para agregarla a allData, incluyendo el año
      allData.push([dateValue, month, description, channel, charges, credits, balance, classification, year]);
    }
  }
  
  // Pegar todos los datos en la hoja "Cartolas" de una sola vez
  if (allData.length > 0) {
    cartolasSheet.getRange(cartolasSheet.getLastRow() + 1, 1, allData.length, allData[0].length).setValues(allData);
  }

  Logger.log('Cartolas importadas correctamente.');
}
