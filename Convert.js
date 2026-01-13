function convertExcelToGoogleSheetV3_(file, parentFolderId) {
  const sourceName = file.getName();
  const newTitle = sourceName.replace(/\.\w+$/, '') + ' [GS]';

  const resource = {
    name: newTitle,
    mimeType: MimeType.GOOGLE_SHEETS,
    parents: [parentFolderId]
  };

  // Drive API v3 (Servicio avanzado)
  const created = Drive.Files.copy(resource, file.getId(), {
    convert: true,
    fields: "id,name,mimeType"
  });

  return created.id;
}
