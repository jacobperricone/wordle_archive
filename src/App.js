import { useEffect, useState, useRef } from 'react'
import { letters, status } from './constants'
import { Keyboard } from './components/Keyboard'
import words from './data/words'

import { useLocalStorage } from './hooks/useLocalStorage'
import { ReactComponent as Info } from './data/Info.svg'
import { ReactComponent as Settings } from './data/Settings.svg'
import { ReactComponent as Share } from './data/Share.svg'

import { InfoModal } from './components/InfoModal'
import { SettingsModal } from './components/SettingsModal'
import { EndGameModal } from './components/EndGameModal'

import { Menu } from '@headlessui/react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const state = {
  playing: 'playing',
  won: 'won',
  lost: 'lost',
}

const getDayAnswer = (day_) => {
  return wordle_answers[day_-1].toUpperCase()
}

// Set the day number of the puzzle to display and show it as the address bar query string

const setDay = newDay => {
  if (newDay < 1) return;
  day = newDay;
  window.history.pushState({}, '', '?' + day);
};

const getDay = (og_day) => {
  const { search } = document.location;
  var url_day = og_day
  if (search) {
    if (isNaN(search.slice(1))) {
      url_day = og_day
    } else {
      url_day = parseInt(search.slice(1), 10);
    }
    // if (url_day > og_day || url_day < 1) {
    //   url_day = og_day
    // }
    return url_day
  }
  else {
    return og_day
  }
}

const getOGDay = () => {
  const today = new Date()
  const date1 = new Date('2/24/22')
  const diffTime = Math.abs(today - date1)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getIsSavedSolution = () => {
  const gameStateList = JSON.parse(localStorage.getItem('gameStateList'))

  if (gameStateList) {
    const dayState = gameStateList[day-1]
    return dayState && dayState.state === state.won && dayState.board !== null
  }

  return false;
}

const getIsClearedSolution = (day_) => {
  const gameStateList = JSON.parse(localStorage.getItem('gameStateList'))

  if (gameStateList) {
    const dayState = gameStateList[day_-1]
    return dayState?.state === state.won && dayState?.board === null
  }

  return false;
}

const calculateScore = (day_) => {
  const gameStateList = JSON.parse(localStorage.getItem('gameStateList'))

  if (gameStateList) {
    const dayState = gameStateList[day_-1];
    const board = dayState?.board;

    // puzzle was solved before we tracked board state in
    // local storage. we'll still show the solved puzzle
    // (on first row) but don't show score since its unknown
    if (dayState?.scoreUnknown) {
      return '';
    }

    const numGuesses = board
      ? board
        .flatMap(row => row.join('') ? 1 : 0)
        .reduce((acc, curr) => acc + curr, 0)
      : null;

    return numGuesses ? `${numGuesses}/6` : '';
  }

  return '';
}

// check if gameStateList is old gameStateList shape (array of strings) and
// update to new shape (array of objects w/ state and board). if a user has
// solved a puzzle before this feature was implemented we will show the answer
// on the first row since we don't know how many guesses they took to win
const oneTimeGameStateListUpdate = (stringGameStateList) => {
  const objectGameStateList = stringGameStateList.map((gameState, idx) => {
    if (gameState === state.won) {
      return {
        state: state.won,
        scoreUnknown: true,
        board: new Array(6)
          .fill(wordle_answers[idx].toUpperCase().split(''), 0, 1)
          .fill(new Array(5).fill(''), 1)
      }
    }

    return {
      state: gameState,
      board: null
    }
  });

  localStorage.setItem('gameStateList', JSON.stringify(objectGameStateList));
}

// const wordle_answers = ["rebut", "sissy", "humph", "awake", "blush", "focal", "evade", "naval", "serve", "heath", "dwarf", "model", "karma", "stink", "grade", "quiet", "bench", "abate", "feign", "major", "death", "fresh", "crust", "stool", "colon", "abase", "marry", "react", "batty", "pride", "floss", "helix", "croak", "staff", "paper", "unfed", "whelp", "trawl", "outdo", "adobe", "crazy", "sower", "repay", "digit", "crate", "cluck", "spike", "mimic", "pound", "maxim", "linen", "unmet", "flesh", "booby", "forth", "first", "stand", "belly", "ivory", "seedy", "print", "yearn", "drain", "bribe", "stout", "panel", "crass", "flume", "offal", "agree", "error", "swirl", "argue", "bleed", "delta", "flick", "totem", "wooer", "front", "shrub", "parry", "biome", "lapel", "start", "greet", "goner", "golem", "lusty", "loopy", "round", "audit", "lying", "gamma", "labor", "islet", "civic", "forge", "corny", "moult", "basic", "salad", "agate", "spicy", "spray", "essay", "fjord", "spend", "kebab", "guild", "aback", "motor", "alone", "hatch", "hyper", "thumb", "dowry", "ought", "belch", "dutch", "pilot", "tweed", "comet", "jaunt", "enema", "steed", "abyss", "growl", "fling", "dozen", "boozy", "erode", "world", "gouge", "click", "briar", "great", "altar", "pulpy", "blurt", "coast", "duchy", "groin", "fixer", "group", "rogue", "badly", "smart", "pithy", "gaudy", "chill", "heron", "vodka", "finer", "surer", "radio", "rouge", "perch", "retch", "wrote", "clock", "tilde", "store", "prove", "bring", "solve", "cheat", "grime", "exult", "usher", "epoch", "triad", "break", "rhino", "viral", "conic", "masse", "sonic", "vital", "trace", "using", "peach", "champ", "baton", "brake", "pluck", "craze", "gripe", "weary", "picky", "acute", "ferry", "aside", "tapir", "troll", "unify", "rebus", "boost", "truss", "siege", "tiger", "banal", "slump", "crank", "gorge", "query", "drink", "favor", "abbey", "tangy", "panic", "solar", "shire", "proxy", "point", "robot", "prick", "wince", "crimp", "knoll", "sugar", "whack", "mount", "perky", "could", "wrung", "light", "those", "moist", "shard", "pleat", "aloft", "skill", "elder", "frame", "humor", "pause", "ulcer", "ultra", "robin", "cynic", "aroma", "caulk", "shake", "dodge", "swill", "tacit", "other", "thorn", "trove", "bloke", "vivid", "spill", "chant", "choke", "rupee", "nasty", "mourn", "ahead", "brine", "cloth", "hoard", "sweet", "month", "lapse", "watch", "today", "focus", "smelt", "tease", "cater", "movie", "saute", "allow", "renew", "their", "slosh", "purge", "chest", "depot", "epoxy", "nymph", "found", "shall", "harry", "stove", "lowly", "snout", "trope", "fewer", "shawl", "natal", "comma", "foray", "scare", "stair", "black", "squad", "royal", "chunk", "mince", "shame", "cheek", "ample", "flair", "foyer", "cargo", "oxide", "plant", "olive", "inert", "askew", "heist", "shown", "zesty", "hasty", "trash", "fella", "larva", "forgo", "story", "hairy", "train", "homer", "badge", "midst", "canny", "fetus", "butch", "farce", "slung", "tipsy", "metal", "yield", "delve", "being", "scour", "glass", "gamer", "scrap", "money", "hinge", "album", "vouch", "asset", "tiara", "crept", "bayou", "atoll", "manor", "creak", "showy", "phase", "froth", "depth", "gloom", "flood", "trait", "girth", "piety", "payer", "goose", "float", "donor", "atone", "primo", "apron", "blown", "cacao", "loser", "input", "gloat", "awful", "brink", "smite", "beady", "rusty", "retro", "droll", "gawky", "hutch", "pinto", "gaily", "egret", "lilac", "sever", "field", "fluff", "hydro", "flack", "agape", "voice", "stead", "stalk", "berth", "madam", "night", "bland", "liver", "wedge", "augur", "roomy", "wacky", "flock", "angry", "bobby", "trite", "aphid", "tryst", "midge", "power", "elope", "cinch", "motto", "stomp", "upset", "bluff", "cramp", "quart", "coyly", "youth", "rhyme", "buggy", "alien", "smear", "unfit", "patty", "cling", "glean", "label", "hunky", "khaki", "poker", "gruel", "twice", "twang", "shrug", "treat", "unlit", "waste", "merit", "woven", "octal", "needy", "clown", "widow", "irony", "ruder", "gauze", "chief", "onset", "prize", "fungi", "charm", "gully", "inter", "whoop", "taunt", "leery", "class", "theme", "lofty", "tibia", "booze", "alpha", "thyme", "eclat", "doubt", "parer", "chute", "stick", "trice", "alike", "sooth", "recap", "saint", "liege", "glory", "grate", "admit", "brisk", "soggy", "usurp", "scald", "scorn", "leave", "twine", "sting", "bough", "marsh", "sloth", "dandy", "vigor", "howdy", "enjoy"]
const wordle_answers = ['BLOKE', 'VIVID', 'SPILL', 'CHANT', 'CHOKE', 'RUPEE', 'NASTY', 'MOURN', 'AHEAD', 'BRINE', 'CLOTH', 'HOARD', 'SWEET', 'MONTH', 'LAPSE', 'WATCH', 'TODAY', 'FOCUS', 'SMELT', 'TEASE', 'CATER', 'MOVIE', 'LYNCH', 'SAUTE', 'ALLOW', 'RENEW', 'THEIR', 'SLOSH', 'PURGE', 'CHEST', 'DEPOT', 'EPOXY', 'NYMPH', 'FOUND', 'SHALL', 'HARRY', 'STOVE', 'LOWLY', 'SNOUT', 'TROPE', 'FEWER', 'SHAWL', 'NATAL', 'FIBRE', 'COMMA', 'FORAY', 'SCARE', 'STAIR', 'BLACK', 'SQUAD', 'ROYAL', 'CHUNK', 'MINCE', 'SLAVE', 'SHAME', 'CHEEK', 'AMPLE', 'FLAIR', 'FOYER', 'CARGO', 'OXIDE', 'PLANT', 'OLIVE', 'INERT', 'ASKEW', 'HEIST', 'SHOWN', 'ZESTY', 'HASTY', 'TRASH', 'FELLA', 'LARVA', 'FORGO', 'STORY', 'HAIRY', 'TRAIN', 'HOMER', 'BADGE', 'MIDST', 'CANNY', 'FETUS', 'BUTCH', 'FARCE', 'SLUNG', 'TIPSY', 'METAL', 'YIELD', 'DELVE', 'BEING', 'SCOUR', 'GLASS', 'GAMER', 'SCRAP', 'MONEY', 'HINGE', 'ALBUM', 'VOUCH', 'ASSET', 'TIARA', 'CREPT', 'BAYOU', 'ATOLL', 'MANOR', 'CREAK', 'SHOWY', 'PHASE', 'FROTH', 'DEPTH', 'GLOOM', 'FLOOD', 'TRAIT', 'GIRTH', 'PIETY', 'PAYER', 'GOOSE', 'FLOAT', 'DONOR', 'ATONE', 'PRIMO', 'APRON', 'BLOWN', 'CACAO', 'LOSER', 'INPUT', 'GLOAT', 'AWFUL', 'BRINK', 'SMITE', 'BEADY', 'RUSTY', 'RETRO', 'DROLL', 'GAWKY', 'HUTCH', 'PINTO', 'GAILY', 'EGRET', 'LILAC', 'SEVER', 'FIELD', 'FLUFF', 'HYDRO', 'FLACK', 'AGAPE', 'WENCH', 'VOICE', 'STEAD', 'STALK', 'BERTH', 'MADAM', 'NIGHT', 'BLAND', 'LIVER', 'WEDGE', 'AUGUR', 'ROOMY', 'WACKY', 'FLOCK', 'ANGRY', 'BOBBY', 'TRITE', 'APHID', 'TRYST', 'MIDGE', 'POWER', 'ELOPE', 'CINCH', 'MOTTO', 'STOMP', 'UPSET', 'BLUFF', 'CRAMP', 'QUART', 'COYLY', 'YOUTH', 'RHYME', 'BUGGY', 'ALIEN', 'SMEAR', 'UNFIT', 'PATTY', 'CLING', 'GLEAN', 'LABEL', 'HUNKY', 'KHAKI', 'POKER', 'GRUEL', 'TWICE', 'TWANG', 'SHRUG', 'TREAT', 'UNLIT', 'WASTE', 'MERIT', 'WOVEN', 'OCTAL', 'NEEDY', 'CLOWN', 'WIDOW', 'IRONY', 'RUDER', 'GAUZE', 'CHIEF', 'ONSET', 'PRIZE', 'FUNGI', 'CHARM', 'GULLY', 'INTER', 'WHOOP', 'TAUNT', 'LEERY', 'CLASS', 'THEME', 'LOFTY', 'TIBIA', 'BOOZE', 'ALPHA', 'THYME', 'ECLAT', 'DOUBT', 'PARER', 'CHUTE', 'STICK', 'TRICE', 'ALIKE', 'SOOTH', 'RECAP', 'SAINT', 'LIEGE', 'GLORY', 'GRATE', 'ADMIT', 'BRISK', 'SOGGY', 'USURP', 'SCALD', 'SCORN', 'LEAVE', 'TWINE', 'STING', 'BOUGH', 'MARSH', 'SLOTH', 'DANDY', 'VIGOR', 'HOWDY', 'ENJOY', 'VALID', 'IONIC', 'EQUAL', 'UNSET', 'FLOOR', 'CATCH', 'SPADE', 'STEIN', 'EXIST', 'QUIRK', 'DENIM', 'GROVE', 'SPIEL', 'MUMMY', 'FAULT', 'FOGGY', 'FLOUT', 'CARRY', 'SNEAK', 'LIBEL', 'WALTZ', 'APTLY', 'PINEY', 'INEPT', 'ALOUD', 'PHOTO', 'DREAM', 'STALE', 'VOMIT', 'OMBRE', 'FANNY', 'UNITE', 'SNARL', 'BAKER', 'THERE', 'GLYPH', 'POOCH', 'HIPPY', 'SPELL', 'FOLLY', 'LOUSE', 'GULCH', 'VAULT', 'GODLY', 'THREW', 'FLEET', 'GRAVE', 'INANE', 'SHOCK', 'CRAVE', 'SPITE', 'VALVE', 'SKIMP', 'CLAIM', 'RAINY', 'MUSTY', 'PIQUE', 'DADDY', 'QUASI', 'ARISE', 'AGING', 'VALET', 'OPIUM', 'AVERT', 'STUCK', 'RECUT', 'MULCH', 'GENRE', 'PLUME', 'RIFLE', 'COUNT', 'INCUR', 'TOTAL', 'WREST', 'MOCHA', 'DETER', 'STUDY', 'LOVER', 'SAFER', 'RIVET', 'FUNNY', 'SMOKE', 'MOUND', 'UNDUE', 'SEDAN', 'PAGAN', 'SWINE', 'GUILE', 'GUSTY', 'EQUIP', 'TOUGH', 'CANOE', 'CHAOS', 'COVET', 'HUMAN', 'UDDER', 'LUNCH', 'BLAST', 'STRAY', 'MANGA', 'MELEE', 'LEFTY', 'QUICK', 'PASTE', 'GIVEN', 'OCTET', 'RISEN', 'GROAN', 'LEAKY', 'GRIND', 'CARVE', 'LOOSE', 'SADLY', 'SPILT', 'APPLE', 'SLACK', 'HONEY', 'FINAL', 'SHEEN', 'EERIE', 'MINTY', 'SLICK', 'DERBY', 'WHARF', 'SPELT', 'COACH', 'ERUPT', 'SINGE', 'PRICE', 'SPAWN', 'FAIRY', 'JIFFY', 'FILMY', 'STACK', 'CHOSE', 'SLEEP', 'ARDOR', 'NANNY', 'NIECE', 'WOOZY', 'HANDY', 'GRACE', 'DITTO', 'STANK', 'CREAM', 'USUAL', 'DIODE', 'VALOR', 'ANGLE', 'NINJA', 'MUDDY', 'CHASE', 'REPLY', 'PRONE', 'SPOIL', 'HEART', 'SHADE', 'DINER', 'ARSON', 'ONION', 'SLEET', 'DOWEL', 'COUCH', 'PALSY', 'BOWEL', 'SMILE', 'EVOKE', 'CREEK', 'LANCE', 'EAGLE', 'IDIOT', 'SIREN', 'BUILT', 'EMBED', 'AWARD', 'DROSS', 'ANNUL', 'GOODY', 'FROWN', 'PATIO', 'LADEN', 'HUMID', 'ELITE', 'LYMPH', 'EDIFY', 'MIGHT', 'RESET', 'VISIT', 'GUSTO', 'PURSE', 'VAPOR', 'CROCK', 'WRITE', 'SUNNY', 'LOATH', 'CHAFF', 'SLIDE', 'QUEER', 'VENOM', 'STAMP', 'SORRY', 'STILL', 'ACORN', 'APING', 'PUSHY', 'TAMER', 'HATER', 'MANIA', 'AWOKE', 'BRAWN', 'SWIFT', 'EXILE', 'BIRCH', 'LUCKY', 'FREER', 'RISKY', 'GHOST', 'PLIER', 'LUNAR', 'WINCH', 'SNARE', 'NURSE', 'HOUSE', 'BORAX', 'NICER', 'LURCH', 'EXALT', 'ABOUT', 'SAVVY', 'TOXIN', 'TUNIC', 'PRIED', 'INLAY', 'CHUMP', 'LANKY', 'CRESS', 'EATER', 'ELUDE', 'CYCLE', 'KITTY', 'BOULE', 'MORON', 'TENET', 'PLACE', 'LOBBY', 'PLUSH', 'VIGIL', 'INDEX', 'BLINK', 'CLUNG', 'QUALM', 'CROUP', 'CLINK', 'JUICY', 'STAGE', 'DECAY', 'NERVE', 'FLIER', 'SHAFT', 'CROOK', 'CLEAN', 'CHINA', 'RIDGE', 'VOWEL', 'GNOME', 'SNUCK', 'ICING', 'SPINY', 'RIGOR', 'SNAIL', 'FLOWN', 'RABID', 'PROSE', 'THANK', 'POPPY', 'BUDGE', 'FIBER', 'MOLDY', 'DOWDY', 'KNEEL', 'TRACK', 'CADDY', 'QUELL', 'DUMPY', 'PALER', 'SWORE', 'REBAR', 'SCUBA', 'SPLAT', 'FLYER', 'HORNY', 'MASON', 'DOING', 'OZONE', 'AMPLY', 'MOLAR', 'OVARY', 'BESET', 'QUEUE', 'CLIFF', 'MAGIC', 'TRUCE', 'SPORT', 'FRITZ', 'EDICT', 'TWIRL', 'VERSE', 'LLAMA', 'EATEN', 'RANGE', 'WHISK', 'HOVEL', 'REHAB', 'MACAW', 'SIGMA', 'SPOUT', 'VERVE', 'SUSHI', 'DYING', 'FETID', 'BRAIN', 'BUDDY', 'THUMP', 'SCION', 'CANDY', 'CHORD', 'BASIN', 'MARCH', 'CROWD', 'ARBOR', 'GAYLY', 'MUSKY', 'STAIN', 'DALLY', 'BLESS', 'BRAVO', 'STUNG', 'TITLE', 'RULER', 'KIOSK', 'BLOND', 'ENNUI', 'LAYER', 'FLUID', 'TATTY', 'SCORE', 'CUTIE', 'ZEBRA', 'BARGE', 'MATEY', 'BLUER', 'AIDER', 'SHOOK', 'RIVER', 'PRIVY', 'BETEL', 'FRISK', 'BONGO', 'BEGUN', 'AZURE', 'WEAVE', 'GENIE', 'SOUND', 'GLOVE', 'BRAID', 'SCOPE', 'WRYLY', 'ROVER', 'ASSAY', 'OCEAN', 'BLOOM', 'IRATE', 'LATER', 'WOKEN', 'SILKY', 'WRECK', 'DWELT', 'SLATE', 'SMACK', 'SOLID', 'AMAZE', 'HAZEL', 'WRIST', 'JOLLY', 'GLOBE', 'FLINT', 'ROUSE', 'CIVIL', 'VISTA', 'RELAX', 'COVER', 'ALIVE', 'BEECH', 'JETTY', 'BLISS', 'VOCAL', 'OFTEN', 'DOLLY', 'EIGHT', 'JOKER', 'SINCE', 'EVENT', 'ENSUE', 'SHUNT', 'DIVER', 'POSER', 'WORST', 'SWEEP', 'ALLEY', 'CREED', 'ANIME', 'LEAFY', 'BOSOM', 'DUNCE', 'STARE', 'PUDGY', 'WAIVE', 'CHOIR', 'STOOD', 'SPOKE', 'OUTGO', 'DELAY', 'BILGE', 'IDEAL', 'CLASP', 'SEIZE', 'HOTLY', 'LAUGH', 'SIEVE', 'BLOCK', 'MEANT', 'GRAPE', 'NOOSE', 'HARDY', 'SHIED', 'DRAWL', 'DAISY', 'PUTTY', 'STRUT', 'BURNT', 'TULIP', 'CRICK', 'IDYLL', 'VIXEN', 'FUROR', 'GEEKY', 'COUGH', 'NAIVE', 'SHOAL', 'STORK', 'BATHE', 'AUNTY', 'CHECK', 'PRIME', 'BRASS', 'OUTER', 'FURRY', 'RAZOR', 'ELECT', 'EVICT', 'IMPLY', 'DEMUR', 'QUOTA', 'HAVEN', 'CAVIL', 'SWEAR', 'CRUMP', 'DOUGH', 'GAVEL', 'WAGON', 'SALON', 'NUDGE', 'HAREM', 'PITCH', 'SWORN', 'PUPIL', 'EXCEL', 'STONY', 'CABIN', 'UNZIP', 'QUEEN', 'TROUT', 'POLYP', 'EARTH', 'STORM', 'UNTIL', 'TAPER', 'ENTER', 'CHILD', 'ADOPT', 'MINOR', 'FATTY', 'HUSKY', 'BRAVE', 'FILET', 'SLIME', 'GLINT', 'TREAD', 'STEAL', 'REGAL', 'GUEST', 'EVERY', 'MURKY', 'SHARE', 'SPORE', 'HOIST', 'BUXOM', 'INNER', 'OTTER', 'DIMLY', 'LEVEL', 'SUMAC', 'DONUT', 'STILT', 'ARENA', 'SHEET', 'SCRUB', 'FANCY', 'SLIMY', 'PEARL', 'SILLY', 'PORCH', 'DINGO', 'SEPIA', 'AMBLE', 'SHADY', 'BREAD', 'FRIAR', 'REIGN', 'DAIRY', 'QUILL', 'CROSS', 'BROOD', 'TUBER', 'SHEAR', 'POSIT', 'BLANK', 'VILLA', 'SHANK', 'PIGGY', 'FREAK', 'WHICH', 'AMONG', 'FECAL', 'SHELL', 'WOULD', 'ALGAE', 'LARGE', 'RABBI', 'AGONY', 'AMUSE', 'BUSHY', 'COPSE', 'SWOON', 'KNIFE', 'POUCH', 'ASCOT', 'PLANE', 'CROWN', 'URBAN', 'SNIDE', 'RELAY', 'ABIDE', 'VIOLA', 'RAJAH', 'STRAW', 'DILLY', 'CRASH', 'AMASS', 'THIRD', 'TRICK', 'TUTOR', 'WOODY', 'BLURB', 'GRIEF', 'DISCO', 'WHERE', 'SASSY', 'BEACH', 'SAUNA', 'COMIC', 'CLUED', 'CREEP', 'CASTE', 'GRAZE', 'SNUFF', 'FROCK', 'GONAD', 'DRUNK', 'PRONG', 'LURID', 'STEEL', 'HALVE', 'BUYER', 'VINYL', 'UTILE', 'SMELL', 'ADAGE', 'WORRY', 'TASTY', 'LOCAL', 'TRADE', 'FINCH', 'ASHEN', 'MODAL', 'GAUNT', 'CLOVE', 'ENACT', 'ADORN', 'ROAST', 'SPECK', 'SHEIK', 'MISSY', 'GRUNT', 'SNOOP', 'PARTY', 'TOUCH', 'MAFIA', 'EMCEE', 'ARRAY', 'SOUTH', 'VAPID', 'JELLY', 'SKULK', 'ANGST', 'TUBAL', 'LOWER', 'CREST', 'SWEAT', 'CYBER', 'ADORE', 'TARDY', 'SWAMI', 'NOTCH', 'GROOM', 'ROACH', 'HITCH', 'YOUNG', 'ALIGN', 'READY', 'FROND', 'STRAP', 'PUREE', 'REALM', 'VENUE', 'SWARM', 'OFFER', 'SEVEN', 'DRYER', 'DIARY', 'DRYLY', 'DRANK', 'ACRID', 'HEADY', 'THETA', 'JUNTO', 'PIXIE', 'QUOTH', 'BONUS', 'SHALT', 'PENNE', 'AMEND', 'DATUM', 'BUILD', 'PIANO', 'SHELF', 'LODGE', 'SUING', 'REARM', 'CORAL', 'RAMEN', 'WORTH', 'PSALM', 'INFER', 'OVERT', 'MAYOR', 'OVOID', 'GLIDE', 'USAGE', 'POISE', 'RANDY', 'CHUCK', 'PRANK', 'FISHY', 'TOOTH', 'ETHER', 'DROVE', 'IDLER', 'SWATH', 'STINT', 'WHILE', 'BEGAT', 'APPLY', 'SLANG', 'TAROT', 'RADAR', 'CREDO', 'AWARE', 'CANON', 'SHIFT', 'TIMER', 'BYLAW', 'SERUM', 'THREE', 'STEAK', 'ILIAC', 'SHIRK', 'BLUNT', 'PUPPY', 'PENAL', 'JOIST', 'BUNNY', 'SHAPE', 'BEGET', 'WHEEL', 'ADEPT', 'STUNT', 'STOLE', 'TOPAZ', 'CHORE', 'FLUKE', 'AFOOT', 'BLOAT', 'BULLY', 'DENSE', 'CAPER', 'SNEER', 'BOXER', 'JUMBO', 'LUNGE', 'SPACE', 'AVAIL', 'SHORT', 'SLURP', 'LOYAL', 'FLIRT', 'PIZZA', 'CONCH', 'TEMPO', 'DROOP', 'PLATE', 'BIBLE', 'PLUNK', 'AFOUL', 'SAVOY', 'STEEP', 'AGILE', 'STAKE', 'DWELL', 'KNAVE', 'BEARD', 'AROSE', 'MOTIF', 'SMASH', 'BROIL', 'GLARE', 'SHOVE', 'BAGGY', 'MAMMY', 'SWAMP', 'ALONG', 'RUGBY', 'WAGER', 'QUACK', 'SQUAT', 'SNAKY', 'DEBIT', 'MANGE', 'SKATE', 'NINTH', 'JOUST', 'TRAMP', 'SPURN', 'MEDAL', 'MICRO', 'REBEL', 'FLANK', 'LEARN', 'NADIR', 'MAPLE', 'COMFY', 'REMIT', 'GRUFF', 'ESTER', 'LEAST', 'MOGUL', 'FETCH', 'CAUSE', 'OAKEN', 'AGLOW', 'MEATY', 'GAFFE', 'SHYLY', 'RACER', 'PROWL', 'THIEF', 'STERN', 'POESY', 'ROCKY', 'TWEET', 'WAIST', 'SPIRE', 'GROPE', 'HAVOC', 'PATSY', 'TRULY', 'FORTY', 'DEITY', 'UNCLE', 'SWISH', 'GIVER', 'PREEN', 'BEVEL', 'LEMUR', 'DRAFT', 'SLOPE', 'ANNOY', 'LINGO', 'BLEAK', 'DITTY', 'CURLY', 'CEDAR', 'DIRGE', 'GROWN', 'HORDE', 'DROOL', 'SHUCK', 'CRYPT', 'CUMIN', 'STOCK', 'GRAVY', 'LOCUS', 'WIDER', 'BREED', 'QUITE', 'CHAFE', 'CACHE', 'BLIMP', 'DEIGN', 'FIEND', 'LOGIC', 'CHEAP', 'ELIDE', 'RIGID', 'FALSE', 'RENAL', 'PENCE', 'ROWDY', 'SHOOT', 'BLAZE', 'ENVOY', 'POSSE', 'BRIEF', 'NEVER', 'ABORT', 'MOUSE', 'MUCKY', 'SULKY', 'FIERY', 'MEDIA', 'TRUNK', 'YEAST', 'CLEAR', 'SKUNK', 'SCALP', 'BITTY', 'CIDER', 'KOALA', 'DUVET', 'SEGUE', 'CREME', 'SUPER', 'GRILL', 'AFTER', 'OWNER', 'EMBER', 'REACH', 'NOBLY', 'EMPTY', 'SPEED', 'GIPSY', 'RECUR', 'SMOCK', 'DREAD', 'MERGE', 'BURST', 'KAPPA', 'AMITY', 'SHAKY', 'HOVER', 'CAROL', 'SNORT', 'SYNOD', 'FAINT', 'HAUNT', 'FLOUR', 'CHAIR', 'DETOX', 'SHREW', 'TENSE', 'PLIED', 'QUARK', 'BURLY', 'NOVEL', 'WAXEN', 'STOIC', 'JERKY', 'BLITZ', 'BEEFY', 'LYRIC', 'HUSSY', 'TOWEL', 'QUILT', 'BELOW', 'BINGO', 'WISPY', 'BRASH', 'SCONE', 'TOAST', 'EASEL', 'SAUCY', 'VALUE', 'SPICE', 'HONOR', 'ROUTE', 'SHARP', 'BAWDY', 'RADII', 'SKULL', 'PHONY', 'ISSUE', 'LAGER', 'SWELL', 'URINE', 'GASSY', 'TRIAL', 'FLORA', 'UPPER', 'LATCH', 'WIGHT', 'BRICK', 'RETRY', 'HOLLY', 'DECAL', 'GRASS', 'SHACK', 'DOGMA', 'MOVER', 'DEFER', 'SOBER', 'OPTIC', 'CRIER', 'VYING', 'NOMAD', 'FLUTE', 'HIPPO', 'SHARK', 'DRIER', 'OBESE', 'BUGLE', 'TAWNY', 'CHALK', 'FEAST', 'RUDDY', 'PEDAL', 'SCARF', 'CRUEL', 'BLEAT', 'TIDAL', 'SLUSH', 'SEMEN', 'WINDY', 'DUSTY', 'SALLY', 'IGLOO', 'NERDY', 'JEWEL', 'SHONE', 'WHALE', 'HYMEN', 'ABUSE', 'FUGUE', 'ELBOW', 'CRUMB', 'PANSY', 'WELSH', 'SYRUP', 'TERSE', 'SUAVE', 'GAMUT', 'SWUNG', 'DRAKE', 'FREED', 'AFIRE', 'SHIRT', 'GROUT', 'ODDLY', 'TITHE', 'PLAID', 'DUMMY', 'BROOM', 'BLIND', 'TORCH', 'ENEMY', 'AGAIN', 'TYING', 'PESKY', 'ALTER', 'GAZER', 'NOBLE', 'ETHOS', 'BRIDE', 'EXTOL', 'DECOR', 'HOBBY', 'BEAST', 'IDIOM', 'UTTER', 'THESE', 'SIXTH', 'ALARM', 'ERASE', 'ELEGY', 'SPUNK', 'PIPER', 'SCALY', 'SCOLD', 'HEFTY', 'CHICK', 'SOOTY', 'CANAL', 'WHINY', 'SLASH', 'QUAKE', 'JOINT', 'SWEPT', 'PRUDE', 'HEAVY', 'WIELD', 'FEMME', 'LASSO', 'MAIZE', 'SHALE', 'SCREW', 'SPREE', 'SMOKY', 'WHIFF', 'SCENT', 'GLADE', 'SPENT', 'PRISM', 'STOKE', 'RIPER', 'ORBIT', 'COCOA', 'GUILT', 'HUMUS', 'SHUSH', 'TABLE', 'SMIRK', 'WRONG', 'NOISY', 'ALERT', 'SHINY', 'ELATE', 'RESIN', 'WHOLE', 'HUNCH', 'PIXEL', 'POLAR', 'HOTEL', 'SWORD', 'CLEAT', 'MANGO', 'RUMBA', 'PUFFY', 'FILLY', 'BILLY', 'LEASH', 'CLOUT', 'DANCE', 'OVATE', 'FACET', 'CHILI', 'PAINT', 'LINER', 'CURIO', 'SALTY', 'AUDIO', 'SNAKE', 'FABLE', 'CLOAK', 'NAVEL', 'SPURT', 'PESTO', 'BALMY', 'FLASH', 'UNWED', 'EARLY', 'CHURN', 'WEEDY', 'STUMP', 'LEASE', 'WITTY', 'WIMPY', 'SPOOF', 'SANER', 'BLEND', 'SALSA', 'THICK', 'WARTY', 'MANIC', 'BLARE', 'SQUIB', 'SPOON', 'PROBE', 'CREPE', 'KNACK', 'FORCE', 'DEBUT', 'ORDER', 'HASTE', 'TEETH', 'AGENT', 'WIDEN', 'ICILY', 'SLICE', 'INGOT', 'CLASH', 'JUROR', 'BLOOD', 'ABODE', 'THROW', 'UNITY', 'PIVOT', 'SLEPT', 'TROOP', 'SPARE', 'SEWER', 'PARSE', 'MORPH', 'CACTI', 'TACKY', 'SPOOL', 'DEMON', 'MOODY', 'ANNEX', 'BEGIN', 'FUZZY', 'PATCH', 'WATER', 'LUMPY', 'ADMIN', 'OMEGA', 'LIMIT', 'TABBY', 'MACHO', 'AISLE', 'SKIFF', 'BASIS', 'PLANK', 'VERGE', 'BOTCH', 'CRAWL', 'LOUSY', 'SLAIN', 'CUBIC', 'RAISE', 'WRACK', 'GUIDE', 'FOIST', 'CAMEO', 'UNDER', 'ACTOR', 'REVUE', 'FRAUD', 'HARPY', 'SCOOP', 'CLIMB', 'REFER', 'OLDEN', 'CLERK', 'DEBAR', 'TALLY', 'ETHIC', 'CAIRN', 'TULLE', 'GHOUL', 'HILLY', 'CRUDE', 'APART', 'SCALE', 'OLDER', 'PLAIN', 'SPERM', 'BRINY', 'ABBOT', 'RERUN', 'QUEST', 'CRISP', 'BOUND', 'BEFIT', 'DRAWN', 'SUITE', 'ITCHY', 'CHEER', 'BAGEL', 'GUESS', 'BROAD', 'AXIOM', 'CHARD', 'CAPUT', 'LEANT', 'HARSH', 'CURSE', 'PROUD', 'SWING', 'OPINE', 'TASTE', 'LUPUS', 'GUMBO', 'MINER', 'GREEN', 'CHASM', 'LIPID', 'TOPIC', 'ARMOR', 'BRUSH', 'CRANE', 'MURAL', 'ABLED', 'HABIT', 'BOSSY', 'MAKER', 'DUSKY', 'DIZZY', 'LITHE', 'BROOK', 'JAZZY', 'FIFTY', 'SENSE', 'GIANT', 'SURLY', 'LEGAL', 'FATAL', 'FLUNK', 'BEGAN', 'PRUNE', 'SMALL', 'SLANT', 'SCOFF', 'TORUS', 'NINNY', 'COVEY', 'VIPER', 'TAKEN', 'MORAL', 'VOGUE', 'OWING', 'TOKEN', 'ENTRY', 'BOOTH', 'VOTER', 'CHIDE', 'ELFIN', 'EBONY', 'NEIGH', 'MINIM', 'MELON', 'KNEED', 'DECOY', 'VOILA', 'ANKLE', 'ARROW', 'MUSHY', 'TRIBE', 'CEASE', 'EAGER', 'BIRTH', 'GRAPH', 'ODDER', 'TERRA', 'WEIRD', 'TRIED', 'CLACK', 'COLOR', 'ROUGH', 'WEIGH', 'UNCUT', 'LADLE', 'STRIP', 'CRAFT', 'MINUS', 'DICEY', 'TITAN', 'LUCID', 'VICAR', 'DRESS', 'DITCH', 'GYPSY', 'PASTA', 'TAFFY', 'FLAME', 'SWOOP', 'ALOOF', 'SIGHT', 'BROKE', 'TEARY', 'CHART', 'SIXTY', 'WORDY', 'SHEER', 'LEPER', 'NOSEY', 'BULGE', 'SAVOR', 'CLAMP', 'FUNKY', 'FOAMY', 'TOXIC', 'BRAND', 'PLUMB', 'DINGY', 'BUTTE', 'DRILL', 'TRIPE', 'BICEP', 'TENOR', 'KRILL', 'WORSE', 'DRAMA', 'HYENA', 'THINK', 'RATIO', 'COBRA', 'BASIL', 'SCRUM', 'BUSED', 'PHONE', 'COURT', 'CAMEL', 'PROOF', 'HEARD', 'ANGEL', 'PETAL', 'POUTY', 'THROB', 'MAYBE', 'FETAL', 'SPRIG', 'SPINE', 'SHOUT', 'CADET', 'MACRO', 'DODGY', 'SATYR', 'RARER', 'BINGE', 'TREND', 'NUTTY', 'LEAPT', 'AMISS', 'SPLIT', 'MYRRH', 'WIDTH', 'SONAR', 'TOWER', 'BARON', 'FEVER', 'WAVER', 'SPARK', 'BELIE', 'SLOOP', 'EXPEL', 'SMOTE', 'BALER', 'ABOVE', 'NORTH', 'WAFER', 'SCANT', 'FRILL', 'AWASH', 'SNACK', 'SCOWL', 'FRAIL', 'DRIFT', 'LIMBO', 'FENCE', 'MOTEL', 'OUNCE', 'WREAK', 'REVEL', 'TALON', 'PRIOR', 'KNELT', 'CELLO', 'FLAKE', 'DEBUG', 'ANODE', 'CRIME', 'SALVE', 'SCOUT', 'IMBUE', 'PINKY', 'STAVE', 'VAGUE', 'CHOCK', 'FIGHT', 'VIDEO', 'STONE', 'TEACH', 'CLEFT', 'FROST', 'PRAWN', 'BOOTY', 'TWIST', 'APNEA', 'STIFF', 'PLAZA', 'LEDGE', 'TWEAK', 'BOARD', 'GRANT', 'MEDIC', 'BACON', 'CABLE', 'BRAWL', 'SLUNK', 'RASPY', 'FORUM', 'DRONE', 'WOMEN', 'MUCUS', 'BOAST', 'TODDY', 'COVEN', 'TUMOR', 'TRUER', 'WRATH', 'STALL', 'STEAM', 'AXIAL', 'PURER', 'DAILY', 'TRAIL', 'NICHE', 'MEALY', 'JUICE', 'NYLON', 'PLUMP', 'MERRY', 'FLAIL', 'PAPAL', 'WHEAT', 'BERRY', 'COWER', 'ERECT', 'BRUTE', 'LEGGY', 'SNIPE', 'SINEW', 'SKIER', 'PENNY', 'JUMPY', 'RALLY', 'UMBRA', 'SCARY', 'MODEM', 'GROSS', 'AVIAN', 'GREED', 'SATIN', 'TONIC', 'PARKA', 'SNIFF', 'LIVID', 'STARK', 'TRUMP', 'GIDDY', 'REUSE', 'TABOO', 'AVOID', 'QUOTE', 'DEVIL', 'LIKEN', 'GLOSS', 'GAYER', 'BERET', 'NOISE', 'GLAND', 'DEALT', 'SLING', 'RUMOR', 'OPERA', 'THIGH', 'TONGA', 'FLARE', 'WOUND', 'WHITE', 'BULKY', 'ETUDE', 'HORSE', 'CIRCA', 'PADDY', 'INBOX', 'FIZZY', 'GRAIN', 'EXERT', 'SURGE', 'GLEAM', 'BELLE', 'SALVO', 'CRUSH', 'FRUIT', 'SAPPY', 'TAKER', 'TRACT', 'OVINE', 'SPIKY', 'FRANK', 'REEDY', 'FILTH', 'SPASM', 'HEAVE', 'MAMBO', 'RIGHT', 'CLANK', 'TRUST', 'LUMEN', 'BORNE', 'SPOOK', 'SAUCE', 'AMBER', 'LATHE', 'CARAT', 'CORER', 'DIRTY', 'SLYLY', 'AFFIX', 'ALLOY', 'TAINT', 'SHEEP', 'KINKY', 'WOOLY', 'MAUVE', 'FLUNG', 'YACHT', 'FRIED', 'QUAIL', 'BRUNT', 'GRIMY', 'CURVY', 'CAGEY', 'RINSE', 'DEUCE', 'STATE', 'GRASP', 'MILKY', 'BISON', 'GRAFT', 'SANDY', 'BASTE', 'FLASK', 'HEDGE', 'GIRLY', 'SWASH', 'BONEY', 'COUPE', 'ENDOW', 'ABHOR', 'WELCH', 'BLADE', 'TIGHT', 'GEESE', 'MISER', 'MIRTH', 'CLOUD', 'CABAL', 'LEECH', 'CLOSE', 'TENTH', 'PECAN', 'DROIT', 'GRAIL', 'CLONE', 'GUISE', 'RALPH', 'TANGO', 'BIDDY', 'SMITH', 'MOWER', 'PAYEE', 'SERIF', 'DRAPE', 'FIFTH', 'SPANK', 'GLAZE', 'ALLOT', 'TRUCK', 'KAYAK', 'VIRUS', 'TESTY', 'TEPEE', 'FULLY', 'ZONAL', 'METRO', 'CURRY', 'GRAND', 'BANJO', 'AXION', 'BEZEL', 'OCCUR', 'CHAIN', 'NASAL', 'GOOEY', 'FILER', 'BRACE', 'ALLAY', 'PUBIC', 'RAVEN', 'PLEAD', 'GNASH', 'FLAKY', 'MUNCH', 'DULLY', 'EKING', 'THING', 'SLINK', 'HURRY', 'THEFT', 'SHORN', 'PYGMY', 'RANCH', 'WRING', 'LEMON', 'SHORE', 'MAMMA', 'FROZE', 'NEWER', 'STYLE', 'MOOSE', 'ANTIC', 'DROWN', 'VEGAN', 'CHESS', 'GUPPY', 'UNION', 'LEVER', 'LORRY', 'IMAGE', 'CABBY', 'DRUID', 'EXACT', 'TRUTH', 'DOPEY', 'SPEAR', 'CRIED', 'CHIME', 'CRONY', 'STUNK', 'TIMID', 'BATCH', 'GAUGE', 'ROTOR', 'CRACK', 'CURVE', 'LATTE', 'WITCH', 'BUNCH', 'REPEL', 'ANVIL', 'SOAPY', 'METER', 'BROTH', 'MADLY', 'DRIED', 'SCENE', 'KNOWN', 'MAGMA', 'ROOST', 'WOMAN', 'THONG', 'PUNCH', 'PASTY', 'DOWNY', 'KNEAD', 'WHIRL', 'RAPID', 'CLANG', 'ANGER', 'DRIVE', 'GOOFY', 'EMAIL', 'MUSIC', 'STUFF', 'BLEEP', 'RIDER', 'MECCA', 'FOLIO', 'SETUP', 'VERSO', 'QUASH', 'FAUNA', 'GUMMY', 'HAPPY', 'NEWLY', 'FUSSY', 'RELIC', 'GUAVA', 'RATTY', 'FUDGE', 'FEMUR', 'CHIRP', 'FORTE', 'ALIBI', 'WHINE', 'PETTY', 'GOLLY', 'PLAIT', 'FLECK', 'FELON', 'GOURD', 'BROWN', 'THRUM', 'FICUS', 'STASH', 'DECRY', 'WISER', 'JUNTA', 'VISOR', 'DAUNT', 'SCREE', 'IMPEL', 'AWAIT', 'PRESS', 'WHOSE', 'TURBO', 'STOOP', 'SPEAK', 'MANGY', 'EYING', 'INLET', 'CRONE', 'PULSE', 'MOSSY', 'STAID', 'HENCE', 'PINCH', 'TEDDY', 'SULLY', 'SNORE', 'RIPEN', 'SNOWY', 'ATTIC', 'GOING', 'LEACH', 'MOUTH', 'HOUND', 'CLUMP', 'TONAL', 'BIGOT', 'PERIL', 'PIECE', 'BLAME', 'HAUTE', 'SPIED', 'UNDID', 'INTRO', 'BASAL', 'SHINE', 'GECKO', 'RODEO', 'GUARD', 'STEER', 'LOAMY', 'SCAMP', 'SCRAM', 'MANLY', 'HELLO', 'VAUNT', 'ORGAN', 'FERAL', 'KNOCK', 'EXTRA', 'CONDO', 'ADAPT', 'WILLY', 'POLKA', 'RAYON', 'SKIRT', 'FAITH', 'TORSO', 'MATCH', 'MERCY', 'TEPID', 'SLEEK', 'RISER', 'TWIXT', 'PEACE', 'FLUSH', 'CATTY', 'LOGIN', 'EJECT', 'ROGER', 'RIVAL', 'UNTIE', 'REFIT', 'AORTA', 'ADULT', 'JUDGE', 'ROWER', 'ARTSY', 'RURAL', 'SHAVE'];
// console.log("WORDLE ANSWER LENGTH");
// console.log(wordle_answers.length);
var day;
const og_day = getOGDay()
// const og_day = 2000;
// console.log(og_day);
setDay(getDay(og_day));
var items_list = []
for (var i=1;i<=400;i++) {
  items_list.push(i)
}

// console.log(items_list);
function App() {

  const reloadCount = Number(sessionStorage.getItem('reloadCount')) || 0;

  const initialStates = {
    answer: () => getDayAnswer(day),
    gameState: state.playing,
    board: [
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
    ],
    cellStatuses: () => Array(6).fill(Array(5).fill(status.unguessed)),
    currentRow: 0,
    currentCol: 0,
    letterStatuses: () => {
      const letterStatuses = {}
      letters.forEach((letter) => {
        letterStatuses[letter] = status.unguessed
      })
      return letterStatuses
    },
  }

  const [answer, setAnswer] = useState(initialStates.answer)
  // console.log(answer)
  const [gameState, setGameState] = useState(initialStates.gameState)
  const [board, setBoard] = useState(initialStates.board)
  const [cellStatuses, setCellStatuses] = useState(initialStates.cellStatuses)
  const [currentRow, setCurrentRow] = useState(initialStates.currentRow)
  const [currentCol, setCurrentCol] = useState(initialStates.currentCol)
  const [letterStatuses, setLetterStatuses] = useState(initialStates.letterStatuses)
  const [submittedInvalidWord, setSubmittedInvalidWord] = useState(false)
  const [currentStreak, setCurrentStreak] = useLocalStorage('current-streak', 0)
  const [longestStreak, setLongestStreak] = useLocalStorage('longest-streak', 0)
  const streakUpdated = useRef(false)
  const [modalIsOpen, setIsOpen] = useState(false)
  const [firstTime, setFirstTime] = useLocalStorage('first-time', true)
  const [infoModalIsOpen, setInfoModalIsOpen] = useState(firstTime)
  const [settingsModalIsOpen, setSettingsModalIsOpen] = useState(false)
  const [isSavedSolution, setIsSavedSolution] = useState(getIsSavedSolution())

  const [gameStateList, setGameStateList] = useLocalStorage(
    'gameStateList',
    Array(2500).fill({ state: initialStates.gameState, board: null })
  )


  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  const handleInfoClose = () => {
    setFirstTime(false)
    setInfoModalIsOpen(false)
  }

  const [darkMode, setDarkMode] = useLocalStorage('dark-mode', false)
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
  }

  const [colorBlindMode, setColorblindMode] = useLocalStorage('colorblind-mode', false)
  const toggleColorBlindMode = () => {
    setColorblindMode((prev) => !prev)
  }

  useEffect(() => {
    if (gameState !== state.playing && !isSavedSolution) {
      setTimeout(() => {
        openModal()
      }, 500)
    }
  }, [gameState, isSavedSolution])

  useEffect(() => {
    if (!streakUpdated.current) {
      if (gameState === state.won) {
        if (currentStreak >= longestStreak) {
          setLongestStreak((prev) => prev + 1)
        }
        setCurrentStreak((prev) => prev + 1)
        streakUpdated.current = true
      } else if (gameState === state.lost) {
        setCurrentStreak(0)
        streakUpdated.current = true
      }
    }
  }, [gameState, currentStreak, longestStreak, setLongestStreak, setCurrentStreak])

  useEffect(() => {
    const jsonGameStateList = localStorage.getItem('gameStateList');
    if (jsonGameStateList == null) {
      setGameStateList(gameStateList)
    } else {
      const gameStateList = JSON.parse(jsonGameStateList);

      // address regression impact of gameStateList change
      // see oneTimeGameStateListUpdate for more info on this
      if (typeof gameStateList[0] === 'string') {
        oneTimeGameStateListUpdate(gameStateList);
      }
    }

    // set to a blank board or the board from a past win
    setInitialGameState();
  }, [])

  useEffect(() => {
    if (reloadCount < 1) {
      window.location.reload(true);
      sessionStorage.setItem('reloadCount', String(reloadCount + 1));
    } else {
      sessionStorage.removeItem('reloadCount');
    }
  }, [og_day])

  // update letter and cell statuses each time we move onto a
  // new row and when we switch to a puzzle with a saved solution
  useEffect(() => {
    const isGameOver = currentRow === 6;
    const isEnterPressOrSavedGame = currentRow !== 6 && currentCol === 0 && (
      board[currentRow][currentCol] === '' || isSavedSolution
    );

    if (isGameOver || isEnterPressOrSavedGame) {
      board.forEach((row, idx) => {
        const word = row.join('')

        if (word) {
          updateLetterStatuses(word)
          updateCellStatuses(word, idx)
        }
      })
    }
  }, [currentCol, currentRow, board])

  const setInitialGameState = () => {
    const gameStateList = JSON.parse(localStorage.getItem('gameStateList'))

    setAnswer(initialStates.answer)
    setCurrentRow(initialStates.currentRow)
    setCurrentCol(initialStates.currentCol)
    setCellStatuses(initialStates.cellStatuses)
    setLetterStatuses(initialStates.letterStatuses)

    if (gameStateList && getIsSavedSolution()) {
      setIsSavedSolution(true)
      setGameState(state.won)
      setBoard(gameStateList[day-1].board)
    } else {
      setIsSavedSolution(false)
      setBoard(initialStates.board)
      setGameState(initialStates.gameState)
    }
  }

  const clearSolution = () => {
    const newGameStateList = JSON.parse(localStorage.getItem('gameStateList'))
    newGameStateList[day-1].board = null;
    localStorage.setItem("gameStateList", JSON.stringify(newGameStateList))
    setInitialGameState();
  }

  const getCellStyles = (rowNumber, colNumber, letter) => {
    if (rowNumber === currentRow && !isSavedSolution) {
      if (letter) {
        return `nm-inset-background dark:nm-inset-background-dark text-primary dark:text-primary-dark ${
          submittedInvalidWord ? 'border border-red-800' : ''
        }`
      }
      return 'nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark'
    }

    switch (cellStatuses[rowNumber][colNumber]) {
      case status.green:
        if (colorBlindMode) {
          return 'nm-inset-orange-500 text-gray-50'
        }
        else {
          return 'nm-inset-n-green text-gray-50'
        }
      case status.yellow:
      if (colorBlindMode) {
        return 'nm-inset-blue-300 text-gray-50'
      }
      else {
        return 'nm-inset-yellow-500 text-gray-50'
      }
      case status.gray:
        return 'nm-inset-n-gray text-gray-50'
      default:
        return 'nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark'
    }
  }

  const addLetter = (letter) => {
    document.activeElement.blur()
    setSubmittedInvalidWord(false)
    setBoard((prev) => {
      if (currentCol > 4) {
        return prev
      }
      const newBoard = [...prev]
      newBoard[currentRow][currentCol] = letter
      return newBoard
    })
    if (currentCol < 5) {
      setCurrentCol((prev) => prev + 1)
    }
  }

  const isValidWord = (word) => {
    if (word.length < 5) return false
    return words[word.toLowerCase()]
  }

  const onEnterPress = () => {
    const word = board[currentRow].join('')
    if (!isValidWord(word)) {
      setSubmittedInvalidWord(true)
      return
    }

    if (currentRow === 6) return

    setCurrentRow((prev) => prev + 1)
    setCurrentCol(0)
  }

  const onDeletePress = () => {
    setSubmittedInvalidWord(false)
    if (currentCol === 0) return

    setBoard((prev) => {
      const newBoard = [...prev]
      newBoard[currentRow][currentCol - 1] = ''
      return newBoard
    })

    setCurrentCol((prev) => prev - 1)
  }

  const updateCellStatuses = (word, rowNumber) => {
    setCellStatuses((prev) => {
      const newCellStatuses = [...prev]
      newCellStatuses[rowNumber] = [...prev[rowNumber]]
      const wordLength = word.length
      const answerLetters = answer.split('')

      // set all to gray
      for (let i = 0; i < wordLength; i++) {
        newCellStatuses[rowNumber][i] = status.gray
      }

      // check greens
      for (let i = wordLength - 1; i >= 0; i--) {
        if (word[i] === answer[i]) {
          newCellStatuses[rowNumber][i] = status.green
          answerLetters.splice(i, 1)
        }
      }

      // check yellows
      for (let i = 0; i < wordLength; i++) {
        if (answerLetters.includes(word[i]) && newCellStatuses[rowNumber][i] !== status.green) {
          newCellStatuses[rowNumber][i] = status.yellow
          answerLetters.splice(answerLetters.indexOf(word[i]), 1)
        }
      }

      return newCellStatuses
    })
  }

  const isRowAllGreen = (row) => {
    return row.every((cell) => cell === status.green)
  }

  // every time cellStatuses updates, check if the game is won or lost
  useEffect(() => {
    const cellStatusesCopy = [...cellStatuses]
    const reversedStatuses = cellStatusesCopy.reverse()
    const lastFilledRow = reversedStatuses.find((r) => {
      return r[0] !== status.unguessed
    })

    // don't update game state for already won games
    if (!isSavedSolution) {
      const newGameStateList = JSON.parse(localStorage.getItem('gameStateList'))
      const dayState = newGameStateList[day-1]

      if (lastFilledRow && isRowAllGreen(lastFilledRow)) {
        setGameState(state.won)
        dayState.board = board
        dayState.state = state.won
        dayState.scoreUnknown = false;
      } else if (currentRow === 6) {
        setGameState(state.lost)
        dayState.state = state.lost
      }
      localStorage.setItem('gameStateList', JSON.stringify(newGameStateList))
    }
  }, [cellStatuses, currentRow])

  const updateLetterStatuses = (word) => {
    setLetterStatuses((prev) => {
      const newLetterStatuses = { ...prev }
      const wordLength = word.length
      for (let i = 0; i < wordLength; i++) {
        if (newLetterStatuses[word[i]] === status.green) continue

        if (word[i] === answer[i]) {
          newLetterStatuses[word[i]] = status.green
        } else if (answer.includes(word[i])) {
          newLetterStatuses[word[i]] = status.yellow
        } else {
          newLetterStatuses[word[i]] = status.gray
        }
      }
      return newLetterStatuses
    })
  }

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: darkMode ? 'hsl(231, 16%, 25%)' : 'hsl(231, 16%, 92%)',
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      height: 'calc(100% - 2rem)',
      width: 'calc(100% - 2rem)',
      backgroundColor: darkMode ? 'hsl(231, 16%, 25%)' : 'hsl(231, 16%, 92%)',
      boxShadow: `${
        darkMode
          ? '0.2em 0.2em calc(0.2em * 2) #252834, calc(0.2em * -1) calc(0.2em * -1) calc(0.2em * 2) #43475C'
          : '0.2em 0.2em calc(0.2em * 2) #A3A7BD, calc(0.2em * -1) calc(0.2em * -1) calc(0.2em * 2) #FFFFFF'
      }`,
      border: 'none',
      borderRadius: '1rem',
      maxWidth: '475px',
      maxHeight: '650px',
      position: 'relative',
    },
  }

  const playFirst = () => playDay(1)
  const playPrevious = () => playDay(day - 1)
  const playRandom = () => playDay(Math.floor(Math.random() * (og_day-1)) + 1)
  const playNext = () => playDay(day + 1)
  const playLast = () => playDay(og_day)

  const playDay = (i) => {
    // console.log("PLAYING")
    // console.log(i)
    setDay(i)
    setInitialGameState()
  }

  var tempGameStateList = JSON.parse(localStorage.getItem('gameStateList'))
  if (tempGameStateList == null) {
    setGameStateList(gameStateList)
    tempGameStateList = gameStateList
  }
  // console.log(tempGameStateList.length);
  // console.log(og_day);
  for (var i=4;i<=og_day+3;i++) {
    var textNumber = document.getElementById('headlessui-menu-item-'+i)
    if(textNumber != null) {
      if (tempGameStateList[i-1].state == state.won) {
        textNumber.classList.add('green-text');
      }
      if (tempGameStateList[i-1].state == state.lost) {
        textNumber.classList.add('red-text');
      }
    }
  }

  var header_symbol = (tempGameStateList[day-1].state == 'won') ? ('✔') : ((tempGameStateList[day-1].state == 'lost') ? ('✘') : '')

  var elements = items_list.map(i => {
    return (
      <Menu.Item key={i}>
        {({ active }) =>
          (
            <button onClick={() => playDay(i)} className={classNames(
              tempGameStateList[i-1].state,
              getIsClearedSolution(i) ? "cleared" : "",
              active ? 'font-bold text-gray-900' : 'text-gray-700',
              'flex justify-between block px-4 py-2 text-sm w-full',
            )}>
                <span>
                  {i+(tempGameStateList[i-1].state == state.won ? ' ✔' : tempGameStateList[i-1].state == state.lost ? ' ✘' : '')}
                </span>
                <span>
                  {calculateScore(i)}
                </span>
            </button>
          )
        }
      </Menu.Item>
    );
  });

  if (darkMode == true) {
    var html = document.getElementsByTagName( 'html' )[0]; // '0' to assign the first (and only `HTML` tag)
    html.setAttribute( 'class', 'dark-bg' );
  }
  else {
    var html = document.getElementsByTagName( 'html' )[0]; // '0' to assign the first (and only `HTML` tag)
    html.setAttribute( 'class', 'bg' );
  }

  if (window.innerWidth < 600) {
    return (
      <div className={darkMode ? 'dark h-fill' : 'h-fill'}>
        <div className={`flex flex-col justify-between h-fill bg-background dark:bg-background-dark`}>
          <header className="flex items-center py-2 px-3 text-primary dark:text-primary-dark">
            <button type="button" onClick={() => setSettingsModalIsOpen(true)}>
              <Settings />
            </button>
            <h1 className={"flex-1 text-center text-l xxs:text-lg sm:text-3xl tracking-wide font-bold font-og"}>
              WORDLE ARCHIVE {day} {header_symbol}
            </h1>
            <button className="mr-2" type="button" onClick={() => setIsOpen(true)}>
              <Share />
            </button>
            <button type="button" onClick={() => setInfoModalIsOpen(true)}>
              <Info />
            </button>
          </header>
          <div className="flex flex-force-center items-center py-3">
            <div className="flex items-center px-2">
              <button
                type="button"
                className="rounded px-2 py-2 mt-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={playPrevious}>Previous
              </button>
            </div>
            <div className="flex items-center px-2">
              <button
                type="button"
                className="rounded px-2 py-2 mt-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={playRandom}>Random
              </button>
            </div>
            <div className="flex items-center px-2">
              <button
                type="button"
                className="rounded px-2 py-2 mt-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={playNext}>Next
              </button>
            </div>
          </div>
           <div className="flex flex-force-center items-center py-3">
            <div className="flex items-center px-2">
              <button
                type="button"
                className="rounded px-2 py-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={playFirst}>First
              </button>
            </div>
            <div className="flex items-center px-2">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="blurthis rounded px-2 py-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark">
                    Choose
                  </Menu.Button>
                </div>
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-42 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-scroll h-56">
                    <div className="py-1">
                      {elements}
                    </div>
                  </Menu.Items>
              </Menu>
            </div>
            <div className="flex items-center px-2">
              <button
                type="button"
                className="rounded px-2 py-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={playLast}>Last
              </button>
            </div>
          </div>
          <div className="flex items-center flex-col py-4">
            <div className="grid grid-cols-5 grid-flow-row gap-4">
              {board.map((row, rowNumber) =>
                row.map((letter, colNumber) => (
                  <span
                    key={colNumber}
                    className={`${getCellStyles(
                      rowNumber,
                      colNumber,
                      letter
                    )} inline-flex items-center font-medium justify-center text-xl w-[14vw] h-[14vw] xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded`}
                  >
                    {letter}
                  </span>
                ))
              )}
            </div>
          </div>
          <InfoModal
            isOpen={infoModalIsOpen}
            handleClose={handleInfoClose}
            darkMode={darkMode}
            colorBlindMode={colorBlindMode}
            styles={modalStyles}
          />
          <EndGameModal
            isOpen={modalIsOpen}
            handleClose={closeModal}
            styles={modalStyles}
            darkMode={darkMode}
            gameState={gameState}
            state={state}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            answer={answer}
            playAgain={() => {
              closeModal()
              streakUpdated.current = false
            }}
            day={day}
            currentRow={currentRow}
            cellStatuses={cellStatuses}
          />
          <SettingsModal
            isOpen={settingsModalIsOpen}
            handleClose={() => setSettingsModalIsOpen(false)}
            styles={modalStyles}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            colorBlindMode={colorBlindMode}
            toggleColorBlindMode={toggleColorBlindMode}
          />
          <Keyboard
            isSolved={gameState === state.won}
            onClear={clearSolution}
            letterStatuses={letterStatuses}
            addLetter={addLetter}
            onEnterPress={onEnterPress}
            onDeletePress={onDeletePress}
            gameDisabled={gameState !== state.playing}
            colorBlindMode={colorBlindMode}
          />
        </div>
      </div>
    )
  }
  else {
    return (
      <div className={darkMode ? 'dark h-fill' : 'h-fill'}>
        <div className={`flex flex-col justify-between h-fill bg-background dark:bg-background-dark`}>
          <header className="flex items-center py-2 px-3 text-primary dark:text-primary-dark">
            <button type="button" onClick={() => setSettingsModalIsOpen(true)}>
              <Settings />
            </button>
            <h1 className={"flex-1 text-center text-xl xxs:text-2xl -mr-6 sm:text-4xl tracking-wide font-bold font-og"}>
              WORDLE ARCHIVE {day}  {header_symbol}
            </h1>
            <button className="mr-6" type="button" onClick={() => setIsOpen(true)}>
              <Share />
            </button>
            <button type="button" onClick={() => setInfoModalIsOpen(true)}>
              <Info />
            </button>
          </header>
          <div className="flex flex-force-center items-center py-3">
            <div className="flex items-center px-3">
              <button
                type="button"
                className="rounded px-3 py-2 mt-4 w-32 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={playFirst}>First
              </button>
            </div>
            <div className="flex items-center px-3">
              <button
                type="button"
                className="rounded px-3 py-2 mt-4 w-32 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={playPrevious}>Previous
              </button>
            </div>
            <div className="flex items-center px-3">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="blurthis rounded px-3 py-2 mt-4 w-32 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark">
                    Choose
                  </Menu.Button>
                </div>
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-scroll h-56">
                    <div className="py-1">
                      <Menu.Item key={i}>
                        {({ active }) =>
                          (
                            <button onClick={() => playRandom()} className={classNames(active ? 'font-bold text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm w-full text-left')}>
                              Random
                            </button>
                          )
                        }
                      </Menu.Item>
                      {elements}
                    </div>
                  </Menu.Items>
              </Menu>
            </div>
            <div className="flex items-center px-3">
              <button
                type="button"
                className="rounded px-3 py-2 mt-4 w-32 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={playNext}>Next
              </button>
            </div>
            <div className="flex items-center px-3">
              <button
                type="button"
                className="rounded px-3 py-2 mt-4 w-32 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={playLast}>Last
              </button>
            </div>
          </div>
          <div className="flex items-center flex-col py-4">
            <div className="grid grid-cols-5 grid-flow-row gap-4">
              {board.map((row, rowNumber) =>
                row.map((letter, colNumber) => (
                  <span
                    key={colNumber}
                    className={`${getCellStyles(
                      rowNumber,
                      colNumber,
                      letter
                    )} inline-flex items-center font-bold justify-center text-3xl w-[14vw] h-[14vw] xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded`}
                  >
                    {letter}
                  </span>
                ))
              )}
            </div>
          </div>
          <InfoModal
            isOpen={infoModalIsOpen}
            handleClose={handleInfoClose}
            darkMode={darkMode}
            colorBlindMode={colorBlindMode}
            styles={modalStyles}
          />
          <EndGameModal
            isOpen={modalIsOpen}
            handleClose={closeModal}
            styles={modalStyles}
            darkMode={darkMode}
            gameState={gameState}
            state={state}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            answer={answer}
            playAgain={() => {
              closeModal()
              streakUpdated.current = false
            }}
            day={day}
            currentRow={currentRow}
            cellStatuses={cellStatuses}
          />
          <SettingsModal
            isOpen={settingsModalIsOpen}
            handleClose={() => setSettingsModalIsOpen(false)}
            styles={modalStyles}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            colorBlindMode={colorBlindMode}
            toggleColorBlindMode={toggleColorBlindMode}
          />
          <Keyboard
            isSolved={gameState === state.won}
            onClear={clearSolution}
            letterStatuses={letterStatuses}
            addLetter={addLetter}
            onEnterPress={onEnterPress}
            onDeletePress={onDeletePress}
            gameDisabled={gameState !== state.playing}
            colorBlindMode={colorBlindMode}
          />
        </div>
      </div>
    )
  }
}

export default App
