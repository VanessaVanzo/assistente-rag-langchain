
import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { buscarTrechos } from './buscarTrechos.js';
import { gerarResposta, validarResposta } from './responder.js';


const EstadoRAG = Annotation.Root({
    pergunta: Annotation(),
    trechos: Annotation(),
    resposta: Annotation(),
    tentativas: Annotation(),
    respostaAprovada: Annotation(),
    feedbackValidacao: Annotation(),

});

// Nó responsável por buscar os trechos no Neo4j
async function buscarTrechosNode(estado) {
    const trechos = await buscarTrechos(estado.pergunta);

    return {
        trechos,
    };
}

// Nó responsável por gerar a resposta
async function gerarRespostaNode(estado) {
    const resposta = await gerarResposta(
        estado.pergunta,
        estado.trechos,
        estado.feedbackValidacao
    );

    return {
        resposta,
        tentativas: estado.tentativas + 1,
    };
}

async function validarRespostaNode(estado) {
    console.log('Validando resposta...');

    const resultado = await validarResposta(
        estado.pergunta,
        estado.trechos,
        estado.resposta
    );

    console.log('Resultado da validação:', resultado.aprovado);
    console.log('Feedback:', resultado.feedback);

    return {
        respostaAprovada: resultado.aprovado,
        feedbackValidacao: resultado.feedback,
    };
}

async function informarSemTrechosNode(estado) {
    return {
        resposta: 'Não encontrei informações suficientes na apostila para responder à sua pergunta.',
    };
}

// Decide qual caminho o grafo deve seguir
function decidirProximoPasso(estado) {
    if (estado.trechos.length > 0) {
        return 'gerarResposta';
    }

    return 'informarSemTrechos';
}

function decidirAposValidacao(estado) {
    if (estado.respostaAprovada) {
        return END;
    }

    if (estado.tentativas < 3) {
        return 'gerarResposta';
    }

    return END;
}

// Construção do grafo
const grafo = new StateGraph(EstadoRAG)
    .addNode('buscarTrechos', buscarTrechosNode)
    .addNode('gerarResposta', gerarRespostaNode)
    .addNode('informarSemTrechos', informarSemTrechosNode)
    .addNode('validarResposta', validarRespostaNode)

    .addEdge(START, 'buscarTrechos')

    .addConditionalEdges( 'buscarTrechos',decidirProximoPasso, ['gerarResposta', 'informarSemTrechos'])

    .addEdge('gerarResposta', 'validarResposta')

    .addConditionalEdges('validarResposta', decidirAposValidacao,['gerarResposta', END]
)

    .addEdge('informarSemTrechos', END);

// Compila o grafo
export const app = grafo.compile();