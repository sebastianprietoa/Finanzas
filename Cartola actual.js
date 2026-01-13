function processCurrentCartola_FROM_FOLDER() {
  const ss = SpreadsheetApp.openById(CONFIG.MASTER_SHEET_ID);
  const cartolaSheet = ss.getSheetByName('Cartolas');
  if (!cartolaSheet) throw new Error('No existe la hoja "Cartolas" en el spreadsheet maestro.');

  // 1) Buscar el Excel de cartola más reciente en la carpeta
  const excel = findLatestFileByPattern_(
    CONFIG.INPUT_FOLDER_ID,
    CONFIG.FILE_PATTERNS.CC_CURRENT,
    null // no filtramos mimes aquí, lo validamos después
  );
  if (!excel) throw new Error('No encontré ningún archivo tipo "cartola" en la carpeta input.');

  // 2) Convertir si es Excel, si ya fuera Google Sheets lo abrimos directo
  let sourceSpreadsheetId;
  if (isExcelMime_(excel.getMimeType())) {
    sourceSpreadsheetId = convertExcelToGoogleSheetV3_(excel, CONFIG.INPUT_FOLDER_ID);
  } else if (excel.getMimeType() === MimeType.GOOGLE_SHEETS) {
    sourceSpreadsheetId = excel.getId();
  } else {
    throw new Error(`El archivo más reciente que calza con "cartola" no es Excel ni Google Sheets. MIME: ${excel.getMimeType()}`);
  }

  const tempSheet = SpreadsheetApp.openById(sourceSpreadsheetId).getSheets()[0];

  // Mes/año actual
  const now = new Date();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentYear = String(now.getFullYear());

  // Rango desde B28:G
  const dataRange = tempSheet.getRange("B28:G" + tempSheet.getLastRow()).getValues();

  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
  const out = [];

  for (let i = 0; i < dataRange.length; i++) {
    const dateValue = dataRange[i][0];
    if (!datePattern.test(dateValue)) continue;

    const [day, month, year] = dateValue.split('/');

    // Filtrar solo mes/año actual
    if (month !== currentMonth || year !== currentYear) continue;

    const formattedDate = `${day}/${month}`;
    const descriptionRaw = (dataRange[i][1] || '').toString();
    const description = descriptionRaw.toLowerCase();
    const channel = dataRange[i][2];

    const charges = dataRange[i][3] ? parseFloat(String(dataRange[i][3]).replace(/\./g, '').replace(',', '.')) : 0;
    const credits = dataRange[i][4] ? parseFloat(String(dataRange[i][4]).replace(/\./g, '').replace(',', '.')) : 0;
    const balance = dataRange[i][5] ? parseFloat(String(dataRange[i][5]).replace(/\./g, '').replace(',', '.')) : 0;

    const classification = classifyCC_(description);

    out.push([formattedDate, month, description, channel, charges, credits, balance, classification, year]);
  }

  const existingLastRow = cartolaSheet.getLastRow();
  let existingData = [];

  if (existingLastRow > 1) {
    existingData = cartolaSheet
      .getRange(2, 1, existingLastRow - 1, cartolaSheet.getLastColumn())
      .getValues();
  }

  const filteredData = existingData.filter(row => {
    const rowMonth = String(row[1] || '').padStart(2, '0');
    const rowYear = String(row[8] || '');
    return !(rowMonth === currentMonth && rowYear === currentYear);
  });

  const combinedData = filteredData.concat(out);

  if (existingLastRow > 1) {
    cartolaSheet.getRange(2, 1, existingLastRow - 1, cartolaSheet.getLastColumn()).clearContent();
  }

  if (combinedData.length > 0) {
    cartolaSheet.getRange(2, 1, combinedData.length, combinedData[0].length).setValues(combinedData);
  }

  Logger.log(`✅ Cartola actual procesada. Filas pegadas: ${out.length}`);
}
