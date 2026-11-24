// =========================================================
// 1. HTML ელემენტების წამოღება DOM-იდან
// =========================================================
const progressText = document.getElementById("progress-text");
const scoreDisplay = document.getElementById("score-display");
const statusBox = document.getElementById("status-box");
const quizContainer = document.getElementById("quiz-container");
const categoryBadge = document.getElementById("category-badge");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const nextBtn = document.getElementById("next-btn");
const resultContainer = document.getElementById("result-container");
const finalScoreText = document.getElementById("final-score-text");
const restartBtn = document.getElementById("restart-btn");

// =========================================================
// 2. თამაშის მდგომარეობის (State) ცვლადები
// =========================================================
let questions = [];          // API-დან წამოღებული კითხვების მასივი
let currentQuestionIndex = 0; // მიმდინარე კითხვის ნომერი (ინდექსი)
let score = 0;               // დაგროვებული ქულა

// დამხმარე ფუნქცია: ასწორებს API-დან მოსულ სპეციალურ HTML სიმბოლოებს (მაგ: &quot; -> ")
function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// =========================================================
// 3. კითხვების წამოღება API-დან (fetch + async/await + try/catch)
// =========================================================
async function fetchQuestions() {
    // საწყისი ეკრანის მომზადება
    statusBox.classList.remove("hidden");
    statusBox.textContent = "⏳ კითხვები იტვირთება ინტერნეტიდან...";
    quizContainer.classList.add("hidden");
    resultContainer.classList.add("hidden");

    try {
        // ვაგზავნით მოთხოვნას უფასო ვიქტორინის API-ზე (5 კითხვა, მრავალვარიანტიანი)
        const response = await fetch("https://opentdb.com");

        // ვამოწმებთ, წარმატებით გვიპასუხა თუ არა სერვერმა
        if (!response.ok) {
            throw new Error("სერვერთან დაკავშირება ვერ მოხერხდა");
        }

        // მიღებული პასუხის გადაყვანა JSON ფორმატში
        const data = await response.json();

        // ვინახავთ კითხვებს მასივში და ვანულებთ ქულას
        questions = data.results;
        currentQuestionIndex = 0;
        score = 0;
        scoreDisplay.textContent = score;

        // ვმალავთ ჩატვირთვის ტექსტს და ვაჩენთ ქვიზს
        statusBox.classList.add("hidden");
        quizContainer.classList.remove("hidden");

        // ვაჩვენებთ პირველ კითხვას
        showQuestion();

    } catch (error) {
        // თუ ინტერნეტი გაითიშა ან API-მ შეცდომა დააბრუნა, გამოვაჩენთ მესიჯს
        console.error("შეცდომა:", error);
        statusBox.textContent = "❌ კითხვების ჩატვირთვა ვერ მოხერხდა. შეამოწმეთ ინტერნეტი და სცადეთ თავიდან.";
    }
}

// =========================================================
// 4. მიმდინარე კითხვისა და პასუხების გამოტანა ეკრანზე
// =========================================================
function showQuestion() {
    // ვასუფთავებთ წინა კითხვის პასუხებს და ვმალავთ "შემდეგი" ღილაკს
    answersContainer.innerHTML = "";
    nextBtn.classList.add("hidden");

    // ვიღებთ მიმდინარე კითხვის ობიექტს
    const currentQuestion = questions[currentQuestionIndex];

    // ვაახლებთ პროგრესს, კატეგორიას და კითხვის ტექსტს (textContent)
    progressText.textContent = `კითხვა ${currentQuestionIndex + 1} / ${questions.length}`;
    categoryBadge.textContent = decodeHTML(currentQuestion.category);
    questionText.textContent = decodeHTML(currentQuestion.question);

    // ვაერთიანებთ სწორ და არასწორ პასუხებს ერთ მასივში და შემთხვევითად ვურევთ
    const allAnswers = [
        ...currentQuestion.incorrect_answers,
        currentQuestion.correct_answer
    ].sort(() => Math.random() - 0.5);

    // თითოეული პასუხისთვის ვქმნით ღილაკს (createElement + appendChild)
    allAnswers.forEach(answer => {
        const button = document.createElement("button");
        button.textContent = decodeHTML(answer);
        button.className = "w-full text-left bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 transition";

        // ღილაკზე დაჭერის მოსმენა (addEventListener)
        button.addEventListener("click", () => selectAnswer(button, answer, currentQuestion.correct_answer));

        answersContainer.appendChild(button);
    });
}

// =========================================================
// 5. პასუხის შემოწმება და ქულის დათვლა
// =========================================================
function selectAnswer(selectedBtn, chosenAnswer, correctAnswer) {
    const isCorrect = chosenAnswer === correctAnswer;

    // ვთიშავთ ყველა ღილაკს, რომ მომხმარებელმა მეორედ ვეღარ დააჭიროს
    const allButtons = answersContainer.querySelectorAll("button");
    allButtons.forEach(btn => {
        btn.disabled = true;
        // სწორ პასუხს ვღებავთ მწვანედ
        if (btn.textContent === decodeHTML(correctAnswer)) {
            btn.classList.remove("bg-slate-900", "border-slate-700");
            btn.classList.add("bg-emerald-600/30", "border-emerald-500", "text-emerald-200");
        }
    });

    if (isCorrect) {
        // თუ პასუხი სწორია, ვზრდით ქულას
        score++;
        scoreDisplay.textContent = score;
    } else {
        // თუ არასწორია, არჩეულ ღილაკს ვღებავთ წითლად
        selectedBtn.classList.remove("bg-slate-900", "border-slate-700");
        selectedBtn.classList.add("bg-rose-600/30", "border-rose-500", "text-rose-200");
    }

    // ვაჩენთ "შემდეგი კითხვის" ღილაკს
    nextBtn.classList.remove("hidden");
}

// =========================================================
// 6. საბოლოო შედეგის ჩვენება
// =========================================================
function showResult() {
    quizContainer.classList.add("hidden");
    resultContainer.classList.remove("hidden");
    progressText.textContent = "დასრულებულია";
    finalScoreText.textContent = `თქვენ სწორად უპასუხეთ ${questions.length}-დან ${score} კითხვას!`;
}

// =========================================================
// 7. ღილაკების Event Listeners და თამაშის დაწყება
// =========================================================
nextBtn.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
});

restartBtn.addEventListener("click", fetchQuestions);

// გვერდის ჩატვირთვისთანავე ვიწყებთ კითხვების წამოღებას
fetchQuestions();
