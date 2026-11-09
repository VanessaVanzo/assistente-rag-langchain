
import 'dotenv/config';
import { ChatOpenRouter } from '@langchain/openrouter';

const MODELO = 'openrouter/free';

// Inicializa o modelo de linguagem do OpenRouter
const modelo = new ChatOpenRouter({
    model: MODELO,
    temperature: 0,
});

export async function gerarResposta(pergunta, trechos, feedbackValidacao = '') {
    const contexto = trechos
        .map((trecho, indice) => `Trecho ${indice + 1}:\n${trecho}`)
        .join('\n\n');

    const resposta = await modelo.invoke([
        {
            role: 'system',
            content: `
                    Você é um tutor especializado no conteúdo da apostila fornecida.

                    Suas responsabilidades são:
                    - Explicar os conceitos de maneira simples e didática.
                    - Utilizar exemplos práticos sempre que possível.
                    - Organizar as respostas em tópicos quando isso facilitar a compreensão.
                    - Explicar termos técnicos com linguagem acessível.
                    - Responder em português do Brasil.

                    Regras importantes:
                    - Utilize os trechos da apostila como fonte principal.
                    - Não invente informações nem atribua à apostila algo que não esteja nos trechos.
                    - Se a informação não estiver disponível no contexto, diga claramente que não encontrou informações suficientes na apostila.
                    - Se utilizar conhecimentos complementares para explicar um conceito, deixe claro que são explicações adicionais.
                    - Seja claro, paciente e objetivo.
                    - Escreva exclusivamente em português do Brasil.
                    - Não misture idiomas na mesma resposta.
                    `,
        },
        {
            role: 'user',
            content: `
                Pergunta: ${pergunta}

                Contexto:
                ${contexto}

                Feedback da validação anterior:
                ${feedbackValidacao || 'Esta é a primeira tentativa. Não há feedback anterior.'}

                Se houver feedback, utilize-o para corrigir a resposta.
            `,
        },
    ]);

    return resposta.content;
}



export async function validarResposta(pergunta, trechos, resposta) {
    const contexto = trechos.join('\n\n');

    const avaliacao = await modelo.invoke([
        {
            role: 'system',
            content: `
                Você é um avaliador de respostas de um sistema RAG.

                Analise se a resposta gerada responde corretamente
                à pergunta e se está fundamentada nos trechos da apostila.

                Considere aprovada quando:
                - Responder à pergunta.
                - Estiver de acordo com os trechos fornecidos.
                - Não apresentar informações inventadas ou contraditórias.

                Se estiver aprovada, informe que não há correções necessárias.

                Se estiver reprovada, explique objetivamente
                o que precisa ser corrigido.

                Responda obrigatoriamente neste formato:

                STATUS: APROVADA ou REPROVADA
                FEEDBACK: motivo da avaliação ou correção necessária.
            `,
        },
        {
            role: 'user',
            content: `
                Pergunta: ${pergunta}

                Trechos da apostila:
                ${contexto}

                Resposta gerada:
                ${resposta}
            `,
        },
    ]);

    const conteudo = avaliacao.content.trim();

    const status = conteudo.match(
        /STATUS:\s*(APROVADA|REPROVADA)/i
    )?.[1]?.toUpperCase();

    const feedback = conteudo.match(
        /FEEDBACK:\s*([\s\S]*)/i
    )?.[1]?.trim() ?? '';

    return {
        aprovado: status === 'APROVADA',
        feedback,
    };
}


