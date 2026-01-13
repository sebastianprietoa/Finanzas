function findLatestFileByPattern_(folderId, regex, allowedMimes) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();

  let best = null;
  let bestT = 0;

  while (files.hasNext()) {
    const f = files.next();
    const name = f.getName();
    const mime = f.getMimeType();

    if (regex && !regex.test(name)) continue;
    if (allowedMimes && allowedMimes.length && !allowedMimes.includes(mime)) continue;

    const t = f.getLastUpdated().getTime();
    if (t > bestT) { bestT = t; best = f; }
  }
  return best;
}

function isExcelMime_(mime) {
  return mime === MimeType.MICROSOFT_EXCEL ||
         mime === MimeType.MICROSOFT_EXCEL_LEGACY ||
         mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
         mime === 'application/vnd.ms-excel';
}

