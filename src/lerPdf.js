
import { gerarEmbeddings } from './gerarEmbeddings.js';
import { dividirEmChunks } from './chunking.js';
import { PDFParse } from 'pdf-parse';
import { salvarChunks } from './salvarChunks.js';

const caminhoPDF = './documentos/apostila.pdf';

const parser = new PDFParse({
  url: caminhoPDF,
});

try {
  // 1. Ler o PDF
  const resultado = await parser.getText();

  // 2. Dividir o texto em chunks
  const chunks = dividirEmChunks(resultado.text);

  console.log('Quantidade de chunks:', chunks.length);

  // 3. Gerar embeddings
  const dados = await gerarEmbeddings(chunks);

  console.log('\nProcessamento concluído!');
  console.log('Total de embeddings:', dados.length);
  console.log('Dimensões do primeiro embedding:', dados[0].embedding.length);

  // 4. Salvar no Neo4j
  const totalSalvo = await salvarChunks(dados, 'apostila.pdf');

  console.log('\nSalvamento concluído!');
  console.log('Chunks salvos no Neo4j:', totalSalvo);

} catch (error) {
  console.error('Erro no processamento:', error.message);
} finally {
  await parser.destroy();
}
