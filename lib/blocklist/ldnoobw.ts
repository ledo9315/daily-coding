/**
 * Word lists from LDNOOBW, the "List of Dirty, Naughty, Obscene, and Otherwise Bad Words"
 * (https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words), licensed
 * CC BY 4.0 - see LICENSE-LDNOOBW.md next to this file. Matched as whole words only, after the
 * normalisation in `display-name-blocklist.ts`; the hate terms that these lists lack live there.
 *
 * Kept as data in the repo rather than as a package, so entries can be dropped: the upstream
 * lists aim at content filters, and for a field that holds real names several entries would
 * hit surnames (Dick, Butt, Hooker, Coon, Santorum), first names (Lolita, Shota), initials
 * (XXX), a religious title (Mufti) or plain words (sexy, nackt, kinky). The removed entries are
 * listed at the bottom so a refresh from upstream can re-apply the same pruning.
 */

export const LDNOOBW_DE: readonly string[] = [
  "analritter", "arsch", "arschficker", "arschlecker", "arschloch", "bratze", "bumsen", "fick",
  "ficken", "flittchen", "fotze", "hackfresse", "hure", "hurensohn", "kackbratze", "kacke",
  "kacken", "kackwurst", "kampflesbe", "kanake", "MILF", "möpse", "morgenlatte", "möse", "muschi",
  "neger", "nigger", "nippel", "nutte", "onanieren", "orgasmus", "penis", "pimmel", "pimpern",
  "pissen", "pisser", "poppen", "porno", "schlampe", "scheiße", "scheisser", "schiesser",
  "schnackeln", "schwanzlutscher", "schwuchtel", "tittchen", "titten", "vögeln", "vollpfosten",
  "wichse", "wichsen", "wichser",
];

export const LDNOOBW_EN: readonly string[] = [
  "2g1c", "2 girls 1 cup", "acrotomophilia", "alabama hot pocket", "alaskan pipeline", "anal",
  "anilingus", "anus", "apeshit", "arsehole", "ass", "asshole", "assmunch", "autoerotic",
  "babeland", "baby batter", "baby juice", "ball gag", "ball gravy", "ball kicking",
  "ball licking", "ball sack", "ball sucking", "bangbros", "bangbus", "bareback", "barenaked",
  "bastard", "bastardo", "bastinado", "bdsm", "beaner", "beaners", "beaver cleaver",
  "beaver lips", "beastiality", "bestiality", "big breasts", "big knockers", "big tits", "bimbos",
  "birdlock", "bitch", "bitches", "black cock", "blowjob", "blow your load", "blue waffle",
  "blumpkin", "bollocks", "bondage", "boner", "boob", "boobs", "brown showers", "bukkake",
  "bulldyke", "bullet vibe", "bullshit", "bung hole", "bunghole", "busty", "buttcheeks",
  "butthole", "camel toe", "camgirl", "camslut", "camwhore", "carpet muncher", "carpetmuncher",
  "chocolate rosebuds", "cialis", "circlejerk", "cleveland steamer", "clit", "clitoris",
  "clover clamps", "clusterfuck", "cock", "cocks", "coprolagnia", "coprophilia", "cornhole",
  "coons", "creampie", "cum", "cumming", "cumshot", "cumshots", "cunnilingus", "cunt", "darkie",
  "date rape", "daterape", "deep throat", "deepthroat", "dendrophilia", "dildo", "dingleberry",
  "dingleberries", "dirty pillows", "dirty sanchez", "doggiestyle", "doggystyle", "dolcett",
  "dominatrix", "dommes", "donkey punch", "double dong", "double penetration", "dry hump", "dvda",
  "eat my ass", "ecchi", "ejaculation", "fag", "faggot", "fecal", "felch", "fellatio", "feltch",
  "female squirting", "femdom", "figging", "fingerbang", "fingering", "fisting", "foot fetish",
  "footjob", "frotting", "fuck", "fuck buttons", "fuckin", "fucking", "fucktards", "fudge packer",
  "fudgepacker", "futanari", "gangbang", "gang bang", "genitals", "giant cock", "girls gone wild",
  "goatcx", "goatse", "gokkun", "golden shower", "goodpoop", "goo girl", "goregasm", "grope",
  "g-spot", "handjob", "hentai", "homoerotic", "honkey", "horny", "hot carl", "humping", "incest",
  "intercourse", "jail bait", "jailbait", "jelly donut", "jigaboo", "jiggaboo", "jiggerboo",
  "jizz", "juggs", "kike", "kinbaku", "knobbing", "lemon party", "livesex", "lovemaking",
  "male squirting", "masturbate", "masturbating", "masturbation", "menage a trois", "milf",
  "motherfucker", "mound of venus", "mr hands", "muff diver", "muffdiving", "nambla", "nawashi",
  "negro", "neonazi", "nigga", "nigger", "nig nog", "nimphomania", "nipple", "nipples", "nsfw",
  "nutten", "nympho", "nymphomania", "octopussy", "omorashi", "one cup two girls",
  "one guy one jar", "orgasm", "orgy", "paedophile", "paki", "panties", "panty", "pedobear",
  "pedophile", "pegging", "penis", "piece of shit", "pikey", "pissing", "piss pig", "pisspig",
  "pleasure chest", "pole smoker", "ponyplay", "poon", "poontang", "punany", "poop chute",
  "poopchute", "porn", "porno", "pornography", "prince albert piercing", "pthc", "pubes", "pussy",
  "queaf", "queef", "quim", "raghead", "raging boner", "rape", "raping", "rapist", "rectum",
  "reverse cowgirl", "rimjob", "rimming", "rosy palm", "rosy palm and her 5 sisters",
  "rusty trombone", "sadism", "scat", "schlong", "scissoring", "semen", "sexcam", "shaved beaver",
  "shaved pussy", "shemale", "shibari", "shit", "shitblimp", "shitty", "shrimping", "skeet",
  "slanteye", "slut", "s&m", "smut", "snatch", "snowballing", "sodomize", "sodomy", "spastic",
  "spic", "splooge", "splooge moose", "spooge", "spread legs", "spunk", "strapon", "strappado",
  "suicide girls", "swastika", "threesome", "throating", "thumbzilla", "tits", "titties", "titty",
  "topless", "tosser", "towelhead", "tranny", "tribadism", "tub girl", "tubgirl", "tushy", "twat",
  "twink", "twinkie", "two girls one cup", "upskirt", "urethra play", "urophilia", "vagina",
  "venus mound", "viagra", "vibrator", "violet wand", "vorarephilia", "voyeur", "voyeurweb",
  "voyuer", "vulva", "wank", "wetback", "white power", "whore", "worldsex", "wrinkled starfish",
  "yaoi", "yellow showers", "yiffy", "zoophilia",
];

/** Dropped from upstream, see the header. */
export const LDNOOBW_REMOVED: Readonly<Record<"de" | "en", readonly string[]>> = {
  de: [
    "mufti", "nackt", "bonze", "ische", "reudig", "fratze", "lümmel", "dödel", "popel", "pinkeln",
    "bimbo", "kimme", "rosette", "schabracke",
  ],
  en: [
    "sex", "sexy", "sexo", "sexual", "sexually", "sexuality", "nude", "nudity", "undressing",
    "erotic", "erotism", "escort", "eunuch", "kinky", "kinkster", "playboy", "domination",
    "hardcore", "hooker", "dick", "butt", "coon", "poof", "mong", "santorum", "lolita", "shota",
    "guro", "xx", "xxx", "bbw", "suck", "sucks", "swinger", "tit", "🖕", "big black", "hot chick",
    "tied up", "strip club", "tainted love", "huge fat", "tight white", "wrapping men", "girl on",
    "girl on top", "blonde action", "brunette action", "blonde on blonde action", "style doggy",
    "how to kill", "how to murder", "taste my", "tongue in a", "sultry women", "hard core",
    "god damn", "nsfw images", "dp action", "make me come", "barely legal", "auto erotic",
    "leather restraint", "leather straight jacket", "missionary position", "doggy style",
    "doggie style", "dog style", "group sex", "gay sex", "phone sex", "strap on", "tea bagging",
    "hand job", "blow job", "jack off", "jerk off", "wet dream", "booty call",
  ],
};
