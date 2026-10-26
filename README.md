# ผจญภัยย้อนเวลาตะลุยประวัติศาสตร์ ป.3 ⏳🚀

เกมเว็บเพื่อการศึกษาสำหรับนักเรียนชั้นประถมศึกษาปีที่ 3 สาระที่ 4 ประวัติศาสตร์ กลุ่มสาระการเรียนรู้สังคมศึกษา ศาสนา และวัฒนธรรม ตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน

---

## 🌟 จุดเด่นและฟีเจอร์ของเกม

1. **การผจญภัยแผนที่กาลเวลา 5 ยุคสมัย (5 ด่านการเรียนรู้)**:
   - **ด่านที่ 1: ชีวิตผู้คนในอดีต 🛶** — การตั้งถิ่นฐานริมน้ำ บ้านเรือน การเดินทาง และเครื่องมือเครื่องใช้โบราณ
   - **ด่านที่ 2: หลักฐานทางประวัติศาสตร์ 📜** — การแยกแยะหลักฐานที่เป็นลายลักษณ์อักษรและไม่เป็นลายลักษณ์อักษร
   - **ด่านที่ 3: บุคคลสำคัญของไทย 👑** — วีรกรรมของพ่อขุนรามคำแหง, สมเด็จพระนเรศวร, สมเด็จพระเจ้าตากสิน และรัชกาลที่ 1
   - **ด่านที่ 4: อาณาจักรไทย 🏰** — ลำดับเวลา 4 ราชธานี: สุโขทัย อยุธยา ธนบุรี และรัตนโกสินทร์
   - **ด่านที่ 5: วิถีชีวิตและภูมิปัญญาไทย 🪷** — ประเพณีสงกรานต์ ลอยกระทง การละเล่นไทย และสมุนไพรพื้นบ้าน

2. **ระบบการเรียนรู้และข้อสอบปรนัย 4 ตัวเลือก**:
   - การ์ดสรุปความรู้ภาพประกอบสีสันสดใส เข้าใจง่ายสำหรับเด็ก ป.3
   - ข้อสอบ 4 ตัวเลือกพร้อมระบบตรวจสอบคำตอบทันที
   - เฉลยละเอียดและคำอธิบายทุกข้อ
   - ระบบคำใบ้จาก "หุ่นยนต์ไทม์มี่" ช่วยให้นักเรียนลองตอบใหม่ได้โดยไม่เสียกำลังใจ

3. **รางวัลและแรงจูงใจ (Gamification)**:
   - สะสมคะแนน (เต็ม 2,000 คะแนน), เหรียญทอง 🪙 และดาวเกียรติยศ ⭐
   - แถบความคืบหน้า (Progress Bar) ท่องกาลเวลา
   - ระบบเสียงสังเคราะห์ผ่าน Web Audio API (Chime, Fanfare, Coin sound, Time-warp whoosh)
   - เอฟเฟกต์พลุกระดาษเฉลิมฉลอง (Confetti) เมื่อผ่านด่านและจบเกม

4. **เกียรติบัตรออนไลน์ความละเอียดสูง (Certificate of Achievement)**:
   - เรนเดอร์บน HTML5 Canvas ลวดลายไทยประยุกต์ กรอบทอง-น้ำเงิน ตราประทับ และลายเซ็นรับรอง
   - ใส่ชื่อ-นามสกุล, ชั้นเรียน, โรงเรียน, คะแนนรวม และรหัสอ้างอิงอัตโนมัติ
   - ปุ่มดาวน์โหลดเป็นไฟล์ภาพ **PNG** คุณภาพสูงในคลิกเดียว
   - ปุ่มสั่งพิมพ์ (**Print / Save as PDF**) รองรับขนาดกระดาษ A4 แนวนอนแบบเต็มแผ่น

5. **เชื่อมต่อ Google Sheets & Google Apps Script**:
   - เชื่อมต่อ Google Spreadsheet ID: `1oUEAA3ReyR_HYILmFeH-LKjHUzNQ35me0KxdAWBaVNs`
   - ระบบสร้าง 5 ชีตอัตโนมัติ: `Questions`, `Answers`, `Students`, `Scores`, `Settings`
   - แยก Frontend และ Backend ชัดเจน ไม่มีการเปิดเผย API Credentials หรือ Google Secrets ในโค้ดหน้าเว็บ
   - ใช้งานได้ทั้งแบบ Online (บันทึกลงชีต) และ Offline (บันทึกในเครื่อง)

---

## 📁 โครงสร้างโปรเจกต์

```text
ผจญภัยย้อนเวลาตะลุยประวัติศาสตร์ ป.3/
├── index.html                  # หน้าเว็บหลัก Responsive ออกแบบสำหรับมือถือและคอมพิวเตอร์
├── css/
│   ├── style.css               # สไตล์หลัก ดีไซน์สดใส ปุ่มกดง่าย Typography ภาษาไทย
│   ├── map.css                 # สไตล์แผนที่ผจญภัย เส้นทางกาลเวลา และอนิเมชัน
│   └── certificate.css         # สไตล์เกียรติบัตรและการสั่งพิมพ์ A4 แนวนอน
├── js/
│   ├── config.js               # ตั้งค่าเกม, รหัส Google Sheets และคีย์จัดเก็บ
│   ├── sound.js                # ระบบเสียง Realtime ด้วย Web Audio API
│   ├── curriculumData.js       # ข้อมูลบทเรียนและคลังข้อสอบ ป.3 ครบทั้ง 5 ด่าน
│   ├── sheetsService.js        # ตัวเชื่อมต่อ Google Apps Script Web App
│   ├── certificate.js          # ระบบวาดเกียรติบัตร Canvas และ Export PNG
│   └── app.js                  # ตัวควบคุมเกม สถานะด่าน ข้อสอบ และโมดอล
├── backend/
│   ├── Code.gs                 # โค้ด Google Apps Script (doGet, doPost, autoInitSheets)
│   └── appsscript.json         # Manifest ของ Apps Script
├── .github/
│   └── workflows/
│       └── static.yml          # GitHub Actions สำหรับเผยแพร่ขึ้น GitHub Pages
├── GOOGLE_SHEETS_GUIDE.md      # คู่มือการติดตั้งและตั้งค่าสิทธิ์ Google Apps Script อย่างละเอียด
└── README.md                   # เอกสารแนะนำโปรเจกต์
```

---

## 🚀 วิธีเปิดเล่นในเครื่องคอมพิวเตอร์ (Local)

1. ดับเบิลคลิกเปิดไฟล์ `index.html` ใน Google Chrome, Microsoft Edge, Safari หรือเบราว์เซอร์ใดก็ได้
2. หรือใช้ Local Web Server (เช่น Python หรือ PowerShell):
   ```powershell
   # ใช้ Python รันเซิร์ฟเวอร์จำลอง
   python -m http.server 8080
   ```
   จากนั้นเข้าใช้งานที่ `http://localhost:8080`

---

## ☁️ การเชื่อมต่อ Google Sheets และตั้งค่าสิทธิ์

โปรเจกต์ได้จัดเตรียมโค้ด **Google Apps Script** ไว้ที่โฟลเดอร์ `backend/Code.gs` โดยรองรับ Spreadsheet ID:
`1oUEAA3ReyR_HYILmFeH-LKjHUzNQ35me0KxdAWBaVNs`

### ขั้นตอนโดยย่อ:
1. เปิด Google Spreadsheet ของคุณ
2. ไปที่เมนู **ส่วนขยาย (Extensions) > Apps Script**
3. คัดลอกโค้ดจาก `backend/Code.gs` ไปวางแทนที่โค้ดเดิม
4. กดบันทึก แล้วกดปุ่ม **การทำให้ใช้งานได้ (Deploy) > การทำให้ใช้งานได้รายการใหม่ (New deployment)**
5. เลือกประเภท **เว็บแอป (Web app)**:
   - **ดำเนินการในฐานะ (Execute as)**: `ฉัน (Me)`
   - **ผู้มีสิทธิ์เข้าถึง (Who has access)**: `ทุกคน (Anyone)`
6. คัดลอก **URL เว็บแอป** ที่ได้ ไปกรอกในเมนู **"ตั้งค่า" (ไอคอนฟันเฟือง)** บนหน้าเว็บเกม
7. *ดูคำอธิบายและภาพประกอบแบบละเอียดได้ในไฟล์ [GOOGLE_SHEETS_GUIDE.md](GOOGLE_SHEETS_GUIDE.md)*

---

## 🌐 การสร้าง GitHub Repository และเผยแพร่ผ่าน GitHub Pages

โปรเจกต์ถูกออกแบบให้เป็น **Static Single Page Application (SPA)** ที่พร้อมเผยแพร่ผ่าน **GitHub Pages** ได้ทันที 100%:

### ขั้นตอนการเผยแพร่:
1. สร้าง New Repository บน GitHub (เช่น `history-p3-quest`)
2. ดำเนินการ Push โค้ดขึ้นสู่ GitHub:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
   git branch -M main
   git push -u origin main
   ```
3. บน GitHub ไปที่แท็บ **Settings > Pages**
4. ในส่วน **Build and deployment > Source** ให้เลือก:
   - **GitHub Actions** (ระบบจะรัน Workflow `.github/workflows/static.yml` ให้อัตโนมัติ)
   - หรือเลือก **Deploy from a branch** แล้วเลือก Branch `main` โฟลเดอร์ `/ (root)`
5. เมื่อเสร็จสิ้น URL เกมของคุณจะพร้อมใช้งานทันทีที่:
   `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/`
