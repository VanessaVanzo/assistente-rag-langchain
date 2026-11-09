import { gerarResposta } from './responder.js';
import { pipeline } from '@huggingface/transformers';
import driver from './config/database.js';

const modelo = 'Xenova/all-MiniLM-L6-v2';

const gerarEmbedding = await pipeline(
    'feature-extraction',
    modelo
);

// Pergunta que queremos fazer à apostila
const pergunta = 'O que são embeddings e para que servem?';

// Transformar a pergunta em vetor
const resultado = await gerarEmbedding(pergunta, {
    pooling: 'mean',
    normalize: true,
});

const embeddingPergunta = resultado.tolist()[0];

const session = driver.session();

try {
    const resultadoBusca = await session.run(
        `
    CALL db.index.vector.queryNodes(
      'chunk_embedding_index',
      5,
      $embedding
    )
    YIELD node, score

    MATCH (d:Documento)-[:CONTEM]->(node)

    RETURN
      d.nome AS documento,
      node.texto AS texto,
      score

    ORDER BY score DESC
    `,
        {
            embedding: embeddingPergunta,
        }
    );

    console.log('Pergunta:', pergunta);
    console.log('\nTrechos encontrados:\n');

    const trechos = resultadoBusca.records.map(registro =>
        registro.get('texto')
    );

    for (const trecho of trechos) {
        console.log(trecho);
        console.log('-----------------------------');
    }

    const resposta = await gerarResposta(pergunta, trechos);

    console.log('\nResposta do assistente:\n');
    console.log(resposta);

} catch (error) {
    console.error('Erro na busca:', error.message);
} finally {
    await session.close();
    await driver.close();
}
