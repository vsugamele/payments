-- Ativa a extensão pgvector se ainda não estiver ativa (para a Fase 2)
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela: Regras Mastercard
CREATE TABLE IF NOT EXISTS ic_mc_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id INTEGER NOT NULL,
    expression TEXT NOT NULL,
    ird TEXT NOT NULL,
    priority INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Regras Maestro
CREATE TABLE IF NOT EXISTS ic_maestro_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id INTEGER NOT NULL,
    expression TEXT NOT NULL,
    pseudo_ird TEXT NOT NULL,
    priority INTEGER NOT NULL,
    rate_pct NUMERIC(10, 4) NOT NULL,
    cap_brl NUMERIC(10, 4),
    description TEXT,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Regras Visa
CREATE TABLE IF NOT EXISTS ic_visa_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id TEXT NOT NULL,
    priority INTEGER NOT NULL,
    descriptor TEXT,
    accounting_sign TEXT NOT NULL,
    rate_pct NUMERIC(10, 4) NOT NULL,
    fixed_fee NUMERIC(10, 4) NOT NULL,
    cap_fee NUMERIC(10, 4) NOT NULL,
    expression TEXT NOT NULL,
    rate_corrupted BOOLEAN NOT NULL DEFAULT false,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Taxas Base (Base Rates)
CREATE TABLE IF NOT EXISTS ic_base_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL, -- 'mastercard', 'visa', etc
    ird TEXT NOT NULL,
    tier TEXT NOT NULL,
    segment TEXT NOT NULL,
    rate_pct NUMERIC(10, 4) NOT NULL,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Ajustes de Taxa (Mastercard)
CREATE TABLE IF NOT EXISTS ic_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ird TEXT NOT NULL,
    segment TEXT NOT NULL,
    adjustment_pct NUMERIC(10, 4) NOT NULL,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: MCC para Segmento
CREATE TABLE IF NOT EXISTS ic_mcc_to_segment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mcc INTEGER NOT NULL,
    segment TEXT NOT NULL,
    description TEXT,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Fase 2: Estrutura para RAG (Vector Store)
-- ==========================================

-- Tabela: Documentos fonte (Manuais em PDF)
CREATE TABLE IF NOT EXISTS ic_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Chunks (trechos) dos documentos com vetor de embedding
CREATE TABLE IF NOT EXISTS ic_document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES ic_documents(id) ON DELETE CASCADE,
    page_number INTEGER,
    content TEXT NOT NULL,
    embedding vector(1536), -- Compatível com OpenAI text-embedding-ada-002 e text-embedding-3-small
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para busca vetorial performática (Opcional, útil para grandes volumes)
-- CREATE INDEX ON ic_document_chunks USING hnsw (embedding vector_cosine_ops);
