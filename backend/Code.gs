/**
 * Google Apps Script Backend สำหรับเกม "ผจญภัยย้อนเวลาตะลุยประวัติศาสตร์ ป.3"
 * รองรับการเชื่อมต่อกับ Google Sheets ID: 1oUEAA3ReyR_HYILmFeH-LKjHUzNQ35me0KxdAWBaVNs
 * 
 * ระบบแยก 5 ชีต:
 * 1. Questions - คลังข้อสอบ 5 ด่าน พร้อมตัวเลือก เฉลย คำใบ้ และคำอธิบาย
 * 2. Answers   - บันทึกการตอบคำถามรายข้อของนักเรียนเพื่อการวิเคราะห์
 * 3. Students  - ฐานข้อมูลนักเรียน คะแนนสะสม และความคืบหน้า
 * 4. Scores    - สรุปผลคะแนนรวมทุกด่านและรหัสเกียรติบัตร
 * 5. Settings  - ตั้งค่าระบบ เช่น เกณฑ์ผ่าน, ประกาศ, รุ่นเกม
 * 
 * ความปลอดภัย:
 * - ไม่มีการฝัง API Secrets หรือ Google Credentials ใดๆ ในฝั่ง Frontend
 * - Frontend สื่อสารผ่าน Web App URL ที่ปลอดภัย
 */

const SPREADSHEET_ID = '1oUEAA3ReyR_HYILmFeH-LKjHUzNQ35me0KxdAWBaVNs';

function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID !== '') {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (err) {
      Logger.log('Could not open by ID, using active spreadsheet: ' + err.message);
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * ฟังก์ชันสร้างและตั้งค่าชีตทั้ง 5 อัตโนมัติ พร้อมหัวตารางและข้อมูลตัวอย่าง
 * สามารถกดรันครั้งแรกใน Apps Script Editor หรือเรียกผ่าน Web App ได้
 */
function initDatabase() {
  const ss = getSpreadsheet();
  
  // 1. ชีต Questions
  let qSheet = ss.getSheetByName('Questions');
  if (!qSheet) {
    qSheet = ss.insertSheet('Questions');
    const headers = [
      'id', 'stage_id', 'stage_name', 'question', 
      'choice_a', 'choice_b', 'choice_c', 'choice_d', 
      'correct_index', 'hint', 'explanation'
    ];
    qSheet.appendRow(headers);
    formatHeaderRow(qSheet, '#1E88E5');
    
    // ใส่ข้อมูลข้อสอบตัวอย่าง ป.3
    const sampleQuestions = [
      // ด่าน 1
      ['S1_Q1', 1, 'ชีวิตผู้คนในอดีต', 'เหตุใดคนไทยในอดีตจึงนิยมสร้างบ้านเรือนอยู่ริมแม่น้ำลำคลอง?', 'สะดวกในการใช้น้ำและเดินทางด้วยเรือ', 'ต้องการว่ายน้ำเล่นทุกวัน', 'ริมแม่น้ำมีห้างสรรพสินค้ามากมาย', 'ไม่ต้องการสร้างหลังคาบ้าน', 0, 'ลองนึกถึงประโยชน์ของน้ำในการดื่มกิน และพาหนะที่ใช้พายเดินทางในสมัยก่อนนะจ๊ะ', 'ในอดีตยังไม่มีถนน รถยนต์ และน้ำประปา แม่น้ำลำคลองจึงเป็นเส้นทางสัญจรหลักและเป็นแหล่งน้ำสำคัญ'],
      ['S1_Q2', 1, 'ชีวิตผู้คนในอดีต', 'พาหนะชนิดใดที่คนไทยในอดีตนิยมใช้เดินทางบนผืนน้ำ?', 'เรือพายและเรือแจว', 'รถไฟฟ้าความเร็วสูง', 'รถยนต์พลังงานไฟฟ้า', 'เครื่องบินเจ็ต', 0, 'เป็นยานพาหนะทำจากไม้ ใช้ไม้พายหรือแจวในการเคลื่อนที่', 'เรือพายและเรือแจวเป็นพาหนะโบราณที่ทำจากไม้ ใช้แรงคนพายเดินทางตามแม่น้ำลำคลอง'],
      ['S1_Q3', 1, 'ชีวิตผู้คนในอดีต', 'ก่อนที่จะมีไฟฟ้าใช้ในบ้าน ผู้คนในอดีตใช้สิ่งใดเพื่อให้แสงสว่างในยามค่ำคืน?', 'ตะเกียงน้ำมันและไต้', 'ไฟฉายเลเซอร์', 'หลอดไฟ LED', 'หน้าจอสมาร์ตโฟน', 0, 'อุปกรณ์นี้ต้องใช้น้ำมันมะพร้าวหรือน้ำมันก๊าดในการจุดไฟ', 'ในอดีตคนโบราณใช้ตะเกียงน้ำมัน เทียนไข หรือคบไต้เพื่อให้แสงสว่าง'],
      ['S1_Q4', 1, 'ชีวิตผู้คนในอดีต', 'การเปลี่ยนแปลงของชุมชนจากอดีตสู่ปัจจุบัน ข้อใดกล่าวได้ถูกต้องที่สุด?', 'การเดินทางสะดวกและรวดเร็วขึ้นกว่าในอดีต', 'ผู้คนเปลี่ยนมาใช้เกวียนเดินทางมากขึ้น', 'ทุกคนเลิกใช้ไฟฟ้าแล้วหันมาใช้เตาถ่าน', 'บ้านเรือนริมน้ำเพิ่มขึ้นมากกว่าตึกในเมือง', 0, 'ปัจจุบันมีทั้งถนน ทางด่วน รถไฟฟ้า ทำให้เราไปไหนมาไหนได้ไวขึ้นมาก', 'เทคโนโลยีทำให้การคมนาคมขนส่งในปัจจุบันมีความสะดวก รวดเร็ว และปลอดภัยกว่าในอดีตมาก'],
      
      // ด่าน 2
      ['S2_Q1', 2, 'หลักฐานทางประวัติศาสตร์', 'ข้อใดจัดเป็นหลักฐานทางประวัติศาสตร์ "ที่เป็นลายลักษณ์อักษร"?', 'ศิลาจารึกและจดหมายเหตุ', 'หม้อดินเผาลายเขียนสีบ้านเชียง', 'เจดีย์โบราณสมัยอยุธยา', 'กำไลหอยทะเลและเครื่องประดับหิน', 0, 'มองหาสิ่งที่มีการสลักหรือเขียนด้วย "ตัวหนังสือ" ลงไปนะจ๊ะ', 'ศิลาจารึกและจดหมายเหตุมีตัวอักษรจดบันทึกเรื่องราว จึงจัดเป็นหลักฐานที่เป็นลายลักษณ์อักษร'],
      ['S2_Q2', 2, 'หลักฐานทางประวัติศาสตร์', 'หากนักเรียนต้องการรู้ประวัติความเป็นมาของหมู่บ้านตนเอง ควรเริ่มต้นสืบค้นจากใครได้ดีที่สุด?', 'สอบถามผู้เฒ่าผู้แก่หรือผู้นำชุมชนในท้องถิ่น', 'คาดเดาและแต่งเรื่องขึ้นมาเอง', 'ดูการ์ตูนยอดมนุษย์ในโทรทัศน์', 'สอบถามเพื่อนที่อยู่ต่างจังหวัด', 0, 'ผู้ที่อาศัยอยู่ในชุมชนมาเนิ่นนานจะจำเรื่องราวและส่งต่อคำบอกเล่าได้ดีที่สุด', 'ผู้สูงอายุและผู้นำชุมชนเป็นพยานบุคคลที่อาศัยอยู่ในพื้นที่มานาน'],
      ['S2_Q3', 2, 'หลักฐานทางประวัติศาสตร์', '"หม้อดินเผาลายเขียนสีบ้านเชียง" จัดเป็นหลักฐานประเภทใด?', 'โบราณวัตถุ (หลักฐานที่ไม่เป็นลายลักษณ์อักษร)', 'หลักฐานที่เป็นลายลักษณ์อักษร', 'หนังสือนวนิยาย', 'เอกสารราชการ', 0, 'หม้อดินเผาเป็นข้าวของเครื่องใช้โบราณที่ไม่มีตัวหนังสือเขียนไว้', 'หม้อดินเผาบ้านเชียงเป็นสิ่งของเครื่องใช้ยุคก่อนประวัติศาสตร์ จัดเป็นโบราณวัตถุ'],
      ['S2_Q4', 2, 'หลักฐานทางประวัติศาสตร์', 'ภาพถ่ายเก่าของโรงเรียนในอดีตมีประโยชน์ต่อนักเรียนอย่างไร?', 'ช่วยให้เห็นการเปลี่ยนแปลงของอาคารและชุดนักเรียนในอดีต', 'ช่วยให้เล่นเกมในโทรศัพท์เก่งขึ้น', 'ทำให้คอมพิวเตอร์ทำงานเร็วขึ้น', 'ไม่มีประโยชน์เพราะเป็นภาพขาวดำ', 0, 'ภาพถ่ายเป็นหลักฐานสำคัญที่บันทึกสภาพจริงในอดีตไว้ให้เรามองเห็นด้วยตา', 'ภาพถ่ายเก่าช่วยให้เรามองเห็นสภาพความเป็นจริงในอดีต เปรียบเทียบกับปัจจุบัน'],
      
      // ด่าน 3
      ['S3_Q1', 3, 'บุคคลสำคัญของไทย', 'พระมหากษัตริย์พระองค์ใดทรงประดิษฐ์ "ลายสือไทย" ซึ่งเป็นต้นกำเนิดอักษรไทย?', 'พ่อขุนรามคำแหงมหาราช', 'สมเด็จพระนเรศวรมหาราช', 'สมเด็จพระเจ้าตากสินมหาราช', 'พระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว', 0, 'พระองค์ทรงครองราชย์ ณ อาณาจักรสุโขทัย มีศิลาจารึกหลักที่ 1', 'พ่อขุนรามคำแหงมหาราชทรงประดิษฐ์อักษรไทยหรือลายสือไทยขึ้นในปี พ.ศ. 1826'],
      ['S3_Q2', 3, 'บุคคลสำคัญของไทย', 'วีรกรรมการทำ "ยุทธหัตถี" หรือการชนช้าง เกิดขึ้นในรัชสมัยของกษัตริย์พระองค์ใด?', 'สมเด็จพระนเรศวรมหาราช', 'พ่อขุนศรีอินทราทิตย์', 'สมเด็จพระเจ้าอู่ทอง', 'พระยาพิชัยดาบหัก', 0, 'พระองค์ทรงเป็นพระมหากษัตริย์ยอดนักรบแห่งกรุงศรีอยุธยา กอบกู้เอกราชชาติไทย', 'สมเด็จพระนเรศวรมหาราชทรงกระทำยุทธหัตถีมีชัยชนะเหนือพระมหาอุปราชา ณ หนองสาหร่าย'],
      ['S3_Q3', 3, 'บุคคลสำคัญของไทย', 'สมเด็จพระเจ้าตากสินมหาราช ทรงสถาปนาเมืองหลวงแห่งใดขึ้นเป็นราชธานี?', 'กรุงธนบุรี', 'กรุงสุโขทัย', 'กรุงศรีอยุธยา', 'เมืองเชียงใหม่', 0, 'เมืองหลวงริมแม่น้ำเจ้าพระยาฝั่งตะวันตก ต่อจากสมัยอยุธยา', 'หลังกอบกู้เอกราช สมเด็จพระเจ้าตากสินมหาราชทรงสถาปนากรุงธนบุรีขึ้นเป็นราชธานี'],
      ['S3_Q4', 3, 'บุคคลสำคัญของไทย', 'พระมหากษัตริย์พระองค์ใดทรงสถาปนากรุงเทพมหานครและเป็นปฐมกษัตริย์แห่งราชวงศ์จักรี?', 'พระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช (รัชกาลที่ 1)', 'พระบาทสมเด็จพระจอมเกล้าเจ้าอยู่หัว (รัชกาลที่ 4)', 'สมเด็จพระนารายณ์มหาราช', 'พ่อขุนรามคำแหงมหาราช', 0, 'พระองค์คือรัชกาลที่ 1 แห่งกรุงรัตนโกสินทร์', 'พระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช ทรงสถาปนากรุงรัตนโกสินทร์เมื่อ พ.ศ. 2325'],
      
      // ด่าน 4
      ['S4_Q1', 4, 'อาณาจักรไทย', 'การเรียงลำดับกาลเวลาของอาณาจักรไทยจากอดีตมาจนถึงปัจจุบัน ข้อใดถูกต้อง?', 'สุโขทัย -> อยุธยา -> ธนบุรี -> รัตนโกสินทร์', 'อยุธยา -> สุโขทัย -> รัตนโกสินทร์ -> ธนบุรี', 'ธนบุรี -> สุโขทัย -> อยุธยา -> รัตนโกสินทร์', 'รัตนโกสินทร์ -> อยุธยา -> ธนบุรี -> สุโขทัย', 0, 'เริ่มจากรุ่งอรุณแห่งความสุข (สุโขทัย) สู่เมืองหลวงเกาะน้ำ (อยุธยา) แล้วจึงเป็นธนบุรี และกรุงเทพฯ', 'ลำดับการสถาปนาราชธานีของไทย เริ่มต้นจากสุโขทัย ต่อด้วยอยุธยา ธนบุรี และกรุงรัตนโกสินทร์'],
      ['S4_Q2', 4, 'อาณาจักรไทย', 'ใครคือผู้สถาปนาอาณาจักรสุโขทัยเป็นราชธานี?', 'พ่อขุนศรีอินทราทิตย์', 'สมเด็จพระเจ้าอู่ทอง', 'สมเด็จพระนเรศวรมหาราช', 'พระยาวชิรปราการ', 0, 'พระนามเดิมคือ พ่อขุนบางกลางหาว ร่วมกับพ่อขุนผาเมืองขับไล่ขอม', 'พ่อขุนบางกลางหาวได้รับสถาปนาเป็น พ่อขุนศรีอินทราทิตย์ ปฐมกษัตริย์แห่งราชวงศ์พระร่วง'],
      ['S4_Q3', 4, 'อาณาจักรไทย', 'ลักษณะภูมิประเทศเด่นของกรุงศรีอยุธยาที่มีแม่น้ำล้อมรอบ 3 สาย มีประโยชน์ด้านใดมากที่สุด?', 'ป้องกันข้าศึกศัตรูและสะดวกในการค้าขายทางเรือ', 'ช่วยให้น้ำท่วมเมืองตลอดทั้งปี', 'ทำให้ไม่สามารถเดินทางไปไหนได้', 'ใช้จัดแข่งกีฬาเจ็ตสกีระดับโลก', 0, 'น้ำล้อมรอบเป็นคูเมืองธรรมชาติยากแก่การโจมตี และเรือสำเภาแล่นเข้ามาติดต่อได้สะดวก', 'กรุงศรีอยุธยามีแม่น้ำล้อมรอบเป็นเกาะเมือง ป้องกันข้าศึกและสะดวกต่อการค้าขายทางเรือ'],
      ['S4_Q4', 4, 'อาณาจักรไทย', 'ราชธานีใดของไทยที่ทำหน้าที่เป็นเมืองหลวงยาวนานที่สุดถึง 417 ปี?', 'กรุงศรีอยุธยา', 'กรุงธนบุรี', 'กรุงสุโขทัย', 'เมืองเชียงแสน', 0, 'อาณาจักรที่มีพระมหากษัตริย์ปกครองถึง 33 พระองค์ มีแม่น้ำล้อมรอบ', 'กรุงศรีอยุธยาเป็นราชธานีของไทยที่มีประวัติศาสตร์ยาวนานถึง 417 ปี'],
      
      // ด่าน 5
      ['S5_Q1', 5, 'วิถีชีวิตและภูมิปัญญาไทย', 'ประเพณีลอยกระทงจัดขึ้นโดยมีวัตถุประสงค์หลักเพื่ออะไร?', 'ขอขมาและขอบคุณพระแม่คงคา (สายนํ้า)', 'ประกวดชุดราตรีทันสมัย', 'แข่งเรือหางยาวข้ามทวีป', 'ทิ้งขยะพลาสติกลงในแม่น้ำ', 0, 'พระแม่คงคาเป็นเทพแห่งสายนํ้าที่หล่อเลี้ยงชีวิตมนุษย์', 'ประเพณีลอยกระทงจัดขึ้นในคืนวันเพ็ญเดือน 12 เพื่อขอขมาและขอบคุณพระแม่คงคา'],
      ['S5_Q2', 5, 'วิถีชีวิตและภูมิปัญญาไทย', 'ของเล่นพื้นบ้านชนิดใดที่ประดิษฐ์ขึ้นจากส่วนของ "ต้นกล้วย"?', 'ม้าก้านกล้วย', 'เดินกะลา', 'ว่าวปักเป้า', 'หุ่นยนต์พลาสติก', 0, 'นำก้านใบกล้วยมาตัดใบออก บากเป็นหูม้า แล้วขี่วิ่งควบอย่างสนุกสนาน', 'ม้าก้านกล้วย ทำจากก้านกล้วยที่ตัดใบออก เหลาเป็นหัวม้า เป็นภูมิปัญญาของเล่นที่หาได้ง่าย'],
      ['S5_Q3', 5, 'วิถีชีวิตและภูมิปัญญาไทย', 'การแสดงความเคารพและการทักทายอันเป็นเอกลักษณ์ประจำชาติไทยคือข้อใด?', 'การไหว้', 'การจับมือเขย่า', 'การชนกำปั้น', 'การก้มศีรษะแบบตะวันตก', 0, 'พนมมือทั้งสองขึ้นจรดระหว่างอกหรือใบหน้า พร้อมกล่าวคำว่า สวัสดี', 'การไหว้ เป็นการแสดงความเคารพและทักทายอันเป็นเอกลักษณ์ประจำชาติไทย'],
      ['S5_Q4', 5, 'วิถีชีวิตและภูมิปัญญาไทย', 'ภูมิปัญญาการนำสมุนไพรไทย เช่น ขิง ข่า ตะไคร้ ใบมะกรูด มาใส่ในต้มยำ มีประโยชน์อย่างไร?', 'ทำให้อาหารมีกลิ่นหอมและมีสรรพคุณช่วยขับลม บำรุงร่างกาย', 'ทำให้อาหารเปลี่ยนเป็นสีรุ้ง', 'ช่วยให้อาหารเก็บไว้ได้ 100 ปีโดยไม่บูด', 'ทำให้เนื้อสัตว์กลายเป็นผัก', 0, 'สมุนไพรเหล่านี้มีกลิ่นหอมและมีสรรพคุณทางยาช่วยบรรเทาอาการหวัดและช่วยย่อย', 'พืชสมุนไพรในต้มยำนอกจากหอมอร่อย ยังช่วยขับลม แก้ท้องอืด และบำรุงสุขภาพ']
    ];
    
    sampleQuestions.forEach(function(row) {
      qSheet.appendRow(row);
    });
  }

  // 2. ชีต Answers (เก็บบันทึกประวัติการตอบรายข้อ)
  let aSheet = ss.getSheetByName('Answers');
  if (!aSheet) {
    aSheet = ss.insertSheet('Answers');
    const aHeaders = [
      'timestamp', 'student_name', 'student_id', 'class_room', 
      'stage_id', 'question_id', 'selected_choice', 'is_correct', 'attempt_count'
    ];
    aSheet.appendRow(aHeaders);
    formatHeaderRow(aSheet, '#FB8C00');
  }

  // 3. ชีต Students (ทะเบียนนักเรียนและสรุปผลงาน)
  let sSheet = ss.getSheetByName('Students');
  if (!sSheet) {
    sSheet = ss.insertSheet('Students');
    const sHeaders = [
      'student_id', 'student_name', 'class_room', 
      'total_score', 'stages_completed', 'total_coins', 'total_stars', 'last_active'
    ];
    sSheet.appendRow(sHeaders);
    formatHeaderRow(sSheet, '#43A047');
  }

  // 4. ชีต Scores (บันทึกคะแนนจบเกมและรหัสเกียรติบัตร)
  let scoreSheet = ss.getSheetByName('Scores');
  if (!scoreSheet) {
    scoreSheet = ss.insertSheet('Scores');
    const scHeaders = [
      'timestamp', 'student_name', 'student_id', 'class_room',
      'stage1_score', 'stage2_score', 'stage3_score', 'stage4_score', 'stage5_score',
      'total_score', 'coins', 'stars', 'certificate_code', 'rank_title'
    ];
    scoreSheet.appendRow(scHeaders);
    formatHeaderRow(scoreSheet, '#8E24AA');
  }

  // 5. ชีต Settings (การตั้งค่าระบบ)
  let setSheet = ss.getSheetByName('Settings');
  if (!setSheet) {
    setSheet = ss.insertSheet('Settings');
    const setHeaders = ['key', 'value', 'description'];
    setSheet.appendRow(setHeaders);
    formatHeaderRow(setSheet, '#546E7A');
    
    const defaultSettings = [
      ['game_title', 'ผจญภัยย้อนเวลาตะลุยประวัติศาสตร์ ป.3', 'ชื่อเกมหลัก'],
      ['min_pass_score', '1500', 'คะแนนขั้นต่ำเพื่อรับเกียรติบัตรระดับทอง'],
      ['allow_retry', 'true', 'อนุญาตให้นักเรียนลองตอบใหม่เมื่อตอบผิด'],
      ['coins_per_correct', '10', 'จำนวนเหรียญที่ได้รับต่อข้อที่ตอบถูก'],
      ['score_per_correct', '100', 'คะแนนที่ได้รับต่อข้อ'],
      ['app_version', '1.0.0', 'เวอร์ชันระบบ'],
      ['school_name', 'โรงเรียนประถมศึกษาต้นแบบ', 'ชื่อโรงเรียนสำหรับออกเกียรติบัตร']
    ];
    defaultSettings.forEach(function(row) {
      setSheet.appendRow(row);
    });
  }

  return {
    success: true,
    message: 'สร้างและตั้งค่าชีตทั้ง 5 เรียบร้อยแล้ว (Questions, Answers, Students, Scores, Settings)',
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl()
  };
}

/**
 * ปรับแต่งรูปแบบแถวหัวตารางให้อ่านง่าย สวยงาม
 */
function formatHeaderRow(sheet, bgColor) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground(bgColor);
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setFontFamily('Prompt');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

/**
 * Handle GET Requests (ดึงข้อมูลข้อสอบ, ตรวจสอบสถานะการเชื่อมต่อ)
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'ping';
  
  try {
    if (action === 'ping' || action === 'checkConnection') {
      const ss = getSpreadsheet();
      return jsonResponse({
        success: true,
        message: 'เชื่อมต่อ Google Sheets สำเร็จ!',
        spreadsheetName: ss.getName(),
        spreadsheetId: ss.getId(),
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'initSheets') {
      const result = initDatabase();
      return jsonResponse(result);
    }
    
    if (action === 'getQuestions') {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName('Questions');
      if (!sheet) {
        initDatabase();
      }
      const qSheet = ss.getSheetByName('Questions');
      const data = qSheet.getDataRange().getValues();
      const questions = [];
      
      // แถวที่ 1 เป็นหัวตาราง เริ่มอ่านจากแถวที่ 2
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue;
        questions.push({
          id: row[0],
          stageId: Number(row[1]),
          stageName: row[2],
          question: row[3],
          choices: [row[4], row[5], row[6], row[7]],
          correct: Number(row[8]),
          hint: row[9] || '',
          explanation: row[10] || ''
        });
      }
      
      return jsonResponse({
        success: true,
        count: questions.length,
        questions: questions
      });
    }
    
    if (action === 'getScores') {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName('Scores');
      if (!sheet) {
        return jsonResponse({ success: true, scores: [] });
      }
      const data = sheet.getDataRange().getValues();
      const scores = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[1]) continue;
        scores.push({
          timestamp: row[0],
          studentName: row[1],
          studentId: row[2],
          classRoom: row[3],
          totalScore: row[9],
          coins: row[10],
          stars: row[11],
          certificateCode: row[12],
          rankTitle: row[13]
        });
      }
      return jsonResponse({ success: true, scores: scores.slice(-50) });
    }
    
    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message, stack: err.stack });
  }
}

/**
 * Handle POST Requests (บันทึกคะแนนรวม และประวัติการตอบคำถาม)
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }
    
    const action = payload.action || 'saveScore';
    const ss = getSpreadsheet();
    
    if (action === 'saveScore') {
      let scoreSheet = ss.getSheetByName('Scores');
      if (!scoreSheet) {
        initDatabase();
        scoreSheet = ss.getSheetByName('Scores');
      }
      
      const timestamp = new Date();
      const studentName = payload.studentName || 'ไม่ระบุชื่อ';
      const studentId = payload.studentId || '-';
      const classRoom = payload.classRoom || 'ป.3';
      const s1 = Number(payload.stage1_score || 0);
      const s2 = Number(payload.stage2_score || 0);
      const s3 = Number(payload.stage3_score || 0);
      const s4 = Number(payload.stage4_score || 0);
      const s5 = Number(payload.stage5_score || 0);
      const totalScore = Number(payload.totalScore || (s1 + s2 + s3 + s4 + s5));
      const coins = Number(payload.coins || 0);
      const stars = Number(payload.stars || 0);
      const certCode = payload.certificateCode || ('HIST3-' + Date.now().toString(36).toUpperCase());
      const rankTitle = payload.rankTitle || 'ยอดนักประวัติศาสตร์น้อย';
      
      scoreSheet.appendRow([
        timestamp, studentName, studentId, classRoom,
        s1, s2, s3, s4, s5,
        totalScore, coins, stars, certCode, rankTitle
      ]);
      
      // อัปเดตชีต Students ด้วย
      updateStudentSummary(ss, studentId, studentName, classRoom, totalScore, coins, stars, timestamp);
      
      return jsonResponse({
        success: true,
        message: 'บันทึกคะแนนและออกเกียรติบัตรสำเร็จ!',
        certificateCode: certCode
      });
    }
    
    if (action === 'saveAnswer') {
      let aSheet = ss.getSheetByName('Answers');
      if (!aSheet) {
        initDatabase();
        aSheet = ss.getSheetByName('Answers');
      }
      
      const timestamp = new Date();
      aSheet.appendRow([
        timestamp,
        payload.studentName || '-',
        payload.studentId || '-',
        payload.classRoom || 'ป.3',
        payload.stageId || 0,
        payload.questionId || '-',
        payload.selectedChoice || '-',
        payload.isCorrect ? 'TRUE' : 'FALSE',
        payload.attemptCount || 1
      ]);
      
      return jsonResponse({ success: true, message: 'บันทึกคำตอบเรียบร้อย' });
    }
    
    return jsonResponse({ success: false, error: 'Unknown POST action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * อัปเดตข้อมูลนักเรียนในชีต Students (ถ้ามีรหัสเดิมให้อัปเดต ถ้าไม่มีให้เพิ่มใหม่)
 */
function updateStudentSummary(ss, studentId, studentName, classRoom, totalScore, coins, stars, timestamp) {
  let sSheet = ss.getSheetByName('Students');
  if (!sSheet) return;
  
  const data = sSheet.getDataRange().getValues();
  let foundRow = -1;
  
  for (let i = 1; i < data.length; i++) {
    // เทียบรหัส หรือถ้าไม่มีรหัสให้เทียบชื่อ
    if ((studentId !== '-' && String(data[i][0]) === String(studentId)) ||
        (String(data[i][1]) === String(studentName))) {
      foundRow = i + 1;
      break;
    }
  }
  
  if (foundRow > 0) {
    // อัปเดตแถวเดิม
    const prevScore = Number(sSheet.getRange(foundRow, 4).getValue() || 0);
    const newBestScore = Math.max(prevScore, totalScore);
    sSheet.getRange(foundRow, 4).setValue(newBestScore); // Best total score
    sSheet.getRange(foundRow, 5).setValue(5);            // Stages completed
    sSheet.getRange(foundRow, 6).setValue(coins);
    sSheet.getRange(foundRow, 7).setValue(stars);
    sSheet.getRange(foundRow, 8).setValue(timestamp);
  } else {
    // เพิ่มนักเรียนใหม่
    sSheet.appendRow([
      studentId, studentName, classRoom,
      totalScore, 5, coins, stars, timestamp
    ]);
  }
}

/**
 * Helper คืนค่าเป็น JSON พร้อม CORS header
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
