// Script de seed — Cores de Bordado
// Execução: node seed_cores.js
// O backend deve estar rodando em localhost:8080

const BASE_URL = 'http://localhost:8080/api/embroidery-colors'

// Formato do name: "Nome (#RRGGBB)" conforme corBordado.js
const cores = [
  // Neutros / Brancos / Bege
  { threadCode: '5000', name: 'Branco Natural (#FAFAF8)' },
  { threadCode: '5038', name: 'Bege Claro (#E8D8C0)' },
  { threadCode: '5039', name: 'Bege Médio (#D4BA98)' },
  { threadCode: '5113', name: 'Bege (#C9A87A)' },
  { threadCode: '5077', name: 'Bege Escuro (#A07850)' },
  { threadCode: '5053', name: 'Palha (#D4C078)' },
  { threadCode: '5124', name: 'Caqui III (#8B7355)' },

  // Cinzas / Grafite
  { threadCode: '5076', name: 'Cinza Claro (#C8C8C8)' },
  { threadCode: '5045', name: 'Cinza (#9A9A9A)' },
  { threadCode: '5082', name: 'Cinza Chumbo (#6E6E6E)' },
  { threadCode: '5046', name: 'Grafite (#4A4A4A)' },
  { threadCode: '5047', name: 'Grafite Escuro (#2E2E2E)' },

  // Amarelos / Laranjas
  { threadCode: '5030', name: 'Amarelo Canário (#FFE135)' },
  { threadCode: '5049', name: 'Amarelo I (#FFD700)' },
  { threadCode: '5058', name: 'Amarelo (#F5C400)' },
  { threadCode: '5132', name: 'Amarelo Bebê (#FFF0A0)' },
  { threadCode: '5119', name: 'Mostarda I (#C8A020)' },
  { threadCode: '5128', name: 'Mostarda II (#A87C10)' },
  { threadCode: '5097', name: 'Amarelo Neon (#CCFF00)' },
  { threadCode: '5033', name: 'Laranja I (#FF7020)' },
  { threadCode: '5094', name: 'Laranja III (#FF5500)' },
  { threadCode: '5057', name: 'Laranja III (#FF6600)' },
  { threadCode: '5099', name: 'Laranja Fluorescente (#FF4500)' },
  { threadCode: '5095', name: 'Laranja IV (#E84010)' },
  { threadCode: '5116', name: 'Laranja Forte (#FF3300)' },
  { threadCode: '5158', name: 'Laranja Claro II (#FFAA60)' },

  // Vermelhos / Vinho / Rosa
  { threadCode: '5112', name: 'Vermelho (#E00020)' },
  { threadCode: '5009', name: 'Vermelho Escuro (#A00010)' },
  { threadCode: '5066', name: 'Vermelho Vinho (#7A0018)' },
  { threadCode: '5007', name: 'Vinho (#6B0020)' },
  { threadCode: '5078', name: 'Marsala (#8B3040)' },
  { threadCode: '5003', name: 'Rosa Claro (#FFB6C1)' },
  { threadCode: '5003', name: 'Rosa I (#F08090)' },
  { threadCode: '5004', name: 'Rosa II (#E06080)' },
  { threadCode: '5005', name: 'Rosa III (#C04060)' },
  { threadCode: '5101', name: 'Rosa Formoso (#E8407A)' },
  { threadCode: '5087', name: 'Pink (#FF1493)' },
  { threadCode: '5079', name: 'Blush Rosa (#F4C0B0)' },
  { threadCode: '5163', name: 'Blush (#F2B8A8)' },
  { threadCode: '5096', name: 'Rosê (#C8786A)' },
  { threadCode: '5071', name: 'Salmão (#FA8060)' },

  // Lilás / Roxo / Uva
  { threadCode: '5059', name: 'Lilás (#C090D0)' },
  { threadCode: '5013', name: 'Lilás Escuro (#8050A0)' },
  { threadCode: '5014', name: 'Roxo (#6A0DAD)' },
  { threadCode: '5109', name: 'Roxo Escuro (#4B0082)' },
  { threadCode: '5110', name: 'Roxo Uva (#5B2080)' },
  { threadCode: '5012', name: 'Uva ao Creme (#8C5090)' },

  // Azuis
  { threadCode: '5015', name: 'Azul Céu (#87CEEB)' },
  { threadCode: '5133', name: 'Azul Céu II (#6EC0E0)' },
  { threadCode: '5017', name: 'Azul I (#4080D0)' },
  { threadCode: '5019', name: 'Azul II (#2060C0)' },
  { threadCode: '5021', name: 'Azul III (#1050B0)' },
  { threadCode: '5126', name: 'Azul (#1A5CB0)' },
  { threadCode: '5020', name: 'Azul Royal (#2040A0)' },
  { threadCode: '5134', name: 'Blue Médio (#3060A8)' },
  { threadCode: '5072', name: 'Azul Jeans (#3A6088)' },
  { threadCode: '5136', name: 'Jeans (#3B5F7A)' },
  { threadCode: '5056', name: 'Azul Noite II (#1A2060)' },
  { threadCode: '5024', name: 'Azul Noite (#101840)' },
  { threadCode: '5121', name: 'Azul Noite (#0F1830)' },
  { threadCode: '5086', name: 'Azul Mar (#006994)' },
  { threadCode: '5115', name: 'Azul Marinho Claro (#1C4080)' },
  { threadCode: '5127', name: 'Azul Marinho Escuro (#0A1F50)' },

  // Verdes
  { threadCode: '5026', name: 'Verde Limão (#A8D020)' },
  { threadCode: '5025', name: 'Verde Cana (#70A830)' },
  { threadCode: '5027', name: 'Verde Folha (#3A8020)' },
  { threadCode: '5050', name: 'Verde Bandeira (#009C3B)' },
  { threadCode: '5048', name: 'Verde Água (#00C0A0)' },
  { threadCode: '5063', name: 'Verde Musgo (#608040)' },
  { threadCode: '5028', name: 'Verde Musgo Escuro I (#405030)' },
  { threadCode: '5075', name: 'Verde Escuro (#1A4020)' },

  // Marrons / Terracota / Cobre / Pele
  { threadCode: '5041', name: 'Marrom I (#8B4513)' },
  { threadCode: '5043', name: 'Nescau (#6B3010)' },
  { threadCode: '5044', name: 'Marrom III (#5C2E08)' },
  { threadCode: '5074', name: 'Marrom Escuro (#3E1A08)' },
  { threadCode: '5036', name: 'Terracota (#C0522A)' },
  { threadCode: '5035', name: 'Cobre I (#B87030)' },
  { threadCode: '5042', name: 'Cobre II (#A05C20)' },
  { threadCode: '5040', name: 'Pele Clara (#F0C898)' },

  // Dourados / Iluminadores
  { threadCode: '5034', name: 'Dourado (#D4A017)' },
  { threadCode: '5083', name: 'Ouro Claro (#E8C040)' },
  { threadCode: '5068', name: 'Iluminador Dourado (#F0D060)' },
]

async function seed() {
  let ok = 0, erro = 0
  console.log(`Enviando ${cores.length} cores...\n`)

  for (const cor of cores) {
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cor.name, threadCode: cor.threadCode }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(`HTTP ${res.status} — ${body.message || JSON.stringify(body)}`)
      }
      console.log(`✓  ${cor.threadCode}  ${cor.name}`)
      ok++
    } catch (e) {
      console.error(`✗  ${cor.threadCode}  ${cor.name}  →  ${e.message}`)
      erro++
    }
  }

  console.log(`\nConcluído: ${ok} inseridas, ${erro} erros.`)
}

seed()
