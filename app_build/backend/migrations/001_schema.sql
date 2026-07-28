-- ============================================================
-- 001_schema.sql — Schema utama Sistem Informasi Guru Batik
-- Dijalankan otomatis oleh PostgreSQL saat container pertama kali dibuat
-- ============================================================

-- Ekstensi
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Admin Users ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
    id         SERIAL PRIMARY KEY,
    username   VARCHAR(100) UNIQUE NOT NULL,
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,  -- bcrypt hash
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Artikel / Berita ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    slug         VARCHAR(255) UNIQUE NOT NULL,
    content      TEXT NOT NULL,          -- HTML dari TipTap
    excerpt      TEXT,
    category     VARCHAR(100) DEFAULT 'Umum',
    thumbnail    VARCHAR(500),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

-- ─── Pelanggan ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255),
    phone      VARCHAR(50),
    address    TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ─── Transaksi ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
    id               SERIAL PRIMARY KEY,
    customer_id      INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    amount           DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    description      TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);

-- ─── Hasil RFM Score ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rfm_scores (
    id            SERIAL PRIMARY KEY,
    customer_id   INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    recency       INTEGER NOT NULL,        -- hari sejak transaksi terakhir
    frequency     INTEGER NOT NULL,        -- jumlah total transaksi
    monetary      DECIMAL(15,2) NOT NULL,  -- total nilai transaksi
    r_score       INTEGER CHECK (r_score BETWEEN 1 AND 5),
    f_score       INTEGER CHECK (f_score BETWEEN 1 AND 5),
    m_score       INTEGER CHECK (m_score BETWEEN 1 AND 5),
    rfm_total     INTEGER,                 -- r_score + f_score + m_score
    segment_label VARCHAR(100),            -- "Champions", "At Risk", dll.
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfm_customer ON rfm_scores(customer_id);
CREATE INDEX IF NOT EXISTS idx_rfm_segment ON rfm_scores(segment_label);

-- ─── Hasil Clustering K-Means ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cluster_results (
    id             SERIAL PRIMARY KEY,
    run_id         UUID NOT NULL,           -- ID per-run clustering
    customer_id    INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    cluster_label  INTEGER NOT NULL,
    cluster_name   VARCHAR(100),
    priority_level VARCHAR(20) CHECK (priority_level IN ('HIGH', 'MEDIUM', 'LOW')),
    pca_x          FLOAT,                   -- koordinat PCA untuk scatter plot
    pca_y          FLOAT,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cluster_run ON cluster_results(run_id);
CREATE INDEX IF NOT EXISTS idx_cluster_customer ON cluster_results(customer_id);

-- ─── Metadata Run Clustering ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cluster_runs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    k_value       INTEGER NOT NULL,
    inertia       FLOAT,
    silhouette    FLOAT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    created_by    VARCHAR(100) DEFAULT 'admin'
);

-- ─── Trigger: update updated_at otomatis ──────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
