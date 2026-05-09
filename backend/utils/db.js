const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

let db = null;
let initPromise = null;
let operationQueue = [];
let isProcessing = false;

const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'platepal.db');

// Queue operations to execute sequentially
function queueOperation(operation) {
  return new Promise((resolve, reject) => {
    operationQueue.push({ operation, resolve, reject });
    processQueue();
  });
}

function processQueue() {
  if (isProcessing || !db || operationQueue.length === 0) return;
  
  isProcessing = true;
  const { operation, resolve, reject } = operationQueue.shift();
  
  try {
    const result = operation((err, res) => {
      isProcessing = false;
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
      processQueue();
    });
  } catch (err) {
    isProcessing = false;
    reject(err);
    processQueue();
  }
}

// Initialize database
function initialize() {
  if (initPromise) return initPromise;
  
  initPromise = new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
        reject(err);
      } else {
        db.configure('busyTimeout', 5000);
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('✅ Connected to SQLite database at:', dbPath);
            resolve();
          }
        });
      }
    });
  });
  
  return initPromise;
}

// Execute SQL with promise
function executeSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes, lastInsertRowid: this.lastID });
    });
  });
}

// Get single row
function getRow(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Get all rows
function getAllRows(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// Wrapper for sqlite3
const dbWrapper = {
  initialize,
  executeSql,
  getRow,
  getAllRows,
  initPromise: initialize(),
  
  exec: async (sql) => {
    if (!db) throw new Error('Database not initialized');
    const statements = sql.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        await queueOperation((callback) => {
          db.run(stmt, callback);
        }).catch(err => console.error('SQL error:', err));
      }
    }
  },
  
  prepare: (sql) => {
    return {
      run: (...params) => {
        if (!db) throw new Error('Database not initialized');
        db.run(sql, params, function(err) {
          if (err) console.error('Run error:', err);
        });
        return { changes: 1, lastInsertRowid: 1 };
      },
      get: (...params) => {
        if (!db) throw new Error('Database not initialized');
        let result = null;
        db.get(sql, params, (err, row) => {
          if (err) console.error('Get error:', err);
          result = row || null;
        });
        return result;
      },
      all: (...params) => {
        if (!db) throw new Error('Database not initialized');
        let results = [];
        db.all(sql, params, (err, rows) => {
          if (err) console.error('All error:', err);
          results = rows || [];
        });
        return results;
      }
    };
  },
  
  get: (sql, ...params) => {
    if (!db) throw new Error('Database not initialized');
    let result = null;
    db.get(sql, params, (err, row) => {
      if (err) console.error('Get error:', err);
      result = row || null;
    });
    return result;
  }
};

module.exports = dbWrapper;
