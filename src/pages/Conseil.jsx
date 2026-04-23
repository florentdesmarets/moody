import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'
import { getAvatar } from '../lib/badges'
import { useMoods } from '../hooks/useMoods'

// ─── Avatar du bot : logo de l'app ───────────────────────────────────────────
const BOT_AVATAR = '/icons/apple-touch-icon.png'

// ─── Mots-clés de crise (priorité absolue) ────────────────────────────────────
// Couvre le langage formel, familier et l'argot — les gens en détresse
// n'écrivent pas "je veux mourir", ils écrivent "j'en peux plus" ou "kms"
const CRISIS_KEYWORDS = {
  fr: [
    // ── Intentions directes ───────────────────────────────────────
    'suicid', 'me tuer', 'me suicider', 'me suicid',
    'mettre fin à', 'mettre fin à mes jours', 'en finir avec ma vie',
    'me pendre', 'me noyer', 'me jeter', 'me tailler',
    'me tirer une balle', 'overdose', 'avaler des cachets',

    // ── Formulations indirectes (très fréquentes) ─────────────────
    'veux mourir', 'envie de mourir', 'plus envie de vivre',
    'plus vivre', 'ne plus être là', 'ne plus exister',
    'disparaître pour toujours', 'partir pour toujours',
    'dormir pour toujours', 'pas me réveiller', 'ne plus me réveiller',
    'arrêter de souffrir', 'stopper la douleur', 'en finir',

    // ── Argot / langage familier ───────────────────────────────────
    'crever', 'je veux crever', 'veux crever', 'envie de crever',
    'je suis mort', 'suis mort de l\'intérieur',

    // ── Sentiment d\'être un fardeau (facteur de risque majeur) ────
    'fardeau', 'je suis un fardeau', 'jsuis un fardeau',
    'tout le monde serait mieux sans moi', 'vous seriez mieux sans moi',
    'mieux sans moi', 'personne ne me manquerait', 'personne s\'en foutrait',
    'personne s\'en fout de moi', 'je sers à rien', 'je ne sers à rien',
    'ma vie vaut rien', 'je vaux rien', 'je ne vaux rien',
    'ma vie sert à rien', 'vivre sert à rien', 'ça sert à quoi de vivre',
    'à quoi je sers', 'à quoi ça sert',

    // ── Épuisement extrême / abandon ──────────────────────────────
    'j\'en peux plus', 'j\'en peu plus', 'j\'en peux vraiment plus',
    'je peux plus continuer', 'j\'arrive plus', 'je tiens plus',
    'plus la force', 'pu la force', 'plus la force de rien',
    'lâcher prise sur tout', 'tout lâcher', 'tout plaquer',
    'plus envie de rien', 'pu envie de rien', 'plus envie de rien du tout',
    'plus supporter', 'je peux plus supporter',

    // ── Désespoir profond ──────────────────────────────────────────
    'sans espoir', 'aucun espoir', 'plus aucun espoir',
    'sans issue', 'aucune issue', 'désespoir total',
    'jsp pourquoi je suis là', 'pourquoi je suis là',
    'jsp comment continuer', 'je sais plus comment continuer',
  ],
  en: [
    // ── Direct intent ─────────────────────────────────────────────
    'suicide', 'kill myself', 'end my life', 'end it all',
    'hang myself', 'drown myself', 'jump off', 'overdose',
    'take all my pills', 'slit my', 'shoot myself',

    // ── Indirect / euphemisms ─────────────────────────────────────
    'want to die', 'wanna die', 'wish i was dead', 'wish i were dead',
    'rather be dead', 'better off dead', 'tired of living',
    'tired of being alive', 'don\'t want to be here anymore',
    'don\'t want to exist', 'want to disappear forever',
    'sleep forever', 'never wake up', 'don\'t want to wake up',
    'stop the pain', 'end the pain', 'make it stop',
    'no reason to live', 'not worth living',

    // ── Internet / slang (TikTok, Discord, text…) ─────────────────
    'kms', 'kys', 'unalive', 'i want to unalive', 'unaliving myself',
    'off myself', 'offing myself', 'i\'m done', 'done with life',
    'done with everything', 'can\'t do this anymore',

    // ── Burden / worthlessness (major risk factor) ─────────────────
    'i\'m a burden', 'feel like a burden', 'i am a burden',
    'everyone would be better off without me', 'better off without me',
    'no one would miss me', 'nobody would miss me',
    'nobody cares', 'no one cares about me',
    'i\'m worthless', 'i am worthless', 'life is worthless',
    'i\'m useless', 'i hate myself', 'what\'s the point of living',
    'what\'s the point', 'nothing matters', 'i don\'t matter',

    // ── Extreme exhaustion / giving up ────────────────────────────
    'can\'t take it anymore', 'can\'t cope anymore',
    'i give up', 'giving up on life', 'i can\'t go on',
    'can\'t go on', 'lost the will', 'losing the will',
    'no hope', 'hopeless', 'no way out', 'no point',

    // ── Self-harm ─────────────────────────────────────────────────
    'hurt myself', 'self harm', 'self-harm', 'cutting myself',
    'harming myself',
  ],
}

function isCrisis(text, lang) {
  const lower = text.toLowerCase()
  const kws = CRISIS_KEYWORDS[lang] ?? CRISIS_KEYWORDS.fr
  return kws.some(w => lower.includes(w))
}

// ─── Fiches conseil par thème ─────────────────────────────────────────────────
// Sources : HAS, INSERM, OMS/WHO, APA, NHS, NIMH, Psycom, 3114.fr
// Techniques validées : TCC/CBT, ACT, MBSR, TCC-I, CNV, cohérence cardiaque
const ADVICES = {
  fr: {
    // ── Stress / Anxiété ─────────────────────────────────────────────────────
    stress: [
      {
        emoji: '❤️',
        title: 'Cohérence cardiaque',
        body: '5 inspirations + 5 expirations par minute, pendant 5 min, 3 fois par jour. Validé par la HAS : réduit le cortisol et la tension artérielle. Utilise une app ou compte mentalement jusqu\'à 5 pour chaque phase.',
      },
      {
        emoji: '🌬️',
        title: 'Respiration 4-7-8',
        body: 'Inspire 4 secondes · retiens 7 secondes · expire lentement sur 8 secondes. Répète 4 cycles. Active le nerf vague et calme le système nerveux en moins de 2 minutes (recommandé par l\'APA).',
      },
      {
        emoji: '🎯',
        title: 'Ancrage 5-4-3-2-1',
        body: 'Nomme 5 choses que tu vois · 4 que tu entends · 3 que tu peux toucher · 2 que tu sens · 1 que tu goûtes. Cette technique de pleine conscience (MBSR, Kabat-Zinn) coupe le circuit de l\'anxiété en ramenrant dans le présent.',
      },
      {
        emoji: '📝',
        title: 'Vide tes pensées',
        body: 'Écris pendant 10 min tout ce qui t\'inquiète, sans filtre ni relecture. Une étude NIMH montre que l\'externalisation des pensées réduit leur charge émotionnelle et libère de la capacité cognitive.',
      },
      {
        emoji: '⏸️',
        title: 'Pauses régulières (INRS)',
        body: 'Le cerveau fonctionne par cycles ultradiens de ~90 min. L\'INRS recommande une pause de 5–10 min toutes les 90 min de travail intensif pour éviter l\'accumulation de cortisol.',
      },
      {
        emoji: '💪',
        title: 'Relaxation musculaire (Jacobson)',
        body: 'Contracte chaque groupe musculaire 5 secondes puis relâche 30 secondes, des pieds jusqu\'au visage. Cette technique validée depuis 1938 réduit la tension physique du stress de façon mesurable.',
      },
    ],

    // ── Sommeil ──────────────────────────────────────────────────────────────
    sommeil: [
      {
        emoji: '⏰',
        title: 'Heure de lever fixe',
        body: 'L\'INSERM recommande une heure de lever identique 7 jours/7, même le week-end. C\'est le levier le plus puissant pour réguler l\'horloge biologique, plus encore que l\'heure du coucher.',
      },
      {
        emoji: '🌙',
        title: 'Coupure digitale',
        body: 'Éteins les écrans 30 à 60 min avant de dormir. La lumière bleue (spectres 450–490 nm) supprime la mélatonine jusqu\'à 3h selon l\'INSERM. Remplace par lecture papier ou musique douce.',
      },
      {
        emoji: '☕',
        title: 'Caféine avant 14h',
        body: 'La demi-vie de la caféine est de 5 à 6 heures (INSERM). Un café à 16h représente encore la moitié de sa dose à 21h. Évite café, thé noir, sodas et boissons énergisantes après 14h.',
      },
      {
        emoji: '🧘',
        title: 'Scan corporel',
        body: 'Allongé·e, ferme les yeux. Relâche consciemment chaque zone du corps des pieds jusqu\'à la tête en expirant. Composante centrale de la TCC-I (thérapie recommandée en 1ère ligne par la HAS pour l\'insomnie).',
      },
      {
        emoji: '🛏️',
        title: 'Le lit = uniquement le sommeil',
        body: 'Le contrôle par stimulus (Bootzin, TCC-I) : utilise ton lit uniquement pour dormir. Pas d\'écran, pas de lecture, pas de travail. Le cerveau crée une association automatique lit = sommeil.',
      },
      {
        emoji: '🍷',
        title: 'Alcool et sommeil',
        body: 'L\'alcool facilite l\'endormissement mais fragmente le sommeil profond et supprime le sommeil paradoxal (REM), indispensable à la mémorisation et à la régulation émotionnelle (INSERM). Évite-le le soir.',
      },
    ],

    // ── Tristesse / Dépression ───────────────────────────────────────────────
    tristesse: [
      {
        emoji: '🏃',
        title: 'Activation comportementale',
        body: 'Recommandation de 1ère ligne de la HAS pour la dépression légère à modérée : faire des activités agréables même sans en avoir envie. L\'envie revient après l\'action, pas avant. Commence par 10 minutes.',
      },
      {
        emoji: '🫂',
        title: 'Autocompassion (Neff)',
        body: 'Pose une main sur ton cœur : "C\'est difficile en ce moment — c\'est humain." La self-compassion, validée par des centaines d\'études, réduit la dépression et l\'autocritique mieux que l\'estime de soi classique.',
      },
      {
        emoji: '🙏',
        title: 'Journal de gratitude',
        body: 'Chaque soir, note 3 choses positives qui se sont passées et pourquoi. En 2 semaines, cette pratique (Seligman, 2005) réduit significativement les symptômes dépressifs et augmente le bien-être.',
      },
      {
        emoji: '☀️',
        title: 'Lumière naturelle',
        body: '30 min de lumière du jour avant 10h régulent la sérotonine et la mélatonine. Recommandé par la HAS pour les dépressions saisonnières et les troubles de l\'humeur. Même par temps nuageux, l\'intensité est suffisante.',
      },
      {
        emoji: '🤝',
        title: 'Maintenir le lien social',
        body: 'L\'isolement aggrave la dépression (OMS). Même un court échange suffit. Préviens un proche que tu traverses une période difficile — tu n\'as pas à tout expliquer, juste à ne pas rester seul·e.',
      },
      {
        emoji: '🩺',
        title: 'Consulter un professionnel',
        body: 'Si la tristesse dure plus de 2 semaines, affecte ton sommeil ou ton appétit, consulte un médecin. La dépression est une maladie, pas une faiblesse — elle se traite efficacement (TCC, médicaments ou les deux selon la HAS).', alert: true,
      },
    ],

    // ── Colère ───────────────────────────────────────────────────────────────
    colere: [
      {
        emoji: '💨',
        title: 'Expire d\'abord',
        body: 'L\'expiration longue (6 secondes) stimule le nerf vague et active le système parasympathique. Fais-le avant tout. Le corps met 20 minutes à éliminer l\'adrénaline — aucune décision importante pendant ce temps.',
      },
      {
        emoji: '🏃',
        title: 'Décharge physique',
        body: 'La colère prépare le corps à l\'action (réponse fight-or-flight). Monte et descends des escaliers, fais des sauts ou secoue les bras. L\'APA recommande l\'exercice physique comme premier régulateur de la colère.',
      },
      {
        emoji: '🗣️',
        title: 'Communication Non-Violente',
        body: 'Méthode Rosenberg (CNV) : Observation → Sentiment → Besoin → Demande. Ex : "Quand tu interromps (O), je me sens invisible (S), j\'ai besoin d\'être entendu·e (B), peux-tu me laisser finir ? (D)"',
      },
      {
        emoji: '⏱️',
        title: 'Règle des 10 minutes',
        body: 'Attends 10 min avant de répondre, envoyer un message ou prendre une décision sous l\'effet de la colère. Ce que tu ressentiras alors sera plus représentatif de ce que tu veux vraiment.',
      },
      {
        emoji: '📓',
        title: 'Journal de colère',
        body: 'Note ce qui t\'a mis·e en colère, ce que tu as ressenti dans le corps, et ce dont tu avais besoin. Identifier ses déclencheurs récurrents (TCC) permet d\'anticiper et de répondre différemment.',
      },
    ],

    // ── Motivation ───────────────────────────────────────────────────────────
    motivation: [
      {
        emoji: '🍅',
        title: 'Technique Pomodoro',
        body: '25 minutes de travail concentré, puis 5 minutes de pause. Après 4 cycles, une pause longue de 20–30 min. Cette méthode exploite les cycles d\'attention naturels et réduit la procrastination.',
      },
      {
        emoji: '🎯',
        title: 'Règle des 2 minutes',
        body: 'Si une tâche prend moins de 2 minutes, fais-la immédiatement (David Allen, GTD). Pour les autres, engage-toi seulement pour les 2 premières minutes — le passage à l\'action crée l\'élan.',
      },
      {
        emoji: '🌱',
        title: 'Un seul mini-objectif',
        body: 'La théorie du comportement planifié montre qu\'un objectif spécifique et immédiat est beaucoup plus efficace qu\'un grand objectif lointain. Qu\'est-ce que tu peux faire dans les 5 prochaines minutes ?',
      },
      {
        emoji: '🔋',
        title: 'Identifier tes ressources',
        body: 'La théorie de l\'auto-détermination (Deci & Ryan) identifie 3 besoins fondamentaux : autonomie, compétence, appartenance. Quelle activité remplit ces 3 besoins ? C\'est souvent là que la motivation revient.',
      },
      {
        emoji: '🎉',
        title: 'Célébrer les petites victoires',
        body: 'Chaque petit pas accompli mérite d\'être reconnu. Note tes réussites du jour, même minimes. Le cerveau libère de la dopamine à chaque complétion — c\'est un carburant réel pour continuer.',
      },
    ],

    // ── Solitude ─────────────────────────────────────────────────────────────
    solitude: [
      {
        emoji: '📱',
        title: '"Je pensais à toi"',
        body: 'Envoie un message simple à quelqu\'un que tu apprécies. Une étude de l\'Université de Chicago montre que les gens sous-estiment systématiquement combien leurs messages font plaisir à l\'autre.',
      },
      {
        emoji: '🤲',
        title: 'Le bénévolat',
        body: 'Aider les autres est l\'un des antidotes les plus puissants à la solitude. Le bénévolat augmente le sentiment d\'utilité et crée des liens authentiques (étude Holt-Lunstad, 2015).',
      },
      {
        emoji: '🌍',
        title: 'Trouver sa communauté',
        body: 'Des groupes existent pour tous les intérêts : Discord, Meetup, associations locales. La solitude chronique est aussi risquée pour la santé que fumer 15 cigarettes par jour (méta-analyse Holt-Lunstad).',
      },
      {
        emoji: '☕',
        title: 'Les tiers-lieux',
        body: 'Café, bibliothèque, espace de coworking, parc. La présence humaine — même sans interaction directe — active les circuits sociaux du cerveau et réduit le sentiment d\'isolement.',
      },
      {
        emoji: '🩺',
        title: 'Solitude chronique',
        body: 'Si la solitude dure et affecte ton quotidien, parles-en à un médecin ou un psychologue. Des thérapies de groupe et des programmes de soutien existent et sont très efficaces (NHS, HAS).', alert: true,
      },
    ],

    // ── Douleurs corporelles ─────────────────────────────────────────────────
    corps: [
      {
        emoji: '💧',
        title: 'Hydratation',
        body: 'La déshydratation amplifie fatigue, maux de tête et anxiété dès -1% du poids corporel en eau (INSERM). Vise 1,5–2L par jour. Un grand verre d\'eau fraîche peut déjà améliorer l\'état en quelques minutes.',
      },
      {
        emoji: '🍽️',
        title: 'Repas réguliers',
        body: 'Les variations de glycémie affectent directement l\'humeur, la concentration et l\'énergie. Des repas à heures fixes aident à stabiliser l\'état général. Évite de sauter des repas, même en cas de stress.',
      },
      {
        emoji: '🚶',
        title: 'Mouvement doux',
        body: 'Même 20–30 min de marche par jour réduisent les douleurs chroniques légères, libèrent des endorphines et améliorent la mobilité (OMS, recommandations activité physique 2020).',
      },
      {
        emoji: '🛁',
        title: 'Bain ou douche chaude',
        body: 'La chaleur relâche les tensions musculaires, réduit le cortisol et augmente la sérotonine. 15 à 20 minutes suffisent. Peut aussi aider à l\'endormissement si pris 1h avant de se coucher.',
      },
      {
        emoji: '🩺',
        title: 'Consulte un médecin',
        body: 'En cas de douleur persistante (> 3 jours), intense, localisée ou inhabituelle, consulte un médecin sans attendre. Ces conseils sont des pistes générales — seul un professionnel de santé peut établir un diagnostic.', alert: true,
      },
    ],

    // ── Burn-out ─────────────────────────────────────────────────────────────
    burnout: [
      {
        emoji: '🚨',
        title: 'Reconnaître les 3 signes (Maslach)',
        body: 'Le burn-out, reconnu par l\'OMS en 2019 comme phénomène professionnel, se manifeste par : épuisement émotionnel profond · sentiment de cynisme ou détachement · sentiment d\'inefficacité. Si tu te reconnais dans les 3, consulte.',
      },
      {
        emoji: '🚫',
        title: 'Apprendre à dire non',
        body: 'L\'INRS identifie la surcharge de travail comme premier facteur de burn-out. "Non" est une phrase complète. Commence par refuser une seule chose cette semaine — c\'est un muscle qui se renforce.',
      },
      {
        emoji: '🔌',
        title: 'Déconnexion numérique',
        body: 'Le droit à la déconnexion est inscrit dans la loi française depuis 2017. Désactive les notifications professionnelles hors des heures de travail. La disponibilité permanente entretient l\'épuisement.',
      },
      {
        emoji: '🔋',
        title: 'Récupération active',
        body: 'Le repos passif (canapé, écran) récupère moins bien que le repos actif : promenade, lecture, temps social, nature. Planifie au moins une activité récupératrice par jour, même 20 minutes.',
      },
      {
        emoji: '🩺',
        title: 'Consulte sans attendre',
        body: 'Le burn-out non traité peut évoluer en dépression sévère. Parles-en à ton médecin traitant — il peut prescrire un arrêt de travail, t\'orienter vers un psychologue ou un médecin du travail (INRS).', alert: true,
      },
    ],

    // ── Estime de soi ────────────────────────────────────────────────────────
    estime: [
      {
        emoji: '📓',
        title: 'Journal de réussites',
        body: 'Chaque soir, note 3 choses que tu as faites correctement aujourd\'hui, même petites. La TCC montre que focaliser consciemment sur les réussites recalibre les schémas de pensée automatiquement négatifs.',
      },
      {
        emoji: '🧠',
        title: 'Défusion cognitive (ACT)',
        body: 'Quand une pensée négative arrive ("je suis nul·le"), essaie : "J\'ai la pensée que je suis nul·le." Cette distance crée par la thérapie d\'acceptation et d\'engagement (ACT) réduit l\'emprise des pensées critiques.',
      },
      {
        emoji: '🌱',
        title: 'Tes valeurs, pas tes performances',
        body: 'L\'estime de soi stable repose sur les valeurs (qui tu es) plutôt que sur les performances (ce que tu fais). Identifie 3 valeurs qui te définissent : curiosité, générosité, honnêteté… et agis en accord avec elles.',
      },
      {
        emoji: '🛑',
        title: 'Stopper la comparaison',
        body: 'Les réseaux sociaux montrent les meilleurs moments des autres, pas leur réalité. La comparaison vers le haut détériore l\'estime de soi (APA). Limite ton exposition et compare-toi à ta version d\'hier.',
      },
      {
        emoji: '🤝',
        title: 'Psychothérapie',
        body: 'La TCC et l\'ACT ont démontré leur efficacité sur l\'estime de soi dans de nombreuses méta-analyses. Un psychologue peut t\'aider à identifier et modifier les schémas de pensée qui alimentent l\'auto-dévalorisation.',
      },
    ],

    // ── Deuil ────────────────────────────────────────────────────────────────
    deuil: [
      {
        emoji: '💙',
        title: 'Le deuil n\'est pas linéaire',
        body: 'Le deuil ne suit pas un ordre fixe d\'étapes. La recherche actuelle (Stroebe & Schut) montre qu\'on oscille entre la douleur de la perte et la reconstruction. Toutes tes émotions — y compris le soulagement ou la colère — sont normales.',
      },
      {
        emoji: '🫂',
        title: 'Permets-toi de ressentir',
        body: 'Vouloir "aller bien vite" est compréhensible mais contre-productif. Accueillir la douleur sans la fuir (principe d\'acceptation, ACT) permet au deuil de progresser. Pleurer est une réponse saine et nécessaire.',
      },
      {
        emoji: '🕯️',
        title: 'Ritualiser le souvenir',
        body: 'Créer des rituels (une photo, un objet, une date anniversaire) aide à maintenir un lien symbolique avec la personne perdue tout en avançant. Les rituels donnent un cadre à la douleur (recherches en psychologie du deuil).',
      },
      {
        emoji: '🤝',
        title: 'Ne pas s\'isoler',
        body: 'L\'isolement pendant le deuil aggrave le risque de dépression. Accepte l\'aide des proches, même si tu n\'as pas envie. Des groupes de soutien deuil existent partout en France (associations locales, Jalmalv).',
      },
      {
        emoji: '🩺',
        title: 'Deuil compliqué',
        body: 'Si la douleur reste intense après 6 mois, affecte fortement le quotidien ou s\'accompagne de pensées de mort, consulte un médecin ou un psychologue spécialisé. Le deuil compliqué se traite avec un accompagnement adapté.', alert: true,
      },
    ],

    // ── Pensées négatives / Rumination ───────────────────────────────────────
    rumination: [
      {
        emoji: '⏱️',
        title: 'Le "temps de rumination"',
        body: 'Réserve 15 min par jour (même heure, même endroit) pour ressasser tes soucis. En dehors, reporte-les mentalement à cette fenêtre. La TCC montre que cette technique réduit la rumination globale jusqu\'à 40%.',
      },
      {
        emoji: '🍃',
        title: 'Laisser passer les pensées (ACT)',
        body: 'Imagine tes pensées comme des feuilles portées par un courant. Observe-les passer sans t\'y accrocher. Tu n\'as pas à croire chaque pensée que tu as — elles ne sont pas des faits.',
      },
      {
        emoji: '🧠',
        title: 'Questionnement socratique',
        body: 'Face à une pensée négative, demande-toi : "Est-ce que j\'ai des preuves ? Y a-t-il une autre explication possible ? Qu\'est-ce que je dirais à un ami qui pense ça ?" (Outil central de la TCC).',
      },
      {
        emoji: '🎵',
        title: 'Interruption d\'activité',
        body: 'Quand la rumination s\'emballe, change brusquement d\'activité physique ou sensorielle : musique forte, froid sur le visage, activité manuelle. Le cerveau ne peut pas rester en mode rumination et traitement sensoriel en même temps.',
      },
      {
        emoji: '🧘',
        title: 'Pleine conscience (MBSR)',
        body: 'Le programme MBSR de Kabat-Zinn (8 semaines, validé par des centaines d\'études) réduit la rumination de façon significative. Des apps comme Petit Bambou ou Headspace proposent des introductions guidées.',
      },
    ],

    // ── Réponse par défaut ───────────────────────────────────────────────────
    default: [
      {
        emoji: '💙',
        title: 'Tu es au bon endroit',
        body: 'Chercher des ressources pour aller mieux est déjà un acte courageux. Décris-moi ce que tu ressens en quelques mots — stress, tristesse, fatigue, relations — et je t\'orienterai vers des conseils adaptés.',
      },
      {
        emoji: '🌬️',
        title: 'Pause respiration',
        body: 'Inspire 4 secondes, expire 6 secondes. Répète 3 fois. L\'expiration plus longue que l\'inspiration active le système nerveux parasympathique — c\'est un bon point de départ pour presque tout.',
      },
      {
        emoji: '🤝',
        title: 'Parler à un professionnel',
        body: 'Si tu traverses une période difficile, un médecin, psychologue ou psychiatre peut vraiment aider. En France, MonPsy permet 8 séances remboursées avec un psychologue sur prescription médicale.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  en: {
    // ── Stress / Anxiety ─────────────────────────────────────────────────────
    stress: [
      {
        emoji: '❤️',
        title: 'Heart coherence breathing',
        body: '5 seconds in, 5 seconds out, for 5 minutes, 3 times a day. This technique (HeartMath Institute) measurably reduces cortisol and blood pressure. Count mentally or use a breathing app.',
      },
      {
        emoji: '🌬️',
        title: '4-7-8 Breathing',
        body: 'Inhale 4s · hold 7s · exhale 8s. Repeat 4 cycles. Activates the vagus nerve and calms the nervous system in under 2 minutes (recommended by the APA).',
      },
      {
        emoji: '🎯',
        title: '5-4-3-2-1 Grounding',
        body: 'Name 5 things you see · 4 you hear · 3 you can touch · 2 you smell · 1 you taste. This MBSR (Kabat-Zinn) grounding technique interrupts the anxiety loop by anchoring you in the present.',
      },
      {
        emoji: '📝',
        title: 'Brain dump',
        body: 'Write for 10 minutes everything worrying you, without filtering or re-reading. NIMH research shows externalizing thoughts reduces their emotional weight and frees cognitive capacity.',
      },
      {
        emoji: '⏸️',
        title: 'Regular breaks',
        body: 'The brain operates in ~90-minute ultradian cycles. Take a 5–10 minute break every 90 minutes of focused work to prevent cortisol buildup and maintain performance.',
      },
      {
        emoji: '💪',
        title: 'Progressive muscle relaxation',
        body: 'Tense each muscle group for 5 seconds then release for 30 seconds, from feet to face (Jacobson, 1938). This evidence-based technique measurably reduces physical stress tension.',
      },
    ],

    // ── Sleep ─────────────────────────────────────────────────────────────────
    sommeil: [
      {
        emoji: '⏰',
        title: 'Fixed wake-up time',
        body: 'The NHS and NIMH agree: the same wake-up time 7 days a week is the single most powerful lever for regulating your biological clock — more so than your bedtime.',
      },
      {
        emoji: '🌙',
        title: 'Digital curfew',
        body: 'Turn off screens 30–60 min before bed. Blue light (450–490nm spectrum) suppresses melatonin for up to 3 hours. Replace with paper reading or gentle music.',
      },
      {
        emoji: '☕',
        title: 'Caffeine before 2pm',
        body: 'Caffeine has a 5–6 hour half-life. A coffee at 4pm still has half its dose active at 9pm. Avoid coffee, black tea, sodas and energy drinks after 2pm.',
      },
      {
        emoji: '🧘',
        title: 'Body scan',
        body: 'Lying down, close your eyes. Consciously release each body zone from feet to head on each exhale. A core component of CBT-I (Cognitive Behavioral Therapy for Insomnia), recommended as first-line treatment by the NHS.',
      },
      {
        emoji: '🛏️',
        title: 'Bed = sleep only',
        body: 'Stimulus control therapy (Bootzin, CBT-I): use your bed only for sleep. No screens, reading or work in bed. Your brain builds an automatic association: bed = sleep.',
      },
      {
        emoji: '🍷',
        title: 'Alcohol disrupts sleep',
        body: 'Alcohol aids falling asleep but fragments deep sleep and suppresses REM sleep — essential for memory and emotional regulation (NIMH). Avoid it in the evening for better sleep quality.',
      },
    ],

    // ── Sadness / Depression ──────────────────────────────────────────────────
    tristesse: [
      {
        emoji: '🏃',
        title: 'Behavioral activation',
        body: 'First-line NHS/NIMH recommendation for mild-to-moderate depression: do enjoyable activities even when you don\'t feel like it. Motivation follows action — it doesn\'t precede it. Start with 10 minutes.',
      },
      {
        emoji: '🫂',
        title: 'Self-compassion (Neff)',
        body: 'Place a hand on your heart: "This is hard right now — and that\'s human." Self-compassion, validated by hundreds of studies, reduces depression and self-criticism more effectively than classic self-esteem work.',
      },
      {
        emoji: '🙏',
        title: 'Gratitude journal',
        body: 'Each evening, write 3 positive things that happened and why. In 2 weeks, this practice (Seligman, 2005) significantly reduces depressive symptoms and increases overall wellbeing.',
      },
      {
        emoji: '☀️',
        title: 'Natural light',
        body: '30 minutes of daylight before 10am regulates serotonin and melatonin. Recommended by NHS for seasonal depression and mood disorders. Even on cloudy days, the intensity is sufficient.',
      },
      {
        emoji: '🤝',
        title: 'Maintain social connection',
        body: 'Isolation worsens depression (WHO). Even a brief exchange helps. Let someone close know you\'re going through a hard time — you don\'t have to explain everything, just not be alone.',
      },
      {
        emoji: '🩺',
        title: 'See a professional',
        body: 'If sadness lasts more than 2 weeks, affects sleep or appetite, see a doctor. Depression is an illness, not weakness — it responds well to treatment (CBT, medication or both, per NIMH guidelines).', alert: true,
      },
    ],

    // ── Anger ─────────────────────────────────────────────────────────────────
    colere: [
      {
        emoji: '💨',
        title: 'Exhale first',
        body: 'A long exhale (6 seconds) stimulates the vagus nerve and activates the parasympathetic system. Do this before anything else. The body takes 20 minutes to clear adrenaline — no major decisions during that time.',
      },
      {
        emoji: '🏃',
        title: 'Physical release',
        body: 'Anger primes the body for action (fight-or-flight response). Climb stairs, jump in place, shake your arms. The APA recommends physical exercise as the first regulator of anger.',
      },
      {
        emoji: '🗣️',
        title: 'Nonviolent Communication',
        body: 'Rosenberg\'s NVC method: Observation → Feeling → Need → Request. Ex: "When you interrupt (O), I feel invisible (F), I need to be heard (N), can you let me finish? (R)"',
      },
      {
        emoji: '⏱️',
        title: '10-minute rule',
        body: 'Wait 10 minutes before replying, sending a message or making a decision under anger. What you feel then will better reflect what you actually want.',
      },
      {
        emoji: '📓',
        title: 'Anger journal',
        body: 'Note what triggered your anger, what you felt physically, and what need was unmet. Identifying recurring triggers (CBT) helps you anticipate and respond differently next time.',
      },
    ],

    // ── Motivation ────────────────────────────────────────────────────────────
    motivation: [
      {
        emoji: '🍅',
        title: 'Pomodoro technique',
        body: '25 minutes of focused work, then a 5-minute break. After 4 cycles, a longer 20–30 minute break. This exploits natural attention cycles and effectively reduces procrastination.',
      },
      {
        emoji: '🎯',
        title: '2-minute rule',
        body: 'If a task takes less than 2 minutes, do it immediately (David Allen, GTD). For others, commit to just the first 2 minutes — starting creates momentum.',
      },
      {
        emoji: '🌱',
        title: 'One mini-goal',
        body: 'Self-determination theory shows a specific, immediate goal is far more effective than a distant big goal. What can you do in the next 5 minutes? Just that.',
      },
      {
        emoji: '🔋',
        title: 'Find your energy sources',
        body: 'Self-determination theory (Deci & Ryan) identifies 3 core needs: autonomy, competence, belonging. Which activity fulfills all 3? That\'s often where motivation returns.',
      },
      {
        emoji: '🎉',
        title: 'Celebrate small wins',
        body: 'Every completed step deserves recognition. Log your daily wins, however small. The brain releases dopamine with each completion — that\'s real fuel to keep going.',
      },
    ],

    // ── Loneliness ────────────────────────────────────────────────────────────
    solitude: [
      {
        emoji: '📱',
        title: '"Thinking of you"',
        body: 'Send a simple message to someone you care about. A University of Chicago study shows people consistently underestimate how much their messages mean to others.',
      },
      {
        emoji: '🤲',
        title: 'Volunteering',
        body: 'Helping others is one of the most powerful antidotes to loneliness. It builds genuine connections and increases sense of purpose (Holt-Lunstad, 2015).',
      },
      {
        emoji: '🌍',
        title: 'Find your community',
        body: 'Groups exist for every interest: Discord, Meetup, local clubs. Chronic loneliness is as dangerous to health as smoking 15 cigarettes a day (Holt-Lunstad meta-analysis).',
      },
      {
        emoji: '☕',
        title: 'Third places',
        body: 'Café, library, coworking space, park. Human presence — even without direct interaction — activates social brain circuits and eases isolation.',
      },
      {
        emoji: '🩺',
        title: 'Chronic loneliness',
        body: 'If loneliness persists and affects daily life, talk to a doctor or therapist. Group therapy and peer support programs are highly effective (NHS, NIMH).', alert: true,
      },
    ],

    // ── Body pain ─────────────────────────────────────────────────────────────
    corps: [
      {
        emoji: '💧',
        title: 'Hydration',
        body: 'Dehydration amplifies fatigue, headaches and anxiety from as little as 1% body weight water loss (NIMH). Aim for 1.5–2L daily. A large glass of cold water can already shift your state in minutes.',
      },
      {
        emoji: '🍽️',
        title: 'Regular meals',
        body: 'Blood sugar fluctuations directly affect mood, focus and energy. Regular mealtimes stabilize your overall state. Avoid skipping meals, even when stressed.',
      },
      {
        emoji: '🚶',
        title: 'Gentle movement',
        body: 'Even 20–30 minutes of walking daily reduces mild chronic pain, releases endorphins and improves mobility (WHO physical activity guidelines 2020).',
      },
      {
        emoji: '🛁',
        title: 'Warm shower or bath',
        body: 'Heat releases muscle tension, reduces cortisol and boosts serotonin. 15–20 minutes is enough. It can also help with falling asleep if taken 1 hour before bed.',
      },
      {
        emoji: '🩺',
        title: 'See a doctor',
        body: 'For persistent (>3 days), intense, localized or unusual pain, see a doctor without delay. These are general wellness tips only — only a healthcare professional can diagnose and treat you properly.', alert: true,
      },
    ],

    // ── Burnout ───────────────────────────────────────────────────────────────
    burnout: [
      {
        emoji: '🚨',
        title: 'Recognize the 3 signs (Maslach)',
        body: 'Burnout, recognized by the WHO in 2019 as an occupational phenomenon, has 3 dimensions: deep emotional exhaustion · cynicism or detachment from work · reduced sense of effectiveness. If you recognize all 3, see a doctor.',
      },
      {
        emoji: '🚫',
        title: 'Learning to say no',
        body: 'Work overload is the leading burnout factor (NIOSH). "No" is a complete sentence. Start by declining one thing this week — it\'s a muscle that strengthens with practice.',
      },
      {
        emoji: '🔌',
        title: 'Digital disconnection',
        body: 'Constant availability maintains exhaustion. Turn off work notifications outside working hours. Studies show that just the presence of a work phone reduces cognitive capacity, even unused.',
      },
      {
        emoji: '🔋',
        title: 'Active recovery',
        body: 'Passive rest (couch, screens) recovers less well than active rest: walking, reading, socializing, nature time. Plan at least one restorative activity per day, even 20 minutes.',
      },
      {
        emoji: '🩺',
        title: 'Don\'t wait to consult',
        body: 'Untreated burnout can develop into severe depression. Talk to your GP — they can prescribe sick leave, refer you to a therapist, or connect you with occupational health services (NIOSH, NHS).', alert: true,
      },
    ],

    // ── Self-esteem ───────────────────────────────────────────────────────────
    estime: [
      {
        emoji: '📓',
        title: 'Success journal',
        body: 'Each evening, note 3 things you did well today, however small. CBT shows that consciously focusing on achievements recalibrates the brain\'s automatic negative thinking patterns.',
      },
      {
        emoji: '🧠',
        title: 'Cognitive defusion (ACT)',
        body: 'When a negative thought arrives ("I\'m useless"), try: "I\'m having the thought that I\'m useless." This distance, created by Acceptance and Commitment Therapy, reduces the hold of self-critical thoughts.',
      },
      {
        emoji: '🌱',
        title: 'Values, not performance',
        body: 'Stable self-esteem is built on who you are, not what you achieve. Identify 3 values that define you — curiosity, generosity, honesty — and act in alignment with them each day.',
      },
      {
        emoji: '🛑',
        title: 'Stop comparing',
        body: 'Social media shows others\' highlights, not their reality. Upward comparison consistently lowers self-esteem (APA). Limit your exposure and compare yourself only to your yesterday self.',
      },
      {
        emoji: '🤝',
        title: 'Psychotherapy',
        body: 'CBT and ACT have demonstrated effectiveness on self-esteem in numerous meta-analyses. A psychologist can help you identify and change the thought patterns that fuel self-deprecation.',
      },
    ],

    // ── Grief ─────────────────────────────────────────────────────────────────
    deuil: [
      {
        emoji: '💙',
        title: 'Grief is not linear',
        body: 'Grief doesn\'t follow fixed stages in order. Current research (Stroebe & Schut) shows we oscillate between the pain of loss and rebuilding. All emotions — including relief or anger — are completely normal.',
      },
      {
        emoji: '🫂',
        title: 'Allow yourself to feel',
        body: 'Wanting to "get over it quickly" is understandable but counter-productive. Welcoming pain without avoidance (ACT acceptance principle) allows grief to move forward. Crying is a healthy and necessary response.',
      },
      {
        emoji: '🕯️',
        title: 'Ritualizing memory',
        body: 'Creating rituals — a photo, an object, an anniversary date — helps maintain a symbolic connection with the person lost while still moving forward. Rituals give structure to grief (grief psychology research).',
      },
      {
        emoji: '🤝',
        title: 'Don\'t isolate yourself',
        body: 'Isolation during grief increases the risk of depression. Accept help from those close to you, even when you don\'t feel like it. Grief support groups exist and are highly effective (NHS, hospice organizations).',
      },
      {
        emoji: '🩺',
        title: 'Complicated grief',
        body: 'If intense pain persists after 6 months, significantly affects daily life, or includes thoughts of death, seek support from a grief-specialized therapist. Complicated grief responds well to targeted treatment.', alert: true,
      },
    ],

    // ── Rumination / Intrusive thoughts ───────────────────────────────────────
    rumination: [
      {
        emoji: '⏱️',
        title: 'Scheduled worry time',
        body: 'Set aside 15 minutes each day (same time, same place) for worrying. Outside that window, mentally postpone intrusive thoughts to it. CBT shows this reduces overall rumination by up to 40%.',
      },
      {
        emoji: '🍃',
        title: 'Thoughts on a stream (ACT)',
        body: 'Picture your thoughts as leaves carried by a current. Watch them float by without grabbing them. You don\'t have to believe every thought you have — they are not facts.',
      },
      {
        emoji: '🧠',
        title: 'Socratic questioning',
        body: 'For a negative thought, ask: "Do I have evidence? Is there another explanation? What would I say to a friend who thinks this?" This core CBT technique challenges automatic negative thinking.',
      },
      {
        emoji: '🎵',
        title: 'Pattern interrupt',
        body: 'When rumination spirals, abruptly switch to a physical or sensory activity: loud music, cold water on your face, hands-on work. The brain can\'t maintain rumination and sensory processing simultaneously.',
      },
      {
        emoji: '🧘',
        title: 'Mindfulness (MBSR)',
        body: 'Kabat-Zinn\'s 8-week MBSR program, validated by hundreds of studies, significantly reduces rumination. Apps like Headspace or Calm offer guided introductions to get started.',
      },
    ],

    // ── Default ───────────────────────────────────────────────────────────────
    default: [
      {
        emoji: '💙',
        title: "You're in the right place",
        body: "Seeking resources to feel better is already courageous. Describe what you're feeling in a few words — stress, sadness, fatigue, relationships — and I'll point you toward adapted advice.",
      },
      {
        emoji: '🌬️',
        title: 'Breathing break',
        body: 'Inhale 4 seconds, exhale 6 seconds. Repeat 3 times. A longer exhale than inhale activates the parasympathetic nervous system — a solid starting point for almost anything.',
      },
      {
        emoji: '🤝',
        title: 'Talk to a professional',
        body: "If you're going through a hard time, a doctor, therapist or counselor can genuinely help. In the US, SAMHSA's helpline (1-800-662-4357) can refer you to local mental health services.",
      },
    ],
  },
}

// ─── Détection du thème ────────────────────────────────────────────────────────
const KEYWORDS = {
  fr: {
    burnout:    ['burn', 'burnout', 'épuisement professionnel', 'plus supporter le travail', 'travail me tue', 'surmenage', 'surchargé', 'surchargée', 'plus supporter mon boulot', 'boulot m\'écrase', 'craquer au travail'],
    stress:     ['stress', 'anxieux', 'anxieuse', 'angoiss', 'panique', 'peur', 'inquiet', 'tendu', 'tendue', 'débordé', 'pression', 'anxiété', 'trop de pression'],
    sommeil:    ['dors', 'dormi', 'sommeil', 'insomni', 'nuit', 'réveill', 'repose', 'mal dormi', 'pas dormi', 'endormir'],
    tristesse:  ['triste', 'tristesse', 'pleure', 'pleuré', 'déprim', 'vide', 'cafard', 'morale', 'down', 'chagrin', 'mélancolie', 'blues'],
    colere:     ['énervé', 'énervée', 'colère', 'fâché', 'fâchée', 'frustré', 'rage', 'agacé', 'irrité', 'en colère', 'hors de moi'],
    motivation: ['motiv', 'démotiv', 'procrastin', 'flemme', 'paress', 'envie de rien', 'rien faire', 'pas envie', 'productiv'],
    estime:     ['confiance en moi', 'confiance en soi', 'estime', 'nul', 'nulle', 'pas capable', 'pas à la hauteur', 'inutile', 'honte', 'me juge', 'regard des autres', 'je me sens inutile'],
    deuil:      ['deuil', 'mort', 'décès', 'perdu quelqu\'un', 'disparu', 'disparue', 'enterrement', 'me manque', 'me manque tellement', 'je pleure sa mort', 'perte'],
    rumination: ['rumination', 'pensées en boucle', 'je tourne en rond', 'pensées négatives', 'je n\'arrête pas de penser', 'obsédé', 'obsédée', 'pensées intrusives', 'tête tourne', 'je ressasse'],
    solitude:   ['seul', 'seule', 'solitude', 'isolé', 'isolée', 'personne', 'rejeté', 'incompris', 'incomprise', 'pas d\'amis'],
    corps:      ['douleur', 'mal au', 'tête', 'ventre', 'dos', 'malade', 'physique', 'faim', 'corps', 'j\'ai mal', 'douleurs'],
  },
  en: {
    burnout:    ['burnout', 'burn out', 'work exhaustion', 'can\'t take work', 'overworked', 'overwhelmed at work', 'work is killing me', 'job is too much', 'workplace stress'],
    stress:     ['stress', 'anxious', 'anxiety', 'panic', 'worry', 'worried', 'fear', 'scared', 'tense', 'overwhelm', 'pressure', 'too much pressure'],
    sommeil:    ['sleep', 'insomni', 'night', 'awake', 'rest', 'slept badly', 'can\'t sleep', 'fall asleep', 'no sleep'],
    tristesse:  ['sad', 'sadness', 'depress', 'cry', 'crying', 'empty', 'down', 'low', 'miserable', 'grief', 'melancholy', 'blues'],
    colere:     ['angry', 'anger', 'mad', 'frustrat', 'rage', 'irritat', 'annoyed', 'furious', 'livid', 'losing my temper'],
    motivation: ['motiv', 'procrastin', 'lazy', 'unmotiv', 'no drive', 'can\'t start', 'productiv'],
    estime:     ['self-esteem', 'confidence', 'worthless', 'not good enough', 'useless', 'ashamed', 'shame', 'judged', 'what others think', 'i feel useless', 'i\'m a failure'],
    deuil:      ['grief', 'loss', 'died', 'death', 'lost someone', 'passed away', 'funeral', 'miss them', 'bereavement', 'mourning'],
    rumination: ['rumination', 'thoughts on loop', 'can\'t stop thinking', 'going in circles', 'negative thoughts', 'obsessed', 'intrusive thoughts', 'overthinking', 'stuck in my head'],
    solitude:   ['alone', 'lonely', 'isolat', 'nobody', 'no one', 'reject', 'misunderstood', 'no friends'],
    corps:      ['pain', 'body', 'headache', 'stomach', 'back', 'sick', 'ill', 'physical', 'hungry', 'hurts', 'aching'],
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
  fr: ['Je suis stressé·e', 'J\'ai mal dormi', 'Je me sens triste', 'Je manque de motivation', 'Je me sens seul·e', 'J\'ai des douleurs', 'Je suis épuisé·e par le travail', 'J\'ai des pensées en boucle', 'Je manque de confiance en moi', 'J\'ai perdu quelqu\'un'],
  en: ['I\'m stressed', 'I slept badly', 'I feel sad', 'I lack motivation', 'I feel lonely', 'I have body pain', 'I\'m burnt out from work', 'I can\'t stop overthinking', 'I have low self-esteem', 'I\'m grieving'],
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
function AdviceCard({ emoji, title, body, alert }) {
  return (
    <div className={`rounded-2xl px-4 py-3 border mb-2 ${alert
      ? 'bg-white/25 border-white/60'
      : 'bg-white/20 border-white/25'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[18px]">{emoji}</span>
        <p className="text-white font-bold text-[12px]">{title}</p>
      </div>
      <p className={`text-[11px] leading-relaxed ${alert ? 'text-white' : 'text-white/80'}`}>{body}</p>
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

function UserMessage({ text, badge }) {
  return (
    <div className="flex justify-end items-end gap-2 mb-3">
      <div className="bg-white/90 text-[#FF7040] font-semibold text-[12px] rounded-2xl rounded-tr-sm px-4 py-2 max-w-[72%]">
        {text}
      </div>
      <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[17px] flex-shrink-0">
        {badge}
      </div>
    </div>
  )
}

// ─── Mapping tags → thème conseil ─────────────────────────────────────────────
const TAG_TO_TOPIC = {
  fr: {
    'Fatigué·e': 'corps', 'Très fatigué·e': 'corps', 'Fatigué': 'corps',
    'Anxieux·se': 'stress', 'Stressé·e': 'stress', 'Journée stressante': 'stress',
    'Angoissé·e': 'stress',
    'Pleuré·e': 'tristesse', 'Triste': 'tristesse', 'Cafard': 'tristesse',
    'Mal dormi·e': 'sommeil', 'Insomnie': 'sommeil',
    'Peu mangé': 'corps', 'Pas mangé': 'corps', 'Douleurs': 'corps',
    'Seul·e': 'solitude', 'Isolé·e': 'solitude',
    'En colère': 'colere', 'Frustré·e': 'colere',
    'Démotivé·e': 'motivation', 'Pas envie': 'motivation',
    'Pensées négatives': 'rumination', 'Pensées en boucle': 'rumination',
    'Manque de confiance': 'estime',
  },
  en: {
    'Fatigued': 'corps', 'Very tired': 'corps', 'Tired': 'corps',
    'Anxious': 'stress', 'Stressed': 'stress', 'Stressful day': 'stress',
    'Worried': 'stress',
    'Cried': 'tristesse', 'Sad': 'tristesse', 'Down': 'tristesse',
    'Poor sleep': 'sommeil', 'Insomnia': 'sommeil',
    'Ate little': 'corps', "Didn't eat": 'corps', 'Body pain': 'corps',
    'Lonely': 'solitude', 'Isolated': 'solitude',
    'Angry': 'colere', 'Frustrated': 'colere',
    'Unmotivated': 'motivation', 'No motivation': 'motivation',
    'Negative thoughts': 'rumination', 'Overthinking': 'rumination',
    'Low self-esteem': 'estime',
  },
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function Conseil() {
  const { lang } = useLang()
  const navigate  = useNavigate()
  const { profile } = useAuth()
  const { fetchMonth } = useMoods()
  const userBadge = getAvatar(profile?.avatar ?? 'starter')
  const [messages,  setMessages]  = useState([{ type: 'bot', text: INTRO[lang] ?? INTRO.fr }])
  const [input,     setInput]     = useState('')
  const bottomRef        = useRef(null)
  const inputRef         = useRef(null)
  const proactiveShown   = useRef(false)   // évite le double-affichage (StrictMode / lang)

  // ── Chatbot proactif : si l'entrée du jour a des tags négatifs ──────────────
  useEffect(() => {
    if (proactiveShown.current) return
    proactiveShown.current = true

    async function checkTodayMood() {
      try {
        const now    = new Date()
        const data   = await fetchMonth(now.getFullYear(), now.getMonth())
        const pad    = n => String(n).padStart(2, '0')
        const key    = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
        const entry  = data?.[key]
        if (!entry?.commentaire) return

        const tags   = entry.commentaire.split(/,\s*/).map(t => t.trim())
        const tagMap = TAG_TO_TOPIC[lang] ?? TAG_TO_TOPIC.fr
        let foundTag   = null
        let foundTopic = null
        for (const tag of tags) {
          if (tagMap[tag]) { foundTag = tag; foundTopic = tagMap[tag]; break }
        }
        if (!foundTag) return

        const adviceData = ADVICES[lang] ?? ADVICES.fr
        const cards      = (adviceData[foundTopic] ?? adviceData.default).slice(0, 3)
        const greeting   = lang === 'fr'
          ? `J'ai vu que tu te sentais "${foundTag}" aujourd'hui 💙 Voici quelques fiches qui pourraient t'aider.`
          : `I noticed you were feeling "${foundTag}" today 💙 Here are some tips that might help.`

        setMessages(prev => [
          ...prev,
          { type: 'bot', text: greeting, cards },
        ])
      } catch (_) { /* silencieux si pas de données */ }
    }
    checkTodayMood()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage(text) {
    if (!text.trim()) return

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
          <p className="text-white/55 text-[10px] mt-0.5 mb-2">
            {lang === 'fr'
              ? 'Fiches conseil personnalisées · Basé sur ce que tu ressens'
              : 'Personalized advice cards · Based on how you feel'}
          </p>

          {/* Bandeau avertissement + bouton mode crise */}
          <div className="flex items-center gap-2 bg-white/15 border border-white/30 rounded-2xl px-3 py-2.5">
            <p className="flex-1 text-white text-[10px] leading-snug text-left">
              {lang === 'fr'
                ? '⚕️ En cas de détresse grave ou d\'urgence médicale, consulte immédiatement un professionnel de santé.'
                : '⚕️ In case of serious distress or medical emergency, seek professional help immediately.'}
            </p>
            <button
              onClick={() => navigate('/crisis')}
              className="flex-shrink-0 flex items-center gap-1 bg-white/25 border border-white/50 rounded-xl px-2.5 py-1.5 text-white font-bold text-[10px] active:scale-95 transition-transform">
              🆘 {lang === 'fr' ? 'Crise' : 'Crisis'}
            </button>
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-3">
          {messages.map((msg, i) => (
            msg.type === 'user'
              ? <UserMessage key={i} text={msg.text} badge={userBadge} />
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

        {/* Quick chips — toujours visibles pour cumuler les sujets */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(QUICK_CHIPS[lang] ?? QUICK_CHIPS.fr).map((chip, i) => (
            <button key={i} onClick={() => { sendMessage(chip); inputRef.current?.focus() }}
              className="text-[11px] font-semibold text-white/90 bg-white/18 border border-white/35 rounded-full px-3 py-1.5 transition-all active:scale-95">
              {chip}
            </button>
          ))}
        </div>

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
