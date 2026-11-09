import express from 'express';
import { app as grafo } from './grafo.js';

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.post('/perguntar', async (req, res) => {
    try {
        const { pergunta } = req.body;

        if (!pergunta || !pergunta.trim()) {
            return res.status(400).json({
                erro: 'Digite uma pergunta.',
            });
        }

        const resultado = await grafo.invoke({
            pergunta,
            trechos: [],
            resposta: '',
            tentativas: 0,
            respostaAprovada: false,
            feedbackValidacao: '',
        });

        res.json({
            resposta: resultado.resposta,
        });

    } catch (error) {
        console.error('Erro ao responder:', error.message);

        res.status(500).json({
            erro: 'Não foi possível responder à pergunta.',
        });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});