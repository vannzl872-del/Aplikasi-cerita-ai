import sceneImage1 from '../assets/images/scout_scene_one_1791902086727.jpg';
import sceneImage2 from '../assets/images/scout_scene_two_1791902088092.jpg';
import sceneImage3 from '../assets/images/scout_scene_three_1791902088344.jpg';
import sceneImage4 from '../assets/images/scout_scene_four_1791902088527.jpg';
import sceneImage5 from '../assets/images/scout_scene_five_1791902089878.jpg';
import sceneImage6 from '../assets/images/scout_scene_six_1791902089337.jpg';

export interface SceneData {
  id: number;
  panelNumber: number;
  titleId: string;
  titleEn: string;
  image: string;
  durationSec: number;
  cameraStyle: 'pan-left-to-right' | 'zoom-in-dramatic' | 'pull-back-wide' | 'gentle-drift-in' | 'celestial-glow-zoom' | 'epic-slow-dolly';
  dialogueId: {
    speaker: string;
    text: string;
    badge?: string;
  }[];
  dialogueEn: {
    speaker: string;
    text: string;
  }[];
  directorNotes: string;
  audioProfile: {
    ambience: 'forest_night' | 'intense_fort' | 'warm_wood' | 'magic_spark' | 'campfire_peace';
    sfx: string[];
    bgmMood: 'tense_rivalry' | 'dramatic_pull' | 'sudden_interruption' | 'calm_encouragement' | 'magical_revelation' | 'heartwarming_unity';
  };
  moralQuote?: {
    main: string;
    chapter: string;
    translation: string;
  };
}

export const SCOUT_SCENES: SceneData[] = [
  {
    id: 1,
    panelNumber: 1,
    titleId: 'Perdebatan di Pos Benteng Kosong',
    titleEn: 'Dispute at the Empty Fort Post',
    image: sceneImage1,
    durationSec: 6.5,
    cameraStyle: 'pan-left-to-right',
    dialogueId: [
      {
        speaker: 'Candra',
        text: 'Kami sampai duluan! Kertas petunjuk ini milik kami!',
        badge: 'CANDRA'
      },
      {
        speaker: 'Rizki',
        text: 'Itu cuma sobekan! Kami punya setengahnya lagi!',
        badge: 'RIZKI'
      }
    ],
    dialogueEn: [
      {
        speaker: 'Candra',
        text: 'We arrived first! This clue paper belongs to us!'
      },
      {
        speaker: 'Rizki',
        text: "That's just a torn half! We have the other half!"
      }
    ],
    directorNotes: 'Two young scouts, Candra and Rizki, argue heatedly outside Pos Benteng Kosong under warm lantern light, brandishing torn parchment pieces.',
    audioProfile: {
      ambience: 'forest_night',
      sfx: ['forest_crickets', 'heavy_footstep', 'parchment_wave'],
      bgmMood: 'tense_rivalry'
    }
  },
  {
    id: 2,
    panelNumber: 2,
    titleId: 'Perebutan Peta yang Terbelah',
    titleEn: 'Tugging the Torn Map',
    image: sceneImage2,
    durationSec: 5.5,
    cameraStyle: 'zoom-in-dramatic',
    dialogueId: [
      {
        speaker: 'Candra & Rizki',
        text: '*Menarik peta dengan emosi dan saling berebut*',
        badge: 'KETEGANGAN'
      }
    ],
    dialogueEn: [
      {
        speaker: 'Candra & Rizki',
        text: '*Aggressively pulling the map pieces apart in stubborn frustration*'
      }
    ],
    directorNotes: 'Close-up on hands and intense facial expressions. The parchment strains and threatens to tear further as ego and rivalry peak.',
    audioProfile: {
      ambience: 'intense_fort',
      sfx: ['paper_strain_rip', 'dramatic_impact', 'heavy_breath'],
      bgmMood: 'dramatic_pull'
    }
  },
  {
    id: 3,
    panelNumber: 3,
    titleId: 'Langkah Tegas Sang Pramuka Putri',
    titleEn: "Rana's Decisive Intervention",
    image: sceneImage3,
    durationSec: 6.0,
    cameraStyle: 'pull-back-wide',
    dialogueId: [
      {
        speaker: 'Rana',
        text: 'Berhenti! Kalian tak bisa membacanya kalau saling berebut!',
        badge: 'RANA'
      }
    ],
    dialogueEn: [
      {
        speaker: 'Rana',
        text: "Stop! You won't be able to read it if you keep fighting each other!"
      }
    ],
    directorNotes: 'Rana steps firmly between Candra and Rizki with palms raised. The confrontation instantly freezes; both boys pause in shock.',
    audioProfile: {
      ambience: 'warm_wood',
      sfx: ['scout_whistle_soft', 'firm_step', 'whoosh_stop'],
      bgmMood: 'sudden_interruption'
    }
  },
  {
    id: 4,
    panelNumber: 4,
    titleId: 'Pesan Bijak Tentang Kolaborasi',
    titleEn: 'Wisdom of Collaboration',
    image: sceneImage4,
    durationSec: 6.5,
    cameraStyle: 'gentle-drift-in',
    dialogueId: [
      {
        speaker: 'Rana',
        text: 'Sini, gabungkan. Persaingan itu wajar, tapi kolaborasi membawa kita lebih jauh.',
        badge: 'RANA'
      }
    ],
    dialogueEn: [
      {
        speaker: 'Rana',
        text: 'Come here, combine them. Competition is natural, but collaboration takes us much further.'
      }
    ],
    directorNotes: 'Rana calmly aligns the parchment pieces over the wooden fort table. The boys lean in closely, hostility replaced by curiosity.',
    audioProfile: {
      ambience: 'warm_wood',
      sfx: ['wood_table_tap', 'gentle_paper_slide', 'soft_breeze'],
      bgmMood: 'calm_encouragement'
    }
  },
  {
    id: 5,
    panelNumber: 5,
    titleId: 'Cahaya Emas Peta Rahasia',
    titleEn: 'Golden Glow of the Unified Map',
    image: sceneImage5,
    durationSec: 7.0,
    cameraStyle: 'celestial-glow-zoom',
    dialogueId: [
      {
        speaker: 'Candra & Rizki',
        text: 'Wahh...! Petanya bersinar! Jalur rahasianya terbuka!',
        badge: 'KAGUM'
      }
    ],
    dialogueEn: [
      {
        speaker: 'Candra & Rizki',
        text: 'Whoa...! The map is glowing! The secret trail is revealed!'
      }
    ],
    directorNotes: 'The torn edges seam together seamlessly with an ethereal golden luminescence and floating light motes, illuminating joyful, astonished faces.',
    audioProfile: {
      ambience: 'magic_spark',
      sfx: ['golden_magic_chime', 'celestial_swell', 'scout_gasp_awe'],
      bgmMood: 'magical_revelation'
    }
  },
  {
    id: 6,
    panelNumber: 6,
    titleId: 'Kemenangan Sejati: Persatuan Pramuka',
    titleEn: 'True Victory: Scout Unity & Harmony',
    image: sceneImage6,
    durationSec: 8.5,
    cameraStyle: 'epic-slow-dolly',
    dialogueId: [
      {
        speaker: 'Semua Pramuka',
        text: 'Bersama, kita bisa menemukan harta karun ini!',
        badge: 'BERSAMA'
      }
    ],
    dialogueEn: [
      {
        speaker: 'All Scouts',
        text: 'Together, we can discover this treasure!'
      }
    ],
    directorNotes: 'Stable, heartwarming cinematic group portrait of Candra, Rana, and Rizki holding the completed glowing map beneath the stars and glowing campfire.',
    audioProfile: {
      ambience: 'campfire_peace',
      sfx: ['campfire_crackle', 'warm_night_wind', 'inspirational_strings'],
      bgmMood: 'heartwarming_unity'
    },
    moralQuote: {
      main: 'Kekuatan terbesarmu mungkin adalah bakat yang paling jarang kau pamerkan. Kolaborasi akan selalu mengalahkan ego persaingan semata.',
      chapter: 'Bagian 2: Mengatasi Ketakutan Terbesar',
      translation: 'Your greatest strength may be the talent you rarely show off. Collaboration will always overcome mere competitive ego.'
    }
  }
];

export const TOTAL_STORY_DURATION = SCOUT_SCENES.reduce((acc, s) => acc + s.durationSec, 0);
