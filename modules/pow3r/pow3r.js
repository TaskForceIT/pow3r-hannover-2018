// NPM Module laden

const { generateBarcode, generatePdf, sendEmail } = require("./utility.js");

let barcodeGen = pjs.fiber.wrap(generateBarcode);
let pdfGen = pjs.fiber.wrap(generatePdf);
let emailSend = pjs.fiber.wrap(sendEmail);

function pow3r() {
  // Sichtbarkeit initialisieren
  container = false;
  sendmail = false;
  mreportv = false;

  pjs.defineDisplay("dashboard", "dashboard.json");

  // mit der Datenbank verbinden
  pjs.connect("*LOCAL");

  // solange nicht der "BEENDEN" Knopf gedrückt wird
  while (!endprogram) {
    if (artikelid.trim().length > 0) {
      var stmt = pjs.allocStmt();

      stmt.executeDirect(
        "SELECT * FROM GUENEY.ASTAKG00 WHERE ARTIKELID = " + artikelid.trim()
      );

      var row = stmt.fetch();
      stmt.close();

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
