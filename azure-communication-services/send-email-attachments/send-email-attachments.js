const { EmailClient } = require("@azure/communication-email");
const connectionString = "";
const sender = "";
const toRecipients = {
    to: [
        { email: "", displayName: "" },
    ],
};

const fs = require("fs");
const ics = require('ics');

// for pdf file attachment
pdfAttachmentPath = __dirname + "\\attachment.pdf";
pdfAttachmentContent = fs.readFileSync(pdfAttachmentPath).toString("base64");

// for text file attachment
txtAttachmentPath = __dirname + "\\attachment.txt";
txtAttachmentContent = fs.readFileSync(txtAttachmentPath).toString("base64");

// for ics file attachment
const event = {
  start: [2022, 12, 25, 6, 30],
  duration: { hours: 6, minutes: 30 },
  title: 'Bolder Boulder',
  description: 'Annual 10-kilometer run in Boulder, Colorado',
  location: 'Folsom Field, University of Colorado (finish line)',
  url: 'http://www.bolderboulder.com/',
  geo: { lat: 40.0095, lon: 105.2669 },
  categories: ['10k races', 'Memorial Day Weekend', 'Boulder CO'],
  status: 'CONFIRMED',
  busyStatus: 'BUSY',
  organizer: { name: 'Admin', email: 'Race@BolderBOULDER.com' },
  attendees: [
    { name: 'Adam Gibbons', email: 'adam@example.com', rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' },
    { name: 'Brittany Seaton', email: 'brittany@example2.org', dir: 'https://linkedin.com/in/brittanyseaton', role: 'OPT-PARTICIPANT' }
  ]
};

icsAttachmentPath = __dirname + "\\attachment.ics";
ics.createEvent(event, (error, value) => {
  if (error) {
    throw error;
  }

  fs.writeFileSync(icsAttachmentPath, value);
})
icsAttachmentContent = fs.readFileSync(icsAttachmentPath).toString("base64");

const emailAttachments = [
  {
    contentBytesBase64: pdfAttachmentContent,
    name: "attachment.pdf",
    attachmentType: "pdf",
  },
  {
    contentBytesBase64: txtAttachmentContent,
    name: "attachment.txt",
    attachmentType: "txt",
  },
  {
    contentBytesBase64: icsAttachmentContent,
    name: "attachment.ics",
    attachmentType: "pdf" // 'ics' is not currently a supported attachmentType. attachmentType is used to define the MIME type in the SMTP protocol
  }
];

const client = new EmailClient(connectionString);

const emailContent = {
    
  subject: "Send email attachments- JS sample",
  plainText: "Test Email from JS Send Email Sample Application\n\n This email is part of testing of email communication service. \\n Best wishes",
  html: "<html><head><title>ACS Email as a Service</title></head><body><h1>ACS Email as a Service - Html body</h1><h2>This email is part of testing of email communication service</h2></body></html>",
};


async function main() {
  try {
    const emailMessage = {
      sender: sender,
      content: emailContent,
      importance: 'normal',
      recipients: toRecipients,
      attachments: emailAttachments,
      };

    const sendResult = await client.send(emailMessage);

    if (sendResult && sendResult.messageId) {
      const messageId = sendResult.messageId;
        if (messageId === null || messageId === undefined) {
        console.log("Message Id not found.");
        return;
      }

      console.log("Send email success, MessageId :", messageId);

      let counter = 0;
      const statusInterval = setInterval(async function () {
        counter++;
        try {
            const sendStatusResult = await client.getSendStatus(messageId);
            if (sendStatusResult) {
                console.log(`Email status for {${messageId}} : [${sendStatusResult.status}]`);
                if (sendStatusResult.status.toLowerCase() !== "queued" || counter > 12) {
              clearInterval(statusInterval);
            }
          }
        } catch (e) {
          console.log("Error in checking send mail status: ",e);
        }
      }, 5000);
    } else {
      console.error("Something went wrong when trying to send this email: ", sendResult);
    }
  } catch (e) {
      console.log("################### Exception occurred while sending email #####################", e);
  }
}

main();