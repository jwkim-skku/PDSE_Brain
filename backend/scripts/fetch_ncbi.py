import os
import time

from Bio import Entrez

EMAIL = os.getenv("ENTREZ_EMAIL", "demo@example.com")
TOOL = os.getenv("ENTREZ_TOOL", "brain-clone")
BATCH_SIZE = int(os.getenv("NCBI_BATCH_SIZE", "50"))


def fetch_gene_ids(term: str, limit: int = 200):
    Entrez.email = EMAIL
    Entrez.tool = TOOL
    handle = Entrez.esearch(db="gene", term=term, retmax=limit)
    result = Entrez.read(handle)
    return result["IdList"]


def batch_fetch_summaries(gene_ids):
    summaries = []
    for start in range(0, len(gene_ids), BATCH_SIZE):
        chunk = gene_ids[start : start + BATCH_SIZE]
        if not chunk:
            continue
        handle = Entrez.esummary(db="gene", id=",".join(chunk))
        data = Entrez.read(handle)
        for item in data["DocumentSummarySet"]["DocumentSummary"]:
            summaries.append(
                {
                    "id": item.attributes["uid"],
                    "name": item.get("Name", ""),
                    "description": item.get("Description", ""),
                }
            )
        # NCBI 권장 속도 제한 준수
        time.sleep(0.34)
    return summaries


if __name__ == "__main__":
    ids = fetch_gene_ids("brain[Title] AND Homo sapiens[Organism]")
    rows = batch_fetch_summaries(ids)
    print(f"Fetched {len(rows)} summaries with batch size {BATCH_SIZE}")
