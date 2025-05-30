import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}).promise();

// Get all contacts matching email or phone
export async function findContacts(email, phoneNumber) {
  const [rows] = await pool.query(
    `select * from contact where email = ? or phoneNumber = ?`,
    [email, phoneNumber]
  );
  return rows;
}

// Insert a new contact
export async function insertContact({ phoneNumber, email, linkedId = null, linkPrecedence = "primary" }) {
  const [result] = await pool.query(
    `insert into contact (phoneNumber, email, linkedId, linkPrecedence) VALUES (?, ?, ?, ?)`,
    [phoneNumber, email, linkedId, linkPrecedence]
  );
  return result.insertId;
}

// Get all contacts linked to a primary
export async function getLinkedContacts(primaryId) {
  const [rows] = await pool.query(
    `select * from contact where id = ? or linkedId = ?`,
    [primaryId, primaryId]
  );
  return rows;
}

// Update a contact’s linkPrecedence and linkedId
export async function updateContactToSecondary(id, newLinkedId) {
  await pool.query(
    `update contact set linkPrecedence = 'secondary', linkedId = ? WHERE id = ?`,
    [newLinkedId, id]
  );
}
