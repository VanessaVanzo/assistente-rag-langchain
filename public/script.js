
const formulario = document.getElementById('formulario');
const campoPergunta = document.getElementById('pergunta');
const mensagens = document.getElementById('mensagens');

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const pergunta = campoPergunta.value.trim();

    if (!pergunta) return;

    // Mostrar a pergunta do usuário
    adicionarMensagem(pergunta, 'usuario');

    campoPergunta.value = '';

    // Mostrar indicador de processamento
    const carregando = adicionarMensagem('Pensando...', 'assistente');
    carregando.classList.add('carregando');

    try {
        // Enviar a pergunta para o backend
        const resposta = await fetch('/perguntar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pergunta }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || 'Erro ao consultar o assistente.');
        }

        // Mostrar a resposta do assistente
        carregando.remove();
        adicionarMensagem(dados.resposta, 'assistente');

    } catch (erro) {
        carregando.remove();
        adicionarMensagem(
            'Não foi possível obter uma resposta. Tente novamente.',
            'assistente'
        );

        console.error(erro);

    }
});

function adicionarMensagem(texto, tipo) {
    const mensagem = document.createElement('div');

    mensagem.classList.add('mensagem', tipo);

    if (tipo === 'assistente') {
        const html = marked.parse(texto);
        mensagem.innerHTML = DOMPurify.sanitize(html);
    } else {
        mensagem.textContent = texto;
    }

    mensagens.appendChild(mensagem);

    mensagens.scrollTop = mensagens.scrollHeight;

    return mensagem;
}
