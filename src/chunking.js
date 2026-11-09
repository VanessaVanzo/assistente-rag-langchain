
export function dividirEmChunks(texto, tamanho = 500, sobreposicao = 100) {
  const chunks = [];

  let inicio = 0;

  while (inicio < texto.length) {
    let fim = inicio + tamanho;

    if (fim < texto.length) {
      const ultimoEspaco = texto.lastIndexOf(' ', fim);

      if (ultimoEspaco > inicio) {
        fim = ultimoEspaco;
      }
    }

    const trecho = texto.slice(inicio, fim).trim();

    if (trecho) {
      chunks.push(trecho);
    }

    inicio = fim - sobreposicao;

    if (inicio < 0) {
      inicio = 0;
    }
  }

  return chunks;
}
