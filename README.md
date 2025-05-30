# Identity Reconciliation
The goal is to identify and unify customer identities using multiple email and phone entries that may belong to the same person, based on common fields.
---

## Problem Statement
A customer may place multiple orders on FluxKart using different contact details. This system helps unify such data by detecting links via email or phone and resolving to a primary contact, with others marked as secondary.
The backend exposes a `/identify` endpoint that receives a JSON body with `email` and/or `phoneNumber`, and returns a normalized contact response.
---

## Tech Stack
- **Node.js** + **Express**
- **MySQL** (via `mysql2`)
- **dotenv** for environment configuration
---

## My Local Workflow
Here’s a log of terminal commands I used to set up and run the project:
```bash
npm init -y
npm i mysql2
npm i dotenv
npm i express
node app.js
```

### .env Setup
Make sure to create a .env file with your MySQL credentials:
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=reconciliation(or whatever you name)

### How to Run
```bash
git clone https://github.com/your-username/identity-reconciliation.git
cd identity-reconciliation
npm install
node app.js
```

URL: POST http://localhost:8000/identify

