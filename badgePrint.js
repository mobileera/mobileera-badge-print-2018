var fs = require('fs')
var _ = require('lodash')

function printParticipant (doc, participant, side) {
  doc.addPage()

  var height = doc.page.height
  var width = doc.page.width - 20
  var margin = 10

  var sessionInfo = participant.sessionInfo
  var categoryName = participant.categoryName
  var ticketName = participant.ticketName

  if ((categoryName === 'Speaker' && sessionInfo && side === 'back') || (categoryName === 'Trainee' && side === 'back')) {
    if (categoryName === 'Speaker') {
      doc.image('images/badge-print2.png', 0, 0, {
        height,
        width: doc.page.width
      })

      var talkTitle = sessionInfo.title;
      var talkTime = sessionInfo.date + ", " + sessionInfo.startTime;
      var track = sessionInfo.track;

      if (talkTitle) {
        doc.font('fonts/roboto-v15-latin_latin-ext-500.ttf')
          .fontSize(24)
          .fillColor('#000000')
        if (doc.widthOfString(talkTitle) > width) {
          doc.fontSize(18)
        }
        doc.text(talkTitle, margin, 190, {
          align: 'center',
          height,
        width})
      }

      if (talkTime) {
        doc.font('fonts/roboto-v15-latin_latin-ext-regular.ttf')
          .fontSize(22)
          .fillColor('#CBB714')
          .text(talkTime, {
            align: 'center',
            height,
          width})
      }

      if (track) {
        doc.font('fonts/roboto-v15-latin_latin-ext-regular.ttf')
          .fontSize(18)
          .fillColor('#00aac6')
          .text(track, {
            align: 'center',
            height,
          width})
      }
    } else {
      doc.image('images/badge-print.png', 0, 0, {
        height,
        width: doc.page.width
      })

      workshopName = ticketName.substring(10)

      doc.font('fonts/roboto-v15-latin_latin-ext-500.ttf')
        .fontSize(24)
        .fillColor('#000000')
      if (doc.widthOfString(workshopName) > width) {
        doc.fontSize(16)
      }
      doc.text(workshopName, margin, 190, {
        align: 'center',
        height,
      width})

      doc.font('fonts/roboto-v15-latin_latin-ext-regular.ttf')
        .fontSize(18)
        .fillColor('#00aac6')
        .text('October 5th, 09:00-17:00', {
          align: 'center',
          height,
        width})

      doc.font('fonts/roboto-v15-latin_latin-ext-300.ttf')
        .fontSize(18)
        .fillColor('#CBB714')
        .text('\nLunch: 12:00-13:00', {
          align: 'center',
          height,
        width})
    }

    doc.font('fonts/roboto-v15-latin_latin-ext-regular.ttf')
      .fontSize(18)
      .fillColor('#FFFFFF')
    doc.text(participant.categoryName, margin, 400, {
      align: 'center',
      height,
    width})
  } else {
    doc.image(participant.image, 0, 0, {
      height,
      width: doc.page.width
    })

    var qrWidth = 70
    doc.image(
      qr.imageSync(participant.contactCard, {
        type: 'png'
      }),
      (doc.page.width - 210 - qrWidth) / 2, height - 100 - qrWidth, {
        width: qrWidth
      })

    doc.font('fonts/roboto-v15-latin_latin-ext-500.ttf')
      .fontSize(36)
      .fillColor('#000000')
    if (doc.widthOfString(participant.fullName) > width) {
      doc.fontSize(30)
      if (doc.widthOfString(participant.fullName) > width) {
        doc.fontSize(26)
      }
    }

    doc
      .text(participant.fullName, margin, 190, {
        align: 'center',
        height,
      width})
    if (participant.company) {
      doc.font('fonts/roboto-v15-latin_latin-ext-regular.ttf')
        .fontSize(14)
        .fillColor('#00aac6')
      if (doc.widthOfString(participant.company) > width) {
        doc.fontSize(12)
        if (doc.widthOfString(participant.company) > width) {
          doc.fontSize(10)
        }
      }
      doc.text(participant.company, {
        align: 'center',
        height,
      width})
    }

    if (participant.twitter) {
      doc.font('fonts/roboto-v15-latin_latin-ext-300.ttf')
        .fontSize(24)
        .fillColor('#CBB714')
      doc.text(participant.twitter, 100, 285, {
        align: 'left',
        height,
      width})
    }

    doc.font('fonts/roboto-v15-latin_latin-ext-regular.ttf')
      .fontSize(18)
      .fillColor('#FFFFFF')
    doc.text(participant.crewType || participant.categoryName, margin, 400, {
      align: 'center',
      height,
    width})
  }
}

var PDFDocument = require('pdfkit')
var qr = require('qr-image')

function badgePrint (participants, filename) {
  console.log('Started creating ' + filename + '...')

  // Create a document
  doc = new PDFDocument({
    size: [315, 436],
    autoFirstPage: false
  })

  doc.pipe(fs.createWriteStream(filename))

  for (var participant of participants) {

    if (participant['fullName'] != ' ') {
      printParticipant(doc, participant, 'front')
      // Back page
      printParticipant(doc, participant, 'back')
    } else {
      console.log('Empty name, skipping...')
    }
  }

  // Finalize PDF file
  doc.end()

  console.log('Finished creating ' + filename)
}

function blankBadgePrint (count, filename, category) {
  var IMAGES = {
    'Attendee': 'images/badge-print.png',
    'Trainee': 'images/badge-print.png',
    'Speaker': 'images/badge-print2.png',
    'Organizer': 'images/badge-print3.png',
    'Volunteer': 'images/badge-print4.png'
  }

  console.log('Started creating ' + filename + '...')

  doc = new PDFDocument({
    size: [315, 436],
    autoFirstPage: false
  })
  doc.pipe(fs.createWriteStream(filename))

  var image = IMAGES[category || 'Attendee']

  for (var i = 0; i < count; i++) {
    doc.addPage()
    var height = doc.page.height
    doc.image(image, 0, 0, {
      height,
      width: doc.page.width
    })
    doc.addPage()
    doc.image(image, 0, 0, {
      height,
      width: doc.page.width
    })
  }

  doc.end()

  console.log('Finished creating ' + filename)
}

module.exports = {
  badgePrint,
blankBadgePrint}
