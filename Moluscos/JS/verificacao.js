
import question from "../JSON/perguntas.js"; // Importa o conjunto de perguntas de um arquivo JSON

// Seleciona os elementos HTML necessários para manipulação
const questionElement = document.querySelector(".question"); // Elemento onde a pergunta será exibida
const answers = document.querySelector(".answers"); // Contêiner para as respostas
const spnQtd = document.querySelector(".qntd"); // Elemento que exibe o número da pergunta atual
const textFinish = document.querySelector(".finish span"); // Elemento que exibe a mensagem de finalização
const content = document.querySelector(".content"); // Contêiner principal do jogo
const contentFinish = document.querySelector(".finish"); // Contêiner exibido ao finalizar o jogo
const btnRestart = document.querySelector(".finish button"); // Botão para reiniciar o jogo
const snail = document.querySelector(".snail"); // Elemento visual do caracol
const track = document.querySelector(".track"); // Contêiner da pista do caracol
const finishLine = document.querySelector(".finish-line"); // Linha de chegada na pista

// Variáveis de estado do jogo
let snailPosition = 0; // Posição inicial do caracol (em pixels)
let hasMoved = false; // Indica se o caracol já saiu da posição inicial
let errors = 0; // Contador de erros do usuário

// Função para embaralhar um array usando o algoritmo de Fisher-Yates
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Gera um índice aleatório
        [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos de posição
    }
    return array; // Retorna o array embaralhado
}

// Função para selecionar e limitar o número de perguntas
function maxima(questions) {
    const shuffledQuestions = shuffleArray(questions); // Embaralha as perguntas
    return shuffledQuestions.slice(0, 7); // Retorna as primeiras 7 perguntas
}

// Inicializa o conjunto de perguntas limitadas
let limitedQuestions = maxima(question);

// Variáveis para rastrear o progresso do jogo
let questionAtual = 0; // Índice da pergunta atual
let questionCorrects = 0; // Contador de respostas corretas

// Calcula a distância que o caracol deve se mover com base no número de perguntas
const finishLinePosition = finishLine.getBoundingClientRect().left - track.getBoundingClientRect().left; // Distância total até a linha de chegada
const snailStep = finishLinePosition / limitedQuestions.length; // Distância que o caracol se move por pergunta

// Função para mover o caracol
function moveSnail(correct) {
    if (correct) {
        snailPosition += snailStep; // Move o caracol para frente se a resposta estiver correta
        hasMoved = true; // Marca que o caracol já saiu da posição inicial
    } else if (snailPosition > 0) {
        snailPosition -= snailStep; // Move o caracol para trás se a resposta estiver errada
    }

    // Atualiza a posição do caracol visualmente
    snail.style.transform = `translateX(${snailPosition}px)`;
}

// Função chamada ao responder uma pergunta
function nextQuestion(e) {
    const correct = e.target.getAttribute("data-correct") === "true"; // Verifica se a resposta está correta

    if (correct) {
        questionCorrects++; // Incrementa o contador de respostas corretas
    } else {
        errors++; // Incrementa o contador de erros
        if (errors <= 2) {
            // Adiciona mais duas perguntas ao conjunto se o limite de erros for atingido
            const newQuestions = shuffleArray(question).slice(0, 2);
            limitedQuestions = [...limitedQuestions, ...newQuestions];
        }
    }

    moveSnail(correct); // Move o caracol com base na resposta

    if (questionAtual < limitedQuestions.length - 1) {
        questionAtual++; // Avança para a próxima pergunta
        loadQuestion(); // Carrega a próxima pergunta
    } else {
        // Finaliza o jogo ao terminar as perguntas
        if (snailPosition >= finishLinePosition) {
            finish(true); // Exibe mensagem de vitória
        } else {
            finish(false); // Exibe mensagem de derrota
        }
    }
}

// Função para carregar a pergunta atual
function loadQuestion() {
    spnQtd.innerHTML = `${questionAtual + 1}/${limitedQuestions.length}`; // Atualiza o contador de perguntas
    const item = limitedQuestions[questionAtual]; // Obtém a pergunta atual
    answers.innerHTML = ""; // Limpa as respostas anteriores
    questionElement.innerHTML = item.question; // Exibe a pergunta atual

    // Cria os botões de resposta
    item.answers.forEach((answer) => {
        const div = document.createElement("div");

        div.innerHTML = `<button class="answer" data-correct="${answer.correct}">
            ${answer.option}
        </button>`;

        answers.appendChild(div); // Adiciona o botão ao contêiner de respostas
    });

    // Adiciona o evento de clique a cada botão de resposta
    document.querySelectorAll(".answer").forEach((item) => {
        item.addEventListener("click", nextQuestion);
    });
}

// Função chamada ao finalizar o jogo
function finish(won) {
    if (won) {
        textFinish.innerHTML = `Parabéns, você ganhou! O caracol chegou à linha de chegada!`; // Mensagem de vitória
    } else {
        textFinish.innerHTML = `Game Over! Você acertou ${questionCorrects} de ${limitedQuestions.length} questões.`; // Mensagem de derrota
    }
    content.style.display = "none"; // Esconde o conteúdo principal
    contentFinish.style.display = "flex"; // Exibe a tela de finalização
}

// Função chamada ao perder o jogo
function gameOver() {
    textFinish.innerHTML = `Game Over! O caracol não conseguiu avançar. Você acertou ${questionCorrects} de ${limitedQuestions.length}.`; // Mensagem de derrota
    content.style.display = "none"; // Esconde o conteúdo principal
    contentFinish.style.display = "flex"; // Exibe a tela de finalização
}

// Evento de clique no botão de reinício
btnRestart.onclick = () => {
    content.style.display = "flex"; // Exibe o conteúdo principal
    contentFinish.style.display = "none"; // Esconde a tela de finalização

    // Reinicia as variáveis do jogo
    questionAtual = 0;
    questionCorrects = 0;
    snailPosition = 0; // Reseta a posição do caracol
    hasMoved = false; // Reseta o estado de movimento do caracol
    errors = 0; // Reseta o contador de erros
    snail.style.transform = `translateX(${snailPosition}px)`; // Reseta a posição visual do caracol
    limitedQuestions = maxima(question); // Reinicia as perguntas com novas perguntas embaralhadas
    loadQuestion(); // Carrega a primeira pergunta
};

// Carrega a primeira pergunta ao iniciar o jogo
loadQuestion();