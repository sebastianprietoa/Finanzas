function runAllProcesses() {
  const ui = SpreadsheetApp.getUi();

  try {
    const folderId = getFolderIdByFileName("Finanzas 2");  // Obtener el folderId usando la nueva función

    if (!folderId) {
      ui.alert('No se encontró la carpeta que contiene el archivo "Finanzas 2".');
      return;
    }

    // Mostrar un mensaje de "Cargando" al usuario utilizando el archivo HTML
    const htmlOutput = HtmlService.createHtmlOutputFromFile('Cargando')
      .setWidth(200)
      .setHeight(100);
    
    // Mostrar la ventana de "Cargando"
    const dialog = ui.showModalDialog(htmlOutput, 'Por favor espere');
    
    // Ejecutar las funciones necesarias
    convertExcelToGoogleSheets(folderId);
    processCurrentCartola_FROM_FOLDER();      // Procesar cartola actual
    extractAndCopyCartolasFromGoogleSheets()
    processMovFacturadosVisa();
    processMovFacturadosMastercard();       // Procesar movimientos facturados
    processNoFacturadosVisa();        // Procesar movimientos no facturados Visa
    processNoFacturadosMastercard();        // Procesar movimientos no facturados Mastercard
    processAllOldInvoices();      // Procesar facturaciones antiguas

    // Mostrar mensaje de éxito cuando termine la ejecución
    ui.alert('Procesos completados con éxito.');
  } catch (e) {
    // Si ocurre un error, mostrar una alerta con el mensaje de error
    ui.alert('Error durante la ejecución: ' + e.message);
  } finally {
    // Cerrar la ventana de "Cargando" al finalizar la ejecución
    closeLoadingDialog();
  }
}

function getFolderIdByFileName(fileName) {
  const files = DriveApp.getFilesByName(fileName);
  
  if (files.hasNext()) {
    const file = files.next();
    const folder = file.getParents().next();
    const folderId = folder.getId();
    Logger.log('Archivo encontrado en la carpeta con ID: ' + folderId);
    return folderId;
  } else {
    Logger.log('Archivo no encontrado');
    return null; // Si no se encuentra el archivo, devolver null
  }
}

function getSheetIdByName(sheetName) {
  const files = DriveApp.getFilesByName(sheetName);
  
  if (files.hasNext()) {
    const file = files.next(); // Obtener el primer archivo con ese nombre
    const fileId = file.getId(); // Obtener el ID del archivo
    Logger.log('ID del archivo "' + sheetName + '": ' + fileId);
    return fileId;
  } else {
    Logger.log('No se encontró ningún archivo con el nombre: ' + sheetName);
    return null;
  }
}


function closeLoadingDialog() {
  const closeDialogScript = '<script>google.script.host.close();</script>';
  const closeDialogOutput = HtmlService.createHtmlOutput(closeDialogScript);
  SpreadsheetApp.getUi().showModalDialog(closeDialogOutput, 'Cerrando');
}



function extractUniqueDescriptions() {
  // ID de la carpeta que contiene el archivo "Saldo_y_Mov_No_Facturado"
  const folderId = '1hZ5xqEwUdE-7kurotgiXmH-ylVQvE8HQ';
  const folder = DriveApp.getFolderById(folderId);

  // Nombre del archivo de los movimientos no facturados
  const fileName = 'Saldo_y_Mov_No_Facturado';

  // Obtener el archivo de los movimientos no facturados
  const files = folder.getFilesByName(fileName);
  if (!files.hasNext()) {
    Logger.log('El archivo no se encontró en la carpeta especificada.');
    return;
  }

  const file = files.next();
  const tempSheet = SpreadsheetApp.openById(file.getId()).getSheets()[0]; // Primera hoja

  // Obtener los datos desde la fila 2 y columnas necesarias
  const dataRange = tempSheet.getRange("B2:L" + tempSheet.getLastRow()).getValues(); // Leer desde columna B hasta L
  
  let descriptions = new Set();  // Conjunto para almacenar descripciones únicas

  // Extraer todas las descripciones únicas
  for (let i = 0; i < dataRange.length; i++) {
    const description = dataRange[i][3];  // Descripción (columnas E y F combinadas)
    descriptions.add(description);
  }

  // Mostrar todas las descripciones únicas en los Logs
  descriptions.forEach(function(desc) {
    Logger.log(desc);
  });
  
  Logger.log('Extracción de descripciones completa.');
}


function simpleConvertXLStoXLSX() {
  // ID de la carpeta que contiene los archivos .xls
  const folderId = '1q6xnHnAt6vngYFGo-IngB1hMx43t4cEm';
  const folder = DriveApp.getFolderById(folderId);

  const files = folder.getFilesByType(MimeType.MICROSOFT_EXCEL);
  
  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();
    
    if (fileName.toLowerCase().endsWith('.xls')) {
      Logger.log('Intentando convertir archivo: ' + fileName);
      
      try {
        // Crear un archivo temporal en Google Drive y abrirlo
        const tempBlob = file.getBlob();
        const tempFile = DriveApp.createFile(tempBlob);
        const spreadsheet = SpreadsheetApp.open(tempFile);
        
        // Guardar como .xlsx
        const xlsxBlob = spreadsheet.getBlob().setContentType(MimeType.MICROSOFT_EXCEL);
        const newFileName = fileName.replace('.xls', '.xlsx');
        folder.createFile(xlsxBlob).setName(newFileName);
        
        // Limpiar archivos temporales
        file.setTrashed(true);
        tempFile.setTrashed(true);
        
        Logger.log('Conversión completa: ' + newFileName);
      } catch (e) {
        Logger.log('Error al convertir ' + fileName + ': ' + e.toString());
      }
    }
  }
}

function reclassifyDescriptions() {
  // ID del archivo de Google Sheets "Finanzas 2"
  const sheetId = '1mH2RX-Tr1dohooJOsy2cxtN7BpP0AvDq0pt8jkBD0OQ';
  const sheet = SpreadsheetApp.openById(sheetId);
  const movFacturadosSheet = sheet.getSheetByName('mov_facturados_historicos');

  // Obtener el rango de descripciones y categorías actuales
  const lastRow = movFacturadosSheet.getLastRow();
  if (lastRow <= 1) {
    Logger.log('No hay descripciones para reclasificar.');
    return;
  }

  const range = movFacturadosSheet.getRange(2, 3, lastRow - 1, 1); // Columna de Descripciones (Columna C)
  const descriptions = range.getValues(); // Obtener todas las descripciones como un array
  const classificationRange = movFacturadosSheet.getRange(2, 8, lastRow - 1, 1); // Columna de Categorías (Columna H)

  let newClassifications = []; // Array para almacenar las nuevas clasificaciones

  // Recorrer cada descripción y reclasificar
  for (let i = 0; i < descriptions.length; i++) {
    const description = descriptions[i][0];
    const newClassification = classifyDescription(description);
    newClassifications.push([newClassification]);
  }

  // Actualizar la hoja con las nuevas clasificaciones
  classificationRange.setValues(newClassifications);

  Logger.log('Reclasificación completada.');
}

function classifyDescription(description) {
  description = description.toLowerCase(); // Convertir a minúsculas para facilitar la comparación

  if (description.includes("uber") || description.includes("didi")) {
    return "Transporte";
  }
  if (description.includes("sta isabel") || description.includes("olivo market") || description.includes("merk2 express") || description.includes("unimarc") || description.includes("tottus") || description.includes("er ferias") || description.includes("chavreys market") || description.includes("minimarket") || description.includes("botilleria")) {
    return "Supermercados y Tiendas de Comestibles";
  }
  if (description.includes("cafeteria") || description.includes("galpon italia") || description.includes("san camilo") || description.includes("la cosecha") || description.includes("ok market") || description.includes("la pica del cronica") || description.includes("krossbar")) {
    return "Comida y Bebida";
  }
  if (description.includes("google play") || description.includes("cinepolis") || description.includes("ticketmaster")) {
    return "Entretenimiento y Ocio";
  }
  if (description.includes("merpago") || description.includes("mercadopago") || description.includes("mercado lib")) {
    return "Compras en Línea";
  }
  if (description.includes("instituto psiquiat")) {
    return "Salud";
  }
  if (description.includes("gimnasios chile")) {
    return "Gimnasios y Deporte";
  }
  if (description.includes("impuesto") || description.includes("comision mensual") || description.includes("intereses rotativos") || description.includes("traspaso deuda")) {
    return "Impuestos y Comisiones";
  }
  if (description.includes("la polar") || description.includes("falabella") || description.includes("saxol mall vivo") || description.includes("easy internet")) {
    return "Retail";
  }
  return "Otros"; // Clasificación por defecto si no encaja en ninguna otra
}
