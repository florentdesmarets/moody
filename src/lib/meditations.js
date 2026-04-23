// ─── Méditations guidées ───────────────────────────────────────────────────────
// Voix synthétique du navigateur (Web Speech API) — aucun fichier audio,
// aucune connexion réseau. Fonctionne 100% hors ligne.
//
// Chaque step :
//   text    → phrase lue à voix haute
//   pause   → silence après la parole (ms)
//   breathe → animation du cercle : 'in' | 'out' | undefined

export const MEDITATIONS = [
  // ── 1. Cohérence cardiaque ────────────────────────────────────────────────
  {
    id: 'coherence',
    emoji: '❤️',
    duration: '5 min',
    topics: ['stress', 'default'],
    color: '#FF7040',
    title:  { fr: 'Cohérence cardiaque',  en: 'Cardiac coherence'      },
    desc:   {
      fr: 'Régule ton système nerveux. Recommandé par la HAS contre le stress et l\'anxiété.',
      en: 'Regulate your nervous system. Recommended for stress and anxiety (HAS).',
    },
    script: {
      fr: [
        { text: 'Installe-toi confortablement. Assieds-toi ou allonge-toi dans un endroit calme.', pause: 4500 },
        { text: 'Ferme les yeux si tu le souhaites.', pause: 3000 },
        { text: 'Nous allons pratiquer la cohérence cardiaque : cinq respirations par minute pendant cinq minutes. Laisse ton ventre se gonfler à chaque inspiration.', pause: 4500 },
        { text: 'Inspire...', pause: 5200, breathe: 'in'  },
        { text: 'Expire...', pause: 5200, breathe: 'out' },
        { text: 'Inspire...', pause: 5200, breathe: 'in'  },
        { text: 'Expire...', pause: 5200, breathe: 'out' },
        { text: 'Très bien. Continue à ton rythme. Inspire...', pause: 5200, breathe: 'in'  },
        { text: 'Expire... laisse ton corps se détendre à chaque expiration.', pause: 5200, breathe: 'out' },
        { text: 'Si des pensées arrivent, laisse-les passer comme des nuages. Ramène doucement ton attention à ta respiration.', pause: 5000 },
        { text: 'Inspire...', pause: 5200, breathe: 'in'  },
        { text: 'Expire...', pause: 5200, breathe: 'out' },
        { text: 'Inspire...', pause: 5200, breathe: 'in'  },
        { text: 'Expire...', pause: 5200, breathe: 'out' },
        { text: 'Inspire...', pause: 5200, breathe: 'in'  },
        { text: 'Expire...', pause: 5200, breathe: 'out' },
        { text: 'Inspire une dernière fois... profondément...', pause: 5200, breathe: 'in'  },
        { text: 'Et expire... lentement... complètement.', pause: 6000, breathe: 'out' },
        { text: 'Bravo. Tu viens de pratiquer cinq minutes de cohérence cardiaque. Prends un moment pour observer comment tu te sens.', pause: 5000 },
        { text: 'Quand tu es prêt·e, ouvre doucement les yeux.', pause: 3000 },
      ],
      en: [
        { text: 'Find a comfortable position. Sit or lie down in a quiet place.', pause: 4500 },
        { text: 'Close your eyes if you feel comfortable.', pause: 3000 },
        { text: 'We\'ll practice cardiac coherence: five breaths per minute for five minutes. Let your belly rise with each inhale.', pause: 4500 },
        { text: 'Inhale...', pause: 5200, breathe: 'in'  },
        { text: 'Exhale...', pause: 5200, breathe: 'out' },
        { text: 'Inhale...', pause: 5200, breathe: 'in'  },
        { text: 'Exhale...', pause: 5200, breathe: 'out' },
        { text: 'Good. Continue at your own pace. Inhale...', pause: 5200, breathe: 'in'  },
        { text: 'Exhale... let your body relax a little more with each breath out.', pause: 5200, breathe: 'out' },
        { text: 'If thoughts arise, let them pass like clouds. Gently bring your attention back to your breath.', pause: 5000 },
        { text: 'Inhale...', pause: 5200, breathe: 'in'  },
        { text: 'Exhale...', pause: 5200, breathe: 'out' },
        { text: 'Inhale...', pause: 5200, breathe: 'in'  },
        { text: 'Exhale...', pause: 5200, breathe: 'out' },
        { text: 'Inhale...', pause: 5200, breathe: 'in'  },
        { text: 'Exhale...', pause: 5200, breathe: 'out' },
        { text: 'One last deep inhale...', pause: 5200, breathe: 'in'  },
        { text: 'And exhale... slowly... completely.', pause: 6000, breathe: 'out' },
        { text: 'Well done. You\'ve just completed five minutes of cardiac coherence. Take a moment to notice how you feel.', pause: 5000 },
        { text: 'When you\'re ready, gently open your eyes.', pause: 3000 },
      ],
    },
  },

  // ── 2. Scan corporel ──────────────────────────────────────────────────────
  {
    id: 'body-scan',
    emoji: '🧘',
    duration: '5 min',
    topics: ['sommeil', 'tristesse', 'corps'],
    color: '#6366f1',
    title:  { fr: 'Scan corporel',          en: 'Body scan'           },
    desc:   {
      fr: 'Relâche les tensions de la tête aux pieds. Idéal avant de dormir (TCC-I).',
      en: 'Release tension from head to toe. Perfect before sleep (CBT-I).',
    },
    script: {
      fr: [
        { text: 'Allonge-toi confortablement. Laisse ton corps peser sur la surface sous toi.', pause: 4500 },
        { text: 'Ferme les yeux. Respire naturellement.', pause: 3000 },
        { text: 'Nous allons parcourir ton corps des pieds jusqu\'à la tête, en relâchant chaque zone.', pause: 4000 },
        { text: 'Porte ton attention sur tes pieds. Sens leur contact avec le sol ou le lit. Relâche-les complètement.', pause: 5500, breathe: 'out' },
        { text: 'Monte vers tes mollets et tes genoux. Sens leur poids. Laisse-les se détendre.', pause: 5500, breathe: 'out' },
        { text: 'Tes cuisses maintenant. Sens le contact avec la surface. Relâche.', pause: 5000, breathe: 'out' },
        { text: 'Ton bassin, tes hanches. Inspire... et en expirant, relâche complètement cette zone.', pause: 6000, breathe: 'out' },
        { text: 'Ton ventre. Sens-le se soulever et s\'abaisser avec ta respiration. Laisse-le se détendre.', pause: 5500, breathe: 'out' },
        { text: 'Ta poitrine. À chaque expiration, laisse-la s\'alourdir agréablement.', pause: 5500, breathe: 'out' },
        { text: 'Ton dos, de bas en haut. Tous les muscles qui soutiennent ta colonne. Laisse-les partir.', pause: 5500, breathe: 'out' },
        { text: 'Tes épaules. C\'est souvent là que le stress se loge. Laisse-les descendre, loin de tes oreilles.', pause: 5500, breathe: 'out' },
        { text: 'Tes bras, tes coudes, tes avant-bras, tes mains, jusqu\'au bout de tes doigts. Tout relâché.', pause: 5500, breathe: 'out' },
        { text: 'Ton cou. Devant, derrière, sur les côtés. Relâche doucement.', pause: 5000, breathe: 'out' },
        { text: 'Ton visage. Tes mâchoires, laisse tes dents se décoller légèrement. Tes joues. Tes yeux, sans effort. Ton front, lisse.', pause: 6000, breathe: 'out' },
        { text: 'Tout ton corps est maintenant lourd et détendu. Tu es en sécurité.', pause: 5000 },
        { text: 'Reste dans cet état aussi longtemps que tu le souhaites. Bonne nuit.', pause: 4000 },
      ],
      en: [
        { text: 'Lie down comfortably. Let your body sink into the surface beneath you.', pause: 4500 },
        { text: 'Close your eyes. Breathe naturally.', pause: 3000 },
        { text: 'We\'ll scan your body from feet to head, releasing tension in each area.', pause: 4000 },
        { text: 'Bring your attention to your feet. Feel their contact with the floor or bed. Let them go completely.', pause: 5500, breathe: 'out' },
        { text: 'Move up to your calves and knees. Feel their weight. Let them relax.', pause: 5500, breathe: 'out' },
        { text: 'Your thighs now. Feel the contact with the surface. Release.', pause: 5000, breathe: 'out' },
        { text: 'Your pelvis and hips. Breathe in... and as you breathe out, release this area completely.', pause: 6000, breathe: 'out' },
        { text: 'Your belly. Feel it rise and fall with your breath. Let it soften.', pause: 5500, breathe: 'out' },
        { text: 'Your chest. With each exhale, let it grow pleasantly heavy.', pause: 5500, breathe: 'out' },
        { text: 'Your back, from bottom to top. All the muscles supporting your spine. Let them go.', pause: 5500, breathe: 'out' },
        { text: 'Your shoulders. This is often where stress hides. Let them drop away from your ears.', pause: 5500, breathe: 'out' },
        { text: 'Your arms, elbows, forearms, hands, all the way to your fingertips. Completely released.', pause: 5500, breathe: 'out' },
        { text: 'Your neck. Front, back, sides. Gently release.', pause: 5000, breathe: 'out' },
        { text: 'Your face. Let your jaw relax, teeth slightly apart. Your cheeks. Your eyes, effortless. Your forehead, smooth.', pause: 6000, breathe: 'out' },
        { text: 'Your whole body is now heavy and relaxed. You are safe.', pause: 5000 },
        { text: 'Stay in this state as long as you wish. Good night.', pause: 4000 },
      ],
    },
  },

  // ── 3. Ancrage 5-4-3-2-1 ─────────────────────────────────────────────────
  {
    id: 'grounding',
    emoji: '🌿',
    duration: '3 min',
    topics: ['stress', 'colere', 'default'],
    color: '#0d9488',
    title: { fr: 'Ancrage 5-4-3-2-1',        en: '5-4-3-2-1 Grounding'         },
    desc:  {
      fr: 'Coupe le circuit de l\'anxiété en revenant au moment présent (MBSR).',
      en: 'Break the anxiety loop by returning to the present moment (MBSR).',
    },
    script: {
      fr: [
        { text: 'Assieds-toi confortablement, les pieds à plat sur le sol si possible.', pause: 3500 },
        { text: 'Cette technique d\'ancrage va te ramener dans le moment présent en quelques minutes.', pause: 3500 },
        { text: 'Ouvre les yeux, ou garde-les légèrement entrouverts.', pause: 2500 },
        { text: 'Étape un : nomme cinq choses que tu vois autour de toi. Prends le temps de vraiment les regarder.', pause: 9000 },
        { text: 'Étape deux : nomme quatre choses que tu entends. Les sons proches, les sons lointains.', pause: 9000 },
        { text: 'Étape trois : nomme trois choses que tu peux toucher. Sens la texture de chacune.', pause: 9000 },
        { text: 'Étape quatre : nomme deux choses que tu sens, ou cherche une odeur dans l\'air autour de toi.', pause: 8000 },
        { text: 'Étape cinq : nomme une chose que tu goûtes, ou remarque simplement le goût de ta bouche en ce moment.', pause: 7000 },
        { text: 'Inspire lentement...', pause: 4500, breathe: 'in'  },
        { text: 'Expire lentement...', pause: 4500, breathe: 'out' },
        { text: 'Tu es ici, maintenant. L\'anxiété diminue chaque fois que tu reviens au présent. Bravo.', pause: 4000 },
      ],
      en: [
        { text: 'Sit comfortably with your feet flat on the floor if possible.', pause: 3500 },
        { text: 'This grounding technique will bring you back to the present moment in just a few minutes.', pause: 3500 },
        { text: 'Keep your eyes open or slightly open.', pause: 2500 },
        { text: 'Step one: name five things you can see around you. Take your time to really look at each one.', pause: 9000 },
        { text: 'Step two: name four things you can hear. Nearby sounds, distant sounds.', pause: 9000 },
        { text: 'Step three: name three things you can touch. Feel the texture of each one.', pause: 9000 },
        { text: 'Step four: name two things you can smell, or search for a scent in the air around you.', pause: 8000 },
        { text: 'Step five: name one thing you can taste, or simply notice the taste in your mouth right now.', pause: 7000 },
        { text: 'Breathe in slowly...', pause: 4500, breathe: 'in'  },
        { text: 'Breathe out slowly...', pause: 4500, breathe: 'out' },
        { text: 'You are here, now. Anxiety decreases each time you return to the present. Well done.', pause: 4000 },
      ],
    },
  },

  // ── 4. Endormissement progressif ──────────────────────────────────────────
  {
    id: 'sleep',
    emoji: '🌙',
    duration: '4 min',
    topics: ['sommeil', 'tristesse'],
    color: '#475569',
    title: { fr: 'Endormissement progressif', en: 'Progressive sleep'  },
    desc:  {
      fr: 'Relâche ton esprit et prépare ton corps au sommeil.',
      en: 'Quiet your mind and prepare your body for sleep.',
    },
    script: {
      fr: [
        { text: 'Allonge-toi dans ton lit, dans ta position préférée pour dormir.', pause: 4000 },
        { text: 'Ferme les yeux. Laisse ton corps peser lourdement sur le matelas.', pause: 4000 },
        { text: 'Respire lentement. Chaque expiration t\'emmène un peu plus loin dans la détente.', pause: 4000 },
        { text: 'Imagine que tu es dans un endroit calme et sûr. Une forêt, une plage, une pièce chaleureuse.', pause: 5000 },
        { text: 'Dans cet endroit, il fait exactement la bonne température. Tu es en sécurité.', pause: 4500 },
        { text: 'Inspire doucement...', pause: 4500, breathe: 'in'  },
        { text: 'Expire... et laisse aller les pensées de la journée. Elles peuvent attendre demain.', pause: 5500, breathe: 'out' },
        { text: 'Tes pensées sont comme des vagues qui s\'éloignent du rivage. Tu les regardes partir, sans les suivre.', pause: 5500 },
        { text: 'Inspire...', pause: 4500, breathe: 'in'  },
        { text: 'Expire... ton corps devient plus lourd... plus détendu...', pause: 5500, breathe: 'out' },
        { text: 'Il n\'y a rien à faire. Nulle part où aller. Juste ce moment. Juste ce repos.', pause: 5000 },
        { text: 'Inspire doucement...', pause: 4500, breathe: 'in'  },
        { text: 'Expire... tu glisses doucement vers le sommeil...', pause: 6000, breathe: 'out' },
        { text: 'Bonne nuit.', pause: 3000 },
      ],
      en: [
        { text: 'Lie down in your bed in your preferred sleeping position.', pause: 4000 },
        { text: 'Close your eyes. Let your body sink heavily into the mattress.', pause: 4000 },
        { text: 'Breathe slowly. Each exhale takes you a little deeper into relaxation.', pause: 4000 },
        { text: 'Imagine you are in a calm, safe place. A forest, a beach, a cozy room.', pause: 5000 },
        { text: 'In this place, the temperature is just right. You are safe.', pause: 4500 },
        { text: 'Breathe in gently...', pause: 4500, breathe: 'in'  },
        { text: 'Breathe out... and let go of the thoughts of the day. They can wait until tomorrow.', pause: 5500, breathe: 'out' },
        { text: 'Your thoughts are like waves drifting away from the shore. You watch them go, without following them.', pause: 5500 },
        { text: 'Breathe in...', pause: 4500, breathe: 'in'  },
        { text: 'Breathe out... your body grows heavier... more relaxed...', pause: 5500, breathe: 'out' },
        { text: 'There is nothing to do. Nowhere to go. Just this moment. Just this rest.', pause: 5000 },
        { text: 'Breathe in gently...', pause: 4500, breathe: 'in'  },
        { text: 'Breathe out... drifting softly into sleep...', pause: 6000, breathe: 'out' },
        { text: 'Good night.', pause: 3000 },
      ],
    },
  },

  // ── 5. Gratitude du soir ─────────────────────────────────────────────────
  {
    id: 'gratitude',
    emoji: '🙏',
    duration: '3 min',
    topics: ['tristesse', 'motivation', 'default'],
    color: '#f59e0b',
    title: { fr: 'Gratitude du soir',    en: 'Evening gratitude'        },
    desc:  {
      fr: 'Termine la journée sur une note positive. Basé sur les travaux de Seligman.',
      en: 'End the day on a positive note. Based on Seligman\'s research.',
    },
    script: {
      fr: [
        { text: 'Installe-toi confortablement. Prends un moment pour toi avant de clore cette journée.', pause: 4000 },
        { text: 'Ferme les yeux. Inspire lentement.', pause: 3500, breathe: 'in'  },
        { text: 'Expire. Laisse les tensions de la journée s\'évaporer.', pause: 4500, breathe: 'out' },
        { text: 'Je vais te poser trois questions. Prends le temps de vraiment y répondre, intérieurement.', pause: 4000 },
        { text: 'Première question : quelle est une chose qui s\'est bien passée aujourd\'hui, même toute petite ?', pause: 9000 },
        { text: 'Deuxième question : quelle est une personne qui t\'a fait du bien aujourd\'hui, ou à qui tu as fait du bien ?', pause: 9000 },
        { text: 'Troisième question : de quoi es-tu reconnaissant·e dans ta vie en ce moment ?', pause: 9000 },
        { text: 'Ces trois choses sont réelles. Elles font partie de ta vie, ce soir.', pause: 4500 },
        { text: 'Inspire une dernière fois...', pause: 4500, breathe: 'in'  },
        { text: 'Expire... et garde ces pensées douces avec toi pour la nuit.', pause: 5500, breathe: 'out' },
        { text: 'Merci d\'avoir pris ce temps pour toi. Bonne nuit.', pause: 3000 },
      ],
      en: [
        { text: 'Find a comfortable position. Take a moment for yourself before closing this day.', pause: 4000 },
        { text: 'Close your eyes. Breathe in slowly.', pause: 3500, breathe: 'in'  },
        { text: 'Breathe out. Let the tensions of the day evaporate.', pause: 4500, breathe: 'out' },
        { text: 'I\'ll ask you three questions. Take your time to truly answer each one, inwardly.', pause: 4000 },
        { text: 'First question: what is one thing that went well today, however small?', pause: 9000 },
        { text: 'Second question: who made you feel good today, or who did you make feel good?', pause: 9000 },
        { text: 'Third question: what are you grateful for in your life right now?', pause: 9000 },
        { text: 'These three things are real. They are part of your life, tonight.', pause: 4500 },
        { text: 'Breathe in one last time...', pause: 4500, breathe: 'in'  },
        { text: 'Breathe out... and carry these gentle thoughts into the night.', pause: 5500, breathe: 'out' },
        { text: 'Thank you for taking this time for yourself. Good night.', pause: 3000 },
      ],
    },
  },
]

export function getMeditation(id) {
  return MEDITATIONS.find(m => m.id === id) ?? MEDITATIONS[0]
}

/** Méditations pertinentes pour un thème donné */
export function getMeditationsForTopic(topic) {
  return MEDITATIONS.filter(m => m.topics.includes(topic))
}
