suppressPackageStartupMessages({
  library(jsonlite)
})

# 입력: expression_records.csv (region,Allen,GTEx,HPA,MANE,NCBI)
# 출력: UpSetJS 용 JSON
input_file <- Sys.getenv("UPSET_INPUT", "expression_records.csv")
output_file <- Sys.getenv("UPSET_OUTPUT", "upset_output.json")

if (!file.exists(input_file)) {
  stop("input file not found: ", input_file)
}

df <- read.csv(input_file, stringsAsFactors = FALSE)
sets <- c("Allen", "GTEx", "HPA", "MANE", "NCBI")
result <- list()

for (s in sets) {
  result[[length(result) + 1]] <- list(sets = list(s), size = sum(df[[s]] > 0))
}

write(toJSON(list(sets = result), auto_unbox = TRUE, pretty = TRUE), output_file)
cat("written:", output_file, "\n")
