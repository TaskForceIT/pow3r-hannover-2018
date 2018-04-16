const fs = require("fs");
const barcodeGenerator = require("bwip-js");
const PdfPrinter = require("pdfmake");
const nodemailer = require("nodemailer");

function generateBarcode(row, callback) {
  let barcodeConfig = {
    bcid: "ean13",
    text: row["ean"],
    scale: 1,
    monochrome: true,
    includetext: true,
    guardwhitespace: true
  };
  barcodeGenerator.toBuffer(barcodeConfig, function(error, barcode) {
    callback(error, barcode);
  });
}

function generatePdf(object, barcode, callback) {
  let printer = new PdfPrinter({
    Roboto: {
      normal: "/profoundkg/modules/pow3r/fonts/Roboto-Regular.ttf",
      bold: "/profoundkg/modules/pow3r/fonts/Roboto-Bold.ttf"
    }
  });
  let pdfDefinition = {
    content: [
      {
        text: "Artikeldaten",
        style: "header",
        alignment: "center"
      },
      { text: "Artikel-ID: " + object["artikelid"], margin: [0, 20, 0, 0] },
      "Bezeichnung: " + object["bezeichnung"]
    ],
    styles: {
      header: { fontSize: 24, bold: true }
    }
  };

  if (barcode) {
    pdfDefinition.content.push({ text: "Barcode: ", margin: [0, 20, 0, 0] });
    pdfDefinition.content.push({
      alignment: "justify",
      columns: [
        {
          image: barcode,
          margin: [0, 20, 0, 0]
        },
        {
          image:
            "/www/profound80/htdocs/profoundui/userdata/images/" +
            object["ean"] +
            ".jpg",
          width: 300,
          margin: [0, 20, -750, 0]
        }
      ]
    });
  }

  let pdfDocument = printer.createPdfKitDocument(pdfDefinition);
  pdfDocument.pipe(
    fs.WriteStream("/profoundkg/modules/pow3r/pdf/" + object["ean"] + ".pdf")
  );
  pdfDocument.end();
  callback(
    undefined,
    "/profoundkg/modules/pow3r/pdf/" + object["ean"] + ".pdf"
  );
}

function sendEmail(pdfPath, recipients, callback) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: account.user, // generated ethereal user
        pass: account.pass // generated ethereal password
      }
    });

    // setup email data with unicode symbols
    let mailOptions = {
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: recipients.replace("§", "@"), // list of receivers
      subject: "Artikelblatt", // Subject line,
      text: "",
      attachments: [
        {
          filename: "Artikelblatt.pdf",
          path: pdfPath,
          contentType: "application/pdf"
        }
      ]
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      // console.log("Message sent: %s", info.messageId);
      // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      callback(undefined, nodemailer.getTestMessageUrl(info));
    });
  });
}

module.exports = {
  generateBarcode: generateBarcode,
  generatePdf: generatePdf,
  sendEmail: sendEmail
};
