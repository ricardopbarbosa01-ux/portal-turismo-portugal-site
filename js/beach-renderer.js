/**
 * js/beach-renderer.js — Shared i18n renderer for beach.html + en/beach.html
 * Depends on: nothing (self-contained, no DOM-ready requirement)
 * Exposes: window.BeachRenderer
 */
(function (window) {
  'use strict';

  // ── I18N STRINGS ───────────────────────────────────────────────────────────
  const I18N_STRINGS = {

    pt: {
      // Meta
      metaDescription: 'Informação detalhada sobre praias de Portugal — qualidade da água, equipamentos, marés e localização.',
      metaDescriptionShort: 'Informação detalhada sobre praias de Portugal.',

      // Breadcrumbs + JSON-LD
      breadcrumb: { home: 'Início', beaches: 'Praias' },

      // Loading / error states
      loading: 'A carregar informação da praia…',
      loadingLabel: 'A carregar',
      errorTitle: 'Praia não encontrada',
      errorBody: 'Não foi possível carregar a informação desta praia. Pode ter sido removida ou o link está incorrecto.',
      errorCta: 'Ver todas as praias',
      errorHome: 'Ir para o Início',

      // Section headings (static HTML labels)
      sections: {
        about:       'Sobre esta praia',
        idealFor:    'Ideal para',
        profile:     'Perfil da Praia',
        vibes:       'Ambiente & Carácter',
        waves:       'Mar & Ondulação',
        wavesSub:    'Previsão de ondas, vento e condições para os próximos dias.',
        tides:       'Marés',
        tidesSub:    'Previsão astronómica (±30 min) — sem API externa',
        location:    'Como Chegar',
        localRecs:   'Recomendações Locais',
        related:     'Praias Semelhantes',
        relatedEyebrow: 'Mais na região',
        exploreEyebrow: 'Descubra na Região',
        exploreTitle: 'Mais para Explorar por Perto',
        partners:    'Experiências e Serviços Próximos',
        partnersEyebrow: 'Parceiros Locais',
      },

      // Editorial note below description
      editorialNote: 'Informação editorial curada pela equipa do Portugal Travel Hub. Qualidade da água por análise oficial da APA. <strong style="color:var(--text-mid);">Antes de partir:</strong> confirme horário do nadador-salvador, acesso viário e lotação — especialmente em época alta e após chuva intensa. As condições podem variar sazonalmente.',

      // Facilities (IDs → labels)
      facilities: {
        parking:    'Estacionamento',
        wc:         'WC',
        restaurant: 'Restaurante',
        lifeguard:  'Nadador-Salvador',
        disabled:   'Acessível',
        showers:    'Duches',
        bar:        'Bar',
        blueflag:   'Bandeira Azul',
        equipment:  'Aluguer de Equipamento',
      },

      // Water quality labels (DB values are PT strings)
      waterQuality: {
        'Excelente':  'Excelente',
        'Boa':        'Boa',
        'Suficiente': 'Suficiente',
        'Aceitável':  'Aceitável',
        'Má':         'Má',
      },

      // Water quality badge prefix
      waterBadgePrefix: 'Água',

      // Region coast types (used in highlights)
      regionCoastTypes: {
        'Algarve':          'Costa de Verão',
        'Norte':            'Costa Atlântica Norte',
        'Centro':           'Costa de Pinhais',
        'Alentejo':         'Costa Selvagem',
        'Lisboa e Setúbal': 'Riviera Portuguesa',
        'Madeira':          'Ilha Atlântica',
        'Açores':           'Arquipélago Vulcânico',
        default:            'Portugal',
      },

      // Highlights labels
      highlights: {
        coastType:    'Tipo de Costa',
        waterQuality: 'Qualidade da Água',
        surf:         'Surf',
        lifeguard:    'Vigilância',
        surfValue:    'Spot confirmado',
        lifeguardValue: 'Nadador-Salvador',
        atlanticType: 'Atlântico',
      },

      // Vibe tags
      vibes: {
        surfSpot:        { label: 'Spot de Surf',        cls: 'vibe-surf'    },
        waterExcellent:  { label: 'Água Excelente',      cls: 'vibe-water'   },
        waterGood:       { label: 'Água Boa',            cls: 'vibe-safe'    },
        lifeguarded:     { label: 'Vigiada',             cls: 'vibe-safe'    },
        beachSupport:    { label: 'Com Apoio de Praia',  cls: 'vibe-amenity' },
        accessible:      { label: 'Acessível',           cls: 'vibe-access'  },
        wild:            { label: 'Selvagem',            cls: 'vibe-wild'    },
        family:          { label: 'Familiar',            cls: 'vibe-family'  },
        uniqueNature:    { label: 'Natureza Única',      cls: 'vibe-nature'  },
        atlanticCoast:   { label: 'Costa Atlântica',     cls: 'vibe-region'  },
        riviera:         { label: 'Riviera Portuguesa',  cls: 'vibe-region'  },
        default:         { label: 'Praia Atlântica',     cls: 'vibe-default' },
      },

      // Ideal para cards
      idealPara: {
        surfers:    { label: 'Surfistas',            sub: 'Spot de surf confirmado' },
        families:   { label: 'Famílias',             sub: 'Praia vigiada'          },
        swimming:   { label: 'Banho e Mergulho',     sub: 'Água' },           // + waterQuality appended
        gastronomy: { label: 'Gastronomia Local',    sub: 'Apoio de praia'         },
        walks:      { label: 'Passeios e Caminhadas',sub: 'Percursos na costa'     },
        fishing:    { label: 'Pesca Desportiva',     sub: 'Costa atlântica'        },
        wildNature: { label: 'Natureza Selvagem',    sub: 'Costa preservada'       },
        photo:      { label: 'Fotografia e Paisagem',sub: 'Vista única'            },
      },

      // Surf / waves section
      surf: {
        level:         'Nível',
        bestSeason:    'Melhor Época',
        orientation:   'Orientação',
        type:          'Tipo',
        wavesNow:      'Ondas agora',
        period:        'Período',
        waveDir:       'Dir. Onda',
        swell:         'Swell',
        wind:          'Vento',
        windDir:       'Dir. Vento',
        gusts:         'Rajadas',
        wavesNext6h:   'Ondas · próximas 6h',
        windNext6h:    'Vento · próximas 6h',
        realtimeSrc:   'Previsão marítima em tempo real',
        now:           'Agora',
        forecast10d:   'Previsão a 10 dias',
        scoreNote:     'Score calculado com base em ondulação, vento e rajadas',
        paywallText:   'Previsão completa a 10 dias disponível no plano Pro',
        paywallBtn:    'Ver planos — €4,99/mês',
        atlanticType:  'Atlântico',
        fallbackNote:  'Ondulação atlântica. Condições variam com a estação e o tempo. Consulte as autoridades locais antes de entrar ao mar.',
        waveConditions: {
          calm:     'Mar calmo — condições ideais para banho e mergulho',
          gentle:   'Ondulação suave — boas condições para banho',
          moderate: 'Ondulação moderada — precaução ao entrar ao mar',
          rough:    'Mar agitado — não aconselhável entrar ao mar',
        },
        waveLabels: {
          calm:   { text: 'Calmo',    cls: 'surf-badge-calm'   },
          small:  { text: 'Pequenas', cls: 'surf-badge-small'  },
          medium: { text: 'Médias',   cls: 'surf-badge-medium' },
          large:  { text: 'Grandes',  cls: 'surf-badge-large'  },
        },
        scoreLabels: {
          great: { cls: 'surf-score-great', label: 'Excelente' },
          good:  { cls: 'surf-score-good',  label: 'Bom'       },
          mod:   { cls: 'surf-score-mod',   label: 'Moderado'  },
          poor:  { cls: 'surf-score-poor',  label: 'Fraco'     },
        },
        levels: {
          all:          'Todos os Níveis',
          intAdv:       'Intermédio–Avançado',
          int:          'Intermédio',
          begInt:       'Iniciante–Intermédio',
          yearRound:    'Todo o Ano',
          sprAutumn:    'Primavera–Outono',
          autWinter:    'Outono–Inverno',
          autSpring:    'Outono–Primavera',
          sprSummer:    'Primavera–Verão',
        },
        days:   ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
        months: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
      },

      // Tides
      tides: {
        high:  'Preia-mar',
        low:   'Baixa-mar',
        next:  'Próxima',
        locale: 'pt-PT',
      },

      // Map / location
      map: {
        gpsCoords:    'Coordenadas GPS',
        openMaps:     'Abrir no Google Maps',
        accessNote:   'Confirme o acesso antes da visita — algumas praias têm estradas sazonais.',
        noGps:        'Localização GPS ainda não disponível para esta praia.',
        searchMaps:   'Pesquisar no Google Maps',
      },

      // Related beaches
      related: {
        viewCard: 'Ver ficha',
        waterPrefix: 'Água',
      },

      // Local recommendations accordion
      localRecs: {
        note: 'Selecção editorial da nossa equipa para esta região — restaurantes com peixe fresco, experiências locais e pontos de interesse a poucos quilómetros. Confirme disponibilidade e horários directamente com cada local antes de partir.',
        groups: {
          food:    'Onde Comer',
          explore: 'O que Explorar',
          tips:    'Dicas Práticas',
        },
        regions: {
          Algarve: {
            food:    ['Marisqueira junto ao porto de pesca local — frutos do mar frescos do dia, longe do circuito turístico das grandes praias', 'Peixe do dia grelhado nas tascas da vila — o almoço mais simples e mais autêntico que se encontra na costa algarvia', 'Gelados de figo e amêndoa — especialidades algarves que a grande distribuição não tem'],
            explore: ['Passeio de barco pelas grutas e falésias: a perspectiva mais bonita da costa algarvia é do mar', 'Interior algarvio a 15–20 km: montanhoso, verde e completamente diferente do litoral', 'Mercado de produtores locais de manhã — alfarrobas, figos, citrinos e mel da serra algarvia'],
            tips:    ['No Verão, chegue antes das 9h30 — o estacionamento junto às praias famosas esgota-se cedo', 'Maio e Outubro têm clima excelente, menos lotação e preços mais baixos que o pico de Agosto', 'A Bandeira Azul é obrigatória na maioria das praias algarves — sinal de qualidade da água e gestão ambiental'],
          },
          Lisboa: {
            food:    ['Marisqueira em Sesimbra ou junto à costa de Setúbal — arroz de marisco e peixe fresco acabado de entrar', 'Tasca no centro histórico de Palmela ou Azeitão: petiscos, chouriço assado e vinho Moscatel local', 'Pastelaria com vista mar na Linha de Cascais — o pequeno-almoço mais bem localizado da Grande Lisboa'],
            explore: ['Serra de Sintra a 30–40 min: Palácio da Pena, parque e a sensação de outro século', 'Parque Natural da Arrábida: trilhos com vista para águas turquesa que parecem do Mediterrâneo', 'Passeio a pé de Cascais ao Estoril — promenade costeira com Casino, jardins e vistas para o Atlântico'],
            tips:    ['A Arrábida tem limite diário de automóveis — chegue antes das 9h30 ou use transporte público alternativo', 'A água do Atlântico Norte é mais fria que no Algarve: mesmo em Agosto pode não passar dos 20°C', 'O comboio de Cais do Sodré chega a Cascais em 40 min — alternativa prática e barata ao carro'],
          },
          Porto: {
            food:    ['Marisqueira em Matosinhos: o bairro do marisco do Porto, a 15 min do centro, com preços de bairro', 'Francesinha e petiscos nortenhos em tascas locais — a gastronomia do Porto é tão boa como a vista', 'Sardinhas assadas e vinho verde nos bares junto ao rio Douro, ao fim da tarde'],
            explore: ['Centro histórico do Porto é Património UNESCO — reserve meio dia para se perder nas ruas', 'Caves do Vinho do Porto em Vila Nova de Gaia: visita com prova, vista para o Douro incluída', 'Foz do Douro: onde o rio encontra o oceano — passeio clássico ao pôr do sol, sem turismo excessivo'],
            tips:    ['A ondulação na costa norte é mais poderosa que no sul — confirme as condições antes de entrar ao mar', 'O Metro chega à Foz e a Matosinhos — prático para evitar o pesadelo de estacionamento no Verão', 'Clima atlântico instável: leve sempre uma camisola impermeável, mesmo em pleno Agosto'],
          },
          Alentejo: {
            food:    ['Açorda de marisco, migas com porco preto e carne alentejana — gastronomia de interior com muito carácter', 'Prova de vinhos alentejanos em adegas da região: alguns dos melhores brancos e tintos de Portugal nascem aqui', 'Mercearia local com enchidos, queijo de Évora DOP e mel de rosmaninho — leve para casa'],
            explore: ['Rota Vicentina: percursos pedestres certificados ao longo da Costa Vicentina, de classe mundial', 'Praias praticamente desertas mesmo no Verão — o Alentejo litoral é o maior segredo bem guardado de Portugal', 'Aldeias do interior a menos de 30 min: Grândola, Cercal e Santiago do Cacém têm história e calma genuína'],
            tips:    ['A Costa Vicentina é parque natural protegido — infraestrutura mínima intencional, leve tudo o que precisar', 'Vento forte é frequente — confirme condições antes de ir com crianças pequenas ou em dias de nortada', 'Primavera (Março–Maio) é a melhor altura: flores silvestres, temperatura amena e muito menos gente'],
          },
          Madeira: {
            food:    ['Espada com banana e lapas grelhadas com manteiga e alho — os dois pratos mais emblemáticos da ilha', 'Poncha de aguardente de cana com mel e limão em bares locais — a bebida da Madeira, pedir sempre', 'Mercado dos Lavradores no Funchal: frutas tropicais, flores de corte e especialidades regionais a bom preço'],
            explore: ['Levadas: canais de irrigação do séc. XVI transformados nos percursos pedestres mais únicos da Europa', 'Piscinas naturais de lava em Porto Moniz ou Seixal — a alternativa segura e espectacular ao mar aberto', 'Cabo Girão: um dos mais altos do mundo, com plataforma de vidro sobre o oceano a 580 metros de altura'],
            tips:    ['O mar da Madeira é agitado e profundo — as piscinas naturais são a opção mais segura e confortável para banho', 'A costa norte é mais fresca, ventosa e chuvosa; a costa sul tem melhor clima para praia', 'Alugar carro é quase obrigatório para explorar a ilha a fundo — estradas estreitas, mas vistas incomparáveis'],
          },
          Açores: {
            food:    ['Cozido das Furnas: feito em caldeiras vulcânicas subterrâneas — uma experiência gastronómica sem paralelo no mundo', 'Lapas, percebes e atum de linha — marisco e peixe da costa açoriana, notavelmente frescos e a bom preço', 'Queijo e manteiga açoriana DOP — produtos lácteos de qualidade reconhecida e sabor distinto, bem diferentes do continente'],
            explore: ['Sete Cidades e Lagoa do Fogo em São Miguel: paisagens vulcânicas que parecem de outro planeta', 'Avistamento de cetáceos: os Açores têm das melhores condições da Europa para ver baleias e golfinhos', 'Trilhos pedestres entre caldeiras, pastagens e costa — percursos certificados e marcados em todas as ilhas'],
            tips:    ['O clima muda várias vezes num dia — leve capa de chuva mesmo com sol a toda a manhã', 'As piscinas naturais de rocha basáltica são a forma principal de mergulho; o mar aberto pode ser perigoso', 'Voos diretos do Continente: ~2h para São Miguel, ~3h30 para as ilhas do grupo central e ocidental'],
          },
          default: {
            food:    ['Procure a tasca ou restaurante mais frequentado pelos locais — geralmente a melhor relação qualidade/preço da zona', 'Mercado municipal da vila mais próxima para produtos regionais frescos: frutas, queijos e enchidos locais', 'Peixe ou marisco grelhado ao almoço é sempre uma aposta segura e saborosa perto de qualquer costa portuguesa'],
            explore: ['Percurso pedestre ou ciclovia ao longo da costa — a maioria das praias tem trilhos nas imediações', 'Centro histórico ou castelo da vila mais próxima: normalmente a menos de 20 min e frequentemente surpreendente', 'Miradouros e pontos de vista naturais na zona — pergunte a um local, os melhores nem sempre estão sinalizados'],
            tips:    ['Confirme a bandeira e as condições do mar antes de entrar na água — muda ao longo do dia', 'Protetor solar, chapéu e água em abundância — o sol atlântico é mais forte do que parece, especialmente em Julho e Agosto', 'Estacionamento junto à praia esgota-se cedo no Verão — chegue antes das 10h ou use transporte alternativo'],
          },
        },
      },

      // Explore zona cards
      exploreZona: {
        surf:    { label: 'Surf & Ondas',     title: 'Condições de Surf',       desc: 'Spots, níveis e previsão de ondas para surfistas nesta região.',           cta: 'Explorar Surf'  },
        planner: { label: 'Planear Visita',   title: 'Organiza a Tua Ida',      desc: 'Combina marés, alojamento e atividades numa viagem à medida.',              cta: 'Criar Plano'    },
        fishing: { label: 'Pesca Desportiva', title: 'Locais de Pesca',         desc: 'Pontos de pesca, espécies e charters disponíveis nesta zona.',              cta: 'Ver Pesca'      },
        webcams: { label: 'Webcams ao Vivo',  title: 'Câmeras em Direto',       desc: 'Veja as condições atuais da praia em tempo real antes de sair.',            cta: 'Ver Webcams'    },
        regions: {
          'Algarve':          { label: 'Praias do Algarve',      title: 'Mais Praias no Algarve',        desc: 'De Sagres à Meia Praia — descobre as melhores praias do Algarve.',       cta: 'Ver Algarve'   },
          'Norte':            { label: 'Praias do Norte',        title: 'Explorar o Norte de Portugal',  desc: 'Praias atlânticas selvagens e estuários do norte do país.',               cta: 'Explorar Norte' },
          'Centro':           { label: 'Praias do Centro',       title: 'Explorar o Centro de Portugal', desc: 'Costa de pinhais, lagoas e areia fina no centro de Portugal.',            cta: 'Ver Centro'    },
          'Madeira':          { label: 'Praias da Madeira',      title: 'Explorar a Madeira',            desc: 'Praias vulcânicas e piscinas naturais na ilha da Madeira.',               cta: 'Ver Madeira'   },
          'Alentejo':         { label: 'Costa do Alentejo',      title: 'Praias do Alentejo',            desc: 'Costa selvagem e ventosa com praias desertas no Alentejo litoral.',       cta: 'Ver Alentejo'  },
          'Lisboa e Setúbal': { label: 'Praias perto de Lisboa', title: 'Lisboa e Setúbal',              desc: 'De Cascais a Setúbal — as melhores praias junto à capital.',              cta: 'Ver Lisboa'    },
          default:            { label: 'Praias da Região',       title: 'Explorar a Zona',              desc: 'Descobre outras praias próximas com características similares.',           cta: 'Ver Região'    },
        },
      },

      // Planear final band
      planearFinal: {
        eyebrow:       'Próximo passo recomendado',
        titleTemplate: function (name) { return 'Planeia a visita\na ' + name; },
        descTemplate:  function (name, region) { return 'A maioria dos visitantes de ' + name + ' fica em ' + (region || 'Portugal') + ' — um bom ponto de partida para estar perto da praia. Combina marés, alojamento e atividades antes que os melhores sítios para ficar se esgotem.'; },
        createPlan:    'Criar Plano de Visita',
        regionBeaches: 'Praias da Região',
        surfForecast:  'Previsão de Surf',
        saveBeach:     'Guardar Praia',
        trust:         'Grátis · Sem registo obrigatório · Sem compromisso · Dados atualizados diariamente',
        stayLabels: {
          'Algarve':          'Onde Ficar no Algarve',
          'Lisboa e Setúbal': 'Onde Ficar em Lisboa e Setúbal',
          'Norte':            'Onde Ficar no Norte de Portugal',
          'Alentejo':         'Onde Ficar na Costa do Alentejo',
          'Madeira':          'Onde Ficar na Madeira',
          'Centro':           'Onde Ficar no Centro de Portugal',
          'Oeste':            'Onde Ficar no Oeste de Portugal',
          default:            'Procurar Alojamento Próximo',
        },
      },

      // Partners section
      partners: {
        eyebrow:        'Parceiros Locais',
        title:          'Experiências e Serviços Próximos',
        noteTemplate:   function (region) { return 'Sugestões editoriais para a zona de ' + region + ' — confirme disponibilidade diretamente com o operador.'; },
        viewAll:        'Ver todos',
        b2bNote:        'É um operador local? Apareça nesta secção e chegue a visitantes que já estão na zona.',
        b2bCta:         'Quero ser Parceiro',
        badges: {
          destaque:   'Destaque',
          verificado: 'Verificado',
          novo:       'Novo',
        },
      },

      // Alerts modal
      alerts: {
        modalTitle:     'Novo alerta',
        modalTitleFor:  function (name) { return 'Novo alerta para ' + name; },
        conditionLabel: 'Condição',
        valueLabel:     'Valor',
        conditions: {
          'wave_height|above': 'Ondas acima de',
          'wave_height|below': 'Ondas abaixo de',
          'wind_speed|above':  'Vento acima de',
          'wind_speed|below':  'Vento abaixo de',
          'temperature|above': 'Temperatura acima de',
          'temperature|below': 'Temperatura abaixo de',
        },
        saveBtnLabel:   'Guardar alerta',
        cancelBtnLabel: 'Cancelar',
        createBtn:      'Criar Alerta',
        proTooltip:     'Disponível no plano Pro',
        savedToast:     'Alerta criado! Receberás um email quando as condições forem atingidas.',
        deleteLabel:    'Apagar alerta',
        onboarding:     'Alerta criado. Gere todos os teus alertas em <a href="/conta.html#alertas">A minha conta</a>.',
      },

      // Description fallback templates
      descriptionFallback: {
        nameDefault: 'Esta praia',
        regionChar: {
          'Algarve':  'no litoral algarvio, numa costa marcada por falésias douradas, enseadas protegidas e boa temperatura de água no Verão',
          'Lisboa':   'na costa atlântica da região de Lisboa, entre a Serra de Sintra e as baías naturais do Sado',
          'Porto':    'na costa norte de Portugal, com areias largas e a ondulação atlântica característica do Noroeste',
          'Alentejo': 'na costa alentejana, integrada numa das faixas litorais mais preservadas e menos urbanizadas da Europa Ocidental',
          'Madeira':  'na ilha da Madeira, onde a montanha vulcânica mergulha directamente num Atlântico azul-profundo',
          'Açores':   'no arquipélago dos Açores, no meio do Atlântico Norte, rodeada de biodiversidade marinha e paisagem vulcânica única',
          default:    'na costa atlântica portuguesa',
        },
        openingTemplate: function (name, char) { return name + ' situa-se ' + char + '.'; },
        factWaterExcellent: 'A qualidade da água é classificada como <strong>Excelente</strong> — entre as melhores da região para banho.',
        factWaterGood:      'A qualidade da água é <strong>Boa</strong>, adequada para banho ao longo de toda a época balnear.',
        factWaterOther:     function (wq) { return 'Qualidade da água registada: <strong>' + wq + '</strong>.'; },
        factLifeguard:      'Vigiada com nadador-salvador durante a época balnear.',
        factRestaurant:     'Dispõe de apoio de praia ou restaurante nas proximidades.',
        factParking:        'Tem estacionamento disponível na zona de acesso.',
        factDisabled:       'Acessível a pessoas com mobilidade reduzida.',
        regionClose: {
          'Algarve':  'Uma paragem obrigatória para quem explora o sul de Portugal.',
          'Lisboa':   'Uma escapada de fim de semana a menos de uma hora de Lisboa.',
          'Porto':    'Um destino de surf e natureza a poucos minutos do centro do Porto.',
          'Alentejo': 'Para quem procura natureza intacta e a praia sem o barulho das multidões.',
          'Madeira':  'Uma experiência costeira única, bem diferente do típico turismo de praia.',
          'Açores':   'Para viajantes que procuram o Atlântico na sua forma mais autêntica e selvagem.',
          default:    'Uma praia que merece ser descoberta ao longo da costa atlântica portuguesa.',
        },
      },

      // Dynamic meta description fragments
      metaDynamic: {
        beachIn:    function (name, region) { return name + ' — praia em ' + (region || 'Portugal') + '.'; },
        waterPrefix: 'Água',
        surfSpot:    'Spot de surf.',
        lifeguarded: 'Praia vigiada.',
      },

      // Hero alt text
      heroAlt: {
        withName:   function (name, region) { return 'Praia ' + name + ' — ' + (region || 'Portugal'); },
        generic:    'Praia em Portugal',
      },

      // JSON-LD description fallback
      jsonLdDesc: function (name, region) { return 'Praia ' + name + ' em ' + (region || 'Portugal') + ', Portugal.'; },

      // ── Surf page i18n ───────────────────────────────────────────────────────
      surf: {
        spotCount: function (n) { return '<strong>' + n + '</strong> spot' + (n !== 1 ? 's' : ''); },
        emptyTitle: 'Sem spots encontrados',
        emptySub:   'Tente outros filtros ou explore todas as regiões disponíveis.',
        emptyCta:   'Ver todos os spots',
        levelLabel: { iniciante: 'Iniciante', intermedio: 'Intermédio', avancado: 'Avançado', profissional: 'Profissional' },
        levelLabelComposite: {
          iniciante_intermedio: 'Iniciante–Intermédio',
          intermedio_avancado:  'Intermédio–Avançado',
        },
        swellLabel:  'Swell',
        windLabel:   'Vento',
        seasonLabel: 'Melhor época',
        exploreRegion:     'Explorar região',
        exploreRegionAria: function (r) { return 'Praias de ' + r; },
        metaTitle:       'Surf em Portugal — Spots, Ondas e Guia · Portugal Travel Hub',
        metaDescription: 'Os melhores spots de surf em Portugal — de Peniche e Nazaré ao Algarve e Açores. Perfil de onda, nível recomendado e guia prático.',
        faqs: [
          {
            q: 'Quando é a melhor época para surfar em Portugal?',
            a: 'Outubro a Abril é a época de ouro — o Atlântico Norte gera swells consistentes e potentes. O Verão (Junho–Setembro) é ideal para iniciantes: ondas mais pequenas, água mais quente (19–22°C) e melhores condições para aulas em escola.'
          },
          {
            q: 'Qual o spot mais adequado para principiantes?',
            a: 'Costa da Caparica (Lisboa) e Praia do Amado (Algarve) são as duas melhores opções. Ambas têm escolas de surf certificadas, ondas adequadas para aprender e boa infraestrutura de apoio.'
          },
          {
            q: 'É necessário saber nadar para aprender surf?',
            a: 'Sim — é essencial saber nadar confortavelmente antes de entrar ao mar com uma prancha. As escolas de surf exigem capacidade básica de natação e realizam uma avaliação inicial antes das aulas.'
          },
          {
            q: 'Qual o equipamento básico necessário?',
            a: 'Prancha (disponível para aluguer em todas as escolas), fato de neoprene (obrigatório de Outubro a Abril, recomendado nos outros meses) e protetor solar resistente à água. Nada mais é necessário para começar.'
          },
          {
            q: 'Posso surfar em Portugal durante todo o ano?',
            a: 'Sim. Portugal tem ondas em todas as estações. No Verão as condições são mais suaves, ideais para iniciantes. No Outono e Inverno as ondas são maiores e mais consistentes, ideais para níveis intermédio e avançado.'
          },
          {
            q: 'Quanto custa uma aula de surf em Portugal?',
            a: 'Uma aula de grupo de 2 horas custa entre 25€ e 45€ por pessoa, dependendo da escola e da região. Aulas particulares variam entre 60€ e 100€. A maioria das escolas inclui prancha e fato de neoprene no preço. No Algarve e Lisboa os preços tendem a ser ligeiramente mais elevados do que na Costa de Prata.'
          },
          {
            q: 'É perigoso surfar em Portugal para iniciantes?',
            a: 'Em spots adequados para iniciantes, com escola e instrutor certificado, o surf é uma atividade segura. É fundamental não entrar sozinho ao mar sem instrução — rip currents, correntes de retorno e bancos de areia submersos podem surpreender quem não conhece o local. Aprender com escola certificada é fortemente recomendado.'
          }
        ],
      },

      // ── Fishing page i18n ────────────────────────────────────────────────────
      fishing: {
        spotCount: function (n) { return '<strong>' + n + '</strong> spot' + (n !== 1 ? 's' : ''); },
        emptyTitle: 'Sem spots encontrados',
        emptySub:   'Tente outros filtros ou explore todos os tipos e regiões disponíveis.',
        emptyCta:   'Ver todos os spots',
        levelLabel: { iniciante: 'Iniciante', intermedio: 'Intermédio', experiente: 'Experiente', profissional: 'Profissional' },
        tipoLabel:  { rocha: 'Rocha', ria: 'Ria & Estuário', costeira: 'Costeira', embarcacao: 'Embarcação', fluvial: 'Fluvial' },
        seasonLabel:   'Melhor época',
        especiesLabel: 'Espécies',
        saveCta:       'Guardar',
        metaTitle:       'Pesca em Portugal — Spots, Espécies e Guia · Portugal Travel Hub',
        metaDescription: 'Os melhores spots de pesca em Portugal — de Sagres e Sesimbra aos Açores. Tipo de pesca, espécies-alvo, melhor época e guia prático.',
        faqs: [
          {
            q: 'Preciso de licença para pescar em Portugal?',
            a: 'Sim. A pesca lúdica em Portugal requer licença emitida pelo ICNF (Instituto da Conservação da Natureza e das Florestas). A licença anual tem custo acessível e pode ser obtida online no portal do ICNF ou em lojas de pesca. Em zonas protegidas podem existir restrições adicionais — consulte sempre antes de pescar.'
          },
          {
            q: 'Qual é a melhor época para pesca em Portugal?',
            a: 'Depende da espécie e do tipo de pesca. Para atum e espadim em mar alto: Junho a Outubro. Para sável e lampreia nos rios: Março a Junho. Para robalão e pargo na costa: todo o ano com pico no Outono e Inverno. A Ria Formosa e a Ria de Aveiro são produtivas ao longo de todo o ano.'
          },
          {
            q: 'Posso pescar sem barco em Portugal?',
            a: 'Sim. A pesca de costa — em praias (surfcasting), rochas e pontões — não requer embarcação e é acessível em toda a costa continental. Requer apenas a licença adequada e o equipamento certo. Molhes, quebra-mares e esporões são também boas opções de acesso sem barco.'
          },
          {
            q: 'O que preciso de levar para uma saída de pesca?',
            a: 'Para pesca de costa: cana ou colher, carreto, linha, anzóis, isco (natural ou artificial) e licença. Para pesca de embarcação: o operador geralmente fornece equipamento. Recomendamos colete salva-vidas, proteção solar, água e lanche. Consulte sempre a previsão meteorológica antes de sair.'
          },
          {
            q: 'Existem barcos fretados para iniciantes no Algarve?',
            a: 'Sim. Vários operadores em Portimão, Vilamoura e Lagos oferecem saídas para iniciantes com equipamento incluído e guia experiente a bordo — ideal para quem quer uma experiência de pesca em mar alto sem equipamento próprio. Reserva antecipada é recomendada no Verão.'
          },
          {
            q: 'Quanto custa alugar um barco de pesca em Portugal?',
            a: 'Uma saída partilhada (shared trip) custa entre 40€ e 80€ por pessoa por meio-dia. Fretamento exclusivo varia entre 200€ e 600€ por dia, dependendo do barco e da zona. Os Açores têm os preços mais elevados devido ao tipo de pesca de big game. No Algarve, Portimão e Vilamoura oferecem as melhores opções de fretamento partilhado para iniciantes.'
          },
          {
            q: 'Quais são as espécies mais comuns na pesca de costa em Portugal?',
            a: 'Na pesca de costa as espécies mais comuns são: robalo, dourada, sargo, pargo, ruivo e linguado. Na pesca de embarcação costeira: carapau, peixe-espada, safio e garoupa. Em mar alto nos Açores e Madeira: atum rabilho, wahoo, espadim e mahi-mahi. A época do ano e o tipo de fundo determinam as espécies disponíveis em cada zona.'
          }
        ],
      },

      // ── Webcams page i18n ────────────────────────────────────────────────────
      webcams: {
        stateLabel: { live: 'Disponível', pending: 'Em Integração', soon: 'Brevemente' },
        searchPlaceholder: 'Praia ou localidade…',
        filterLabel: 'Filtrar:',
        allRegions: 'Todas as Regiões',
        allTypes: 'Todos os tipos',
        condUnavail: 'Condições indisponíveis',
        emptyTitle: 'Sem webcams encontradas',
        emptySub: 'Tente outros filtros ou pesquise outra localização.',
        emptyReset: 'Ver todas as webcams',
        countTemplate: function (n) { return '<strong>' + n + '</strong> webcam' + (n !== 1 ? 's' : ''); },
        actionLive: 'Ver ao Vivo',
        actionBeaches: 'Descobrir Praias',
        actionExplore: { surf: 'Ver Surf', pesca: 'Ver Pesca', default: 'Ver Praias' },
        actionPlan: 'Planear nesta Zona',
      },

      // ── Guias hub page i18n ──────────────────────────────────────────────────
      guias: {
        badgeNew: 'NOVO',
        readTimeUnit: 'min de leitura',
        readCta: 'Ler guia',
        proTitle: 'Conteúdo exclusivo Pro',
        proDesc: 'Cada guia tem uma secção gratuita e conteúdo exclusivo para membros Pro — listas detalhadas, mapas, alertas de condições e actualizações sazonais.',
        proCta: 'Ver planos — €4,99/mês',
        ctaPlan: 'Planear viagem',
        ctaBeaches: 'Explorar praias',
        breadcrumbCurrent: 'Guias',
        heroUpdated: 'Actualizado Abril 2026',
        heroGuideCount: '5 guias',
      },
    },

    // ── ENGLISH ────────────────────────────────────────────────────────────────
    en: {
      metaDescription: 'Detailed information about Portugal beaches — water quality, facilities, tides and location.',
      metaDescriptionShort: 'Detailed beach information — Portugal.',

      breadcrumb: { home: 'Home', beaches: 'Beaches' },

      loading: 'Loading beach information…',
      loadingLabel: 'Loading',
      errorTitle: 'Beach not found',
      errorBody: 'Unable to load information for this beach. It may have been removed or the link is incorrect.',
      errorCta: 'View all beaches',
      errorHome: 'Go to Homepage',

      sections: {
        about:       'About this beach',
        idealFor:    'Ideal for',
        profile:     'Beach Profile',
        vibes:       'Atmosphere & Character',
        waves:       'Waves & Sea Conditions',
        wavesSub:    'Wave, wind and conditions forecast for the coming days.',
        tides:       'Tides',
        tidesSub:    'Astronomical prediction (±30 min) · no external API',
        location:    'How to Get There',
        localRecs:   'Local Recommendations',
        related:     'Similar Beaches',
        relatedEyebrow: 'More in the region',
        exploreEyebrow: 'Discover the Region',
        exploreTitle: 'More to Explore Nearby',
        partners:    'Nearby Experiences & Services',
        partnersEyebrow: 'Local Partners',
      },

      editorialNote: 'Editorial information curated by the Portugal Travel Hub team. Water quality by official APA analysis. <strong style="color:var(--text-mid);">Before you go:</strong> confirm lifeguard hours, road access and capacity — especially in high season and after heavy rain. Conditions may vary seasonally.',

      facilities: {
        parking:    'Parking',
        wc:         'WC / Toilets',
        restaurant: 'Restaurant',
        lifeguard:  'Lifeguard',
        disabled:   'Accessible',
        showers:    'Showers',
        bar:        'Beach Bar',
        blueflag:   'Blue Flag',
        equipment:  'Equipment Hire',
      },

      waterQuality: {
        'Excelente':  'Excellent',
        'Boa':        'Good',
        'Suficiente': 'Sufficient',   // TRANSLATION_REVIEW: may map to Acceptable in practice
        'Aceitável':  'Acceptable',
        'Má':         'Poor',
      },

      waterBadgePrefix: 'Water',

      regionCoastTypes: {
        'Algarve':          'Summer Coast',
        'Norte':            'Northern Atlantic Coast',
        'Centro':           'Pine Forest Coast',        // TRANSLATION_REVIEW: Costa de Pinhais
        'Alentejo':         'Wild Coast',
        'Lisboa e Setúbal': 'Portuguese Riviera',
        'Madeira':          'Atlantic Island',
        'Açores':           'Volcanic Archipelago',
        default:            'Portugal',
      },

      highlights: {
        coastType:    'Coast Type',
        waterQuality: 'Water Quality',
        surf:         'Surf',
        lifeguard:    'Supervision',
        surfValue:    'Confirmed spot',
        lifeguardValue: 'Lifeguard',
        atlanticType: 'Atlantic',
      },

      vibes: {
        surfSpot:        { label: 'Surf Spot',            cls: 'vibe-surf'    },
        waterExcellent:  { label: 'Excellent Water',      cls: 'vibe-water'   },
        waterGood:       { label: 'Good Water Quality',   cls: 'vibe-safe'    },
        lifeguarded:     { label: 'Lifeguard on Duty',    cls: 'vibe-safe'    },
        beachSupport:    { label: 'Beach Support',        cls: 'vibe-amenity' },
        accessible:      { label: 'Accessible',           cls: 'vibe-access'  },
        wild:            { label: 'Wild & Unspoilt',      cls: 'vibe-wild'    },
        family:          { label: 'Family-Friendly',      cls: 'vibe-family'  },
        uniqueNature:    { label: 'Unique Nature',        cls: 'vibe-nature'  },
        atlanticCoast:   { label: 'Atlantic Coast',       cls: 'vibe-region'  },
        riviera:         { label: 'Portuguese Riviera',   cls: 'vibe-region'  },
        default:         { label: 'Atlantic Beach',       cls: 'vibe-default' },
      },

      idealPara: {
        surfers:    { label: 'Surfers',                sub: 'Confirmed surf spot'    },
        families:   { label: 'Families',               sub: 'Lifeguarded beach'      },
        swimming:   { label: 'Swimming & Snorkelling', sub: 'Water' },    // + waterQuality appended
        gastronomy: { label: 'Local Gastronomy',       sub: 'Beach support'          },
        walks:      { label: 'Walks & Hikes',          sub: 'Coastal trails'         },
        fishing:    { label: 'Sport Fishing',          sub: 'Atlantic coast'         },
        wildNature: { label: 'Wild Nature',            sub: 'Preserved coastline'    },
        photo:      { label: 'Photography & Scenery',  sub: 'Unique views'           },
      },

      surf: {
        level:         'Level',
        bestSeason:    'Best Season',
        orientation:   'Orientation',
        type:          'Type',
        wavesNow:      'Waves now',
        period:        'Period',
        waveDir:       'Wave Dir.',
        swell:         'Swell',
        wind:          'Wind',
        windDir:       'Wind Dir.',
        gusts:         'Gusts',
        wavesNext6h:   'Waves · next 6h',
        windNext6h:    'Wind · next 6h',
        realtimeSrc:   'Real-time maritime forecast',
        now:           'Now',
        forecast10d:   '10-day forecast',
        scoreNote:     'Score calculated based on swell, wind and gusts',
        paywallText:   'Full 10-day forecast available on the Pro plan',
        paywallBtn:    'View plans — €4.99/month',
        atlanticType:  'Atlantic',
        fallbackNote:  'Atlantic swell. Conditions vary with season and weather. Check with local authorities before entering the water.',
        waveConditions: {
          calm:     'Calm sea — ideal conditions for swimming and snorkelling',
          gentle:   'Gentle swell — good swimming conditions',
          moderate: 'Moderate swell — exercise caution when entering the water',
          rough:    'Rough sea — not recommended to enter the water',
        },
        waveLabels: {
          calm:   { text: 'Calm',   cls: 'surf-badge-calm'   },
          small:  { text: 'Small',  cls: 'surf-badge-small'  },
          medium: { text: 'Medium', cls: 'surf-badge-medium' },
          large:  { text: 'Large',  cls: 'surf-badge-large'  },
        },
        scoreLabels: {
          great: { cls: 'surf-score-great', label: 'Excellent' },
          good:  { cls: 'surf-score-good',  label: 'Good'      },
          mod:   { cls: 'surf-score-mod',   label: 'Moderate'  },
          poor:  { cls: 'surf-score-poor',  label: 'Poor'      },
        },
        levels: {
          all:       'All Levels',
          intAdv:    'Intermediate–Advanced',
          int:       'Intermediate',
          begInt:    'Beginner–Intermediate',
          yearRound: 'Year-round',
          sprAutumn: 'Spring–Autumn',
          autWinter: 'Autumn–Winter',
          autSpring: 'Autumn–Spring',
          sprSummer: 'Spring–Summer',
        },
        days:   ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
        months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      },

      tides: {
        high:  'High tide',
        low:   'Low tide',
        next:  'Next',
        locale: 'en-GB',
      },

      map: {
        gpsCoords:  'GPS Coordinates',
        openMaps:   'Open in Google Maps',
        accessNote: 'Check access before visiting — some beaches have seasonal roads.',
        noGps:      'GPS location not yet available for this beach.',
        searchMaps: 'Search on Google Maps',
      },

      related: {
        viewCard:    'View details',
        waterPrefix: 'Water',
      },

      localRecs: {
        note: 'Editorial selection by our team for this region — restaurants with fresh fish, local experiences and points of interest a few kilometres away. Confirm availability and hours directly with each venue before you go.',
        groups: {
          food:    'Where to Eat',
          explore: 'What to Explore',
          tips:    'Practical Tips',
        },
        regions: {
          Algarve: {
            food:    ['Seafood restaurant by the local fishing harbour — fresh catch of the day, away from the tourist circuit of the big beaches', 'Grilled catch of the day in local tascas — the simplest and most authentic lunch you\'ll find on the Algarve coast', 'Fig and almond ice cream — Algarve specialities you won\'t find in supermarkets'],  // TRANSLATION_REVIEW: "tascas" kept as local term
            explore: ['Boat trip through caves and cliffs: the most beautiful view of the Algarve coast is from the sea', 'Algarve interior 15–20 km away: hilly, green and completely different from the coast', 'Local producers\' market in the morning — carob, figs, citrus and honey from the Algarve hills'],
            tips:    ['In summer, arrive before 9:30 am — parking near famous beaches fills up early', 'May and October offer excellent weather, fewer crowds and lower prices than the August peak', 'The Blue Flag is mandatory at most Algarve beaches — a sign of water quality and environmental management'],
          },
          Lisboa: {
            food:    ['Seafood restaurant in Sesimbra or along the Setúbal coast — rice with shellfish and freshly arrived fish', 'Tasca in the historic centre of Palmela or Azeitão: petiscos, grilled chouriço and local Moscatel wine',  // TRANSLATION_REVIEW: "tasca", "petiscos", "chouriço" kept as local food terms
                      'Pastry shop with sea view on the Cascais line — the best-located breakfast in Greater Lisbon'],
            explore: ['Serra de Sintra 30–40 min away: Pena Palace, the park and a sense of another century', 'Arrábida Natural Park: trails with views over turquoise waters that look Mediterranean', 'Walk from Cascais to Estoril — coastal promenade with Casino, gardens and Atlantic views'],
            tips:    ['Arrábida has a daily car limit — arrive before 9:30 am or use alternative public transport', 'North Atlantic water is colder than the Algarve: even in August it may not exceed 20°C', 'The train from Cais do Sodré reaches Cascais in 40 min — a practical and affordable alternative to driving'],
          },
          Porto: {
            food:    ['Seafood restaurant in Matosinhos: Porto\'s shellfish district, 15 min from the centre, at local prices', 'Francesinha and northern petiscos in local tascas — Porto\'s gastronomy is as good as its views',  // TRANSLATION_REVIEW: "Francesinha", "petiscos", "tascas" kept as local terms
                      'Grilled sardines and vinho verde at bars along the Douro river in the late afternoon'],  // TRANSLATION_REVIEW: "vinho verde" kept
            explore: ['Porto historic centre is a UNESCO World Heritage Site — set aside half a day to wander the streets', 'Port wine cellars in Vila Nova de Gaia: guided tour with tasting, Douro views included', 'Foz do Douro: where the river meets the ocean — a classic sunset walk with no tourist excess'],
            tips:    ['Swell on the northern coast is more powerful than in the south — check conditions before entering the water', 'The Metro reaches Foz and Matosinhos — practical to avoid the summer parking nightmare', 'Unstable Atlantic climate: always bring a waterproof, even in the middle of August'],
          },
          Alentejo: {
            food:    ['Açorda de marisco, migas with black pork and Alentejo meat — hearty interior cuisine with real character',  // TRANSLATION_REVIEW: "Açorda de marisco", "migas" kept as untranslatable local dishes
                      'Alentejo wine tasting at local estates: some of Portugal\'s best whites and reds are born here', 'Local deli with cured meats, Évora PDO cheese and rosemary honey — take some home'],
            explore: ['Rota Vicentina: certified walking routes along the Vicentine Coast, world-class standard',  // TRANSLATION_REVIEW: "Rota Vicentina" is a proper name
                      'Practically deserted beaches even in summer — the Alentejo coast is Portugal\'s best-kept secret', 'Villages inland less than 30 min away: Grândola, Cercal and Santiago do Cacém have history and genuine calm'],
            tips:    ['The Vicentine Coast is a protected natural park — minimal infrastructure by design, bring everything you need', 'Strong wind is common — check conditions before going with small children or on northerly wind days', 'Spring (March–May) is the best time: wildflowers, mild temperatures and far fewer people'],
          },
          Madeira: {
            food:    ['Espada with banana and grilled limpets with butter and garlic — the two most iconic dishes of the island',  // TRANSLATION_REVIEW: "Espada com banana" and "lapas" are very Madeiran
                      'Poncha — cane spirit with honey and lemon at local bars, the Madeiran drink, always order one',  // TRANSLATION_REVIEW: "Poncha" kept
                      'Mercado dos Lavradores in Funchal: tropical fruits, cut flowers and regional specialities at good prices'],
            explore: ['Levadas: 16th-century irrigation channels transformed into the most unique hiking trails in Europe',  // TRANSLATION_REVIEW: "Levadas" kept
                      'Natural lava pools at Porto Moniz or Seixal — the spectacular and safe alternative to the open sea', 'Cabo Girão: one of the highest sea cliffs in the world, with a glass platform over the ocean at 580 metres'],
            tips:    ['Madeiran sea is rough and deep — the natural pools are the safest and most comfortable option for swimming', 'The north coast is cooler, windier and rainier; the south coast has better beach weather', 'Hiring a car is almost essential to explore the island thoroughly — narrow roads, but incomparable views'],
          },
          Açores: {
            food:    ['Cozido das Furnas: cooked in underground volcanic calderas — a gastronomic experience unparalleled in the world',  // TRANSLATION_REVIEW: "Cozido das Furnas" is a proper dish name
                      'Limpets, barnacles and line-caught tuna — shellfish and fish from the Azorean coast, remarkably fresh and good value',  // TRANSLATION_REVIEW: "Lapas" = limpets, "percebes" = barnacles
                      'Azorean PDO cheese and butter — dairy products of recognised quality and a distinct flavour, very different from the mainland'],
            explore: ['Sete Cidades and Lagoa do Fogo on São Miguel: volcanic landscapes that look like another planet', 'Whale watching: the Azores have some of Europe\'s best conditions for seeing whales and dolphins', 'Walking trails between calderas, pastures and coast — certified, marked routes on all islands'],
            tips:    ['The weather changes several times in a day — bring a rain jacket even when it\'s sunny all morning', 'Natural basalt rock pools are the main way to swim; the open sea can be dangerous', 'Direct flights from the mainland: ~2h to São Miguel, ~3h30 to the central and western island groups'],
          },
          default: {
            food:    ['Look for the tasca or restaurant most frequented by locals — usually the best value in the area',  // TRANSLATION_REVIEW: "tasca" kept
                      'Municipal market of the nearest town for fresh regional produce: fruit, cheese and cured meats', 'Grilled fish or shellfish at lunch is always a reliable and tasty choice near any Portuguese coast'],
            explore: ['Walking or cycling trail along the coast — most beaches have trails nearby', 'Historic centre or castle of the nearest town: usually less than 20 min away and frequently surprising', 'Natural viewpoints and vantage points in the area — ask a local, the best ones aren\'t always signposted'],
            tips:    ['Check the flag and sea conditions before entering the water — they change throughout the day', 'Sunscreen, hat and plenty of water — the Atlantic sun is stronger than it looks, especially in July and August', 'Beachside parking fills up early in summer — arrive before 10 am or use alternative transport'],
          },
        },
      },

      exploreZona: {
        surf:    { label: 'Surf & Waves',     title: 'Surf Conditions',       desc: 'Spots, levels and wave forecasts for surfers in this region.',               cta: 'Explore Surf'   },
        planner: { label: 'Plan Visit',       title: 'Plan Your Trip',        desc: 'Combine tides, accommodation and activities for a tailored trip.',            cta: 'Create Plan'    },
        fishing: { label: 'Sport Fishing',    title: 'Fishing Spots',         desc: 'Fishing spots, species and charters available in this area.',                 cta: 'View Fishing'   },
        webcams: { label: 'Live Webcams',     title: 'Live Cameras',          desc: 'See current beach conditions in real time before you go.',                    cta: 'View Webcams'   },
        regions: {
          'Algarve':          { label: 'Algarve Beaches',       title: 'More Beaches in the Algarve',   desc: 'From Sagres to Meia Praia — discover the best beaches in the Algarve.',       cta: 'View Algarve'   },
          'Norte':            { label: 'Northern Beaches',      title: 'Explore Northern Portugal',     desc: 'Wild Atlantic beaches and estuaries in northern Portugal.',                    cta: 'Explore North'  },
          'Centro':           { label: 'Central Beaches',       title: 'Explore Central Portugal',      desc: 'Pine forest coast, lagoons and fine sand in central Portugal.',                cta: 'View Centre'    },
          'Madeira':          { label: 'Madeira Beaches',       title: 'Explore Madeira',               desc: 'Volcanic beaches and natural pools on the island of Madeira.',                 cta: 'View Madeira'   },
          'Alentejo':         { label: 'Alentejo Coast',        title: 'Alentejo Beaches',              desc: 'Wild and windswept coast with deserted beaches along the Alentejo coastline.', cta: 'View Alentejo'  },
          'Lisboa e Setúbal': { label: 'Beaches near Lisbon',   title: 'Lisbon & Setúbal',              desc: 'From Cascais to Setúbal — the best beaches near the capital.',                 cta: 'View Lisbon'    },
          default:            { label: 'Regional Beaches',      title: 'Explore the Area',             desc: 'Discover other nearby beaches with similar characteristics.',                   cta: 'View Region'    },
        },
      },

      planearFinal: {
        eyebrow:       'Recommended next step',
        titleTemplate: function (name) { return 'Plan your visit\nto ' + name; },
        descTemplate:  function (name, region) { return 'Most visitors to ' + name + ' stay in ' + (region || 'Portugal') + ' — a good base for being close to the beach. Combine tides, accommodation and activities before the best places fill up.'; },
        createPlan:    'Create Visit Plan',
        regionBeaches: 'Beaches in the Region',
        surfForecast:  'Surf Forecast',
        saveBeach:     'Save Beach',
        trust:         'Free · No registration required · No commitment · Updated daily',
        stayLabels: {
          'Algarve':          'Where to Stay in the Algarve',
          'Lisboa e Setúbal': 'Where to Stay in Lisbon & Setúbal',
          'Norte':            'Where to Stay in Northern Portugal',
          'Alentejo':         'Where to Stay on the Alentejo Coast',
          'Madeira':          'Where to Stay in Madeira',
          'Centro':           'Where to Stay in Central Portugal',
          'Oeste':            'Where to Stay in West Portugal',  // TRANSLATION_REVIEW: Oeste = West
          default:            'Find Nearby Accommodation',
        },
      },

      partners: {
        eyebrow:        'Local Partners',
        title:          'Nearby Experiences & Services',
        noteTemplate:   function (region) { return 'Editorial suggestions for the ' + region + ' area — confirm availability directly with the operator.'; },
        viewAll:        'View all',
        b2bNote:        'Are you a local operator? Appear in this section and reach visitors already in the area.',
        b2bCta:         'Become a Partner',
        badges: {
          destaque:   'Featured',
          verificado: 'Verified',
          novo:       'New',
        },
      },

      alerts: {
        modalTitle:     'New alert',
        modalTitleFor:  function (name) { return 'New alert for ' + name; },
        conditionLabel: 'Condition',
        valueLabel:     'Value',
        conditions: {
          'wave_height|above': 'Waves above',
          'wave_height|below': 'Waves below',
          'wind_speed|above':  'Wind above',
          'wind_speed|below':  'Wind below',
          'temperature|above': 'Temperature above',
          'temperature|below': 'Temperature below',
        },
        saveBtnLabel:   'Save alert',
        cancelBtnLabel: 'Cancel',
        createBtn:      'Create Alert',
        proTooltip:     'Available on the Pro plan',
        savedToast:     'Alert created! You will receive an email when conditions are met.',
        deleteLabel:    'Delete alert',
        onboarding:     'Alert created. Manage all your alerts in <a href="/en/conta.html#alertas">My account</a>.',
      },

      descriptionFallback: {
        nameDefault: 'This beach',
        regionChar: {
          'Algarve':  'on the Algarve coast, in a region of golden cliffs, sheltered coves and warm water temperatures in summer',
          'Lisboa':   'on the Atlantic coast of the Lisbon region, between the Serra de Sintra hills and the natural bays of the Sado estuary',
          'Porto':    'on the northern coast of Portugal, with wide sandy beaches and the Atlantic swell typical of the Northwest',
          'Alentejo': 'on the Alentejo coast, part of one of the most preserved and least urbanised coastal stretches in Western Europe',
          'Madeira':  'on the island of Madeira, where volcanic mountains plunge directly into a deep-blue Atlantic',
          'Açores':   'in the Azores archipelago, in the middle of the North Atlantic, surrounded by marine biodiversity and unique volcanic landscape',
          default:    'on the Portuguese Atlantic coast',
        },
        openingTemplate: function (name, char) { return name + ' is located ' + char + '.'; },
        factWaterExcellent: 'Water quality is classified as <strong>Excellent</strong> — among the best in the region for swimming.',
        factWaterGood:      'Water quality is <strong>Good</strong>, suitable for swimming throughout the bathing season.',
        factWaterOther:     function (wq) { return 'Recorded water quality: <strong>' + wq + '</strong>.'; },
        factLifeguard:      'Patrolled by a lifeguard during the bathing season.',
        factRestaurant:     'Beach support or restaurant available nearby.',
        factParking:        'Parking available in the access area.',
        factDisabled:       'Accessible for people with reduced mobility.',
        regionClose: {
          'Algarve':  'A must-visit for anyone exploring southern Portugal.',
          'Lisboa':   'A weekend escape less than an hour from Lisbon.',
          'Porto':    'A surf and nature destination just minutes from Porto city centre.',
          'Alentejo': 'For those seeking unspoilt nature and a beach without the crowds.',
          'Madeira':  'A unique coastal experience, quite different from typical beach tourism.',
          'Açores':   'For travellers seeking the Atlantic in its most authentic and wild form.',
          default:    'A beach worth discovering along the Portuguese Atlantic coast.',
        },
      },

      metaDynamic: {
        beachIn:     function (name, region) { return name + ' — beach in ' + (region || 'Portugal') + '.'; },
        waterPrefix: 'Water',
        surfSpot:    'Surf spot.',
        lifeguarded: 'Lifeguarded beach.',
      },

      heroAlt: {
        withName:  function (name, region) { return (region || 'Portugal') + ' — ' + name + ' beach'; },
        generic:   'Beach in Portugal',
      },

      jsonLdDesc: function (name, region) { return 'Beach ' + name + ' in ' + (region || 'Portugal') + ', Portugal.'; },

    // ── Surf page i18n ─────────────────────────────────────────────────────────
    surf: {
      spotCount: function (n) { return '<strong>' + n + '</strong> spot' + (n !== 1 ? 's' : ''); },
      emptyTitle: 'No spots found',
      emptySub:   'Try other filters or explore all available regions.',
      emptyCta:   'View all spots',
      levelLabel: { iniciante: 'Beginner', intermedio: 'Intermediate', avancado: 'Advanced', profissional: 'Professional' },
      levelLabelComposite: {
        iniciante_intermedio: 'Beginner–Intermediate',
        intermedio_avancado:  'Intermediate–Advanced',
      },
      swellLabel:  'Swell',
      windLabel:   'Wind',
      seasonLabel: 'Best season',
      exploreRegion:     'Explore region',
      exploreRegionAria: function (r) { return 'Beaches in ' + r; },
      metaTitle:       'Surfing in Portugal — Spots, Waves & Guide · Portugal Travel Hub',
      metaDescription: 'The best surf spots in Portugal — Peniche, Nazaré, Algarve and Azores. Wave profile, recommended level and practical guide.',
      faqs: [
        {
          q: 'When is the best time to surf in Portugal?',
          a: 'October to April is the golden season — the North Atlantic generates consistent, powerful swells. Summer (June–September) is ideal for beginners: smaller waves, warmer water (19–22°C) and better conditions for surf lessons.'
        },
        {
          q: 'Which spot is best for beginners?',
          a: 'Costa da Caparica (Lisbon) and Praia do Amado (Algarve) are the two top choices. Both have certified surf schools, waves suitable for learning and good support infrastructure.'
        },
        {
          q: 'Do I need to know how to swim to learn surfing?',
          a: 'Yes — you must be able to swim comfortably before entering the sea with a board. Surf schools require basic swimming ability and carry out an initial assessment before lessons begin.'
        },
        {
          q: 'What basic equipment do I need?',
          a: 'A surfboard (available to rent at all schools), a wetsuit (essential from October to April, recommended in other months) and water-resistant sunscreen. Nothing else is needed to get started.'
        },
        {
          q: 'Can I surf in Portugal all year round?',
          a: 'Yes. Portugal has waves in every season. In summer conditions are gentler, ideal for beginners. In autumn and winter waves are larger and more consistent, ideal for intermediate and advanced surfers.'
        },
        {
          q: 'How much does a surf lesson cost in Portugal?',
          a: 'A 2-hour group lesson costs between €25 and €45 per person, depending on the school and region. Private lessons range from €60 to €100. Most schools include board and wetsuit in the price. In the Algarve and Lisbon prices tend to be slightly higher than on the Silver Coast.'
        },
        {
          q: 'Is surfing in Portugal dangerous for beginners?',
          a: 'At spots suitable for beginners, with a certified school and instructor, surfing is a safe activity. It is essential not to enter the sea alone without instruction — rip currents and submerged sandbars can surprise those unfamiliar with the spot. Learning with a certified school is strongly recommended.'
        }
      ],
    },

    // ── Fishing page i18n ──────────────────────────────────────────────────────
    fishing: {
      spotCount: function (n) { return '<strong>' + n + '</strong> spot' + (n !== 1 ? 's' : ''); },
      emptyTitle: 'No spots found',
      emptySub:   'Try other filters or explore all available types and regions.',
      emptyCta:   'View all spots',
      levelLabel: { iniciante: 'Beginner', intermedio: 'Intermediate', experiente: 'Experienced', profissional: 'Professional' },
      tipoLabel:  { rocha: 'Rocks', ria: 'Lagoon & Estuary', costeira: 'Coastal', embarcacao: 'Boat', fluvial: 'Freshwater' },
      seasonLabel:   'Best season',
      especiesLabel: 'Species',
      saveCta:       'Save',
      metaTitle:       'Fishing in Portugal — Spots, Species & Guide · Portugal Travel Hub',
      metaDescription: 'The best fishing spots in Portugal — from Sagres and Sesimbra to the Azores. Fishing type, target species, best season and practical guide.',
      faqs: [
        {
          q: 'Do I need a licence to fish in Portugal?',
          a: 'Yes. Recreational fishing in Portugal requires a licence issued by ICNF (Institute for Nature Conservation and Forests). The annual licence is affordable and can be obtained online on the ICNF portal or in tackle shops. Additional restrictions may apply in protected areas — always check before fishing.'
        },
        {
          q: 'What is the best season for fishing in Portugal?',
          a: 'It depends on the species and type of fishing. For bluefin tuna and billfish offshore: June to October. For shad and lamprey in rivers: March to June. For bass and bream on the coast: year-round with a peak in autumn and winter. Ria Formosa and Ria de Aveiro are productive throughout the year.'
        },
        {
          q: 'Can I fish without a boat in Portugal?',
          a: 'Yes. Shore fishing — on beaches (surfcasting), rocks and piers — requires no boat and is accessible all along the mainland coast. You only need the appropriate licence and the right gear. Jetties, breakwaters and groynes are also good access points without a boat.'
        },
        {
          q: 'What do I need to bring for a fishing trip?',
          a: 'For shore fishing: rod or lure rod, reel, line, hooks, bait (natural or artificial) and licence. For boat fishing: the operator usually provides equipment. We recommend a life jacket, sun protection, water and a snack. Always check the weather forecast before heading out.'
        },
        {
          q: 'Are there chartered boats for beginners in the Algarve?',
          a: 'Yes. Several operators in Portimão, Vilamoura and Lagos offer trips for beginners with equipment included and an experienced skipper on board — ideal for those wanting an offshore fishing experience without their own gear. Advance booking is recommended in summer.'
        },
        {
          q: 'How much does it cost to rent a fishing boat in Portugal?',
          a: 'A shared trip costs between €40 and €80 per person for a half-day. Exclusive charter varies between €200 and €600 per day depending on the vessel and location. The Azores has the highest prices due to the big game style of fishing. In the Algarve, Portimão and Vilamoura offer the best shared charter options for beginners.'
        },
        {
          q: 'What are the most common species for shore fishing in Portugal?',
          a: 'The most common species for shore fishing are: bass, sea bream, bream, pargo, red mullet and sole. For inshore boat fishing: horse mackerel, scabbardfish, conger eel and grouper. Offshore in the Azores and Madeira: bluefin tuna, wahoo, billfish and mahi-mahi. The time of year and type of seabed determine which species are available in each area.'
        }
      ],
    },

    // ── Webcams page i18n ──────────────────────────────────────────────────────
    webcams: {
      stateLabel: { live: 'Available', pending: 'Integrating', soon: 'Coming Soon' },
      searchPlaceholder: 'Beach or location…',
      filterLabel: 'Filter:',
      allRegions: 'All Regions',
      allTypes: 'All types',
      condUnavail: 'Conditions unavailable',
      emptyTitle: 'No webcams found',
      emptySub: 'Try other filters or search another location.',
      emptyReset: 'View all webcams',
      countTemplate: function (n) { return '<strong>' + n + '</strong> webcam' + (n !== 1 ? 's' : ''); },
      actionLive: 'Watch Live',
      actionBeaches: 'Discover Beaches',
      actionExplore: { surf: 'View Surf', pesca: 'View Fishing', default: 'View Beaches' },
      actionPlan: 'Plan in this Area',
    },

    // ── Guides hub page i18n ───────────────────────────────────────────────────
    guias: {
      badgeNew: 'NEW',
      readTimeUnit: 'min read',
      readCta: 'Read guide',
      proTitle: 'Exclusive Pro content',
      proDesc: 'Each guide has a free section and exclusive content for Pro members — detailed lists, maps, condition alerts and seasonal updates.',
      proCta: 'View plans — €4.99/mo',
      ctaPlan: 'Plan a trip',
      ctaBeaches: 'Explore beaches',
      breadcrumbCurrent: 'Guides',
      heroUpdated: 'Updated April 2026',
      heroGuideCount: '10+ guides',
    },
  },
  }; // end I18N_STRINGS

  // ── detectLang ─────────────────────────────────────────────────────────────
  function detectLang() {
    if (typeof document !== 'undefined') {
      if (document.documentElement.lang === 'en') return 'en';
    }
    try {
      if (localStorage.getItem('pth_lang') === 'en') return 'en';
    } catch (_) {}
    if (typeof window !== 'undefined' && window.location && window.location.pathname.startsWith('/en/')) return 'en';
    return 'pt';
  }

  // ── getT ───────────────────────────────────────────────────────────────────
  function getT() {
    return I18N_STRINGS[detectLang()];
  }

  // ── buildDescriptionFallbackText ───────────────────────────────────────────
  function buildDescriptionFallbackText(beach, T) {
    var fb  = T.descriptionFallback;
    var name = beach.name || fb.nameDefault;
    var wq   = beach.water_quality || '';
    var fac  = Array.isArray(beach.facilities) ? beach.facilities : [];
    var regionKey = beach.region || '';

    // Match region key loosely (DB stores 'Lisboa e Setúbal', fallback keys use 'Lisboa'/'Porto')
    var charKey = regionKey;
    if (!fb.regionChar[charKey]) {
      if (regionKey.toLowerCase().includes('lisboa')) charKey = 'Lisboa';
      else if (regionKey.toLowerCase().includes('norte') || regionKey.toLowerCase().includes('porto')) charKey = 'Porto';
    }
    var char    = fb.regionChar[charKey] || fb.regionChar['default'];
    var opening = fb.openingTemplate(name, char);

    var facts = [];
    if (wq === 'Excelente') facts.push(fb.factWaterExcellent);
    else if (wq === 'Boa')  facts.push(fb.factWaterGood);
    else if (wq)            facts.push(fb.factWaterOther(wq));
    if (fac.includes('lifeguard'))  facts.push(fb.factLifeguard);
    if (fac.includes('restaurant')) facts.push(fb.factRestaurant);
    if (fac.includes('parking'))    facts.push(fb.factParking);
    if (fac.includes('disabled'))   facts.push(fb.factDisabled);

    var closeKey = regionKey;
    if (!fb.regionClose[closeKey]) {
      if (regionKey.toLowerCase().includes('lisboa')) closeKey = 'Lisboa';
      else if (regionKey.toLowerCase().includes('norte') || regionKey.toLowerCase().includes('porto')) closeKey = 'Porto';
    }
    var close = fb.regionClose[closeKey] || fb.regionClose['default'];

    return [opening].concat(facts).concat([close]).join(' ');
  }

  // ── renderBeach ────────────────────────────────────────────────────────────
  // Returns plain-data object; does NOT touch the DOM.
  function renderBeach(beach) {
    var lang = detectLang();
    var T    = getT();

    // Description — defensive chain: i18n[lang] → legacy description → fallback template
    var description  = '';
    var fallbackUsed = false;
    var i18n = beach.i18n || {};
    if (i18n.description && i18n.description[lang]) {
      description = i18n.description[lang];
    } else if (beach.description) {
      description = beach.description;
    } else {
      description  = buildDescriptionFallbackText(beach, T);
      fallbackUsed = true;
    }

    // Water quality label — i18n override → T map → raw DB value
    var wqRaw = beach.water_quality || '';
    var waterQualityLabel = '';
    if (i18n.water_quality && i18n.water_quality[lang]) {
      waterQualityLabel = i18n.water_quality[lang];
    } else {
      waterQualityLabel = T.waterQuality[wqRaw] || wqRaw;
    }

    // Facilities labels array
    var facilities = Array.isArray(beach.facilities) ? beach.facilities : [];
    var facilitiesLabels = facilities.map(function (f) {
      return T.facilities[f] || f;
    });

    // Vibes array [{label, cls}]
    var vibes = _buildVibeData(beach, T);

    return { description: description, waterQualityLabel: waterQualityLabel, facilitiesLabels: facilitiesLabels, vibes: vibes, fallbackUsed: fallbackUsed };
  }

  // ── _buildVibeData (internal) ──────────────────────────────────────────────
  function _buildVibeData(beach, T) {
    var V   = T.vibes;
    var tags = [];
    var reg  = (beach.region || '').toLowerCase();
    if (beach.is_surf_spot)                             tags.push(V.surfSpot);
    if (beach.water_quality === 'Excelente')            tags.push(V.waterExcellent);
    if (beach.water_quality === 'Boa')                  tags.push(V.waterGood);
    if (beach.facilities && beach.facilities.includes('lifeguard'))   tags.push(V.lifeguarded);
    if (beach.facilities && beach.facilities.includes('restaurant'))  tags.push(V.beachSupport);
    if (beach.facilities && beach.facilities.includes('disabled'))    tags.push(V.accessible);
    if (reg.includes('alentejo'))                       tags.push(V.wild);
    else if (reg.includes('algarve'))                   tags.push(V.family);
    else if (reg.includes('madeira') || reg.includes('açores') || reg.includes('acores')) tags.push(V.uniqueNature);
    else if (reg.includes('norte') || reg.includes('centro') || reg.includes('porto'))         tags.push(V.atlanticCoast);
    else if (reg.includes('lisboa'))                    tags.push(V.riviera);
    else                                                tags.push(V.default);
    return tags;
  }

  // ── buildFacilitiesHtml ────────────────────────────────────────────────────
  var FACILITY_ICONS = {
    parking:    '<path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="16" r="1"/><circle cx="20" cy="16" r="1"/>',
    wc:         '<path d="M6 2v6m0 0a2 2 0 100 4 2 2 0 000-4m12-6v6m0 0a2 2 0 100 4 2 2 0 000-4m-6-6v16"/>',
    restaurant: '<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
    lifeguard:  '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>',
    disabled:   '<circle cx="12" cy="5" r="2"/><path d="M12 7v8m-4 4h8M8 10l-2 5m12-5l2 5"/>',
    showers:    '<path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M8 22a4 4 0 018 0"/>',
    bar:        '<path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>',
    blueflag:   '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
    equipment:  '<circle cx="12" cy="12" r="10"/>',
  };

  function buildFacilitiesHtml(facilities, T) {
    if (!facilities || !facilities.length) return '';
    return facilities.map(function (f) {
      var label = (T && T.facilities[f]) || f;
      var icon  = FACILITY_ICONS[f] || '<circle cx="12" cy="12" r="10"/>';
      return '<div class="facility-tag"><svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + icon + '</svg>' + label + '</div>';
    }).join('');
  }

  // ── buildVibesHtml ─────────────────────────────────────────────────────────
  function buildVibesHtml(beach, T) {
    var vibes = _buildVibeData(beach, T || getT());
    return vibes.map(function (v) {
      return '<span class="vibe-tag ' + v.cls + '">' + v.label + '</span>';
    }).join('');
  }

  // ── updateMetaTags ─────────────────────────────────────────────────────────
  function updateMetaTags(beach, T) {
    if (typeof document === 'undefined') return;
    T = T || getT();
    var lang     = detectLang();
    var i18n     = beach.i18n || {};
    var wqRaw    = beach.water_quality || '';
    var wqLabel  = (i18n.water_quality && i18n.water_quality[lang]) || T.waterQuality[wqRaw] || wqRaw;

    // Build description
    var desc;
    if (i18n.description && i18n.description[lang]) {
      desc = i18n.description[lang];
    } else if (beach.description) {
      desc = beach.description;
    } else {
      var parts = [T.metaDynamic.beachIn(beach.name, beach.region)];
      if (wqLabel) parts.push(T.metaDynamic.waterPrefix + ' ' + wqLabel + '.');
      if (beach.is_surf_spot) parts.push(T.metaDynamic.surfSpot);
      var fac = Array.isArray(beach.facilities) ? beach.facilities : [];
      if (fac.includes('lifeguard')) parts.push(T.metaDynamic.lifeguarded);
      desc = parts.join(' ');
    }

    function _set(id, prop, val) {
      var el = document.getElementById(id);
      if (el) el[prop] = val;
    }
    function _setMeta(selector, val) {
      var el = document.querySelector(selector);
      if (el) el.content = val;
    }

    _set('page-desc',    'content', desc);
    _set('page-og-desc', 'content', desc);
    _set('page-tw-desc', 'content', desc);
    _setMeta('meta[name="description"]',      desc);
    _setMeta('meta[property="og:description"]', desc);
    _setMeta('meta[name="twitter:description"]', desc);
  }

  // ── buildJsonLd ────────────────────────────────────────────────────────────
  function buildJsonLd(beach, T) {
    if (typeof document === 'undefined') return;
    T = T || getT();
    var lang    = detectLang();
    var i18n    = beach.i18n || {};
    var rawDesc = (i18n.description && i18n.description[lang]) || beach.description || T.jsonLdDesc(beach.name, beach.region);
    var baseUrl = lang === 'en'
      ? 'https://portalturismoportugal.com/en/beach.html?id='
      : 'https://portalturismoportugal.com/beach.html?id=';
    var url = baseUrl + (beach.id || '');

    var ld = {
      '@context': 'https://schema.org',
      '@type':    'TouristAttraction',
      name:        beach.name,
      description: rawDesc,
      url:         url,
      image:       beach.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      touristType: 'Beach',
      address: { '@type': 'PostalAddress', addressCountry: 'PT', addressRegion: beach.region || 'Portugal' },
    };
    if (beach.latitude && beach.longitude) {
      ld.geo = { '@type': 'GeoCoordinates', latitude: beach.latitude, longitude: beach.longitude };
    }

    var s = document.getElementById('ld-beach');
    if (s) s.textContent = JSON.stringify(ld);

    // Breadcrumb JSON-LD
    var bc = document.getElementById('ld-breadcrumb');
    if (bc) {
      var beachesUrl = lang === 'en'
        ? 'https://portalturismoportugal.com/en/beaches.html'
        : 'https://portalturismoportugal.com/beaches.html';
      var homeUrl = 'https://portalturismoportugal.com/';
      bc.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type':    'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: T.breadcrumb.home,    item: homeUrl    },
          { '@type': 'ListItem', position: 2, name: T.breadcrumb.beaches, item: beachesUrl },
          { '@type': 'ListItem', position: 3, name: beach.name,           item: url        },
        ],
      });
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  window.BeachRenderer = {
    I18N_STRINGS:       I18N_STRINGS,
    detectLang:         detectLang,
    getT:               getT,
    renderBeach:        renderBeach,
    buildFacilitiesHtml: buildFacilitiesHtml,
    buildVibesHtml:     buildVibesHtml,
    updateMetaTags:     updateMetaTags,
    buildJsonLd:        buildJsonLd,
  };

})(window);
