// ============================================
// PR CARROS MULTIMARCAS — script.js
// ============================================

// Ano no rodapé
document.getElementById('ano').textContent = new Date().getFullYear();

// Menu mobile
const navToggle = document.getElementById('navToggle');
const siteHeader = document.querySelector('.site-header');
navToggle.addEventListener('click', () => {
  const isOpen = siteHeader.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});
document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    siteHeader.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});


// ============================================
// CONFIGURAÇÃO DO AGENTE DE IA
// ============================================
// Este widget já funciona com respostas automáticas simples (modo offline).
// Para ligá-lo a um agente de IA de verdade (Claude, GPT, etc.), siga os
// passos abaixo:
//
// 1. Crie um backend seu (Node, Python, etc.) que receba a mensagem do
//    usuário e chame a API do modelo de IA escolhido. A chave de API NUNCA
//    deve ficar no código do site (front-end) — ela fica só no backend.
// 2. Coloque a URL desse backend em "endpoint" abaixo.
// 3. Mude "enabled" para true.
//
// Exemplo de payload enviado ao endpoint: { message: "texto do usuário" }
// Exemplo de resposta esperada do endpoint: { reply: "texto de resposta" }

const AI_AGENT_CONFIG = {
  enabled: false, // true = usa o endpoint de IA / false = usa respostas automáticas locais
  endpoint: 'https://SEU-BACKEND-AQUI.com/api/chat',
  welcomeMessage: 'Olá! Sou o assistente virtual da PR Carros. Posso ajudar com informações sobre estoque, financiamento, troca ou localização. O que você procura?',
  typingDelayMs: 500
};

// Respostas automáticas locais (usadas quando AI_AGENT_CONFIG.enabled = false)
const LOCAL_REPLIES = [
  { keywords: ['financi', 'parcel'], reply: 'Trabalhamos com financiamento facilitado pelos principais bancos. Me chama no WhatsApp que já te passamos uma simulação: https://wa.me/5511900000000' },
  { keywords: ['troca', 'usado', 'meu carro'], reply: 'Sim, aceitamos seu carro na troca! Avaliamos na hora. Envie os dados do veículo pelo WhatsApp para começarmos.' },
  { keywords: ['endereco', 'endereço', 'localiza', 'onde fica', 'local'], reply: 'Estamos na Avenida do Rio Bonito, 1465, Interlagos — São Paulo/SP. Tem o mapa completo aqui na página, na seção "Localização".' },
  { keywords: ['horario', 'horário', 'funciona'], reply: 'Atendemos de segunda a sexta, das 9h às 18h, e aos sábados das 9h às 13h.' },
  { keywords: ['whatsapp', 'contato', 'falar'], reply: 'Claro! Fala direto com a nossa equipe por aqui: https://wa.me/5511900000000' },
  { keywords: ['estoque', 'carro', 'suv', 'sedã', 'sedan', 'hatch', 'picape'], reply: 'Trabalhamos com sedãs, SUVs, hatches e picapes. Me conta o que você procura (modelo, ano ou faixa de preço) que já te encaminho as opções disponíveis.' }
];

function findLocalReply(text){
  const lower = text.toLowerCase();
  const match = LOCAL_REPLIES.find(item => item.keywords.some(k => lower.includes(k)));
  return match ? match.reply : 'Obrigado pela mensagem! Um consultor da PR Carros pode te atender melhor pelo WhatsApp: https://wa.me/5511900000000';
}

async function getAgentReply(text){
  if(!AI_AGENT_CONFIG.enabled){
    return findLocalReply(text);
  }
  try{
    const response = await fetch(AI_AGENT_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    if(!response.ok) throw new Error('Falha na resposta do agente de IA');
    const data = await response.json();
    return data.reply || 'Desculpe, não consegui responder agora. Fale com a gente pelo WhatsApp.';
  }catch(err){
    console.error('Erro ao chamar o agente de IA:', err);
    return 'Nosso assistente está indisponível no momento. Fale com a gente direto pelo WhatsApp: https://wa.me/5511900000000';
  }
}

// ===== Interface do widget =====
const aiWidget = document.getElementById('aiWidget');
const aiToggle = document.getElementById('aiToggle');
const aiPanel = document.getElementById('aiPanel');
const aiMessages = document.getElementById('aiMessages');
const aiForm = document.getElementById('aiForm');
const aiInput = document.getElementById('aiInput');

let welcomed = false;

function addMessage(text, from){
  const bubble = document.createElement('div');
  bubble.className = `ai-msg ${from}`;
  bubble.textContent = text;
  aiMessages.appendChild(bubble);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

aiToggle.addEventListener('click', () => {
  const isOpen = aiWidget.classList.toggle('open');
  aiPanel.hidden = !isOpen;
  aiToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  if(isOpen && !welcomed){
    addMessage(AI_AGENT_CONFIG.welcomeMessage, 'bot');
    welcomed = true;
  }
  if(isOpen) aiInput.focus();
});

aiForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = aiInput.value.trim();
  if(!text) return;
  addMessage(text, 'user');
  aiInput.value = '';
  aiInput.disabled = true;

  const reply = await getAgentReply(text);
  setTimeout(() => {
    addMessage(reply, 'bot');
    aiInput.disabled = false;
    aiInput.focus();
  }, AI_AGENT_CONFIG.typingDelayMs);
});
