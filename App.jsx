import React, { useState, useEffect, useRef } from "react";

// ─── KAASH v1.14 ─ Cinematic Gold Design System ────────────────────
// Player: YouTube-style, BOTH orientations, user-controlled.
// Design: Cinematic gold palette, prestige documentary aesthetic.
//  • Inline (default): vertical 9:16 frame in the scrolling page.
//  • Fullscreen: fills the screen via an explicit toggle button (works
//    across browsers + Android TWA). Orientation is NOT forced — the
//    device rotation sensor leads, so a vertical video can be fullscreen
//    portrait (immersive, like a Short) OR rotated to landscape, and back.
//  • object-fit:contain keeps aspect ratio in every orientation (no crop).
//  Exactly YouTube: upright by default, rotate on demand, rotate back.
// ────────────────────────────────────────────────────────────────────


import { Home, Compass, Search, User, Flame, Play, ChevronRight, ChevronDown, ChevronUp, Share2, Bookmark, CheckCircle, Clock, Star, ArrowLeft, Zap, Globe, ShieldCheck, X, Settings as SettingsIcon, Bell, Send, Maximize, Minimize } from "lucide-react";

// ─── FIREBASE CONFIG (kaash-app project) ────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBv0ZkzCXD1laS_ijbtMW4VN0Yp3MeW-LU",
  authDomain: "kaash-app.firebaseapp.com",
  projectId: "kaash-app",
  storageBucket: "kaash-app.firebasestorage.app",
  messagingSenderId: "404911023324",
  appId: "1:404911023324:web:83304f9f85bb260e180019",
  measurementId: "G-CJDG7NE58W"
};
// Firebase is loaded DYNAMICALLY (not at module-evaluation time).
// This avoids a known Firebase v10 + Vite production bug where Firebase's
// internal circular module references cause "Cannot access 'X' before
// initialization" when bundled synchronously with app code.
let fb = null;
let fbLoadingPromise = null;
function loadFirebase() {
  if (fbLoadingPromise) return fbLoadingPromise;
  fbLoadingPromise = Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
    import("firebase/firestore"),
  ]).then(([appMod, authMod, fsMod]) => {
    const fbApp = appMod.initializeApp(firebaseConfig);
    fb = {
      auth: authMod.getAuth(fbApp),
      db: fsMod.getFirestore(fbApp),
      googleProvider: new authMod.GoogleAuthProvider(),
      doc: fsMod.doc, setDoc: fsMod.setDoc, getDoc: fsMod.getDoc,
      collection: fsMod.collection, getDocs: fsMod.getDocs,
      signInWithRedirect: authMod.signInWithRedirect,
      getRedirectResult: authMod.getRedirectResult,
      signInWithPopup: authMod.signInWithPopup,
      signOut: authMod.signOut,
      onAuthStateChanged: authMod.onAuthStateChanged,
    };
    return fb;
  });
  return fbLoadingPromise;
}

// ─── WARM CINEMA THEME ──────────────────────────────────────────────
// ─── RAZORPAY CONFIG ─────────────────────────────────────────────────
// Use rzp_test_XXXX while testing, rzp_live_XXXX for production
const RAZORPAY_KEY_ID = "rzp_test_T0QAljI1MTmXyq";

// ─── GOOGLE PLAY BILLING CONFIG ──────────────────────────────────────
// These product IDs must match what you create in Play Console
// Play Console → Monetize → Subscriptions → Create subscription
const PLAY_PRODUCT_IDS = {
  monthly: "kaash_monthly",
  yearly:  "kaash_yearly",
};

// ─── PRICING ─────────────────────────────────────────────────────────
// Prices are EXCLUSIVE of GST (18% on digital services, HSN 9984).
// Web (Razorpay): base price shown, GST added at checkout.
// Play Billing: Google handles tax display automatically.
const GST_RATE = 0.18;
const KAASH_PLANS = {
  monthly: {
    amount: 49,             // ex-GST base price
    gst: +(49 * GST_RATE).toFixed(2),          // ₹8.82
    total: +(49 * (1 + GST_RATE)).toFixed(2),  // ₹57.82
    paise: Math.round(49 * (1 + GST_RATE) * 100), // 5782 paise
    label: "Monthly",
    savingNote: "",
    perMonth: 49,
    days: 30,
  },
  yearly: {
    amount: 499,
    gst: +(499 * GST_RATE).toFixed(2),          // ₹89.82
    total: +(499 * (1 + GST_RATE)).toFixed(2),  // ₹588.82
    paise: Math.round(499 * (1 + GST_RATE) * 100), // 58882 paise
    label: "Yearly",
    savingNote: "Save ₹89 vs monthly",
    perMonth: +(499/12).toFixed(2),
    days: 365,
  },
};

const C = {
  bg:"#080A0C", surface:"#0F1114", card:"#141619", elevated:"#1C1E22", border:"#2A2820",
  accent:"#C9A84C", accentLight:"#E8CA7A", accentDark:"#9A7A2E", accentBg:"rgba(201,168,76,0.10)",
  accent2:"#E8724A", accent2Bg:"rgba(232,114,74,0.12)",
  red:"#E05A5A", green:"#5ABF7A", greenBg:"rgba(90,191,122,0.14)",
  text:"#F0EDE8", textSec:"#9A9490", textMuted:"#5C5850",
  shadow:"0 2px 16px rgba(0,0,0,0.5)", shadowLg:"0 8px 32px rgba(0,0,0,0.6)",
  glow:"0 0 40px rgba(201,168,76,0.15)",
};

// ─── PROGRESS SYSTEM ──────────────────────────────────────────────
// XP is derived from videos watched (no separate counter to keep in
// sync). Rank is the highest threshold the user's XP clears.
const XP_PER_VIDEO = 25;
const RANKS = [
  {min:0,   title:"New Explorer"},
  {min:25,  title:"History Enthusiast"},
  {min:75,  title:"Timeline Explorer"},
  {min:200, title:"Senior Historian"},
  {min:375, title:"Master Historian"},
  {min:625, title:"Grand Chronicler"},
];
const getRank = (xp) => RANKS.reduce((acc,r)=> xp>=r.min ? r.title : acc, RANKS[0].title);
const todayStr = () => new Date().toISOString().slice(0,10);
const yesterdayStr = () => { const d=new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); };

const EVENTS = [
  { id:"ww1", title:"Assassination of Archduke Franz Ferdinand", short:"The Shot That Started WW1", year:1914, era:"MODERN", region:"Europe", cat:"wars", emoji:"🔫", grad:"linear-gradient(135deg,#5C1A1A,#2A0A0A,#080A0C)", badge:"WW1 Scholar",
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
  { id:"ww2", title:"World War II Begins", short:"The War That Shaped Everything", year:1939, era:"MODERN", region:"Global", cat:"wars", emoji:"💣", grad:"linear-gradient(135deg,#1A2A4A,#0A1020,#080A0C)", badge:"WW2 Expert",
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
  { id:"partition", title:"Partition of British India", short:"The Midnight Division", year:1947, era:"CONTEMPORARY", region:"South Asia", cat:"india", emoji:"🇮🇳", grad:"linear-gradient(135deg,#4A2E00,#1A0A00,#080A0C)", badge:"India Historian",
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
  { id:"moon", title:"Apollo 11 Moon Landing", short:"The Leap That Almost Wasn't", year:1969, era:"CONTEMPORARY", region:"Global", cat:"science", emoji:"🌙", grad:"linear-gradient(135deg,#0A0A3A,#1A0A2A,#080A0C)", badge:"Space Pioneer",
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
  { id:"alexander", title:"Alexander the Great Survives", short:"The King Who Lived On", year:323, era:"ANCIENT", region:"Global", cat:"ancient", emoji:"⚔️", grad:"linear-gradient(135deg,#3A2800,#1A1000,#080A0C)", badge:"Ancient Scholar",
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
  { id:"cuban", title:"Cuban Missile Crisis", short:"13 Days That Nearly Ended Everything", year:1962, era:"CONTEMPORARY", region:"Global", cat:"wars", emoji:"☢️", grad:"linear-gradient(135deg,#0A2A1A,#001A0A,#080A0C)", badge:"Cold War Analyst",
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
  const [screen, setScreen] = useState(()=> {
    if(typeof window==="undefined") return "home";
    if(!localStorage.getItem("kaash_age_verified")) return "agegate";
    if(!localStorage.getItem("kaash_onboarded")) return "onboard";
    return "home";
  });
  const [slide, setSlide] = useState(0);
  const [tab, setTab] = useState("home");
  const [event, setEvent] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [premium, setPremium] = useState(false);
  // TWA = running inside Play Store Android app (Digital Goods API available)
  const [isTWA, setIsTWA] = useState(false);
  // Play subscription token stored for re-verification on app open
  const [playToken, setPlayToken] = useState(null);
  const [watchCount, setWatchCount] = useState(0);
  const [paywall, setPaywall] = useState(false);
  const [era, setEra] = useState("ALL");
  const [q, setQ] = useState("");
  const [expandN, setExpandN] = useState(false);
  const [expandR, setExpandR] = useState(false);
  const [termsChecked, setTermsChecked] = useState(()=> typeof window!=="undefined" && localStorage.getItem("kaash_terms")==="1");
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
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [watched, setWatched] = useState(new Set());
  const [streak, setStreak] = useState(0);
  const [lastWatchDate, setLastWatchDate] = useState(null);
  const [suggestionSent, setSuggestionSent] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [newEvents, setNewEvents] = useState([]);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [videoProgress, setVideoProgress] = useState({}); // {scenarioId: seconds}
  const [videoStatus, setVideoStatus] = useState("loading"); // loading|ready|error, for current video

  // ─── RESPONSIVE: desktop gets a Netflix-style browse layout for Home ───
  const [isDesktop, setIsDesktop] = useState(typeof window!=="undefined" && window.innerWidth>=1024);
  useEffect(()=>{
    const onResize=()=>setIsDesktop(window.innerWidth>=1024);
    window.addEventListener("resize",onResize);
    return ()=>window.removeEventListener("resize",onResize);
  },[]);

  // ─── TWA DETECTION + PLAY SUBSCRIPTION RE-VERIFICATION ───────────────
  // Digital Goods API is only available inside a TWA (Play Store Android app).
  // On each app open, if the user has a stored Play purchase token, re-verify
  // it server-side to catch renewals, cancellations, and expirations.
  useEffect(()=>{
    const detectAndVerify = async () => {
      if(typeof window === "undefined") return;
      if(!("getDigitalGoodsService" in window)) return; // not a TWA
      try {
        const service = await window.getDigitalGoodsService("https://play.google.com/billing");
        if(!service) return;
        setIsTWA(true);
        // Re-verify existing Play subscription if we have a token and user is logged in
        const storedToken = localStorage.getItem("kaash_play_token");
        const storedProductId = localStorage.getItem("kaash_play_product");
        if(storedToken && storedProductId && fb && fb.auth.currentUser){
          try {
            const res = await fetch("/api/verify-play-purchase", {
              method:"POST",
              headers:{"Content-Type":"application/json"},
              body: JSON.stringify({
                purchaseToken: storedToken,
                productId: storedProductId,
                userId: fb.auth.currentUser.uid,
                userEmail: fb.auth.currentUser.email || "",
                reVerify: true,
              }),
            });
            const data = await res.json();
            if(data.success && data.isActive){
              setPremium(true);
              setPlayToken(storedToken);
            } else {
              // Subscription lapsed or cancelled
              setPremium(false);
              localStorage.removeItem("kaash_play_token");
              localStorage.removeItem("kaash_play_product");
            }
          } catch(e){ /* network error — don't revoke premium, fail safe */ }
        }
      } catch(e){ /* getDigitalGoodsService failed — not a TWA */ }
    };
    detectAndVerify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[fb, loggedIn]); // re-run after sign-in so we have fb.auth.currentUser

  // ─── FULLSCREEN VIDEO: YouTube-style adaptive orientation ───
  // Both orientations supported, user-controlled:
  //   • Inline (default): vertical 9:16 frame in the scrolling page.
  //   • Fullscreen: fills the whole screen. We DO NOT force landscape —
  //     a vertical video should be able to go fullscreen and stay portrait
  //     (immersive, like a Short). We unlock orientation so the device's
  //     own rotation sensor leads: the user rotates the phone and the video
  //     follows. On exit we release the lock and return to the inline frame.
  // This mirrors YouTube: portrait by default, rotate-to-landscape on demand,
  // landscape-back-to-portrait when the user rotates back.
  const playerWrapRef = useRef(null);
  const [isFs, setIsFs] = useState(false);

  useEffect(()=>{
    const onFsChange = () => {
      const active = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFs(active);
      const o = window.screen && window.screen.orientation;
      if(active){
        // Allow free rotation in fullscreen — do NOT pin to one orientation.
        // (Some Android WebViews default to a locked sensor; explicitly unlock.)
        if(o && o.unlock){ try{ o.unlock(); }catch(e){} }
      } else {
        if(o && o.unlock){ try{ o.unlock(); }catch(e){} }
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return ()=>{
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  },[]);

  // Explicit fullscreen toggle — more reliable than relying only on the
  // native <video> control, and consistent across the Android TWA and desktop.
  const toggleFullscreen = () => {
    const el = playerWrapRef.current;
    if(!el) return;
    const inFs = document.fullscreenElement || document.webkitFullscreenElement;
    if(!inFs){
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.webkitEnterFullscreen;
      if(req){ try{ req.call(el); }catch(e){} }
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if(exit){ try{ exit.call(document); }catch(e){} }
    }
  };

  // ─── VIDEO PLAYER: reset loading state when the video changes ───
  const lastSavedTimeRef = useRef(0);
  useEffect(()=>{
    setVideoStatus("loading");
    lastSavedTimeRef.current = 0;
  },[scenario?.videoUrl_en, scenario?.videoUrl_hi, lang, screen]);

  const markW = (id) => {
    if(watched.has(id)) return; // already counted, avoid double XP/streak on replay
    const next = new Set([...watched, id]);
    setWatched(next);

    // ── Streak update ──
    const today = todayStr();
    let newStreak;
    if(lastWatchDate === today) newStreak = streak || 1;
    else if(lastWatchDate === yesterdayStr()) newStreak = (streak||0) + 1;
    else newStreak = 1;
    setStreak(newStreak);
    setLastWatchDate(today);

    // ── Persist for logged-in users ──
    if(fb && fb.auth.currentUser){
      const ref = fb.doc(fb.db,"users",fb.auth.currentUser.uid);
      fb.setDoc(ref, {watchedScenarios:[...next], streak:newStreak, lastWatchDate:today}, {merge:true}).catch(e=>console.error("Failed to save progress:",e));
    }
  };

  const toggleBookmark = (id) => {
    const next = new Set(bookmarks);
    if(next.has(id)) next.delete(id); else next.add(id);
    setBookmarks(next);
    if(fb && fb.auth.currentUser){
      const ref = fb.doc(fb.db,"users",fb.auth.currentUser.uid);
      fb.setDoc(ref, {bookmarks:[...next]}, {merge:true}).catch(e=>console.error("Failed to save bookmark:",e));
    }
  };

  // ─── FIREBASE AUTH LISTENER ───
  useEffect(()=>{
    // Load Firebase asynchronously, then wire up auth + data loading.
    // This async boundary is what prevents the Firebase v10 + Vite
    // "Cannot access before initialization" bug — Firebase's module
    // graph is fully resolved before any of its exports are used.
    loadFirebase().then((fb) => {
      if (cancelled) return;
      // Load Razorpay checkout.js script
      const rzpScript = document.createElement("script");
      rzpScript.src = "https://checkout.razorpay.com/v1/checkout.js";
      rzpScript.async = true;
      document.body.appendChild(rzpScript);

      // Load events from Firestore and MERGE onto the built-in catalog.
      //
      // CRITICAL: previously this REPLACED the entire built-in EVENTS
      // catalog with whatever partial data existed in Firestore. The
      // moment a single video was uploaded via Admin for one scenario
      // (which writes only {videoUrl_en, num} via setDoc merge), the
      // app would show ONLY that one event/scenario to ALL users and
      // crash on it (missing narrative/ripples/title/tagline).
      //
      // Now: the static EVENTS array is always the base. Firestore data
      // enriches matching event/scenario entries (e.g. adds videoUrl_en/
      // videoUrl_hi once uploaded) without removing built-in content.
      // Brand-new events created via Admin's "New Event" tab (an id not
      // in the static catalog, with a title and at least one scenario)
      // are appended on top.
      const loadEvents = async () => {
        try {
          const snap = await fb.getDocs(fb.collection(fb.db,"events"));
          if(snap.size > 0){
            const overrides = {};
            for(const evDoc of snap.docs){
              const evData = evDoc.data();
              const scenSnap = await fb.getDocs(fb.collection(fb.db,"events",evDoc.id,"scenarios"));
              const scenMap = {};
              scenSnap.forEach(sd => { const d=sd.data(); if(d.num) scenMap[d.num]=d; });
              overrides[evDoc.id] = {evData, scenMap};
            }

            const merged = EVENTS.map(staticEv => {
              const ov = overrides[staticEv.id];
              const mergedEvFields = ov?.evData?.title ? {...staticEv, ...ov.evData} : staticEv;
              const mergedScenarios = staticEv.scenarios.map(staticSc => {
                const scOv = ov?.scenMap?.[staticSc.num];
                return scOv ? {...staticSc, ...scOv} : staticSc;
              });
              return {...mergedEvFields, id:staticEv.id, scenarios:mergedScenarios};
            });

            // Append brand-new events not in the static catalog
            for(const [evId, ov] of Object.entries(overrides)){
              if(EVENTS.some(e=>e.id===evId)) continue;
              if(!ov.evData?.title) continue;
              const scenarios = Object.values(ov.scenMap).filter(sc=>sc.num).sort((a,b)=>a.num-b.num);
              if(scenarios.length > 0) merged.push({...ov.evData, id:evId, scenarios});
            }

            setDynamicEvents(merged);
          }
        } catch(e){ console.error("Firestore events load failed, using built-in content",e); }
        setEventsLoading(false);
      };
      loadEvents();


      // Load What's New events (sorted by createdAt desc)
      const loadNew = async () => {
        try {
          const snap = await fb.getDocs(fb.collection(fb.db,"events"));
          const ne = [];
          snap.forEach(d => { const data=d.data(); if(data.createdAt) ne.push({...data,id:d.id}); });
          ne.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
          setNewEvents(ne);
        } catch(e) {}
      };
      loadNew();

      unsub = fb.onAuthStateChanged(fb.auth, async (user)=>{
        if(user){
          setLoggedIn(true);
          setUserEmail(user.email);
          setUserName(user.displayName||"");
          const userRef = fb.doc(fb.db,"users",user.uid);
          const snap = await fb.getDoc(userRef);
          if(snap.exists()){
            const data = snap.data();
            if(data.isPremium) setPremium(true);
            if(Array.isArray(data.watchedScenarios)) setWatched(new Set(data.watchedScenarios));
            if(Array.isArray(data.bookmarks)) setBookmarks(new Set(data.bookmarks));
            if(data.watchProgress) setVideoProgress(data.watchProgress);
            setStreak(data.streak||0);
            setLastWatchDate(data.lastWatchDate||null);
          } else {
            await fb.setDoc(userRef, {email:user.email, name:user.displayName||"", createdAt:new Date().toISOString(), watchedScenarios:[], bookmarks:[], watchProgress:{}, streak:0, lastWatchDate:null}, {merge:true});
          }
        } else {
          setLoggedIn(false);
        }
        setFirebaseReady(true);
      });
    }).catch(e => console.error("Firebase failed to load:", e));

    return ()=>{ cancelled = true; unsub(); };
  },[]);

  // ─── SIGN OUT ───
  const handleSignOut = async ()=>{ if(fb) await fb.signOut(fb.auth); setLoggedIn(false); setPremium(false); setUserEmail(""); setUserName(""); setWatched(new Set()); setStreak(0); setLastWatchDate(null); setBookmarks(new Set()); setVideoProgress({}); };

  const ACTIVE_EVENTS = dynamicEvents.length > 0 ? dynamicEvents : EVENTS;

  const initiatePayment = async () => {
    if(!fb || !fb.auth.currentUser){ setPaywall(false); setScreen("login"); return; }
    if(!window.Razorpay){ setPaymentError("Payment system loading. Please wait a moment and try again."); return; }
    setPaymentLoading(true); setPaymentError("");
    try {
      const res = await fetch("/api/create-order",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({plan:selectedPlan, userId:fb.auth.currentUser.uid, userEmail}),
      });
      if(!res.ok){ const e=await res.json(); throw new Error(e.error||"Order creation failed"); }
      const order = await res.json();
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "KAASH",
        description: `KAASH Ad-Free ${KAASH_PLANS[selectedPlan].label}`,
        order_id: order.id,
        prefill: {email:userEmail, name:userName},
        notes: {plan:selectedPlan},
        theme: {color:C.accent},
        modal: {confirm_close:true},
        handler: async (response) => {
          try {
            // Server verifies the HMAC signature AND grants premium via
            // the Admin SDK in one step — the client no longer writes
            // isPremium/payments directly (that write path is now
            // blocked entirely by firestore.rules).
            const vRes = await fetch("/api/verify-payment",{
              method:"POST",
              headers:{"Content-Type":"application/json"},
              body:JSON.stringify({
                razorpay_order_id:response.razorpay_order_id,
                razorpay_payment_id:response.razorpay_payment_id,
                razorpay_signature:response.razorpay_signature,
                plan:selectedPlan, userId:fb.auth.currentUser.uid, userEmail, userName,
              }),
            });
            const vData = await vRes.json();
            if(!vData.success) throw new Error(vData.error || "Payment verification failed");
            // Server confirmed + persisted premium status. Update local
            // UI state immediately; the next Firestore read on app load
            // will also reflect the real (server-written) value.
            setPremium(true); setPaywall(false); setPaymentLoading(false);
          } catch(e){
            setPaymentError("Payment received but activation failed. Email support@kaash.app with payment ID: "+response.razorpay_payment_id+" — "+e.message);
            setPaymentLoading(false);
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed",(r)=>{ setPaymentError("Payment failed: "+(r.error?.description||"Please try again")); setPaymentLoading(false); });
      rzp.open();
    } catch(e){ setPaymentError(e.message||"Something went wrong. Please try again."); setPaymentLoading(false); }
  };

  // ─── PLAY BILLING CHECKOUT ──────────────────────────────────────────
  // Called only inside TWA. Uses Digital Goods API + PaymentRequest API.
  // Google shows its own native billing bottom-sheet — we never see card data.
  const initiatePlayPurchase = async () => {
    if(!fb || !fb.auth.currentUser){ setPaywall(false); setScreen("login"); return; }
    setPaymentLoading(true); setPaymentError("");
    try {
      // Get the Digital Goods service (only available in TWA)
      const service = await window.getDigitalGoodsService("https://play.google.com/billing");
      const productId = PLAY_PRODUCT_IDS[selectedPlan];

      // Fetch item details from Play Console (price, title, etc.)
      const details = await service.getDetails([productId]);
      if(!details || details.length === 0){
        throw new Error("Product not found in Play Console. Ensure kaash_monthly / kaash_yearly are created and active.");
      }
      const item = details[0];

      // PaymentRequest triggers the native Play Billing bottom-sheet
      const request = new PaymentRequest(
        [{ supportedMethods:"https://play.google.com/billing", data:{ sku: item.itemId } }],
        { total:{ label: item.title || "KAASH Subscription", amount: item.price } }
      );

      const paymentResult = await request.show();
      const { purchaseToken } = paymentResult.details;

      // Send to our server for verification + Firestore update
      const res = await fetch("/api/verify-play-purchase", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          purchaseToken,
          productId,
          userId: fb.auth.currentUser.uid,
          userEmail: fb.auth.currentUser.email || userEmail,
          reVerify: false,
        }),
      });
      const data = await res.json();
      if(!data.success) throw new Error(data.error || "Purchase verification failed");

      // Acknowledge must happen within 3 days or Google auto-refunds
      // Our server does the acknowledgement — confirm it succeeded
      await paymentResult.complete("success");

      // Store token locally for re-verification on future app opens
      localStorage.setItem("kaash_play_token", purchaseToken);
      localStorage.setItem("kaash_play_product", productId);
      setPlayToken(purchaseToken);
      setPremium(true); setPaywall(false); setPaymentLoading(false);
    } catch(e){
      // User cancelled the billing dialog — treat as non-error
      if(e.name === "AbortError" || e.message?.includes("cancelled")){
        setPaymentLoading(false); return;
      }
      setPaymentError(e.message || "Purchase failed. Please try again.");
      setPaymentLoading(false);
    }
  };

  // ─── UNIFIED PAYMENT ROUTER ─────────────────────────────────────────
  // Routes to Play Billing (TWA) or Razorpay (web) based on platform.
  const initiateSubscription = () => {
    if(isTWA) initiatePlayPurchase();
    else initiatePayment();
  };

  const getNextScenario = () => {
    if(!event||!scenario) return {sc:null,ev:null};
    const idx = event.scenarios.findIndex(s=>s.num===scenario.num);
    if(idx<event.scenarios.length-1) return {sc:event.scenarios[idx+1],ev:event};
    const evIdx = ACTIVE_EVENTS.findIndex(e=>e.id===event.id);
    const nextEv = ACTIVE_EVENTS[(evIdx+1)%ACTIVE_EVENTS.length];
    return {sc:nextEv.scenarios[0],ev:nextEv};
  };

  const triggerUpNext = () => {
    const {sc,ev} = getNextScenario();
    setUpNextScenario(sc); setUpNextEvent(ev); setUpNextCount(10); setScreen("upnext");
  };

  const s = { display:"flex", flexDirection:"column", background:C.bg, color:C.text, fontFamily:"'Georgia','Times New Roman',serif", height:640, width:"100%", maxWidth:390, margin:"0 auto", overflow:"hidden", position:"relative" };

  const attemptWatch = (sc, ev) => {
    setScenario(sc); setEvent(ev); setExpandN(false); setExpandR(false);
    if (watchCount >= 2 && !loggedIn) { setPendingWatch({sc,ev}); setScreen("login"); return; }
    if (!premium) setScreen("ad"); else setScreen("disclaimer");
  };

  // ─── ONBOARDING ───
  // ─── AGE GATE ─────────────────────────────────────────────────────────
  // Required by DPDP Act 2023 (Section 9) and Google Play policy.
  // Must gate before collecting ANY data (including Google auth session).
  // localStorage flag: kaash_age_verified
  if (screen==="agegate") {
    return (
      <div style={{...s,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 28px",background:`radial-gradient(ellipse at 40% 20%, rgba(201,168,76,0.10) 0%, rgba(232,114,74,0.04) 55%, ${C.bg} 78%)`}}>
        <KaashMark size={44}/>
        <div style={{marginTop:20,marginBottom:4,fontSize:28,fontWeight:900,letterSpacing:4,color:C.text,textAlign:"center"}}>KAASH</div>
        <div style={{fontSize:11,color:C.textMuted,letterSpacing:2,fontFamily:"sans-serif",marginBottom:40}}>कaश · ALTERNATE HISTORY</div>
        <div style={{width:"100%",background:C.card,borderRadius:14,padding:"24px 20px",border:`1px solid ${C.border}`,boxShadow:C.shadowLg,marginBottom:24}}>
          <div style={{fontSize:13,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700,marginBottom:12,textAlign:"center"}}>AGE VERIFICATION</div>
          <div style={{fontSize:14,color:C.text,textAlign:"center",lineHeight:1.7,marginBottom:20}}>KAASH explores alternate history including war, conflict, and geopolitical events. This content is suitable for ages <strong>13 and above</strong>.</div>
          <div style={{fontSize:12,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.6,marginBottom:20,textAlign:"center"}}>
            By continuing, you confirm you are <strong>13 years of age or older</strong>. If you are between 13–17, a parent or guardian has consented to your use of this app.
          </div>
          <button onClick={()=>{ localStorage.setItem("kaash_age_verified","1"); if(!localStorage.getItem("kaash_onboarded")) setScreen("onboard"); else setScreen("home"); }}
            style={{width:"100%",padding:"14px 0",background:C.accent,border:"none",borderRadius:10,color:C.bg,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",letterSpacing:1,marginBottom:12}}>
            I AM 13 OR OLDER — CONTINUE
          </button>
          <button onClick={()=>{ window.location.href="https://www.google.com"; }}
            style={{width:"100%",padding:"12px 0",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.textMuted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"sans-serif"}}>
            I am under 13 — Exit
          </button>
        </div>
        <div style={{fontSize:11,color:C.textMuted,fontFamily:"sans-serif",textAlign:"center",lineHeight:1.6}}>
          By continuing you agree to our{" "}
          <a href="/terms" target="_blank" rel="noopener" style={{color:C.accentLight}}>Terms of Service</a>
          {" "}and{" "}
          <a href="/privacy" target="_blank" rel="noopener" style={{color:C.accentLight}}>Privacy Policy</a>
        </div>
      </div>
    );
  }

  if (screen==="onboard") {
    const slides=[
      {title:"कaश",sub:"What If History Went Differently?",body:"Every turning point in history balanced on a razor's edge. One moment different — the entire world changes.",emoji:"⚡"},
      {title:"5 Timelines",sub:"Per Historical Event",body:"Five cinematic documentaries per event, each exploring a different way history could have unfolded. 5 minutes each.",emoji:"🎬"},
      {title:"Never Finished",sub:"New Timelines Every Week",body:"History has infinite forks. Every week, a new turning point unlocks. The past is never truly settled — and neither is KAASH.",emoji:"🌍"},
    ];
    const sl=slides[slide];
    return (
      <div style={s}>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",background:`radial-gradient(ellipse at 40% 20%, rgba(201,168,76,0.12) 0%, rgba(232,114,74,0.05) 55%, ${C.bg} 78%)`}}>
          <div style={{fontSize:64,marginBottom:20,filter:"drop-shadow(0 0 20px rgba(201,168,76,0.3))"}}>🎞</div>
          <div style={{fontSize:38,fontWeight:900,letterSpacing:6,color:C.accent,marginBottom:8,textAlign:"center"}}>{sl.title}</div>
          <div style={{fontSize:13,color:C.accent2,letterSpacing:2,marginBottom:24,textAlign:"center",fontFamily:"sans-serif",textTransform:"uppercase"}}>{sl.sub}</div>
          <div style={{fontSize:15,color:C.textSec,lineHeight:1.7,textAlign:"center",fontFamily:"sans-serif",maxWidth:320}}>{sl.body}</div>
          <div style={{display:"flex",gap:8,marginTop:40}}>
            {slides.map((_,i)=><div key={i} style={{width:i===slide?24:8,height:8,borderRadius:4,background:i===slide?C.accent:C.elevated,transition:"all 0.3s"}}/>)}
          </div>
        </div>
        <div style={{padding:"20px 24px 32px",display:"flex",gap:12}}>
          {slide>0&&<button onClick={()=>setSlide(p=>p-1)} style={{flex:1,padding:"13px 0",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.textSec,cursor:"pointer",fontFamily:"sans-serif",fontSize:14}}>Back</button>}
          <button onClick={async ()=>{
            if(slide<2){ setSlide(p=>p+1); return; }
            localStorage.setItem("kaash_onboarded","1");
            setScreen("home");
            if(loggedIn && fb && fb.auth.currentUser){
              try{ await fb.setDoc(fb.doc(fb.db,"users",fb.auth.currentUser.uid),{hasSeenOnboard:true},{merge:true}); }catch(e){}
            }
          }} style={{flex:2,padding:"13px 0",background:C.accent,border:"none",borderRadius:10,color:C.bg,cursor:"pointer",fontFamily:"sans-serif",fontSize:14,fontWeight:700,letterSpacing:1}}>
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
      onPlay={()=>{ if(watchCount>=2 && !loggedIn){ setPendingWatch({sc:upNextScenario, ev:upNextEvent}); setScreen("login"); return; } setScenario(upNextScenario); setEvent(upNextEvent); setExpandN(false); setExpandR(false); if(!premium)setScreen("ad");else setScreen("disclaimer"); }}
      onSkip={()=>{setTab("home");setScreen("home");}}
    />;
  }

  // ─── LOGIN GATE ───
  if (screen==="login") {
    return (
      <div style={s}>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 28px",background:`radial-gradient(ellipse at 40% 20%, rgba(201,168,76,0.12) 0%, rgba(232,114,74,0.05) 55%, ${C.bg} 78%)`}}>
          <div style={{fontSize:34,fontWeight:900,letterSpacing:8,color:C.accent,marginBottom:6,fontFamily:"Georgia,serif",textShadow:"0 0 30px rgba(201,168,76,0.4)"}}>KAASH</div>
          <div style={{fontSize:14,color:C.text,fontFamily:"sans-serif",textAlign:"center",fontWeight:600,marginBottom:8}}>You've watched your 2 free timelines</div>
          <div style={{fontSize:13,color:C.textSec,fontFamily:"sans-serif",textAlign:"center",lineHeight:1.6,marginBottom:32,maxWidth:300}}>Sign in to keep exploring all 100 events and 500 timelines — completely free.</div>
          <button onClick={async ()=>{
              if(!termsChecked) return;
              try {
                localStorage.setItem("kaash_terms","1");
                const f = fb || await loadFirebase();
                const result = await f.signInWithPopup(f.auth, f.googleProvider);
                const user = result.user;
                setLoggedIn(true);
                setUserEmail(user.email);
                setUserName(user.displayName||"");
                const userRef = f.doc(f.db,"users",user.uid);
                const snap = await f.getDoc(userRef);
                const seen = (snap.exists() && snap.data().hasSeenOnboard) || localStorage.getItem("kaash_onboarded")==="1";
                await f.setDoc(userRef,{email:user.email,name:user.displayName||"",lastSeen:new Date().toISOString(),signedUpAt:snap.exists()?snap.data().signedUpAt:new Date().toISOString()},{merge:true});
                if(snap.exists() && snap.data().isPremium) setPremium(true);
                const isPrem = snap.exists() && snap.data().isPremium;
                if (pendingWatch) {
                  const {sc, ev} = pendingWatch;
                  setPendingWatch(null);
                  setScenario(sc); setEvent(ev); setExpandN(false); setExpandR(false);
                  if (!isPrem) setScreen("ad"); else setScreen("disclaimer");
                } else if(!seen){ setHasSeenOnboard(false); setScreen("onboard"); }
                else { setHasSeenOnboard(true); setScreen("home"); }
              } catch(e){ console.error("Sign-in failed:", e); }
            }}
            style={{width:"100%",maxWidth:320,padding:"15px 0",background:"#ffffff",border:"none",borderRadius:12,color:"#1a1a1a",cursor:"pointer",fontFamily:"sans-serif",fontSize:15,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:16,transition:"all 0.2s",boxShadow:"0 2px 12px rgba(0,0,0,0.4)"}}>
            <span style={{fontSize:20,fontWeight:900,color:"#4285F4"}}>G</span> Continue with Google
          </button>
          <div onClick={()=>setTermsChecked(p=>!p)} style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",maxWidth:320}}>
            <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${termsChecked?C.accent:C.textMuted}`,background:termsChecked?C.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,transition:"all 0.2s"}}>
              {termsChecked&&<CheckCircle size={14} color={C.bg}/>}
            </div>
            <div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.5}}>
              I agree to KAASH's <span style={{color:C.accent,textDecoration:"underline"}}>Terms of Service</span> and <span style={{color:C.accent,textDecoration:"underline"}}>Privacy Policy</span>. I understand all content is alternate history fiction.
            </div>
          </div>
          {!termsChecked&&<div style={{fontSize:10,color:C.accent2,fontFamily:"sans-serif",marginTop:12}}>Please accept the terms to continue</div>}
        </div>
        <div style={{padding:"0 28px 28px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <ShieldCheck size={13} color={C.green}/>
          <span style={{fontSize:10,color:C.textMuted,fontFamily:"sans-serif"}}>We store only your email & watch history. Never sold. Deletable anytime.</span>
        </div>
      </div>
    );
  }

  if (screen==="ad") return <AdScreen isTWA={isTWA} onDone={()=>setScreen("disclaimer")} onUpgrade={()=>setPaywall(true)} />;
  if (screen==="disclaimer") return <DisclaimerScreen onDone={()=>{ setWatchCount(c=>c+1); setScreen("player"); }} />;

  // ─── PAYWALL ───
  if (paywall) {
    const plan = KAASH_PLANS[selectedPlan];
    const ctaLabel = isTWA
      ? `SUBSCRIBE VIA GOOGLE PLAY — ₹${plan.amount}/mo`
      : `PAY ₹${plan.total} (incl. GST) →`;
    return (
      <div style={{...s,overflowY:"auto"}}>
        <div style={{background:`linear-gradient(180deg,rgba(201,168,76,0.18),rgba(232,114,74,0.08),transparent)`,padding:"50px 24px 20px",textAlign:"center",position:"relative"}}>
          <button onClick={()=>{setPaywall(false);setPaymentError("");}} style={{position:"absolute",top:50,left:16,background:"transparent",border:"none",color:C.textMuted,cursor:"pointer",fontSize:20}}>✕</button>
          <div style={{fontSize:40,marginBottom:8,color:C.accent,textShadow:"0 0 20px rgba(201,168,76,0.6)"}}>✦</div>
          <div style={{fontSize:26,fontWeight:900,letterSpacing:4,color:C.accent,fontFamily:"Georgia,serif"}}>GO AD‑FREE</div>
          <div style={{fontSize:13,color:C.textSec,fontFamily:"sans-serif",marginTop:8,lineHeight:1.6}}>
            {isTWA ? "Billed via Google Play. Cancel anytime in Play Store." : "One price. No ads. Full access."}
          </div>
        </div>
        <div style={{padding:"0 20px 24px"}}>
          <div style={{marginBottom:14}}>
            {Object.entries(KAASH_PLANS).map(([planKey,p])=>(
              <div key={planKey} onClick={()=>setSelectedPlan(planKey)}
                style={{background:selectedPlan===planKey?C.accentBg:C.card,border:`${selectedPlan===planKey?2:1}px solid ${selectedPlan===planKey?C.accent:C.border}`,borderRadius:12,padding:"16px",marginBottom:10,cursor:"pointer",position:"relative",boxShadow:selectedPlan===planKey?"0 4px 24px rgba(201,168,76,0.25)":C.shadow}}>
                {planKey==="yearly"&&<div style={{position:"absolute",top:-1,right:14,background:C.accent,color:C.bg,fontSize:9,fontWeight:900,padding:"3px 8px",borderRadius:"0 0 6px 6px",letterSpacing:1}}>BEST VALUE</div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,fontFamily:"sans-serif",marginBottom:2}}>{p.label}</div>
                    {p.savingNote&&<div style={{fontSize:11,color:C.green,fontFamily:"sans-serif"}}>{p.savingNote}</div>}
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:24,fontWeight:900,color:selectedPlan===planKey?C.accent:C.text,fontFamily:"sans-serif"}}>₹{p.amount}</div>
                    {!isTWA && <div style={{fontSize:10,color:C.textMuted,fontFamily:"sans-serif"}}>+ ₹{p.gst} GST = ₹{p.total}</div>}
                    {planKey==="yearly"&&<div style={{fontSize:10,color:C.green,fontFamily:"sans-serif"}}>₹{p.perMonth}/month</div>}
                  </div>
                </div>
                {selectedPlan===planKey&&<CheckCircle size={14} color={C.accent} style={{position:"absolute",top:16,right:16}}/>}
              </div>
            ))}
          </div>

          {/* GST breakdown box (web only) */}
          {!isTWA && (
            <div style={{background:C.surface,borderRadius:8,padding:"10px 14px",marginBottom:12,fontFamily:"sans-serif",fontSize:11,color:C.textMuted,lineHeight:1.8}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>Base price</span><span style={{color:C.text}}>₹{plan.amount}</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span>GST (18% · HSN 9984)</span><span style={{color:C.text}}>₹{plan.gst}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:6,marginTop:4,fontWeight:700,color:C.text}}><span>Total charged</span><span>₹{plan.total}</span></div>
            </div>
          )}

          {["🚫 Zero ads — ever","🎬 All timelines on all events","🌐 English + Hindi narration","⚡ New events every week"].map((f,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,fontSize:13,color:C.text,fontFamily:"sans-serif"}}>
              <span>{f}</span>
            </div>
          ))}

          {paymentError&&<div style={{background:"rgba(224,99,90,0.14)",border:"1px solid rgba(224,99,90,0.4)",borderRadius:8,padding:"10px 12px",marginTop:10,fontSize:12,color:C.red,fontFamily:"sans-serif",lineHeight:1.5}}>{paymentError}</div>}

          <button onClick={initiateSubscription} disabled={paymentLoading}
            style={{width:"100%",padding:"15px 0",background:paymentLoading?C.elevated:C.accent,border:"none",borderRadius:10,color:paymentLoading?C.textMuted:C.bg,fontSize:14,fontWeight:900,cursor:paymentLoading?"not-allowed":"pointer",fontFamily:"sans-serif",letterSpacing:1,marginTop:14}}>
            {paymentLoading ? "OPENING PAYMENT..." : ctaLabel}
          </button>

          <div style={{textAlign:"center",fontSize:10,color:C.textMuted,fontFamily:"sans-serif",marginTop:10,lineHeight:1.6}}>
            {isTWA
              ? "Subscriptions managed via Google Play · Cancel anytime in Play Store settings"
              : "Secure payment via Razorpay · UPI · Cards · Net Banking · Wallets"}
            <br/>
            <a href="/terms" target="_blank" rel="noopener" style={{color:C.accentLight}}>Terms</a>
            {" · "}
            <a href="/privacy" target="_blank" rel="noopener" style={{color:C.accentLight}}>Privacy Policy</a>
            {" · "}
            {!isTWA && <a href="mailto:support@kaash.app" style={{color:C.accentLight}}>Refund Policy</a>}
          </div>
          <div style={{height:24}}/>
        </div>
      </div>
    );
  }

  // ─── SETTINGS ───
  // Previously: the Profile tab's "Settings" button called
  // setSettingsPage("menu") but nothing ever read settingsPage — the
  // button did nothing, and handleSignOut (defined above) was never
  // reachable from any UI element. This screen fixes both.
  if (settingsPage==="menu") {
    const handleDeleteAccount = async () => {
      if(!loggedIn || !fb || !fb.auth.currentUser) return;
      setDeleting(true); setDeleteError("");
      try {
        const uid = fb.auth.currentUser.uid;
        // Delete user doc (watch history, bookmarks, progress, streak)
        // Payment records kept 8 years per Indian taxation law (handled by admin separately)
        await fb.setDoc(fb.doc(fb.db,"users",uid), {
          email:"[DELETED]", name:"[DELETED]", watchedScenarios:[], bookmarks:[],
          watchProgress:{}, streak:0, lastWatchDate:null, deletedAt:new Date().toISOString()
        },{merge:false});
        // Clear localStorage flags
        localStorage.removeItem("kaash_onboarded");
        localStorage.removeItem("kaash_terms");
        localStorage.removeItem("kaash_age_verified");
        await handleSignOut();
        setSettingsPage(null); setTab("home"); setScreen("agegate");
      } catch(e) {
        setDeleteError("Deletion failed: "+e.message+". Email privacy@kaash.app to complete manually.");
        setDeleting(false);
      }
    };

    return (
      <div style={{...s,overflowY:"auto"}}>
        <div style={{padding:"44px 20px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <button onClick={()=>{setSettingsPage(null);setDeleteConfirm(false);setDeleteError("");}} style={{background:"transparent",border:"none",cursor:"pointer",display:"flex",padding:0}}><ArrowLeft size={20} color={C.text}/></button>
          <span style={{fontSize:16,fontWeight:900,letterSpacing:1}}>Settings</span>
        </div>
        <div style={{padding:"20px"}}>

          {/* ACCOUNT */}
          {loggedIn && (
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700,marginBottom:8}}>ACCOUNT</div>
              <div style={{background:C.card,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`,marginBottom:10,boxShadow:C.shadow}}>
                <div style={{fontSize:13,fontWeight:700,fontFamily:"sans-serif"}}>{userName||"Signed in"}</div>
                <div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",marginTop:2}}>{userEmail}</div>
                {premium && <div style={{fontSize:10,color:C.accent,fontFamily:"sans-serif",fontWeight:700,marginTop:6}}>✦ PREMIUM MEMBER</div>}
              </div>
              <button onClick={async ()=>{ await handleSignOut(); setSettingsPage(null); setTab("home"); setScreen("home"); }}
                style={{width:"100%",padding:"13px 0",background:"transparent",border:`1px solid ${C.red}`,borderRadius:10,color:C.red,cursor:"pointer",fontFamily:"sans-serif",fontSize:13,fontWeight:700,marginBottom:8}}>Sign Out</button>
            </div>
          )}

          {/* SUBSCRIPTION */}
          {premium && (
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700,marginBottom:8}}>SUBSCRIPTION</div>
              <div style={{background:C.card,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`,boxShadow:C.shadow,fontSize:12,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.7,marginBottom:10}}>
                <div style={{color:C.green,fontWeight:700,marginBottom:4}}>✓ Premium Active</div>
                {isTWA
                  ? "Your subscription auto-renews via Google Play. To cancel, manage via Play Store."
                  : "Your plan does not auto-renew. No further charges will be made without your action. For refund queries: support@kaash.app"}
              </div>
              {isTWA && (
                <a href="https://play.google.com/store/account/subscriptions?package=app.kaash.android"
                  target="_blank" rel="noopener"
                  style={{display:"block",width:"100%",padding:"13px 0",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.textSec,fontFamily:"sans-serif",fontSize:12,textAlign:"center",textDecoration:"none"}}>
                  Manage / Cancel on Google Play →
                </a>
              )}
            </div>
          )}

          {/* PRIVACY & YOUR RIGHTS */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:11,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700,marginBottom:8}}>PRIVACY &amp; YOUR RIGHTS</div>
            <div style={{background:C.card,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`,boxShadow:C.shadow,marginBottom:10,fontSize:12,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.7}}>
              <div style={{color:C.text,fontWeight:700,marginBottom:8}}>Data we hold about you:</div>
              <ul style={{paddingLeft:16,margin:0}}>
                <li>Email address and display name (from Google Sign-In)</li>
                <li>Watch history, streak, XP, and bookmarks</li>
                <li>Video resume positions</li>
                <li>Content suggestions you submitted</li>
                <li>Payment records (retained 8 years by law)</li>
              </ul>
              <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
                We never sell your data. <a href="/privacy" target="_blank" rel="noopener" style={{color:C.accentLight}}>Full Privacy Policy →</a>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <a href="mailto:privacy@kaash.app?subject=Data Access Request" style={{display:"block",padding:"12px 16px",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:12,fontFamily:"sans-serif",textDecoration:"none"}}>
                📋 Request a copy of my data
              </a>
              <a href="mailto:privacy@kaash.app?subject=Data Correction Request" style={{display:"block",padding:"12px 16px",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:12,fontFamily:"sans-serif",textDecoration:"none"}}>
                ✏️ Correct my data
              </a>
            </div>
          </div>

          {/* DELETE ACCOUNT */}
          {loggedIn && (
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700,marginBottom:8}}>DELETE MY ACCOUNT &amp; DATA</div>
              {!deleteConfirm ? (
                <div>
                  <div style={{background:C.card,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`,marginBottom:10,fontSize:12,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.7}}>
                    Permanently deletes your watch history, streak, bookmarks, and account. Payment records are retained for 8 years as required by Indian taxation law. This cannot be undone.
                  </div>
                  <button onClick={()=>setDeleteConfirm(true)}
                    style={{width:"100%",padding:"13px 0",background:"transparent",border:`1px solid ${C.red}`,borderRadius:10,color:C.red,cursor:"pointer",fontFamily:"sans-serif",fontSize:13,fontWeight:700}}>
                    Delete My Account &amp; Data
                  </button>
                </div>
              ) : (
                <div style={{background:C.card,borderRadius:10,padding:"16px",border:`2px solid ${C.red}`,boxShadow:`0 4px 20px rgba(224,99,90,0.2)`}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:8}}>Are you sure?</div>
                  <div style={{fontSize:12,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.6,marginBottom:16}}>
                    This will permanently delete your account ({userEmail}), watch history, bookmarks, and streak. Payment records are kept for legal compliance.
                  </div>
                  {deleteError && <div style={{fontSize:12,color:C.red,fontFamily:"sans-serif",marginBottom:12,lineHeight:1.5}}>{deleteError}</div>}
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={()=>setDeleteConfirm(false)} style={{flex:1,padding:"12px 0",background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,color:C.textSec,cursor:"pointer",fontFamily:"sans-serif",fontSize:13}}>Cancel</button>
                    <button onClick={handleDeleteAccount} disabled={deleting}
                      style={{flex:1,padding:"12px 0",background:C.red,border:"none",borderRadius:8,color:"#fff",cursor:deleting?"not-allowed":"pointer",fontFamily:"sans-serif",fontSize:13,fontWeight:700,opacity:deleting?0.7:1}}>
                      {deleting?"Deleting...":"Yes, Delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LEGAL */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:11,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700,marginBottom:8}}>LEGAL</div>
            <div style={{display:"flex",flexDirection:"column",gap:1,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
              <a href="/privacy" target="_blank" rel="noopener" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:C.card,color:C.text,fontSize:13,fontFamily:"sans-serif",textDecoration:"none",borderBottom:`1px solid ${C.border}`}}>
                <span>Privacy Policy</span><span style={{color:C.textMuted,fontSize:12}}>→</span>
              </a>
              <a href="/terms" target="_blank" rel="noopener" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:C.card,color:C.text,fontSize:13,fontFamily:"sans-serif",textDecoration:"none",borderBottom:`1px solid ${C.border}`}}>
                <span>Terms of Service</span><span style={{color:C.textMuted,fontSize:12}}>→</span>
              </a>
              <a href="mailto:grievance@kaash.app" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:C.card,color:C.text,fontSize:13,fontFamily:"sans-serif",textDecoration:"none"}}>
                <span>Grievance Officer</span><span style={{color:C.textMuted,fontSize:12}}>→</span>
              </a>
            </div>
          </div>

          {/* ABOUT */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:11,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700,marginBottom:8}}>ABOUT</div>
            <div style={{background:C.card,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`,fontSize:12,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.7}}>
              KAASH — Alternate History. All content is speculative fiction for educational entertainment. Version 1.10.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── VIDEO PLAYER ───
  if (screen==="player"&&scenario&&event) {
    const sId = event.id+"_"+scenario.num;
    const videoUrl = lang==="HI" ? (scenario.videoUrl_hi||scenario.videoUrl_en) : (scenario.videoUrl_en||scenario.videoUrl_hi);
    const hasBothLangs = !!(scenario.videoUrl_en && scenario.videoUrl_hi);
    const isBookmarked = bookmarks.has(sId);

    const saveProgress = (seconds) => {
      setVideoProgress(p=>({...p,[sId]:seconds}));
      if(fb && fb.auth.currentUser){
        const ref = fb.doc(fb.db,"users",fb.auth.currentUser.uid);
        fb.setDoc(ref, {[`watchProgress.${sId}`]: seconds}, {merge:true}).catch(()=>{});
      }
    };

    const onVideoEnded = () => {
      saveProgress(0);
      markW(sId);
      triggerUpNext();
    };

    const shareOnWhatsApp = () => {
      const msg = `"${scenario.title}" — ${scenario.tagline}\n\nExplore this alternate history timeline on KAASH: https://kaash-app.vercel.app`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
    };

    return (
      <div style={{...s,overflowY:"auto"}} onContextMenu={(e)=>e.preventDefault()}>
        <style>{`@keyframes kaashSpin{to{transform:rotate(360deg)}}`}</style>
        <div ref={playerWrapRef} style={isFs
          ? {width:"100vw",height:"100vh",background:"#000",position:"relative",userSelect:"none",display:"flex",alignItems:"center",justifyContent:"center"}
          : {width:"100%",aspectRatio:"9/16",maxHeight:"68vh",background:"#000",position:"relative",minHeight:200,userSelect:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {videoUrl ? (
            <>
              <video
                key={videoUrl}
                src={videoUrl}
                controls
                playsInline
                style={{width:"100%",height:"100%",display:"block",background:"#000",objectFit:"contain"}}
                onLoadedData={()=>setVideoStatus("ready")}
                onError={()=>setVideoStatus("error")}
                onLoadedMetadata={(e)=>{ const saved=videoProgress[sId]; if(saved && saved>5 && saved<e.target.duration-10) e.target.currentTime=saved; }}
                onTimeUpdate={(e)=>{ const t=e.target.currentTime; if(Math.abs(t-lastSavedTimeRef.current)>=10){ lastSavedTimeRef.current=t; if(fb && fb.auth.currentUser){ const ref=fb.doc(fb.db,"users",fb.auth.currentUser.uid); fb.setDoc(ref,{[`watchProgress.${sId}`]:t},{merge:true}).catch(()=>{}); } } }}
                onPause={(e)=>{ if(!e.target.ended) saveProgress(e.target.currentTime); }}
                onEnded={onVideoEnded}
              />
              {videoStatus==="loading" && (
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.4)",pointerEvents:"none"}}>
                  <div style={{width:36,height:36,borderRadius:"50%",border:`3px solid ${C.border}`,borderTopColor:C.accent,animation:"kaashSpin 0.8s linear infinite"}}/>
                </div>
              )}
              {videoStatus==="error" && (
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",gap:6,padding:20,textAlign:"center",pointerEvents:"none"}}>
                  <div style={{fontSize:13,color:C.text,fontFamily:"sans-serif",fontWeight:700}}>Couldn't load this video</div>
                  <div style={{fontSize:12,color:C.textSec,fontFamily:"sans-serif"}}>Check your connection and try again.</div>
                </div>
              )}
              <div style={{position:"absolute",top:"38%",right:16,fontSize:13,color:"rgba(255,255,255,0.18)",fontWeight:900,letterSpacing:2,fontFamily:"sans-serif",transform:"rotate(-12deg)",pointerEvents:"none"}}>KAASH</div>
              <div style={{position:"absolute",top:"38%",left:16,fontSize:13,color:"rgba(255,255,255,0.18)",fontWeight:900,letterSpacing:2,fontFamily:"sans-serif",transform:"rotate(-12deg)",pointerEvents:"none"}}>KAASH</div>
              {loggedIn && userEmail && (
                <div style={{position:"absolute",top:"65%",left:"50%",transform:"translate(-50%,-50%) rotate(-12deg)",fontSize:10,color:"rgba(255,255,255,0.07)",fontFamily:"sans-serif",letterSpacing:1,whiteSpace:"nowrap",pointerEvents:"none"}}>{userEmail}</div>
              )}
            </>
          ) : (
            <div style={{position:"absolute",inset:0,background:event.grad}}>
              <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:56,height:56,borderRadius:"50%",background:`rgba(201,168,76,0.9)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 30px rgba(201,168,76,0.4)"}}><Play size={26} color="#080A0C" style={{marginLeft:3}}/></div>
                <div style={{marginTop:12,fontSize:11,color:"rgba(255,255,255,0.7)",fontFamily:"sans-serif"}}>5-minute documentary — coming soon</div>
              </div>
              <div style={{position:"absolute",top:"42%",right:16,fontSize:13,color:"rgba(255,255,255,0.22)",fontWeight:900,letterSpacing:2,fontFamily:"sans-serif",transform:"rotate(-12deg)",pointerEvents:"none"}}>KAASH</div>
              <div style={{position:"absolute",bottom:10,left:54,fontSize:13,color:"rgba(255,255,255,0.22)",fontWeight:900,letterSpacing:2,fontFamily:"sans-serif",pointerEvents:"none"}}>KAASH</div>
            </div>
          )}
          <button onClick={toggleFullscreen} aria-label={isFs?"Exit fullscreen":"Fullscreen"} style={{position:"absolute",bottom:10,right:10,background:"rgba(0,0,0,0.6)",border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3}}>{isFs?<Minimize size={17} color="#fff"/>:<Maximize size={17} color="#fff"/>}</button>
          <button onClick={()=>setScreen("detail")} style={{position:"absolute",top:10,left:10,background:"rgba(0,0,0,0.6)",border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}><ArrowLeft size={18} color="#fff"/></button>
          {hasBothLangs && (
            <div style={{position:"absolute",top:10,right:10,display:"flex",background:"rgba(0,0,0,0.6)",borderRadius:8,overflow:"hidden",zIndex:2}}>
              {["EN","HI"].map(L=>(
                <button key={L} onClick={()=>setLang(L)} style={{padding:"6px 11px",background:lang===L?C.accent:"transparent",border:"none",color:lang===L?C.bg:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>{L}</button>
              ))}
            </div>
          )}
        </div>
        <div style={{padding:"16px 20px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <div style={{fontSize:10,color:C.accent,letterSpacing:1,fontFamily:"sans-serif",fontWeight:700}}>{event.short}</div>
            <div style={{fontSize:10,color:C.accent,fontFamily:"sans-serif",fontWeight:700,letterSpacing:1,flexShrink:0,marginLeft:8}}>TIMELINE {scenario.num} / 5</div>
          </div>
          <div style={{fontSize:20,fontWeight:900,lineHeight:1.2,marginBottom:4}}>{scenario.title}</div>
          <div style={{fontSize:13,color:C.textSec,fontStyle:"italic",fontFamily:"sans-serif",marginBottom:10}}>"{scenario.tagline}"</div>
          {!hasBothLangs && (
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              <span style={{fontSize:10,color:C.accent,background:C.accentBg,borderRadius:4,padding:"4px 9px",fontFamily:"sans-serif",fontWeight:700}}>🔊 {lang==="EN"?"English":"हिंदी"} Narration</span>
              <span style={{fontSize:10,color:C.textSec,background:C.surface,borderRadius:4,padding:"4px 9px",fontFamily:"sans-serif"}}>CC {lang==="EN"?"English":"Hindi"} Subtitles</span>
            </div>
          )}
          <div style={{height:1,background:C.border,marginBottom:16}}/>
          {[
            {label:"THE ALTERNATE HISTORY",key:"n",expanded:expandN,toggle:()=>setExpandN(p=>!p),accent:C.accent,content:<div style={{color:C.textSec,fontSize:13,lineHeight:1.8,fontFamily:"sans-serif"}}>{scenario.narrative.split("\n\n").map((p,i)=><p key={i} style={{marginBottom:12}}>{p}</p>)}</div>},
            {label:"RIPPLE EFFECTS",key:"r",expanded:expandR,toggle:()=>setExpandR(p=>!p),accent:C.accent2,content:<div style={{display:"flex",flexDirection:"column",gap:8}}>{scenario.ripples.map((r,i)=><div key={i} style={{background:C.surface,borderRadius:8,padding:"10px 12px",display:"flex",gap:10}}><div style={{minWidth:22,height:22,background:C.accent2Bg,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:C.accent2,fontFamily:"sans-serif"}}>{i+1}</div><span style={{fontSize:12,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.5}}>{r}</span></div>)}</div>},
          ].map(item=>(
            <div key={item.key} style={{marginBottom:16}}>
              <div onClick={item.toggle} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",marginBottom:item.expanded?12:0}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:3,height:18,background:item.accent,borderRadius:2}}/><span style={{fontSize:11,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700}}>{item.label}</span></div>
                {item.expanded?<ChevronUp size={18} color={C.accent}/>:<ChevronDown size={18} color={C.accent}/>}
              </div>
              {item.expanded&&item.content}
            </div>
          ))}
          <button onClick={()=>{ markW(sId); triggerUpNext(); }} style={{width:"100%",padding:"13px 0",background:C.accent,border:"none",borderRadius:10,color:C.bg,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",letterSpacing:1,marginBottom:12}}>✓ DONE — PLAY NEXT TIMELINE</button>
          <div style={{display:"flex",gap:12,marginBottom:40}}>
            <button onClick={shareOnWhatsApp} style={{flex:1,padding:"11px 0",border:`1px solid ${C.green}`,borderRadius:10,background:C.greenBg,color:C.green,cursor:"pointer",fontFamily:"sans-serif",fontSize:12,fontWeight:700,letterSpacing:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Share2 size={14}/>SHARE ON WHATSAPP</button>
            <button onClick={()=>toggleBookmark(sId)} style={{padding:"11px 16px",border:`1px solid ${isBookmarked?C.accent:C.border}`,borderRadius:10,background:isBookmarked?C.accentBg:"transparent",color:isBookmarked?C.accent:C.textSec,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Bookmark size={14} fill={isBookmarked?C.accent:"none"}/></button>
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
          <div style={{position:"absolute",bottom:16,right:14,background:C.accent2Bg,border:`1px solid ${C.accent2}`,borderRadius:4,padding:"4px 10px"}}><span style={{fontSize:9,fontWeight:700,color:C.accent2,letterSpacing:1,fontFamily:"sans-serif"}}>WORLD-CHANGING</span></div>
        </div>
        <div style={{padding:"0 22px 0"}}>
          <div style={{fontSize:9,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",marginBottom:6,background:C.accentBg,display:"inline-block",padding:"3px 8px",borderRadius:3,marginTop:4}}>{event.era} ERA</div>
          <div style={{fontSize:22,fontWeight:900,lineHeight:1.2,marginBottom:8}}>{event.title}</div>
          <div style={{display:"flex",gap:16,marginBottom:12}}><span style={{fontSize:12,color:C.accent,fontFamily:"sans-serif"}}>📅 {event.year}</span><span style={{fontSize:12,color:C.textSec,fontFamily:"sans-serif"}}>📍 {event.region}</span></div>
          <div style={{fontSize:13,color:C.textSec,lineHeight:1.7,fontFamily:"sans-serif",marginBottom:14}}>{event.desc}</div>
          <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>{event.tags.map(t=><span key={t} style={{fontSize:11,color:C.accentLight,background:C.accentBg,borderRadius:3,padding:"3px 8px",fontFamily:"sans-serif"}}>#{t}</span>)}</div>
          <div style={{height:1,background:C.border,marginBottom:18}}/>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:3,height:20,background:C.accent,borderRadius:2}}/>
            <div><div style={{fontSize:11,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700}}>5 ALTERNATE TIMELINES</div><div style={{fontSize:11,color:C.textMuted,fontFamily:"sans-serif"}}>Each one a 5-minute documentary</div></div>
          </div>
          {event.scenarios.map((sc,i)=>{
            const sId = event.id+"_"+sc.num;
            const isWatched = watched.has(sId);
            const isBookmarked = bookmarks.has(sId);
            return (
            <div key={i} onClick={()=>attemptWatch(sc,event)} style={{background:C.card,borderRadius:12,marginBottom:10,display:"flex",cursor:"pointer",overflow:"hidden",border:`1px solid ${isWatched?C.accentDark:C.border}`,boxShadow:C.shadow}}>
              <div style={{width:90,minHeight:80,background:event.grad,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{position:"relative",fontSize:28,opacity:isWatched?0.5:1}}>{event.emoji}</span>
                <div style={{position:"absolute",top:7,left:7,width:22,height:22,background:C.accent,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:11,fontWeight:900,color:C.bg,fontFamily:"sans-serif"}}>{i+1}</span></div>
                {isBookmarked && <div style={{position:"absolute",top:7,right:7}}><Bookmark size={14} color={C.accent2} fill={C.accent2}/></div>}
              </div>
              <div style={{padding:"11px 12px",flex:1}}>
                <div style={{display:"flex",justifyContent:"flex-end",marginBottom:4}}>{isWatched
                  ? <div style={{width:30,height:30,borderRadius:"50%",background:C.greenBg,display:"flex",alignItems:"center",justifyContent:"center"}}><CheckCircle size={14} color={C.green}/></div>
                  : <div style={{width:30,height:30,borderRadius:"50%",background:C.accentBg,display:"flex",alignItems:"center",justifyContent:"center"}}><Play size={14} color={C.accent} style={{marginLeft:2}}/></div>}</div>
                <div style={{fontSize:14,fontWeight:700,marginBottom:2,lineHeight:1.2}}>{sc.title}</div>
                <div style={{fontSize:11,color:C.textSec,fontStyle:"italic",fontFamily:"sans-serif",marginBottom:6,lineHeight:1.4}}>{sc.tagline}</div>
                <div style={{fontSize:10,color:C.textMuted,fontFamily:"sans-serif"}}><Clock size={10} style={{display:"inline",verticalAlign:"middle"}}/> 5:00 · {sc.ripples.length} ripple effects{isWatched?" · Watched":""}</div>
              </div>
            </div>
            );
          })}
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
      <div style={{padding:"0 20px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}><div style={{width:3,height:16,background:C.accent,borderRadius:2}}/><span style={{fontSize:11,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700}}>{title}</span></div>
      <div style={{display:"flex",gap:12,paddingLeft:20,paddingRight:20,overflowX:"auto",paddingBottom:8,scrollbarWidth:"none"}}>
        {evts.map(e=>(
          <div key={e.id} onClick={()=>{setEvent(e);setScreen("detail");}} style={{flexShrink:0,width:130,cursor:"pointer"}}>
            <div style={{width:130,height:170,background:e.grad,borderRadius:12,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",marginBottom:8,border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
              <span style={{fontSize:44}}>{e.emoji}</span>
              <div style={{position:"absolute",bottom:8,left:8,background:"rgba(0,0,0,0.7)",borderRadius:3,padding:"2px 6px"}}><span style={{fontSize:10,fontWeight:700,color:C.accent,fontFamily:"sans-serif"}}>{e.year}</span></div>
              <div style={{position:"absolute",top:8,right:8,background:C.accentBg,border:`1px solid ${C.accentDark}`,borderRadius:3,padding:"2px 5px"}}><span style={{fontSize:9,color:C.accent,fontFamily:"sans-serif"}}>5 ⑂</span></div>
            </div>
            <div style={{fontSize:12,fontWeight:700,lineHeight:1.3,color:C.text}}>{e.short}</div>
            <div style={{fontSize:10,color:C.textMuted,fontFamily:"sans-serif",marginTop:2}}>{e.region}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const DesktopRow = ({title,events:evts})=>(
    <div style={{marginBottom:36}}>
      <div style={{padding:"0 48px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}><div style={{width:3,height:18,background:C.accent,borderRadius:2}}/><span style={{fontSize:13,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700}}>{title}</span></div>
      <div style={{display:"flex",gap:16,paddingLeft:48,paddingRight:48,overflowX:"auto",paddingBottom:8,scrollbarWidth:"none"}}>
        {evts.map(e=>(
          <div key={e.id} onClick={()=>{setEvent(e);setScreen("detail");}} style={{flexShrink:0,width:240,cursor:"pointer"}}>
            <div className="kaash-tile" style={{width:240,height:135,background:e.grad,borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",marginBottom:10,border:"1px solid rgba(201,168,76,0.08)"}}>
              <span style={{fontSize:52}}>{e.emoji}</span>
              <div style={{position:"absolute",bottom:10,left:10,background:"rgba(0,0,0,0.7)",borderRadius:4,padding:"3px 8px"}}><span style={{fontSize:11,fontWeight:700,color:C.accent,fontFamily:"sans-serif"}}>{e.year}</span></div>
              <div style={{position:"absolute",top:10,right:10,background:C.accentBg,border:`1px solid ${C.accentDark}`,borderRadius:4,padding:"3px 7px"}}><span style={{fontSize:10,color:C.accent,fontFamily:"sans-serif"}}>5 ⑂</span></div>
            </div>
            <div style={{fontSize:13,fontWeight:700,lineHeight:1.3,color:C.text}}>{e.short}</div>
            <div style={{fontSize:11,color:C.textMuted,fontFamily:"sans-serif",marginTop:2}}>{e.region}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── DESKTOP BROWSE (Netflix-style landing for wide viewports) ───
  // Renders instead of the phone-frame shell when on Home + desktop width.
  // Detail/player/other tabs still use the phone-frame, centered on screen —
  // a full per-screen desktop redesign is a larger follow-on piece of work.
  const DesktopHome = () => {
    const featured=ACTIVE_EVENTS[2]||ACTIVE_EVENTS[0];
    const navLinks=[{id:"explore",label:"Browse"},{id:"new",label:"New"},{id:"search",label:"Search"}];
    return (
      <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"Georgia,serif"}}>
        <style>{`
          .kaash-tile{transition:transform 0.2s ease, box-shadow 0.2s ease;}
          .kaash-tile:hover{transform:scale(1.05);box-shadow:0 12px 40px rgba(201,168,76,0.25),0 0 0 1px rgba(201,168,76,0.2);z-index:2;}
          .kaash-nav-link{transition:color 0.15s ease;}
          .kaash-nav-link:hover{color:${C.accent} !important;text-shadow:0 0 20px rgba(201,168,76,0.4);}
          .kaash-cta{transition:background 0.15s ease, transform 0.15s ease;}
          .kaash-cta:hover{background:${C.accentDark} !important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,168,76,0.35);}
          .kaash-signin{transition:border-color 0.15s ease, color 0.15s ease;}
          .kaash-signin:hover{border-color:${C.accent} !important;color:${C.accent} !important;}
        `}</style>
        <div style={{display:"flex",alignItems:"center",gap:36,padding:"18px 48px",borderBottom:"1px solid rgba(201,168,76,0.08)",background:"rgba(8,10,12,0.96)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:100}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <KaashMark size={28}/>
            <div><span style={{fontSize:20,fontWeight:900,letterSpacing:5,color:C.accent,textShadow:"0 0 20px rgba(201,168,76,0.4)"}}>KAASH</span><span style={{fontSize:9,color:C.textMuted,letterSpacing:2,fontFamily:"sans-serif",marginLeft:8}}>कaश</span></div>
          </div>
          <div style={{display:"flex",gap:24,fontFamily:"sans-serif",fontSize:13}}>
            <span onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} className="kaash-nav-link" style={{color:C.text,fontWeight:700,cursor:"pointer"}}>Home</span>
            {navLinks.map(n=><span key={n.id} onClick={()=>setTab(n.id)} className="kaash-nav-link" style={{color:C.textSec,cursor:"pointer"}}>{n.label}</span>)}
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:14}}>
            {premium && <div style={{fontSize:9,color:C.accent,fontFamily:"sans-serif",fontWeight:700,background:C.accentBg,padding:"4px 8px",borderRadius:12,border:`1px solid ${C.accentDark}`}}>AD-FREE</div>}
            {streak>0 && <div style={{display:"flex",alignItems:"center",gap:4,background:C.card,borderRadius:20,padding:"5px 10px"}}><Flame size={14} color={C.accent2}/><span style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"sans-serif"}}>{streak}</span></div>}
            {loggedIn
              ? <span onClick={()=>setTab("profile")} className="kaash-nav-link" style={{fontSize:13,fontFamily:"sans-serif",color:C.text,cursor:"pointer",fontWeight:700}}>{userName||"Profile"}</span>
              : <span onClick={()=>setScreen("login")} className="kaash-signin" style={{fontSize:13,fontFamily:"sans-serif",color:C.text,cursor:"pointer",border:`1px solid ${C.border}`,padding:"6px 16px",borderRadius:6}}>Sign in</span>}
          </div>
        </div>

        <div style={{height:420,position:"relative",overflow:"hidden",background:featured.grad,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"0 48px 40px"}}>
          <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom,rgba(8,10,12,0.2) 0%,transparent 30%,rgba(8,10,12,0.7) 70%,${C.bg} 100%)`}}/>
          <div style={{position:"relative",maxWidth:560}}>
            <div style={{fontSize:11,letterSpacing:3,color:C.accent,fontFamily:"sans-serif",fontWeight:700,marginBottom:8}}>★ TIMELINE OF THE WEEK</div>
            <div style={{fontSize:42,fontWeight:900,lineHeight:1.15,marginBottom:10}}>{featured.title}</div>
            <div style={{fontSize:13,color:C.textSec,fontFamily:"sans-serif",marginBottom:6}}>{featured.year} · {featured.region}</div>
            <div style={{fontSize:14,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.6,marginBottom:24}}>{featured.desc}</div>
            <button onClick={()=>{setEvent(featured);setScreen("detail");}} className="kaash-cta" style={{padding:"13px 28px",background:C.accent,border:"none",borderRadius:6,color:"#080A0C",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"sans-serif",letterSpacing:2,boxShadow:"0 4px 20px rgba(201,168,76,0.4)"}}>EXPLORE 5 TIMELINES →</button>
          </div>
        </div>

        <div style={{padding:"32px 0 40px"}}>
          <DesktopRow title="INDIA'S ALTERNATE HISTORY" events={ACTIVE_EVENTS.filter(e=>e.cat==="india"||e.region==="South Asia")}/>
          <DesktopRow title="WORLD WARS & CONFLICTS" events={ACTIVE_EVENTS.filter(e=>e.cat==="wars")}/>
          <DesktopRow title="SCIENTIFIC TURNING POINTS" events={ACTIVE_EVENTS.filter(e=>e.cat==="science"||e.id==="moon")}/>
          <DesktopRow title="ANCIENT WORLD" events={ACTIVE_EVENTS.filter(e=>e.cat==="ancient")}/>
          <DesktopRow title="ALL EVENTS" events={ACTIVE_EVENTS}/>
        </div>
      </div>
    );
  };

  const HomeTab=()=>{
    const featured=ACTIVE_EVENTS[2]||ACTIVE_EVENTS[0];
    return (
      <div style={{flex:1,overflowY:"auto",paddingBottom:20}}>
        <div style={{background:featured.grad,minHeight:210,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"0 22px 22px",position:"relative"}}>
          <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom,rgba(10,14,20,0.4),transparent,${C.bg})`}}/>
          <div style={{position:"relative"}}>
            <div style={{fontSize:9,letterSpacing:3,color:C.accent,fontFamily:"sans-serif",fontWeight:700,marginBottom:4}}>★ TIMELINE OF THE WEEK</div>
            <div style={{fontSize:22,fontWeight:900,lineHeight:1.2,marginBottom:4}}>{featured.title}</div>
            <div style={{fontSize:12,color:C.textSec,fontFamily:"sans-serif",marginBottom:14}}>{featured.year} · {featured.region}</div>
            <button onClick={()=>{setEvent(featured);setScreen("detail");}} style={{padding:"10px 18px",background:C.accent,border:"none",borderRadius:8,color:C.bg,fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"sans-serif",letterSpacing:1}}>EXPLORE 5 TIMELINES →</button>
          </div>
        </div>
        <div style={{background:C.surface,display:"flex",justifyContent:"space-around",padding:"12px 16px",marginBottom:20}}>
          {[["100","EVENTS"],["500","TIMELINES"],["5","ERAS"],["5:00","PER VIDEO"]].map(([v,l])=>(<div key={l} style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:900,color:C.accent,fontFamily:"sans-serif"}}>{v}</div><div style={{fontSize:9,letterSpacing:2,color:C.textMuted,fontFamily:"sans-serif"}}>{l}</div></div>))}
        </div>
        <Row title="INDIA'S ALTERNATE HISTORY" events={ACTIVE_EVENTS.filter(e=>e.cat==="india"||e.region==="South Asia")}/>
        <Row title="WORLD WARS & CONFLICTS" events={ACTIVE_EVENTS.filter(e=>e.cat==="wars")}/>
        <Row title="SCIENTIFIC TURNING POINTS" events={ACTIVE_EVENTS.filter(e=>e.cat==="science"||e.id==="moon")}/>
        <Row title="ANCIENT WORLD" events={ACTIVE_EVENTS.filter(e=>e.cat==="ancient")}/>
        <Row title="ALL EVENTS" events={ACTIVE_EVENTS}/>
      </div>
    );
  };

  const ExploreTab=()=>(
    <div style={{flex:1,overflowY:"auto",padding:"16px 0 20px"}}>
      <div style={{padding:"0 20px 16px",display:"flex",alignItems:"center",gap:10}}><div style={{width:3,height:20,background:C.accent}}/><div><div style={{fontSize:13,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700}}>BROWSE BY ERA</div><div style={{fontSize:11,color:C.textMuted,fontFamily:"sans-serif"}}>Filter history by time period</div></div></div>
      <div style={{display:"flex",gap:8,padding:"0 20px",overflowX:"auto",marginBottom:20,scrollbarWidth:"none"}}>
        {ERAS.map(e=><button key={e} onClick={()=>setEra(e)} style={{padding:"7px 14px",borderRadius:6,border:`1px solid ${era===e?C.accent:C.border}`,background:era===e?C.accentBg:"transparent",color:era===e?C.accent:C.textMuted,fontSize:10,letterSpacing:1,cursor:"pointer",fontFamily:"sans-serif",fontWeight:era===e?700:400,whiteSpace:"nowrap",flexShrink:0}}>{e}</button>)}
      </div>
      <div style={{padding:"0 16px"}}>
        {filtered.map(e=>(
          <div key={e.id} onClick={()=>{setEvent(e);setScreen("detail");}} style={{background:C.card,borderRadius:12,marginBottom:10,display:"flex",cursor:"pointer",overflow:"hidden",border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
            <div style={{width:100,minHeight:90,background:e.grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,position:"relative"}}><span style={{fontSize:32}}>{e.emoji}</span><div style={{position:"absolute",bottom:7,left:7,background:"rgba(0,0,0,0.7)",borderRadius:3,padding:"2px 5px"}}><span style={{fontSize:10,fontWeight:700,color:C.accent,fontFamily:"sans-serif"}}>{e.year}</span></div></div>
            <div style={{padding:"12px 12px",flex:1}}><div style={{fontSize:9,color:C.accent,background:C.accentBg,borderRadius:3,padding:"2px 6px",display:"inline-block",marginBottom:6,fontFamily:"sans-serif",fontWeight:700,letterSpacing:1}}>{e.era}</div><div style={{fontSize:13,fontWeight:700,lineHeight:1.3,marginBottom:4}}>{e.title}</div><div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",marginBottom:6,lineHeight:1.4}}>{e.desc.substring(0,60)}...</div><div style={{fontSize:10,color:C.accent,fontFamily:"sans-serif"}}>⑂ 5 alternate timelines · {e.region}</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  const sendSuggestion = async () => {
    if(!q.trim()||suggestionSent||!fb) return;
    try {
      const id = q.toLowerCase().replace(/[^a-z0-9]+/g,"_").slice(0,50);
      const ref = fb.doc(fb.db,"suggestions",id);
      const snap = await fb.getDoc(ref);
      if(snap.exists()) {
        await fb.setDoc(ref,{count:(snap.data().count||0)+1,lastRequested:new Date().toISOString()},{merge:true});
      } else {
        await fb.setDoc(ref,{query:q.trim(),count:1,createdAt:new Date().toISOString(),lastRequested:new Date().toISOString(),status:"pending"});
      }
      setSuggestionSent(true);
    } catch(e){ console.error(e); }
  };

  const SearchTab=()=>(
    <div style={{flex:1,overflowY:"auto",padding:"16px 16px 20px"}}>
      <div style={{position:"relative",marginBottom:16}}>
        <Search size={16} color={C.accent} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/>
        <input value={q} onChange={e=>{setQ(e.target.value);setSuggestionSent(false);}} placeholder="Search events, eras, regions..."
          style={{width:"100%",background:C.surface,border:`1px solid ${q?C.accent:C.border}`,borderRadius:10,padding:"11px 12px 11px 38px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"sans-serif"}}/>
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
        <div key={e.id} onClick={()=>{setEvent(e);setScreen("detail");}} style={{background:C.card,borderRadius:10,marginBottom:8,padding:"12px 14px",cursor:"pointer",display:"flex",gap:12,alignItems:"center",border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
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
            ? <button onClick={sendSuggestion} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",background:C.accent,border:"none",borderRadius:10,color:C.bg,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>
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
          <div style={{width:3,height:20,background:C.accent,borderRadius:2}}/>
          <div style={{fontSize:13,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700}}>WHAT'S NEW</div>
        </div>
        <div style={{fontSize:12,color:C.textMuted,fontFamily:"sans-serif",marginBottom:20}}>New events and timelines added to KAASH</div>
        {newEvents.length===0 ? (
          <div style={{textAlign:"center",padding:"48px 20px"}}>
            <div style={{fontSize:40,marginBottom:12}}>🎬</div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>New drop every Tuesday</div>
            <div style={{fontSize:13,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.6}}>New alternate history events are added every week. Check back on Tuesday for the latest timelines.</div>
          </div>
        ) : newEvents.map((e,i)=>{
          const full = ACTIVE_EVENTS.find(ev=>ev.id===e.id);
          return (
          <div key={e.id||i} onClick={()=>{ if(full){ setEvent(full); setScreen("detail"); } }} style={{background:C.card,borderRadius:12,marginBottom:12,overflow:"hidden",cursor:full?"pointer":"default",border:`1px solid ${C.border}`,opacity:full?1:0.6,boxShadow:full?C.shadow:"none"}}>
            <div style={{background:e.grad||"linear-gradient(135deg,#161D29,#0A0E14)",height:100,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              <span style={{fontSize:40}}>{e.emoji||"📜"}</span>
              {isNew(e.createdAt)&&<div style={{position:"absolute",top:10,left:10,background:C.accent,borderRadius:4,padding:"3px 9px",fontSize:10,fontWeight:700,color:C.bg,letterSpacing:1}}>NEW</div>}
              <div style={{position:"absolute",bottom:8,right:10,fontSize:10,color:C.accent,fontFamily:"sans-serif",fontWeight:700}}>📅 {e.year}</div>
            </div>
            <div style={{padding:"12px 14px"}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:4,lineHeight:1.3}}>{e.title}</div>
              <div style={{fontSize:12,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.5,marginBottom:8}}>{e.desc?.slice(0,80)}...</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,color:C.textMuted,fontFamily:"sans-serif"}}>{e.region} · {e.era}</span>
                <span style={{fontSize:11,color:C.accent,fontFamily:"sans-serif",fontWeight:700}}>5 timelines →</span>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    );
  };

  const ProfileTab=()=>{
    const totalWatched = watched.size;
    const xp = totalWatched * XP_PER_VIDEO;
    const rank = getRank(xp);
    const totalScenarios = ACTIVE_EVENTS.reduce((s,e)=>s+e.scenarios.length,0);
    const pct = totalScenarios>0 ? Math.round(totalWatched/totalScenarios*100) : 0;
    const earnedBadges = ACTIVE_EVENTS.filter(e=>e.scenarios.length>0 && e.scenarios.every(sc=>watched.has(e.id+"_"+sc.num))).map(e=>e.badge||e.short);
    const bookmarkedItems = ACTIVE_EVENTS.flatMap(e=>e.scenarios.filter(sc=>bookmarks.has(e.id+"_"+sc.num)).map(sc=>({event:e,scenario:sc})));
    return (
      <div style={{flex:1,overflowY:"auto",padding:"0 0 20px"}}>
        <div style={{background:`linear-gradient(135deg,${C.accentBg},transparent)`,padding:"40px 24px 24px",textAlign:"center"}}>
          <div style={{width:70,height:70,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},${C.accentDark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 12px"}}>🎓</div>
          <div style={{fontSize:20,fontWeight:900}}>{loggedIn?(userName||"Explorer"):"Guest Explorer"}</div>
          <div style={{fontSize:11,color:C.accent,letterSpacing:2,fontFamily:"sans-serif",marginTop:4}}>{loggedIn?rank:"Not signed in"}</div>
          {premium ? <div style={{marginTop:10,padding:"6px 16px",background:C.accentBg,border:`1px solid ${C.accentDark}`,borderRadius:20,display:"inline-block",fontSize:11,color:C.accent,fontFamily:"sans-serif",fontWeight:700}}>✦ AD-FREE MEMBER</div>
            : <button onClick={()=>setPaywall(true)} style={{marginTop:12,padding:"8px 20px",background:C.accent,border:"none",borderRadius:8,color:C.bg,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>{isTWA ? "GO AD-FREE — GOOGLE PLAY" : "GO AD-FREE — ₹49 + GST/MONTH"}</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 16px 20px"}}>
          {[[<Flame size={20} color={C.accent2}/>,streak,"DAY STREAK"],[<Zap size={20} color={C.accent}/>,xp,"XP EARNED"],[<Star size={20} color={C.accent}/>,totalWatched,"WATCHED"],[<Globe size={20} color={C.green}/>,earnedBadges.length,"BADGES"]].map(([icon,val,label],i)=>(
            <div key={i} style={{background:C.card,borderRadius:10,padding:"14px",textAlign:"center",border:`1px solid ${C.border}`,boxShadow:C.shadow}}><div style={{marginBottom:6}}>{icon}</div><div style={{fontSize:22,fontWeight:900,color:C.text,fontFamily:"sans-serif"}}>{val}</div><div style={{fontSize:9,letterSpacing:1.5,color:C.textMuted,fontFamily:"sans-serif"}}>{label}</div></div>
          ))}
        </div>
        <div style={{padding:"0 16px 16px"}}>
          <div style={{fontSize:11,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700,marginBottom:12}}>TIMELINES EXPLORED</div>
          <div style={{background:C.card,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,fontFamily:"sans-serif"}}>{totalWatched} of {totalScenarios}</span><span style={{fontSize:13,color:C.accent,fontFamily:"sans-serif",fontWeight:700}}>{pct}%</span></div><div style={{height:6,background:C.elevated,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${C.accent},${C.accentLight})`,borderRadius:3}}/></div></div>
        </div>
        {earnedBadges.length>0 && (
          <div style={{padding:"0 16px 16px"}}>
            <div style={{fontSize:11,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700,marginBottom:12}}>BADGES EARNED</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {earnedBadges.map((b,i)=><div key={i} style={{background:C.accent2Bg,border:`1px solid ${C.accent2}`,borderRadius:20,padding:"6px 14px",fontSize:12,color:C.accent2,fontFamily:"sans-serif",fontWeight:700}}>{b}</div>)}
            </div>
          </div>
        )}
        {bookmarkedItems.length>0 && (
          <div style={{padding:"0 16px 16px"}}>
            <div style={{fontSize:11,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700,marginBottom:12}}>MY LIST</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {bookmarkedItems.map(({event:e,scenario:sc})=>(
                <div key={e.id+"_"+sc.num} style={{display:"flex",alignItems:"center",gap:10,background:C.card,borderRadius:10,padding:"10px 12px",border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
                  <div onClick={()=>{setEvent(e);setScenario(sc);setExpandN(false);setExpandR(false);setScreen("player");}} style={{flex:1,cursor:"pointer",minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sc.title}</div>
                    <div style={{fontSize:10,color:C.textMuted,fontFamily:"sans-serif",marginTop:2}}>{e.short}</div>
                  </div>
                  <button onClick={()=>toggleBookmark(e.id+"_"+sc.num)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.accent,flexShrink:0}}><Bookmark size={16} fill={C.accent}/></button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{padding:"0 16px 16px"}}>
          <div style={{fontSize:11,letterSpacing:2,color:C.accent,fontFamily:"sans-serif",fontWeight:700,marginBottom:12}}>YOUR PRIVACY</div>
          <div style={{background:C.card,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`,display:"flex",gap:12,alignItems:"flex-start",marginBottom:10,boxShadow:C.shadow}}>
            <ShieldCheck size={18} color={C.green} style={{flexShrink:0,marginTop:2}}/>
            <div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.6}}>We store only your email and watch history. We never sell your data. You can delete everything from Settings.{" "}
              <a href="/privacy" target="_blank" rel="noopener" style={{color:C.accentLight}}>Privacy Policy</a>{" · "}
              <a href="/terms" target="_blank" rel="noopener" style={{color:C.accentLight}}>Terms</a>{" · "}
              <a href="mailto:grievance@kaash.app" style={{color:C.accentLight}}>Grievance Officer</a>
            </div>
          </div>
        </div>
        <div style={{padding:"0 16px"}}>
          <button onClick={()=>setSettingsPage("menu")} style={{width:"100%",display:"flex",alignItems:"center",gap:12,background:C.card,borderRadius:10,padding:"15px 16px",cursor:"pointer",border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
            <SettingsIcon size={18} color={C.accent}/>
            <span style={{fontSize:14,color:C.text,fontFamily:"sans-serif"}}>Settings</span>
            <ChevronRight size={18} color={C.textMuted} style={{marginLeft:"auto"}}/>
          </button>
        </div>
      </div>
    );
  };

  const tabs=[{id:"home",icon:<Home size={20}/>,label:"Home"},{id:"new",icon:<Bell size={20}/>,label:"New"},{id:"search",icon:<Search size={20}/>,label:"Search"},{id:"explore",icon:<Compass size={20}/>,label:"Explore"},{id:"profile",icon:<User size={20}/>,label:"Profile"}];

  if(isDesktop && screen==="home" && tab==="home") return <DesktopHome/>;

  return (
    <div style={s}>
      <div style={{background:C.surface,padding:"44px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <KaashMark size={28}/>
          <div><span style={{fontSize:20,fontWeight:900,letterSpacing:4,color:C.text}}>KAASH</span><span style={{fontSize:9,color:C.textMuted,letterSpacing:2,fontFamily:"sans-serif",marginLeft:8}}>कaश</span></div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {premium && <div style={{fontSize:9,color:C.accent,fontFamily:"sans-serif",fontWeight:700,background:C.accentBg,padding:"4px 8px",borderRadius:12,border:`1px solid ${C.accentDark}`}}>AD-FREE</div>}
          {streak>0 && <div style={{display:"flex",alignItems:"center",gap:4,background:C.card,borderRadius:20,padding:"5px 10px"}}><Flame size={14} color={C.accent2}/><span style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"sans-serif"}}>{streak}</span></div>}
        </div>
      </div>
      {tab==="home"&&<HomeTab/>}
      {tab==="explore"&&<ExploreTab/>}
      {tab==="new"&&<WhatsNewTab/>}
      {tab==="search"&&<SearchTab/>}
      {tab==="profile"&&<ProfileTab/>}
      <div style={{background:"#0D0C09",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-around",padding:"10px 0 14px",flexShrink:0}}>
        {tabs.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",border:"none",cursor:"pointer",padding:"4px 16px",color:tab===t.id?C.accent:C.textMuted,textShadow:tab===t.id?"0 0 12px rgba(201,168,76,0.4)":"none"}}>{t.icon}<span style={{fontSize:10,fontFamily:"sans-serif",fontWeight:tab===t.id?700:400,letterSpacing:0.5}}>{t.label}</span></button>))}
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
        <div style={{position:"relative",width:72,height:72,marginBottom:24}}>
          <svg width="72" height="72" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
            <circle cx="36" cy="36" r="32" fill="none" stroke={C.border} strokeWidth="3"/>
            <circle cx="36" cy="36" r="32" fill="none" stroke={C.accent} strokeWidth="3"
              strokeDasharray={`${2*Math.PI*32}`}
              strokeDashoffset={`${2*Math.PI*32*(1-countdown/5)}`}
              strokeLinecap="round"
              style={{transition:"stroke-dashoffset 0.9s linear"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:22,fontWeight:900,color:C.accent,fontFamily:"sans-serif"}}>{countdown}</span>
          </div>
        </div>
      </div>
      <div style={{padding:"0 24px 32px",display:"flex",gap:12,flexShrink:0}}>
        <button onClick={onSkip} style={{flex:1,padding:"13px 0",background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,color:C.textSec,cursor:"pointer",fontFamily:"sans-serif",fontSize:13}}>Home</button>
        <button onClick={onPlay} style={{flex:2,padding:"13px 0",background:C.accent,border:"none",borderRadius:10,color:C.bg,cursor:"pointer",fontFamily:"sans-serif",fontSize:13,fontWeight:700,letterSpacing:1}}>▶ PLAY NOW</button>
      </div>
    </div>
  );
}


function AdScreen({onDone,onUpgrade,isTWA}){
  const [count,setCount]=useState(5);
  useEffect(()=>{ if(count<=0){onDone();return;} const t=setTimeout(()=>setCount(c=>c-1),1000); return ()=>clearTimeout(t); },[count,onDone]);
  return (
    <div style={{display:"flex",flexDirection:"column",background:C.bg,color:C.text,fontFamily:"sans-serif",height:640,width:"100%",maxWidth:390,margin:"0 auto",position:"relative"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#161D29,#0A0E14)",position:"relative"}}>
        <div style={{fontSize:10,letterSpacing:2,color:C.textMuted,position:"absolute",top:48,left:20}}>ADVERTISEMENT</div>
        <div style={{fontSize:52,marginBottom:16,filter:"drop-shadow(0 0 16px rgba(201,168,76,0.4))"}}>🎬</div>
        <div style={{fontSize:15,color:C.textSec,textAlign:"center",maxWidth:260,lineHeight:1.7,fontFamily:"Georgia,serif",letterSpacing:0.3}}>A brief moment before your timeline.<br/>This is how KAASH stays free.</div>
        <div style={{marginTop:28,fontSize:13,color:C.text}}>Video starts in <span style={{color:C.accent,fontWeight:900,fontSize:18}}>{count}</span></div>
      </div>
      <div style={{padding:"16px 20px 28px",background:C.bg}}>
        <button onClick={onUpgrade} style={{width:"100%",padding:"13px 0",background:"transparent",border:`1px solid ${C.accent}`,borderRadius:10,color:C.accent,fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:1}}>{isTWA ? "REMOVE ADS  ·  GOOGLE PLAY" : "REMOVE ADS  ·  ₹49 + GST / MONTH"}</button>
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
      <div style={{fontSize:11,letterSpacing:3,color:C.accent,fontWeight:700,marginBottom:14}}>ALTERNATE HISTORY FICTION</div>
      <div style={{fontSize:15,color:C.textSec,lineHeight:1.7,maxWidth:300}}>The following is a <span style={{color:C.text,fontWeight:600}}>speculative, fictional</span> exploration created for educational entertainment. It does not represent actual historical events or the views of any community, nation, or group.</div>
      <div style={{marginTop:32,width:48,height:48,borderRadius:"50%",border:`2px solid ${C.accentDark}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:C.accent}}>{count}</div>
      <button onClick={onDone} style={{marginTop:24,background:"transparent",border:"none",color:C.textMuted,fontSize:12,cursor:"pointer",letterSpacing:1}}>SKIP →</button>
    </div>
  );
}

// ─── KAASH LOGO MARK ────────────────────────────────────────────────
// "Echo K" — a K with its lower stroke echoed in the accent blue,
// representing one timeline branching into two.
function KaashMark({size=28}){
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{flexShrink:0}}>
      <rect x="10" y="6" width="4" height="28" rx="1" fill={C.text}/>
      <path d="M14,20 L34,6" stroke={C.text} strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M14,20 L30,34" stroke={C.text} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.25"/>
      <path d="M17,23 L33,37" stroke={C.accent} strokeWidth="4" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
