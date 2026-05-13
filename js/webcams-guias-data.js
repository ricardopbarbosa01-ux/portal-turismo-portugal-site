/** js/webcams-guias-data.js — Shared data for webcams.html + guias.html (+ EN variants).
 * Exposes window.WebcamsGuiasData = { WEBCAMS:[13], GUIA_CARDS:{pt:[5], en:[6]} }
 * WEBCAMS: name/location are geographic proper nouns (language-neutral).
 *          desc and tags have {pt, en} for user-visible text.
 * GUIA_CARDS: pt and en are separate arrays — they link to different article sets.
 */
(function (window) {
  'use strict';

  // ── Webcam feeds (13) ─────────────────────────────────────────────────────────
  var WEBCAMS = [
    {
      name: 'Matosinhos',
      location: 'Praia de Matosinhos, Porto',
      region: 'Porto', bgClass: 'wcam-bg--porto',
      state: 'live', url: 'https://beachcam.meo.pt/livecams/praia-de-matosinhos/',
      tipo: 'surf', lat: 41.1847, lng: -8.6890,
      desc: {
        pt: 'Vista para a praia urbana de Matosinhos — ondulação atlântica, correntes e condições de surf da costa norte em câmara permanente.',
        en: 'Live view of Matosinhos urban beach — Atlantic swell, currents and surf conditions on the northern coast.',
      },
      tags: { pt: ['Surf', 'Norte', 'Ondulação'], en: ['Surf', 'North', 'Swell'] },
    },
    {
      name: 'Póvoa de Varzim',
      location: 'Praia da Póvoa, Porto',
      region: 'Porto', bgClass: 'wcam-bg--porto',
      state: 'pending', url: null,
      tipo: 'praia', lat: 41.3828, lng: -8.7685,
      desc: {
        pt: 'Costa norte com condições típicas de vento onshore. Vista sobre o quebra-mar e extensa praia de areia.',
        en: 'Northern coast with typical onshore wind conditions. View over the breakwater and long sandy beach.',
      },
      tags: { pt: ['Praia', 'Norte', 'Vento'], en: ['Beach', 'North', 'Wind'] },
    },
    {
      name: 'Nazaré',
      location: 'Praia do Norte, Nazaré',
      region: 'Centro', bgClass: 'wcam-bg--centro',
      state: 'live', url: 'https://beachcam.meo.pt/livecams/praia-do-norte/',
      tipo: 'surf', lat: 39.6015, lng: -9.0699,
      desc: {
        pt: 'Monitorização contínua do pico que detém o recorde mundial de ondas maiores — câmara permanente sobre a Praia do Norte.',
        en: 'Continuous monitoring of the peak that holds the world record for the biggest waves — permanent camera over Praia do Norte.',
      },
      tags: { pt: ['Big Waves', 'Surf', 'Recorde Mundial'], en: ['Big Waves', 'Surf', 'World Record'] },
    },
    {
      name: 'Peniche — Supertubos',
      location: 'Supertubos, Peniche',
      region: 'Centro', bgClass: 'wcam-bg--centro',
      state: 'live', url: 'https://beachcam.meo.pt/livecams/peniche-supertubos/',
      tipo: 'surf', lat: 39.3433, lng: -9.3675,
      desc: {
        pt: 'Câmara sobre o mítico Supertubos — palco da etapa portuguesa do World Surf League. Condições de barrel em tempo real.',
        en: 'Camera over the mythical Supertubos — venue of the Portuguese leg of the World Surf League. Real-time barrel conditions.',
      },
      tags: { pt: ['WCT', 'Barrel', 'WSL'], en: ['WCT', 'Barrel', 'WSL'] },
    },
    {
      name: 'Figueira da Foz',
      location: 'Praia do Cabedelo, Figueira da Foz',
      region: 'Centro', bgClass: 'wcam-bg--centro',
      state: 'live', url: 'https://beachcam.meo.pt/livecams/figueira-da-foz-cabedelo/',
      tipo: 'praia', lat: 40.1460, lng: -8.8580,
      desc: {
        pt: 'Câmara ao vivo sobre o Cabedelo — praia de areia com bancos e swell de noroeste. Boa leitura de condições para toda a região centro.',
        en: 'Live camera over Cabedelo — sandy beach with sandbars and northwest swell. Good conditions reading for the entire central region.',
      },
      tags: { pt: ['Praia', 'Swell', 'Centro'], en: ['Beach', 'Swell', 'Central'] },
    },
    {
      name: 'Ericeira',
      location: 'Ribeira d\'Ilhas, Ericeira',
      region: 'Lisboa', bgClass: 'wcam-bg--lisboa',
      state: 'live', url: 'https://beachcam.meo.pt/livecams/ericeira/',
      tipo: 'surf', lat: 38.9634, lng: -9.4154,
      desc: {
        pt: 'Reserva Mundial de Surf em câmara permanente. Monitorize Ribeira d\'Ilhas antes de planear a sua deslocação.',
        en: 'World Surf Reserve on permanent camera. Monitor Ribeira d\'Ilhas before planning your trip.',
      },
      tags: { pt: ['Reserva Mundial', 'Surf', 'WSL'], en: ['World Reserve', 'Surf', 'WSL'] },
    },
    {
      name: 'Cascais — Guincho',
      location: 'Praia do Guincho, Cascais',
      region: 'Lisboa', bgClass: 'wcam-bg--lisboa',
      state: 'live', url: 'https://beachcam.meo.pt/livecams/praia-do-guincho/',
      tipo: 'surf', lat: 38.7266, lng: -9.4734,
      desc: {
        pt: 'Leitura do vento noroeste característico do Guincho — ideal para windsurf, kitesurf e surf de onda.',
        en: 'Reading the characteristic northwest wind at Guincho — ideal for windsurfing, kitesurfing and wave surfing.',
      },
      tags: { pt: ['Windsurf', 'Kite', 'Vento'], en: ['Windsurf', 'Kite', 'Wind'] },
    },
    {
      name: 'Costa da Caparica',
      location: 'Praia da Costa da Caparica, Setúbal',
      region: 'Lisboa', bgClass: 'wcam-bg--lisboa',
      state: 'live', url: 'https://beachcam.meo.pt/livecams/costa-da-caparica/',
      tipo: 'praia', lat: 38.6266, lng: -9.2354,
      desc: {
        pt: '30 km de costa a sul de Lisboa. Vista sobre os bancos de areia com leitura de ondulação de sul e noroeste.',
        en: '30 km of coast south of Lisbon. View over the sandbars with south and northwest swell reading.',
      },
      tags: { pt: ['Praia Longa', 'Surf', 'Lisboa'], en: ['Long Beach', 'Surf', 'Lisbon'] },
    },
    {
      name: 'Costa Vicentina',
      location: 'Vila Nova de Milfontes, Alentejo',
      region: 'Alentejo', bgClass: 'wcam-bg--alentejo',
      state: 'soon', url: null,
      tipo: 'natureza', lat: 37.7251, lng: -8.7938,
      desc: {
        pt: 'Costa protegida no Parque Natural do Sudoeste Alentejano. Natureza intocada e acessibilidade controlada.',
        en: 'Protected coast in the Southwest Alentejo Natural Park. Untouched nature and controlled access.',
      },
      tags: { pt: ['Parque Natural', 'Selvagem', 'Alentejo'], en: ['Natural Park', 'Wild', 'Alentejo'] },
    },
    {
      name: 'Lagos — Praia da Luz',
      location: 'Praia da Luz, Lagos',
      region: 'Algarve', bgClass: 'wcam-bg--algarve',
      state: 'live', url: 'https://beachcam.meo.pt/livecams/praia-da-luz/',
      tipo: 'praia', lat: 37.0880, lng: -8.7153,
      desc: {
        pt: 'Câmara ao vivo sobre a Praia da Luz — boa referência de condições para a costa barlavento do Algarve.',
        en: 'Live camera over Praia da Luz — good conditions reference for the Barlavento coast of the Algarve.',
      },
      tags: { pt: ['Algarve', 'Surf', 'Lagos'], en: ['Algarve', 'Surf', 'Lagos'] },
    },
    {
      name: 'Portimão — Praia da Rocha',
      location: 'Praia da Rocha, Portimão',
      region: 'Algarve', bgClass: 'wcam-bg--algarve',
      state: 'live', url: 'https://beachcam.meo.pt/livecams/praia-da-rocha/',
      tipo: 'praia', lat: 37.1200, lng: -8.5363,
      desc: {
        pt: 'Praia icónica do Algarve com falésias rochosas. Câmara sobre o esporão com vista para o mar aberto.',
        en: 'Iconic Algarve beach with rocky cliffs. Camera on the groyne with open sea view.',
      },
      tags: { pt: ['Falésia', 'Algarve', 'Turismo'], en: ['Cliff', 'Algarve', 'Tourism'] },
    },
    {
      name: 'Açores — São Miguel',
      location: 'Praia dos Mosteiros, São Miguel',
      region: 'Açores', bgClass: 'wcam-bg--acores',
      state: 'pending', url: null,
      tipo: 'natureza', lat: 37.8871, lng: -25.8277,
      desc: {
        pt: 'Costa vulcânica dos Açores com ondulação atlântica de longo período. Mar de águas escuras único no panorama europeu.',
        en: 'Volcanic Azores coastline with long-period Atlantic swell. Dark-water sea unique in the European panorama.',
      },
      tags: { pt: ['Vulcânico', 'Atlântico', 'Açores'], en: ['Volcanic', 'Atlantic', 'Azores'] },
    },
    {
      name: 'Funchal — Baía',
      location: 'Baía do Funchal, Madeira',
      region: 'Madeira', bgClass: 'wcam-bg--madeira',
      state: 'soon', url: null,
      tipo: 'pesca', lat: 32.6494, lng: -16.9088,
      desc: {
        pt: 'Vista panorâmica sobre a baía do Funchal. Monitorização de condições para embarcações, mergulhadores e banhistas.',
        en: 'Panoramic view over Funchal Bay. Monitoring conditions for boats, divers and swimmers.',
      },
      tags: { pt: ['Mergulho', 'Baía', 'Madeira'], en: ['Diving', 'Bay', 'Madeira'] },
    },
  ];

  // ── Guide hub cards ───────────────────────────────────────────────────────────
  // PT and EN use different article sets — separate arrays, not bilingual fields.
  var GUIA_CARDS = {
    pt: [
      {
        href: '/guias/melhores-praias-algarve.html',
        img: 'https://images.unsplash.com/photo-1562760156-9353a70352ef?fm=jpg&q=80&w=800&auto=format&fit=crop',
        alt: 'Vista aérea da Praia da Marinha com falésias de calcário dourado, Algarve',
        fallbackKeyword: 'algarve beach aerial cliffs portugal',
        title: 'As Praias do Algarve Que Valem a Viagem',
        desc: 'Sotavento, Barlavento e Costa Vicentina — zona a zona, praia a praia.',
        readTime: 15,
        isNew: true,
        featured: true,
      },
      {
        href: '/guias/surf-portugal-iniciantes.html',
        img: 'https://images.unsplash.com/photo-1502680390548-bdbac40e4ce3?fm=jpg&q=80&w=800&auto=format&fit=crop',
        alt: 'Surfista na onda, costa portuguesa',
        fallbackKeyword: 'surf portugal coast wave',
        title: 'Surf em Portugal para Quem Começa do Zero',
        desc: 'Spots, escolas, preços reais e o que ninguém te conta antes da primeira aula.',
        readTime: 12,
        isNew: true,
        featured: false,
      },
      {
        href: '/guias/pesca-portugal.html',
        img: 'https://images.unsplash.com/photo-1625183656263-171183307b15?w=800&auto=format&fit=crop&q=80',
        alt: 'Pescador na costa de Portugal ao amanhecer',
        fallbackKeyword: 'fisherman atlantic coast portugal dawn',
        title: 'Pesca na Costa Portuguesa',
        desc: 'Spots, licenças, marés, espécies e preços — do surfcasting ao big game nos Açores.',
        readTime: 14,
        isNew: true,
        featured: false,
      },
      {
        href: '/guias/praias-perto-lisboa.html',
        img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?fm=jpg&q=80&w=800&auto=format&fit=crop',
        alt: 'Praia de areia dourada perto de Lisboa com águas azuis',
        fallbackKeyword: 'cascais coast beach atlantic portugal',
        title: 'Praias Perto de Lisboa — Escapadas de Um Dia',
        desc: 'De comboio, ferry ou carro — as praias que os lisboetas guardam para si.',
        readTime: 13,
        isNew: true,
        featured: false,
      },
      {
        href: '/guias/quando-visitar-portugal.html',
        img: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?fm=jpg&q=80&w=800&auto=format&fit=crop',
        alt: 'Lisboa com o Tejo ao fundo num dia de sol',
        fallbackKeyword: 'lisbon panoramic view tagus river',
        title: 'Quando Visitar Portugal — Mês a Mês',
        desc: 'Clima, preços, multidões e o que cada época oferece.',
        readTime: 11,
        isNew: true,
        featured: false,
        fullWidth: true,
      },
    ],
    en: [
      {
        href: '/en/best-beaches-portugal.html',
        img: 'https://images.unsplash.com/photo-1562760156-9353a70352ef?fm=jpg&q=80&w=800&auto=format&fit=crop',
        alt: 'Aerial view of Praia da Marinha with golden limestone cliffs, Algarve',
        fallbackKeyword: 'algarve beach aerial cliffs portugal',
        title: 'Best Beaches in Portugal Worth the Trip',
        desc: 'Algarve, Alentejo, Lisbon coast and beyond — region by region, beach by beach.',
        readTime: 15,
        isNew: true,
        featured: true,
      },
      {
        href: '/en/algarve-beaches.html',
        img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?fm=jpg&q=80&w=800&auto=format&fit=crop',
        alt: 'Golden sandy beach with turquoise water, Algarve',
        fallbackKeyword: 'algarve beach turquoise water portugal',
        title: 'Algarve Beaches Guide',
        desc: 'The best beaches in the Algarve — from Sagres to Tavira, with practical tips for every type of traveller.',
        readTime: 12,
        isNew: false,
        featured: false,
      },
      {
        href: '/en/surfing-portugal.html',
        img: 'https://cdn.portalturismoportugal.com/surfing-portugal.webp',
        alt: 'Surfers riding small waves at Peniche, Portugal — beginner-friendly Atlantic surf',
        fallbackKeyword: 'surf portugal peniche beginner wave',
        title: 'Surfing in Portugal for Beginners',
        desc: 'Spots, schools, real prices and what nobody tells you before your first lesson.',
        readTime: 12,
        isNew: true,
        featured: false,
      },
      {
        href: '/en/beaches-near-lisbon.html',
        img: 'https://cdn.portalturismoportugal.com/beaches-near-lisbon.webp',
        alt: 'Atlantic beach with cliff and beachgoers near Lisbon, Portugal',
        fallbackKeyword: 'cascais coast beach atlantic portugal',
        title: 'Beaches Near Lisbon — Day Trips',
        desc: 'By train, ferry or car — the beaches that locals keep to themselves.',
        readTime: 13,
        isNew: false,
        featured: false,
      },
      {
        href: '/en/family-beaches-algarve.html',
        img: 'https://cdn.portalturismoportugal.com/family-beaches-algarve.webp',
        alt: 'Calm family beach in the Algarve with clear shallow water',
        fallbackKeyword: 'algarve family beach calm shallow water',
        title: 'Family Beaches in the Algarve',
        desc: 'Safe, calm and fun — the best Algarve beaches for families with children.',
        readTime: 10,
        isNew: false,
        featured: false,
      },
      {
        href: '/en/hidden-beaches-algarve.html',
        img: 'https://cdn.portalturismoportugal.com/hidden-beaches-algarve.webp',
        alt: 'Hidden cove beach with dramatic cliffs, Algarve',
        fallbackKeyword: 'algarve hidden cove beach cliffs secret',
        title: 'Hidden Beaches in the Algarve',
        desc: 'Secret coves and lesser-known gems that most tourists never find.',
        readTime: 11,
        isNew: false,
        featured: false,
      },
    ],
  };

  window.WebcamsGuiasData = { WEBCAMS: WEBCAMS, GUIA_CARDS: GUIA_CARDS };

})(window);
