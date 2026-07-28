$env:ANTHROPIC_BASE_URL="http://127.0.0.1:20128/v1"
$env:OPENAI_BASE_URL="http://127.0.0.1:20128/v1"

Write-Host "Menginisialisasi Ruflo dengan 9Router proxy di http://127.0.0.1:20128/v1"
Write-Host "Memastikan @anthropic-ai/claude-code terinstal secara global..."
npm install -g @anthropic-ai/claude-code

Write-Host "Menjalankan Ruflo..."
npx ruflo
