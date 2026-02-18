/**
 * FILENAME: Code.gs
 * 1. Copy this code to script.google.com
 * 2. Deploy as Web App -> Execute as: Me -> Who has access: Anyone
 * 3. Copy the URL and paste it into services/api.ts
 */

var SHEET_NAME = "db_users";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = doc.insertSheet(SHEET_NAME);
      sheet.appendRow(["user_id", "username", "score_wartakjil", "score_slidejannah", "score_dilema", "total_score", "last_updated"]);
      sheet.setFrozenRows(1);
    }

    var params = {};
    try {
      // Handle postData usually coming as a string inside contents
      params = JSON.parse(e.postData.contents);
    } catch (err) {
      return responseJSON({ error: "Invalid JSON body", details: err.toString() });
    }

    var action = params.action;
    var result = {};

    if (action === "login") {
      result = handleLogin(sheet, params);
    } else if (action === "update_score") {
      result = handleUpdateScore(sheet, params);
    } else if (action === "get_leaderboard") {
      result = handleGetLeaderboard(sheet);
    } else {
      result = { error: "Unknown action" };
    }

    return responseJSON(result);

  } catch (err) {
    return responseJSON({ error: "Server Error", details: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = doc.getSheetByName(SHEET_NAME);
  return responseJSON(handleGetLeaderboard(sheet));
}

function handleLogin(sheet, params) {
  var username = params.username;
  var phone = params.phone;

  if (!username || !phone) return { error: "Missing data" };

  // ID Format: nama_4digit (contoh: budi_1234)
  var userId = username.replace(/\s+/g, '').toLowerCase() + "_" + phone;
  var data = sheet.getDataRange().getValues();

  // 1. CEK APAKAH USER SUDAH ADA (LOGIN)
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == userId) {
      return {
        status: "LOGIN_SUCCESS",
        id: data[i][0],
        username: data[i][1],
        scores: {
          warTakjil: Number(data[i][2]) || 0,
          slideJannah: Number(data[i][3]) || 0,
          dilema: Number(data[i][4]) || 0
        }
      };
    }
  }

  // 2. JIKA TIDAK ADA, BUAT BARU (REGISTER)
  var nextRow = sheet.getLastRow() + 1;
  var totalFormula = "=SUM(C" + nextRow + ":E" + nextRow + ")";
  
  var newRow = [
    userId, 
    username, 
    0, // wartakjil
    0, // slidejannah
    0, // dilema
    totalFormula, 
    new Date()
  ];
  
  sheet.appendRow(newRow);

  return {
    status: "REGISTER_SUCCESS",
    id: userId,
    username: username,
    scores: { warTakjil: 0, slideJannah: 0, dilema: 0 }
  };
}

function handleUpdateScore(sheet, params) {
  var userId = params.userId;
  var game = params.game; 
  var newScore = Number(params.score);

  if (!userId) return { error: "No User ID" };

  // Mapping Kolom (0-based index dari Array Values)
  // A(0):id, B(1):name, C(2):wartakjil, D(3):slide, E(4):dilema, F(5):total, G(6):date
  var colIndex = -1;
  if (game === 'warTakjil') colIndex = 2;
  else if (game === 'slideJannah') colIndex = 3;
  else if (game === 'dilema') colIndex = 4;

  if (colIndex === -1) return { error: "Invalid Game" };

  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == userId) {
      var currentScore = Number(data[i][colIndex]) || 0;
      
      // Update hanya jika High Score
      if (newScore > currentScore) {
        // Ingat: getRange itu 1-based index (Row, Col)
        // Row = i + 1 (karena header)
        // Col = colIndex + 1
        sheet.getRange(i + 1, colIndex + 1).setValue(newScore);
        sheet.getRange(i + 1, 7).setValue(new Date()); // Update Last Updated
        return { success: true, newHighScore: newScore };
      } else {
        return { success: true, message: "Score not higher", currentHigh: currentScore };
      }
    }
  }
  return { error: "User not found in DB" };
}

function handleGetLeaderboard(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  var entries = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      entries.push({
        username: data[i][1],
        totalScore: Number(data[i][5]) || 0, // Column F is Total
        game: 'Total'
      });
    }
  }

  // Sort Descending
  entries.sort(function(a, b) { return b.totalScore - a.totalScore; });
  return entries.slice(0, 10);
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
