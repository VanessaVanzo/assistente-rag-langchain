import { app } from './grafo.js';
import driver from './config/database.js';

try {
    // const resultado = await app.invoke({
    //     pergunta: 'O que são embeddings e para que servem?',
    //     trechos: [],
    //     resposta: '',
    //     tentativas: 0,
    //     respostaAprovada: false,
    // feedbackValidacao: '',

    // });

    // console.log('\nResposta gerada:');
    // console.log(resultado.resposta);

    const representacao = await app.getGraphAsync();

    console.log('\nEstrutura do grafo, visualizar no site:');
    console.log('\nhttps://mermaid.live/edit?utm_source=chatgpt.com');


    console.log(representacao.drawMermaid());

    const fluxo = await app.stream({
        pergunta: 'O que são embeddings e para que servem?',
        trechos: [],
        resposta: '',
        tentativas: 0,
        respostaAprovada: false,
        feedbackValidacao: '',

    });

    for await (const etapa of fluxo) {

        if (etapa.buscarTrechos) {
            console.log('\nTrechos encontrados:');
            console.log(etapa.buscarTrechos.trechos);
        }

        if (etapa.gerarResposta) {
            console.log('\nResposta gerada:');
            console.log(etapa.gerarResposta.resposta);
        }

        if (etapa.validarResposta) {
            console.log('\nResultado da validação:');

            console.log(
                etapa.validarResposta.respostaAprovada
                    ? 'Resposta aprovada!'
                    : 'Resposta reprovada!'
            );

            console.log(
                'Feedback:',
                etapa.validarResposta.feedbackValidacao
            );
        }
    }

} catch (erro) {
    console.error('Erro ao executar o grafo:', erro);

} finally {
    await driver.close();
}