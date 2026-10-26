/**
 * Configuration Manager สำหรับเกมผจญภัยย้อนเวลาประวัติศาสตร์ ป.3
 */

const CONFIG = {
  // Google Sheets ID ที่ได้รับมอบหมาย
  SPREADSHEET_ID: '1oUEAA3ReyR_HYILmFeH-LKjHUzNQ35me0KxdAWBaVNs',
  
  // URL สำหรับ Google Apps Script Web App (เชื่อมต่อเรียบร้อยแล้ว)
  DEFAULT_GAS_URL: 'https://script.google.com/macros/s/AKfycbyfxx_wuf1dr3SKX8BTtC9tZ2BR3l-Z4hn6IlzPpZC4lcLj7-8yi4hVSBdduXS8ZxdSQA/exec',
  
  // Game Play Constants
  POINTS_PER_CORRECT: 100,
  COINS_PER_CORRECT: 10,
  MAX_SCORE: 2000,
  
  // LocalStorage Keys
  KEYS: {
    GAS_URL: 'history_quest_gas_url',
    STUDENT_NAME: 'history_quest_student_name',
    STUDENT_ID: 'history_quest_student_id',
    CLASS_ROOM: 'history_quest_class_room',
    AVATAR_ID: 'history_quest_avatar_id',
    PROGRESS: 'history_quest_progress_data',
    SCORES: 'history_quest_scores_data',
    CUSTOM_QUESTIONS: 'history_quest_custom_questions'
  },

  // ดึงค่า Web App URL ปัจจุบัน
  getGasUrl() {
    return localStorage.getItem(this.KEYS.GAS_URL) || this.DEFAULT_GAS_URL || '';
  },

  // บันทึกค่า Web App URL
  setGasUrl(url) {
    if (url) {
      localStorage.setItem(this.KEYS.GAS_URL, url.trim());
    } else {
      localStorage.removeItem(this.KEYS.GAS_URL);
    }
  },

  // ข้อมูลตัวละคร
  AVATARS: [
    { id: 'tawan', name: 'เด็กชายตะวัน', role: 'นักสำรวจผู้กล้าหาญ', emoji: '👦' },
    { id: 'fah', name: 'เด็กหญิงฟ้าใส', role: 'นักสืบประวัติศาสตร์ผู้รอบรู้', emoji: '👧' },
    { id: 'timy', name: 'หุ่นยนต์ไทม์มี่ (Timy)', role: 'มัคคุเทศก์ข้ามมิติเวลา', emoji: '🤖' }
  ]
};
