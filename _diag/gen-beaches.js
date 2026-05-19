#!/usr/bin/env node
// Generator: 15 novas praias bilingues PT+EN — AD-20260519-06
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const beaches = [
  {
    slug: 'praia-do-guincho',
    namePT: 'Praia do Guincho',
    nameEN: 'Guincho Beach',
    concelho: 'Cascais',
    regionPT: 'Cascais &middot; Lisboa',
    regionEN: 'Cascais · Lisboa',
    addressRegion: 'Cascais',
    lat: 38.7308, lon: -9.4732,
    descPT: 'Falésias atlânticas e dunas selvagens no coração do Parque Natural de Sintra-Cascais.',
    descEN: 'Atlantic cliffs and wild dunes at the heart of Sintra-Cascais Natural Park.',
    typePT: 'Praia aberta', typeEN: 'Open beach',
    waterPT: 'Excelente', waterEN: 'Excellent',
    familyPT: 'Moderado', familyEN: 'Moderate',
    lifeguardPT: 'Sim (sazonal)', lifeguardEN: 'Yes (seasonal)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Cascais', gyg_cmp: 'pthcard-lisboa',
    amenityPT: 'Windsurf', amenityEN: 'Windsurfing',
    p1PT: 'Encravada no Parque Natural de Sintra-Cascais, a Praia do Guincho une o isolamento atlântico à proximidade de Lisboa — apenas 35 km de estrada panorâmica separam-na do centro da capital. As dunas longas e os ventos dominantes de norte fizeram desta praia um dos mais celebrados spots de windsurf e kitesurf da Europa.',
    p2PT: 'O Guincho foi palco da sequência de abertura do filme James Bond "Ao Serviço Secreto de Sua Majestade" (1969), onde George Lazenby resgata Tracy DiVicenzo das ondas. A praia mantém a mesma grandiosidade silvestre que cativou os realizadores há mais de meio século.',
    p3PT: 'Correntes fortes e ondulação irregular recomendam cautela mesmo a nadadores experientes. Melhor época para surfistas e kitesurfistas: junho a setembro. Estacionamento pago junto à praia; restaurante com vista para o farol de Santa Marta.',
    p1EN: 'Set within Sintra-Cascais Natural Park, Guincho Beach combines Atlantic wilderness with proximity to Lisbon — just 35 km of scenic road from the city centre. Long dunes and dominant northerly winds have made this one of Europe\'s most celebrated windsurfing and kitesurfing spots.',
    p2EN: 'Guincho was the setting for the opening sequence of the James Bond film "On Her Majesty\'s Secret Service" (1969), where George Lazenby rescues Tracy DiVicenzo from the surf. The beach retains the same wild grandeur that captivated filmmakers over half a century ago.',
    p3EN: 'Strong currents and irregular swell call for caution even for experienced swimmers. Best season for surfers and kitesurfers: June to September. Paid parking near the beach; restaurant with views of Santa Marta lighthouse.',
    sourcesPT: 'Wikipedia (Praia do Guincho) · sceen-it.com (locais de filmagem OHMSS) · cm-cascais.pt',
    sourcesEN: 'Wikipedia (Praia do Guincho) · sceen-it.com (OHMSS filming locations) · cm-cascais.pt',
  },
  {
    slug: 'praia-grande-sintra',
    namePT: 'Praia Grande',
    nameEN: 'Praia Grande (Sintra)',
    concelho: 'Sintra',
    regionPT: 'Colares &middot; Sintra',
    regionEN: 'Colares · Sintra',
    addressRegion: 'Sintra',
    lat: 38.8144, lon: -9.4768,
    descPT: 'Pegadas de dinossauros, falésias atlânticas e uma das maiores piscinas de água salgada da Europa.',
    descEN: 'Dinosaur footprints, Atlantic cliffs and one of Europe\'s largest saltwater pools.',
    typePT: 'Praia aberta', typeEN: 'Open beach',
    waterPT: 'Boa', waterEN: 'Good',
    familyPT: 'Sim', familyEN: 'Yes',
    lifeguardPT: 'Sim (sazonal)', lifeguardEN: 'Yes (seasonal)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Sintra', gyg_cmp: 'pthcard-lisboa',
    amenityPT: 'Bodyboard', amenityEN: 'Bodyboarding',
    p1PT: 'A Praia Grande de Colares guarda no seu extremo sul uma raridade científica: 66 pegadas de dinossauros terópodes impressas em calcário há mais de 100 milhões de anos, descobertas em 1981 por paleontólogos portugueses. O sítio é de acesso livre e visível na maré baixa — um museu natural ao ar livre sem paralelo na costa atlântica.',
    p2PT: 'A praia alberga uma das maiores piscinas de água salgada da Europa, escavada directamente na rocha costeira pelo Hotel das Arribas, com mais de 100 metros de comprimento. Em agosto, recebe competições internacionais de bodyboard que atraem atletas de todo o mundo.',
    p3PT: 'O acesso faz-se por estrada sinuosa entre matos e pinheiros de Colares; estacionamento limitado em época alta. Vento frequente e correntes laterais recomendam atenção, especialmente a sul. Nadador-salvador presente de junho a setembro.',
    p1EN: 'Praia Grande in Colares hides a scientific rarity at its southern end: 66 theropod dinosaur footprints preserved in limestone for over 100 million years, discovered in 1981 by Portuguese palaeontologists. The site is freely accessible and visible at low tide — a natural open-air museum unique on the Atlantic coast.',
    p2EN: 'The beach hosts one of Europe\'s largest saltwater pools, carved directly into the coastal rock by Hotel das Arribas, measuring over 100 metres in length. In August, it welcomes international bodyboarding competitions that draw athletes from around the world.',
    p3EN: 'Access is via a winding road through Colares scrubland and pine forest; parking is limited in high season. Frequent wind and lateral currents call for care, especially to the south. Lifeguard on duty June to September.',
    sourcesPT: 'PrehistoricPortugal.com (pegadas) · VisitSintra · Hotel das Arribas',
    sourcesEN: 'PrehistoricPortugal.com (footprints) · VisitSintra · Hotel das Arribas',
  },
  {
    slug: 'costa-de-caparica',
    namePT: 'Costa da Caparica',
    nameEN: 'Costa da Caparica',
    concelho: 'Almada',
    regionPT: 'Almada &middot; Set&uacute;bal',
    regionEN: 'Almada · Setúbal',
    addressRegion: 'Almada',
    lat: 38.6446, lon: -9.2356,
    descPT: 'Mais de 25 km de areia atlântica divididos em 29 zonas — a praia urbana mais longa de Portugal.',
    descEN: 'Over 25 km of Atlantic sand across 29 zones — Portugal\'s longest urban beach.',
    typePT: 'Praia urbana extensa', typeEN: 'Extended urban beach',
    waterPT: 'Boa a Excelente', waterEN: 'Good to Excellent',
    familyPT: 'Sim (zonas norte)', familyEN: 'Yes (northern zones)',
    lifeguardPT: 'Sim (sazonal, todas as zonas)', lifeguardEN: 'Yes (seasonal, all zones)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Lisboa', gyg_cmp: 'pthcard-lisboa',
    amenityPT: 'Surf · Naturismo (zona sul)', amenityEN: 'Surfing · Naturism (south)',
    p1PT: 'Com mais de 25 km de areia contínua, a Costa da Caparica é a mais longa praia urbana de Portugal e o principal escape balnear dos lisboetas — acessível a 30 minutos de transportes públicos a partir do centro. Divide-se em 29 zonas numeradas, cada uma com carácter próprio: familiar, surf, naturismo, vida nocturna.',
    p2PT: 'A Autoridade Portuária de Lisboa e a APA celebraram um protocolo de alimentação artificial de sedimentos para travar a erosão costeira: parte da areia é reabastecida anualmente com dragagens do estuário do Tejo. Um equilíbrio delicado entre urbanismo e preservação que define Caparica.',
    p3PT: 'A zona norte tem infraestruturas completas e Bandeira Azul; a sul os números sobem e a praia torna-se progressivamente mais selvagem. Acessos por A2+IC20, ou por ferry e autocarro da Praça do Comércio. Em época baixa, cenário cinematográfico praticamente deserto.',
    p1EN: 'Stretching over 25 km of continuous sand, Costa da Caparica is Portugal\'s longest urban beach and Lisbon\'s primary seaside escape — reachable in 30 minutes by public transport from the city centre. It divides into 29 numbered zones, each with its own character: family, surf, naturism, and nightlife.',
    p2EN: 'Lisbon\'s Port Authority and the APA signed a sediment nourishment protocol to counter coastal erosion: beach sand is replenished annually using dredged material from the Tagus estuary. A delicate balance between urban development and coastal preservation that defines Caparica.',
    p3EN: 'The northern zone has full facilities and Blue Flag status; further south the numbers rise and the beach becomes progressively wilder. Access via A2+IC20 motorway or ferry and bus from Praça do Comércio. In low season, a near-deserted cinematic landscape.',
    sourcesPT: 'Wikipedia (Costa da Caparica) · portodelisboa.pt (protocolo APA) · cm-almada.pt',
    sourcesEN: 'Wikipedia (Costa da Caparica) · portodelisboa.pt (APA protocol) · cm-almada.pt',
  },
  {
    slug: 'praia-de-sesimbra',
    namePT: 'Praia de Sesimbra',
    nameEN: 'Sesimbra Beach',
    concelho: 'Sesimbra',
    regionPT: 'Arrábida &middot; Set&uacute;bal',
    regionEN: 'Arrábida · Setúbal',
    addressRegion: 'Sesimbra',
    lat: 38.4445, lon: -9.1015,
    descPT: 'Baía protegida pela Serra da Arrábida, água cristalina e uma aldeia piscatória com castello medieval.',
    descEN: 'Protected bay sheltered by Serra da Arrábida, crystal water and a medieval castle fishing village.',
    typePT: 'Baía protegida', typeEN: 'Sheltered bay',
    waterPT: 'Excelente', waterEN: 'Excellent',
    familyPT: 'Sim', familyEN: 'Yes',
    lifeguardPT: 'Sim (sazonal)', lifeguardEN: 'Yes (seasonal)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Sesimbra', gyg_cmp: 'pthcard-lisboa',
    amenityPT: 'Mergulho · Snorkeling', amenityEN: 'Diving · Snorkelling',
    p1PT: 'A Praia de Sesimbra abre-se numa baía voltada a sul, protegida pelos contrafortes da Serra da Arrábida — um escudo natural que mantém as águas calmas e entre 5 a 8°C mais quentes do que as praias atlânticas expostas. O frente a mar insere-se na Área Marinha Protegida da Arrábida, reconhecida pela APA pela excepcionl qualidade bacteriológica.',
    p2PT: 'Sesimbra é uma aldeia piscatória activa: à tarde, os barcos regressam ao cais adjacente à praia com o produto do dia, uma das últimas frentes marítimas de trabalho real em Portugal. Sobre as casas brancas ergue-se o Castelo de Sesimbra, fortaleza mourísca reconquistada por D. Afonso Henriques no século XII.',
    p3PT: 'O mar é adequado para mergulho e snorkeling; várias escolas de mergulho locais operam junto ao porto. A praia tem nadador-salvador sazonal e acessos para mobilidade reduzida. Estacionamento limitado em julho e agosto — chegue antes das 9h ou use transporte público desde Setúbal.',
    p1EN: 'Sesimbra beach opens into a south-facing bay sheltered by the Serra da Arrábida foothills — a natural shield that keeps waters calm and 5–8°C warmer than exposed Atlantic beaches. The seafront falls within the Arrábida Marine Protected Area, recognised by the APA for exceptional bacteriological quality.',
    p2EN: 'Sesimbra remains an active fishing village: each afternoon, boats return to the quay adjacent to the beach with the day\'s catch, one of the last genuinely working waterfronts in Portugal. Above the white houses rises Sesimbra Castle, a Moorish fortress reconquered by King Afonso Henriques in the 12th century.',
    p3EN: 'The sea is suitable for diving and snorkelling; several local dive schools operate near the harbour. The beach has a seasonal lifeguard and accessible facilities for reduced mobility. Parking is very limited in July and August — arrive before 9am or use public transport from Setúbal.',
    sourcesPT: 'cm-sesimbra.pt · visitportugal.com (Praia de Sesimbra) · Área Marinha Protegida da Arrábida',
    sourcesEN: 'cm-sesimbra.pt · visitportugal.com (Sesimbra Beach) · Arrábida Marine Protected Area',
  },
  {
    slug: 'praia-do-meco',
    namePT: 'Praia do Meco',
    nameEN: 'Meco Beach',
    concelho: 'Sesimbra',
    regionPT: 'Set&uacute;bal &middot; Alfarim',
    regionEN: 'Setúbal · Alfarim',
    addressRegion: 'Sesimbra',
    lat: 38.4911, lon: -9.1840,
    descPT: 'A primeira praia oficial de naturismo em Portugal, protegida pela Arriba Fóssil da Caparica.',
    descEN: 'Portugal\'s first official naturist beach, protected by the Caparica Fossil Cliff Nature Reserve.',
    typePT: 'Praia aberta atlântica', typeEN: 'Open Atlantic beach',
    waterPT: 'Boa (Bandeira Azul)', waterEN: 'Good (Blue Flag)',
    familyPT: 'Zona norte: Sim', familyEN: 'North zone: Yes',
    lifeguardPT: 'Sim (zona norte, sazonal)', lifeguardEN: 'Yes (north zone, seasonal)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Sesimbra', gyg_cmp: 'pthcard-lisboa',
    amenityPT: 'Naturismo (zona sul)', amenityEN: 'Naturism (south zone)',
    p1PT: 'A Praia do Meco foi oficialmente designada como a primeira praia de naturismo em Portugal em 1995, embora a prática já ocorresse desde os anos 1980. A zona norte, com apoio de praia completo e nadador-salvador, é frequentada por famílias; a sul a praia expande-se de forma selvagem, nudista e progressivamente mais isolada.',
    p2PT: 'Atrás das dunas ergue-se a Arriba Fóssil da Costa da Caparica, Monumento Natural classificado com afloramentos de calcários do Pliocénico e ecossistemas de pinheiros mansos que albergam espécies endémicas. Nenhuma construção é permitida nesta frente costeira, o que explica a ausência de urbanização que ainda hoje caracteriza o Meco.',
    p3PT: 'Ondulação atlântica forte — não é praia de águas calmas. Correntes de retorno ocasionais; sinalização de segurança presente na zona norte. Acesso por Alfarim (IC32) com caminhada de 10 minutos nas dunas desde o parque de estacionamento. Sem transportes públicos directos.',
    p1EN: 'Meco Beach was officially designated Portugal\'s first naturist beach in 1995, though the practice had existed informally since the 1980s. The northern section, with full beach facilities and a lifeguard, is popular with families; southward, the beach stretches wild, nudist and progressively more isolated.',
    p2EN: 'Behind the dunes rises the Arriba Fóssil da Costa da Caparica, a classified Natural Monument with Pliocene limestone outcrops and umbrella pine ecosystems sheltering endemic species. No construction is permitted along this coastal front, explaining the absence of development that still defines Meco today.',
    p3EN: 'Strong Atlantic swell — not a calm-water beach. Occasional rip currents; safety signage present in the northern zone. Access via Alfarim (IC32) with a 10-minute dune walk from the car park. No direct public transport.',
    sourcesPT: 'lisbonbeachesguide.com (Praia do Meco) · Monumento Natural da Arriba Fóssil (ICNF) · DGT',
    sourcesEN: 'lisbonbeachesguide.com (Meco Beach) · Arriba Fóssil Natural Monument (ICNF) · DGT',
  },
  {
    slug: 'praia-de-odeceixe',
    namePT: 'Praia de Odeceixe',
    nameEN: 'Odeceixe Beach',
    concelho: 'Aljezur',
    regionPT: 'Costa Vicentina &middot; Aljezur',
    regionEN: 'Costa Vicentina · Aljezur',
    addressRegion: 'Aljezur',
    lat: 37.4413, lon: -8.7982,
    descPT: 'A fronteira natural entre o Algarve e o Alentejo — rio, lagoa e oceano no mesmo areal.',
    descEN: 'The natural border between the Algarve and Alentejo — river, lagoon and ocean on the same beach.',
    typePT: 'Praia fluvio-marítima', typeEN: 'River-mouth beach',
    waterPT: 'Excelente (Bandeira Azul)', waterEN: 'Excellent (Blue Flag)',
    familyPT: 'Sim', familyEN: 'Yes',
    lifeguardPT: 'Sim (sazonal)', lifeguardEN: 'Yes (seasonal)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Aljezur', gyg_cmp: 'pthcard-vicentina',
    amenityPT: 'Surf · Lagoa (crianças)', amenityEN: 'Surfing · Lagoon (children)',
    p1PT: 'A Ribeira de Seixe traça a fronteira natural exacta entre o Algarve e o Alentejo — e desagua precisamente na extremidade norte desta praia. O resultado é único: no mesmo areal coexistem duas zonas de banho completamente distintas. Do lado atlântico, ondulação consistente para surfistas; do lado da lagoa, água calma e rasa ideal para crianças e nadadores menos experientes.',
    p2PT: 'Integrada no Parque Natural do Sudoeste Alentejano e Costa Vicentina (PNSACV), a praia de Odeceixe recebe Bandeira Azul desde 2012. As falésias de xisto negro com veios de quartzo que enquadram a praia norte têm uma estratificação visual única — camadas tectónicas expostas por milénios de erosão atlântica.',
    p3PT: 'Acesso por caminho de terra a partir da aldeia de Odeceixe (3 km), com estacionamento no topo das falésias e descida a pé. Em julho e agosto a procura supera a capacidade de estacionamento — chegada antes das 9h recomendada. Restaurante e apoio de praia sazonais na descida.',
    p1EN: 'The Ribeira de Seixe river marks the exact natural border between the Algarve and Alentejo — and empties precisely at the northern end of this beach. The result is unique: two completely different swimming environments on the same stretch of sand. On the Atlantic side, consistent swell for surfers; on the lagoon side, shallow calm water ideal for children and less experienced swimmers.',
    p2EN: 'Part of the Southwest Alentejo and Vicentine Coast Natural Park (PNSACV), Odeceixe beach has held Blue Flag status since 2012. The black slate cliffs with quartz veins framing the northern beach display a unique visual stratification — tectonic layers exposed by millennia of Atlantic erosion.',
    p3EN: 'Access via a dirt track from Odeceixe village (3 km), with parking at the cliff top and a walk down. In July and August demand exceeds parking capacity — arriving before 9am is recommended. Seasonal restaurant and beach facilities on the descent.',
    sourcesPT: 'Wikipedia (Praia de Odeceixe Mar) · cm-aljezur.pt · PNSACV (ICNF)',
    sourcesEN: 'Wikipedia (Praia de Odeceixe Mar) · cm-aljezur.pt · PNSACV (ICNF)',
  },
  {
    slug: 'praia-da-arrifana',
    namePT: 'Praia da Arrifana',
    nameEN: 'Arrifana Beach',
    concelho: 'Aljezur',
    regionPT: 'Costa Vicentina &middot; Aljezur',
    regionEN: 'Costa Vicentina · Aljezur',
    addressRegion: 'Aljezur',
    lat: 37.2943, lon: -8.8663,
    descPT: 'Fortaleza do século XVII, ribat islâmico do século XI e o spot de surf mais popular da Costa Vicentina.',
    descEN: '17th-century fortress, 11th-century Islamic ribat and the most popular surf spot on the Vicentine Coast.',
    typePT: 'Baía semiabrigada', typeEN: 'Semi-sheltered cove',
    waterPT: 'Excelente', waterEN: 'Excellent',
    familyPT: 'Moderado', familyEN: 'Moderate',
    lifeguardPT: 'Sim (sazonal)', lifeguardEN: 'Yes (seasonal)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Aljezur', gyg_cmp: 'pthcard-vicentina',
    amenityPT: 'Surf · Arqueologia', amenityEN: 'Surfing · Archaeology',
    p1PT: 'A falésia que domina a Praia da Arrifana a norte guarda duas camadas de história sobrepostas. Na ponta mais alta, as ruínas da Fortaleza da Arrifana, erguida em 1635 por ordem de Filipe III e destruída pelo terramoto de 1755. Logo abaixo, o Ribat da Arrifana, fortim religioso-militar islâmico dos séculos XI e XII, associado a Abu-l-Qasim ibn Qasi, soberano da Taifa de Mértola.',
    p2PT: 'Em termos de surf, a Arrifana oferece dois breaks distintos: um beach break central e a ponta de Pedra da Agulha a sul, que produz ondas de direita longas e cobiçadas. É o spot mais popular de toda a Costa Vicentina, com escolas de surf estabelecidas e condições para todos os níveis.',
    p3PT: 'Baía com paredes de falésia a mais de 100 metros de altura que fornecem abrigo natural do vento norte. Restaurante e apoio sazonal no acesso. Estacionamento junto à descida da falésia; em época alta, lotação esgota antes das 10h. Dentro do PNSACV — acampamento selvagem proibido.',
    p1EN: 'The cliff dominating Arrifana Beach to the north holds two overlapping layers of history. At the highest point, the ruins of Arrifana Fortress, built in 1635 under Philip III of Portugal and destroyed by the 1755 earthquake. Just below, the Ribat da Arrifana, an 11th–12th century Islamic military-religious fortification associated with Abu-l-Qasim ibn Qasi, ruler of the Taifa of Mértola.',
    p2EN: 'In surf terms, Arrifana offers two distinct breaks: a central beach break and the Pedra da Agulha point to the south, which produces long, sought-after right-hand waves. It is the most popular spot on the entire Vicentine Coast, with established surf schools and conditions suitable for all levels.',
    p3EN: 'A cove with cliff walls over 100 metres high providing natural shelter from northerly winds. Seasonal restaurant and facilities at the access point. Parking near the cliff descent; in high season, capacity is exhausted before 10am. Within PNSACV — wild camping is prohibited.',
    sourcesPT: 'Wikipedia (Praia da Arrifana) · Lonely Planet (Fortaleza da Arrifana) · thesurfatlas.com',
    sourcesEN: 'Wikipedia (Praia da Arrifana) · Lonely Planet (Arrifana Fortress ruins) · thesurfatlas.com',
  },
  {
    slug: 'praia-do-amado',
    namePT: 'Praia do Amado',
    nameEN: 'Amado Beach',
    concelho: 'Aljezur',
    regionPT: 'Costa Vicentina &middot; Bordeira',
    regionEN: 'Costa Vicentina · Bordeira',
    addressRegion: 'Aljezur',
    lat: 37.1677, lon: -8.9117,
    descPT: 'Ondulação atlântica constante durante todo o ano, dentro do Parque Natural da Costa Vicentina.',
    descEN: 'Year-round consistent Atlantic swell inside the Vicentine Coast Natural Park.',
    typePT: 'Praia aberta atlântica', typeEN: 'Open Atlantic beach',
    waterPT: 'Excelente', waterEN: 'Excellent',
    familyPT: 'Moderado', familyEN: 'Moderate',
    lifeguardPT: 'Sim (sazonal)', lifeguardEN: 'Yes (seasonal)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Aljezur', gyg_cmp: 'pthcard-vicentina',
    amenityPT: 'Surf · Bodyboard', amenityEN: 'Surfing · Bodyboarding',
    p1PT: 'A Praia do Amado orienta-se directamente para oeste e recebe ondulação atlântica sem obstáculos durante todo o ano — uma constância rara que a tornou um destino de surf de referência em Portugal. O Amado Surf Camp e a Algarve Surf School, entre as escolas mais estabelecidas do sul do país, têm base permanente nesta praia.',
    p2PT: 'Integrada no Parque Natural do Sudoeste Alentejano e Costa Vicentina, a praia não tem qualquer construção permanente no perímetro imediato — proibição que o regulamento do parque impõe e que preserva a paisagem intacta de dunas e matos de zimbro. O vazio de cimento é o maior luxo desta praia.',
    p3PT: 'A praia situa-se na freguesia de Bordeira, concelho de Aljezur, a cerca de 15 km de Carrapateira. Estacionamento gratuito mas limitado no topo; apoio de praia sazonal. Ondulação adequada para iniciantes em condições de verão; mais técnica no outono e inverno.',
    p1EN: 'Amado Beach faces directly west and receives unobstructed Atlantic swell year-round — a rare consistency that has made it a benchmark surf destination in Portugal. Amado Surf Camp and Algarve Surf School, among the most established schools in southern Portugal, are based permanently at this beach.',
    p2EN: 'Within the Southwest Alentejo and Vicentine Coast Natural Park, the beach has no permanent construction on its immediate perimeter — a prohibition enforced by park regulations that preserves an intact landscape of dunes and juniper scrub. The absence of concrete is this beach\'s greatest luxury.',
    p3EN: 'The beach is in Bordeira parish, Aljezur municipality, about 15 km from Carrapateira. Free but limited parking at the top; seasonal beach facilities. Swell suitable for beginners in summer conditions; more technical in autumn and winter.',
    sourcesPT: 'cm-aljezur.pt (Praia do Amado) · amadosurfcamp.com · PNSACV (ICNF)',
    sourcesEN: 'cm-aljezur.pt (Praia do Amado) · amadosurfcamp.com · PNSACV (ICNF)',
  },
  {
    slug: 'praia-de-porto-covo',
    namePT: 'Praia de Porto Covo',
    nameEN: 'Porto Covo Beach',
    concelho: 'Sines',
    regionPT: 'Alentejo Litoral &middot; Sines',
    regionEN: 'Alentejo Litoral · Sines',
    addressRegion: 'Sines',
    lat: 37.8555, lon: -8.7930,
    descPT: 'Aldeia piscatória do século XVIII e porta norte da Costa Vicentina — enseadas entre falésias dramáticas.',
    descEN: '18th-century fishing village and northern gateway to the Vicentine Coast — coves between dramatic cliffs.',
    typePT: 'Múltiplas enseadas', typeEN: 'Multiple coves',
    waterPT: 'Excelente', waterEN: 'Excellent',
    familyPT: 'Sim (praia principal)', familyEN: 'Yes (main beach)',
    lifeguardPT: 'Sim (sazonal, praia principal)', lifeguardEN: 'Yes (seasonal, main beach)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Alentejo', gyg_cmp: 'pthcard-vicentina',
    amenityPT: 'Snorkeling · Caminhadas costeiras', amenityEN: 'Snorkelling · Coastal hiking',
    p1PT: 'Porto Covo marca a entrada norte do Parque Natural do Sudoeste Alentejano e Costa Vicentina — toda a costa a sul de São Torpes está protegida. A aldeia, de traçado tipicamente alentejano com casas caiadas e arruamentos estreitos, tem classificação de conjunto histórico preservado e foi fundada no século XVIII como posto de pesca e vigia costeira.',
    p2PT: 'A costa de Porto Covo fragmenta-se numa série de pequenas praias e enseadas separadas por formações rochosas e falésias abruptas: Praia da Samoqueira, Praia Pequena, Praia dos Buizinhos e a praia principal. Cada enseada tem exposição e carácter diferente — snorkeling, pesca à linha ou banho tranquilo segundo a escolha.',
    p3PT: 'Acesso fácil a partir da EN393-1. Estacionamento no centro da aldeia; distâncias curtas a pé para todas as praias. Apoio de praia e restaurantes sazonais. A Ilha do Pessegueiro, visível ao largo, faz parte da mesma área protegida e pode ser visitada de barco em época alta.',
    p1EN: 'Porto Covo marks the northern entrance to the Southwest Alentejo and Vicentine Coast Natural Park — all coastline south of São Torpes is protected. The village, with typically Alentejo whitewashed houses and narrow streets, has classified historic settlement status and was founded in the 18th century as a fishing and coastal lookout post.',
    p2EN: 'The Porto Covo coastline breaks into a series of small beaches and coves separated by rock formations and abrupt cliffs: Praia da Samoqueira, Praia Pequena, Praia dos Buizinhos and the main beach. Each cove has different exposure and character — snorkelling, shore fishing or calm bathing depending on your choice.',
    p3EN: 'Easy access from the EN393-1 road. Parking in the village centre; short walks to all beaches. Seasonal beach facilities and restaurants. Pessegueiro Island, visible offshore, is part of the same protected area and can be visited by boat in high season.',
    sourcesPT: 'sines.pt · viagensecaminhos.com (Porto Covo) · PNSACV (ICNF)',
    sourcesEN: 'sines.pt · viagensecaminhos.com (Porto Covo) · PNSACV (ICNF)',
  },
  {
    slug: 'praia-da-comporta',
    namePT: 'Praia da Comporta',
    nameEN: 'Comporta Beach',
    concelho: 'Grândola',
    regionPT: 'Alentejo Litoral &middot; Gr&acirc;ndola',
    regionEN: 'Alentejo Litoral · Grândola',
    addressRegion: 'Grândola',
    lat: 38.3806, lon: -8.7861,
    descPT: 'Arrozais, pinheiros, flamingos e 45 km de praia atlântica sem cimento — na Reserva Natural do Estuário do Sado.',
    descEN: 'Rice paddies, pine trees, flamingos and 45 km of cement-free Atlantic beach — in the Sado Estuary Natural Reserve.',
    typePT: 'Praia atlântica de duna', typeEN: 'Atlantic dune beach',
    waterPT: 'Excelente (Bandeira Azul)', waterEN: 'Excellent (Blue Flag)',
    familyPT: 'Sim', familyEN: 'Yes',
    lifeguardPT: 'Sim (sazonal)', lifeguardEN: 'Yes (seasonal)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Comporta', gyg_cmp: 'pthcard-vicentina',
    amenityPT: 'Natureza · Observação de aves', amenityEN: 'Nature · Birdwatching',
    p1PT: 'A Praia da Comporta insere-se na Reserva Natural do Estuário do Sado — 23 971 hectares de zona protegida estabelecida em 1980 que abriga uma comunidade residente de golfinhos-roazes, mais de 200 espécies de aves e a única colónia de flamingos-rosados de Portugal continental visível nos arrozais adjacentes durante todo o ano.',
    p2PT: 'A faixa costeira entre Tróia e Sines — da qual a Comporta faz parte — estende-se por mais de 45 km de praia atlântica contínua sem interrupção de urbanização, um dos mais longos corredores de areia sem cimento da Europa Ocidental. A primeira praia do município de Grândola a receber Bandeira Azul foi precisamente a Comporta.',
    p3PT: 'Acesso por estrada de terra a partir de Comporta vila (3 km); sem transportes públicos directos. Estacionamento sazonal pago. A praia não tem apoio fixo fora da época alta — traga água e protecção solar. Ondulação atlântica moderada a forte; condições variáveis consoante o vento de sul.',
    p1EN: 'Comporta Beach sits within the Sado Estuary Natural Reserve — 23,971 hectares of protected area established in 1980 that shelters a resident bottlenose dolphin community, over 200 bird species, and the only pink flamingo colony in mainland Portugal, visible in the adjacent rice paddies year-round.',
    p2EN: 'The coastal strip between Tróia and Sines — of which Comporta is part — extends over 45 km of continuous Atlantic beach without urbanisation, one of the longest cement-free sand corridors in Western Europe. The first beach in Grândola municipality to receive a Blue Flag was Comporta itself.',
    p3EN: 'Access via a dirt road from Comporta village (3 km); no direct public transport. Seasonal paid parking. The beach has no permanent facilities outside high season — bring water and sunscreen. Moderate to strong Atlantic swell; variable conditions depending on southerly wind.',
    sourcesPT: 'cm-grandola.pt · joandso.com (Estuário do Sado) · roughguides.com (Comporta)',
    sourcesEN: 'cm-grandola.pt · joandso.com (Sado Estuary) · roughguides.com (Comporta)',
  },
  {
    slug: 'praia-do-norte-nazare',
    namePT: 'Praia do Norte (Nazar&eacute;)',
    nameEN: 'North Beach (Nazare)',
    namePTraw: 'Praia do Norte (Nazaré)',
    nameENraw: 'North Beach (Nazare)',
    concelho: 'Nazar&eacute;',
    regionPT: 'Centro &middot; Nazar&eacute;',
    regionEN: 'Centro · Nazaré',
    addressRegion: 'Nazaré',
    lat: 39.6086, lon: -9.0843,
    descPT: 'Recordes mundiais de surf — onde o Canhão da Nazaré amplifica ondas acima dos 26 metros.',
    descEN: 'World surf records — where the Nazare Canyon amplifies waves above 26 metres.',
    typePT: 'Praia aberta (espectáculo, não banho)', typeEN: 'Open beach (spectating, not swimming)',
    waterPT: 'Sem classificação (não balneável)', waterEN: 'Unrated (not a bathing beach)',
    familyPT: 'Espectáculo (não banho)', familyEN: 'Spectating (not swimming)',
    lifeguardPT: 'Não (praia perigosa)', lifeguardEN: 'No (dangerous beach)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Nazaré', gyg_cmp: 'pthcard-centro',
    amenityPT: 'Observação surf big-wave', amenityEN: 'Big-wave surf spectating',
    p1PT: 'A Praia do Norte da Nazaré detém o Recorde Mundial Guinness de maior onda alguma vez surfada: 26,21 metros, surfada pelo alemão Sebastian Steudtner em outubro de 2020 e certificada em maio de 2022. A onda foi gerada pelo Canhão da Nazaré, a maior canha submarina da Europa — 230 km de comprimento e 5 000 metros de profundidade — que funciona como amplificador de energia atlântica sem paralelo no mundo.',
    p2PT: 'O canhão submarino não dissipa a energia das ondas atlânticas antes de chegarem à costa; antes, canaliza-a e concentra-a. O resultado são ondas de água profunda que chegam à Praia do Norte com toda a força acumulada de centenas de quilómetros de oceano. Esta fenomenologia foi estudada por oceanógrafos da Universidade de Lisboa e é a razão pela qual a Nazaré se tornou a meca mundial do big-wave surfing.',
    p3PT: 'AVISO: A Praia do Norte NÃO é uma praia de banho. As correntes são extremamente perigosas e o banho é desaconselhado mesmo em dias calmos. O acesso para spectadores é pelo miradouro do Sítio (teleférico ou estrada). A época de big waves decorre de outubro a março. Surf na Praia de Nazaré (a sul) é adequado para a maioria dos níveis em época estival.',
    p1EN: 'North Beach in Nazaré holds the Guinness World Record for the largest wave ever surfed: 26.21 metres, ridden by Sebastian Steudtner of Germany in October 2020 and officially certified in May 2022. The wave was generated by the Nazaré Canyon, Europe\'s largest submarine canyon — 230 km long and 5,000 metres deep — which acts as an Atlantic energy amplifier with no parallel in the world.',
    p2EN: 'The submarine canyon does not dissipate Atlantic wave energy before it reaches the coast; instead, it channels and concentrates it. The result is deep-water waves that arrive at North Beach with the full accumulated force of hundreds of kilometres of ocean. This phenomenon has been studied by oceanographers at the University of Lisbon and is the reason Nazaré became the global mecca of big-wave surfing.',
    p3EN: 'WARNING: North Beach is NOT a swimming beach. Currents are extremely dangerous and bathing is discouraged even on calm days. Spectator access is via the Sítio viewpoint (cable car or road). Big-wave season runs October to March. Surfing at Nazaré Beach (to the south) is suitable for most levels in summer.',
    sourcesPT: 'Guinness World Records (2022) · Wikipedia (Canhão da Nazaré) · nazarewaves.com',
    sourcesEN: 'Guinness World Records (2022) · Wikipedia (Nazare Canyon) · nazarewaves.com',
  },
  {
    slug: 'supertubos-peniche',
    namePT: 'Praia de Supertubos (Peniche)',
    nameEN: 'Supertubos Beach (Peniche)',
    concelho: 'Peniche',
    regionPT: 'Centro &middot; Peniche',
    regionEN: 'Centro · Peniche',
    addressRegion: 'Peniche',
    lat: 39.3457, lon: -9.3647,
    descPT: 'O "Pipeline Português" — a única paragem WSL Championship Tour em território continental europeu.',
    descEN: 'The "Portuguese Pipeline" — the only WSL Championship Tour stop in continental Europe.',
    typePT: 'Beach break atlântico', typeEN: 'Atlantic beach break',
    waterPT: 'Boa', waterEN: 'Good',
    familyPT: 'Avançado (surf técnico)', familyEN: 'Advanced (technical surf)',
    lifeguardPT: 'Sim (sazonal)', lifeguardEN: 'Yes (seasonal)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Peniche', gyg_cmp: 'pthcard-centro',
    amenityPT: 'Surf (avançado)', amenityEN: 'Surfing (advanced)',
    p1PT: 'A Praia de Supertubos em Peniche acolhe o MEO Rip Curl Pro Portugal, paragem do Circuito Mundial de Surf (WSL Championship Tour) e o único evento de elite do WSL em território continental europeu desde 2009. Os melhores surfistas do mundo competem aqui em outubro, quando a ondulação atlântica atinge a consistência máxima.',
    p2PT: 'O break de Supertubos é um beach break sobre bancos de areia — sem recife, sem coral — que produz tubos ocos e potentes comparáveis ao Banzai Pipeline do Havai. A analogia não é exagerada: a compressão da onda sobre os bancos rasos gera barris perfeitos que cobrem surfistas experientes. É por isso que os profissionais lhe chamam o "Pipeline Europeu".',
    p3PT: 'A praia é adequada para espectadores mesmo sem surf: vista panorâmica do paredão de Peniche para as ondas. Acesso fácil da EN114. Surfistas avançados apenas nas condições de competição; em dias calmos, acessível a níveis intermédios. Peniche tem oferta completa de alojamento, restauração e aluguer de material.',
    p1EN: 'Supertubos Beach in Peniche hosts the MEO Rip Curl Pro Portugal, a WSL Championship Tour stop and the only elite WSL event in continental Europe since 2009. The world\'s best surfers compete here in October, when Atlantic swell reaches peak consistency.',
    p2EN: 'The Supertubos break is a beach break over sandbanks — no reef, no coral — that produces hollow, powerful barrels comparable to Hawaii\'s Banzai Pipeline. The analogy is not an exaggeration: wave compression over shallow sandbanks creates perfect barrels that cover experienced surfers. This is why professionals call it the "European Pipeline".',
    p3EN: 'The beach is suitable for spectators even without surfing: panoramic views from Peniche\'s seawall over the waves. Easy access from the EN114. Advanced surfers only in competition conditions; on calm days, accessible to intermediate levels. Peniche has full accommodation, restaurants and equipment hire.',
    sourcesPT: 'cm-peniche.pt · WSL (MEO Rip Curl Pro Portugal) · surfertoday.com (Supertubos)',
    sourcesEN: 'cm-peniche.pt · WSL (MEO Rip Curl Pro Portugal) · surfertoday.com (Supertubos)',
  },
  {
    slug: 'praia-de-matosinhos',
    namePT: 'Praia de Matosinhos',
    nameEN: 'Matosinhos Beach',
    concelho: 'Matosinhos',
    regionPT: 'Norte &middot; Porto',
    regionEN: 'Norte · Porto',
    addressRegion: 'Matosinhos',
    lat: 41.1768, lon: -8.6935,
    descPT: 'A praia urbana do Porto — acesso directo por Metro, frente atlântica e o melhor marisco da cidade.',
    descEN: 'Porto\'s urban beach — direct Metro access, Atlantic frontage and the city\'s best seafood.',
    typePT: 'Praia urbana', typeEN: 'Urban beach',
    waterPT: 'Boa (verificar APA)', waterEN: 'Good (verify APA)',
    familyPT: 'Sim', familyEN: 'Yes',
    lifeguardPT: 'Sim (sazonal)', lifeguardEN: 'Yes (seasonal)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Porto', gyg_cmp: 'pthcard-norte',
    amenityPT: 'Surf · Marisqueiras', amenityEN: 'Surfing · Seafood restaurants',
    p1PT: 'A Praia de Matosinhos é a praia de proximidade do Porto — acessível em cerca de 20 minutos de Metro (Linha Amarela, estação Matosinhos Sul) a partir do centro da cidade. Esta ligação metropolitana directa torna-a uma das praias urbanas mais bem servidas de transportes públicos do norte da Europa.',
    p2PT: 'Apesar da proximidade ao porto de Leixões e ao terminal petrolífero, Matosinhos é o spot de surf mais consistente do Porto, com beach break sem pedras que funciona durante todo o ano. A frente marítima é pontuada pelas mais famosas marisqueiras do Grande Porto — o marisco de Matosinhos é uma referência gastronómica nacional.',
    p3PT: 'Zonas de surf demarcadas por bóias; banho fora das zonas de surf designadas. Qualidade da água: consultar relatório anual APA antes de visitar — a proximidade portuária pode provocar variações sazonais. Estacionamento em toda a avenida marítima. Acesso a pé ou de Metro recomendado em época alta.',
    p1EN: 'Matosinhos Beach is Porto\'s proximity beach — reachable in about 20 minutes by Metro (Yellow Line, Matosinhos Sul station) from the city centre. This direct metropolitan connection makes it one of the best-served urban beaches by public transport in northern Europe.',
    p2EN: 'Despite proximity to Leixões harbour and the oil terminal, Matosinhos is Porto\'s most consistent surf spot, with a rock-free beach break that works year-round. The seafront is punctuated by the Grande Porto\'s most famous seafood restaurants — Matosinhos shellfish is a national gastronomic reference.',
    p3EN: 'Surfing zones are demarcated by buoys; bathing is in designated areas away from surf zones. Water quality: check the annual APA report before visiting — port proximity can cause seasonal variations. Parking along the entire seafront. Walking or Metro recommended in high season.',
    sourcesPT: 'Metro do Porto (Linha Amarela) · travel-in-portugal.com (Praia de Matosinhos) · praiasdeportugal.com',
    sourcesEN: 'Metro do Porto (Yellow Line) · travel-in-portugal.com (Matosinhos Beach) · praiasdeportugal.com',
  },
  {
    slug: 'praia-da-figueira-da-foz',
    namePT: 'Praia da Figueira da Foz',
    nameEN: 'Figueira da Foz Beach',
    concelho: 'Figueira da Foz',
    regionPT: 'Centro &middot; Coimbra',
    regionEN: 'Centro · Coimbra',
    addressRegion: 'Figueira da Foz',
    lat: 40.1509, lon: -8.8618,
    descPT: 'A "Rainha das Praias" — à foz do Mondego, com uma das maiores frentes de areia urbanas da Europa.',
    descEN: 'The "Queen of the Beaches" — at the Mondego estuary, with one of Europe\'s widest urban sandy fronts.',
    typePT: 'Praia urbana extensa', typeEN: 'Extended urban beach',
    waterPT: 'Boa a Excelente (Bandeira Azul)', waterEN: 'Good to Excellent (Blue Flag)',
    familyPT: 'Sim', familyEN: 'Yes',
    lifeguardPT: 'Sim (sazonal, múltiplos troços)', lifeguardEN: 'Yes (seasonal, multiple sections)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Coimbra', gyg_cmp: 'pthcard-centro',
    amenityPT: 'Surf · Casino · Infraestrutura completa', amenityEN: 'Surfing · Casino · Full facilities',
    p1PT: 'Apelidada a "Rainha das Praias" desde o século XIX, a Praia da Figueira da Foz apresenta uma faixa de areia de amplitude invulgar — em maré cheia, um visitante percorre vários minutos do passeio marítimo até chegar à água. A praia situa-se na foz do Rio Mondego, o mais longo rio inteiramente português, que desagua aqui após 234 km de percurso desde a Serra da Estrela.',
    p2PT: 'A praia divide-se em 13 troços nomeados, com o troço central Praia do Relógio a manter Bandeira Azul e acessos para mobilidade reduzida. O Casino da Figueira da Foz, um dos mais antigos de Portugal em funcionamento contínuo, ergue-se directamente sobre a frente de praia — uma raridade urbanística que testemunha a vocação turística da cidade desde o século XIX.',
    p3PT: 'Acesso fácil por A17 ou comboio (linha do Oeste) directo de Lisboa-Santa Apolónia. A praia tem infraestrutura completa: instalações sanitárias, apoios de praia, restaurantes, desportos náuticos. Vento de norte frequente em julho e agosto. Condições de surf moderadas; adequada a famílias e a todos os níveis.',
    p1EN: 'Nicknamed the "Queen of the Beaches" since the 19th century, Figueira da Foz Beach presents an unusually wide sand strip — at high tide, a visitor walks several minutes from the promenade to reach the water. The beach sits at the mouth of the Mondego River, the longest river flowing entirely within Portugal, which empties here after 234 km from the Serra da Estrela mountains.',
    p2EN: 'The beach is divided into 13 named sections, with the central Praia do Relógio section maintaining Blue Flag status and accessibility for reduced mobility. The Figueira da Foz Casino, one of the oldest continuously operating casinos in Portugal, stands directly on the beachfront — an urban rarity that testifies to the city\'s tourist vocation since the 19th century.',
    p3EN: 'Easy access via A17 motorway or direct train (Oeste line) from Lisbon-Santa Apolónia. The beach has full infrastructure: toilets, beach bars, restaurants, water sports. Northerly wind is frequent in July and August. Moderate surf conditions; suitable for families and all levels.',
    sourcesPT: 'Wikipedia (Figueira da Foz) · centerofportugal.com · cm-figfoz.pt',
    sourcesEN: 'Wikipedia (Figueira da Foz) · centerofportugal.com · cm-figfoz.pt',
  },
  {
    slug: 'praia-da-amoreira-aljezur',
    namePT: 'Praia da Amoreira',
    nameEN: 'Amoreira Beach',
    concelho: 'Aljezur',
    regionPT: 'Costa Vicentina &middot; Aljezur',
    regionEN: 'Costa Vicentina · Aljezur',
    addressRegion: 'Aljezur',
    lat: 37.3519, lon: -8.8445,
    descPT: 'Estuário da Ribeira de Aljezur na Costa Vicentina — lagoa calma para crianças e atlântico para surfistas, no mesmo areal.',
    descEN: 'Aljezur River estuary on the Vicentine Coast — calm lagoon for children and Atlantic waves for surfers, same beach.',
    typePT: 'Praia de estuário', typeEN: 'Estuary beach',
    waterPT: 'Excelente (Bandeira Azul)', waterEN: 'Excellent (Blue Flag)',
    familyPT: 'Sim (lagoa)', familyEN: 'Yes (lagoon)',
    lifeguardPT: 'Sim (sazonal)', lifeguardEN: 'Yes (seasonal)',
    webcamPT: 'Não', webcamEN: 'No',
    gyg_q: 'Aljezur', gyg_cmp: 'pthcard-vicentina',
    amenityPT: 'Surf · Observação de aves', amenityEN: 'Surfing · Birdwatching',
    p1PT: 'A Ribeira de Aljezur percorre cerca de 10 km desde a vila medieval de Aljezur até ao oceano, formando uma lagoa de estuário larga e rasa na extremidade sul da praia. Esta dupla personalidade é o trunfo da Amoreira: do mesmo areal, a lagoa oferece água calma, quente e rasa ideal para crianças; a frente atlântica apresenta ondulação constante para bodyboard e surf.',
    p2PT: 'A Praia da Amoreira integra o percurso do Trilho dos Pescadores da Rota Vicentina, percurso costeiro citado pelo Condé Nast Traveller entre os mais belos do mundo. O estuário é habitat de guarda-rios, abelharucos, garças e garçotas — avifauna observável durante todo o ano, com maior diversidade entre março e setembro. Bandeira Azul certificada.',
    p3PT: 'Acesso por estrada de terra a partir de Aljezur (7 km); sinalização clara da Rota Vicentina. Estacionamento gratuito no topo das falésias com descida a pé de 5 minutos. Apoio de praia e restaurante sazonais. Dentro do PNSACV — lume e acampamento proibidos.',
    p1EN: 'The Aljezur River travels about 10 km from the medieval village of Aljezur to the ocean, forming a wide shallow estuary lagoon at the southern end of the beach. This dual personality is Amoreira\'s greatest asset: from the same stretch of sand, the lagoon offers calm, warm, shallow water ideal for children; the Atlantic front presents consistent swell for bodyboarding and surfing.',
    p2EN: 'Amoreira Beach is part of the Rota Vicentina\'s Fishermen\'s Trail, a coastal route cited by Condé Nast Traveller among the world\'s most beautiful. The estuary is habitat for kingfishers, bee-eaters, herons and egrets — birdlife observable year-round, with greatest diversity between March and September. Blue Flag certified.',
    p3EN: 'Access via dirt road from Aljezur (7 km); clear Rota Vicentina signage. Free parking at the cliff top with a 5-minute walk down. Seasonal beach facilities and restaurant. Within PNSACV — fires and camping prohibited.',
    sourcesPT: 'Wikipedia (Praia da Amoreira) · walkalgarve.com (Trilho dos Pescadores) · cm-aljezur.pt',
    sourcesEN: 'Wikipedia (Praia da Amoreira) · walkalgarve.com (Fishermen\'s Trail) · cm-aljezur.pt',
  },
];

// ── HTML helpers ──────────────────────────────────────────────────────────────

function ptFooter() {
  return `
<footer class="footer" role="contentinfo">
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="footer-logo">
        <div class="footer-logo-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
        </div>
        <span>Portugal Travel Hub</span>
      </div>
      <p class="footer-tagline">O portal de referência das praias de Portugal &mdash; condições em tempo real, webcams e previsões.</p>
    </div>
    <nav class="footer-col" aria-label="Destinos">
      <h3 class="footer-heading">Destinos</h3>
      <ul>
        <li><a href="/beaches.html">Praias</a></li>
        <li><a href="/surf.html">Surf</a></li>
        <li><a href="/pesca.html">Pesca</a></li>
        <li><a href="/webcams.html">Webcams</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-label="Empresa">
      <h3 class="footer-heading">Empresa</h3>
      <ul>
        <li><a href="/sobre.html">Sobre N&oacute;s</a></li>
        <li><a href="/precos.html">Pre&ccedil;os</a></li>
        <li><a href="/planear.html">Planear</a></li>
        <li><a href="/parceiros.html">Parceiros</a></li>
        <li><a href="/contact.html">Contacto</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-label="Legal">
      <h3 class="footer-heading">Legal</h3>
      <ul>
        <li><a href="/privacidade.html">Privacidade</a></li>
        <li><a href="/terms.html">Termos</a></li>
        <li><a href="/cookies.html">Cookies</a></li>
      </ul>
    </nav>
  </div>
  <div class="footer-bottom">
    <span>&copy; 2026 Portugal Travel Hub. Todos os direitos reservados.</span>
    <span><a href="/sobre.html">Sobre</a> &middot; <a href="/contact.html">Contacto</a> &middot; <a href="/privacidade.html">Privacidade</a> &middot; <a href="/refund-policy.html">Pol&iacute;tica de Reembolso</a> &middot; <a href="/terms.html">Termos</a> &middot; <a href="/cookies.html">Cookies</a></span>
  </div>
</footer>`;
}

function enFooter() {
  return `
<footer class="footer" role="contentinfo">
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="footer-logo">
        <div class="footer-logo-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
        </div>
        <span>Portugal Travel Hub</span>
      </div>
      <p class="footer-tagline">Portugal's reference beach portal &mdash; real-time conditions, webcams and forecasts.</p>
    </div>
    <nav class="footer-col" aria-label="Destinations">
      <h3 class="footer-heading">Destinations</h3>
      <ul>
        <li><a href="/en/beaches.html">Beaches</a></li>
        <li><a href="/en/surf.html">Surf</a></li>
        <li><a href="/en/pesca.html">Fishing</a></li>
        <li><a href="/en/webcams.html">Webcams</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-label="Company">
      <h3 class="footer-heading">Company</h3>
      <ul>
        <li><a href="/en/sobre.html">About Us</a></li>
        <li><a href="/en/precos.html">Pricing</a></li>
        <li><a href="/en/planear.html">Plan</a></li>
        <li><a href="/en/parceiros.html">Partners</a></li>
        <li><a href="/contact.html">Contact</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-label="Legal">
      <h3 class="footer-heading">Legal</h3>
      <ul>
        <li><a href="/privacidade.html">Privacy</a></li>
        <li><a href="/terms.html">Terms</a></li>
        <li><a href="/cookies.html">Cookies</a></li>
      </ul>
    </nav>
  </div>
  <div class="footer-bottom">
    <span>&copy; 2026 Portugal Travel Hub. All rights reserved.</span>
    <span><a href="/sobre.html">About</a> &middot; <a href="/contact.html">Contact</a> &middot; <a href="/privacidade.html">Privacy</a> &middot; <a href="/refund-policy.html">Refund Policy</a> &middot; <a href="/terms.html">Terms</a> &middot; <a href="/cookies.html">Cookies</a></span>
  </div>
</footer>`;
}

function mobileBottomNav(lang) {
  if (lang === 'pt') {
    return `
<nav class="mobile-bottom-nav" aria-label="Navegação rápida">
  <div class="mobile-bottom-nav-inner">
    <a href="/" class="mobile-nav-item" aria-label="Início">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>
      In&iacute;cio
    </a>
    <a href="/beaches.html" class="mobile-nav-item active" aria-label="Ver todas as praias">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 20c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><line x1="12" y1="2" x2="12" y2="10"/></svg>
      Praias
    </a>
    <a href="/surf.html" class="mobile-nav-item" aria-label="Surf">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M8 6l4-4 4 4"/></svg>
      Surf
    </a>
    <a href="/pesca.html" class="mobile-nav-item" aria-label="Pesca">
      <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
      Pesca
    </a>
  </div>
</nav>`;
  } else {
    return `
<nav class="mobile-bottom-nav" aria-label="Quick navigation">
  <div class="mobile-bottom-nav-inner">
    <a href="/en/" class="mobile-nav-item" aria-label="Home">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/></svg>
      Home
    </a>
    <a href="/en/beaches.html" class="mobile-nav-item active" aria-label="See all beaches">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 14c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 20c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><line x1="12" y1="2" x2="12" y2="10"/></svg>
      Beaches
    </a>
    <a href="/en/surf.html" class="mobile-nav-item" aria-label="Surf">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12c0 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M8 6l4-4 4 4"/></svg>
      Surf
    </a>
    <a href="/en/pesca.html" class="mobile-nav-item" aria-label="Fishing">
      <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
      Fishing
    </a>
  </div>
</nav>`;
  }
}

function inlineCSS() {
  return `  <style>
    .beach-static-hero {
      background: linear-gradient(135deg, #0a3d6b 0%, #1a5c94 60%, #0a3d6b 100%);
      color: #fff;
      padding: clamp(48px, 8vw, 96px) clamp(20px, 5vw, 64px);
      text-align: center;
      min-height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .beach-static-hero-inner { max-width: 760px; margin: 0 auto; }
    .beach-static-hero h1 {
      font-family: 'Bodoni Moda', Georgia, serif;
      font-size: clamp(2rem, 5vw, 3.2rem);
      font-weight: 700;
      margin: 0 0 12px;
      line-height: 1.15;
    }
    .beach-static-hero-region {
      font-size: 0.95rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #c9a84c;
      margin-bottom: 18px;
      font-weight: 500;
    }
    .beach-static-hero-desc {
      font-size: clamp(1rem, 2.5vw, 1.15rem);
      line-height: 1.7;
      color: rgba(255,255,255,0.88);
      max-width: 600px;
      margin: 0 auto;
    }
    .beach-quick-facts { max-width: 900px; margin: 40px auto; padding: 0 clamp(16px, 4vw, 40px); }
    .beach-quick-facts h2 { font-family: 'Bodoni Moda', Georgia, serif; font-size: 1.5rem; color: var(--blue, #0a3d6b); margin-bottom: 20px; }
    .beach-quick-facts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
    .beach-fact-card { background: #f8f9fc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 14px; text-align: center; }
    .beach-fact-card-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.07em; color: #64748b; margin-bottom: 6px; }
    .beach-fact-card-value { font-size: 1rem; font-weight: 600; color: #0a3d6b; }
    .beach-editorial { max-width: 900px; margin: 40px auto; padding: 0 clamp(16px, 4vw, 40px); }
    .beach-editorial h2 { font-family: 'Bodoni Moda', Georgia, serif; font-size: 1.5rem; color: var(--blue, #0a3d6b); margin-bottom: 20px; }
    .beach-editorial p { font-size: 1rem; line-height: 1.75; color: #334155; margin-bottom: 1.2em; }
    .beach-affiliates { max-width: 900px; margin: 40px auto; padding: 0 clamp(16px, 4vw, 40px); display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 640px) { .beach-affiliates { grid-template-columns: 1fr; } }
    .beach-affiliate-block { background: #f0f7ff; border-radius: 12px; padding: 24px 20px; }
    .beach-affiliate-block h3 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin: 0 0 10px; }
    .beach-affiliate-gyg-link { display: inline-block; background: #ff6600; color: #fff; padding: 12px 20px; border-radius: 7px; text-decoration: none; font-size: 0.95rem; font-weight: 600; line-height: 1.3; }
    .beach-affiliate-gyg-link:hover { background: #e05a00; }
    .beach-amazon-block { background: #fffbf0; border-radius: 12px; padding: 24px 20px; }
    .beach-amazon-block h3 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin: 0 0 10px; }
    .beach-sources { max-width: 900px; margin: 32px auto 0; padding: 0 clamp(16px, 4vw, 40px) 20px; border-top: 1px solid #e2e8f0; }
    .beach-sources h3 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.07em; color: #94a3b8; margin: 16px 0 6px; }
    .beach-sources p { font-size: 0.78rem; color: #94a3b8; line-height: 1.6; }
    .beach-editorial-note { max-width: 900px; margin: 0 auto 48px; padding: 0 clamp(16px, 4vw, 40px); font-size: 0.8rem; color: #94a3b8; line-height: 1.6; padding-top: 12px; }
    .static-breadcrumb { max-width: 900px; margin: 16px auto 0; padding: 0 clamp(16px, 4vw, 40px); font-size: 0.82rem; color: #64748b; }
    .static-breadcrumb a { color: #0a3d6b; text-decoration: none; }
    .static-breadcrumb a:hover { text-decoration: underline; }
    .static-breadcrumb span { color: #94a3b8; margin: 0 5px; }
  </style>`;
}

function genPT(b) {
  const slug = b.slug;
  const url = `https://www.portalturismoportugal.com/praias/${slug}/`;
  const urlEN = `https://www.portalturismoportugal.com/en/praias/${slug}/`;
  const nameRaw = b.namePTraw || b.namePT.replace(/&[a-z]+;/g, c => {
    const map = {'&eacute;':'é','&atilde;':'ã','&ccedil;':'ç','&oacute;':'ó','&acirc;':'â','&iacute;':'í','&uacute;':'ú','&otilde;':'õ','&middot;':'·','&acirc;':'â'};
    return map[c] || c;
  });
  const titleStr = `${b.namePT} &middot; Portugal Travel Hub`.replace(/&middot;&middot;/g, '&middot;');
  const descMeta = `Conheça ${nameRaw} — ${b.descPT} Informação verificada, condições do mar e acesso.`;
  const amenityName = b.amenityPT.split(' · ')[0];

  return `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- META VERIFICATIONS -->
  <meta name="verification" content="d0777839626596440c5ac94e27e8b9e8" /> <!-- Awin -->
  <!-- /META VERIFICATIONS -->
  <!-- PWA -->
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#0a3d6b">
  <link rel="apple-touch-icon" href="/icons/icon-192.svg">
  <!-- Google tag (gtag.js) – Consent Mode v2 -->
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',wait_for_update:500});</script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-8YBQEM613J"></script>
  <script>gtag('js',new Date());gtag('config','G-8YBQEM613J');</script>
  <title>${titleStr}</title>
  <meta name="description" content="${descMeta}">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="pt" href="${url}">
  <link rel="alternate" hreflang="en" href="${urlEN}">
  <link rel="alternate" hreflang="x-default" href="${url}">
  <meta name="robots" content="index, follow">
  <meta property="og:type"        content="website">
  <meta property="og:url"         content="${url}">
  <meta property="og:title"       content="${titleStr}">
  <meta property="og:description" content="${b.descPT}">
  <meta property="og:site_name"   content="Portugal Travel Hub">
  <meta property="og:locale"      content="pt_PT">
  <meta property="og:image"       content="https://www.portalturismoportugal.com/og-image.png">
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${titleStr}">
  <meta name="twitter:description" content="${b.descPT}">
  <meta name="twitter:url"         content="${url}">
  <meta name="twitter:image"       content="https://www.portalturismoportugal.com/og-image.png">

  <!-- Schema.org: Beach + LocalBusiness + BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Beach",
    "name": "${nameRaw}",
    "description": "${b.descPT.replace(/"/g, '\\"')}",
    "url": "${url}",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": ${b.lat},
      "longitude": ${b.lon}
    },
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "${b.addressRegion}",
      "addressCountry": "PT"
    },
    "amenityFeature": [{"@type":"LocationFeatureSpecification","name":"${amenityName}","value":true}]
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "${nameRaw} — Portugal Travel Hub",
    "image": "https://www.portalturismoportugal.com/og-image.png",
    "url": "${url}",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "${b.addressRegion}",
      "addressCountry": "PT"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": ${b.lat},
      "longitude": ${b.lon}
    }
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type":"ListItem","position":1,"name":"Início","item":"https://www.portalturismoportugal.com/"},
      {"@type":"ListItem","position":2,"name":"Praias","item":"https://www.portalturismoportugal.com/beaches.html"},
      {"@type":"ListItem","position":3,"name":"${nameRaw}","item":"${url}"}
    ]
  }
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Fraunces:wght@300;400;600&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Fraunces:wght@300;400;600&display=swap" rel="stylesheet"></noscript>

  <link rel="stylesheet" href="/css/style.css?v=20260519-new15">
  <link rel="stylesheet" href="/css/beach-page.css?v=20260519-new15">
${inlineCSS()}
</head>
<body>

<a href="#main" class="skip-link">Saltar para o conte&uacute;do</a>

<nav class="navbar" role="navigation" aria-label="Navega&ccedil;&atilde;o principal" id="navbar">

  <a href="/" class="nav-logo" aria-label="Portugal Travel Hub - Home">
    <div class="nav-logo-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
    </div>
    Portugal Travel Hub
  </a>

  <div class="nav-links" role="list">
    <a href="/beaches.html" role="listitem">Praias</a>
    <a href="/surf.html" role="listitem">Surf</a>
    <a href="/pesca.html" role="listitem">Pesca</a>
    <a href="/webcams.html" role="listitem">Webcams</a>
    <a href="/planear.html" role="listitem">Planear</a>
    <a href="/guias.html" role="listitem">Guias</a>
    <a href="/precos.html" role="listitem">Pre&ccedil;os</a>
    <a href="/parceiros.html" role="listitem">Parceiros</a>
  </div>

  <div class="nav-actions">
    <div class="lang-switcher" aria-label="Sele&ccedil;&atilde;o de idioma">
      <span class="lang-btn lang-btn--active" aria-current="true" hreflang="pt">PT</span>
      <span class="lang-sep" aria-hidden="true">|</span>
      <a href="/en/praias/${slug}/" class="lang-btn" data-lang="en" onclick="try{localStorage.setItem('pth_lang','en')}catch(_){}" hreflang="en">EN</a>
    </div>
    <a href="/login.html" class="btn btn-outline" id="nav-login-btn">Entrar</a>
    <a href="/login.html#register" class="btn btn-primary" id="nav-register-btn">Registar</a>
    <button class="hamburger" type="button" id="nav-toggle" aria-label="Abrir menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>

</nav>

<main id="main">

  <nav class="static-breadcrumb" aria-label="Localiza&ccedil;&atilde;o na p&aacute;gina">
    <a href="/">In&iacute;cio</a>
    <span aria-hidden="true">&rsaquo;</span>
    <a href="/beaches.html">Praias</a>
    <span aria-hidden="true">&rsaquo;</span>
    <span>${b.namePT}</span>
  </nav>

  <section class="beach-static-hero" aria-labelledby="beach-h1">
    <div class="beach-static-hero-inner">
      <p class="beach-static-hero-region">${b.regionPT}</p>
      <h1 id="beach-h1">${b.namePT}</h1>
      <p class="beach-static-hero-desc">${b.descPT}</p>
    </div>
  </section>

  <section class="beach-quick-facts" aria-label="Informa&ccedil;&atilde;o r&aacute;pida sobre ${nameRaw}">
    <h2>Informa&ccedil;&atilde;o da Praia</h2>
    <div class="beach-quick-facts-grid">
      <div class="beach-fact-card">
        <div class="beach-fact-card-label">Tipo</div>
        <div class="beach-fact-card-value">${b.typePT}</div>
      </div>
      <div class="beach-fact-card">
        <div class="beach-fact-card-label">Qualidade da &Aacute;gua</div>
        <div class="beach-fact-card-value">${b.waterPT}</div>
      </div>
      <div class="beach-fact-card">
        <div class="beach-fact-card-label">Fam&iacute;lia</div>
        <div class="beach-fact-card-value">${b.familyPT}</div>
      </div>
      <div class="beach-fact-card">
        <div class="beach-fact-card-label">Nadador-Salvador</div>
        <div class="beach-fact-card-value">${b.lifeguardPT}</div>
      </div>
      <div class="beach-fact-card">
        <div class="beach-fact-card-label">Webcam</div>
        <div class="beach-fact-card-value">${b.webcamPT}</div>
      </div>
      <div class="beach-fact-card">
        <div class="beach-fact-card-label">Regi&atilde;o</div>
        <div class="beach-fact-card-value">${b.addressRegion}</div>
      </div>
    </div>
  </section>

  <section class="beach-editorial" aria-label="Sobre ${nameRaw}">
    <h2>Sobre a Praia</h2>
    <p>${b.p1PT}</p>
    <p>${b.p2PT}</p>
    <p>${b.p3PT}</p>
  </section>

  <section class="beach-affiliates" aria-label="Experi&ecirc;ncias e alojamento">
    <div class="beach-affiliate-block">
      <h3>Experi&ecirc;ncias na regi&atilde;o</h3>
      <a href="https://www.getyourguide.com/s/?q=${encodeURIComponent(b.gyg_q)}&partner_id=0WTBHZE&cmp=${b.gyg_cmp}"
         rel="sponsored noopener noreferrer"
         target="_blank"
         data-track="gyg-static-praia"
         class="beach-affiliate-gyg-link">
        Ver experi&ecirc;ncias em ${b.gyg_q} no GetYourGuide &rarr;
      </a>
    </div>
    <div class="beach-amazon-block">
      <h3>Equipamento de praia</h3>
<script>
  amzn_assoc_tracking_id = "pthportugal-21";
  amzn_assoc_ad_mode = "auto";
  amzn_assoc_ad_type = "smart";
  amzn_assoc_marketplace = "amazon";
  amzn_assoc_region = "ES";
</script>
<script src="//z-eu.associates-amazon.com/s/getads.js?Marketplace=ES"></script>
    </div>
  </section>

  <div class="beach-sources">
    <h3>Refer&ecirc;ncias editoriais</h3>
    <p>${b.sourcesPT}</p>
  </div>

  <p class="beach-editorial-note">
    Informa&ccedil;&atilde;o editorial curada pela equipa do Portugal Travel Hub. Qualidade da &aacute;gua por an&aacute;lise oficial da APA.
    <strong>Antes de partir:</strong> confirme hor&aacute;rio do nadador-salvador, acesso vi&aacute;rio e lota&ccedil;&atilde;o &mdash; especialmente em &eacute;poca alta e ap&oacute;s chuva intensa.
    <br>&Uacute;ltima actualiza&ccedil;&atilde;o: 2026-05-19.
  </p>

</main>
${ptFooter()}
${mobileBottomNav('pt')}

<script src="/js/config.js?v=20260519-new15" defer></script>
<script src="/js/nav.js?v=20260519-new15" defer></script>
<script src="/js/lang-switcher.js" defer></script>
<script src="/js/cookie-consent.js" defer></script>
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
  }
</script>

</body>
</html>`;
}

function genEN(b) {
  const slug = b.slug;
  const url = `https://www.portalturismoportugal.com/en/praias/${slug}/`;
  const urlPT = `https://www.portalturismoportugal.com/praias/${slug}/`;
  const nameRaw = b.nameENraw || b.nameEN;
  const titleStr = `${b.nameEN} &middot; Portugal Travel Hub`;
  const descMeta = `Discover ${nameRaw} &mdash; ${b.descEN} Verified information, sea conditions and access.`;
  const amenityName = b.amenityEN.split(' · ')[0];

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- META VERIFICATIONS -->
  <meta name="verification" content="d0777839626596440c5ac94e27e8b9e8" /> <!-- Awin -->
  <!-- /META VERIFICATIONS -->
  <!-- PWA -->
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#0a3d6b">
  <link rel="apple-touch-icon" href="/icons/icon-192.svg">
  <!-- Google tag (gtag.js) – Consent Mode v2 -->
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',wait_for_update:500});</script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-8YBQEM613J"></script>
  <script>gtag('js',new Date());gtag('config','G-8YBQEM613J');</script>
  <title>${titleStr}</title>
  <meta name="description" content="${descMeta}">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="pt" href="${urlPT}">
  <link rel="alternate" hreflang="en" href="${url}">
  <link rel="alternate" hreflang="x-default" href="${urlPT}">
  <meta name="robots" content="index, follow">
  <meta property="og:type"        content="website">
  <meta property="og:url"         content="${url}">
  <meta property="og:title"       content="${titleStr}">
  <meta property="og:description" content="${b.descEN}">
  <meta property="og:site_name"   content="Portugal Travel Hub">
  <meta property="og:locale"      content="en_GB">
  <meta property="og:image"       content="https://www.portalturismoportugal.com/og-image.png">
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${titleStr}">
  <meta name="twitter:description" content="${b.descEN}">
  <meta name="twitter:url"         content="${url}">
  <meta name="twitter:image"       content="https://www.portalturismoportugal.com/og-image.png">

  <!-- Schema.org: Beach + LocalBusiness + BreadcrumbList -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Beach",
    "name": "${nameRaw}",
    "description": "${b.descEN.replace(/"/g, '\\"')}",
    "url": "${url}",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": ${b.lat},
      "longitude": ${b.lon}
    },
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "${b.addressRegion}",
      "addressCountry": "PT"
    },
    "amenityFeature": [{"@type":"LocationFeatureSpecification","name":"${amenityName}","value":true}]
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "${nameRaw} — Portugal Travel Hub",
    "image": "https://www.portalturismoportugal.com/og-image.png",
    "url": "${url}",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "${b.addressRegion}",
      "addressCountry": "PT"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": ${b.lat},
      "longitude": ${b.lon}
    }
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type":"ListItem","position":1,"name":"Home","item":"https://www.portalturismoportugal.com/en/"},
      {"@type":"ListItem","position":2,"name":"Beaches","item":"https://www.portalturismoportugal.com/en/beaches.html"},
      {"@type":"ListItem","position":3,"name":"${nameRaw}","item":"${url}"}
    ]
  }
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Fraunces:wght@300;400;600&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Fraunces:wght@300;400;600&display=swap" rel="stylesheet"></noscript>

  <link rel="stylesheet" href="/css/style.css?v=20260519-new15">
  <link rel="stylesheet" href="/css/beach-page.css?v=20260519-new15">
${inlineCSS()}
</head>
<body>

<a href="#main" class="skip-link">Skip to content</a>

<nav class="navbar" role="navigation" aria-label="Main navigation" id="navbar">

  <a href="/en/" class="nav-logo" aria-label="Portugal Travel Hub - Home">
    <div class="nav-logo-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
    </div>
    Portugal Travel Hub
  </a>

  <div class="nav-links" role="list">
    <a href="/en/beaches.html" role="listitem">Beaches</a>
    <a href="/en/surf.html" role="listitem">Surf</a>
    <a href="/en/pesca.html" role="listitem">Fishing</a>
    <a href="/en/webcams.html" role="listitem">Webcams</a>
    <a href="/en/planear.html" role="listitem">Plan</a>
    <a href="/en/guias.html" role="listitem">Guides</a>
    <a href="/en/precos.html" role="listitem">Pricing</a>
    <a href="/en/parceiros.html" role="listitem">Partners</a>
  </div>

  <div class="nav-actions">
    <div class="lang-switcher" aria-label="Language selection">
      <a href="/praias/${slug}/" class="lang-btn" data-lang="pt" onclick="try{localStorage.setItem('pth_lang','pt')}catch(_){}" hreflang="pt">PT</a>
      <span class="lang-sep" aria-hidden="true">|</span>
      <span class="lang-btn lang-btn--active" aria-current="true" hreflang="en">EN</span>
    </div>
    <a href="/login.html" class="btn btn-outline" id="nav-login-btn">Sign in</a>
    <a href="/login.html#register" class="btn btn-primary" id="nav-register-btn">Register</a>
    <button class="hamburger" type="button" id="nav-toggle" aria-label="Open menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>

</nav>

<main id="main">

  <nav class="static-breadcrumb" aria-label="Page location">
    <a href="/en/">Home</a>
    <span aria-hidden="true">&rsaquo;</span>
    <a href="/en/beaches.html">Beaches</a>
    <span aria-hidden="true">&rsaquo;</span>
    <span>${nameRaw}</span>
  </nav>

  <section class="beach-static-hero" aria-labelledby="beach-h1">
    <div class="beach-static-hero-inner">
      <p class="beach-static-hero-region">${b.regionEN}</p>
      <h1 id="beach-h1">${nameRaw}</h1>
      <p class="beach-static-hero-desc">${b.descEN}</p>
    </div>
  </section>

  <section class="beach-quick-facts" aria-label="Quick information about ${nameRaw}">
    <h2>Beach Information</h2>
    <div class="beach-quick-facts-grid">
      <div class="beach-fact-card">
        <div class="beach-fact-card-label">Type</div>
        <div class="beach-fact-card-value">${b.typeEN}</div>
      </div>
      <div class="beach-fact-card">
        <div class="beach-fact-card-label">Water Quality</div>
        <div class="beach-fact-card-value">${b.waterEN}</div>
      </div>
      <div class="beach-fact-card">
        <div class="beach-fact-card-label">Family</div>
        <div class="beach-fact-card-value">${b.familyEN}</div>
      </div>
      <div class="beach-fact-card">
        <div class="beach-fact-card-label">Lifeguard</div>
        <div class="beach-fact-card-value">${b.lifeguardEN}</div>
      </div>
      <div class="beach-fact-card">
        <div class="beach-fact-card-label">Webcam</div>
        <div class="beach-fact-card-value">${b.webcamEN}</div>
      </div>
      <div class="beach-fact-card">
        <div class="beach-fact-card-label">Region</div>
        <div class="beach-fact-card-value">${b.addressRegion}</div>
      </div>
    </div>
  </section>

  <section class="beach-editorial" aria-label="About ${nameRaw}">
    <h2>About the Beach</h2>
    <p>${b.p1EN}</p>
    <p>${b.p2EN}</p>
    <p>${b.p3EN}</p>
  </section>

  <section class="beach-affiliates" aria-label="Experiences and accommodation">
    <div class="beach-affiliate-block">
      <h3>Experiences in the region</h3>
      <a href="https://www.getyourguide.com/s/?q=${encodeURIComponent(b.gyg_q)}&partner_id=0WTBHZE&cmp=${b.gyg_cmp}"
         rel="sponsored noopener noreferrer"
         target="_blank"
         data-track="gyg-static-praia"
         class="beach-affiliate-gyg-link">
        See experiences in ${b.gyg_q} on GetYourGuide &rarr;
      </a>
    </div>
    <div class="beach-amazon-block">
      <h3>Beach equipment</h3>
<script>
  amzn_assoc_tracking_id = "pthportugal-21";
  amzn_assoc_ad_mode = "auto";
  amzn_assoc_ad_type = "smart";
  amzn_assoc_marketplace = "amazon";
  amzn_assoc_region = "ES";
</script>
<script src="//z-eu.associates-amazon.com/s/getads.js?Marketplace=ES"></script>
    </div>
  </section>

  <div class="beach-sources">
    <h3>Editorial references</h3>
    <p>${b.sourcesEN}</p>
  </div>

  <p class="beach-editorial-note">
    Editorial content curated by the Portugal Travel Hub team. Water quality per official APA analysis.
    <strong>Before you go:</strong> confirm lifeguard hours, road access and capacity &mdash; especially in high season and after heavy rain.
    <br>Last updated: 2026-05-19.
  </p>

</main>
${enFooter()}
${mobileBottomNav('en')}

<script src="/js/config.js?v=20260519-new15" defer></script>
<script src="/js/nav.js?v=20260519-new15" defer></script>
<script src="/js/lang-switcher.js" defer></script>
<script src="/js/cookie-consent.js" defer></script>
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function() {});
    });
  }
</script>

</body>
</html>`;
}

// ── Generate files ────────────────────────────────────────────────────────────

let count = 0;
for (const b of beaches) {
  // PT
  const ptDir = path.join(ROOT, 'praias', b.slug);
  fs.mkdirSync(ptDir, { recursive: true });
  fs.writeFileSync(path.join(ptDir, 'index.html'), genPT(b), 'utf8');
  console.log(`PT  praias/${b.slug}/index.html`);

  // EN
  const enDir = path.join(ROOT, 'en', 'praias', b.slug);
  fs.mkdirSync(enDir, { recursive: true });
  fs.writeFileSync(path.join(enDir, 'index.html'), genEN(b), 'utf8');
  console.log(`EN  en/praias/${b.slug}/index.html`);

  count += 2;
}

console.log(`\nGenerated ${count} files (${count/2} PT + ${count/2} EN).`);
