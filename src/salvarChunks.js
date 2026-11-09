
import driver from './config/database.js';

export async function salvarChunks(dados, nomeDocumento) {
  const session = driver.session();

  try {
    const resultado = await session.executeWrite(async (tx) => {
      await tx.run(
        `
        MATCH (d:Documento {nome: $nomeDocumento})
        DETACH DELETE d
        `,
        { nomeDocumento }
      );

      const resposta = await tx.run(
        `
        CREATE (d:Documento {nome: $nomeDocumento})

        WITH d
        UNWIND $chunks AS item

        CREATE (c:Chunk {
          texto: item.texto,
          embedding: item.embedding
        })

        CREATE (d)-[:CONTEM]->(c)

        RETURN count(c) AS total
        `,
        {
          chunks: dados,
          nomeDocumento,
        }
      );

      return resposta.records[0].get('total').toNumber();
    });

    return resultado;

  } finally {
    await session.close();
  }
}
