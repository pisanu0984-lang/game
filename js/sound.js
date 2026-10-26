/**
 * Sound Manager สำหรับเกมผจญภัยย้อนเวลาประวัติศาสตร์ ป.3
 * พัฒนาด้วย Web Audio API สังเคราะห์เสียงแบบ Realtime
 * ทำงานได้ทันที 100% ไม่ต้องโหลดไฟล์ MP3 ภายนอก และรองรับโหมดเปิด-ปิดเสียง
 */

class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.muted = localStorage.getItem('history_quest_sound_muted') === 'true';
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound() {
    this.muted = !this.muted;
    localStorage.setItem('history_quest_sound_muted', this.muted);
    if (!this.muted) {
      this.playClick();
    }
    return !this.muted;
  }

  isMuted() {
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1, startDelay = 0) {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + startDelay);

      gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime + startDelay);
      gainNode.gain.linearRampToValueAtTime(gainVal, this.audioCtx.currentTime + startDelay + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + startDelay + duration);

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + startDelay);
      osc.stop(this.audioCtx.currentTime + startDelay + duration);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // เสียงคลิกปุ่มทั่วไป
  playClick() {
    this.playTone(600, 'triangle', 0.06, 0.08);
  }

  // เสียงหยอดเหรียญ / ได้รับเหรียญ
  playCoin() {
    if (this.muted) return;
    this.playTone(987.77, 'sine', 0.08, 0.12, 0);       // B5
    this.playTone(1318.51, 'sine', 0.25, 0.15, 0.08);   // E6
  }

  // เสียงตอบถูก (Melodic Chime แจ่มใส มีความสุข)
  playCorrect() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'sine', 0.22, 0.15, idx * 0.08);
    });
  }

  // เสียงตอบผิด (Boing อ่อนโยน ให้กำลังใจ ไม่น่ากลัว)
  playWrong() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      const now = this.audioCtx.currentTime;

      // กลิ้งความถี่ลงแบบการ์ตูน
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.3);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn(e);
    }
  }

  // เสียงคำใบ้ / ผู้ช่วยหุ่นยนต์
  playHint() {
    if (this.muted) return;
    this.playTone(880, 'sine', 0.1, 0.1, 0);
    this.playTone(1108.73, 'sine', 0.15, 0.1, 0.1);
  }

  // เสียงเดินทางข้ามมิติเวลา (Time Warp Whoosh)
  playWarp() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      const now = this.audioCtx.currentTime;

      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch (e) {
      console.warn(e);
    }
  }

  // เสียงเฉลิมฉลองผ่านด่าน / จบเกม (Grand Fanfare)
  playFanfare() {
    if (this.muted) return;
    const fanfareNotes = [
      { f: 523.25, d: 0.15, t: 0 },    // C5
      { f: 523.25, d: 0.15, t: 0.15 }, // C5
      { f: 523.25, d: 0.15, t: 0.30 }, // C5
      { f: 659.25, d: 0.35, t: 0.45 }, // E5
      { f: 783.99, d: 0.2, t: 0.80 },  // G5
      { f: 1046.50, d: 0.6, t: 1.00 }  // C6 (Grand finish)
    ];

    fanfareNotes.forEach(item => {
      this.playTone(item.f, 'triangle', item.d, 0.18, item.t);
    });
  }
}

// Global instance
const Sound = new SoundManager();
