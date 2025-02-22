DROP INDEX "embeddingIndex";--> statement-breakpoint
CREATE INDEX "embeddingIndex" ON "documents" USING hnsw ("embedding" vector_ip_ops);