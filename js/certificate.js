/**
 * Certificate Generator สำหรับเกมผจญภัยย้อนเวลาประวัติศาสตร์ ป.3
 * สร้างเกียรติบัตรความละเอียดสูงด้วย HTML5 Canvas และรองรับการบันทึกไฟล์ภาพ PNG
 */

class CertificateGenerator {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
  }

  getCanvas() {
    if (!this.canvas) {
      this.canvas = document.getElementById(this.canvasId);
      if (this.canvas) {
        this.ctx = this.canvas.getContext('2d');
      }
    }
    return this.canvas;
  }

  /**
   * วาดเกียรติบัตรภาษาไทย ลวดลายสีทอง-น้ำเงิน สำหรับนักเรียน ป.3
   */
  render(certData) {
    const canvas = this.getCanvas();
    if (!canvas) return;
    const ctx = this.ctx;

    // ขนาด A4 แนวนอน ความละเอียดสูง (1600 x 1130)
    canvas.width = 1600;
    canvas.height = 1130;

    const w = canvas.width;
    const h = canvas.height;

    // 1. พื้นหลังกระดาษหรูหราสีครีมอ่อน
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#FFFFFF');
    bgGrad.addColorStop(0.5, '#FFFDF8');
    bgGrad.addColorStop(1, '#FFF9EB');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // ลวดลายรัศมีสว่างอ่อนๆ ด้านหลัง
    const radGrad = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, 700);
    radGrad.addColorStop(0, 'rgba(255, 236, 179, 0.4)');
    radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. ขอบเกียรติบัตรลายไทยสองชั้น (น้ำเงินคราม และทองคำ)
    // กรอบนอกน้ำเงิน
    ctx.strokeStyle = '#0D47A1';
    ctx.lineWidth = 14;
    ctx.strokeRect(35, 35, w - 70, h - 70);

    // กรอบในสีทอง
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, w - 96, h - 96);

    // กรอบประดับบางๆ ด้านในสุด
    ctx.strokeStyle = '#C5A059';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(56, 56, w - 112, h - 112);

    // วาดมุมประดับทองทั้ง 4 มุม
    this.drawCornerFlourish(ctx, 48, 48, 1, 1);
    this.drawCornerFlourish(ctx, w - 48, 48, -1, 1);
    this.drawCornerFlourish(ctx, 48, h - 48, 1, -1);
    this.drawCornerFlourish(ctx, w - 48, h - 48, -1, -1);

    // 3. ตราสัญลักษณ์ยอดเขาและมิติเวลาประวัติศาสตร์ (Emblem)
    this.drawEmblem(ctx, w / 2, 145);

    // 4. หัวข้อเกียรติบัตร
    ctx.textAlign = 'center';
    
    // โครงการ
    ctx.fillStyle = '#C5A059';
    ctx.font = 'bold 24px "Prompt", sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('โครงการส่งเสริมการเรียนรู้ประวัติศาสตร์ไทยสำหรับเยาวชน', w / 2, 235);

    // คำว่า เกียรติบัตร
    ctx.fillStyle = '#0D47A1';
    ctx.font = 'bold 58px "Kanit", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('เกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า', w / 2, 305);

    // 5. ชื่อนักเรียน (เด่นชัด สวยงาม)
    const studentName = certData.studentName || 'เด็กชายตะวัน รักประวัติศาสตร์';
    ctx.fillStyle = '#B71C1C';
    ctx.font = 'bold 54px "Kanit", sans-serif';
    ctx.fillText(studentName, w / 2, 400);

    // ขีดเส้นใต้ประดับสีทองใต้ชื่อ
    const nameWidth = ctx.measureText(studentName).width;
    const lineHalf = Math.max(nameWidth / 2 + 50, 200);
    const goldLine = ctx.createLinearGradient(w/2 - lineHalf, 415, w/2 + lineHalf, 415);
    goldLine.addColorStop(0, 'rgba(212, 175, 55, 0)');
    goldLine.addColorStop(0.5, '#D4AF37');
    goldLine.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.fillStyle = goldLine;
    ctx.fillRect(w/2 - lineHalf, 418, lineHalf * 2, 3);

    // 6. ชั้นเรียนและโรงเรียน
    const classInfo = certData.classRoom ? `ชั้นประถมศึกษาปีที่ ${certData.classRoom}` : 'ชั้นประถมศึกษาปีที่ 3';
    const schoolInfo = certData.schoolName || 'โรงเรียนประถมศึกษา';
    ctx.fillStyle = '#37474F';
    ctx.font = '500 28px "Prompt", sans-serif';
    ctx.fillText(`${classInfo}  |  ${schoolInfo}`, w / 2, 470);

    // 7. ข้อความแสดงความยินดีและรายละเอียดความสำเร็จ
    ctx.fillStyle = '#263238';
    ctx.font = '400 28px "Prompt", sans-serif';
    ctx.fillText('ได้ผ่านการผจญภัยย้อนเวลาตะลุยประวัติศาสตร์ ป.3 ครบทั้ง 5 ด่านการเรียนรู้', w / 2, 535);
    ctx.fillText('มีความรอบรู้ด้านประวัติศาสตร์ไทย วิถีชีวิต วีรชน และภูมิปัญญาไทยเป็นเลิศ', w / 2, 575);

    // 8. กล่องสรุปคะแนนและระดับเหรียญทอง
    this.drawScoreBadge(ctx, w / 2, 675, certData);

    // 9. วันที่มอบเกียรติบัตร
    const thaiDate = certData.dateStr || this.getThaiFormattedDate();
    ctx.fillStyle = '#455A64';
    ctx.font = '500 24px "Prompt", sans-serif';
    ctx.fillText(`ให้ไว้ ณ วันที่ ${thaiDate}`, w / 2, 790);

    // 10. ลายเซ็นและตราประทับ
    this.drawSignatureSection(ctx, w, h);

    // 11. รหัสเกียรติบัตรอ้างอิง
    const certCode = certData.certCode || ('HIST3-' + Date.now().toString(36).toUpperCase());
    ctx.textAlign = 'left';
    ctx.fillStyle = '#90A4AE';
    ctx.font = '18px monospace';
    ctx.fillText(`เลขที่เกียรติบัตร: ${certCode}`, 75, h - 68);

    ctx.textAlign = 'right';
    ctx.fillText('ระบบการเรียนรู้ผ่านเกมดิจิทัลกลุ่มสาระสังคมศึกษาฯ ป.3', w - 75, h - 68);
  }

  /**
   * วาดลวดลายประดับ 4 มุม
   */
  drawCornerFlourish(ctx, x, y, dirX, dirY) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dirX * 50, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, dirY * 50);
    ctx.stroke();

    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(dirX * 20, dirY * 20, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * วาดตราสัญลักษณ์ทรงเกียรติ
   */
  drawEmblem(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // แผ่นทองวงกลมซ้อน
    ctx.fillStyle = '#F5B041';
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0D47A1';
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fill();

    // รูปดาวหรือมงกุฎตรงกลาง
    ctx.fillStyle = '#FFD700';
    ctx.font = '36px "Segoe UI Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏛️', 0, -2);

    ctx.restore();
  }

  /**
   * กล่องเหรียญรางวัลและคะแนน
   */
  drawScoreBadge(ctx, x, y, data) {
    const totalScore = data.totalScore || 2000;
    const coins = data.coins || 200;
    const stars = data.stars || 15;
    const rankTitle = data.rankTitle || 'ยอดนักประวัติศาสตร์น้อยระดับทองคำ';

    ctx.save();
    ctx.translate(x, y);

    // กล่องพื้นหลังมน
    ctx.fillStyle = '#FFF8E1';
    ctx.strokeStyle = '#FFC107';
    ctx.lineWidth = 2.5;
    
    const bw = 640;
    const bh = 76;
    this.roundRect(ctx, -bw/2, -bh/2, bw, bh, 18, true, true);

    // ข้อความในกล่อง
    ctx.fillStyle = '#E65100';
    ctx.font = 'bold 24px "Kanit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🏆 ${rankTitle}  |  คะแนนสะสม: ${totalScore.toLocaleString()}  |  ⭐ ${stars} ดาว  |  🪙 ${coins} เหรียญ`, 0, 0);

    ctx.restore();
  }

  /**
   * ส่วนลายเซ็นรับรอง
   */
  drawSignatureSection(ctx, w, h) {
    const sigY = 930;

    // ด้านซ้าย: ครูผู้สอนประวัติศาสตร์
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0D47A1';
    ctx.font = 'italic bold 28px "Mali", cursive';
    ctx.fillText('ประวัติศาสตร์ พัฒนาปัญญา', w * 0.28, sigY - 20);

    ctx.strokeStyle = '#78909C';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.28 - 140, sigY);
    ctx.lineTo(w * 0.28 + 140, sigY);
    ctx.stroke();

    ctx.fillStyle = '#37474F';
    ctx.font = '500 20px "Prompt", sans-serif';
    ctx.fillText('(ครูผู้สอนกลุ่มสาระประวัติศาสตร์)', w * 0.28, sigY + 28);
    ctx.fillText('หัวหน้ากลุ่มสาระการเรียนรู้สังคมศึกษาฯ', w * 0.28, sigY + 54);

    // ตราประทับตรงกลาง
    ctx.save();
    ctx.translate(w / 2, sigY + 10);
    ctx.fillStyle = '#C2185B';
    ctx.font = 'bold 16px "Prompt", sans-serif';
    ctx.strokeStyle = '#C2185B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillText('ตราประทับ', 0, -10);
    ctx.fillText('รับรองผลการเรียน', 0, 12);
    ctx.fillText('ป.3', 0, 32);
    ctx.restore();

    // ด้านขวา: ผู้อำนวยการโรงเรียน
    ctx.fillStyle = '#0D47A1';
    ctx.font = 'italic bold 28px "Mali", cursive';
    ctx.fillText('วิชาการ เกียรติภูมิไทย', w * 0.72, sigY - 20);

    ctx.beginPath();
    ctx.moveTo(w * 0.72 - 140, sigY);
    ctx.lineTo(w * 0.72 + 140, sigY);
    ctx.stroke();

    ctx.fillStyle = '#37474F';
    ctx.font = '500 20px "Prompt", sans-serif';
    ctx.fillText('(ผู้อำนวยการสถานศึกษา)', w * 0.72, sigY + 28);
    ctx.fillText('ประธานคณะกรรมการสถานศึกษาขั้นพื้นฐาน', w * 0.72, sigY + 54);
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  getThaiFormattedDate() {
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const now = new Date();
    const day = now.getDate();
    const month = thaiMonths[now.getMonth()];
    const year = now.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  }

  /**
   * ดาวน์โหลดเกียรติบัตรเป็นภาพ PNG ความละเอียดสูง
   */
  downloadPNG(filename = 'เกียรติบัตร_ประวัติศาสตร์_ป3.png') {
    const canvas = this.getCanvas();
    if (!canvas) return;

    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (e) {
      console.error('Download certificate error:', e);
      return false;
    }
  }

  /**
   * สั่งพิมพ์เกียรติบัตรออกทางเครื่องพิมพ์หรือพิมพ์เป็น PDF
   */
  print() {
    window.print();
  }
}

// Global instance
const CertGen = new CertificateGenerator('certificateCanvas');
