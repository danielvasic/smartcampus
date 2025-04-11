const express = require('express');
const admin = require('firebase-admin');
const mysql = require('mysql2/promise');
const app = express();
const port = process.env.PORT || 8080;

// Parsiranje JSON-a u zahtjevima
app.use(express.json());

// Inicijalizacija Firebase
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG || '{}');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: firebaseConfig.databaseURL
});

// Konfiguracija za MySQL bazu
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'smartcampus'
};

// Endpoint za ručno pokretanje sinkronizacije
app.post('/sync', async (req, res) => {
  try {
    const result = await syncFirebaseToMySQL();
    res.status(200).json({ success: true, message: 'Sinkronizacija uspješna', data: result });
  } catch (error) {
    console.error('Greška prilikom sinkronizacije:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint za provjeru zdravlja aplikacije
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Početna stranica
app.get('/', (req, res) => {
  res.send('SmartCampus Sync Service');
});

// Funkcija za sinkronizaciju Firebase -> MySQL
async function syncFirebaseToMySQL() {
  let connection;
  try {
    // Spajanje na MySQL
    connection = await mysql.createConnection(dbConfig);
    
    // Dohvaćanje podataka iz Firebase
    const snapshot = await admin.database().ref('/').once('value');
    const data = snapshot.val();
    
    // Rezultati sinkronizacije
    const results = {
      tables: [],
      totalRecords: 0
    };
    
    // Primjer: sinkronizacija korisnika
    if (data.users) {
      await connection.execute('CREATE TABLE IF NOT EXISTS users (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255))');
      
      let userCount = 0;
      for (const userId in data.users) {
        const user = data.users[userId];
        await connection.execute(
          'INSERT INTO users (id, name, email) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=?, email=?',
          [userId, user.name || '', user.email || '', user.name || '', user.email || '']
        );
        userCount++;
      }
      
      results.tables.push({ name: 'users', records: userCount });
      results.totalRecords += userCount;
    }
    
    // Dodajte slične blokove za druge vrste podataka koje želite sinkronizirati
    
    return results;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Pokretanje planirane sinkronizacije (npr. svakih sat vremena)
setInterval(async () => {
  try {
    console.log('Pokretanje planirane sinkronizacije...');
    const result = await syncFirebaseToMySQL();
    console.log('Planirana sinkronizacija završena:', result);
  } catch (error) {
    console.error('Greška prilikom planirane sinkronizacije:', error);
  }
}, 60 * 60 * 1000); // 1 sat

// Pokretanje Express servera
app.listen(port, () => {
  console.log(`SmartCampus aplikacija sluša na portu ${port}`);
});