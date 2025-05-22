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
    return shuffledQuestions.slice(0, 6); // Agora são 6 perguntas
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

    if (correct) {
        questionCorrects++;
    } else {
        errors++;
        if (errors <= 2) {
            // Adiciona mais uma pergunta ao conjunto se o limite de erros for atingido
            const newQuestions = shuffleArray(question).slice(0, 1);
            limitedQuestions = [...limitedQuestions, ...newQuestions];
        }
    }

    moveSnail(correct);

    if (questionAtual < limitedQuestions.length - 1) {
        questionAtual++;
        loadQuestion();
    } else {
        // Finaliza o jogo ao terminar as perguntas
        if (snailPosition >= maxSnailPosition) {
            finish(true);
        } else {
            finish(false);
        }
    }
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