from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://tkbivipqiewkfnhktmqq.supabase.co")
if not SUPABASE_URL.startswith("http"):
    SUPABASE_URL = "https://" + SUPABASE_URL
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

class SearchRequest(BaseModel):
    query: str
    match_threshold: float = 0.5
    match_count: int = 3

@router.post("/search_manuals")
def search_manuals(req: SearchRequest):
    try:
        # 1. Gera o embedding da pergunta
        response = client.embeddings.create(
            input=[req.query],
            model="text-embedding-3-small"
        )
        query_embedding = response.data[0].embedding
        
        # 2. Faz a chamada RPC no Supabase
        rpc_url = f"{SUPABASE_URL}/rest/v1/rpc/match_documents"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "query_embedding": query_embedding,
            "match_threshold": req.match_threshold,
            "match_count": req.match_count
        }
        
        res = httpx.post(rpc_url, headers=headers, json=payload, timeout=10.0)
        res.raise_for_status()
        
        return {
            "success": True,
            "results": res.json()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str

class AskRequest(BaseModel):
    query: str
    match_threshold: float = 0.3
    match_count: int = 5
    chat_history: list[ChatMessage] = []  # historico de mensagens anteriores

@router.post("/ask_manuals")
def ask_manuals(req: AskRequest):
    try:
        # 1. Gera o embedding da pergunta atual (sem historico - foca no topico atual)
        response = client.embeddings.create(
            input=[req.query],
            model="text-embedding-3-small"
        )
        query_embedding = response.data[0].embedding
        
        # 2. Busca no Supabase
        rpc_url = f"{SUPABASE_URL}/rest/v1/rpc/match_documents"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "query_embedding": query_embedding,
            "match_threshold": req.match_threshold,
            "match_count": req.match_count
        }
        
        res = httpx.post(rpc_url, headers=headers, json=payload, timeout=10.0)
        res.raise_for_status()
        
        chunks = res.json()
        
        # 3. Prepara o contexto para o GPT
        context_parts = []
        sources = []
        
        if chunks:
            for c in chunks:
                context_parts.append(f"--- Documento: {c['title']} | Pagina: {c['page_number']} ---\n{c['content']}\n")
                sources.append({"title": c['title'], "page": c['page_number'], "similarity": c['similarity']})
            context_str = "\n".join(context_parts)
        else:
            context_str = "(Nenhum trecho relevante encontrado nos manuais para esta pergunta especifica.)"
            
        system_prompt = (
            "Voce e o Cerebro Funcional da VS Payments, um especialista forense em regras operacionais "
            "de pagamentos, intercambio, autorizacao, clearing e chargebacks. "
            "Responda a pergunta do usuario de forma clara, tecnica e fundamentada **apenas** no contexto fornecido abaixo. "
            "Se o contexto nao contiver a resposta exata, diga que a informacao nao esta clara nos trechos disponiveis, "
            "mas use seu conhecimento geral sobre pagamentos para dar uma orientacao inicial. "
            "Use Markdown para formatar sua resposta (negritos, listas, blocos de codigo se precisar). "
            "Sempre que citar uma regra, cite tambem o manual e a pagina (de acordo com o cabecalho do documento no contexto).\n\n"
            f"CONTEXTO DOS MANUAIS:\n{context_str}"
        )
        
        # 4. Monta as mensagens com historico (multi-turn)
        messages = [{"role": "system", "content": system_prompt}]
        
        # Adiciona historico (max 10 mensagens para nao explodir o contexto)
        for msg in req.chat_history[-10:]:
            messages.append({"role": msg.role, "content": msg.content})
        
        # Adiciona a mensagem atual
        messages.append({"role": "user", "content": req.query})
        
        # 5. Chama a API de chat
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="gpt-4o-mini",
            temperature=0.2,
            max_tokens=1200,
        )
        
        answer = chat_completion.choices[0].message.content
        
        return {
            "success": True,
            "answer": answer,
            "sources": sources
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
