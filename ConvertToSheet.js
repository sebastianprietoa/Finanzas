function convertExcelToGoogleSheets2() {
  const folderId = '1hZ5xqEwUdE-7kurotgiXmH-ylVQvE8HQ';  // ID de la carpeta
  const folder = DriveApp.getFolderById(folderId);
  
  Logger.log("Listando todos los archivos en la carpeta con ID: " + folderId);
  let files = folder.getFiles();
  let fileCount = 0;  // Contador para saber cuántos archivos se han procesado

  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();
    const mimeType = file.getMimeType();
    
    Logger.log("Procesando archivo: " + fileName + " con MIME: " + mimeType);
    
    // Verificar si el archivo tiene la extensión ".xls" o ".xlsx"
    if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) {
      try {
        // Obtener el Blob (contenido del archivo)
        const blob = file.getBlob();
        
        // Crear un archivo de Google Sheets desde el archivo Excel
        const newFile = Drive.Files.insert(
          {
            title: fileName.replace('.xls', '').replace('.xlsx', ''),
            mimeType: MimeType.GOOGLE_SHEETS,
            parents: [{ id: folderId }]
          },
          blob
        );
        
        if (newFile) {
          Logger.log("Archivo convertido exitosamente: " + newFile.title);
          
          // Incrementar contador de archivos procesados
          fileCount++;
          
          // Eliminar el archivo original (Excel)
          file.setTrashed(true);
          Logger.log("Archivo original eliminado: " + fileName);
        }
      } catch (error) {
        Logger.log("Error al convertir el archivo: " + fileName + ' - ' + error.message);
      }
    } else {
      Logger.log("Archivo omitido: " + fileName + " no es un archivo Excel.");
    }
  }

  if (fileCount === 0) {
    Logger.log("No se encontraron archivos de tipo Excel en la carpeta.");
  } else {
    Logger.log("Conversión completa. Total de archivos procesados: " + fileCount);
  }
}
