function runAllProcesses() {
  const ui = getUiOrNull_();
  const startTime = new Date();

  try {
    logProcessProgress_('Iniciando runAllProcesses');
    const folderId = getFolderIdByFileName("Finanzas 2");  // Obtener el folderId usando la nueva función

    if (!folderId) {
      if (ui) ui.alert('No se encontró la carpeta que contiene el archivo "Finanzas 2".');
      Logger.log('No se encontró la carpeta que contiene el archivo "Finanzas 2".');
      return;
    }

    logProcessProgress_('Folder ID detectado', { folderId: folderId });

    // Mostrar un mensaje de "Cargando" al usuario utilizando el archivo HTML
    if (ui) {
      const htmlOutput = HtmlService.createHtmlOutputFromFile('Cargando')
        .setWidth(200)
        .setHeight(100);
      
      // Mostrar la ventana de "Cargando"
      ui.showModalDialog(htmlOutput, 'Por favor espere');
    }
    
    // Ejecutar las funciones necesarias
    runProcessStep_('convertExcelToGoogleSheets', function() {
      convertExcelToGoogleSheets(folderId);
    });
    runProcessStep_('extractAndCopyCartolasFromGoogleSheets', function() {
      extractAndCopyCartolasFromGoogleSheets();
    });
    runProcessStep_('processCurrentCartola_FROM_FOLDER', function() {
      processCurrentCartola_FROM_FOLDER();      // Procesar cartola actual
    });
    runProcessStep_('processMovFacturadosVisa', function() {
      processMovFacturadosVisa();
    });
    runProcessStep_('processMovFacturadosMastercard', function() {
      processMovFacturadosMastercard();       // Procesar movimientos facturados
    });
    runProcessStep_('processNoFacturadosVisa', function() {
      processNoFacturadosVisa();        // Procesar movimientos no facturados Visa
    });
    runProcessStep_('processNoFacturadosMastercard', function() {
      processNoFacturadosMastercard();        // Procesar movimientos no facturados Mastercard
    });
    runProcessStep_('processAllOldInvoices', function() {
      processAllOldInvoices();      // Procesar facturaciones antiguas
    });

    // Mostrar mensaje de éxito cuando termine la ejecución
    if (ui) ui.alert('Procesos completados con éxito.');
    const totalSeconds = secondsSince_(startTime);
    logProcessProgress_('runAllProcesses completado', { duration_s: totalSeconds });
    Logger.log('Procesos completados con éxito.');
  } catch (e) {
    // Si ocurre un error, mostrar una alerta con el mensaje de error
    const totalSeconds = secondsSince_(startTime);
    logProcessProgress_('Error en runAllProcesses', {
      duration_s: totalSeconds,
      message: e.message,
      stack: e.stack || 'sin stack'
    });
    if (ui) ui.alert('Error durante la ejecución: ' + e.message);
    Logger.log('Error durante la ejecución: ' + e.message);
  } finally {
    // Cerrar la ventana de "Cargando" al finalizar la ejecución
    closeLoadingDialog(ui);
  }
}

function runProcessStep_(stepName, fn) {
  const startedAt = new Date();
  logProcessProgress_('Iniciando paso', { step: stepName });

  try {
    fn();
    logProcessProgress_('Paso completado', {
      step: stepName,
      duration_s: secondsSince_(startedAt)
    });
  } catch (e) {
    logProcessProgress_('Paso con error', {
      step: stepName,
      duration_s: secondsSince_(startedAt),
      message: e.message,
      stack: e.stack || 'sin stack'
    });
    throw e;
  }
}

function secondsSince_(date) {
  return Math.round(((new Date()).getTime() - date.getTime()) / 1000);
}

function logProcessProgress_(message, payload) {
  const timestamp = (new Date()).toISOString();
  if (!payload) {
    Logger.log('[runAllProcesses][' + timestamp + '] ' + message);
    return;
  }

  Logger.log('[runAllProcesses][' + timestamp + '] ' + message + ' | ' + JSON.stringify(payload));
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


function closeLoadingDialog(ui) {
  if (!ui) return;
  const closeDialogScript = '<script>google.script.host.close();</script>';
  const closeDialogOutput = HtmlService.createHtmlOutput(closeDialogScript);
  ui.showModalDialog(closeDialogOutput, 'Cerrando');
}

function getUiOrNull_() {
  try {
    return SpreadsheetApp.getUi();
  } catch (e) {
    return null;
  }
}


function extractUniqueDescriptions() {
  // ID de la carpeta que contiene el archivo "Saldo_y_Mov_No_Facturado"
  const folder = DriveApp.getFolderById(CONFIG.UNBILLED_MOVEMENTS_FOLDER_ID);

  // Nombre del archivo de los movimientos no facturados
  const fileName = CONFIG.UNBILLED_MOVEMENTS_FILE_NAME;

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
  const folder = DriveApp.getFolderById(CONFIG.XLS_CONVERSION_FOLDER_ID);

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
  const sheet = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
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
    const newClassification = classifyCardDescription_(description);
    newClassifications.push([newClassification]);
  }

  // Actualizar la hoja con las nuevas clasificaciones
  classificationRange.setValues(newClassifications);

  Logger.log('Reclasificación completada.');
}
