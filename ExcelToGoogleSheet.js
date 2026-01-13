function convertExcelToGoogleSheets(folderID) {
  const folder = DriveApp.getFolderById(folderID);
  const files = folder.getFiles();
  
  let convertedFiles = 0;
  Logger.log(`Iniciando conversión de archivos Excel en la carpeta con ID: ${folderID}`);

  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();
    const fileName = file.getName();
    Logger.log(`Procesando archivo: ${fileName} con MIME: ${mimeType}`);

    if (mimeType === MimeType.MICROSOFT_EXCEL || mimeType === MimeType.MICROSOFT_EXCEL_LEGACY) {
      const blob = file.getBlob();
      const newFile = {
        title: fileName.replace(/\.\w+$/, ''),  // Eliminar la extensión del archivo
        mimeType: MimeType.GOOGLE_SHEETS,
        parents: [{ id: folderID }]  // Asegurarse de que el archivo convertido se guarde en la misma carpeta
      };

      try {
        const createdFile = Drive.Files.insert(newFile, blob);  // Insertar el archivo como hoja de cálculo de Google
        Logger.log(`Archivo convertido exitosamente: ${newFile.title}`);
        
        // Eliminar el archivo original después de la conversión
        file.setTrashed(true);  // Mover el archivo original a la papelera
        Logger.log(`Archivo original eliminado: ${fileName}`);

        convertedFiles++;
      } catch (e) {
        Logger.log(`Error al convertir el archivo: ${fileName} - ${e.message}`);
      }
    } else {
      Logger.log(`Archivo omitido: ${fileName} no es un archivo Excel.`);
    }
  }

  Logger.log(`Conversión completa. Total de archivos procesados: ${convertedFiles}`);
}
