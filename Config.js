const CONFIG = {
  MASTER_SHEET_ID: '1mH2RX-Tr1dohooJOsy2cxtN7BpP0AvDq0pt8jkBD0OQ',
  INPUT_FOLDER_ID: '1S0twTFBifS6Mc0II31mMJdusCtq3woyk',
  UNBILLED_MOVEMENTS_FOLDER_ID: '1hZ5xqEwUdE-7kurotgiXmH-ylVQvE8HQ',
  XLS_CONVERSION_FOLDER_ID: '1q6xnHnAt6vngYFGo-IngB1hMx43t4cEm',
  UNBILLED_MOVEMENTS_FILE_NAME: 'Saldo_y_Mov_No_Facturado',
  UNBILLED_MOVEMENTS_VISA_FILE_NAME: 'Saldo_y_Mov_No_Facturado_Visa',
  UNBILLED_MOVEMENTS_MASTERCARD_FILE_NAME: 'Saldo_y_Mov_No_Facturado_Mastercard',
  BILLED_MOVEMENTS_VISA_FILE_NAME: 'Mov_Facturado_Visa',
  BILLED_MOVEMENTS_MASTERCARD_FILE_NAME: 'Mov_Facturado_Mastercard',
  OLD_INVOICES_FOLDER_ID: '1q6xnHnAt6vngYFGo-IngB1hMx43t4cEm',
  OLD_CARTOLAS_FOLDER_ID: '16E_RvO6E9IYqBKbo3ZwUOvh802UR8Xw5',

  // Patrones para encontrar archivos aunque tengan (31), (22), etc.
  FILE_PATTERNS: {
    CC_CURRENT: /(^|\s)cartola(\s|\(|\.|$)/i
  }
};
