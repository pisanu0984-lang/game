/**
 * Sheets Service สำหรับเชื่อมต่อ Google Apps Script Web App
 * ปลอดภัย: ไม่มีการเปิดเผย Credentials หรือ API Secrets
 * รองรับทั้งโหมด Offline (บันทึกในเครื่อง) และ Online (ส่งไปยัง Google Sheets)
 */

class SheetsService {
  constructor() {
    this.isOnline = navigator.onLine;
    window.addEventListener('online', () => { this.isOnline = true; });
    window.addEventListener('offline', () => { this.isOnline = false; });
  }

  getEndpoint() {
    return CONFIG.getGasUrl();
  }

  hasEndpoint() {
    const url = this.getEndpoint();
    return !!(url && url.startsWith('https://script.google.com/'));
  }

  /**
   * ทดสอบการเชื่อมต่อกับ Google Apps Script Web App
   */
  async testConnection(customUrl = null) {
    const url = customUrl || this.getEndpoint();
    if (!url) {
      return { success: false, message: 'ยังไม่ได้ระบุ Google Apps Script Web App URL' };
    }

    try {
      const pingUrl = `${url}?action=ping&t=${Date.now()}`;
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success || true,
        message: data.message || 'เชื่อมต่อ Google Sheets สำเร็จ!',
        data: data
      };
    } catch (err) {
      console.warn('Google Sheets connection test error:', err);
      return {
        success: false,
        message: `ไม่สามารถเชื่อมต่อได้: ${err.message} (โปรดตรวจสอบการ Deploy Web App เป็น Anyone)`
      };
    }
  }

  /**
   * สั่งให้ Google Apps Script สร้างชีตทั้ง 5 อัตโนมัติ
   */
  async triggerInitSheets() {
    const url = this.getEndpoint();
    if (!url) return { success: false, message: 'ยังไม่มี Web App URL' };

    try {
      const initUrl = `${url}?action=initSheets&t=${Date.now()}`;
      const response = await fetch(initUrl);
      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  /**
   * ดึงข้อสอบสดจาก Google Sheets (ถ้าตั้งค่าไว้)
   */
  async fetchRemoteQuestions() {
    if (!this.hasEndpoint()) {
      return null;
    }

    try {
      const qUrl = `${this.getEndpoint()}?action=getQuestions&t=${Date.now()}`;
      const res = await fetch(qUrl);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions;
      }
      return null;
    } catch (err) {
      console.warn('Failed to load questions from Google Sheets, using local curriculum:', err);
      return null;
    }
  }

  /**
   * บันทึกคำตอบรายข้อไปยังชีต Answers
   */
  async logAnswer(answerData) {
    // บันทึกสำรองใน LocalStorage เสมอ
    this.backupAnswerLocally(answerData);

    if (!this.hasEndpoint()) {
      return { success: true, offline: true };
    }

    try {
      const payload = {
        action: 'saveAnswer',
        ...answerData
      };

      // ใช้ POST ส่งข้อมูลแบบ text/plain เพื่อเลี่ยง CORS preflight กับ GAS
      fetch(this.getEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      }).catch(e => console.warn('Answer log background error:', e));

      return { success: true };
    } catch (err) {
      console.warn('Failed to send answer to Sheets:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * บันทึกคะแนนจบเกมและส่งออกเกียรติบัตรไปยังชีต Scores และ Students
   */
  async saveFinalScore(scoreData) {
    // บันทึกสำรองใน LocalStorage
    this.backupScoreLocally(scoreData);

    if (!this.hasEndpoint()) {
      return {
        success: true,
        offline: true,
        message: 'บันทึกคะแนนในเครื่องสำเร็จ (โหมดออฟไลน์ ยังไม่ได้เชื่อมต่อ Google Sheets)'
      };
    }

    try {
      const payload = {
        action: 'saveScore',
        ...scoreData
      };

      // ส่งไปยัง Google Apps Script Web App
      await fetch(this.getEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        mode: 'no-cors' // Google Apps Script Web App works reliably with no-cors or redirect follow
      });

      return {
        success: true,
        offline: false,
        message: 'ส่งคะแนนและบันทึกลงใน Google Sheets เรียบร้อยแล้ว!'
      };
    } catch (err) {
      console.error('Error saving score to Google Sheets:', err);
      return {
        success: false,
        offline: true,
        message: `ส่งคะแนนไป Google Sheets ไม่สำเร็จ (${err.message}) แต่บันทึกผลในเครื่องเรียบร้อยแล้ว`
      };
    }
  }

  backupScoreLocally(data) {
    try {
      const history = JSON.parse(localStorage.getItem('history_quest_saved_scores') || '[]');
      history.push({ ...data, savedAt: new Date().toISOString() });
      localStorage.setItem('history_quest_saved_scores', JSON.stringify(history));
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  backupAnswerLocally(data) {
    try {
      const list = JSON.parse(localStorage.getItem('history_quest_saved_answers') || '[]');
      list.push({ ...data, savedAt: new Date().toISOString() });
      localStorage.setItem('history_quest_saved_answers', JSON.stringify(list));
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }
}

// Global instance
const Sheets = new SheetsService();
