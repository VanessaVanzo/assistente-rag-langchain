
import { pipeline } from '@huggingface/transformers';

const modelo = 'Xenova/all-MiniLM-L6-v2';

const gerarEmbedding = await pipeline(
  'feature-extraction',
  modelo
);

export async function gerarEmbeddings(chunks) {
  const resultados = [];

  for (let i = 0; i < chunks.length; i++) {
    const resultado = await gerarEmbedding(chunks[i], {
      pooling: 'mean',
      normalize: true,
    });

    const embedding = resultado.tolist()[0];

    resultados.push({
      texto: chunks[i],
      embedding,
    });

    console.log(`Embedding ${i + 1} de ${chunks.length} gerado.`);
  }

  return resultados;
}
