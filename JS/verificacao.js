import question from "../JSON/perguntas.js"; // Importa o conjunto de perguntas de um arquivo JSON

// Seleciona os elementos HTML necessários para manipulação
const questionElement = document.querySelector(".question");
const answers = document.querySelector(".answers");
const spnQtd = document.querySelector(".qntd");
const textFinish = document.querySelector(".finish span");
const content = document.querySelector(".content");
const contentFinish = document.querySelector(".finish");
const btnRestart = document.querySelector(".finish button");
const snail = document.querySelector(".snail");
const track = document.querySelector(".track");

// Variáveis de estado do jogo
let snailPosition = 0; // Posição inicial do caracol (em pixels)
let hasMoved = false; // Indica se o caracol já saiu da posição inicial
let errors = 0; // Contador de erros do usuário

// Função para embaralhar um array usando o algoritmo de Fisher-Yates
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Função para selecionar e limitar o número de perguntas
function maxima(questions) {
    const shuffledQuestions = shuffleArray(questions);
    return shuffledQuestions.slice(0, 5); // Agora são 6 perguntas
}

// Inicializa o conjunto de perguntas limitadas
let limitedQuestions = maxima(question);

// Variáveis para rastrear o progresso do jogo
let questionAtual = 0;
let questionCorrects = 0;

// Calcula a distância máxima que o caracol pode andar (largura da pista - largura do caracol)
const trackWidth = track.offsetWidth;
const snailWidth = snail.offsetWidth;
const maxSnailPosition = trackWidth - snailWidth;

// Distância que o caracol se move por pergunta
const snailStep = maxSnailPosition / limitedQuestions.length;

// Função para mover o caracol
function moveSnail(correct) {
    if (correct) {
        snailPosition += snailStep;
        hasMoved = true;
    } else if (snailPosition > 0) {
        snailPosition -= snailStep;
    }

    // Impede que o caracol ultrapasse os limites da pista
    if (snailPosition > maxSnailPosition) {
        snailPosition = maxSnailPosition;
    }
    if (snailPosition < 0) {
        snailPosition = 0;
    }

    snail.style.transform = `translateX(${snailPosition}px)`;
}

// Função chamada ao responder uma pergunta


function nextQuestion(e) {
    const correct = e.target.getAttribute("data-correct") === "true";
    const allButtons = document.querySelectorAll(".answer");

    // Desabilita todos os botões
    allButtons.forEach(btn => btn.disabled = true);

    // Marca visualmente a resposta
    if (correct) {
        e.target.classList.add("correct");
    } else {
        e.target.classList.add("incorrect");
        // Destaca a resposta correta
        allButtons.forEach(btn => {
            if (btn.getAttribute("data-correct") === "true") {
                btn.classList.add("correct");
            }
        });
    }

    // Adiciona perguntas extras se necessário
    if (!correct) {
        errors++;
        if (errors <= 1) {
            const newQuestions = shuffleArray(question).slice(0, 2);
            limitedQuestions = [...limitedQuestions, ...newQuestions];
        }
    }

    moveSnail(correct);

    // Cria ou seleciona o parágrafo de explicação
    let explanationDiv = document.getElementById("explanation-div");
    if (!explanationDiv) {
        explanationDiv = document.createElement("div");
        explanationDiv.id = "explanation-div";
        explanationDiv.style.marginTop = "10px";
        explanationDiv.style.background = "#e3f7e8";
        explanationDiv.style.borderLeft = "5px solid #00b894";
        explanationDiv.style.padding = "12px";
        explanationDiv.style.borderRadius = "8px";
        explanationDiv.style.color = "#222";
        explanationDiv.style.fontSize = "1.1rem";
        explanationDiv.style.display = "flex";
        explanationDiv.style.alignItems = "center";
        explanationDiv.style.justifyContent = "space-between";
        answers.parentNode.insertBefore(explanationDiv, answers.nextSibling);
    }

    const item = limitedQuestions[questionAtual];
    explanationDiv.innerHTML = `
        <span>${item.explanation ? item.explanation : "Sem explicação disponível."}</span>
        <button id="ok-explanation-btn" style="
            margin-left: 16px;
            background: #008CCC;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 6px 18px;
            font-size: 1rem;
            cursor: pointer;
        ">OK</button>
    `;
    explanationDiv.style.display = "flex";

    document.getElementById("ok-explanation-btn").onclick = () => {
        // Só soma o ponto aqui, após o OK
        if (correct) {
            questionCorrects++;
        }
        explanationDiv.style.display = "none";
        if (questionAtual < limitedQuestions.length - 1) {
            questionAtual++;
            loadQuestion();
        } else {
            if (snailPosition >= maxSnailPosition) {
                finish(true);
            } else {
                finish(false);
            }
        }
    };
}

// Função para carregar a pergunta atual
function loadQuestion() {
    spnQtd.innerHTML = `${questionAtual + 1}/${limitedQuestions.length}`;
    const item = limitedQuestions[questionAtual];
    answers.innerHTML = "";
    questionElement.innerHTML = item.question;

    item.answers.forEach((answer) => {
        const div = document.createElement("div");
        div.innerHTML = `<button class="answer" data-correct="${answer.correct}">
            ${answer.option}
        </button>`;
        answers.appendChild(div);
    });

    document.querySelectorAll(".answer").forEach((item) => {
        item.addEventListener("click", nextQuestion);
    });
}

// Função chamada ao finalizar o jogo
function finish(won) {
    if (won) {
        textFinish.innerHTML = `Parabéns, você ganhou! O caracol chegou ao final da pista!`;
    } else {
        textFinish.innerHTML = `Game Over! Você acertou ${questionCorrects} de ${limitedQuestions.length} questões.`;
    }
    content.style.display = "none";
    contentFinish.style.display = "flex";
}

// Função chamada ao perder o jogo
function gameOver() {
    textFinish.innerHTML = `Game Over! O caracol não conseguiu avançar. Você acertou ${questionCorrects} de ${limitedQuestions.length}.`;
    content.style.display = "none";
    contentFinish.style.display = "flex";
}

// Evento de clique no botão de reinício
btnRestart.onclick = () => {
    window.location.reload();
};

// Inicializa o jogo
loadQuestion();