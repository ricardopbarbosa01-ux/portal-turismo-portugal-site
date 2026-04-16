"""
Body content PT translations for all root pages.
Run after pt_translate_root.py.
"""
import os
import re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── index.html translations ────────────────────────────────────────────
INDEX_SUBS = [
    # Hero
    ('<span class="hero__line1">Portugal</span>',
     '<span class="hero__line1">Portugal</span>'),
    ('<span class="hero__line2">through the <i>Ocean</i></span>',
     '<span class="hero__line2">através do <i>Oceano</i></span>'),
    ('500+ beaches, 9 live webcams and curated trip planning for every region of Portugal\'s Atlantic coast.',
     '500+ praias, 9 webcams ao vivo e planeamento personalizado em cada região da costa Atlântica de Portugal.'),
    ('>Plan a Trip<', '>Planear Viagem<'),
    ('>Explore Beaches<', '>Explorar Praias<'),
    ('aria-label="See beach conditions"', 'aria-label="Ver condições das praias"'),
    ('>Based in:<', '>Presente em:<'),
    ('We blend science and nature<br>with an artistic touch.',
     'Unimos ciência e natureza<br>com um toque artístico.'),
    ('aria-label="Video of Portuguese beaches"', 'aria-label="Vídeo de praias portuguesas"'),
    # Intent
    ('>START HERE<', '>COMECE AQUI<'),
    ('What are you looking for today?', 'O que procura hoje?'),
    ('aria-label="Browse by intent"', 'aria-label="Navegar por intenção"'),
    ('aria-label="Explore beaches in Portugal"', 'aria-label="Explorar praias em Portugal"'),
    ('>Explore Beaches<', '>Explorar Praias<'),
    ('500+ curated beaches across 7 Atlantic regions', '500+ praias em 7 regiões do Atlântico'),
    ('aria-label="Check surf conditions"', 'aria-label="Ver condições de surf"'),
    ('>Surf Conditions<', '>Condições de Surf<'),
    ('Waves, swell, wind and recommended spots', 'Ondas, marulho, vento e spots recomendados'),
    ('aria-label="Check fishing conditions"', 'aria-label="Ver condições de pesca"'),
    ('>Fishing Spots<', '>Spots de Pesca<'),
    ('Tides, moon phase, water temperature and best spots', 'Marés, fase lunar, temperatura da água e melhores spots'),
    ('aria-label="Watch live beach webcams"', 'aria-label="Ver webcams de praia ao vivo"'),
    ('>Live Webcams<', '>Webcams ao Vivo<'),
    ('9 live cameras along Portugal\'s Atlantic coast', '9 câmaras ao vivo ao longo da costa Atlântica de Portugal'),
    ('aria-label="Plan a beach getaway"', 'aria-label="Planear uma escapada à praia"'),
    ('>Plan a Trip<', '>Planear Viagem<'),
    ('Free custom plan — no sign-up required', 'Plano personalizado gratuito — sem registo obrigatório'),
    # Conditions
    ('>LIVE DATA<', '>DADOS EM TEMPO REAL<'),
    ('Conditions updated<br>every minute', 'Condições atualizadas<br>a cada minuto'),
    ('Water temperature, sea state, beach flag, wind and UV index — available on every beach page.',
     'Temperatura da água, estado do mar, bandeira de praia, vento e índice UV — disponível em cada página de praia.'),
    ('aria-label="Sea state — view beaches"', 'aria-label="Estado do mar — ver praias"'),
    ('>Sea State<', '>Estado do Mar<'),
    ('>View per beach →<', '>Ver por praia →<'),
    ('aria-label="Water temperature — view beaches"', 'aria-label="Temperatura da água — ver praias"'),
    ('>Water Temperature<', '>Temperatura da Água<'),
    ('aria-label="Beach flag — view beaches"', 'aria-label="Bandeira de praia — ver praias"'),
    ('>Beach Flag<', '>Bandeira de Praia<'),
    ('aria-label="Wind and swell — view surf spots"', 'aria-label="Vento e marulho — ver spots de surf"'),
    ('>Wind &amp; Swell<', '>Vento e Marulho<'),
    ('>View surf spots →<', '>Ver spots de surf →<'),
    ('aria-label="UV Index — view beaches"', 'aria-label="Índice UV — ver praias"'),
    ('>UV Index<', '>Índice UV<'),
    # Webcams
    ('>LIVE FROM THE COAST<', '>AO VIVO DA COSTA<'),
    ('9 live webcams<br>from the Atlantic', '9 webcams ao vivo<br>do Atlântico'),
    ('Powered by Beachcam — Portugal\'s most reliable coastal cameras, so you know before you go.',
     'Tecnologia Beachcam — as câmaras costeiras mais fiáveis de Portugal, para saber antes de partir.'),
    ('>Watch All 9 Live Webcams<', '>Ver Todas as 9 Webcams ao Vivo<'),
    ('aria-label="View all webcams"', 'aria-label="Ver todas as webcams"'),
    # Surf & Pesca
    ('>SURF &amp; FISHING<', '>SURF &amp; PESCA<'),
    ('Surf and Fishing with professional data', 'Surf e Pesca com dados profissionais'),
    ('Pro-grade tide, swell and wind data — the same level as specialist platforms, completely free.',
     'Dados de marés, marulho e vento de nível profissional — ao mesmo nível das plataformas especializadas, completamente gratuito.'),
    ('<p>Waves, swell, wind and full conditions for your next session.</p>',
     '<p>Ondas, marulho, vento e condições completas para a sua próxima sessão.</p>'),
    ('>View Surf Spots<', '>Ver Spots de Surf<'),
    ('<p>Tides, moon phase, water temperature and the right moment to fish.</p>',
     '<p>Marés, fase lunar, temperatura da água e o momento certo para pescar.</p>'),
    ('>View Fishing Spots<', '>Ver Spots de Pesca<'),
    # Featured beaches
    ('>EDITORIAL PICKS<', '>SELEÇÃO EDITORIAL<'),
    ('>Featured beaches<', '>Praias em Destaque<'),
    ('Hand-picked based on water quality, access, safety flags and seasonal conditions.',
     'Selecionadas pela qualidade da água, acessibilidade, bandeiras de segurança e condições sazonais.'),
    ('aria-label="Featured beaches"', 'aria-label="Praias em destaque"'),
    ('>View All Beaches<', '>Ver Todas as Praias<'),
    # Planear CTA
    ('>PERSONALISED PLANNING<', '>PLANEAMENTO PERSONALIZADO<'),
    ('Your perfect coastal trip<br>starts here', 'A sua viagem costeira perfeita<br>começa aqui'),
    ('Match the right beach with the best conditions for your dates — a full custom plan in minutes, no sign-up needed.',
     'A praia certa com as melhores condições para as suas datas — um plano personalizado completo em minutos, sem registo obrigatório.'),
    ('aria-label="What you can plan"', 'aria-label="O que pode planear"'),
    ('>The right beach for you<', '>A praia certa para si<'),
    ('>Best conditions by date<', '>Melhores condições por data<'),
    ('>Surf and fishing in one spot<', '>Surf e pesca no mesmo lugar<'),
    ('>Personalised recommendations<', '>Recomendações personalizadas<'),
    ('>Build My Plan<', '>Criar o Meu Plano<'),
    # Monetização
    ('>COMPLETE YOUR TRIP<', '>COMPLETE A SUA VIAGEM<'),
    ('>Hotels, activities and gear<', '>Hotéis, atividades e equipamento<'),
    ('aria-label="Find coastal hotels on Booking.com"', 'aria-label="Encontrar hotéis costeiros no Booking.com"'),
    ('>Coastal hotels<', '>Hotéis costeiros<'),
    ('Beachside accommodation across all regions of Portugal.', 'Alojamento à beira-mar em todas as regiões de Portugal.'),
    ('>Browse Hotels', '>Ver Hotéis'),
    ('aria-label="Find activities and tours in Portugal on GetYourGuide"',
     'aria-label="Encontrar atividades e tours em Portugal no GetYourGuide"'),
    ('>Coastal experiences<', '>Experiências costeiras<'),
    ('Surf lessons, diving, kayaking and guided tours along the coast.',
     'Aulas de surf, mergulho, kayak e tours guiados ao longo da costa.'),
    ('>Browse Experiences', '>Ver Experiências'),
    ('aria-label="Find surf and beach gear on Amazon"', 'aria-label="Encontrar equipamento de surf e praia na Amazon"'),
    ('>Beach and surf gear<', '>Equipamento de praia e surf<'),
    ('Boards, wetsuits and accessories delivered to your door.', 'Pranchas, fatos de neoprene e acessórios entregues em casa.'),
    ('>Browse Gear', '>Ver Equipamento'),
    # B2B strip
    ('>Do you run a tourism business in Portugal?<',
     '>Tem um negócio de turismo em Portugal?<'),
    ('Reach travellers actively planning coastal trips — exactly when they decide.',
     'Chegue aos viajantes que estão a planear viagens costeiras — no momento em que decidem.'),
    ('>Partner Plans<', '>Planos de Parceiro<'),
    # Preloader
    ('>500+ Praias<', '>500+ Praias<'),  # already done
    # Footer nav labels (already in root script but in case missed)
    ('<h5>Destinations</h5>', '<h5>Destinos</h5>'),
    ('<h5>Portal</h5>', '<h5>Portal</h5>'),
    ('<h5>Partners &amp; Ajuda</h5>', '<h5>Parceiros &amp; Ajuda</h5>'),
    # section aria-labels
    ('aria-label="Portugal\'s beach portal"', 'aria-label="O portal de praias de Portugal"'),
    ('aria-label="Browse Experiences"', 'aria-label="Ver Experiências"'),
    ('aria-label="Footer"', 'aria-label="Rodapé"'),
]

# ── planear.html translations ──────────────────────────────────────────
PLANEAR_SUBS = [
    # Meta already done
    # Hero
    ('>Personalised recommendations<', '>Recomendações personalizadas<'),
    ('Your next escape,<br><em>planned in detail.</em>',
     'A sua próxima escapada,<br><em>planeada ao detalhe.</em>'),
    ('Tell us what you\'re looking for — beaches, surf, fishing, itineraries or experiences — and receive personalised suggestions based on real data from the entire Portuguese coastline.',
     'Diga-nos o que procura — praias, surf, pesca, itinerários ou experiências — e receba sugestões personalizadas com base em dados reais de toda a costa portuguesa.'),
    ('>200+ beaches<', '>200+ praias<'),
    ('>Live conditions<', '>Condições em tempo real<'),
    ('>North to South<', '>Norte a Sul<'),
    ('>Reply within 48h<', '>Resposta em 48h<'),
    # What section
    ('>What you can plan<', '>O que pode planear<'),
    ('Everything the Portuguese coast has to offer.',
     'Tudo o que a costa portuguesa tem para oferecer.'),
    ('>Beaches<', '>Praias<'),
    ('200+ beaches catalogued by profile, conditions and accessibility.',
     '200+ praias catalogadas por perfil, condições e acessibilidade.'),
    ('>Browse beaches<', '>Ver praias<'),
    ('>Full Itineraries<', '>Itinerários Completos<'),
    ('Day-by-day itineraries combining beaches, meals and activities.',
     'Itinerários dia a dia que combinam praias, refeições e atividades.'),
    ('>Request an itinerary<', '>Pedir um itinerário<'),
    ('>Surf<', '>Surf<'),
    ('Best spots by level, ideal conditions and season by region.',
     'Melhores spots por nível, condições ideais e época por região.'),
    ('>Explore surf<', '>Explorar surf<'),
    ('>Fishing<', '>Pesca<'),
    ('Species, technique, location and ideal season by fishing type.',
     'Espécies, técnica, localização e época ideal por tipo de pesca.'),
    ('>Explore fishing<', '>Explorar pesca<'),
    ('>Accommodation<', '>Alojamento<'),
    ('Hotels and stays by the sea, filtered by area and budget.',
     'Hotéis e estadias à beira-mar, filtrados por zona e orçamento.'),
    ('>Get a suggestion<', '>Obter sugestão<'),
    ('>Restaurants<', '>Restaurantes<'),
    ('Sea-view tables and local dishes — by region, specialty and style.',
     'Mesas com vista mar e pratos regionais — por região, especialidade e estilo.'),
    ('>Experiences<', '>Experiências<'),
    ('Diving, kayaking, windsurfing, boat trips and much more.',
     'Mergulho, kayak, windsurf, passeios de barco e muito mais.'),
    ('>Request an experience<', '>Pedir uma experiência<'),
    ('>Live Webcams<', '>Webcams ao Vivo<'),
    ('Check real-time conditions before you leave home.',
     'Veja as condições em tempo real antes de sair de casa.'),
    ('>Watch webcams<', '>Ver webcams<'),
    ('>Build My Plan<', '>Criar o Meu Plano<'),
    # Form
    ('aria-label="Planning form"', 'aria-label="Formulário de planeamento"'),
    ('>Personalised suggestion request<', '>Pedido de sugestão personalizada<'),
    ('>Tell us about your ideal trip<', '>Conte-nos sobre a sua viagem ideal<'),
    ('Fill in the fields below — takes under 2 minutes. Your profile is saved so you can receive personalised suggestions by email.',
     'Preencha os campos abaixo — menos de 2 minutos. O seu perfil é guardado para receber sugestões personalizadas por e-mail.'),
    # Form fields
    ('>Name <', '>Nome <'),
    ('placeholder="Your name"', 'placeholder="O seu nome"'),
    ('>Please enter your name.<', '>Por favor introduza o seu nome.<'),
    ('placeholder="email@example.com"', 'placeholder="email@exemplo.com"'),
    ('>Please enter a valid email.<', '>Por favor introduza um e-mail válido.<'),
    ('>What do you want to do? <', '>O que quer fazer? <'),
    ('>Beach<', '>Praia<'),
    ('>Fishing<', '>Pesca<'),
    ('>Plan a Trip<', '>Planear Viagem<'),
    # Hero of planear
    ('aria-label="Plan your escape"', 'aria-label="Planear a sua escapada"'),
    # Nav active
    ('class="active" aria-current="page">Planear</a>', 'class="active" aria-current="page">Planear</a>'),
]

# ── precos.html translations ───────────────────────────────────────────
PRECOS_SUBS = [
    ('>Plans &amp; Pricing<', '>Planos &amp; Preços<'),
    ('The ocean on your screen.<br><em>Free for travellers. Premium for businesses.</em>',
     'O oceano no seu ecrã.<br><em>Grátis para viajantes. Premium para negócios.</em>'),
    ('Personal subscription with real-time alerts, HD webcams and 10-day forecasts — or premium commercial presence reaching those who decide where to spend the weekend.',
     'Subscrição pessoal com alertas em tempo real, webcams HD e previsões de 10 dias — ou presença comercial premium para quem decide onde passar o fim de semana.'),
    ('aria-label="Plans for travellers"', 'aria-label="Planos para viajantes"'),
    # Plan cards
    ('>Free<', '>Grátis<'),
    ('>Pro<', '>Pro<'),
    ('>per month<', '>por mês<'),
    ('>Everything you need to start<', '>Tudo o que precisa para começar<'),
    ('>For serious coastal travellers<', '>Para viajantes costeiros a sério<'),
    ('>Get Started<', '>Começar<'),
    ('>Start Free<', '>Começar Grátis<'),
    ('>Get Pro<', '>Obter Pro<'),
    ('>Upgrade to Pro<', '>Upgrade para Pro<'),
    # Plan features (common)
    ('>Real-time conditions<', '>Condições em tempo real<'),
    ('>Beach profiles<', '>Perfis de praia<'),
    ('>Interactive map<', '>Mapa interativo<'),
    ('>Basic surf and fishing data<', '>Dados básicos de surf e pesca<'),
    ('>Live webcams<', '>Webcams ao vivo<'),
    ('>3-day forecast<', '>Previsão de 3 dias<'),
    ('>Advanced 10-day forecast<', '>Previsão avançada de 10 dias<'),
    ('>Personalised alerts<', '>Alertas personalizados<'),
    ('>HD webcam access<', '>Acesso a webcams HD<'),
    ('>Priority planning service<', '>Serviço de planeamento prioritário<'),
    ('>Exclusive content<', '>Conteúdo exclusivo<'),
    ('>No ads<', '>Sem anúncios<'),
    # FAQ
    ('>Frequently asked questions<', '>Perguntas frequentes<'),
    ('>Can I cancel anytime?<', '>Posso cancelar a qualquer momento?<'),
    ('>Yes, cancel anytime with no fees or commitment.',
     '>Sim, cancele a qualquer momento sem taxas nem compromisso.'),
    # B2B section
    ('aria-label="Business plans"', 'aria-label="Planos para empresas"'),
    ('>For Tourism Businesses<', '>Para Empresas de Turismo<'),
    ('>Partner visibility on Portugal\'s most active beach portal.<',
     '>Visibilidade de parceiro no portal de praias mais ativo de Portugal.<'),
    ('>View Partner Plans<', '>Ver Planos de Parceiro<'),
    ('>Request a Quote<', '>Pedir Proposta<'),
    # Section tags
    ('>B2C PLANS<', '>PLANOS PESSOAIS<'),
    ('>B2B PLANS<', '>PLANOS PARA EMPRESAS<'),
    ('>COMPARISON<', '>COMPARAÇÃO<'),
    ('>FAQ<', '>FAQ<'),
    # aria-label page hero
    ('aria-label="Plans and pricing"', 'aria-label="Planos e preços"'),
]

# ── parceiros.html translations ────────────────────────────────────────
PARCEIROS_SUBS = [
    # Hero badge
    ('>Partner Programme<', '>Programa de Parceiros<'),
    ('Your business on Portugal\'s<br>leading beach<br><em>portal.</em>',
     'O seu negócio no principal<br>portal de praias<br><em>de Portugal.</em>'),
    ('Portugal Travel Hub is where travellers search for beaches, surf conditions, fishing and coastal experiences. Premium visibility, high-purchase-intent traffic and verified presence in front of those who decide where to go — all year round.',
     'O Portugal Travel Hub é onde os viajantes pesquisam praias, condições de surf, pesca e experiências costeiras. Visibilidade premium, tráfego com alta intenção de compra e presença verificada em frente a quem decide para onde ir — durante todo o ano.'),
    ('>Apply as a Partner<', '>Candidatar-se como Parceiro<'),
    # Stats
    ('>monthly visits<', '>visitas mensais<'),
    ('>avg. time on site<', '>tempo médio no site<'),
    ('>pages per session<', '>páginas por sessão<'),
    # Sections
    ('>Who should partner with us?<', '>Quem deve ser parceiro connosco?<'),
    ('>Partner formats<', '>Formatos de parceria<'),
    ('>What you get<', '>O que obtém<'),
    ('>Hotels &amp; Resorts<', '>Hotéis &amp; Resorts<'),
    ('>Surf Schools<', '>Escolas de Surf<'),
    ('>Restaurants<', '>Restaurantes<'),
    ('>Tour Operators<', '>Operadores de Turismo<'),
    ('>Boat Trips<', '>Passeios de Barco<'),
    ('>Rental Services<', '>Serviços de Aluguer<'),
    ('>Apply Now<', '>Candidatar Agora<'),
    ('>Request Information<', '>Pedir Informação<'),
    # Form
    ('>Partner Application<', '>Candidatura a Parceiro<'),
    ('>Business Name <', '>Nome do Negócio <'),
    ('>Contact Name <', '>Nome do Contacto <'),
    ('placeholder="Your full name"', 'placeholder="O seu nome completo"'),
    ('>Business type<', '>Tipo de negócio<'),
    ('>Website<', '>Website<'),
    ('>Message<', '>Mensagem<'),
    ('>Send Application<', '>Enviar Candidatura<'),
    ('>Submit<', '>Enviar<'),
    # aria
    ('aria-label="Partners — Portugal Travel Hub"', 'aria-label="Parceiros — Portugal Travel Hub"'),
    ('>Explore the Partnership<', '>Explorar a Parceria<'),
    ('>See Media Kit<', '>Ver Media Kit<'),
]

# ── media-kit.html translations ────────────────────────────────────────
MEDIA_KIT_SUBS = [
    ('>Media Kit<', '>Media Kit<'),
    ('>Download Media Kit<', '>Descarregar Media Kit<'),
    ('>Contact Editorial<', '>Contactar Editorial<'),
    ('>Request Partnership<', '>Pedir Parceria<'),
    # Audience section
    ('>Our audience<', '>O nosso público<'),
    ('>Who reads Portugal Travel Hub<', '>Quem lê o Portugal Travel Hub<'),
    ('>monthly active visitors<', '>visitantes mensais ativos<'),
    ('>of traffic from international visitors<', '>do tráfego de visitantes internacionais<'),
    ('>average session duration<', '>duração média da sessão<'),
    # Stats
    ('>Monthly Visits<', '>Visitas Mensais<'),
    ('>Avg. Session<', '>Sessão Média<'),
    ('>Pages / Session<', '>Páginas / Sessão<'),
    # Partnership formats
    ('>Partnership formats<', '>Formatos de parceria<'),
    ('>Spotlight<', '>Spotlight<'),
    ('>Banner<', '>Banner<'),
    ('>Editorial<', '>Editorial<'),
    # Brand section
    ('>Brand guidelines<', '>Guia de marca<'),
    ('>Logo<', '>Logótipo<'),
    ('>Colors<', '>Cores<'),
    ('>Typography<', '>Tipografia<'),
    # CTA
    ('>Talk to our team<', '>Fale com a nossa equipa<'),
    ('>Schedule a Call<', '>Marcar uma Chamada<'),
    ('>Get in Touch<', '>Entrar em Contacto<'),
    # aria
    ('aria-label="Media Kit hero"', 'aria-label="Hero do Media Kit"'),
]

# ── contact.html translations ──────────────────────────────────────────
CONTACT_SUBS = [
    # Hero
    ('>We\'re here to help<', '>Estamos aqui para ajudar<'),
    ('Talk to us.<br><em>Directly.</em>', 'Fale connosco.<br><em>Diretamente.</em>'),
    ('Travel planning, commercial partnerships, editorial support or any other enquiry — we route your request to the right team.',
     'Planeamento de viagens, parcerias comerciais, suporte editorial ou qualquer outra questão — encaminhamos o seu pedido para a equipa certa.'),
    ('>Reply within 24–48h<', '>Resposta em 24–48h<'),
    ('>Data protected<', '>Dados protegidos<'),
    ('>Portuguese team<', '>Equipa portuguesa<'),
    # Routing section
    ('>What are you looking for?<', '>O que está à procura?<'),
    ('We\'ll point you in the right direction.', 'Encaminhamo-lo na direção certa.'),
    ('>Plan a Trip<', '>Planear uma Viagem<'),
    ('Looking for personalised beach, surf or fishing recommendations, full itineraries or coastal experiences in Portugal? Our planning service is made for you.',
     'Procura recomendações personalizadas de praia, surf ou pesca, itinerários completos ou experiências costeiras em Portugal? O nosso serviço de planeamento é para si.'),
    ('>Build My Plan<', '>Criar o Meu Plano<'),
    ('>Commercial Partnership<', '>Parceria Comercial<'),
    ('Hotel, restaurant, surf school or tour operator? Explore visibility formats, lead generation and premium spotlight on the portal.',
     'Hotel, restaurante, escola de surf ou operador turístico? Explore formatos de visibilidade, geração de leads e destaque premium no portal.'),
    ('>Explore Partnership<', '>Explorar Parceria<'),
    ('>Support &amp; Editorial<', '>Suporte &amp; Editorial<'),
    ('Technical question, beach suggestion, content error, press enquiry or anything else — send us a message directly.',
     'Questão técnica, sugestão de praia, erro no conteúdo, questão de imprensa ou qualquer outra coisa — envie-nos uma mensagem diretamente.'),
    ('>Send a Message<', '>Enviar uma Mensagem<'),
    # Contact info
    ('>Direct contact<', '>Contacto direto<'),
    ('>How to get in touch<', '>Como entrar em contacto<'),
    ('For quick questions, send a message via the form. For partnerships or planning, use the shortcuts above — you\'ll reach the right team faster.',
     'Para questões rápidas, envie uma mensagem pelo formulário. Para parcerias ou planeamento, use os atalhos acima — chegará à equipa certa mais rapidamente.'),
    ('>Email<', '>E-mail<'),
    ('Reply within 24–48 business hours', 'Resposta em 24–48 horas úteis'),
    ('>Location<', '>Localização<'),
    ('>Portugal<', '>Portugal<'),
    ('100% Portuguese team', 'Equipa 100% portuguesa'),
    ('>Hours<', '>Horário<'),
    ('>Monday to Friday<', '>Segunda a Sexta<'),
    ('9am–6pm (Lisbon time)', '9h–18h (hora de Lisboa)'),
    # Guarantees
    ('>Our guarantees<', '>As nossas garantias<'),
    ('>We reply to every message<', '>Respondemos a todas as mensagens<'),
    ('>Data never shared with third parties<', '>Dados nunca partilhados com terceiros<'),
    ('>No spam or automated communications<', '>Sem spam nem comunicações automáticas<'),
    ('>Independent editorial, no hidden interests<', '>Editorial independente, sem interesses ocultos<'),
    # Form
    ('>Direct message<', '>Mensagem direta<'),
    ('>Send us a message<', '>Envie-nos uma mensagem<'),
    ('>Name <', '>Nome <'),
    ('placeholder="Your name"', 'placeholder="O seu nome"'),
    ('>Please enter your name.<', '>Por favor introduza o seu nome.<'),
    ('placeholder="your@email.com"', 'placeholder="o_seu@email.com"'),
    ('>Please enter a valid email address.<', '>Por favor introduza um e-mail válido.<'),
    ('>Subject <', '>Assunto <'),
    ('Select a subject…', 'Selecione um assunto…'),
    ('>Travel planning<', '>Planeamento de viagem<'),
    ('>Commercial partnership proposal<', '>Proposta de parceria comercial<'),
    ('>Beach or destination suggestion<', '>Sugestão de praia ou destino<'),
    ('>Report an error or incorrect information<', '>Reportar erro ou informação incorreta<'),
    ('>Press &amp; media<', '>Imprensa &amp; media<'),
    ('>Technical support / account<', '>Suporte técnico / conta<'),
    ('>Other subject<', '>Outro assunto<'),
    ('>Please select a subject.<', '>Por favor selecione um assunto.<'),
    # Routing hints
    ('For partnerships, the fastest route is the <a href="parceiros.html">Partners page</a> — it has a dedicated form, format details and priority response.',
     'Para parcerias, o caminho mais rápido é a <a href="parceiros.html">página de Parceiros</a> — tem formulário dedicado, detalhes de formato e resposta prioritária.'),
    ('For personalised planning, use our <a href="planear.html">Planning service</a> — more detailed, with suggestions sent by email.',
     'Para planeamento personalizado, use o nosso <a href="planear.html">serviço de Planeamento</a> — mais detalhado, com sugestões enviadas por e-mail.'),
    ('>Message <', '>Mensagem <'),
    ('Describe what you need or the question you have…', 'Descreva o que precisa ou a questão que tem…'),
    ('>Please write your message.<', '>Por favor escreva a sua mensagem.<'),
    ('>Send Message<', '>Enviar Mensagem<'),
    ('By submitting, you accept our <a href="privacy.html">Privacy Policy</a>.',
     'Ao submeter, aceita a nossa <a href="privacy.html">Política de Privacidade</a>.'),
    # aria
    ('aria-label="Contact"', 'aria-label="Contacto"'),
    ('aria-label="How can we help"', 'aria-label="Como podemos ajudar"'),
    ('aria-label="Contact form"', 'aria-label="Formulário de contacto"'),
]

# ── login.html translations ────────────────────────────────────────────
LOGIN_SUBS = [
    # Visual panel
    ('Portugal Travel Hub', 'Portugal Travel Hub'),
    ('>Sign in to access Portugal\'s best beach portal<',
     '>Inicie sessão para aceder ao melhor portal de praias de Portugal<'),
    ('Personalised to your coastal interests', 'Personalizado para os seus interesses costeiros'),
    # Form
    ('>Sign In<', '>Iniciar Sessão<'),
    ('>Create Account<', '>Criar Conta<'),
    ('>Email<', '>E-mail<'),
    ('placeholder="your@email.com"', 'placeholder="o_seu@email.com"'),
    ('>Password<', '>Palavra-passe<'),
    ('placeholder="Your password"', 'placeholder="A sua palavra-passe"'),
    ('>Forgot password?<', '>Esqueceu a palavra-passe?<'),
    ('>Sign In<', '>Entrar<'),
    ('>Continue<', '>Continuar<'),
    # Register tab
    ('>Full Name<', '>Nome Completo<'),
    ('placeholder="Your full name"', 'placeholder="O seu nome completo"'),
    ('>Create password<', '>Criar palavra-passe<'),
    ('placeholder="Choose a strong password"', 'placeholder="Escolha uma palavra-passe forte"'),
    ('>Create Account<', '>Criar Conta<'),
    ('>Already have an account?<', '>Já tem conta?<'),
    ('>Sign in<', '>Iniciar sessão<'),
    ('>Don\'t have an account?<', '>Não tem conta?<'),
    ('>Create one<', '>Criar uma<'),
    # Trust items
    ('Real-time conditions', 'Condições em tempo real'),
    ('Personalised forecasts', 'Previsões personalizadas'),
    ('HD Webcams', 'Webcams HD'),
    ('Exclusive content', 'Conteúdo exclusivo'),
    # Footer
    ('© 2026 Portugal Travel Hub. All rights reserved.',
     '© 2026 Portugal Travel Hub. Todos os direitos reservados.'),
    ('>Privacy Policy<', '>Política de Privacidade<'),
    ('>Terms of Service<', '>Termos de Serviço<'),
    # Error messages
    ('Please enter a valid email.', 'Por favor introduza um e-mail válido.'),
    ('Password must be at least 8 characters.', 'A palavra-passe deve ter pelo menos 8 caracteres.'),
    ('Please enter your name.', 'Por favor introduza o seu nome.'),
    # Visibility toggle
    ('>Show password<', '>Mostrar palavra-passe<'),
    ('>Hide password<', '>Ocultar palavra-passe<'),
]


PAGE_SUBS = {
    "index.html":     INDEX_SUBS,
    "planear.html":   PLANEAR_SUBS,
    "precos.html":    PRECOS_SUBS,
    "parceiros.html": PARCEIROS_SUBS,
    "media-kit.html": MEDIA_KIT_SUBS,
    "contact.html":   CONTACT_SUBS,
    "login.html":     LOGIN_SUBS,
}

for fname, subs in PAGE_SUBS.items():
    path = os.path.join(BASE, fname)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    for old, new in subs:
        content = content.replace(old, new)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    print(f"  Body translated  {fname}")

print("Done — body translations complete.")
