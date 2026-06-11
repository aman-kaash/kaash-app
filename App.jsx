import { useState, useEffect } from "react";

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

// ─── FIREBASE CONFIG (kaash-app project) ────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBv0ZkzCXD1laS_ijbtMk4VN0Yp3MeW-LU",
  authDomain: "kaash-app.firebaseapp.com",
  projectId: "kaash-app",
  storageBucket: "kaash-app.firebasestorage.app",
  messagingSenderId: "404911023324",
  appId: "1:404911023324:web:83384f9f85bb260e180019",
  measurementId: "G-CJD67NE58W"
};
const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);
const googleProvider = new GoogleAuthProvider();

import { Home, Compass, Search, User, Flame, Play, ChevronRight, ChevronDown, ChevronUp, Share2, Bookmark, CheckCircle, Clock, Star, ArrowLeft, Zap, Globe, ShieldCheck, X, Settings as SettingsIcon, Bell, Send } from "lucide-react";

// ─── WARM CINEMA THEME ──────────────────────────────────────────────
// ─── RAZORPAY CONFIG ─────────────────────────────────────────────────
// Replace with your Razorpay Key ID from the Razorpay Dashboard
// Use rzp_test_XXXX while testing, rzp_live_XXXX for production
const RAZORPAY_KEY_ID = "rzp_test_T0QAljI1MTmXyq";

// Pricing - no GST collected (app revenue below ₹20 lakh GST threshold)
// Once annual app revenue crosses ₹20 lakh, GST registration required
// At that point update these prices to add 18% GST
const PRICING = {
  monthly: { amount:49,  label:"Monthly", paise:4900,  savingNote:"",            perMonth:49 },
  yearly:  { amount:499, label:"Yearly",  paise:49900, savingNote:"Save ₹89 vs monthly", perMonth:41.58 },
};

const C = {
  bg:"#1A1613", surface:"#231E19", card:"#2A241E", elevated:"#352E25", border:"#3D362C",
  gold:"#E8B84B", goldLight:"#F5D076", goldDark:"#A67C2E", goldBg:"rgba(232,184,75,0.12)",
  clay:"#D4825C", clayBg:"rgba(212,130,92,0.14)",
  red:"#C75D4A", green:"#7BA35C", greenBg:"rgba(123,163,92,0.14)",
  text:"#F5EFE3", textSec:"#B5A992", textMuted:"#6E6456",
};

const USER = { name:"Aman", streak:7, xp:2450, level:"Senior Historian", watched:23, total:500, badges:["Ancient Scholar","WW2 Expert","India Historian"] };

const EVENTS = [
  { id:"ww1", title:"Assassination of Archduke Franz Ferdinand", short:"The Shot That Started WW1", year:1914, era:"MODERN", region:"Europe", cat:"wars", emoji:"🔫", grad:"linear-gradient(135deg,#7A2A1E,#2A1410)",
    desc:"On June 28, 1914, a single bullet in Sarajevo triggered a chain reaction killing 20 million and reshaping every nation on Earth.",
    tags:["WW1","Europe","Nationalism"],
    scenarios:[
      {num:1,title:"The Archduke Lives",tagline:"What if Princip's pistol misfired?",ripples:["No WW1 → No Versailles → No Nazi Germany","Russian Empire survives → No Soviet Union","Ottoman Empire reforms rather than collapses","US remains isolated → no global superpower role","India's independence delayed 20-30 years"],narrative:"June 28, 1914. Gavrilo Princip raises his pistol — and the weapon jams. Without the assassination, Austria-Hungary has no pretext for its ultimatum to Serbia. The powder keg of 1914 remains, but without a spark, Europe does not explode.\n\nBy 1916, internal reform pressures build within Austria-Hungary. Germany, without the Eastern Front consuming Russian millions, focuses on commercial rivalry with Britain.\n\nThere is no Treaty of Versailles — and therefore no Adolf Hitler. The 20th century's bloodiest chapter is avoided by a mechanical failure lasting a fraction of a second."},
      {num:2,title:"Germany Refuses",tagline:"What if Kaiser Wilhelm backed down?",ripples:["Limited Balkan war replaces World War I — 200,000 not 20 million dead","Germany retains empire and global prestige","Early functioning League of Nations by 1920","Russian Revolution far less certain without wartime collapse","Middle East remains Ottoman — no Sykes-Picot disaster"],narrative:"Kaiser Wilhelm II, shaken by the scale of mobilisation he's triggering, refuses to give Austria-Hungary his unconditional support. Without German backing, Austria issues a limited ultimatum Serbia can accept.\n\nThe July Crisis becomes the July Climb-Down. A regional Balkan war — 200,000 dead instead of 20 million — shocks Europe into genuine arms reduction.\n\nA proto-League of Nations forms by 1920 with real enforcement power. The Middle East's modern borders are drawn by its own people."},
      {num:3,title:"Britain Stays Neutral",tagline:"What if Britain never entered?",ripples:["German-dominated Europe by 1916 — no Nazi successor needed","British Empire weakened — India independent by 1938","United States permanent isolationism","No Balfour Declaration — Israel never established","Anglo-German Cold War replaces US-Soviet Cold War"],narrative:"Britain's Cabinet votes to stay neutral. Without British resources, France faces Germany alone. By 1916, a negotiated peace ends the war with Germany dominant on the continent.\n\nA German-led Europe — not Nazi, but the Kaiser's conservative imperial Germany — emerges. India's independence movement finds an unexpected ally: a Germany willing to destabilise Britain's empire.\n\nThe subcontinent achieves independence in the late 1930s — earlier, but under more chaotic circumstances."},
      {num:4,title:"Russia Collapses First",tagline:"What if the Tsar fell in 1914?",ripples:["No Soviet Union — democratic Russia emerges in 1914","No communism as global movement — no Mao, no Kim","Germany wins WW1 but remains conservative-imperial","The great ideological war — capitalism vs communism — never happens","China stays a republic — no communist revolution"],narrative:"Russia's pre-existing social fractures trigger a revolution in late 1914 instead of 1917. The Tsar abdicates. A provisional democratic government takes Russia out of the war immediately.\n\nWithout Lenin's sealed train, the Bolsheviks remain a fringe movement. A democratic Russia — chaotic, large, resource-rich — develops through commerce.\n\nThe 20th century's defining ideological war never happens. Instead: imperial competition between a German-led Europe and the Anglo-American Atlantic world."},
      {num:5,title:"Princip Hits the Wrong Target",tagline:"What if he killed a minor official?",ripples:["Austria-Hungary reforms — survives as federal state into 1930s","Delayed but smaller world war in 1924 — 3 million not 20 million dead","No Versailles humiliation — Hitler never rises to power","Russian monarchy survives longer, gentle reforms avoid revolution","The 20th century is brutal but not apocalyptic"],narrative:"The Sarajevo plot goes slightly wrong. Princip fires — but shoots Count von Berchtold, Austria's Foreign Minister, instead of the Archduke. Franz Ferdinand survives.\n\nAustria protests, negotiates, gets concessions from Serbia. No war. Europe avoids 1914's catastrophe.\n\nBut the underlying tensions find release in a different crisis a decade later. A smaller delayed war comes in 1924 — 3 million dead instead of 20 million. Terrible, but survivable."},
    ]
  },
  { id:"ww2", title:"World War II Begins", short:"The War That Shaped Everything", year:1939, era:"MODERN", region:"Global", cat:"wars", emoji:"💣", grad:"linear-gradient(135deg,#2E4468,#141E30)",
    desc:"The deadliest conflict in human history — 70-85 million dead, the Holocaust, the atomic bomb, and a world order remade from its ashes.",
    tags:["Holocaust","Nuclear Age","Fascism"],
    scenarios:[
      {num:1,title:"Hitler Dies in 1939",tagline:"What if the Munich assassination succeeded?",ripples:["Holocaust never fully executes — 6 million Jewish lives saved","No Operation Barbarossa → USSR never devastated","Conservative German Europe vs Anglo-American Atlantic world","Decolonisation happens more slowly without war exhausting empires","Atomic bomb developed but possibly never used"],narrative:"November 8, 1939. Georg Elser's bomb explodes in the Bürgerbräukeller in Munich — but this time, Hitler does not leave 13 minutes early. He is killed instantly.\n\nGermany is in shock. The generals sue for peace by January 1940. The Holocaust, still in early stages, stops. Six million Jews remain alive.\n\nWithout the Eastern Front, there is no Soviet sacrifice of 27 million lives. A conservative German Europe faces a US-British Atlantic alliance. The Cold War still happens — but over ideology, not survival."},
      {num:2,title:"D-Day Fails",tagline:"What if Normandy was repelled?",ripples:["Soviet Union dominates all of Europe to the Rhine","France becomes a communist republic by 1947","US retreats into Western Hemisphere isolationism","NATO never formed — Europe never free from Soviet control","Britain survives but as isolated secondary power"],narrative:"June 6, 1944. Rommel's Panzer reserves, positioned near the beaches this time, counterattack within hours. Allied forces are pushed back into the sea.\n\nWithout a Western Front, the Soviet Union alone liberates Europe — and takes everything to the Rhine. France becomes a communist republic.\n\nThe Cold War begins as a Soviet-dominated world facing a weakened Anglo-American rump. A darker, more one-sided world than the one we inhabit."},
      {num:3,title:"Japan Skips Pearl Harbor",tagline:"What if Japan chose SE Asia only?",ripples:["US stays out of WW2 — Nazi Germany wins in Europe","Japan controls all of Pacific and South Asia","Holocaust completes without Allied liberation","World divided: Nazi Europe and Japanese Asia","US develops atomic bomb but the world is already divided"],narrative:"December 1941. Japan moves south only — taking Malaya, Singapore — without provoking America directly.\n\nFDR cannot bring Congress into the war. Germany, without US entry, defeats the Soviet Union by 1943. The Holocaust completes without Allied liberation.\n\nA German-Japanese axis divides Eurasia. Britain surrenders in 1944. The darkest timeline: no allied liberation, no Nuremberg trials, no world order built on human rights."},
      {num:4,title:"Germany Wins Battle of Britain",tagline:"What if the RAF was destroyed?",ripples:["Britain occupied — Churchill government in exile in Canada","No American base in Europe — war in Europe unwinnable","Nuclear standoff between US and Nazi Germany defines postwar world","Holocaust occurs across all of occupied Europe including Britain","Commonwealth nations become the new free world"],narrative:"Summer 1940. The Luftwaffe maintains focus on RAF airfields. By September, Fighter Command is broken. Operation Sea Lion launches.\n\nLondon falls by Christmas. Churchill is captured. Without Britain as a base, the US cannot project force into Europe.\n\nThe world's most powerful democracy faces nuclear deterrence with Nazi Germany — both sides with atomic weapons by 1950. A standoff built on mutual terror."},
      {num:5,title:"Atomic Bomb Never Used",tagline:"What if Truman chose invasion?",ripples:["1 million+ Allied deaths in Japanese invasion","Japan physically destroyed through conventional war — decades slower recovery","Nuclear taboo never exists — Cold War catastrophically more dangerous","Anti-nuclear movement never exists — no Hiroshima imagery to point to","Korean War: South Korea almost certainly falls to the North"],narrative:"Summer 1945. Truman chooses Operation Downfall over the atomic bomb. The ground invasion of Japan begins November 1945. One million Allied casualties. Five to ten million Japanese killed.\n\nThe bomb exists — but having never been used, its psychological weight is different. When the Soviets test their device in 1950, there is no 'you already crossed that line' dynamic.\n\nThe Cold War nearly becomes hot — three times. The horror of Hiroshima that restrained real leaders does not exist in this world."},
    ]
  },
  { id:"partition", title:"Partition of British India", short:"The Midnight Division", year:1947, era:"CONTEMPORARY", region:"South Asia", cat:"india", emoji:"🇮🇳", grad:"linear-gradient(135deg,#A0651A,#3A2408)",
    desc:"August 1947: British India divided into two nations overnight. Up to 2 million killed, 15 million displaced, and a nuclear rivalry born that shapes South Asia today.",
    tags:["India","Pakistan","Independence"],
    scenarios:[
      {num:1,title:"United India",tagline:"What if Gandhi's vision prevailed?",ripples:["No India-Pakistan wars — no nuclear South Asia standoff","Kashmir never disputed — integrated with Muslim-majority autonomy","United India becomes world's second economy by 2000","No Bangladesh Liberation War of 1971 — no genocide","South Asian integration 50 years ahead of actual trajectory"],narrative:"Mountbatten, persuaded by Gandhi's moral authority, insists on a 5-year transfer of power rather than 6 months. Jinnah, offered Prime Minister of a united secular India, accepts.\n\nA united, federal India of 1952 is the most populous nation on Earth — over 400 million people. No Partition violence. No million dead in communal riots.\n\nBy 2000, a United India is the world's second-largest economy. No nuclear standoff. No Kashmir insurgency. 1.5 billion people sharing infrastructure, culture, and a single market."},
      {num:2,title:"Jinnah Survives to 1970",tagline:"What if Pakistan's founder lived longer?",ripples:["Secular democratic Pakistan — Army never takes political dominance","No 1965 or 1971 India-Pakistan wars","Bangladesh achieves independence through negotiation not genocide","Pakistan nuclear program develops much later","South Asian economic integration 30 years ahead of schedule"],narrative:"Jinnah's tuberculosis is successfully treated. He governs Pakistan until 1965. The Pakistan he builds is secular and democratic — his stated vision, not the Islamist-military hybrid his early death enabled.\n\nWhen the Bengali crisis erupts, Jinnah's framework accommodates autonomy through negotiation. Bangladesh becomes independent in 1970 — without the genocide that killed 3 million.\n\nThe wars of 1965 and 1971 don't happen. Resources spent on militarisation are channelled into development."},
      {num:3,title:"Sardar Patel as First PM",tagline:"What if the Iron Man led India?",ripples:["Market economy from 1950 — India's GDP equals China's by 2000","Kashmir integrated decisively in 1947 — no decades of conflict","India aligns with the West — different development trajectory","License Raj never created — private sector dominant from birth","India becomes manufacturing superpower rather than services economy"],narrative:"Sardar Vallabhbhai Patel, not Nehru, becomes India's first Prime Minister. Patel's economic policies are market-oriented — no Soviet-style planning, no License Raj.\n\nKashmir is integrated more decisively in 1947. India aligns with the West. Private enterprise is freed from bureaucratic control from birth.\n\nBy 1975, India is where China is today — the world's factory floor. By 2000, India is economically peer with the United States."},
      {num:4,title:"Three Nations Born",tagline:"What if Ambedkar's Dalit state was carved out?",ripples:["Third South Asian nation — Dalit homeland — established 1947","India forced to confront caste systemically from the beginning","Dalit rights advance 40 years faster than in our timeline","Ambedkar becomes head of state — different constitution written","Caste becomes a global human rights issue by 1960 not 1990"],narrative:"Dr. B.R. Ambedkar wins international support for a third state — a Dalit homeland in parts of Maharashtra and Karnataka. 60 million people, historically India's most oppressed, receive an independent nation.\n\nIndia is forced to confront the caste question its leadership would have deferred for decades. The Dalit success story next door creates irresistible pressure for reform.\n\nThree South Asian nations: complex, but the 200 million Dalits inside India have living proof that social equality is achievable."},
      {num:5,title:"Slower Partition — No Violence",tagline:"What if Britain stayed until 1960?",ripples:["Partition violence never happens — 2 million lives saved overnight","South Asian confederation with open borders established by 1960","Kashmir integrated through negotiation — no Line of Control","Neither India nor Pakistan develops nuclear weapons until 1990s","The subcontinent's most talented people never flee refugee crisis"],narrative:"A slow, negotiated transfer — province by province over 13 years — begins in 1947 but completes in 1960. The violence of 1947 never happens. Communities migrate gradually, retaining property and dignity.\n\nBy 1960, a confederation emerges: India and Pakistan as separate nations but within a South Asian economic community — like the EU, 30 years early.\n\nThe resources spent on three wars and two nuclear programs are channelled into roads, hospitals, and schools for one billion people."},
    ]
  },
  { id:"moon", title:"Apollo 11 Moon Landing", short:"The Leap That Almost Wasn't", year:1969, era:"CONTEMPORARY", region:"Global", cat:"science", emoji:"🌙", grad:"linear-gradient(135deg,#3E5A7E,#161E2C)",
    desc:"July 20, 1969. Humanity's greatest achievement. But what if the most audacious mission in history had gone differently?",
    tags:["Space Race","Cold War","NASA"],
    scenarios:[
      {num:1,title:"Astronauts Stranded on the Moon",tagline:"What if the ascent engine failed?",ripples:["Nixon reads his prepared 'fate has ordained' speech to a stunned world","Space exploration pauses for an entire decade of grief and review","The Moon becomes humanity's most sacred permanent memorial site","The three men celebrated as history's greatest explorers","Safety protocols transform — NASA's culture changes fundamentally"],narrative:"The Eagle has landed. But when Armstrong and Aldrin attempt to fire the ascent engine, nothing happens. The engine that will carry them back to Columbia has failed.\n\nMission Control works for 32 hours. Nothing works. Nixon reads his prepared speech: 'Fate has ordained that the men who went to the Moon to explore in peace will stay on the Moon to rest in peace.'\n\nThe Moon becomes humanity's most sacred memorial. Space exploration pauses for ten years."},
      {num:2,title:"Soviets Land First",tagline:"What if the cosmonaut beat Armstrong?",ripples:["Soviet Union wins the Space Race — the ideological battle decided","US Congress triples NASA budget immediately — race to Mars begins","American scientific community galvanized by unprecedented defeat","Cold War psychological balance shifts dramatically for a decade","Moon base established by both superpowers by 1975 in rivalry"],narrative:"July 12, 1969. Soviet cosmonaut Alexei Leonov descends a ladder onto the lunar surface. The Soviet flag is planted. Pravda runs the headline for 48 hours.\n\nNASA Mission Control watches the Soviet feed in silence. Armstrong, launching 8 days later, arrives at a Moon already visited.\n\nThe defeat galvanizes America. Congress triples NASA's budget. By 1975, both superpowers have permanent Moon bases. The Space Age we were promised actually happens."},
      {num:3,title:"Moon Colony by 1985",tagline:"What if Nixon funded the next step?",ripples:["Permanent Moon base houses 50 humans by 1980","Mars landing by Neil Armstrong in 1985 — the next giant leap","Space industry creates new economic sector pulling US out of 1970s malaise","Climate change discovered earlier from orbital observation platforms","Space-based solar power solves 1973 oil crisis"],narrative:"Nixon, riding the Apollo 11 wave, makes the boldest political decision in American history: a permanent Moon colony by 1980, Mars by 1990. Congress approves.\n\nNASA's budget is ten times larger than in reality. By 1980, Moonbase Armstrong houses 50 people. By 1985, Neil Armstrong walks on Mars.\n\nThe space industry creates an entirely new economic sector — pulling America out of the stagnation that Vietnam and Watergate caused in real history."},
      {num:4,title:"Moon Landing Never Attempted",tagline:"What if Apollo 1 ended the program?",ripples:["Moon remains unvisited by humans — to this very day","Space exploration focuses on unmanned missions — more data, less drama","The $25 billion saved redirected to urban development and education","No 'space generation' of engineers inspired by Moon landing","Global cooperation in space happens earlier — no nationalist race"],narrative:"January 27, 1967. Apollo 1 fire kills three astronauts. Congress, horrified, cancels the manned Moon program entirely.\n\nJuly 1969. No special broadcast. The Moon hangs in the sky — untouched, pristine.\n\nWithout the Moon landing's inspiration, a generation of engineers isn't born. But the $25 billion is redirected to education, healthcare, urban development. A different America. Not better, not worse — just different."},
      {num:5,title:"China Lands First in 1969",tagline:"What if there were three entrants?",ripples:["Three-way space race drives unprecedented global investment","China becomes space and tech superpower 50 years ahead of schedule","Asian century begins in 1975 not 2000","Cold War becomes three-polar — fundamentally different geopolitics","Space becomes Asia-Pacific dominated"],narrative:"China, which in reality had its own quietly cancelled lunar program, succeeds in this timeline. July 25, 1969: five days after Armstrong, a Chinese taikonaut plants the five-star red flag on the lunar surface.\n\nThree flags on the Moon within a week. A three-way space race begins — and with it, a three-polar Cold War.\n\nChina becomes a technology superpower in the 1970s instead of the 2000s. The Asian century begins 25 years early."},
    ]
  },
  { id:"alexander", title:"Alexander the Great Survives", short:"The King Who Lived On", year:323, era:"ANCIENT", region:"Global", cat:"ancient", emoji:"⚔️", grad:"linear-gradient(135deg,#8A6E2E,#2E2410)",
    desc:"Alexander the Great died at 32 in Babylon — possibly the most consequential early death in history. What if he had lived another 40 years?",
    tags:["Ancient","Alexander","Greece"],
    scenarios:[
      {num:1,title:"Alexander Conquers Arabia",tagline:"What if he completed his next campaign?",ripples:["Greco-Persian civilization spanning from Greece to the borders of China","Alexandria becomes world capital with 3 million people by 200 BC","Scientific revolution happens in 100 BC not 1600 AD","Roman Empire never needs to rise","Christianity and Islam emerge in a very different context"],narrative:"323 BC. Alexander, instead of dying of fever in Babylon, recovers. His next campaign — Arabia — begins within months.\n\nBy 315 BC, the Arabian Peninsula is Macedonian. By 290, Alexander commands an empire stretching from Greece to the borders of China.\n\nThe Pax Alexandrina accelerates science, trade, and philosophy by 500 years. The world of 100 BC looks like our world of 1700 AD."},
      {num:2,title:"Greece and India United",tagline:"What if he allied with Chandragupta?",ripples:["Greco-Indian civilization — Sanskrit and Greek merge","Buddhism spreads west through Greek networks 500 years early","Indian mathematics meets Greek geometry — revolution of knowledge","Trade routes from Athens to Pataliputra fully open","First truly global civilization by 200 BC"],narrative:"Alexander, surviving, returns to India. Instead of fighting Chandragupta Maurya, he forms an alliance — recognizing the Mauryan king as an equal.\n\nThe Greco-Mauryan civilization is unprecedented: Greek logic and Indian mathematics merge, producing calculus by 200 BC. Sanskrit and Greek scholars work together in Alexandria.\n\nThe world's first truly global civilization is born in 300 BC — 1,800 years ahead of schedule."},
      {num:3,title:"The Empire That Held Together",tagline:"What if his successors didn't fight?",ripples:["No 'Wars of the Diadochi' — empire stays unified","Single Hellenistic civilization dominates Eurasia for 500 years","Roman Republic never becomes necessary","Christianity emerges within Greek philosophical context from birth","Industrial revolution happens in 0 AD not 1750 AD"],narrative:"Alexander dies at 32 — but in this timeline, he designates clear succession. His son, with a council of generals bound by oath, maintains unity.\n\nWithout the devastating Wars of the Diadochi, the Hellenistic world remains unified for 300 more years. Rome never needs to rise.\n\nBy 0 AD, this civilization has the equivalent of our 1700s technology. The question becomes: do they reach the Moon by 500 AD?"},
      {num:4,title:"Alexander Becomes Persian",tagline:"What if he truly went native?",ripples:["Persian culture dominates over Greek in the merged civilization","Zoroastrianism becomes the dominant world religion","Persian language becomes the Latin of antiquity","Western civilization develops on an Eastern philosophical foundation","A fundamentally different moral framework underlies modernity"],narrative:"Alexander fully embraces Persian culture — not as a conqueror in robes, but as a genuine convert. He learns Persian, practices Zoroastrian ceremonies, rules as a Persian King of Kings.\n\nHis successors are Persian-Greek, then primarily Persian. Persian becomes the empire's common tongue.\n\nWestern civilization is built on Eastern foundations. The philosophical basis of modernity is Zoroastrian rather than Greek."},
      {num:5,title:"Alexander Reaches the Americas",tagline:"What if he sailed west?",ripples:["Old World meets New World 1800 years before Columbus","Native American civilizations encounter Greek science early","Disease still spreads but from much smaller initial contact","Two parallel civilizations develop in contact from 280 BC","The world of 2024 has 1800 more years of cross-cultural exchange"],narrative:"310 BC. Alexander, obsessed with what lies beyond the Pillars of Hercules, commissions a massive fleet. Sailing west from Carthage, after months at sea, his ships reach the Caribbean.\n\nThe encounter is different from Columbus's: Alexander is curious, not acquisitive. He establishes a trading colony. Greek mathematics spreads; Mesoamerican astronomy flows east.\n\nTwo civilizations in contact from 280 BC have 1,800 more years of exchange."},
    ]
  },
  { id:"cuban", title:"Cuban Missile Crisis", short:"13 Days That Nearly Ended Everything", year:1962, era:"CONTEMPORARY", region:"Global", cat:"wars", emoji:"☢️", grad:"linear-gradient(135deg,#9E5E28,#2E1A0A)",
    desc:"October 1962: the closest humanity has ever come to nuclear war. 13 days when a single wrong decision could have ended civilization.",
    tags:["Cold War","Nuclear","Kennedy"],
    scenarios:[
      {num:1,title:"Soviet Submarine Fires",tagline:"What if Arkhipov said yes?",ripples:["First nuclear weapon used since Nagasaki — the taboo broken","US launches full nuclear response — 50 million dead in 24 hours","Nuclear winter follows — global famine","Remaining humanity rebuilds over 50 years in the Southern Hemisphere","Survivors create the first true world government from the ashes"],narrative:"October 27, 1962. Soviet submarine B-59, cut off from communications, under depth charge attack. Captain Savitsky believes war has started. He orders the nuclear torpedo armed.\n\nIn reality, Vasili Arkhipov refused to authorize the launch. He saved the world. In this timeline, he is overruled.\n\nWithin 24 hours, humanity has exchanged nuclear warheads. Northern Hemisphere civilization ends. The survivors emerge to rebuild over the next 50 years."},
      {num:2,title:"Khrushchev Refuses All Terms",tagline:"What if the Soviet leader held firm?",ripples:["Limited nuclear exchange over Cuba — civilization-shaking","Both Kennedy and Khrushchev removed by their militaries within weeks","Caribbean contaminated with radiation for a generation","UN Emergency session creates first real world governance body","Nuclear weapons partially abolished by 1964"],narrative:"October 27, 1962. Khrushchev, pushed by hardliners, refuses all Kennedy's demands. The US naval blockade fires on a Soviet submarine. The submarine fires back.\n\nTactical nuclear weapons are used over Cuba. The island is destroyed. Radiation spreads through the Caribbean.\n\nThe world is shocked into sense. Both leaders are removed. A UN emergency session creates the first real world governance body."},
      {num:3,title:"Castro Brokers Peace",tagline:"What if Castro called Kennedy directly?",ripples:["Cuba gains permanent neutral status — the Switzerland of the Americas","Castro becomes unexpected global peace icon — Nobel Peace Prize 1963","Soviet-US relations normalize 20 years earlier","Cuba's independent path becomes model for small nation sovereignty","Cold War de-escalates in 1963 — détente a decade early"],narrative:"October 25, 1962. Fidel Castro, watching the crisis spiral, makes the most surprising phone call in history — directly to Kennedy, without Moscow's knowledge.\n\nCuba agrees to dismantle the missiles in exchange for a non-invasion pledge and normalized relations. Khrushchev, furious but facing a fait accompli, accepts.\n\nCuba is suddenly the world's most consequential small nation. Castro receives the Nobel Peace Prize in 1963."},
      {num:4,title:"Kennedy Accepts the Missiles",tagline:"What if Kennedy blinked first?",ripples:["Soviet missiles remain permanently in Cuba","Kennedy politically destroyed — Republican landslide in 1964","Vietnam War never happens — US foreign policy chastened","A more cautious multilateral America emerges","Different but possibly healthier global role for the United States"],narrative:"Kennedy, advised that nuclear war would kill 70 million Americans while the missiles change little strategically, formally accepts the Soviet position.\n\nThe announcement destroys Kennedy politically. Goldwater wins 1964 in a landslide.\n\nBut: no Vietnam War. A more cautious, multilateral America emerges from the Cuban humiliation. A different, possibly healthier, global role for the world's greatest power."},
      {num:5,title:"The World Unites Against Nuclear War",tagline:"What if October 1962 united humanity?",ripples:["Global disarmament treaty signed by 1964 with real enforcement","Nuclear weapons reduced to zero by 1975","UN Security Council reformed with real power","Cold War continues but as pure ideological competition","The 1970s become a decade of global cooperation"],narrative:"The crisis resolves — barely — but this time Kennedy and Khrushchev use the trauma to genuinely transform the world order.\n\nThe near-miss produces the Nuclear Weapons Elimination Treaty of 1963: every nuclear power agrees to disarm over 10 years, with real verification. By 1975, no nuclear weapons exist anywhere on Earth.\n\nThe Cold War continues — as ideology — but the existential military threat is removed."},
    ]
  },
];

const ERAS = ["ALL","ANCIENT","MODERN","CONTEMPORARY"];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [slide, setSlide] = useState(0);
  const [tab, setTab] = useState("home");
  const [event, setEvent] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [premium, setPremium] = useState(false);
  const [watchCount, setWatchCount] = useState(0);
  const [paywall, setPaywall] = useState(false);
  const [era, setEra] = useState("ALL");
  const [q, setQ] = useState("");
  const [expandN, setExpandN] = useState(false);
  const [expandR, setExpandR] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [pendingWatch, setPendingWatch] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [dynamicEvents, setDynamicEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [upNextScenario, setUpNextScenario] = useState(null);
  const [upNextEvent, setUpNextEvent] = useState(null);
  const [upNextCount, setUpNextCount] = useState(10);
  const [hasSeenOnboard, setHasSeenOnboard] = useState(false);
  const [lang, setLang] = useState("EN");
  const [settingsPage, setSettingsPage] = useState(null);
  const [watched, setWatched] = useState(new Set(["ww1_1","ww1_2","ww2_1"]));
  const [suggestionSent, setSuggestionSent] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [newEvents, setNewEvents] = useState([]);
  const markW = (id) => setWatched(prev => new Set([...prev, id]));

  // ─── FIREBASE AUTH LISTENER ───
  useEffect(()=>{
    // Handle redirect result when user returns from Google sign-in
    getRedirectResult(auth).then(async (result)=>{
      if(result && result.user){
        const user = result.user;
        setLoggedIn(true);
        setUserEmail(user.email);
        setUserName(user.displayName||"");
        const userRef = doc(db,"users",user.uid);
        const snap = await getDoc(userRef);
        const seen = snap.exists() && snap.data().hasSeenOnboard;
        await setDoc(userRef,{email:user.email,name:user.displayName||"",lastSeen:new Date().toISOString(),signedUpAt:snap.exists()?snap.data().signedUpAt:new Date().toISOString()},{merge:true});
        if(!seen){ setHasSeenOnboard(false); setScreen("onboard"); }
        else { setHasSeenOnboard(true); setScreen("home"); }
      }
    }).catch(e=>console.error(e));

    // Load Razorpay checkout.js script
    const rzpScript = document.createElement("script");
    rzpScript.src = "https://checkout.razorpay.com/v1/checkout.js";
    rzpScript.async = true;
    document.body.appendChild(rzpScript);

    // Load events from Firestore (app reads dynamic content from here)
    const loadEvents = async () => {
      try {
        const snap = await getDocs(collection(db,"events"));
        if(snap.size > 0){
          const loaded = [];
          for(const evDoc of snap.docs){
            const evData = evDoc.data();
            if(!evData.title) continue; // skip incomplete docs
            const scenSnap = await getDocs(collection(db,"events",evDoc.id,"scenarios"));
            const scenarios = [];
            scenSnap.forEach(s => { if(s.data().num) scenarios.push(s.data()); });
            scenarios.sort((a,b)=>a.num-b.num);
            if(scenarios.length > 0) loaded.push({...evData, id:evDoc.id, scenarios});
          }
          if(loaded.length > 0) setDynamicEvents(loaded);
        }
      } catch(e){ console.error("Firestore events load failed, using built-in content",e); }
      setEventsLoading(false);
    };
    loadEvents();

    // Load What's New events (sorted by createdAt desc)
    const loadNew = async () => {
      try {
        const snap = await getDocs(collection(db,"events"));
        const ne = [];
        snap.forEach(d => { const data=d.data(); if(data.createdAt) ne.push({...data,id:d.id}); });
        ne.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
        setNewEvents(ne);
      } catch(e) {}
    };
    loadNew();

    const unsub = onAuthStateChanged(auth, async (user)=>{
      if(user){
        setLoggedIn(true);
        setUserEmail(user.email);
        setUserName(user.displayName||"");
        const userRef = doc(db,"users",user.uid);
        const snap = await getDoc(userRef);
        if(snap.exists() && snap.data().isPremium) setPremium(true);
      } else {
        setLoggedIn(false);
      }
      setFirebaseReady(true);
    });
    return ()=>unsub();
  },[]);

  // ─── SIGN OUT ───
  const handleSignOut = async ()=>{ await signOut(auth); setLoggedIn(false); setPremium(false); setUserEmail(""); setUserName(""); };

  const ACTIVE_EVENTS = dynamicEvents.length > 0 ? dynamicEvents : ACTIVE_EVENTS;

  const initiatePayment = async () => {
    if(!auth.currentUser){ setPaywall(false); setScreen("login"); return; }
    if(!window.Razorpay){ setPaymentError("Payment system loading. Please wait a moment and try again."); return; }
    setPaymentLoading(true); setPaymentError("");
    try {
      const res = await fetch("/api/create-order",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({plan:selectedPlan, userId:auth.currentUser.uid, userEmail}),
      });
      if(!res.ok){ const e=await res.json(); throw new Error(e.error||"Order creation failed"); }
      const order = await res.json();
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "KAASH",
        description: `KAASH Ad-Free ${PRICING[selectedPlan].label}`,
        order_id: order.id,
        prefill: {email:userEmail, name:userName},
        notes: {plan:selectedPlan},
        theme: {color:"#E8B84B"},
        modal: {confirm_close:true},
        handler: async (response) => {
          try {
            const vRes = await fetch("/api/verify-payment",{
              method:"POST",
              headers:{"Content-Type":"application/json"},
              body:JSON.stringify({
                razorpay_order_id:response.razorpay_order_id,
                razorpay_payment_id:response.razorpay_payment_id,
                razorpay_signature:response.razorpay_signature,
                plan:selectedPlan, userId:auth.currentUser.uid, userEmail,
              }),
            });
            const vData = await vRes.json();
            if(!vData.success) throw new Error("Payment verification failed");
            const expiry = selectedPlan==="yearly"
              ? new Date(Date.now()+365*24*60*60*1000).toISOString()
              : new Date(Date.now()+30*24*60*60*1000).toISOString();
            await setDoc(doc(db,"users",auth.currentUser.uid),
              {isPremium:true, premiumPlan:selectedPlan, premiumExpiry:expiry, premiumSince:new Date().toISOString()},
              {merge:true});
            await setDoc(doc(db,"payments",response.razorpay_payment_id),{
              userId:auth.currentUser.uid, email:userEmail, name:userName,
              plan:selectedPlan,
              amount:PRICING[selectedPlan].amount,
              currency:"INR",
              razorpayOrderId:response.razorpay_order_id,
              razorpayPaymentId:response.razorpay_payment_id,
              paidAt:new Date().toISOString(),
              financialYear: new Date().getMonth()>=3
                ? `${new Date().getFullYear()}-${new Date().getFullYear()+1}`
                : `${new Date().getFullYear()-1}-${new Date().getFullYear()}`,
              status:"completed",
            });
            setPremium(true); setPaywall(false); setPaymentLoading(false);
          } catch(e){
            setPaymentError("Payment received but verification failed. Email support@kaash.app with payment ID: "+response.razorpay_payment_id);
            setPaymentLoading(false);
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed",(r)=>{ setPaymentError("Payment failed: "+(r.error?.description||"Please try again")); setPaymentLoading(false); });
      rzp.open();
    } catch(e){ setPaymentError(e.message||"Something went wrong. Please try again."); setPaymentLoading(false); }
  };

  const getNextScenario = () => {
    if(!event||!scenario) return {sc:null,ev:null};
    const idx = event.scenarios.findIndex(s=>s.num===scenario.num);
    if(idx<event.scenarios.length-1) return {sc:event.scenarios[idx+1],ev:event};
    const evIdx = ACTIVE_EVENTS.findIndex(e=>e.id===event.id);
    const nextEv = ACTIVE_EVENTS[(evIdx+1)%EVENTS.length];
    return {sc:nextEv.scenarios[0],ev:nextEv};
  };

  const triggerUpNext = () => {
    const {sc,ev} = getNextScenario();
    setUpNextScenario(sc); setUpNextEvent(ev); setUpNextCount(10); setScreen("upnext");
  };

  const s = { display:"flex", flexDirection:"column", background:C.bg, color:C.text, fontFamily:"Georgia,serif", height:640, width:"100%", maxWidth:390, margin:"0 auto", overflow:"hidden", position:"relative" };

  const attemptWatch = (sc, ev) => {
    setScenario(sc); setEvent(ev); setExpandN(false); setExpandR(false);
    if (watchCount >= 2 && !loggedIn) { setPendingWatch({sc,ev}); setScreen("login"); return; }
    if (!premium) setScreen("ad"); else setScreen("disclaimer");
  };

  // ─── ONBOARDING ───
  if (screen==="onboard") {
    const slides=[
      {title:"कaश",sub:"What If History Went Differently?",body:"Every turning point in history balanced on a razor's edge. One moment different — the entire world changes.",emoji:"⚡"},
      {title:"5 Timelines",sub:"Per Historical Event",body:"Five cinematic documentaries per event, each exploring a different way history could have unfolded. 5 minutes each.",emoji:"🎬"},
      {title:"Never Finished",sub:"New Timelines Every Week",body:"History has infinite forks. Every week, a new turning point unlocks. The past is never truly settled — and neither is KAASH.",emoji:"🌍"},
    ];
    const sl=slides[slide];
    return (
      <div style={s}>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",background:`radial-gradient(ellipse at 50% 30%, rgba(232,184,75,0.1) 0%, ${C.bg} 70%)`}}>
          <div style={{fontSize:72,marginBottom:24}}>{sl.emoji}</div>
          <div style={{fontSize:38,fontWeight:900,letterSpacing:6,color:C.gold,marginBottom:8,textAlign:"center"}}>{sl.title}</div>
          <div style={{fontSize:13,color:C.clay,letterSpacing:2,marginBottom:24,textAlign:"center",fontFamily:"sans-serif",textTransform:"uppercase"}}>{sl.sub}</div>
          <div style={{fontSize:15,color:C.textSec,lineHeight:1.7,textAlign:"center",fontFamily:"sans-serif",maxWidth:320}}>{sl.body}</div>
          <div style={{display:"flex",gap:8,marginTop:40}}>
            {slides.map((_,i)=><div key={i} style={{width:i===slide?24:8,height:8,borderRadius:4,background:i===slide?C.gold:C.elevated,transition:"all 0.3s"}}/>)}
          </div>
        </div>
        <div style={{padding:"20px 24px 32px",display:"flex",gap:12}}>
          {slide>0&&<button onClick={()=>setSlide(p=>p-1)} style={{flex:1,padding:"13px 0",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.textSec,cursor:"pointer",fontFamily:"sans-serif",fontSize:14}}>Back</button>}
          <button onClick={async ()=>{
            if(slide<2){ setSlide(p=>p+1); return; }
            setScreen("home");
            if(loggedIn && auth.currentUser){
              try{ await setDoc(doc(db,"users",auth.currentUser.uid),{hasSeenOnboard:true},{merge:true}); }catch(e){}
            }
          }} style={{flex:2,padding:"13px 0",background:C.gold,border:"none",borderRadius:10,color:C.bg,cursor:"pointer",fontFamily:"sans-serif",fontSize:14,fontWeight:700,letterSpacing:1}}>
            {slide<2?"CONTINUE →":"START EXPLORING →"}
          </button>
        </div>
      </div>
    );
  }

  // ─── UP NEXT SCREEN ───
  if (screen==="upnext" && upNextScenario && upNextEvent) {
    return <UpNextScreen
      scenario={upNextScenario} event={upNextEvent} countdown={upNextCount}
      setCountdown={setUpNextCount}
      onPlay={()=>{ setScenario(upNextScenario); setEvent(upNextEvent); setExpandN(false); setExpandR(false); if(!premium)setScreen("ad");else setScreen("disclaimer"); }}
      onSkip={()=>setScreen("home")}
    />;
  }

  // ─── LOGIN GATE ───
  if (screen==="login") {
    return (
      <div style={s}>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 28px",background:`radial-gradient(ellipse at 50% 30%, rgba(232,184,75,0.1) 0%, ${C.bg} 70%)`}}>
          <div style={{fontSize:30,fontWeight:900,letterSpacing:5,color:C.gold,marginBottom:6}}>KAASH</div>
          <div style={{fontSize:14,color:C.text,fontFamily:"sans-serif",textAlign:"center",fontWeight:600,marginBottom:8}}>You've watched your 2 free timelines</div>
          <div style={{fontSize:13,color:C.textSec,fontFamily:"sans-serif",textAlign:"center",lineHeight:1.6,marginBottom:32,maxWidth:300}}>Sign in to keep exploring all 100 events and 500 timelines — completely free.</div>
          <button onClick={async ()=>{ if(!termsChecked) return; try { localStorage.setItem("kaash_terms","1"); await signInWithRedirect(auth, googleProvider); } catch(e){ console.error(e); } }}
            style={{width:"100%",maxWidth:320,padding:"13px 0",background:termsChecked?"#fff":"#5A5247",border:"none",borderRadius:10,color:termsChecked?"#222":"#999",cursor:termsChecked?"pointer":"not-allowed",fontFamily:"sans-serif",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:16,transition:"all 0.2s"}}>
            <span style={{fontSize:18,fontWeight:900,color:termsChecked?"#4285F4":"#999"}}>G</span> Continue with Google
          </button>
          <div onClick={()=>setTermsChecked(p=>!p)} style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",maxWidth:320}}>
            <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${termsChecked?C.gold:C.textMuted}`,background:termsChecked?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all 0.2s"}}>
              {termsChecked&&<CheckCircle size={14} color={C.bg}/>}
            </div>
            <div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.5}}>
              I agree to KAASH's <span style={{color:C.gold,textDecoration:"underline"}}>Terms of Service</span> and <span style={{color:C.gold,textDecoration:"underline"}}>Privacy Policy</span>. I understand all content is alternate history fiction.
            </div>
          </div>
          {!termsChecked&&<div style={{fontSize:10,color:C.clay,fontFamily:"sans-serif",marginTop:12}}>Please accept the terms to continue</div>}
        </div>
        <div style={{padding:"0 28px 28px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <ShieldCheck size={13} color={C.green}/>
          <span style={{fontSize:10,color:C.textMuted,fontFamily:"sans-serif"}}>We store only your email & watch history. Never sold. Deletable anytime.</span>
        </div>
      </div>
    );
  }

  if (screen==="ad") return <AdScreen onDone={()=>setScreen("disclaimer")} onUpgrade={()=>setPaywall(true)} />;
  if (screen==="disclaimer") return <DisclaimerScreen onDone={()=>{ setWatchCount(c=>c+1); setScreen("player"); }} />;

  // ─── PAYWALL ───
  if (paywall) {
    return (
      <div style={{...s,overflowY:"auto"}}>
        <div style={{background:`linear-gradient(180deg,rgba(232,184,75,0.15),transparent)`,padding:"50px 24px 20px",textAlign:"center",position:"relative"}}>
          <button onClick={()=>{setPaywall(false);setPaymentError("");}} style={{position:"absolute",top:50,left:16,background:"transparent",border:"none",color:C.textMuted,cursor:"pointer",fontSize:20}}>✕</button>
          <div style={{fontSize:36,marginBottom:8}}>✦</div>
          <div style={{fontSize:24,fontWeight:900,letterSpacing:3,color:C.gold}}>GO AD-FREE</div>
          <div style={{fontSize:13,color:C.textSec,fontFamily:"sans-serif",marginTop:8,lineHeight:1.6}}>One price. No ads. Full access. Cancel anytime.</div>
        </div>
        <div style={{padding:"0 20px 24px"}}>
          <div style={{marginBottom:14}}>
            {Object.entries(PRICING).map(([key,plan])=>(
              <div key={key} onClick={()=>setSelectedPlan(key)}
                style={{background:selectedPlan===key?C.goldBg:C.card,border:`${selectedPlan===key?2:1}px solid ${selectedPlan===key?C.gold:C.border}`,borderRadius:12,padding:"16px",marginBottom:10,cursor:"pointer",position:"relative"}}>
                {key==="yearly"&&<div style={{position:"absolute",top:-1,right:14,background:C.gold,color:C.bg,fontSize:9,fontWeight:900,padding:"3px 8px",borderRadius:"0 0 6px 6px",letterSpacing:1}}>BEST VALUE</div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,fontFamily:"sans-serif",marginBottom:2}}>{plan.label}</div>
                    {plan.savingNote&&<div style={{fontSize:11,color:C.green,fontFamily:"sans-serif"}}>{plan.savingNote}</div>}
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:24,fontWeight:900,color:selectedPlan===key?C.gold:C.text,fontFamily:"sans-serif"}}>₹{plan.amount}</div>
                    {plan.perMonth&&key==="yearly"&&<div style={{fontSize:10,color:C.green,fontFamily:"sans-serif"}}>₹{plan.perMonth}/month</div>}
                  </div>
                </div>
                {selectedPlan===key&&<CheckCircle size={14} color={C.gold} style={{position:"absolute",top:16,right:16}}/>}
              </div>
            ))}
          </div>
          <div style={{background:C.surface,borderRadius:8,padding:"10px 12px",marginBottom:12,fontSize:11,color:C.textMuted,fontFamily:"sans-serif",lineHeight:1.6}}>
            Final price. No hidden charges. Cancel anytime.
          </div>
          {["🚫 Zero ads — ever","🎬 All timelines on all events","🌐 English + Hindi narration","⚡ New events every week"].map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,fontSize:13,color:C.text,fontFamily:"sans-serif"}}>
              <span>{f}</span>
            </div>
          ))}
          {paymentError&&<div style={{background:"rgba(199,93,74,0.14)",border:"1px solid rgba(199,93,74,0.4)",borderRadius:8,padding:"10px 12px",marginTop:10,fontSize:12,color:C.red,fontFamily:"sans-serif",lineHeight:1.5}}>{paymentError}</div>}
          <button onClick={initiatePayment} disabled={paymentLoading}
            style={{width:"100%",padding:"15px 0",background:paymentLoading?C.elevated:C.gold,border:"none",borderRadius:10,color:paymentLoading?C.textMuted:C.bg,fontSize:14,fontWeight:900,cursor:paymentLoading?"not-allowed":"pointer",fontFamily:"sans-serif",letterSpacing:1,marginTop:14}}>
            {paymentLoading?"OPENING PAYMENT...":"SUBSCRIBE — ₹"+PRICING[selectedPlan].total.toFixed(2)+"/"+PRICING[selectedPlan].label.toLowerCase()}
          </button>
          <div style={{textAlign:"center",fontSize:10,color:C.textMuted,fontFamily:"sans-serif",marginTop:10,lineHeight:1.5}}>
            Secure payment via Razorpay · UPI · Cards · Net Banking<br/>Cancel anytime · No hidden fees
          </div>
          <div style={{height:24}}/>
        </div>
      </div>
    );
  }

  // ─── VIDEO PLAYER ───
  if (screen==="player"&&scenario&&event) {
    return (
      <div style={{...s,overflowY:"auto"}} onContextMenu={(e)=>e.preventDefault()}>
        <div style={{width:"100%",aspectRatio:"16/9",background:event.grad,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",minHeight:200,userSelect:"none"}}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:`${C.gold}ee`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Play size={26} color={C.bg} style={{marginLeft:3}}/></div>
            <div style={{marginTop:12,fontSize:11,color:"rgba(255,255,255,0.7)",fontFamily:"sans-serif"}}>5-minute documentary</div>
          </div>
          <div style={{position:"absolute",top:"42%",right:16,fontSize:13,color:"rgba(255,255,255,0.22)",fontWeight:900,letterSpacing:2,fontFamily:"sans-serif",transform:"rotate(-12deg)",pointerEvents:"none"}}>KAASH</div>
          <div style={{position:"absolute",bottom:10,left:54,fontSize:13,color:"rgba(255,255,255,0.22)",fontWeight:900,letterSpacing:2,fontFamily:"sans-serif",pointerEvents:"none"}}>KAASH</div>
          <button onClick={()=>setScreen("detail")} style={{position:"absolute",top:44,left:12,background:"rgba(0,0,0,0.6)",border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><ArrowLeft size={18} color="#fff"/></button>
          <div style={{position:"absolute",bottom:10,right:16,fontSize:10,color:C.gold,fontFamily:"sans-serif",fontWeight:700,letterSpacing:1}}>TIMELINE {scenario.num} / 5</div>
          <div style={{position:"absolute",top:44,right:12,display:"flex",background:"rgba(0,0,0,0.6)",borderRadius:8,overflow:"hidden"}}>
            {["EN","HI"].map(L=>(
              <button key={L} onClick={()=>setLang(L)} style={{padding:"6px 11px",background:lang===L?C.gold:"transparent",border:"none",color:lang===L?C.bg:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>{L}</button>
            ))}
          </div>
        </div>
        <div style={{padding:"16px 20px 0"}}>
          <div style={{fontSize:10,color:C.gold,letterSpacing:1,fontFamily:"sans-serif",fontWeight:700,marginBottom:4}}>{event.short}</div>
          <div style={{fontSize:20,fontWeight:900,lineHeight:1.2,marginBottom:4}}>{scenario.title}</div>
          <div style={{fontSize:13,color:C.textSec,fontStyle:"italic",fontFamily:"sans-serif",marginBottom:10}}>"{scenario.tagline}"</div>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            <span style={{fontSize:10,color:C.gold,background:C.goldBg,borderRadius:4,padding:"4px 9px",fontFamily:"sans-serif",fontWeight:700}}>🔊 {lang==="EN"?"English":"हिंदी"} Narration</span>
            <span style={{fontSize:10,color:C.textSec,background:C.surface,borderRadius:4,padding:"4px 9px",fontFamily:"sans-serif"}}>CC English Subtitles</span>
          </div>
          <div style={{height:1,background:C.border,marginBottom:16}}/>
          {[
            {label:"THE ALTERNATE HISTORY",key:"n",expanded:expandN,toggle:()=>setExpandN(p=>!p),accent:C.gold,content:<div style={{color:C.textSec,fontSize:13,lineHeight:1.8,fontFamily:"sans-serif"}}>{scenario.narrative.split("\n\n").map((p,i)=><p key={i} style={{marginBottom:12}}>{p}</p>)}</div>},
            {label:"RIPPLE EFFECTS",key:"r",expanded:expandR,toggle:()=>setExpandR(p=>!p),accent:C.clay,content:<div style={{display:"flex",flexDirection:"column",gap:8}}>{scenario.ripples.map((r,i)=><div key={i} style={{background:C.surface,borderRadius:8,padding:"10px 12px",display:"flex",gap:10}}><div style={{minWidth:22,height:22,background:C.clayBg,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:C.clay,fontFamily:"sans-serif"}}>{i+1}</div><span style={{fontSize:12,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.5}}>{r}</span></div>)}</div>},
          ].map(item=>(
            <div key={item.key} style={{marginBottom:16}}>
              <div onClick={item.toggle} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",marginBottom:item.expanded?12:0}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:3,height:18,background:item.accent,borderRadius:2}}/><span style={{fontSize:11,letterSpacing:2,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>{item.label}</span></div>
                {item.expanded?<ChevronUp size={18} color={C.gold}/>:<ChevronDown size={18} color={C.gold}/>}
              </div>
              {item.expanded&&item.content}
            </div>
          ))}
          <button onClick={()=>{ const sId=event.id+"_"+scenario.num; markW(sId); triggerUpNext(); }} style={{width:"100%",padding:"13px 0",background:C.gold,border:"none",borderRadius:10,color:C.bg,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",letterSpacing:1,marginBottom:12}}>✓ DONE — PLAY NEXT TIMELINE</button>
          <div style={{display:"flex",gap:12,marginBottom:40}}>
            <button style={{flex:1,padding:"11px 0",border:`1px solid ${C.green}`,borderRadius:10,background:C.greenBg,color:C.green,cursor:"pointer",fontFamily:"sans-serif",fontSize:12,fontWeight:700,letterSpacing:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Share2 size={14}/>SHARE ON WHATSAPP</button>
            <button style={{padding:"11px 16px",border:`1px solid ${C.border}`,borderRadius:10,background:"transparent",color:C.textSec,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Bookmark size={14}/></button>
          </div>
        </div>
      </div>
    );
  }

  // ─── EVENT DETAIL ───
  if (screen==="detail"&&event) {
    return (
      <div style={{...s,overflowY:"auto"}}>
        <div style={{background:event.grad,minHeight:220,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative"}}>
          <div style={{fontSize:72}}>{event.emoji}</div>
          <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom, rgba(0,0,0,0.3), transparent, ${C.bg})`}}/>
          <button onClick={()=>setScreen("home")} style={{position:"absolute",top:44,left:12,background:"rgba(0,0,0,0.5)",border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><ArrowLeft size={18} color="#fff"/></button>
          <div style={{position:"absolute",bottom:16,right:14,background:C.clayBg,border:`1px solid ${C.clay}`,borderRadius:4,padding:"4px 10px"}}><span style={{fontSize:9,fontWeight:700,color:C.clay,letterSpacing:1,fontFamily:"sans-serif"}}>WORLD-CHANGING</span></div>
        </div>
        <div style={{padding:"0 22px 0"}}>
          <div style={{fontSize:9,letterSpacing:2,color:C.gold,fontFamily:"sans-serif",marginBottom:6,background:C.goldBg,display:"inline-block",padding:"3px 8px",borderRadius:3,marginTop:4}}>{event.era} ERA</div>
          <div style={{fontSize:22,fontWeight:900,lineHeight:1.2,marginBottom:8}}>{event.title}</div>
          <div style={{display:"flex",gap:16,marginBottom:12}}><span style={{fontSize:12,color:C.gold,fontFamily:"sans-serif"}}>📅 {event.year}</span><span style={{fontSize:12,color:C.textSec,fontFamily:"sans-serif"}}>📍 {event.region}</span></div>
          <div style={{fontSize:13,color:C.textSec,lineHeight:1.7,fontFamily:"sans-serif",marginBottom:14}}>{event.desc}</div>
          <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>{event.tags.map(t=><span key={t} style={{fontSize:11,color:C.goldLight,background:C.goldBg,borderRadius:3,padding:"3px 8px",fontFamily:"sans-serif"}}>#{t}</span>)}</div>
          <div style={{height:1,background:C.border,marginBottom:18}}/>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:3,height:20,background:C.gold,borderRadius:2}}/>
            <div><div style={{fontSize:11,letterSpacing:2,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>5 ALTERNATE TIMELINES</div><div style={{fontSize:11,color:C.textMuted,fontFamily:"sans-serif"}}>Each one a 5-minute documentary</div></div>
          </div>
          {event.scenarios.map((sc,i)=>(
            <div key={i} onClick={()=>attemptWatch(sc,event)} style={{background:C.card,borderRadius:12,marginBottom:10,display:"flex",cursor:"pointer",overflow:"hidden",border:`1px solid ${C.border}`}}>
              <div style={{width:90,minHeight:80,background:event.grad,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{position:"relative",fontSize:28}}>{event.emoji}</span>
                <div style={{position:"absolute",top:7,left:7,width:22,height:22,background:C.gold,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:11,fontWeight:900,color:C.bg,fontFamily:"sans-serif"}}>{i+1}</span></div>
              </div>
              <div style={{padding:"11px 12px",flex:1}}>
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:4}}><div style={{width:30,height:30,borderRadius:"50%",background:C.goldBg,display:"flex",alignItems:"center",justifyContent:"center"}}><Play size={14} color={C.gold} style={{marginLeft:2}}/></div></div>
                <div style={{fontSize:14,fontWeight:700,marginBottom:2,lineHeight:1.2}}>{sc.title}</div>
                <div style={{fontSize:11,color:C.textSec,fontStyle:"italic",fontFamily:"sans-serif",marginBottom:6,lineHeight:1.4}}>{sc.tagline}</div>
                <div style={{fontSize:10,color:C.textMuted,fontFamily:"sans-serif"}}><Clock size={10} style={{display:"inline",verticalAlign:"middle"}}/> 5:00 · {sc.ripples.length} ripple effects</div>
              </div>
            </div>
          ))}
          <div style={{height:32}}/>
        </div>
      </div>
    );
  }

  // ─── MAIN TABS ───
  const filtered = ACTIVE_EVENTS.filter(e=>{
    const matchE=era==="ALL"||e.era===era;
    const matchQ=!q||e.title.toLowerCase().includes(q.toLowerCase())||e.tags.some(t=>t.toLowerCase().includes(q.toLowerCase()));
    return matchE&&matchQ;
  });

  const Row = ({title,events:evts})=>(
    <div style={{marginBottom:26}}>
      <div style={{padding:"0 20px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}><div style={{width:3,height:16,background:C.gold,borderRadius:2}}/><span style={{fontSize:11,letterSpacing:2,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>{title}</span></div>
      <div style={{display:"flex",gap:12,paddingLeft:20,paddingRight:20,overflowX:"auto",paddingBottom:8,scrollbarWidth:"none"}}>
        {evts.map(e=>(
          <div key={e.id} onClick={()=>{setEvent(e);setScreen("detail");}} style={{flexShrink:0,width:130,cursor:"pointer"}}>
            <div style={{width:130,height:170,background:e.grad,borderRadius:12,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",marginBottom:8,border:`1px solid ${C.border}`}}>
              <span style={{fontSize:44}}>{e.emoji}</span>
              <div style={{position:"absolute",bottom:8,left:8,background:"rgba(0,0,0,0.7)",borderRadius:3,padding:"2px 6px"}}><span style={{fontSize:10,fontWeight:700,color:C.gold,fontFamily:"sans-serif"}}>{e.year}</span></div>
              <div style={{position:"absolute",top:8,right:8,background:C.goldBg,border:`1px solid ${C.goldDark}`,borderRadius:3,padding:"2px 5px"}}><span style={{fontSize:9,color:C.gold,fontFamily:"sans-serif"}}>5 ⑂</span></div>
            </div>
            <div style={{fontSize:12,fontWeight:700,lineHeight:1.3,color:C.text}}>{e.short}</div>
            <div style={{fontSize:10,color:C.textMuted,fontFamily:"sans-serif",marginTop:2}}>{e.region}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const HomeTab=()=>{
    const featured=ACTIVE_EVENTS[2];
    return (
      <div style={{flex:1,overflowY:"auto",paddingBottom:20}}>
        <div style={{background:featured.grad,minHeight:210,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"0 22px 22px",position:"relative"}}>
          <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom,rgba(26,22,19,0.4),transparent,${C.bg})`}}/>
          <div style={{position:"relative"}}>
            <div style={{fontSize:9,letterSpacing:3,color:C.gold,fontFamily:"sans-serif",fontWeight:700,marginBottom:4}}>★ TIMELINE OF THE WEEK</div>
            <div style={{fontSize:22,fontWeight:900,lineHeight:1.2,marginBottom:4}}>{featured.title}</div>
            <div style={{fontSize:12,color:C.textSec,fontFamily:"sans-serif",marginBottom:14}}>{featured.year} · {featured.region}</div>
            <button onClick={()=>{setEvent(featured);setScreen("detail");}} style={{padding:"10px 18px",background:C.gold,border:"none",borderRadius:8,color:C.bg,fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"sans-serif",letterSpacing:1}}>EXPLORE 5 TIMELINES →</button>
          </div>
        </div>
        <div style={{background:C.surface,display:"flex",justifyContent:"space-around",padding:"12px 16px",marginBottom:20}}>
          {[["100","ACTIVE_EVENTS"],["500","TIMELINES"],["5","ERAS"],["5:00","PER VIDEO"]].map(([v,l])=>(<div key={l} style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:900,color:C.gold,fontFamily:"sans-serif"}}>{v}</div><div style={{fontSize:9,letterSpacing:2,color:C.textMuted,fontFamily:"sans-serif"}}>{l}</div></div>))}
        </div>
        <Row title="INDIA'S ALTERNATE HISTORY" events={ACTIVE_EVENTS.filter(e=>e.cat==="india"||e.region==="South Asia")}/>
        <Row title="WORLD WARS & CONFLICTS" events={ACTIVE_EVENTS.filter(e=>e.cat==="wars")}/>
        <Row title="SCIENTIFIC TURNING POINTS" events={ACTIVE_EVENTS.filter(e=>e.cat==="science"||e.id==="moon")}/>
        <Row title="ANCIENT WORLD" events={ACTIVE_EVENTS.filter(e=>e.cat==="ancient")}/>
        <Row title="ALL ACTIVE_EVENTS" events={ACTIVE_EVENTS}/>
      </div>
    );
  };

  const ExploreTab=()=>(
    <div style={{flex:1,overflowY:"auto",padding:"16px 0 20px"}}>
      <div style={{padding:"0 20px 16px",display:"flex",alignItems:"center",gap:10}}><div style={{width:3,height:20,background:C.gold}}/><div><div style={{fontSize:13,letterSpacing:2,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>BROWSE BY ERA</div><div style={{fontSize:11,color:C.textMuted,fontFamily:"sans-serif"}}>Filter history by time period</div></div></div>
      <div style={{display:"flex",gap:8,padding:"0 20px",overflowX:"auto",marginBottom:20,scrollbarWidth:"none"}}>
        {ERAS.map(e=><button key={e} onClick={()=>setEra(e)} style={{padding:"7px 14px",borderRadius:6,border:`1px solid ${era===e?C.gold:C.border}`,background:era===e?C.goldBg:"transparent",color:era===e?C.gold:C.textMuted,fontSize:10,letterSpacing:1,cursor:"pointer",fontFamily:"sans-serif",fontWeight:era===e?700:400,whiteSpace:"nowrap",flexShrink:0}}>{e}</button>)}
      </div>
      <div style={{padding:"0 16px"}}>
        {filtered.map(e=>(
          <div key={e.id} onClick={()=>{setEvent(e);setScreen("detail");}} style={{background:C.card,borderRadius:12,marginBottom:10,display:"flex",cursor:"pointer",overflow:"hidden",border:`1px solid ${C.border}`}}>
            <div style={{width:100,minHeight:90,background:e.grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,position:"relative"}}><span style={{fontSize:32}}>{e.emoji}</span><div style={{position:"absolute",bottom:7,left:7,background:"rgba(0,0,0,0.7)",borderRadius:3,padding:"2px 5px"}}><span style={{fontSize:10,fontWeight:700,color:C.gold,fontFamily:"sans-serif"}}>{e.year}</span></div></div>
            <div style={{padding:"12px 12px",flex:1}}><div style={{fontSize:9,color:C.gold,background:C.goldBg,borderRadius:3,padding:"2px 6px",display:"inline-block",marginBottom:6,fontFamily:"sans-serif",fontWeight:700,letterSpacing:1}}>{e.era}</div><div style={{fontSize:13,fontWeight:700,lineHeight:1.3,marginBottom:4}}>{e.title}</div><div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",marginBottom:6,lineHeight:1.4}}>{e.desc.substring(0,60)}...</div><div style={{fontSize:10,color:C.gold,fontFamily:"sans-serif"}}>⑂ 5 alternate timelines · {e.region}</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  const sendSuggestion = async () => {
    if(!q.trim()||suggestionSent) return;
    try {
      const id = q.toLowerCase().replace(/[^a-z0-9]+/g,"_").slice(0,50);
      const ref = doc(db,"suggestions",id);
      const snap = await getDoc(ref);
      if(snap.exists()) {
        await setDoc(ref,{count:(snap.data().count||0)+1,lastRequested:new Date().toISOString()},{merge:true});
      } else {
        await setDoc(ref,{query:q.trim(),count:1,createdAt:new Date().toISOString(),lastRequested:new Date().toISOString(),status:"pending"});
      }
      setSuggestionSent(true);
    } catch(e){ console.error(e); }
  };

  const SearchTab=()=>(
    <div style={{flex:1,overflowY:"auto",padding:"16px 16px 20px"}}>
      <div style={{position:"relative",marginBottom:16}}>
        <Search size={16} color={C.gold} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/>
        <input value={q} onChange={e=>{setQ(e.target.value);setSuggestionSent(false);}} placeholder="Search events, eras, regions..."
          style={{width:"100%",background:C.surface,border:`1px solid ${q?C.gold:C.border}`,borderRadius:10,padding:"11px 12px 11px 38px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"sans-serif"}}/>
        {q&&<button onClick={()=>{setQ("");setSuggestionSent(false);}} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:C.textMuted,cursor:"pointer",fontSize:16}}>✕</button>}
      </div>
      {!q&&<div style={{marginBottom:20}}>
        <div style={{fontSize:10,letterSpacing:2,color:C.textMuted,fontFamily:"sans-serif",marginBottom:10}}>POPULAR TOPICS</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {["WW1","WW2","India","Moon","Alexander","Cuba","Nuclear","Partition","Ancient","Space"].map(tag=>(
            <button key={tag} onClick={()=>setQ(tag)} style={{padding:"7px 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:20,color:C.textSec,fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>#{tag}</button>
          ))}
        </div>
      </div>}
      {filtered.map(e=>(
        <div key={e.id} onClick={()=>{setEvent(e);setScreen("detail");}} style={{background:C.card,borderRadius:10,marginBottom:8,padding:"12px 14px",cursor:"pointer",display:"flex",gap:12,alignItems:"center",border:`1px solid ${C.border}`}}>
          <span style={{fontSize:28,flexShrink:0}}>{e.emoji}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,lineHeight:1.3}}>{e.title}</div>
            <div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",marginTop:2}}>{e.year} · {e.region} · 5 timelines</div>
          </div>
          <ChevronRight size={16} color={C.textMuted} style={{flexShrink:0}}/>
        </div>
      ))}
      {q&&filtered.length===0&&(
        <div style={{textAlign:"center",padding:"32px 20px"}}>
          <div style={{fontSize:32,marginBottom:12}}>🔍</div>
          <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>No results for "{q}"</div>
          <div style={{fontSize:13,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.6,marginBottom:20}}>We don't have this yet. Suggest it to us and we'll add it!</div>
          {!suggestionSent
            ? <button onClick={sendSuggestion} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",background:C.gold,border:"none",borderRadius:10,color:C.bg,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
                <Send size={14}/> Suggest "{q}"
              </button>
            : <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",background:C.greenBg,border:`1px solid ${C.green}`,borderRadius:10,color:C.green,fontSize:13,fontWeight:700,fontFamily:"sans-serif"}}>
                <CheckCircle size={14}/> Suggestion sent! We'll review it.
              </div>
          }
        </div>
      )}
    </div>
  );

  const WhatsNewTab=()=>{
    const isNew = (d) => d && (Date.now()-new Date(d).getTime()) < 7*24*60*60*1000;
    return (
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
          <div style={{width:3,height:20,background:C.gold,borderRadius:2}}/>
          <div style={{fontSize:13,letterSpacing:2,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>WHAT'S NEW</div>
        </div>
        <div style={{fontSize:12,color:C.textMuted,fontFamily:"sans-serif",marginBottom:20}}>New events and timelines added to KAASH</div>
        {newEvents.length===0 ? (
          <div style={{textAlign:"center",padding:"48px 20px"}}>
            <div style={{fontSize:40,marginBottom:12}}>🎬</div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>New drop every Tuesday</div>
            <div style={{fontSize:13,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.6}}>New alternate history events are added every week. Check back on Tuesday for the latest timelines.</div>
          </div>
        ) : newEvents.map((e,i)=>(
          <div key={e.id||i} onClick={()=>{setEvent(e);setScreen("detail");}} style={{background:C.card,borderRadius:12,marginBottom:12,overflow:"hidden",cursor:"pointer",border:`1px solid ${C.border}`}}>
            <div style={{background:e.grad||"linear-gradient(135deg,#2A2418,#0E0C0A)",height:100,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              <span style={{fontSize:40}}>{e.emoji||"📜"}</span>
              {isNew(e.createdAt)&&<div style={{position:"absolute",top:10,left:10,background:C.gold,borderRadius:4,padding:"3px 9px",fontSize:10,fontWeight:700,color:C.bg,letterSpacing:1}}>NEW</div>}
              <div style={{position:"absolute",bottom:8,right:10,fontSize:10,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>📅 {e.year}</div>
            </div>
            <div style={{padding:"12px 14px"}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:4,lineHeight:1.3}}>{e.title}</div>
              <div style={{fontSize:12,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.5,marginBottom:8}}>{e.desc?.slice(0,80)}...</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,color:C.textMuted,fontFamily:"sans-serif"}}>{e.region} · {e.era}</span>
                <span style={{fontSize:11,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>5 timelines →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ProfileTab=()=>{
    const pct=Math.round(USER.watched/USER.total*100);
    return (
      <div style={{flex:1,overflowY:"auto",padding:"0 0 20px"}}>
        <div style={{background:`linear-gradient(135deg,${C.goldBg},transparent)`,padding:"40px 24px 24px",textAlign:"center"}}>
          <div style={{width:70,height:70,borderRadius:"50%",background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 12px"}}>🎓</div>
          <div style={{fontSize:20,fontWeight:900}}>{loggedIn?(userName||USER.name):"Guest Explorer"}</div>
          <div style={{fontSize:11,color:C.gold,letterSpacing:2,fontFamily:"sans-serif",marginTop:4}}>{loggedIn?USER.level:"Not signed in"}</div>
          {premium ? <div style={{marginTop:10,padding:"6px 16px",background:C.goldBg,border:`1px solid ${C.goldDark}`,borderRadius:20,display:"inline-block",fontSize:11,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>✦ AD-FREE MEMBER</div>
            : <button onClick={()=>setPaywall(true)} style={{marginTop:12,padding:"8px 20px",background:C.gold,border:"none",borderRadius:8,color:C.bg,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>GO AD-FREE — ₹49/MONTH</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 16px 20px"}}>
          {[[<Flame size={20} color={C.clay}/>,USER.streak,"DAY STREAK"],[<Zap size={20} color={C.gold}/>,USER.xp,"XP EARNED"],[<Star size={20} color={C.gold}/>,USER.watched,"WATCHED"],[<Globe size={20} color={C.green}/>,USER.badges.length,"BADGES"]].map(([icon,val,label],i)=>(
            <div key={i} style={{background:C.card,borderRadius:10,padding:"14px",textAlign:"center",border:`1px solid ${C.border}`}}><div style={{marginBottom:6}}>{icon}</div><div style={{fontSize:22,fontWeight:900,color:C.text,fontFamily:"sans-serif"}}>{val}</div><div style={{fontSize:9,letterSpacing:1.5,color:C.textMuted,fontFamily:"sans-serif"}}>{label}</div></div>
          ))}
        </div>
        <div style={{padding:"0 16px 16px"}}>
          <div style={{fontSize:11,letterSpacing:2,color:C.gold,fontFamily:"sans-serif",fontWeight:700,marginBottom:12}}>TIMELINES EXPLORED</div>
          <div style={{background:C.card,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,fontFamily:"sans-serif"}}>{USER.watched} of {USER.total}</span><span style={{fontSize:13,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>{pct}%</span></div><div style={{height:6,background:C.elevated,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${C.gold},${C.goldLight})`,borderRadius:3}}/></div></div>
        </div>
        <div style={{padding:"0 16px 16px"}}>
          <div style={{fontSize:11,letterSpacing:2,color:C.gold,fontFamily:"sans-serif",fontWeight:700,marginBottom:12}}>YOUR PRIVACY</div>
          <div style={{background:C.card,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`,display:"flex",gap:12,alignItems:"flex-start"}}><ShieldCheck size={18} color={C.green} style={{flexShrink:0,marginTop:2}}/><div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.6}}>We store only your email and watch history. We never sell your data. Delete everything anytime from Settings.</div></div>
        </div>
        <div style={{padding:"0 16px"}}>
          <button onClick={()=>setSettingsPage("menu")} style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:C.card,borderRadius:10,padding:"15px 16px",cursor:"pointer",border:`1px solid ${C.border}`}}>
            <SettingsIcon size={18} color={C.gold}/>
            <span style={{fontSize:14,color:C.text,fontFamily:"sans-serif"}}>Settings</span>
            <ChevronRight size={18} color={C.textMuted} style={{marginLeft:"auto"}}/>
          </button>
        </div>
      </div>
    );
  };

  const tabs=[{id:"home",icon:<Home size={20}/>,label:"Home"},{id:"new",icon:<Bell size={20}/>,label:"New"},{id:"search",icon:<Search size={20}/>,label:"Search"},{id:"explore",icon:<Compass size={20}/>,label:"Explore"},{id:"profile",icon:<User size={20}/>,label:"Profile"}];

  return (
    <div style={s}>
      <div style={{background:C.surface,padding:"44px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div><span style={{fontSize:22,fontWeight:900,letterSpacing:4,color:C.gold}}>KAASH</span><span style={{fontSize:9,color:C.textMuted,letterSpacing:2,fontFamily:"sans-serif",marginLeft:8}}>कaश</span></div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {premium && <div style={{fontSize:9,color:C.gold,fontFamily:"sans-serif",fontWeight:700,background:C.goldBg,padding:"4px 8px",borderRadius:12,border:`1px solid ${C.goldDark}`}}>AD-FREE</div>}
          <div style={{display:"flex",alignItems:"center",gap:4,background:C.card,borderRadius:20,padding:"5px 10px"}}><Flame size={14} color={C.clay}/><span style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"sans-serif"}}>{USER.streak}</span></div>
        </div>
      </div>
      {tab==="home"&&<HomeTab/>}
      {tab==="explore"&&<ExploreTab/>}
      {tab==="new"&&<WhatsNewTab/>}
      {tab==="search"&&<SearchTab/>}
      {tab==="profile"&&<ProfileTab/>}
      <div style={{background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-around",padding:"10px 0 14px",flexShrink:0}}>
        {tabs.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",border:"none",cursor:"pointer",padding:"4px 16px",color:tab===t.id?C.gold:C.textMuted}}>{t.icon}<span style={{fontSize:10,fontFamily:"sans-serif",fontWeight:tab===t.id?700:400,letterSpacing:0.5}}>{t.label}</span></button>))}
      </div>
    </div>
  );
}

function UpNextScreen({scenario,event,countdown,setCountdown,onPlay,onSkip}){
  useEffect(()=>{
    if(countdown<=0){onPlay();return;}
    const t=setTimeout(()=>setCountdown(c=>c-1),1000);
    return()=>clearTimeout(t);
  },[countdown,onPlay,setCountdown]);
  return(
    <div style={{display:"flex",flexDirection:"column",background:C.bg,color:C.text,fontFamily:"Georgia,serif",height:640,width:"100%",maxWidth:390,margin:"0 auto",position:"relative"}}>
      <div style={{background:event.grad,height:180,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",flexShrink:0}}>
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)"}}/>
        <span style={{fontSize:64,position:"relative"}}>{event.emoji}</span>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 28px",textAlign:"center"}}>
        <div style={{fontSize:11,color:C.green,letterSpacing:2,fontFamily:"sans-serif",fontWeight:700,marginBottom:16}}>✓ TIMELINE COMPLETE</div>
        <div style={{fontSize:11,color:C.textMuted,letterSpacing:1,fontFamily:"sans-serif",marginBottom:8}}>UP NEXT</div>
        <div style={{fontSize:20,fontWeight:900,lineHeight:1.2,marginBottom:6}}>{scenario.title}</div>
        <div style={{fontSize:13,color:C.textSec,fontStyle:"italic",fontFamily:"sans-serif",marginBottom:6}}>"{scenario.tagline}"</div>
        <div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",marginBottom:28}}>from: {event.short}</div>
        <div style={{width:64,height:64,borderRadius:"50%",border:`3px solid ${C.gold}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:24,position:"relative"}}>
          <span style={{fontSize:22,fontWeight:900,color:C.gold,fontFamily:"sans-serif"}}>{countdown}</span>
        </div>
      </div>
      <div style={{padding:"0 24px 32px",display:"flex",gap:12,flexShrink:0}}>
        <button onClick={onSkip} style={{flex:1,padding:"13px 0",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.textSec,cursor:"pointer",fontFamily:"sans-serif",fontSize:13}}>Home</button>
        <button onClick={onPlay} style={{flex:2,padding:"13px 0",background:C.gold,border:"none",borderRadius:10,color:C.bg,cursor:"pointer",fontFamily:"sans-serif",fontSize:13,fontWeight:700,letterSpacing:1}}>▶ PLAY NOW</button>
      </div>
    </div>
  );
}


function AdScreen({onDone,onUpgrade}){
  const [count,setCount]=useState(5);
  useEffect(()=>{ if(count<=0){onDone();return;} const t=setTimeout(()=>setCount(c=>c-1),1000); return ()=>clearTimeout(t); },[count,onDone]);
  return (
    <div style={{display:"flex",flexDirection:"column",background:"#0E0C0A",color:C.text,fontFamily:"sans-serif",height:640,width:"100%",maxWidth:390,margin:"0 auto",position:"relative"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#2A2418,#0E0C0A)",position:"relative"}}>
        <div style={{fontSize:10,letterSpacing:2,color:C.textMuted,position:"absolute",top:48,left:20}}>ADVERTISEMENT</div>
        <div style={{fontSize:48,marginBottom:16}}>📺</div>
        <div style={{fontSize:16,color:C.textSec,textAlign:"center",maxWidth:260,lineHeight:1.5}}>Your ad plays here.<br/>This is how KAASH stays free.</div>
        <div style={{marginTop:28,fontSize:13,color:C.text}}>Video starts in <span style={{color:C.gold,fontWeight:900,fontSize:18}}>{count}</span></div>
      </div>
      <div style={{padding:"16px 20px 28px",background:C.bg}}>
        <button onClick={onUpgrade} style={{width:"100%",padding:"13px 0",background:"transparent",border:`1px solid ${C.gold}`,borderRadius:10,color:C.gold,fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:1}}>REMOVE ADS — ₹49/MONTH</button>
      </div>
    </div>
  );
}

function DisclaimerScreen({onDone}){
  const [count,setCount]=useState(3);
  useEffect(()=>{ if(count<=0){onDone();return;} const t=setTimeout(()=>setCount(c=>c-1),1000); return ()=>clearTimeout(t); },[count,onDone]);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.bg,color:C.text,fontFamily:"sans-serif",height:640,width:"100%",maxWidth:390,margin:"0 auto",padding:"0 36px",textAlign:"center"}}>
      <div style={{fontSize:32,marginBottom:20}}>📜</div>
      <div style={{fontSize:11,letterSpacing:3,color:C.gold,fontWeight:700,marginBottom:14}}>ALTERNATE HISTORY FICTION</div>
      <div style={{fontSize:15,color:C.textSec,lineHeight:1.7,maxWidth:300}}>The following is a <span style={{color:C.text,fontWeight:600}}>speculative, fictional</span> exploration created for educational entertainment. It does not represent actual historical events or the views of any community, nation, or group.</div>
      <div style={{marginTop:32,width:48,height:48,borderRadius:"50%",border:`2px solid ${C.goldDark}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:C.gold}}>{count}</div>
      <button onClick={onDone} style={{marginTop:24,background:"transparent",border:"none",color:C.textMuted,fontSize:12,cursor:"pointer",letterSpacing:1}}>SKIP →</button>
    </div>
  );
}
