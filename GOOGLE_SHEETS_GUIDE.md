# คู่มือการติดตั้งและเชื่อมต่อ Google Sheets & Google Apps Script
## เกม "ผจญภัยย้อนเวลาตะลุยประวัติศาสตร์ ป.3"

เอกสารนี้อธิบายขั้นตอนการเชื่อมต่อเกมกับ **Google Sheets ID:** `1oUEAA3ReyR_HYILmFeH-LKjHUzNQ35me0KxdAWBaVNs`
เพื่อใช้งานระบบคลังข้อสอบ บันทึกคะแนนนักเรียน และออกผลการเรียนอย่างปลอดภัย

---

## 🛡️ นโยบายความปลอดภัยของระบบ
- **ห้ามฝัง Google API Key, OAuth Client Secret หรือ Service Account Credentials ลงในโค้ด Frontend**:
  เกมนี้ใช้สถาปัตยกรรมแยกส่วน (Decoupled Architecture) โดย Frontend สื่อสารกับ **Google Apps Script Web App** ผ่าน REST API endpoints ที่ปลอดภัย
- ข้อมูลการตอบคำถามและคะแนนจะถูกส่งไปยัง Apps Script เพื่อตรวจสอบและบันทึกลงใน Spreadsheet เท่านั้น

---

## 📋 โครงสร้าง 5 ชีต (สร้างอัตโนมัติโดยระบบ)

เมื่อเชื่อมต่อครั้งแรก หรือรันฟังก์ชัน `initDatabase()` ระบบจะสร้าง 5 ชีตพร้อมจัดรูปแบบหัวตารางและข้อมูลตัวอย่างทันที:

| ชื่อชีต | หน้าที่การทำงาน | ตัวอย่างคอลัมน์ |
| :--- | :--- | :--- |
| **`Questions`** | คลังข้อสอบ 5 ด่าน พร้อม 4 ตัวเลือก คำใบ้ และเฉลย | `id`, `stage_id`, `stage_name`, `question`, `choice_a`, `choice_b`, `choice_c`, `choice_d`, `correct_index`, `hint`, `explanation` |
| **`Answers`** | บันทึกประวัติการตอบคำถามรายข้อของนักเรียน | `timestamp`, `student_name`, `student_id`, `class_room`, `stage_id`, `question_id`, `selected_choice`, `is_correct`, `attempt_count` |
| **`Students`** | ทะเบียนและสรุปความคืบหน้าของนักเรียนแต่ละคน | `student_id`, `student_name`, `class_room`, `total_score`, `stages_completed`, `total_coins`, `total_stars`, `last_active` |
| **`Scores`** | สรุปผลคะแนนรวมทุกด่านและรหัสเกียรติบัตร | `timestamp`, `student_name`, `student_id`, `class_room`, `stage1_score`...`stage5_score`, `total_score`, `coins`, `stars`, `certificate_code`, `rank_title` |
| **`Settings`** | ตั้งค่าระบบ เช่น เกณฑ์คะแนนรับเกียรติบัตร | `key`, `value`, `description` |

---

## 🛠️ ขั้นตอนการติดตั้ง Google Apps Script

### ขั้นตอนที่ 1: เปิด Google Spreadsheet
1. ไปที่ [Google Sheets](https://docs.google.com/spreadsheets)
2. เปิดเอกสาร Spreadsheet ของคุณที่มี ID: `1oUEAA3ReyR_HYILmFeH-LKjHUzNQ35me0KxdAWBaVNs`

### ขั้นตอนที่ 2: เปิด Apps Script Editor
1. ที่แถบเมนูด้านบน คลิก **ส่วนขยาย (Extensions) > Apps Script**
2. จะมีแท็บใหม่เปิดขึ้นมาเป็นหน้าต่างโค้ด Google Apps Script

### ขั้นตอนที่ 3: ใส่โค้ด Backend
1. ลบโค้ดเริ่มต้น `function myFunction() { ... }` ในไฟล์ `Code.gs` ออก
2. เปิดไฟล์ [`backend/Code.gs`](backend/Code.gs) ในโปรเจกต์นี้ คัดลอกโค้ดทั้งหมดแล้วนำมาวางในหน้าต่าง Apps Script
3. ตรวจสอบบรรทัดที่ 16 ว่าตัวแปร `SPREADSHEET_ID` ตรงกับ ID ของคุณ:
   ```javascript
   const SPREADSHEET_ID = '1oUEAA3ReyR_HYILmFeH-LKjHUzNQ35me0KxdAWBaVNs';
   ```
4. กดปุ่ม **บันทึก (Save)** (ไอคอนรูปแผ่นดิสก์)

### ขั้นตอนที่ 4: สั่งสร้างชีตและข้อมูลตัวอย่างอัตโนมัติ
1. ที่แถบเครื่องมือด้านบน เลือกฟังก์ชัน `initDatabase`
2. กดปุ่ม **เรียกใช้ (Run)** ▶️
3. หากมีหน้าต่างขอสิทธิ์ (Authorization Required) ให้คลิก:
   - **ตรวจสอบสิทธิ์ (Review Permissions)**
   - เลือกบัญชี Google ของคุณ
   - คลิก **ขั้นสูง (Advanced)** > คลิก **ไปยังโปรเจกต์ (Go to Untitled project (unsafe))**
   - คลิก **อนุญาต (Allow)**
4. เมื่อฟังก์ชันทำงานเสร็จ ให้กลับไปดูที่ Google Spreadsheet จะพบว่าชีตทั้ง 5 (`Questions`, `Answers`, `Students`, `Scores`, `Settings`) ถูกสร้างขึ้นพร้อมหัวตารางสีสวยงามและข้อสอบตัวอย่างครบถ้วน!

### ขั้นตอนที่ 5: เผยแพร่เป็น Web App (Deploy)
1. ที่มุมขวาบนของ Apps Script Editor คลิกปุ่ม **การทำให้ใช้งานได้ (Deploy) > การทำให้ใช้งานได้รายการใหม่ (New deployment)**
2. คลิกไอคอนฟันเฟืองด้านซ้าย เลือกประเภท **เว็บแอป (Web app)**
3. กรอกรายละเอียดดังนี้:
   - **คำอธิบาย (Description)**: `History Quest P.3 API v1`
   - **ดำเนินการในฐานะ (Execute as)**: `ฉัน (Me - your email)`
   - **ผู้มีสิทธิ์เข้าถึง (Who has access)**: `ทุกคน (Anyone)` *(สำคัญมาก เพื่อให้นักเรียนสามารถส่งคะแนนได้โดยไม่ต้องล็อกอินบัญชี Google)*
4. คลิกปุ่ม **ทำให้ใช้งานได้ (Deploy)**
5. คัดลอก **URL เว็บแอป (Web app URL)** ที่ขึ้นต้นด้วย:
   `https://script.google.com/macros/s/.../exec`

---

## 🔗 นำ Web App URL มาใส่ในเกม

1. เปิดเกมบนเบราว์เซอร์
2. คลิกปุ่ม **"ตั้งค่า" ⚙️** ที่มุมขวาบนของหน้าจอ
3. นำ Web App URL ที่ได้จากขั้นตอนที่ 5 มาวางในช่อง **"Google Apps Script Web App URL"**
4. คลิกปุ่ม **"🧪 ทดสอบการเชื่อมต่อ"**
   - หากขึ้นข้อความสีเขียว: `✅ เชื่อมต่อ Google Sheets สำเร็จ!` แสดงว่าการตั้งค่าสมบูรณ์แบบ
5. คลิกปุ่ม **"บันทึกการตั้งค่า"**

เมื่อนักเรียนเล่นจบแต่ละด่าน หรือจบเกม คะแนนและประวัติการตอบคำถามจะถูกซิงก์ไปยัง Google Sheets แบบ Realtime ทันที!
