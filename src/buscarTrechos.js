
import { pipeline } from '@huggingface/transformers';
import driver from './config/database.js';

const modelo = 'Xenova/all-MiniLM-L6-v2';

// Carrega o modelo de embeddings
const gerarEmbedding = await pipeline(
  'feature-extraction',
  modelo
);

export async function buscarTrechos(pergunta) {
  // 1. Transformar a pergunta em vetor
  const resultado = await gerarEmbedding(pergunta, {
    pooling: 'mean',
    normalize: true,
  });

  const embeddingPergunta = resultado.tolist()[0];

  // 2. Buscar os chunks semelhantes no Neo4j
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

    // 3. Retornar somente os textos encontrados
    return resultadoBusca.records.map(registro =>
      registro.get('texto')
    );

  } finally {
    await session.close();
  }
}
