/**
 * translate-beaches-batch.mjs
 * Translate 109 remaining beaches PT→EN. Claude-translated in-context, May 2026.
 * Based on translate-beaches-poc.mjs (5/5 success confirmed).
 * Run: node _scripts/translate-beaches-batch.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dirname, '../.env');
  const raw = readFileSync(envPath, 'utf8');
  raw.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq < 0) return;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  });
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('FATAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from .env');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Translations (Claude, in-context, May 2026) ───────────────────────────────
// British English. Geographic proper nouns never translated.
// water_quality: Boa→Good, Excelente→Excellent, null→null
// facilities: lowercase English DB values capitalised to display strings
// beach_type: null for all (0 filled in this batch)
const TRANSLATIONS = {
  // rank 6
  'd81736c8-0e7d-4d98-b369-377998fc5c2f': {
    description_en: 'Praia das Maçãs sits on the Sintra coastline, in a village that has preserved its character as a small-scale seaside resort over the decades — served by a historic tram that descends from Sintra to the beach, turning the journey into an experience that goes beyond simply reaching the water. Water quality is Good. The sandy stretch is contained in size, and the Atlantic swell along this coast is open and frank — well suited for surfing and bodyboarding. Praia das Maçãs is the endpoint of a coastal sequence that includes beaches such as Azenhas do Mar and Magoito — each with its own character, all within the boundaries of the Parque Natural de Sintra-Cascais.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // rank 7
  '406a09d1-daa7-44b3-aa19-3a13b4aab711': {
    description_en: 'Praia de Carcavelos is the largest beach between Lisbon and Cascais — a wide, open sandy stretch with good surf conditions, direct train links from central Lisbon and a profile that has made it the main surf learning hub for the greater Lisbon area. Water quality is Good. The beach has full support infrastructure and a lively seafront atmosphere that sets it apart from the quieter beaches along this coastline. Forte de São Julião da Barra — one of the best-preserved maritime fortresses on the Portuguese coast — juts out into the sea at one end of the beach, adding an unusual historical dimension to the setting.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // rank 8
  'fede421d-0f75-46f7-9248-9a374bc63c4c': {
    description_en: 'Praia de Cascais is the town beach — an urban, accessible sandy stretch a few minutes\' walk from the historic centre of Cascais and its marina. Water quality is Good. The beach is compact but well positioned, with the bay of Cascais providing some shelter from the open Atlantic swell. The ability to combine beach, historic centre and marina in a single stroll is one of the main draws of visiting Cascais. For longer beach sessions, the neighbouring beaches offer more space — but Praia de Cascais has the unbeatable advantage of convenience and the human scale of the town.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // rank 9
  '513d687d-b8f9-4d87-b5a7-c6de1d7d695c': {
    description_en: 'Praia Grande sits on the Sintra coastline, and its name delivers on its promise — it is genuinely large: wide, long and fully exposed to the Atlantic swell along this stretch of the Sintra-Cascais coast. Water quality is Good. The adjacent cliffs contain dinosaur footprints preserved in the sedimentary rock — one of the most publicly accessible palaeontological sites in Portugal. The consistent swell makes it popular for surfing, and the scale of the beach absorbs summer crowds well. It complements the smaller Azenhas do Mar a few minutes away — two very different types of beach on the same stretch of coastline.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // rank 10
  '66ee7f6b-018b-408b-8d48-c58d2f73bf8d': {
    description_en: 'Nestled between golden limestone cliffs sculpted by the Atlantic, Praia da Marinha presents a setting of natural rock pools, stone arches and sea caves accessible on foot at low tide. Water quality is Excellent — clear and turquoise, characteristic of the central Algarve. The sandy strip is small and sheltered, quieter than the extensive beaches of the region. Access is via steep steps from the clifftop. An ideal choice for snorkelling, photography and exploring the natural pools between tides.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // rank 11
  'd3bb1bb1-4e97-424d-9267-710673662975': {
    description_en: 'Praia de Benagil is world-renowned for the Algar de Benagil sea cave — a limestone chamber with a natural oculus in its ceiling that allows sunlight to fall directly onto the sand below. The beach itself is small and set between cliffs, with Excellent water quality. The cave is only accessible by sea, by kayak, stand-up paddleboard or boat — local operators run regular departures from the beach. For those who prefer not to enter the water, a clifftop path offers a view from above. One of the most recognisable settings on the entire Portuguese coast.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // rank 12
  'dd37d1cd-8ecc-45af-b8d2-3ceabf881969': {
    description_en: 'Praia de Ofir sits on the northern bank of the mouth of the Cávado river, in Esposende, with high dunes, pine-covered dune land and a wild Atlantic character that contrasts with the more organised tourism of beaches to the south. Water quality is Good. The dunes of Ofir are among the most significant on the northern coastline — sand accumulations reaching considerable heights that have been subject to environmental protection efforts. It is a beach with a strong northern coastal identity: wind, sand, pine trees and the Atlantic asserting its scale.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // rank 13
  '8d29adfa-7276-4074-bce6-dc1c6b49ae12': {
    description_en: 'Praia do Guincho lies within the Parque Natural de Sintra-Cascais, a few kilometres from Cascais, with full Atlantic exposure that makes it one of the windiest and most untamed beaches on the coastline near Lisbon. Water quality is Good. The wind and swell conditions have made it one of Europe\'s foremost windsurfing and kitesurfing locations — Guincho has hosted several stages of world championship events. The surrounding landscape — dunes, rock formations and the Serra de Sintra in the background — has a raw beauty that contrasts sharply with the ordered urban beaches along the Linha. For sport or scenery, it is one of the beaches with the most distinct character on this entire coast.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // rank 14
  '4bd3bca5-6c5b-486d-87c0-bd21ea5435ce': {
    description_en: 'Zambujeira do Mar is one of the most sheltered beaches on the Costa Vicentina — the sandy cove sits between tall cliffs that block the wind and create an almost theatrical sense of seclusion. Water quality is Good. Access is via a descent through cliff vegetation that brings the ocean into view gradually. The beach is also known for the Sudowest NOS music festival, which transforms the natural cliff amphitheatre into one of the most singular open-air festival settings in the country. Outside the festival season, Zambujeira is a surf beach with rural identity and a character entirely its own.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // rank 15
  'ebf82db0-f4b2-4bb7-a1fb-ec6f07e90632': {
    description_en: 'Jardim do Mar is one of the smallest and most characterful coastal villages on Madeira — a clifftop settlement on the island\'s southern flank, with houses facing the Atlantic and one of the island\'s finest surf spots directly below. Water quality is Good. The coastline at Jardim do Mar, formed by lava and natural reef, produces waves that attract surfers from across Europe during the winter months. The village remains very small and unchanged, and the winding clifftop road that approaches it makes the arrival part of the experience.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // rank 16
  'b04adbca-20fc-44e0-b947-066978b8fffc': {
    description_en: 'Praia do Amado is one of the surf landmarks of the Costa Vicentina — a wide, open sandy beach fully exposed to the Atlantic swell, with no natural barriers to moderate the wind and sea conditions. Water quality is Good. The beach falls within the Parque Natural do Sudoeste Alentejano e Costa Vicentina, which restricts development and preserves the open character of the place. Outside the peak swell seasons, the broad sandy expanse and the immensity of the Atlantic horizon give the beach a personality of its own, albeit with less infrastructure than beaches further south.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // rank 17
  'cd38e95f-282e-4d59-bca9-5ff03d43cee8': {
    description_en: 'An extensive wild beach within the Parque Natural do Sudoeste Alentejano e Costa Vicentina, near Vila do Bispo. Atlantic swell, high cliffs and almost no tourist infrastructure. One of the most exposed and least developed stretches of the western Algarve coastline.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // rank 18
  '2cb7aca0-9280-4405-8390-3f592e3ef0f5': {
    description_en: 'Praia da Falésia stretches for several kilometres of sandy beach between Vilamoura and Olhos de Água, flanked by rust-red and ochre cliffs that contrast with the blue of the Atlantic. It is one of the longest beaches in the Algarve and has been repeatedly recognised among the best in Europe, combining Excellent water quality, considerable length and the striking visual backdrop of the cliffs. With no immediate development at the water\'s edge, it retains a natural character and avoids the density of support structures found at some other beaches in the region. Access is via steps or footpaths from the clifftop.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // rank 19
  '9ff93289-f391-41aa-bdd1-d7d55637a9a2': {
    description_en: 'Praia da Rocha is one of the most visited beaches in the Algarve — a long sandy stretch flanked by imposing limestone cliffs, adjacent to the city of Portimão. Water quality is Excellent. The beach is long, well equipped and easily accessible, with a walkway along the clifftops offering views over the rock formations of the area. It is an urban beach with full infrastructure available nearby. Arriving by boat from Ferragudo, on the opposite bank of the Arade estuary, is one of the most pleasant ways to approach the beach and gives a clear sense of the scale of this stretch of coast.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // rank 20
  'dee27f4d-ec13-43b4-a618-4ac272d22cf2': {
    description_en: 'Praia de São Torpes sits south of Sines, in a transition zone between the industrial port coastline and the beginning of the wilder Alentejo coast. Water quality is Good. The beach is extensive and relatively easy to reach, with dunes stabilised by coastal vegetation. The Atlantic swell conditions make it popular with surfers, and the frequent south-westerly wind also attracts windsurfers. It is a beach with an open horizon and few visual interruptions — the kind of coastal stretch that is rare in the vicinity of an industrial centre.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // rank 21
  '37fd270d-1dd5-4701-af07-f0ede1590069': {
    description_en: 'A hidden beach in the south-western Algarve, near Vila do Bispo, with good surf conditions and access via an unpaved road. Minimal infrastructure and genuine character — one of those spots that rewards the effort of finding it.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // rank 22 — facilities: lifeguard, toilets, bar
  '081ec673-aec2-4015-b711-4f88b2664914': {
    description_en: 'A barrier island within the Ria Formosa, accessible by ferry from Tavira. The lagoon side offers calm, warm water; the oceanic side faces the open Atlantic with more movement. One of the most loved beaches of the eastern Algarve, with a lifeguard, restrooms and a bar on site.',
    water_quality_en: 'Excellent',
    facilities_en: ['Lifeguard', 'Restrooms', 'Bar'],
  },
  // rank 23
  'f7fa6d81-2872-4971-be81-42464b11ac9f': {
    description_en: 'Praia das Caxinas is in Vila do Conde, associated with the fishing community that gives it its name — one of the most active on the northern Portuguese coast. Water quality is Good. The beach has a distinctly local character, and the presence of artisanal fishing — boats, fishing gear and the activity of the harbour — lends it an authenticity that more tourist-facing beaches rarely achieve. The seafront of Vila do Conde, with its monastery and historic bridge in the background, is a setting that distinguishes this stretch of the Minho and Douro coastline.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // rank 24
  '23467c12-84bc-4590-a3a8-32412c15fcde': {
    description_en: 'Praia de Carvoeiro is a cove beach set between cliffs, with the village of Carvoeiro looking directly out to sea from the clifftop above. The sandy stretch is small and flanked by golden limestone, giving it a welcoming and photogenic character. Water quality is Excellent. The beach is one of the starting points for exploring the cave and sea-arch coastline of this section of the Algarve — the Algar Seco route, a few minutes on foot, offers views over remarkable rock formations. The village has restaurants and local shops within easy reach, without the resort scale of larger beaches in the region.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // rank 25
  'de8ce91b-729b-451d-9eac-1eedd1d62790': {
    description_en: 'Praia de Porto Santo is one of the defining Atlantic sandy beaches in the Madeira archipelago — a stretch of several kilometres of fine, pale, warm sand that occupies almost the entire southern coast of Porto Santo island. Water quality is Excellent. The sand at Porto Santo has a recognised mineral composition, with therapeutic properties attributed to elements that distinguish it from ordinary sandy beaches. The island operates at a human scale and at an unhurried pace, very different from Madeira: less lush vegetation, more light, more wind, and an Atlantic that turns turquoise in summer and rarely disappoints.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Madeira
  'aa950882-863f-42db-81b8-0c5e9d64ba24': {
    description_en: 'Fajã da Areia is a fajã on the northern coast of Madeira — a lava platform that extends into the ocean and creates a point of contact with the sea that has its own particular character. Water quality is Good. Reaching it requires deliberate effort, and the setting is one of raw Atlantic coastline — with no mediation between visitor and the open northern ocean. The contrast between dark lava, clifftop vegetation and the deep blue of the Atlantic makes for a striking visual composition. It is one of the least accessible fajãs on Madeira, which contributes to its quiet and its preservation.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve
  '89fa1083-95bf-42e7-bd28-ad34740851cf': {
    description_en: 'Ilha da Culatra is a barrier island within the Ria Formosa, accessible only by boat from Olhão or Faro. Without cars or traffic, it has two distinct sides: the ocean-facing beaches open to the Atlantic, with Excellent water quality, and the lagoon-facing margins, calmer and shallower. The fishing village on the island retains a genuinely local character. The boat crossing is part of the experience — returning at the end of the day as the Ria Formosa turns golden in the late sun is one of the most memorable moments the Algarve coast has to offer.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Oeste (region label is Oeste but the lagoon is south of Lisbon / Setúbal area)
  'e11188da-c19e-4c9d-a2a6-59f777412a05': {
    description_en: 'Lagoa de Albufeira is a coastal lagoon south of Lisbon, separated from the Atlantic by a sand bar that creates two distinct bathing environments: the open ocean with its Atlantic swell, and the sheltered lagoon with calm, warmer water that heats up faster in summer. Water quality is Good. The coexistence of these two environments in a single space is the main draw of the place, making it a versatile option for families with young children. The area also attracts windsurfers and kitesurfers when the southerly wind picks up.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve/Vila Real de Santo António, facilities: lifeguard, toilets, bar
  '3be6e364-0660-4b97-be03-67b7c4053070': {
    description_en: 'A quiet beach at the eastern tip of the Algarve, alongside the Ria Formosa. Calm water, low visitor numbers and a local community that keeps the place uncomplicated. A lifeguard, restrooms and a bar are available on site.',
    water_quality_en: 'Excellent',
    facilities_en: ['Lifeguard', 'Restrooms', 'Bar'],
  },
  // null rank — Algarve
  '9b62bea8-e8c4-44f1-9ab5-9e9864cf6bb5': {
    description_en: 'Meia Praia stretches for several kilometres east of Lagos, one of the longest sandy stretches on the western Algarve coast. Water quality is Excellent. Unlike the rocky cove beaches tucked between cliffs in the Lagos area, Meia Praia has scale and openness that allow it to absorb visitors without losing its beach character. From the sand you can see the city of Lagos and the mouth of the Bensafrim river. It offers a different scale from the rocky beaches of the Lagos coast — ideal for those seeking a long sandy beach, easy access and good water quality.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // PAGE_HERO_PESCA — placeholder, description already in English, use variant text
  'bda7327b-9ffb-4d86-b241-6dba88ed8dfd': {
    description_en: 'Hero image placeholder for the fishing page. Not a real beach.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // PAGE_HERO_SURF — placeholder
  '7f6e2b93-211c-4e22-87ff-f1565a019ca6': {
    description_en: 'Hero image placeholder for the surf page. Not a real beach.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // PAGE_HERO_WEBCAMS — placeholder
  'ec40e481-5ec8-4f82-b728-535987fc0eb6': {
    description_en: 'Hero image placeholder for the webcams page. Not a real beach.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Madeira
  'fdf3f8dc-a8e9-491e-9c9e-4bea8bb8fa47': {
    description_en: 'Paul do Mar is a fishing village wedged between the southern cliffs of Madeira and the Atlantic — in a narrow space where houses sit literally between the rock face and the sea. Water quality is Good. The coastline here is lava and pebble, without a conventional sandy beach, but with natural rock pools that serve as the swimming and diving point for the community. It is a village with a strong identity of its own, defined by fishing and its exceptional geographic position. For visitors exploring the south-west of Madeira, Paul do Mar conveys the island\'s human scale in a direct and immediate way.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Oeste (Arrábida)
  'cb7d55ac-702f-49ec-98f7-d2c8c8e62715': {
    description_en: 'Portinho da Arrábida is the defining beach of the Arrábida coast — a cove with emerald-green and turquoise water whose exceptional colour comes from the white limestone cliffs that surround the bay. Water quality is Good. It sits within the Parque Natural da Arrábida, which limits vehicle access and contributes to preserving the quality of the environment. Diving at Portinho is among the richest on the Portuguese coast, with underwater visibility and marine biodiversity that are rarely found elsewhere on the continental shoreline. One of the most extraordinary beaches in Portugal — a short distance from Lisbon.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve
  'efdfab6a-36b9-42a6-8e11-019450a51c86': {
    description_en: 'Praia da Altura is in the eastern Algarve, close to the Spanish border, in a zone with lower tourist density than the central Algarve. Water quality is Excellent. The beach is long with fine sand and accessed from the village of Altura, which remains modestly sized. The absence of the rocky formations typical of beaches further west is offset by the tranquillity and the extent of coastline. For visitors to the eastern Algarve, Praia da Altura offers good bathing conditions with less pressure than the beaches of the central region.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Centro
  'fd1474e1-7acb-4635-822d-df649332769e': {
    description_en: 'Praia da Areia Branca is on the Lourinhã coast, an area of Estremadura also known for its palaeontological finds. The beach is generously sized and easily accessible, with Good water quality and Atlantic exposure that generates swell suitable for surfing. The cliffs alongside part of the sandy beach have a sedimentary composition that attracts visitors with an interest in geology, in addition to regular bathers. It is an Estremadura beach that combines good bathing conditions with a territorial context of genuine interest.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Centro (Aveiro)
  '47af766c-c76f-483f-986b-5dbefd6f294a': {
    description_en: 'Praia da Barra sits at the mouth of the Ria de Aveiro, next to the channel that connects the lagoon to the Atlantic — identifiable from a distance by the red-and-white striped lighthouse, one of the tallest in Portugal. Water quality is Good. The sandy beach is extensive and the currents of the channel mouth add dynamism to the sea conditions. The Ria de Aveiro, visible on the other side of the channel, provides a counterpoint of calm water to the Atlantic swell of the beach. One of the reference beaches of the Aveiro coast, easily accessible from the city and the lagoon complex.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve/Aljezur
  '868b17e0-9f74-46b1-8f84-bacc0ff7db94': {
    description_en: 'A wild Atlantic beach near the village of Carrapateira, on the Costa Vicentina. Consistent swell, impressive cliffs and a small fishing village that has not yet been absorbed by mass tourism.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Alentejo
  '91f9ac99-a4b2-4793-afba-5b7f79d72d54': {
    description_en: 'Praia da Comporta stands out for its extensive white sand, for the pine and palm trees that reach almost to the water\'s edge, and for a deliberately unhurried atmosphere that sets it apart from the urban beaches of the region. It sits on the Setúbal Peninsula, in a low-density area where rice fields, dunes and Atlantic coastline coexist. Water quality is Good. The village of Comporta, a few minutes away, has restaurants and shops that combine rustic character with a premium positioning. Less than an hour and a half from Lisbon, it is one of the most sought-after coastal escapes for those who want coast without noise.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Lisboa e Setúbal
  '49839927-ee16-498b-80a8-f029627fd4c5': {
    description_en: 'Praia da Costa de Caparica is one of the longest beaches on the Portuguese coastline — a sandy stretch extending for tens of kilometres south of Lisbon, with a deep-rooted surf culture, regular transport links from the capital and a character as an urban beach destination that serves thousands of visitors daily in summer. Water quality is Good. Each section of Caparica has its own identity: from the more family-oriented northern access points to the calmer southern zones, with surf beaches distributed all along the length. It is the Lisbon beach par excellence — and one of the most accessible bathing destinations from the capital.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Centro (Aveiro)
  '26b8762d-0343-4a93-9670-9a86993e7dfd': {
    description_en: 'Praia da Costa Nova is inseparable from the palheiros — the wooden houses with colourful vertical stripes that line the seafront and are one of the most recognisable sights on the Aveiro coast. Water quality is Good. The sandy beach is wide and exposed to the Atlantic swell, with conditions that attract surfers and bodyboarders. On the lagoon side, the landscape changes completely: calm water, moliceiro boats and the geometry of the channels that characterise the Parque Natural da Ria de Aveiro. It is a beach with a strong visual identity and one of the most photographed on the Beira Litoral coast.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Centro
  '07b0b2c3-f11d-474d-9f5f-02dc87a4be64': {
    description_en: 'Praia da Figueira da Foz is one of the great urban beaches of the Portuguese Atlantic coast — an extensive sandy stretch that frames the seafront of one of the most dynamic coastal cities of the Beira Litoral. Water quality is Good. The beach has good support infrastructure, easy access and serves as a meeting point for families, groups of young people and surfers who take advantage of the regular Atlantic swell. The city\'s casino, visible from the seafront, is one of the most distinctive architectural landmarks of Figueira — part of a seaside heritage with roots in the nineteenth century.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Lisboa e Setúbal
  '508706d1-2ddd-4377-8319-75a5bb347435': {
    description_en: 'Praia da Fonte da Telha sits south of the Costa de Caparica, in a section further removed from the main access points, which results in lower visitor numbers and greater tranquillity during the summer months. Water quality is Good. The beach is continuous with the extensive Caparica coastline, with the same Atlantic swell but without the density of the northern zones. The Mata Nacional dos Medos, which borders the access routes, is a dune forest that reinforces the natural character of this part of the coast. An alternative for those who want Caparica with more beach space per person.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Centro
  'fefd19c5-2dad-4627-a476-daa13be99352': {
    description_en: 'Praia da Foz do Arelho has two distinct sides: the Atlantic beach, with swell and Good water quality, and the Lagoa de Óbidos, a calm lagoon that offers watersport activities without waves. The boundary between the two environments shifts with the tides and the conditions of the inlet channel. The lagoon is particularly popular for paddleboarding and kayaking. The combination — open sea on one side, lagoon on the other — makes Foz do Arelho one of the beaches with the greatest variety of conditions on the Estremadura coast.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve/Olhão, facilities: lifeguard, toilets
  'a45ef0a4-98ff-4eb2-bc3d-3cee21ca5570': {
    description_en: 'An island beach within the Ria Formosa, accessible by ferry from Fuseta. The interior lagoon offers warmer, calmer water, surrounded by salt pans and areas of high biodiversity. A lifeguard and restrooms are available on site.',
    water_quality_en: 'Excellent',
    facilities_en: ['Lifeguard', 'Restrooms'],
  },
  // null rank — Algarve
  '59de93aa-066b-4d01-9c4e-27f3a40422f1': {
    description_en: 'Praia da Galé lies west of Albufeira, beyond the area of greatest urban concentration, in a section of coast with limestone cliffs and white sand. Water quality is Excellent. The beach is well proportioned and enjoys generous sunshine throughout the day — characteristics that make it popular during the summer. The low cliffs bordering the beach provide some wind shelter and frame it visually in a pleasant way. It is one of the beaches in the Albufeira area that combines easy accessibility with a more defined natural character than the city\'s urban beaches.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Algarve
  '4325b4a7-62f3-46a7-a66d-ae0ad6e0d374': {
    description_en: 'Praia da Luz is the beach of the village of the same name, a few kilometres west of Lagos. The sandy stretch is medium-sized, framed by dark basalt rock cliffs that contrast with the pale sand — a visual composition unlike most Algarve beaches. Water quality is Excellent. The village of Luz has a human scale, with shops and restaurants within easy reach of the beach. Rocha Negra — a prominent rock formation at one end of the beach — is one of the most recognisable visual landmarks on the entire Lagos coast.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Centro
  'b5d5f332-d553-49d9-ad92-77d658de945f': {
    description_en: 'Praia da Murtinheira sits north of Figueira da Foz, in a section of the Aveiro coast where beaches follow one another at regular intervals with lower visitor numbers than the main beaches. Water quality is Good. The sandy beach is wide and exposed to the Atlantic swell, with coastal dunes marking the transition between the pine forest and the shore. It is a beach with a quieter character than its more popular neighbours — suited to those looking for the Beira coastline without the density of its reference beaches.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Lisboa e Setúbal/Cascais, facilities: lifeguard, toilets
  '53d1fa07-14d1-4806-8c8c-d0ec01f35b28': {
    description_en: 'A small, central beach in Cascais, in a sheltered bay within easy walking distance of the historic centre. Well suited to a quiet afternoon without leaving the town. A lifeguard and restrooms are available.',
    water_quality_en: 'Good',
    facilities_en: ['Lifeguard', 'Restrooms'],
  },
  // null rank — Alentejo/Porto Covo
  '52e176c2-b7e6-4a85-abcf-6cf871464967': {
    description_en: 'A rocky, wild beach near Porto Covo, with rock platforms and natural pools. Set within the Parque Natural do Sudoeste Alentejano e Costa Vicentina.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Algarve
  '6cafdc55-fcea-4e55-b2a1-78995f44b609': {
    description_en: 'Praia da Senhora da Rocha lies between Armação de Pêra and Porches, in a cove bounded by limestone cliffs with a small chapel on the headland that juts out to sea. Water quality is Excellent. The beach is divided into two sections separated by a notch in the cliff, with a more sheltered character than the open beaches of the area. The chapel at the top — one of the most recognisable postcard images of this part of the Algarve — is accessible via a clifftop path that offers views over both sandy stretches.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Centro (Cantanhede)
  'f400d000-20b2-414c-ba38-bae63856431f': {
    description_en: 'Praia da Tocha is on the Cantanhede coastline, between Aveiro and Figueira da Foz, in a zone where the coastal pine forest comes very close to the sandy beach. Water quality is Good. It is a beach with a traditional coastal identity: long sandy beach, Atlantic swell, low dune vegetation and an atmosphere less urban than the higher-profile beaches of the region. Regular visitors who return year after year recognise its character — an unaffected Atlantic coast beach, with the pine forest always close.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Centro (Ria de Aveiro)
  'e5113c93-c469-489a-8db6-7d877c0de22c': {
    description_en: 'Praia da Torreira sits on the outer edge of the Ria de Aveiro, on a spit of land that separates the lagoon from the Atlantic. Water quality is Good. The geographic position is unique: on one side, the expanse of the ocean with open swell; on the other, the stillness of the lagoon and the wildlife of the natural park reserves. Torreira is a regular departure point for boat excursions through the Ria de Aveiro. The main beach is wide enough to absorb visitors and the sea conditions are typical of the northern Atlantic coastline.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Centro
  '6b3928b3-4680-4051-b2f1-e3bdb41cab35': {
    description_en: 'Praia da Vagueira sits south of Aveiro, in a section of the Beira Litoral coast with long beaches and swell conditions that define the character of this coastline. Water quality is Good. The village of Vagueira has a long relationship with the sea — and also with the vulnerability of the Atlantic shoreline, in a stretch where coastal erosion is a recurring concern. Beyond its bathing conditions, the beach attracts surfers, and the extensive sandy beaches are well suited to long coastal walks.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Centro (Marinha Grande)
  '885d20c0-e362-4825-b250-b63ffaaf9631': {
    description_en: 'Praia da Vieira de Leiria is on the Marinha Grande coastline, in a zone where the Leiria pine forest — one of the oldest coastal forests in Portugal — borders the access routes to the beach. Water quality is Good. The sandy beach is extensive and the Atlantic swell is of a size that attracts surfers. The village of Vieira de Leiria has its own identity, with fishing roots that coexist with seasonal beach tourism. The shade of the pine trees and the coolness of the tree-lined access paths make arriving at the beach one of the best aspects of visiting this coast.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve (longer description version)
  '925ac239-db1f-432b-98ee-7a308ae9a6b8': {
    description_en: 'Praia de Alvor sits at the mouth of the Alvor estuary, where the calm waters of the ria meet the open Atlantic. The beach is extensive with fine sand and Excellent water quality, and the estuary provides calmer bathing areas suited to families and children. The village of Alvor, a few minutes away, retains a genuinely fishing character — with fishing boats, seafood restaurants and an atmosphere less focused on resort tourism than neighbouring Portimão. The walk along the salt marshes and estuary to the sandy beach is one of the most pleasant routes in this part of the Algarve.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Algarve/Alvor (shorter version), facilities: lifeguard, toilets, bar
  '010ffc15-3125-4156-aa4f-54b6198ae8e3': {
    description_en: 'An extensive beach at the mouth of the Alvor river, with calm water in the inner lagoons and easy access. A good alternative to the cliff beaches for families with young children. A lifeguard, restrooms and a bar are available.',
    water_quality_en: 'Good',
    facilities_en: ['Lifeguard', 'Restrooms', 'Bar'],
  },
  // null rank — Norte (Esposende)
  '51c5eb21-e534-4c5c-98e0-305c78721686': {
    description_en: 'Praia de Apúlia, in Esposende, is known for its rock formations that emerge from the sand at low tide, creating an irregular and visually interesting landscape. Water quality is Good. The dunes of Apúlia form part of the dune system of the Parque Natural do Litoral Norte, a nature reserve that protects this stretch of coastline. The Atlantic swell — frequent and of considerable size — attracts surfers. It is a beach of pure north-Atlantic character: wind, sand, rocks and an uninterrupted horizon — the kind of coast that is becoming increasingly rare along the Portuguese shoreline.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve (longer editorial version)
  'd723c15c-6b6b-4c47-8182-c06313e0e641': {
    description_en: 'Praia de Armação de Pêra is one of the longest beaches on the central Algarve — a wide, well-equipped sandy stretch directly connected to the seafront of the resort town. Water quality is Excellent. The beach has an urban character with full support infrastructure available nearby. Beyond the main sandy beach, the adjacent coast provides access to some of the most photographed sea caves and rock formations of the central Algarve. It is a beach with the capacity to absorb large numbers of visitors, making it popular with families and group travellers.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Algarve/Silves (shorter version), facilities: lifeguard, toilets, bar, restaurants
  '754eb86f-0f1f-4675-89fc-82b8dc01a605': {
    description_en: 'One of the longest urban beaches in the central Algarve, with wide sands and good support infrastructure. A sun-and-sea tourism destination with a local fishing tradition. A lifeguard, restrooms, a bar and restaurants are available on site.',
    water_quality_en: 'Good',
    facilities_en: ['Lifeguard', 'Restrooms', 'Bar', 'Restaurant'],
  },
  // null rank — Algarve/Sagres
  'fa66de51-13bc-4088-8b94-942d33e525fc': {
    description_en: 'A small cove with difficult access near Cabo de São Vicente. Sheltered from the prevailing northerly wind, with consistent waves and few visitors.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Centro (longer editorial version)
  '63806db3-12a1-4e83-b354-1ac4b44fcb2d': {
    description_en: 'Praia de Buarcos lies north of Figueira da Foz, next to the fishing quarter of the same name — one of the oldest coastal communities in this part of the Beira Litoral. Water quality is Good. The beach has a more local character than the open sandy beaches of Figueira, with fishing vessels contrasting with the beach support facilities. The historic Buarcos quarter immediately behind gives context to the place — a beach where everyday maritime life and summer bathing share the same space without friction.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Centro/Figueira da Foz (shorter version), facilities: lifeguard, toilets, bar
  '2b2b6f80-d16c-4689-87f8-4b799a24fd9e': {
    description_en: 'An urban beach in the northern bay of Figueira da Foz, with a fishing tradition and adjacent fishing village. Complements the main Figueira beach with a more intimate scale. A lifeguard, restrooms and a bar are available.',
    water_quality_en: 'Good',
    facilities_en: ['Lifeguard', 'Restrooms', 'Bar'],
  },
  // null rank — Algarve/Lagos, facilities: lifeguard, toilets
  '91b63ef1-7d4f-483a-a8ca-ed2a60b65e00': {
    description_en: 'A golden cove in Lagos with limestone cliffs and clear water. Very popular in summer, with access via wooden steps down from the clifftop. One of the most visited beaches on the Lagos coast. A lifeguard and restrooms are on site.',
    water_quality_en: 'Excellent',
    facilities_en: ['Lifeguard', 'Restrooms'],
  },
  // null rank — Oeste (Ericeira)
  '67e04297-3a9a-4e41-808f-cae811d0680b': {
    description_en: 'Ericeira is the only World Surfing Reserve in Europe — a designation that recognises the quality and variety of waves concentrated within a short stretch of coastline, with reference surf breaks throughout the perimeter of the town. Water quality is Good. The fishing village of Ericeira, with its historic centre painted blue and white above the cliff, retains genuine character and a coastal gastronomy of quality. It is a destination that combines world-class surfing with a well-preserved historic village — a rare combination on the European coastline and one that justifies its growing international reputation.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Norte
  'db7e9098-4293-4b44-a443-d42491916a91': {
    description_en: 'Praia de Esmoriz sits at the northern edge of the Ovar municipality, on a flat, extensive coastline that marks the beginning of the Beira Litoral shoreline. Water quality is Good. The sandy beach is wide and pale, with the Atlantic swell characteristic of this entire stretch of the northern coast. The village has its own identity — with fishing roots and a stable community that complements the seasonal beach tourism. It is a beach without the visibility of its neighbours Espinho or Matosinhos, but with the character of a seaside resort that persists year-round.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Norte
  '63d09050-d513-474a-87f4-3658b18da09a': {
    description_en: 'Praia de Espinho is the beach of one of the most emblematic seaside towns on the northern coast — a city built on sand, with a defined seafront and a relationship with the Atlantic that goes back to the earliest decades of beach tourism in Portugal. Water quality is Good. The Atlantic swell is consistent and the beach is frequented by surfers and bathers from the greater Porto area. The casino and urban infrastructure of Espinho are part of a seaside heritage that positions the city as a beach destination with history and a consolidated urban character.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Norte (Esposende)
  '6adf3ccd-9fd2-4bc0-894e-e4c775fb3e71': {
    description_en: 'Praia de Esposende sits at the mouth of the Cávado river, where the estuary creates a transitional zone between river water and the Atlantic. Water quality is Good. The beach has the character of this Minho coastline: pale sand, frequent wind, frank Atlantic swell and an uninterrupted horizon. The city of Esposende, with its seafront and the lighthouse backdrop, is one of the most accessible on this section of the shoreline. The Cávado estuary — visible from the beach — forms part of the Parque Natural do Litoral Norte.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve
  '4b75fb06-7715-4b56-8b37-8f6eb332ae22': {
    description_en: 'Praia de Faro sits on a barrier island in the Ria Formosa, accessible by bridge or by boat from the city of Faro. The Atlantic beach is long and open, with Excellent water quality — one of the sharpest possible contrasts with the urban landscape of Faro, only minutes away. The Ria Formosa, visible on the interior side of the island, has the distinct character of a lagoon — diverse birdlife, calm water and the geometry of the salt pans that run through the nature park. For the residents of Faro, it is the closest sea outlet from the city — and one of the most accessible in the entire Algarve.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Algarve
  '0e3bf570-263f-45c1-afd2-0f9ca232b07c': {
    description_en: 'Praia de Ferragudo sits on the southern bank of the Arade estuary, with a direct view across to Praia da Rocha and the city of Portimão. The beach is medium-sized, with Excellent water quality and a fishing village immediately behind — with fishing boats, a small medieval fortress and genuinely characterful restaurants. It is frequently preferred over Praia da Rocha by those seeking the same level of comfort with fewer visitors. The view across the estuary and the Portimão coastline, particularly at the end of the day, is one of the most distinctive settings in this part of the Algarve.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Norte (Matosinhos)
  '62030703-6711-4653-bc35-b1284f35cd5e': {
    description_en: 'Praia de Leça da Palmeira is in the Matosinhos municipality, north of Porto, also known for the Piscinas das Marés — tidal pools designed by architect Álvaro Siza Vieira, integrated into the coastal rocks and an internationally recognised work of twentieth-century architecture. Water quality is Good. The sandy beach is adjacent to the pools, and the beach combines Atlantic bathing with the option of swimming in the pools on days of rougher sea. The Leça coastline has a character defined by the rock formations that emerge from the sand and by the port context that marks this northern gateway to Porto.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Norte
  '9fd20503-ced1-4e4c-9069-d38c320ef247': {
    description_en: 'Praia de Matosinhos is the most accessible beach from Porto — an urban, generously sized sandy beach with a direct metro connection to the city and just minutes from the centre. Water quality is Good. The Atlantic swell is regular and the beach attracts surfers consistently. Matosinhos is also known for its concentration of seafood and fresh fish restaurants, which make any meal after the beach a natural extension of the visit. It is a city beach — with all the convenience and energy that implies — without the aesthetic coldness of purely urban beaches.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Alentejo/Grândola
  'eea6217b-2508-4c9b-b1a8-e9ed888f757d': {
    description_en: 'A long, sparsely visited beach with an adjacent freshwater lagoon — pine trees, dunes and an atmosphere of coastal Alentejo that mass tourism has not yet fully discovered.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Centro (Mira)
  'd762875e-3d8a-467c-bb1b-efed5b1c42d0': {
    description_en: 'Praia de Mira is on the Mira coastline, with Lagoa de Mira as its immediate backdrop — a coastal lagoon separated from the ocean by the dunes that create a transition zone between two very different landscapes. Water quality is Good. The Atlantic beach has the extent and exposure characteristic of this coastline, with conditions that suit both bathers and surfers. The lagoon, accessible on foot, offers calm water for those who prefer an environment without swell. The pine forest that frames the access routes is a constant feature of this coastline.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Norte (Caminha)
  'b699e6b6-e0cb-4620-9355-e1f3074ddde9': {
    description_en: 'Praia de Moledo sits at the northern tip of the Portuguese Atlantic coastline, at the mouth of the Minho river, a few kilometres from Caminha and the Spanish border. Water quality is Good. The sandy beach is extensive and the dunes that frame it are of great size — one of the most impressive dune systems on the Minho coastline. The Ilha de Caminha in the estuary, and the Galician hills visible from the beach, give the place a double horizon, between the Atlantic and the estuary. It is a beach of arrival and departure — the end of the Portuguese shoreline before the border.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve (Costa Vicentina / Aljezur)
  'e1e260e4-5094-4dee-8c90-11a43523e126': {
    description_en: 'Praia de Monte Clérigo is on the north-west coast of the Algarve, within the territory of the Costa Vicentina — a protected coastline where urban density is low and the natural character prevails. Water quality is Good. The beach is medium-sized, framed by dunes and low cliffs, with a regular Atlantic swell that attracts surfers and bodyboarders. Its proximity to Aljezur makes it accessible while preserving the quiet typical of this stretch of coast.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Oeste (Peniche)
  'ffe1a91f-de57-4ff0-9ad5-d32951851730': {
    description_en: 'The Peniche area concentrates some of Portugal\'s finest waves in a single geographic zone — and Praia de Peniche, exposed to direct Atlantic swell, is central to that reputation. Water quality is Good. The town occupies a rocky promontory that extends into the Atlantic, giving it a particularly intense relationship with the sea. The Fortaleza de Peniche and the proximity of the Berlengas nature reserve — a few kilometres offshore — make Peniche one of the most complete stops on the Estremadura coast.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Alentejo
  '6a12acc8-f776-4b01-96f7-73f9fb096e6d': {
    description_en: 'Praia de Porto Covo is on the Alentejo coastline, adjacent to one of the best-preserved fishing villages on the Portuguese coast. It sits within the Parque Natural do Sudoeste Alentejano e Costa Vicentina, in a stretch of basalt rocks, dunes and cliff that typify this section of Atlantic coast. Water quality is Good. Porto Covo combines a raw beach character with the human scale of a small fishing village. Ilha do Pessegueiro, visible from the beach, adds both a historical and visual dimension to the setting. For those coming from the Algarve or from Lisbon, it is frequently the stop that stays in the memory.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Centro (Marinha Grande)
  '24dba43c-02fb-40bc-b3a8-d39e1f8ea49e': {
    description_en: 'Praia de S. Pedro de Moel sits between the Leiria pine forest and the Atlantic, in a stretch of the Marinha Grande coast where the coastal woodland reaches close to the sandy beach. Water quality is Good. The village has a seaside history with roots in the late nineteenth century, and the architecture of the summer houses dotted through the pine forest reflects that heritage. The beach is partially sheltered by a recess in the coastline that provides some protection from the northerly wind. It is a beach with a recognisable personality — the scent of pine, the texture of the sand and the light filtered through the trees before reaching the shore.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Lisboa e Setúbal (Linha de Cascais)
  '7b053b2b-f6f9-4d2b-b897-e4f4b52f463a': {
    description_en: 'Praia de S. Pedro do Estoril is one of the most sheltered beaches on the Estoril coast — a contained sandy stretch partially protected by the adjacent headland, with direct access from the train line that runs between Lisbon and Cascais. Water quality is Good. The scale of the beach and its relatively quiet character are its main attributes — it lacks the size of Carcavelos and the activity of Estoril, but offers a quieter beach option on this densely served coast. The outlook across the bay of Cascais is one of the most pleasant along this section of the Linha.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve
  'dee7ca71-0316-4254-a1db-6c8f79a6e380': {
    description_en: 'Praia de Sagres lies near the south-westernmost point of mainland Portugal, a few kilometres from Cabo de São Vicente. The beach is open and frequently windy, with swell conditions that make it popular with surfers. Water quality is Excellent. The setting is defined by the Promontório and the Fortaleza de Sagres — one of the most dramatically positioned coastal fortresses in the country. Sagres has a strong identity of its own: an end-of-the-world atmosphere, with Atlantic sunsets that are among the most impressive on the entire Algarve coast.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Algarve/Albufeira, facilities: lifeguard, toilets, bar, restaurants
  'f2061e77-2dfd-4817-bab6-2341672729a4': {
    description_en: 'A fine-sand beach near Albufeira, with good sun exposure, sheltered water and solid support infrastructure. Popular with families and resort tourism. A lifeguard, restrooms, a bar and restaurants are available on site.',
    water_quality_en: 'Excellent',
    facilities_en: ['Lifeguard', 'Restrooms', 'Bar', 'Restaurant'],
  },
  // null rank — Alentejo/Santiago do Cacém, facilities: lifeguard, toilets, bar
  '92de7432-12a1-4324-8ed2-932692b1e267': {
    description_en: 'An Atlantic beach alongside the Lagoa de Santo André, one of the largest coastal lagoons in Portugal. Family-friendly, with natural surroundings and easy access in a setting that remains relatively uncrowded. A lifeguard, restrooms and a bar are on site.',
    water_quality_en: 'Good',
    facilities_en: ['Lifeguard', 'Restrooms', 'Bar'],
  },
  // null rank — Lisboa e Setúbal/Cascais, facilities: lifeguard, toilets
  'f893e0a8-9f2e-4533-9093-001877541cf1': {
    description_en: 'A small, family-friendly beach in São João do Estoril, between Estoril and Cascais. Direct train access makes it an easy summer afternoon option from Lisbon. A lifeguard and restrooms are available.',
    water_quality_en: 'Good',
    facilities_en: ['Lifeguard', 'Restrooms'],
  },
  // null rank — Oeste/Ericeira
  '304b2207-d81b-4fef-bdc3-74392d207133': {
    description_en: 'A surf beach on the northern stretch of the Ericeira World Surfing Reserve. Quality waves in the right conditions, a local atmosphere and no mass tourist infrastructure.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Oeste
  '6347e27e-d7fe-45bd-9fb8-ff3d7557d100': {
    description_en: 'Praia de São Martinho do Porto is unique on the Portuguese Atlantic coast: the almost completely enclosed shell-shaped bay transforms what would otherwise be an exposed Atlantic beach into an environment of calm, warm summer water, sheltered from wind and swell. Water quality is Good. The shape of the bay — with its narrow south-facing entrance — creates conditions uniquely suited to families and children. The village of São Martinho do Porto, built around the seafront overlooking the bay, adds human scale to the setting. It is one of the genuinely different beaches on the entire Estremadura coast.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve, facilities: lifeguard
  '3308ac4a-f42c-4c44-938b-cccbebb21afc': {
    description_en: 'A quiet cove between golden cliffs near Albufeira. Excellent for families thanks to calm, sheltered water. A lifeguard is on site.',
    water_quality_en: 'Excellent',
    facilities_en: ['Lifeguard'],
  },
  // null rank — Lisboa e Setúbal
  '9efe4cc6-cb4a-4265-83c3-c710917810c1': {
    description_en: 'Praia de Sesimbra is one of the most sheltered beaches on the coast south of Lisbon — the bay where the sandy beach sits is embraced by low hills that block the prevailing wind and generally create calmer sea conditions than the rest of the coastline. Water quality is Good. The village of Sesimbra, built on the hillside overlooking the bay, has a genuine fishing character — with fishing boats, a clifftop fortress and a seafood restaurant culture that persists beyond the tourist season. It is one of the preferred escapes from Lisbon for those who want a beach with a village, not merely a strip of sand.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Lisboa e Setúbal
  'd8c2c61e-734a-41c5-aec1-66981023cfca': {
    description_en: 'Praia de Setúbal sits within the urban context of the city of Setúbal, at the entrance to the Sado estuary and with the Serra da Arrábida as a close backdrop. Water quality is Good. It is a beach that is conveniently accessible for city residents — it does not have the resort scale of the Arrábida beaches, but brings the sea within walking distance of the city. Setúbal itself, with its fish market and riverside front, is an excellent starting point for exploring this coast. For beaches with emerald water and limestone cliffs, the Arrábida beaches are a short drive away.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Oeste/Peniche
  '0f616614-30d1-488a-986a-acd1caebbe6c': {
    description_en: 'One of Portugal\'s finest waves — a powerful barrel breaking over a sand bottom, and the venue for the WSL Championship Tour event since 2009. For experienced surfers only.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve, facilities: lifeguard, restaurant
  'f1f7b723-5ae7-457f-a810-6d5ad1f43c23': {
    description_en: 'A barrier island accessible by ferry from Tavira. The calm water of the Ria Formosa makes it ideal for families and less experienced swimmers. A lifeguard and restaurant are on site.',
    water_quality_en: 'Excellent',
    facilities_en: ['Lifeguard', 'Restaurant'],
  },
  // null rank — Alentejo (Tróia Peninsula)
  '0b9d2380-38cf-437d-a4e3-4b68158ba2a4': {
    description_en: 'Praia de Tróia sits on the Tróia Peninsula, a spit of sand that separates the Sado estuary from the Atlantic, accessible from Setúbal by ferry. The Atlantic beach is long, with open swell and Good water quality. On the opposite side, the estuary-facing margins offer calm water and different conditions. The boat crossing over the Sado — where dolphin sightings are regularly recorded — is part of the experience of visiting Tróia. The peninsula is large enough to absorb summer visitors without losing the natural character of its more remote sections.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Alentejo
  '2dd735c3-9317-45bb-aed7-c3832af7653d': {
    description_en: 'Praia de Vila Nova de Milfontes sits at the mouth of the Mira river, where river waters and the Atlantic meet, separating the sandy beach from the historic village. Water quality is Good. This is one of the most appreciated locations on the Alentejo coast — the contained scale of the village, the whitewashed houses and the presence of the river give it a character not found at resort beaches. The sandy stretch is sheltered and well suited to families, with the open Atlantic accessible a little further south. Milfontes is frequently cited as one of the finest beach towns in Portugal — and rarely disappoints those who arrive for the first time.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve (Vilamoura)
  '8c523fc0-993c-4e0e-9d29-755d7257be50': {
    description_en: 'Praia de Vilamoura sits alongside the marina complex that gave its name to one of the Algarve\'s largest tourist resorts. The sandy beach is extensive, with fine sand and Excellent water quality. The support services and facilities are among the most complete in the region. The adjacent marina, with its concentration of boats and premium-positioned commercial activity, gives the beach a different context from the wilder cliff beaches of the western Algarve. It is a coherent choice for those who prioritise comfort and easy access from accommodation in the area.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Alentejo (Costa Vicentina)
  '6b2661a4-4126-4ac4-8a03-ec2193cd4494': {
    description_en: 'Praia do Almograve is a beach with a strong character defined by its geological setting: rock platforms, slabs and natural pools coexist with a narrow sandy stretch, composing a coastline of dense visual texture. Water quality is Good. It sits on the Costa Vicentina, in a zone of low tourist pressure where the landscape is shaped by natural forces rather than infrastructure. The Atlantic swell, the rock formations and the late-afternoon light across the slabs make this beach particularly appealing for photography and exploration at low tide.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Norte (Viana do Castelo)
  '10f7f046-fb30-493e-acf0-bf6b2a57858b': {
    description_en: 'Praia do Cabedelo sits on the southern bank of the Lima estuary, in Viana do Castelo, accessible by boat from the city or by road along the southern bank. Water quality is Good. The sandy beach is extensive and well exposed to the Atlantic, with the city of Viana do Castelo visible across the estuary — the Basílica de Santa Luzia on the skyline is one of the most recognisable landmarks on this coast. The boat crossing over the Lima is part of the experience of visiting the beach. It is a beach with a northern Atlantic identity, with the scale and quality that make it popular among residents of the region.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve (Lagos)
  'd9af39d6-f9ae-483d-ab1d-e48a026dfd53': {
    description_en: 'Praia do Camilo is one of the smallest and most photogenic beaches on the western Algarve — a pocket of sand between limestone cliffs carved into organic forms that seem to defy human scale. Water quality is Excellent. Access is via a wooden staircase descending the cliff face, which keeps visitor numbers more controlled than at easily accessible beaches. The surrounding rock formations create natural pools and striking compositions that make it popular for photography. It is a complement to the larger beaches of Lagos — better suited to those seeking seclusion than space.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Alentejo (Grândola)
  'f940e21f-3169-486c-9438-30dd3e503eb3': {
    description_en: 'Praia do Carvalhal is on the coastal edge of the Grândola region, between pine trees and low dunes that come close to the edge of the sandy beach. Water quality is Good. It is an Alentejo coastal beach in the full sense: long, with pale sand, few built elements on the front line and a quiet atmosphere that persists even during the busiest months. The dune vegetation and the pine forest that borders the access routes create a natural corridor leading to the ocean — an arrival ritual that is part of the experience of the beach.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve (Sagres area)
  'd3b73c18-ff72-4f00-b556-0370fd549fd3': {
    description_en: 'A wild beach north of Sagres, with tall cliffs and consistent waves. One of the least visited beaches on the western Algarve coast.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Norte (Ovar)
  'c63cbf17-1445-4697-aa21-a5b9dff08851': {
    description_en: 'Praia do Furadouro is the beach of Ovar — a town with a fishing heritage that coexists with the seasonal beach tourism of this section of the northern coast. Water quality is Good. The sandy beach is generously sized and the Atlantic swell is consistent, with conditions that attract surfers. The traditions of Ovar — including its celebrated Carnival, its azulejo tile-making and its gastronomy — have a cultural expression that goes beyond the beach. It is a north Atlantic coastal beach with a consolidated seaside resort identity, south of Aveiro and north of Espinho.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Alentejo/Porto Covo
  'a8e9c668-f606-4100-87ea-b00ea61617e5': {
    description_en: 'An extensive dune beach on the Costa Vicentina, accessed via a sand track, with intense Atlantic swell. No facilities whatsoever — pure nature.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Algarve/Sagres, facilities: lifeguard, toilets, bar
  '5c45c033-1182-4e59-b0de-61ec81ab38f2': {
    description_en: 'A calm beach in a sheltered bay near Sagres, with little swell and good views across the valley. Popular with families staying in the cape area. A lifeguard, restrooms and a bar are available.',
    water_quality_en: 'Excellent',
    facilities_en: ['Lifeguard', 'Restrooms', 'Bar'],
  },
  // null rank — Oeste (south of Caparica)
  '4b7f7ece-a91f-4ef0-bd4f-f8f280a6b78a': {
    description_en: 'Praia do Meco sits south of the Costa de Caparica, in a section of the coastline where the natural character begins to replace the urban density of Caparica. Water quality is Good. The beach is known for having one of the most established naturist sections on the Lisbon coast. The sandy beach is wide and the low cliffs that frame it provide some shelter. Its distance from public transport results in lower visitor numbers than the beaches to the north. It is an open Atlantic coastal beach, with the character of the natural Setúbal beaches but without the fame of the Arrábida.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Centro/Nazaré
  '74421a75-f67c-45d5-928f-b7fae44adc33': {
    description_en: 'The big-wave beach — where Garrett McNamara surfed the then-world record wave in 2011 and where the record has since been broken multiple times. For professional big-wave surfers only.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Centro (Leiria)
  'c4bea301-56f1-49b5-934d-f576e41f5132': {
    description_en: 'Praia do Pedrógão is on the Leiria coastline, between Vieira de Leiria and Figueira da Foz, in a stretch of open Atlantic coast with broad beaches and frank swell. Water quality is Good. The village has the scale of a consolidated seaside resort, with a seafront that concentrates beach support services throughout the summer season. The wide sandy beach and regular swell attract surfers, and the pine forests that accompany the access routes reinforce the character of this coast. A Beira Litoral beach with a good balance of size, services and coastal character.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Algarve (Albufeira old town)
  '084b12c9-a27a-4865-98b4-6932918e3609': {
    description_en: 'Praia do Peneco is the beach closest to the historic centre of Albufeira, accessible on foot from the old town through a tunnel cut through the cliff. Water quality is Excellent. The sandy beach is contained in size and urban in character, with the density of Albufeira immediately behind. Despite its proximity to the centre, the cliffs that surround it create a visual enclosure that distinguishes it from the open beaches of the area. It is a beach of convenience for those staying in the old town area — and one of the most direct points of entry to the sea in this part of the Algarve.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Madeira (north coast)
  'b7c02df5-a01e-40e3-8a13-342d56058eb4': {
    description_en: 'Praia do Seixal is one of the best-known beaches on the north coast of Madeira — a stretch of dark pebble and sand in a natural amphitheatre formed by tall basalt cliffs, with a waterfall that descends directly onto the beach during periods of higher flow. Water quality is Good. The north coast of Madeira receives stronger Atlantic swell than the south, which means bathing conditions vary with the season. The adjacent natural rock pools provide an alternative on rough-sea days. The landscape setting — between lava cliffs and the open ocean — is one of the most dramatic in the entire archipelago.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Lisboa e Setúbal/Estoril, facilities: lifeguard, toilets, bar, restaurants
  'f0fbf5a9-75d3-40d3-80be-62fc749588fd': {
    description_en: 'An urban beach in Estoril, next to the casino, with easy train access from Lisbon. One of the closest beaches to the capital with full facilities. A lifeguard, restrooms, a bar and restaurants are all on site.',
    water_quality_en: 'Good',
    facilities_en: ['Lifeguard', 'Restrooms', 'Bar', 'Restaurant'],
  },
  // null rank — Algarve (west of Praia da Rocha)
  '885a3c2e-2f8d-424d-b98c-a8c7b8732bee': {
    description_en: 'Praia do Vau lies west of Praia da Rocha, in a section of coast with lower urban density and a more irregular character shaped by limestone cliffs. Water quality is Excellent. The sandy beach is moderate in size and the rock formations at its edges provide some natural shelter. It is frequently chosen as a quieter alternative to the neighbouring Praia da Rocha — which draws the largest crowds in the Portimão area. The coastal path between the two beaches, along the clifftop, offers views over the rock formations of this section of the Algarve.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Lisboa e Setúbal (Arrábida)
  '3d2dacea-cfcb-4086-9e15-a7b57ec9f2e7': {
    description_en: 'Repeatedly voted the most beautiful beach in Portugal. Within the Parque Natural da Arrábida, accessible by trail — no direct car access to the beach.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Algarve (Castro Marim)
  'feead871-bb63-43d7-acf9-592d7d54b514': {
    description_en: 'Praia Verde is in the eastern Algarve, near Castro Marim, in a zone where the pine forest comes close to the beach and the coastal horizon remains open. Water quality is Excellent. The name describes the setting: dense coastal vegetation contrasting with pale sand and water that shifts between green and blue depending on the light. It is one of the quietest beaches in this part of the Algarve — with less mass tourism than the beaches to the west — and retains the pine-backed beach character rarely found elsewhere on the Algarve coastline.',
    water_quality_en: 'Excellent',
    facilities_en: [],
  },
  // null rank — Oeste (Ericeira)
  'a9b0eada-8f04-4862-85aa-2892039baecd': {
    description_en: 'Ribeira d\'Ilhas is the main surf break of the Ericeira World Surfing Reserve — a point break that runs along a low cliff north of the village, producing conditions that attract surfers from around the world during winter and spring. Water quality is Good. The beach has the character of a surf destination: the natural cliff terraces, the quality of the right-hand waves and the concentration of experienced surfers give it an energy different from conventional bathing beaches. On days of large swell, it is one of the most impressive natural spectacles on this coast — accessible on foot from the village of Ericeira.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
  // null rank — Norte (Alto Minho)
  '43290bbc-db7f-4b1e-9cb5-a51b644c0ca6': {
    description_en: 'Vila Praia de Âncora is one of the quietest coastal villages on the Minho coastline — a calm, family-friendly beach in a partially sheltered bay that moderates the Atlantic swell typical of this latitude. Water quality is Good. The village has a human scale and an atmosphere of understated seaside resort — seaside gardens, fresh fish and a pale sandy beach stretching out in front. For those travelling along the Alto Minho coast, it is a stop with the qualities of a good Portuguese beach town, without the visitor numbers of Viana do Castelo or Caminha.',
    water_quality_en: 'Good',
    facilities_en: [],
  },
};

// ── Sanity-check helpers ───────────────────────────────────────────────────────
function isSuspect(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') {
    return value.trim() === '' || value === 'undefined' || value === '[object Object]';
  }
  if (Array.isArray(value)) return value.some(isSuspect);
  return false;
}

function isIdenticalToPT(enStr, ptStr) {
  // strip whitespace/newlines for comparison
  return enStr.replace(/\s+/g, ' ').trim() === ptStr.replace(/\s+/g, ' ').trim();
}

function isTooShort(enStr, ptStr) {
  return enStr.length < ptStr.length * 0.5;
}

// ── Main ───────────────────────────────────────────────────────────────────────
const startTime = Date.now();
console.log('=== translate-beaches-batch.mjs ===');
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log('');

// STEP 1: Fetch
console.log('STEP 1: Fetching beaches with empty i18n...');
const { data: beaches, error: fetchError } = await sb
  .from('beaches')
  .select('id, name, description, beach_type, water_quality, facilities, editorial_rank')
  .filter('i18n', 'eq', '{}')
  .order('editorial_rank', { ascending: true, nullsFirst: false })
  .order('name', { ascending: true });

if (fetchError) {
  console.error('FATAL: fetch failed —', fetchError.message);
  process.exit(1);
}

console.log(`Fetched ${beaches.length} beaches (expected 109).`);
console.log('');

// STEP 2: Process + UPDATE
console.log('STEP 2: Translating and writing...');
let success = 0;
let failed = 0;
const failedNames = [];

for (let i = 0; i < beaches.length; i++) {
  const beach = beaches[i];
  const tr = TRANSLATIONS[beach.id];

  if ((i + 1) % 10 === 0) {
    console.log(`  ${i + 1}/${beaches.length} processed so far...`);
  }

  if (!tr) {
    console.error(`  SKIP  [${i+1}] ${beach.name} (${beach.id}): no translation entry`);
    failed++;
    failedNames.push(beach.name);
    continue;
  }

  // Sanity checks
  const suspects = [tr.description_en, tr.water_quality_en, ...tr.facilities_en];
  if (suspects.some(isSuspect)) {
    console.error(`  ABORT [${i+1}] ${beach.name}: suspect value in translation`);
    failed++;
    failedNames.push(beach.name);
    continue;
  }

  if (isIdenticalToPT(tr.description_en, beach.description || '')) {
    console.error(`  ABORT [${i+1}] ${beach.name}: description_en identical to PT`);
    failed++;
    failedNames.push(beach.name);
    continue;
  }

  if (isTooShort(tr.description_en, beach.description || '')) {
    console.error(`  ABORT [${i+1}] ${beach.name}: description_en < 50% of PT length`);
    failed++;
    failedNames.push(beach.name);
    continue;
  }

  const i18n = {
    description: { pt: beach.description, en: tr.description_en },
    beach_type: { pt: beach.beach_type, en: null },
    water_quality: { pt: beach.water_quality, en: tr.water_quality_en },
    facilities: { pt: beach.facilities ?? [], en: tr.facilities_en },
  };

  const { error: updateError } = await sb
    .from('beaches')
    .update({ i18n })
    .eq('id', beach.id);

  if (updateError) {
    console.error(`  FAIL  [${i+1}] ${beach.name}: ${updateError.message}`);
    failed++;
    failedNames.push(beach.name);
  } else {
    console.log(`  OK    [${i+1}] ${beach.name}`);
    success++;
  }
}

console.log('');

// STEP 3: Validation count
console.log('STEP 3: Validation count...');
const { data: countData, error: countError } = await sb.rpc('', {}).select
  ? null : null; // rpc workaround — use two selects instead

const { count: translatedCount, error: e1 } = await sb
  .from('beaches')
  .select('id', { count: 'exact', head: true })
  .neq('i18n', '{}');

const { count: pendingCount, error: e2 } = await sb
  .from('beaches')
  .select('id', { count: 'exact', head: true })
  .eq('i18n', '{}');

if (e1 || e2) {
  console.error('Count query error:', e1?.message || e2?.message);
} else {
  console.log(`  Translated: ${translatedCount}`);
  console.log(`  Pending:    ${pendingCount}`);
  if (pendingCount > 0) {
    // List the pending ones
    const { data: pending } = await sb
      .from('beaches')
      .select('id, name')
      .eq('i18n', '{}');
    if (pending?.length) {
      console.log('  Still pending:');
      pending.forEach(b => console.log(`    - ${b.name} (${b.id})`));
    }
  }
}

// STEP 4: Sample 10 random translations (excluding POC 5)
console.log('');
console.log('STEP 4: Sample of 10 new translations...');
const POC_IDS = new Set([
  'a0529d77-b688-4293-ba11-8f023a69e4cf',
  'a6625ef3-a4ad-4e38-b74e-856ffc9fa724',
  'c627b1c9-8467-4729-aa26-15fb6e86e6af',
  '37ac39ea-0a07-480a-9147-5aed9a9ae388',
  '4c907c07-8bbd-4c37-90f2-8f9e2696f5a0',
]);

const sampleIds = Object.keys(TRANSLATIONS)
  .filter(id => !POC_IDS.has(id))
  .sort(() => Math.random() - 0.5)
  .slice(0, 10);

const { data: samples } = await sb
  .from('beaches')
  .select('name, i18n')
  .in('id', sampleIds);

if (samples) {
  console.log('name'.padEnd(35) + '| description_en (first 100 chars)');
  console.log('-'.repeat(35) + '+-' + '-'.repeat(100));
  for (const row of samples) {
    const name = (row.name || '').slice(0, 34).padEnd(34);
    const desc = (row.i18n?.description?.en || '').slice(0, 100);
    console.log(`${name} | ${desc}`);
  }
}

// Summary
const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log('');
console.log('=== SUMMARY ===');
console.log(`${success}/${beaches.length} translated successfully`);
if (failed > 0) {
  console.log(`${failed} failed:`);
  failedNames.forEach(n => console.log(`  - ${n}`));
}
console.log(`Translated: ${translatedCount ?? '?'} | Pending: ${pendingCount ?? '?'}`);
console.log(`Total time: ${elapsed}s`);
