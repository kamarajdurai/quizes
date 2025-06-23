const quizData = [
  { question: "Which is a JS framework?", a: "Laravel", b: "Django", c: "React", d: "Flask", correct: "c" },
  { question: "HTML stands for?", a: "HyperText...", b: "Home Tool...", c: "Hyper Trainer...", d: "HighText...", correct: "a" },
  { question: "Used for styling web pages?", a: "HTML", b: "jQuery", c: "CSS", d: "XML", correct: "c" }
];

let current = 0, score = 0, selected = "", timer, timeLeft = 15;
let userInfo = {};

// 🔊 Sound Effects
const clickS = new Audio('sounds/click.mp3');
clickS.preload = 'auto';
clickS.load();

const qEl = document.getElementById("question"),
      optBtns = document.querySelectorAll(".option"),
      nextBtn = document.getElementById("nextBtn"),
      progressBar = document.getElementById("progressBar"),
      quizDiv = document.getElementById("quiz"),
      timerEl = document.getElementById("timer");

function startQuiz() {
  const name = document.getElementById("userName").value.trim();
  const reg = document.getElementById("regNumber").value.trim();
  const year = document.getElementById("courseYear").value.trim();
  const course = document.getElementById("course").value.trim();

  if (!name || !reg || !course || !year) {
    return alert("Please fill in all fields.");
  }

  userInfo = { name, regNumber: reg, course: `${year} ${course}` };
  document.getElementById("userForm").style.display = "none";
  document.getElementById("quizBox").style.display = "block";
  loadQuestion();
}

function loadQuestion() {
  const q = quizData[current];
  ["a", "b", "c", "d"].forEach(id => document.getElementById(id).innerText = q[id]);
  qEl.innerText = q.question;
  progressBar.style.width = `${(current / quizData.length) * 100}%`;
  optBtns.forEach(b => b.classList.remove("selected"));
  selected = "";
  resetTimer();
  startTimer();
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 15;
  timerEl.textContent = timeLeft;
}

function startTimer() {
  timer = setInterval(() => {
    timerEl.textContent = --timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("⏰ Time's up!");
      nextBtn.click();
    }
  }, 1000);
}

optBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    optBtns.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selected = btn.id;
    clickS.play(); // 🔊 Play click on option select
  });
});

nextBtn.addEventListener("click", () => {
  clickS.play(); // 🔊 Play click on next
  clearInterval(timer);
  if (!selected) return alert("Select an answer!");
  if (selected === quizData[current].correct) score++;
  current++;
  current < quizData.length ? setTimeout(loadQuestion, 300) : setTimeout(showResult, 400);
});

function showResult() {
  fetch("save_score.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: userInfo.name,
      regNumber: userInfo.regNumber,
      course: userInfo.course,
      score
    })
  });

  launchConfetti();
  quizDiv.innerHTML = `
    <div class="result">
      <h2>🎉 Quiz Completed!</h2>
      <p><strong>${userInfo.name}</strong> — ${userInfo.course}</p>
      <p>You scored <strong>${score}</strong> out of ${quizData.length}</p>
      <button onclick="clickS.play(); location.reload()">Restart Quiz</button>
      <button onclick="clickS.play(); downloadPDF()">Download PDF</button>
      <button onclick="clickS.play(); loadLeaderboard()">View Leaderboard</button>
    </div>
    <div id="leaderboard" class="leaderboard" style="display:none;"></div>
  `;
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Quiz Result", 20, 20);
  doc.setFontSize(12);
  doc.text(`Name: ${userInfo.name}`, 20, 35);
  doc.text(`Register Number: ${userInfo.regNumber}`, 20, 45);
  doc.text(`Course: ${userInfo.course}`, 20, 55);
  doc.text(`Score: ${score}/${quizData.length}`, 20, 65);
  doc.text(`Date: ${new Date().toLocaleString()}`, 20, 75);
  doc.save("quiz_result.pdf");
}

function loadLeaderboard() {
  fetch("get_leaderboard.php")
    .then(res => res.json())
    .then(data => {
      const lb = document.getElementById("leaderboard");
      lb.style.display = "block";
      lb.innerHTML = `<h3>🏆 Leaderboard</h3><ol>` + data.map((d, i) => {
        const r = i + 1;
        const medal = r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `#${r}`;
        return `<li>${medal} ${d.name} — ${d.score}</li>`;
      }).join("") + `</ol>`;
    });
}

function launchConfetti() {
  const c = document.getElementById("confettiCanvas"), ctx = c.getContext("2d");
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const pieces = Array.from({ length: 150 }).map(() => ({
    x: Math.random() * c.width,
    y: Math.random() * c.height - c.height,
    size: Math.random() * 8 + 4,
    speed: Math.random() * 3 + 2,
    color: `hsl(${Math.random() * 360},100%,50%)`,
    angle: Math.random() * 2 * Math.PI
  }));
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    pieces.forEach(p => {
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
      ctx.fill();
    });
  }
  function update() {
    pieces.forEach(p => {
      p.y += p.speed;
      if (p.y > c.height) p.y = -10;
      p.x += Math.sin(p.angle);
    });
  }
  (function loop() {
    draw(); update(); requestAnimationFrame(loop);
  })();
  setTimeout(() => c.remove(), 5000);
}
