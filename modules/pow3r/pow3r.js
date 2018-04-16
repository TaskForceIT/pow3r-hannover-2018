// NPM Module laden

// const { generateBarcode, generatePdf, sendEmail } = require("./utility.js");
pjs.import("./utility.js", ["generateBarcode", "generatePdf", "sendEmail"]);

let barcodeGen = pjs.fiber.wrap(generateBarcode);
let pdfGen = pjs.fiber.wrap(generatePdf);
let emailSend = pjs.fiber.wrap(sendEmail);

function pow3r() {
  // Sichtbarkeit initialisieren
  container = false;
  sendmail = false;
  mreportv = false;

  pjs.defineDisplay("dashboard", "dashboard.json");

  /* Hier würde das Programm sich mit der DB2 Datenbank verbinden. Dafür braucht
    man aber den kostenpflichtigen Profound.js Connector. Damit man dieses Programm
    auch ohne Connector ausführen kann, wird hier der Datenbankzugriff mit dem Lesen
    einer JSON Datei simuliert.
  */
  // pjs.connect("*LOCAL");

  let dbData = require("./db.json");
  // aufgrund dieser Methode, gibt es kein Autocomplete in der Suchleiste

  // solange nicht der "BEENDEN" Knopf gedrückt wird
  while (!endprogram) {
    if (artikelid.trim().length > 0) {
      /* folgende Zeilen würde man mit für einen echten Datenbankzugriff benutzen
      let stmt = pjs.allocStmt();
      stmt.executeDirect(
        "SELECT * FROM GUENEY.ASTAKG00 WHERE ARTIKELID = " + artikelid.trim()
      );

      let row = stmt.fetch();
      stmt.close();
      */

      let row = dbData[artikelid.trim()];

      if (row) {
        container = true;

        arbez = row["bezeichnung"];
        arean = row["ean"];
        arsize = row["groesse"];
        bildurl = row["bild"];

        if (sendmail) {
          let barcode = barcodeGen(row);
          let pdfPath = pdfGen(row, barcode);
          let reportLink = emailSend(pdfPath, empfaenger.trim());
          mailreport = reportLink;
          mreportv = true;
        }
      }
    }
    dashboard.artikels.execute();
  }
}

module.exports.run = pow3r;
