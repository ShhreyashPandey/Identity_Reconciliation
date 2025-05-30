import express from 'express';
import {findContacts, insertContact, getLinkedContacts, updateContactToSecondary} from './database.js';

const app = express();
app.use(express.json());

app.post('/identify', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Email or phoneNumber required' });
    }

    // 1. Find matching contacts
    const existingContacts = await findContacts(email, phoneNumber);

    // 2. No matches → create primary
    if (existingContacts.length === 0) {
      const newId = await insertContact({ email, phoneNumber });
      return res.status(200).json({
        contact: {
          primaryContatctId: newId,
          emails: [email],
          phoneNumbers: [phoneNumber],
          secondaryContactIds: []
        }
      });
    }

    // 3. Find the earliest primary
    let primary = existingContacts.find(c => c.linkPrecedence === 'primary') || existingContacts[0];
    existingContacts.forEach(c => {
      if (new Date(c.createdAt) < new Date(primary.createdAt)) {
        primary = c;
      }
    });

    // 4. Normalize contacts to one primary (if two primaries are linked)
    for (const contact of existingContacts) {
      if (contact.id !== primary.id && contact.linkPrecedence === 'primary') {
        await updateContactToSecondary(contact.id, primary.id);
      }
    }

    // 5. Create secondary if data is new
    const hasNewEmail = email && !existingContacts.find(c => c.email === email);
    const hasNewPhone = phoneNumber && !existingContacts.find(c => c.phoneNumber === phoneNumber);
    if (hasNewEmail || hasNewPhone) {
      await insertContact({ email, phoneNumber, linkedId: primary.id, linkPrecedence: 'secondary' });
    }

    // 6. Fetch all linked contacts
    const allLinked = await getLinkedContacts(primary.id);

    const emails = new Set();
    const phones = new Set();
    const secondaryIds = [];

    for (const c of allLinked) {
      if (c.email) emails.add(c.email);
      if (c.phoneNumber) phones.add(c.phoneNumber);
      if (c.id !== primary.id) secondaryIds.push(c.id);
    }

    res.status(200).json({
      contact: {
        primaryContatctId: primary.id,
        emails: [primary.email, ...[...emails].filter(e => e !== primary.email)],
        phoneNumbers: [primary.phoneNumber, ...[...phones].filter(p => p !== primary.phoneNumber)],
        secondaryContactIds: secondaryIds
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(8000, () => {
  console.log('Server is running at: http://localhost:8000');
});

