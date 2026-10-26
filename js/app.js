/**
 * Application Controller สำหรับเกม "ผจญภัยย้อนเวลาตะลุยประวัติศาสตร์ ป.3"
 */

class HistoryGameApp {
  constructor() {
    this.currentScreen = 'start-screen';
    this.activeStageIndex = 0;
    this.currentQuestionIndex = 0;
    this.attemptCount = 0;

    // สถานะผู้เล่น
    this.student = {
      name: localStorage.getItem(CONFIG.KEYS.STUDENT_NAME) || '',
      id: localStorage.getItem(CONFIG.KEYS.STUDENT_ID) || '',
      classRoom: localStorage.getItem(CONFIG.KEYS.CLASS_ROOM) || 'ป.3/1',
      avatar: localStorage.getItem(CONFIG.KEYS.AVATAR_ID) || 'tawan'
    };

    // ความคืบหน้าของเกม
    this.gameState = {
      unlockedStage: 1, // 1 ถึง 5
      stageScores: [0, 0, 0, 0, 0],
      stageStars: [0, 0, 0, 0, 0],
      totalCoins: 0,
      totalScore: 0,
      certificateCode: ''
    };

    this.curriculum = CURRICULUM_DATA;
    this.questions = [];
    this.confettiCanvas = null;
    this.confettiCtx = null;
    this.particles = [];
    this.isConfettiActive = false;

    this.loadSavedProgress();
  }

  init() {
    this.bindEvents();
    this.renderAvatarSelection();
    this.renderMapStages();
    this.updateStatusBar();
    this.initConfetti();
    this.updateSoundButtonUI();

    // เติมข้อมูลผู้เล่นเดิมหากเคยเล่นไว้
    if (this.student.name) {
      const nameInput = document.getElementById('studentNameInput');
      if (nameInput) nameInput.value = this.student.name;
    }
    if (this.student.classRoom) {
      const classInput = document.getElementById('classRoomInput');
      if (classInput) classInput.value = this.student.classRoom;
    }

    // โหลดข้อสอบจาก Sheets เพิ่มเติมหากมี Web App URL
    if (Sheets.hasEndpoint()) {
      Sheets.fetchRemoteQuestions().then(remoteQs => {
        if (remoteQs && remoteQs.length > 0) {
          console.log('Loaded remote questions:', remoteQs.length);
        }
      });
    }
  }

  loadSavedProgress() {
    try {
      const saved = localStorage.getItem(CONFIG.KEYS.PROGRESS);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.gameState = { ...this.gameState, ...parsed };
      }
    } catch (e) {
      console.warn('Load progress error:', e);
    }
  }

  saveProgress() {
    try {
      localStorage.setItem(CONFIG.KEYS.PROGRESS, JSON.stringify(this.gameState));
      localStorage.setItem(CONFIG.KEYS.STUDENT_NAME, this.student.name);
      localStorage.setItem(CONFIG.KEYS.STUDENT_ID, this.student.id);
      localStorage.setItem(CONFIG.KEYS.CLASS_ROOM, this.student.classRoom);
      localStorage.setItem(CONFIG.KEYS.AVATAR_ID, this.student.avatar);
    } catch (e) {
      console.warn('Save progress error:', e);
    }
  }

  resetAllProgress() {
    if (confirm('น้องต้องการเริ่มเล่นใหม่ตั้งแต่ต้นใช่ไหมคะ? ข้อมูลและคะแนนจะถูกรีเซ็ต')) {
      localStorage.removeItem(CONFIG.KEYS.PROGRESS);
      this.gameState = {
        unlockedStage: 1,
        stageScores: [0, 0, 0, 0, 0],
        stageStars: [0, 0, 0, 0, 0],
        totalCoins: 0,
        totalScore: 0,
        certificateCode: ''
      };
      this.renderMapStages();
      this.updateStatusBar();
      this.switchScreen('map-screen');
      Sound.playWarp();
    }
  }

  bindEvents() {
    // ปุ่มเริ่มการผจญภัย
    const startBtn = document.getElementById('btnStartAdventure');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.handleStartAdventure());
    }

    // ปุ่มสลับเสียง
    const soundBtn = document.getElementById('btnToggleSound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isUnmuted = Sound.toggleSound();
        this.updateSoundButtonUI();
      });
    }

    // ปุ่มตั้งค่าครู / Google Sheets
    const settingsBtn = document.getElementById('btnOpenSettings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openSettingsModal());
    }

    // ปุ่มคู่มือการเล่น
    const helpBtn = document.getElementById('btnOpenHelp');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => this.openHelpModal());
    }

    // ปุ่มกลับหน้าแผนที่
    document.querySelectorAll('.btn-back-to-map').forEach(btn => {
      btn.addEventListener('click', () => {
        Sound.playClick();
        this.switchScreen('map-screen');
        this.renderMapStages();
      });
    });

    // ปุ่มเริ่มทำข้อสอบจากหน้าอ่านเนื้อหา
    const startQuizBtn = document.getElementById('btnStartStageQuiz');
    if (startQuizBtn) {
      startQuizBtn.addEventListener('click', () => {
        Sound.playClick();
        this.startStageQuiz(this.activeStageIndex);
      });
    }

    // ปุ่มคำใบ้
    const hintBtn = document.getElementById('btnUseHint');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => this.showHint());
    }

    // ปุ่มลองตอบใหม่ใน Feedback Modal
    const retryBtn = document.getElementById('btnFeedbackRetry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        Sound.playClick();
        this.closeFeedbackModal();
      });
    }

    // ปุ่มข้อต่อไป / ผ่านไปข้อถัดไป
    const nextBtn = document.getElementById('btnFeedbackNext');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        Sound.playClick();
        this.closeFeedbackModal();
        this.nextQuestion();
      });
    }

    // ปุ่มถัดไปในหน้าสรุปผ่านด่าน
    const stageNextBtn = document.getElementById('btnStageClearContinue');
    if (stageNextBtn) {
      stageNextBtn.addEventListener('click', () => {
        Sound.playWarp();
        if (this.activeStageIndex + 1 >= 5) {
          // จบเกมครบ 5 ด่าน ไปหน้าเกียรติบัตร
          this.showFinalSummary();
        } else {
          this.switchScreen('map-screen');
          this.renderMapStages();
        }
      });
    }

    // ปุ่มบันทึกเกียรติบัตร PNG
    const downloadCertBtn = document.getElementById('btnDownloadCert');
    if (downloadCertBtn) {
      downloadCertBtn.addEventListener('click', () => {
        Sound.playCoin();
        CertGen.downloadPNG(`เกียรติบัตรประวัติศาสตร์ป3_${this.student.name || 'นักเรียน'}.png`);
      });
    }

    // ปุ่มพิมพ์เกียรติบัตร
    const printCertBtn = document.getElementById('btnPrintCert');
    if (printCertBtn) {
      printCertBtn.addEventListener('click', () => {
        Sound.playClick();
        CertGen.print();
      });
    }

    // ปุ่มเล่นอีกครั้ง
    const playAgainBtn = document.getElementById('btnPlayAgain');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        Sound.playWarp();
        this.switchScreen('map-screen');
      });
    }

    // ปุ่มส่งคะแนนไป Google Sheets
    const syncSheetsBtn = document.getElementById('btnSyncSheets');
    if (syncSheetsBtn) {
      syncSheetsBtn.addEventListener('click', () => this.syncFinalScoreToSheets());
    }

    // ปุ่มรีเซ็ตความคืบหน้า
    const resetBtn = document.getElementById('btnResetGame');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetAllProgress());
    }

    // ปิด Modal ต่างๆ
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });
  }

  updateSoundButtonUI() {
    const btn = document.getElementById('btnToggleSound');
    if (!btn) return;
    if (Sound.isMuted()) {
      btn.innerHTML = '🔇 <span class="nav-text">เปิดเสียง</span>';
      btn.classList.add('muted');
    } else {
      btn.innerHTML = '🔊 <span class="nav-text">ปิดเสียง</span>';
      btn.classList.remove('muted');
    }
  }

  handleStartAdventure() {
    const nameInput = document.getElementById('studentNameInput');
    const classInput = document.getElementById('classRoomInput');

    const name = nameInput ? nameInput.value.trim() : '';
    const classRoom = classInput ? classInput.value.trim() : 'ป.3/1';

    if (!name) {
      alert('กรุณากรอกชื่อ-นามสกุล หรือชื่อเล่นของน้องก่อนเริ่มการผจญภัยนะจ๊ะ!');
      if (nameInput) nameInput.focus();
      return;
    }

    this.student.name = name;
    this.student.classRoom = classRoom || 'ป.3/1';
    this.saveProgress();

    Sound.playWarp();
    this.updateStatusBar();
    this.switchScreen('map-screen');
    this.renderMapStages();
  }

  switchScreen(screenId) {
    document.querySelectorAll('.game-screen').forEach(scr => {
      scr.classList.remove('active');
    });
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      this.currentScreen = screenId;
      window.scrollTo(0, 0);
    }
  }

  renderAvatarSelection() {
    const container = document.getElementById('avatarSelectionList');
    if (!container) return;

    container.innerHTML = CONFIG.AVATARS.map(av => `
      <div class="avatar-card ${this.student.avatar === av.id ? 'selected' : ''}" data-avatar-id="${av.id}">
        <div class="avatar-emoji">${av.emoji}</div>
        <div class="avatar-name">${av.name}</div>
        <div class="avatar-role">${av.role}</div>
      </div>
    `).join('');

    container.querySelectorAll('.avatar-card').forEach(card => {
      card.addEventListener('click', () => {
        Sound.playClick();
        container.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.student.avatar = card.getAttribute('data-avatar-id');
        this.saveProgress();
        this.updateStatusBar();
      });
    });
  }

  updateStatusBar() {
    const nameEl = document.getElementById('statusStudentName');
    const avatarEl = document.getElementById('statusAvatarEmoji');
    const scoreEl = document.getElementById('statusTotalScore');
    const coinsEl = document.getElementById('statusTotalCoins');
    const starsEl = document.getElementById('statusTotalStars');

    const curAvatar = CONFIG.AVATARS.find(a => a.id === this.student.avatar) || CONFIG.AVATARS[0];

    if (nameEl) nameEl.textContent = this.student.name || 'นักผจญภัย ป.3';
    if (avatarEl) avatarEl.textContent = curAvatar.emoji;
    if (scoreEl) scoreEl.textContent = this.gameState.totalScore.toLocaleString();
    if (coinsEl) coinsEl.textContent = this.gameState.totalCoins.toLocaleString();

    const totalStars = this.gameState.stageStars.reduce((a, b) => a + b, 0);
    if (starsEl) starsEl.textContent = totalStars;

    // Progress Bar
    const progressFill = document.getElementById('gameGlobalProgressBar');
    if (progressFill) {
      const pct = Math.min(100, Math.round(((this.gameState.unlockedStage - 1) / 5) * 100));
      progressFill.style.width = `${pct}%`;
    }
  }

  renderMapStages() {
    const mapContainer = document.getElementById('mapStagesContainer');
    if (!mapContainer) return;

    const stages = this.curriculum.stages;
    mapContainer.innerHTML = stages.map((stg, idx) => {
      const isUnlocked = (idx + 1) <= this.gameState.unlockedStage;
      const isCleared = (idx + 1) < this.gameState.unlockedStage || (this.gameState.stageStars[idx] > 0);
      const starsCount = this.gameState.stageStars[idx] || 0;
      const stageScore = this.gameState.stageScores[idx] || 0;

      let starsHtml = '';
      for (let s = 1; s <= 3; s++) {
        starsHtml += `<span class="star-icon ${s <= starsCount ? 'filled' : ''}">★</span>`;
      }

      return `
        <div class="stage-node-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCleared ? 'cleared' : ''}" data-stage-index="${idx}">
          <div class="stage-number-tag">ด่านที่ ${stg.id}</div>
          <div class="stage-node-icon" style="background: ${isUnlocked ? stg.themeColor : '#B0BEC5'}">
            <span>${stg.icon}</span>
          </div>
          <div class="stage-info">
            <h3 class="stage-title">${stg.title}</h3>
            <p class="stage-subtitle">${stg.subtitle}</p>
            <div class="stage-badge-name">🏅 ${stg.badge}</div>
            <div class="stage-stars-row">${starsHtml}</div>
            ${isCleared ? `<div class="stage-score-tag">คะแนน: ${stageScore}</div>` : ''}
          </div>
          <div class="stage-action-area">
            ${isUnlocked 
              ? `<button class="btn btn-enter-stage">${isCleared ? 'ทบทวนอีกครั้ง 🔄' : 'ออกเดินทาง! 🚀'}</button>` 
              : `<div class="lock-indicator">🔒 ต้องผ่านด่าน ${idx} ก่อน</div>`}
          </div>
        </div>
      `;
    }).join('');

    mapContainer.querySelectorAll('.stage-node-card.unlocked').forEach(node => {
      node.addEventListener('click', (e) => {
        Sound.playClick();
        const stageIdx = parseInt(node.getAttribute('data-stage-index'), 10);
        this.openStageIntro(stageIdx);
      });
    });
  }

  openStageIntro(stageIndex) {
    this.activeStageIndex = stageIndex;
    const stage = this.curriculum.stages[stageIndex];
    if (!stage) return;

    Sound.playWarp();

    // เติมข้อมูลหน้าสรุปความรู้
    document.getElementById('exploreStageTitle').textContent = `ด่านที่ ${stage.id}: ${stage.title}`;
    document.getElementById('exploreStageSubtitle').textContent = stage.subtitle;
    document.getElementById('exploreStageMission').textContent = `🎯 ภารกิจ: ${stage.mission}`;

    const storyContainer = document.getElementById('exploreStoryCards');
    if (storyContainer) {
      storyContainer.innerHTML = stage.story.map(card => `
        <div class="story-card">
          <div class="story-card-icon">${card.icon}</div>
          <div class="story-card-content">
            <h4>${card.title}</h4>
            <p>${card.text}</p>
          </div>
        </div>
      `).join('');
    }

    this.switchScreen('explore-screen');
  }

  startStageQuiz(stageIndex) {
    this.activeStageIndex = stageIndex;
    const stage = this.curriculum.stages[stageIndex];
    this.questions = stage.questions;
    this.currentQuestionIndex = 0;
    this.stageScoreCurrent = 0;
    this.stageWrongCount = 0;

    this.switchScreen('quiz-screen');
    this.loadQuestion();
  }

  loadQuestion() {
    this.attemptCount = 0;
    const stage = this.curriculum.stages[this.activeStageIndex];
    const q = this.questions[this.currentQuestionIndex];
    if (!q) return;

    // หัวด่านและข้อ
    document.getElementById('quizStageBadge').textContent = `ด่านที่ ${stage.id}: ${stage.title}`;
    document.getElementById('quizProgressText').textContent = `คำถามข้อที่ ${this.currentQuestionIndex + 1} / ${this.questions.length}`;

    const barPct = Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100);
    document.getElementById('quizProgressBarFill').style.width = `${barPct}%`;

    // คำถาม
    document.getElementById('quizQuestionText').textContent = q.question;

    // ชอยส์ 4 ตัวเลือก (ก, ข, ค, ง)
    const choiceLabels = ['ก.', 'ข.', 'ค.', 'ง.'];
    const choicesContainer = document.getElementById('quizChoicesContainer');
    choicesContainer.innerHTML = q.choices.map((ch, idx) => `
      <button class="choice-btn" data-choice-index="${idx}">
        <span class="choice-label">${choiceLabels[idx]}</span>
        <span class="choice-text">${ch}</span>
      </button>
    `).join('');

    // ซ่อนกล่องคำใบ้
    const hintBox = document.getElementById('quizHintBox');
    if (hintBox) {
      hintBox.classList.remove('active');
      hintBox.textContent = '';
    }

    // ผูก Event ให้แต่ละชอยส์
    choicesContainer.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const choiceIdx = parseInt(btn.getAttribute('data-choice-index'), 10);
        this.handleAnswerChoice(choiceIdx, btn);
      });
    });
  }

  showHint() {
    const q = this.questions[this.currentQuestionIndex];
    if (!q || !q.hint) return;

    Sound.playHint();
    const hintBox = document.getElementById('quizHintBox');
    if (hintBox) {
      hintBox.innerHTML = `💡 <strong>คำใบ้จากหุ่นยนต์ไทม์มี่:</strong> ${q.hint}`;
      hintBox.classList.add('active');
    }
  }

  handleAnswerChoice(selectedIdx, btnElement) {
    this.attemptCount++;
    const q = this.questions[this.currentQuestionIndex];
    const isCorrect = (selectedIdx === q.correct);

    // บันทึกลง Answers ในพื้นหลัง
    Sheets.logAnswer({
      studentName: this.student.name,
      studentId: this.student.id,
      classRoom: this.student.classRoom,
      stageId: this.curriculum.stages[this.activeStageIndex].id,
      questionId: q.id,
      selectedChoice: q.choices[selectedIdx],
      isCorrect: isCorrect,
      attemptCount: this.attemptCount
    });

    if (isCorrect) {
      // ตอบถูกต้อง!
      Sound.playCorrect();
      Sound.playCoin();
      btnElement.classList.add('correct');

      // คำนวณคะแนนตามจำนวนครั้งที่ลอง
      const gainedScore = this.attemptCount === 1 ? CONFIG.POINTS_PER_CORRECT : Math.round(CONFIG.POINTS_PER_CORRECT * 0.7);
      const gainedCoins = CONFIG.COINS_PER_CORRECT;

      this.stageScoreCurrent += gainedScore;
      this.gameState.totalScore += gainedScore;
      this.gameState.totalCoins += gainedCoins;
      this.updateStatusBar();

      this.showFeedbackModal({
        isCorrect: true,
        title: '🎉 เก่งมาก! ตอบถูกต้อง',
        message: `ได้รับ +${gainedScore} คะแนน และ +${gainedCoins} เหรียญทอง`,
        explanation: q.explanation,
        canRetry: false
      });
    } else {
      // ตอบผิด
      Sound.playWrong();
      this.stageWrongCount++;
      btnElement.classList.add('wrong');

      this.showFeedbackModal({
        isCorrect: false,
        title: '🤔 ยังไม่ถูกต้องนะจ๊ะ',
        message: 'อย่าเพิ่งท้อนะ! ลองอ่านคำใบ้หรือทบทวนความรู้ดูสิ',
        explanation: this.attemptCount >= 2 ? `💡 เฉลยที่ถูกต้อง: ${q.choices[q.correct]}<br><br>${q.explanation}` : q.hint,
        canRetry: true
      });
    }
  }

  showFeedbackModal({ isCorrect, title, message, explanation, canRetry }) {
    const modal = document.getElementById('feedbackModal');
    const titleEl = document.getElementById('feedbackTitle');
    const msgEl = document.getElementById('feedbackMessage');
    const expEl = document.getElementById('feedbackExplanation');
    const iconEl = document.getElementById('feedbackIcon');
    const retryBtn = document.getElementById('btnFeedbackRetry');
    const nextBtn = document.getElementById('btnFeedbackNext');

    if (iconEl) iconEl.textContent = isCorrect ? '🌟' : '💡';
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (expEl) expEl.innerHTML = `<strong>คำอธิบาย:</strong> ${explanation}`;

    if (retryBtn) {
      retryBtn.style.display = canRetry ? 'inline-flex' : 'none';
    }
    if (nextBtn) {
      nextBtn.style.display = isCorrect || this.attemptCount >= 2 ? 'inline-flex' : 'none';
      nextBtn.textContent = (this.currentQuestionIndex + 1 >= this.questions.length) ? 'ดูสรุปผลด่าน 🏆' : 'ลุยข้อต่อไป ➡️';
    }

    if (modal) modal.classList.add('active');
  }

  closeFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    if (modal) modal.classList.remove('active');
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.questions.length) {
      this.loadQuestion();
    } else {
      // ผ่านด่าน!
      this.handleStageComplete();
    }
  }

  handleStageComplete() {
    const stageIdx = this.activeStageIndex;
    const stage = this.curriculum.stages[stageIdx];

    // คำนวณดาว (3 ดาวถ้าผิดไม่เกิน 1 ครั้ง, 2 ดาวถ้าผิด 2-3 ครั้ง, 1 ดาวถ้าผิดมากกว่านั้น)
    let stars = 3;
    if (this.stageWrongCount >= 3) stars = 1;
    else if (this.stageWrongCount >= 1) stars = 2;

    this.gameState.stageScores[stageIdx] = Math.max(this.gameState.stageScores[stageIdx], this.stageScoreCurrent);
    this.gameState.stageStars[stageIdx] = Math.max(this.gameState.stageStars[stageIdx], stars);

    // ปลดล็อกด่านถัดไป
    if (this.gameState.unlockedStage <= stageIdx + 1) {
      this.gameState.unlockedStage = Math.min(5, stageIdx + 2);
    }

    this.saveProgress();
    this.updateStatusBar();

    // แสดงหน้าจอ Stage Clear
    Sound.playFanfare();
    this.triggerConfetti();

    document.getElementById('stageClearTitle').textContent = `ยินดีด้วย! ผ่านด่านที่ ${stage.id}`;
    document.getElementById('stageClearName').textContent = stage.title;
    document.getElementById('stageClearScore').textContent = `+${this.stageScoreCurrent} คะแนน`;
    document.getElementById('stageClearBadge').textContent = `🏅 ได้รับเหรียญตรา: ${stage.badge}`;

    // แสดงดาว
    const starsContainer = document.getElementById('stageClearStars');
    if (starsContainer) {
      let html = '';
      for (let s = 1; s <= 3; s++) {
        html += `<span class="big-star ${s <= stars ? 'filled' : ''}">★</span>`;
      }
      starsContainer.innerHTML = html;
    }

    const nextBtn = document.getElementById('btnStageClearContinue');
    if (nextBtn) {
      nextBtn.textContent = (stageIdx + 1 >= 5) ? 'รับเกียรติบัตรและสรุปผล 🎓' : 'ไปต่อด่านถัดไป 🗺️';
    }

    const modal = document.getElementById('stageClearModal');
    if (modal) modal.classList.add('active');
  }

  showFinalSummary() {
    const stageModal = document.getElementById('stageClearModal');
    if (stageModal) stageModal.classList.remove('active');

    Sound.playFanfare();
    this.triggerConfetti();
    this.switchScreen('summary-screen');

    // สร้างรหัสเกียรติบัตรถ้ายังไม่มี
    if (!this.gameState.certificateCode) {
      this.gameState.certificateCode = 'HIST3-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      this.saveProgress();
    }

    const totalStars = this.gameState.stageStars.reduce((a, b) => a + b, 0);
    const rankTitle = this.gameState.totalScore >= 1600 ? 'ยอดนักประวัติศาสตร์น้อยระดับทองคำ' : 'นักสำรวจประวัติศาสตร์รุ่นเยาว์ดีเด่น';

    document.getElementById('summaryTotalScore').textContent = this.gameState.totalScore.toLocaleString();
    document.getElementById('summaryTotalCoins').textContent = this.gameState.totalCoins.toLocaleString();
    document.getElementById('summaryTotalStars').textContent = `${totalStars} / 15`;
    document.getElementById('summaryStudentName').textContent = this.student.name || 'นักเรียน ป.3';
    document.getElementById('summaryRankTitle').textContent = `🏆 ${rankTitle}`;

    // วาดเกียรติบัตรบน Canvas
    CertGen.render({
      studentName: this.student.name,
      studentId: this.student.id,
      classRoom: this.student.classRoom,
      schoolName: 'โรงเรียนประถมศึกษา',
      totalScore: this.gameState.totalScore,
      coins: this.gameState.totalCoins,
      stars: totalStars,
      rankTitle: rankTitle,
      certCode: this.gameState.certificateCode
    });

    // ส่งคะแนนอัตโนมัติหากเชื่อมต่อ Sheets ไว้
    if (Sheets.hasEndpoint()) {
      this.syncFinalScoreToSheets(true);
    }
  }

  async syncFinalScoreToSheets(isAuto = false) {
    const syncStatusEl = document.getElementById('syncStatusIndicator');
    if (syncStatusEl) {
      syncStatusEl.innerHTML = '<span class="spinner">⏳</span> กำลังส่งคะแนนไปยัง Google Sheets...';
      syncStatusEl.className = 'status-syncing';
    }

    const totalStars = this.gameState.stageStars.reduce((a, b) => a + b, 0);
    const rankTitle = this.gameState.totalScore >= 1600 ? 'ยอดนักประวัติศาสตร์น้อยระดับทองคำ' : 'นักสำรวจประวัติศาสตร์รุ่นเยาว์ดีเด่น';

    const result = await Sheets.saveFinalScore({
      studentName: this.student.name,
      studentId: this.student.id,
      classRoom: this.student.classRoom,
      stage1_score: this.gameState.stageScores[0] || 0,
      stage2_score: this.gameState.stageScores[1] || 0,
      stage3_score: this.gameState.stageScores[2] || 0,
      stage4_score: this.gameState.stageScores[3] || 0,
      stage5_score: this.gameState.stageScores[4] || 0,
      totalScore: this.gameState.totalScore,
      coins: this.gameState.totalCoins,
      stars: totalStars,
      certificateCode: this.gameState.certificateCode,
      rankTitle: rankTitle
    });

    if (syncStatusEl) {
      if (result.success && !result.offline) {
        syncStatusEl.innerHTML = '✅ บันทึกคะแนนลงใน Google Sheets สำเร็จเรียบร้อย!';
        syncStatusEl.className = 'status-success';
      } else if (result.offline) {
        syncStatusEl.innerHTML = '💾 บันทึกในเครื่องแล้ว (หากต้องการบันทึกลง Google Sheets โปรดใส่ Web App URL ในหน้าตั้งค่า)';
        syncStatusEl.className = 'status-info';
      } else {
        syncStatusEl.innerHTML = `⚠️ ${result.message}`;
        syncStatusEl.className = 'status-warning';
      }
    }
  }

  openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const urlInput = document.getElementById('settingsGasUrlInput');
    const sheetIdDisplay = document.getElementById('settingsSheetIdDisplay');

    if (urlInput) urlInput.value = CONFIG.getGasUrl();
    if (sheetIdDisplay) sheetIdDisplay.textContent = CONFIG.SPREADSHEET_ID;

    // ปุ่มทดสอบการเชื่อมต่อ
    const testBtn = document.getElementById('btnTestGasConnection');
    if (testBtn) {
      testBtn.onclick = async () => {
        const testUrl = urlInput.value.trim();
        const testResultEl = document.getElementById('settingsTestResult');
        testResultEl.innerHTML = '⏳ กำลังทดสอบการเชื่อมต่อ...';
        testResultEl.className = 'test-running';

        const res = await Sheets.testConnection(testUrl);
        if (res.success) {
          testResultEl.innerHTML = `✅ ${res.message}`;
          testResultEl.className = 'test-success';
        } else {
          testResultEl.innerHTML = `❌ ${res.message}`;
          testResultEl.className = 'test-error';
        }
      };
    }

    // ปุ่มบันทึกการตั้งค่า
    const saveBtn = document.getElementById('btnSaveSettings');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const newUrl = urlInput.value.trim();
        CONFIG.setGasUrl(newUrl);
        alert('บันทึกการตั้งค่าเรียบร้อยแล้ว!');
        modal.classList.remove('active');
      };
    }

    if (modal) modal.classList.add('active');
  }

  openHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) modal.classList.add('active');
  }

  // Effect พลุกระดาษเฉลิมฉลอง (Confetti)
  initConfetti() {
    this.confettiCanvas = document.getElementById('confettiCanvas');
    if (!this.confettiCanvas) return;
    this.confettiCtx = this.confettiCanvas.getContext('2d');

    const resize = () => {
      this.confettiCanvas.width = window.innerWidth;
      this.confettiCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  triggerConfetti() {
    if (!this.confettiCanvas || !this.confettiCtx) return;
    this.particles = [];
    const colors = ['#FF1744', '#FF9100', '#FFEA00', '#00E676', '#00B0FF', '#D500F9', '#FFD700'];

    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: Math.random() * this.confettiCanvas.width,
        y: -20 - Math.random() * 50,
        w: 8 + Math.random() * 8,
        h: 8 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: 2 + Math.random() * 5,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10
      });
    }

    if (!this.isConfettiActive) {
      this.isConfettiActive = true;
      this.animateConfetti();
    }
  }

  animateConfetti() {
    if (!this.isConfettiActive || !this.confettiCtx) return;

    this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;

      this.confettiCtx.save();
      this.confettiCtx.translate(p.x, p.y);
      this.confettiCtx.rotate((p.rotation * Math.PI) / 180);
      this.confettiCtx.fillStyle = p.color;
      this.confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      this.confettiCtx.restore();

      if (p.y > this.confettiCanvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * this.confettiCanvas.width;
      }
    }

    // หยุดหลัง 4.5 วินาที
    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animateConfetti());
    }
  }
}

// เริ่มต้นระบบเมื่อ DOM พร้อม
document.addEventListener('DOMContentLoaded', () => {
  window.Game = new HistoryGameApp();
  window.Game.init();
});
