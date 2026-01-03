import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let bot = null;

export function initTelegram() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN nicht gesetzt - Telegram-Benachrichtigungen deaktiviert');
    return;
  }
  
  try {
    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
    console.log('✅ Telegram Bot initialisiert');
  } catch (error) {
    console.error('❌ Fehler beim Initialisieren des Telegram Bots:', error.message);
  }
}

export async function sendTelegramAlert(vehicles, searchParams) {
  if (!bot || !TELEGRAM_CHAT_ID) {
    console.warn('⚠️ Telegram nicht konfiguriert - Alert übersprungen');
    return false;
  }
  
  try {
    const count = vehicles.length;
    
    // Hauptnachricht
    let message = `🚗 *NEUE FAHRZEUGE GEFUNDEN!*\n\n`;
    message += `📊 *${count}* neue(s) Inserat(e)\n`;
    message += `🔍 Suche: ${searchParams.marke || ''} ${searchParams.modell || ''}\n`;
    message += `💰 Preis: ${searchParams.preisVon || '0'}€ - ${searchParams.preisBis || '∞'}€\n`;
    message += `📅 ${new Date().toLocaleString('de-DE')}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Top 5 Fahrzeuge anzeigen
    const topVehicles = vehicles.slice(0, 5);
    
    for (const vehicle of topVehicles) {
      message += `🔹 *${escapeMarkdown(vehicle.titel || 'Unbekannt')}*\n`;
      message += `   💶 ${escapeMarkdown(vehicle.preis || 'N/A')}\n`;
      message += `   📍 ${escapeMarkdown(vehicle.ort || 'N/A')}\n`;
      message += `   🛣️ ${escapeMarkdown(vehicle.km || 'N/A')}\n`;
      message += `   📅 EZ: ${escapeMarkdown(vehicle.jahr || 'N/A')}\n`;
      message += `   🏷️ ${escapeMarkdown(vehicle.plattform || 'N/A')}\n`;
      
      if (vehicle.link) {
        message += `   🔗 [Zum Inserat](${vehicle.link})\n`;
      }
      
      message += `\n`;
    }
    
    if (count > 5) {
      message += `\n... und ${count - 5} weitere\n`;
    }
    
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
    
    console.log(`📱 Telegram-Alert gesendet: ${count} Fahrzeuge`);
    return true;
    
  } catch (error) {
    console.error('❌ Fehler beim Senden des Telegram-Alerts:', error.message);
    return false;
  }
}

// Einzelnes Fahrzeug senden (für besonders interessante Deals)
export async function sendVehicleDetail(vehicle) {
  if (!bot || !TELEGRAM_CHAT_ID) return false;
  
  try {
    let message = `🚘 *INTERESSANTES FAHRZEUG*\n\n`;
    message += `*${escapeMarkdown(vehicle.titel)}*\n\n`;
    message += `💶 Preis: *${escapeMarkdown(vehicle.preis)}*\n`;
    message += `🛣️ Kilometer: ${escapeMarkdown(vehicle.km)}\n`;
    message += `📅 Erstzulassung: ${escapeMarkdown(vehicle.jahr)}\n`;
    message += `⚙️ Leistung: ${escapeMarkdown(vehicle.leistung || 'N/A')}\n`;
    message += `⛽ Kraftstoff: ${escapeMarkdown(vehicle.kraftstoff)}\n`;
    message += `🔧 Getriebe: ${escapeMarkdown(vehicle.getriebe)}\n`;
    message += `📍 Standort: ${escapeMarkdown(vehicle.ort)}\n`;
    message += `👤 Anbieter: ${escapeMarkdown(vehicle.anbieter)}\n`;
    message += `🔰 TÜV: ${escapeMarkdown(vehicle.tuev || 'N/A')}\n`;
    message += `🏷️ Plattform: ${escapeMarkdown(vehicle.plattform)}\n`;
    
    if (vehicle.highlights) {
      message += `\n✨ ${escapeMarkdown(vehicle.highlights)}\n`;
    }
    
    if (vehicle.link) {
      message += `\n🔗 [Inserat öffnen](${vehicle.link})`;
    }
    
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: false
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Fehler beim Senden des Fahrzeug-Details:', error.message);
    return false;
  }
}

// Test-Nachricht senden
export async function sendTestMessage() {
  if (!bot || !TELEGRAM_CHAT_ID) {
    throw new Error('Telegram nicht konfiguriert');
  }
  
  await bot.sendMessage(TELEGRAM_CHAT_ID, '✅ Fahrzeug-Scanner Telegram-Bot funktioniert!');
  return true;
}

// Markdown-Zeichen escapen
function escapeMarkdown(text) {
  if (!text) return '';
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}
