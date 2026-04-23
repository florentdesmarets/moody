import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useLang } from '../context/LangContext'

// ─── Avatar du bot : logo de l'app ───────────────────────────────────────────
const BOT_AVATAR = '/icons/apple-touch-icon.png'

// ─── Mots-clés de crise (priorité absolue) ────────────────────────────────────
const CRISIS_KEYWORDS = {
  fr: [
    'mourir', 'mort', 'suicide', 'suicid', 'en finir', 'me tuer', 'me suicid',
    'plus envie de vivre', 'plus vivre', 'disparaître', 'disparaitre',
    'tout arrêter', 'plus la force', 'plus supporter', 'ne veux plus être là',
    'veux mourir', 'envie de mourir', 'je vais me', 'me faire du mal',
    'désespoir total', 'aucun espoir', 'sans issue',
  ],
  en: [
    'die', 'dying', 'suicide', 'kill myself', 'end it all', 'end my life',
    'no reason to live', 'not worth living', 'want to disappear',
    'give up on life', 'no hope', 'hopeless', 'hurt myself', 'self harm',
    'don\'t want to be here', 'can\'t go on', 'life is worthless',
  ],
}

function isCrisis(text, lang) {
  const lower = text.toLowerCase()
  const kws = CRISIS_KEYWORDS[lang] ?? CRISIS_KEYWORDS.fr
  return kws.some(w => lower.includes(w))
}

// ─── Fiches conseil par thème ─────────────────────────────────────────────────
const ADVICES = {
  fr: {
    stress: [
      { emoji: '🌬️', title: 'Respiration 4-7-8', body: 'Inspire 4 secondes · retiens 7 secondes · expire 8 secondes. Répète 4 fois. Calme le système nerveux en moins de 2 minutes.' },
      { emoji: '🎯', title: 'Ancrage 5-4-3-2-1', body: 'Nomme 5 choses que tu vois · 4 que tu entends · 3 que tu peux toucher · 2 que tu sens · 1 que tu goûtes. Ramène-toi dans le présent.' },
      { emoji: '📝', title: 'Vide tes pensées', body: 'Écris tout ce qui t\'inquiète, sans filtre et sans relire. Poser les pensées sur le papier les sort de ta tête et réduit leur emprise.' },
    ],
    sommeil: [
      { emoji: '🌙', title: 'Coupure digitale', body: 'Éteins les écrans 30 min avant de dormir. La lumière bleue bloque la mélatonine, l\'hormone du sommeil.' },
      { emoji: '🧘', title: 'Scan corporel', body: 'Allongé·e, ferme les yeux. Relâche chaque partie du corps des pieds jusqu\'à la tête. Reviens à la respiration si l\'esprit s\'emballe.' },
      { emoji: '🌡️', title: 'Chambre fraîche', body: 'La température idéale pour dormir est 16–19°C. Aère ta chambre 10 min avant d\'aller au lit, même en hiver.' },
    ],
    tristesse: [
      { emoji: '🫂', title: 'Autocompassion', body: 'Pose une main sur ton cœur : "C\'est difficile en ce moment, et c\'est normal." Parle-toi comme tu parlerais à un ami qui souffre.' },
      { emoji: '🚶', title: '10 minutes dehors', body: '10 min de marche en extérieur libèrent des endorphines, changent le décor mental et régulent les émotions. Pas besoin de sport intense.' },
      { emoji: '☀️', title: 'Lumière naturelle', body: '20 min de lumière du jour régulent la sérotonine et l\'horloge biologique. Ouvre les volets, mets-toi près d\'une fenêtre.' },
    ],
    colere: [
      { emoji: '💨', title: 'Expire d\'abord', body: 'L\'expiration lente (6 secondes) active le système parasympathique. Avant tout, expire. Le corps doit ralentir avant que tu puisses réfléchir clairement.' },
      { emoji: '🏃', title: 'Décharge physique', body: 'La colère est de l\'énergie bloquée. Monte des escaliers, saute sur place, secoue tes bras — ça aide vraiment à évacuer.' },
      { emoji: '⏱️', title: 'Règle des 10 minutes', body: 'Attends 10 min avant de répondre ou d\'agir. Ce que tu ressentiras alors te guidera bien mieux qu\'en ce moment.' },
    ],
    motivation: [
      { emoji: '🎯', title: 'Règle des 2 minutes', body: 'Si ça prend moins de 2 min, fais-le maintenant. Sinon, engage-toi juste 2 minutes — souvent l\'élan arrive et tu continues.' },
      { emoji: '🔋', title: 'Qu\'est-ce qui te recharge ?', body: 'Note 3 choses concrètes qui t\'apportent de l\'énergie. Planifie l\'une d\'elles aujourd\'hui, même 15 minutes.' },
      { emoji: '🌱', title: 'Un seul mini-objectif', body: 'Oublie la liste entière. Qu\'est-ce que tu peux faire dans les 5 prochaines minutes ? Juste ça.' },
    ],
    solitude: [
      { emoji: '📱', title: '"Je pensais à toi"', body: 'Envoie un message simple à quelqu\'un que tu apprécies. Pas besoin de grand discours. Ça peut changer une journée — la tienne et la leur.' },
      { emoji: '🌍', title: 'Trouver sa tribu', body: 'Des communautés existent pour tous les intérêts : Discord, Meetup, groupes locaux. Les connexions durables commencent souvent là.' },
      { emoji: '☕', title: 'Les tiers-lieux', body: 'Café, bibliothèque, coworking. La présence humaine — même sans interaction directe — réduit le sentiment de solitude.' },
    ],
    corps: [
      { emoji: '💧', title: 'Hydratation', body: 'La déshydratation amplifie fatigue, maux de tête et anxiété. Vise 1,5–2L d\'eau par jour. Un verre d\'eau frais peut déjà changer l\'état.' },
      { emoji: '🍽️', title: 'Repas réguliers', body: 'Les variations de glycémie affectent directement l\'humeur. Des repas à heures fixes aident à stabiliser ton état général.' },
      { emoji: '🛁', title: 'Bain ou douche chaude', body: 'La chaleur relâche les tensions musculaires et réduit le cortisol. 15 minutes suffisent à sentir la différence.' },
    ],
    default: [
      { emoji: '💙', title: 'Tu es au bon endroit', body: 'Chercher des ressources pour aller mieux est déjà un acte courageux. Décris-moi ce que tu ressens et je t\'orienterai.' },
      { emoji: '🌬️', title: 'Pause respiration', body: 'Inspire 4 secondes, expire 6 secondes. Répète 3 fois. Un bon point de départ pour presque tout.' },
      { emoji: '🤝', title: 'Parler à quelqu\'un', body: 'Si tu traverses une période difficile, un professionnel de santé mentale peut vraiment aider. Médecin, psychologue, psychiatre — ils sont là pour ça.' },
    ],
  },
  en: {
    stress: [
      { emoji: '🌬️', title: '4-7-8 Breathing', body: 'Inhale 4s · hold 7s · exhale 8s. Repeat 4 times. Calms the nervous system in under 2 minutes.' },
      { emoji: '🎯', title: '5-4-3-2-1 Grounding', body: 'Name 5 things you see · 4 you hear · 3 you can touch · 2 you smell · 1 you taste. Brings you back to the present moment.' },
      { emoji: '📝', title: 'Brain dump', body: 'Write everything worrying you, without filtering. Getting thoughts on paper takes them out of your head.' },
    ],
    sommeil: [
      { emoji: '🌙', title: 'Digital curfew', body: 'Turn off screens 30 min before bed. Blue light blocks melatonin, your sleep hormone.' },
      { emoji: '🧘', title: 'Body scan', body: 'Lying down, close your eyes. Release each body part from feet to head. Return to your breath if your mind wanders.' },
      { emoji: '🌡️', title: 'Cool room', body: 'Ideal sleep temp is 61–67°F (16–19°C). Air out your bedroom 10 min before bed, even in winter.' },
    ],
    tristesse: [
      { emoji: '🫂', title: 'Self-compassion', body: 'Place a hand on your heart: "This is hard right now, and that\'s okay." Talk to yourself like you\'d talk to a struggling friend.' },
      { emoji: '🚶', title: '10 minutes outside', body: '10 min of outdoor walking releases endorphins and shifts your mental scenery. No intense exercise needed.' },
      { emoji: '☀️', title: 'Natural light', body: '20 min of daylight regulates serotonin and your biological clock. Open the blinds, sit near a window.' },
    ],
    colere: [
      { emoji: '💨', title: 'Exhale first', body: 'A slow exhale (6 seconds) activates the parasympathetic system. Before anything else, exhale.' },
      { emoji: '🏃', title: 'Physical release', body: 'Anger is blocked energy. Climb stairs, jump in place, shake your arms — it genuinely helps.' },
      { emoji: '⏱️', title: '10-minute rule', body: 'Wait 10 min before responding or deciding. How you feel then will guide you far better.' },
    ],
    motivation: [
      { emoji: '🎯', title: '2-minute rule', body: 'If it takes less than 2 min, do it now. Otherwise, commit to just 2 minutes — often momentum kicks in.' },
      { emoji: '🔋', title: 'What recharges you?', body: 'List 3 concrete things that give you energy. Schedule one of them today, even just 15 minutes.' },
      { emoji: '🌱', title: 'One mini-goal', body: 'Forget the whole list. What can you do in the next 5 minutes? Just that.' },
    ],
    solitude: [
      { emoji: '📱', title: '"Thinking of you"', body: 'Send a simple message to someone you care about. It can change a day — yours and theirs.' },
      { emoji: '🌍', title: 'Find your tribe', body: 'Communities exist for every interest: Discord, Meetup, local groups. Lasting connections often start there.' },
      { emoji: '☕', title: 'Third places', body: 'Café, library, coworking space. Human presence — even without direct interaction — eases loneliness.' },
    ],
    corps: [
      { emoji: '💧', title: 'Hydration', body: 'Dehydration amplifies fatigue, headaches and anxiety. Aim for 1.5–2L of water daily.' },
      { emoji: '🍽️', title: 'Regular meals', body: 'Blood sugar swings directly affect mood. Regular meal times help stabilize your wellbeing.' },
      { emoji: '🛁', title: 'Warm shower or bath', body: 'Heat releases muscle tension and reduces cortisol. 15 minutes is enough to feel the difference.' },
    ],
    default: [
      { emoji: '💙', title: "You're in the right place", body: "Seeking resources to feel better is already courageous. Describe what you're going through — I'm here to help." },
      { emoji: '🌬️', title: 'Breathing break', body: 'Inhale 4 seconds, exhale 6 seconds. Repeat 3 times. A good starting point for almost everything.' },
      { emoji: '🤝', title: 'Talk to someone', body: "If you're going through a rough patch, a mental health professional can truly help — doctor, therapist or counselor." },
    ],
  },
}

// ─── Détection du thème ────────────────────────────────────────────────────────
const KEYWORDS = {
  fr: {
    stress:     ['stress', 'anxieux', 'anxieuse', 'angoiss', 'panique', 'peur', 'inquiet', 'tendu', 'tendue', 'débordé', 'pression'],
    sommeil:    ['dors', 'dormi', 'sommeil', 'insomni', 'nuit', 'réveill', 'fatigué', 'fatiguée', 'épuisé', 'épuisée', 'repose'],
    tristesse:  ['triste', 'tristesse', 'pleure', 'pleuré', 'déprim', 'vide', 'cafard', 'morale', 'down', 'chagrin'],
    colere:     ['énervé', 'énervée', 'colère', 'fâché', 'fâchée', 'frustré', 'rage', 'agacé', 'irrité'],
    motivation: ['motiv', 'démotiv', 'procrastin', 'flemme', 'paress', 'envie de rien', 'rien faire'],
    solitude:   ['seul', 'seule', 'solitude', 'isolé', 'isolée', 'personne', 'rejeté', 'incompris'],
    corps:      ['douleur', 'mal au', 'tête', 'ventre', 'dos', 'malade', 'physique', 'faim', 'corps'],
  },
  en: {
    stress:     ['stress', 'anxious', 'anxiety', 'panic', 'worry', 'worried', 'fear', 'scared', 'tense', 'overwhelm', 'pressure'],
    sommeil:    ['sleep', 'insomni', 'tired', 'exhaust', 'fatigue', 'night', 'awake', 'rest', 'nap'],
    tristesse:  ['sad', 'sadness', 'depress', 'cry', 'crying', 'empty', 'down', 'low', 'miserable', 'grief'],
    colere:     ['angry', 'anger', 'mad', 'frustrat', 'rage', 'irritat', 'annoyed', 'furious'],
    motivation: ['motiv', 'procrastin', 'lazy', 'unmotiv', 'no energy'],
    solitude:   ['alone', 'lonely', 'isolat', 'nobody', 'no one', 'reject', 'misunderstood'],
    corps:      ['pain', 'body', 'headache', 'stomach', 'back', 'sick', 'ill', 'physical', 'hungry'],
  },
}

function detectTopic(text, lang) {
  const lower = text.toLowerCase()
  const kws = KEYWORDS[lang] ?? KEYWORDS.fr
  for (const [topic, words] of Object.entries(kws)) {
    if (words.some(w => lower.includes(w))) return topic
  }
  return 'default'
}

// ─── Chips rapides ─────────────────────────────────────────────────────────────
const QUICK_CHIPS = {
  fr: ['Je suis stressé·e', 'J\'ai mal dormi', 'Je me sens triste', 'Je manque de motivation', 'Je me sens seul·e', 'J\'ai des douleurs'],
  en: ['I\'m feeling stressed', 'I slept badly', 'I feel sad', 'I lack motivation', 'I feel lonely', 'I have body pain'],
}

const INTRO = {
  fr: 'Bonjour 👋 Je suis là pour t\'accompagner. Dis-moi ce que tu ressens ou choisis un sujet ci-dessous — je te proposerai des fiches conseil adaptées.',
  en: 'Hello 👋 I\'m here to support you. Tell me how you\'re feeling or choose a topic below — I\'ll suggest personalized advice cards.',
}

const FOLLOW_UP = {
  fr: 'Est-ce que ces conseils t\'ont aidé ? Tu peux me parler d\'autre chose ou reformuler ce que tu ressens.',
  en: 'Did these tips help? You can tell me something else or describe what you\'re feeling in different words.',
}

const CRISIS_RESPONSE = {
  fr: 'Je t\'entends, et ce que tu traverses semble vraiment difficile. Tu n\'es pas seul·e. Le Mode crise est là pour t\'aider à trouver un soutien immédiat.',
  en: 'I hear you, and what you\'re going through sounds really hard. You are not alone. Crisis mode is here to help you find immediate support.',
}

// ─── Avatar du bot ─────────────────────────────────────────────────────────────
function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 overflow-hidden flex-shrink-0 mt-0.5">
      <img src={BOT_AVATAR} alt="Moody" className="w-full h-full object-cover" />
    </div>
  )
}

// ─── Composants de message ─────────────────────────────────────────────────────
function AdviceCard({ emoji, title, body }) {
  return (
    <div className="bg-white/20 rounded-2xl px-4 py-3 border border-white/25 mb-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[18px]">{emoji}</span>
        <p className="text-white font-bold text-[12px]">{title}</p>
      </div>
      <p className="text-white/80 text-[11px] leading-relaxed">{body}</p>
    </div>
  )
}

function CrisisCard({ lang, onCrisis }) {
  return (
    <div className="bg-white/15 rounded-2xl px-4 py-4 border border-white/30 mb-2">
      <p className="text-white font-bold text-[13px] mb-1">
        {lang === 'fr' ? '🆘 Mode crise disponible' : '🆘 Crisis mode available'}
      </p>
      <p className="text-white/80 text-[11px] leading-relaxed mb-3">
        {lang === 'fr'
          ? 'Des ressources d\'aide immédiate, numéros d\'urgence et un contact de confiance t\'y attendent.'
          : 'Immediate help resources, emergency numbers and a trusted contact are waiting for you there.'}
      </p>
      <button
        onClick={onCrisis}
        className="w-full py-2.5 rounded-xl bg-white text-[#FF7040] font-bold text-[13px] active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
        <span>🆘</span>
        {lang === 'fr' ? 'Accéder au Mode crise' : 'Go to Crisis mode'}
      </button>
    </div>
  )
}

function BotMessage({ text, cards, crisis, followUp, lang, onCrisis }) {
  return (
    <div className="flex gap-2 mb-3 items-start">
      <BotAvatar />
      <div className="flex-1 min-w-0">
        {text && (
          <p className="text-white/90 text-[12px] leading-relaxed mb-2 bg-white/15 rounded-2xl rounded-tl-sm px-3 py-2">
            {text}
          </p>
        )}
        {crisis && <CrisisCard lang={lang} onCrisis={onCrisis} />}
        {cards && cards.map((c, i) => <AdviceCard key={i} {...c} />)}
        {followUp && (
          <p className="text-white/65 text-[11px] leading-relaxed mt-1 bg-white/10 rounded-2xl rounded-tl-sm px-3 py-2">
            {followUp}
          </p>
        )}
      </div>
    </div>
  )
}

function UserMessage({ text }) {
  return (
    <div className="flex justify-end mb-3">
      <div className="bg-white/90 text-[#FF7040] font-semibold text-[12px] rounded-2xl rounded-tr-sm px-4 py-2 max-w-[78%]">
        {text}
      </div>
    </div>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function Conseil() {
  const { lang } = useLang()
  const navigate  = useNavigate()
  const [messages,  setMessages]  = useState([{ type: 'bot', text: INTRO[lang] ?? INTRO.fr }])
  const [input,     setInput]     = useState('')
  const [showChips, setShowChips] = useState(true)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage(text) {
    if (!text.trim()) return
    setShowChips(false)

    if (isCrisis(text, lang)) {
      setMessages(prev => [
        ...prev,
        { type: 'user', text },
        { type: 'bot', text: CRISIS_RESPONSE[lang] ?? CRISIS_RESPONSE.fr, crisis: true },
      ])
      setInput('')
      return
    }

    const topic      = detectTopic(text, lang)
    const adviceData = ADVICES[lang] ?? ADVICES.fr
    const cards      = adviceData[topic] ?? adviceData.default

    setMessages(prev => [
      ...prev,
      { type: 'user', text },
      { type: 'bot', cards, followUp: FOLLOW_UP[lang] ?? FOLLOW_UP.fr },
    ])
    setInput('')
  }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto flex flex-col flex-1 px-4 pt-12">
        <AppHeader />

        {/* Titre */}
        <div className="text-center mb-3 fade-in">
          <h1 className="text-white font-extrabold text-[18px]">
            {lang === 'fr' ? 'Besoin de parler ?' : 'Need to talk?'}
          </h1>
          <p className="text-white/55 text-[10px] mt-0.5">
            {lang === 'fr'
              ? 'Fiches conseil personnalisées · Basé sur ce que tu ressens'
              : 'Personalized advice cards · Based on how you feel'}
          </p>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-3">
          {messages.map((msg, i) => (
            msg.type === 'user'
              ? <UserMessage key={i} text={msg.text} />
              : <BotMessage
                  key={i}
                  text={msg.text}
                  cards={msg.cards}
                  crisis={msg.crisis}
                  followUp={i === messages.length - 1 ? msg.followUp : null}
                  lang={lang}
                  onCrisis={() => navigate('/crisis')}
                />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick chips (seulement au départ) */}
        {showChips && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(QUICK_CHIPS[lang] ?? QUICK_CHIPS.fr).map((chip, i) => (
              <button key={i} onClick={() => { sendMessage(chip); inputRef.current?.focus() }}
                className="text-[11px] font-semibold text-white/90 bg-white/18 border border-white/35 rounded-full px-3 py-1.5 transition-all active:scale-95">
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="pb-8 pt-1">
          <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2.5 border border-white/25">
            <input
              ref={inputRef}
              className="flex-1 bg-transparent text-[13px] text-white placeholder-white/45 outline-none border-none"
              placeholder={lang === 'fr' ? 'Dis-moi ce que tu ressens…' : 'Tell me how you feel…'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(input) }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="text-white/90 text-[18px] bg-transparent border-none cursor-pointer disabled:opacity-30 transition-opacity leading-none flex-shrink-0">
              ➤
            </button>
          </div>
          <p className="text-white/35 text-[9px] text-center mt-1.5">
            {lang === 'fr'
              ? 'Ne remplace pas un professionnel de santé · En cas d\'urgence : 3114'
              : 'Does not replace professional healthcare · Emergency: call 988'}
          </p>
        </div>
      </div>
    </div>
  )
}
