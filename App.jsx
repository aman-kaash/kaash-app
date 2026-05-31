import { useState } from "react";
import { Home, Compass, Search, User, Flame, Lock, Play, ChevronRight, ChevronDown, ChevronUp, Share2, Bookmark, X, CheckCircle, Clock, Star, ArrowLeft, Zap, Award, Globe } from "lucide-react";

const C = {
  bg:"#070707",surface:"#0F0F0F",card:"#161616",elevated:"#1E1E1E",border:"#242424",
  gold:"#D4A843",goldLight:"#E8C96A",goldDark:"#8B6A14",goldBg:"rgba(212,168,67,0.1)",
  red:"#C0392B",redBg:"rgba(192,57,43,0.12)",green:"#27AE60",greenBg:"rgba(39,174,96,0.12)",
  blue:"#2980B9",text:"#F0EBE0",textSec:"#8A8070",textMuted:"#4A4540",
};

const USER = { name:"Aman", streak:7, xp:2450, level:"Senior Historian", watched:23, total:500, badges:["Ancient Scholar","WW2 Expert","India Historian"] };

const EVENTS = [
  { id:"ww1", title:"Assassination of Archduke Franz Ferdinand", short:"The Shot That Started WW1", year:1914, era:"MODERN", region:"Europe", cat:"wars", emoji:"🔫", color:"#8B1A1A", grad:"linear-gradient(135deg,#5A0A0A,#1A0303)",
    desc:"On June 28, 1914, a single bullet in Sarajevo triggered a chain reaction killing 20 million and reshaping every nation on Earth.",
    tags:["WW1","Europe","Nationalism"],
    scenarios:[
      {num:1,title:"The Archduke Lives",tagline:"What if Princip's pistol misfired?",premium:false,ripples:["No WW1 → No Versailles → No Nazi Germany","Russian Empire survives → No Soviet Union","Ottoman Empire reforms rather than collapses","US remains isolated → no global superpower role","India's independence delayed 20-30 years"],narrative:"June 28, 1914. Gavrilo Princip raises his pistol — and the weapon jams. Without the assassination, Austria-Hungary has no pretext for its ultimatum to Serbia. The powder keg of 1914 remains, but without a spark, Europe does not explode.\n\nBy 1916, internal reform pressures build within Austria-Hungary. The Archduke pushes through the 'United States of Greater Austria.' Germany, without the Eastern Front consuming Russian millions, focuses on commercial rivalry with Britain.\n\nThere is no Treaty of Versailles — and therefore no Adolf Hitler. The 20th century's bloodiest chapter is avoided by a mechanical failure lasting a fraction of a second.",prompt:"Create a 5-minute alternate history documentary: 'The Archduke Lives.' Sarajevo cobblestone street, golden summer morning, June 28 1914. A young man raises a pistol — it clicks, misfires. Soldiers tackle him. Royal motorcade drives safely away through cheering crowds. Cut to: aerial view of Europe — borders stable, cities lit and peaceful through the 1920s. No trenches, no gas, no Versailles. Narrate the world where WW1 never happened. Documentary style, sepia transitioning to warm gold color, serious scholarly narration, aged map animations."},
      {num:2,title:"Germany Refuses",tagline:"What if Kaiser Wilhelm backed down?",premium:false,ripples:["Limited Balkan war replaces World War I — 200,000 not 20 million dead","Germany retains empire and global prestige","Early functioning League of Nations by 1920","Russian Revolution far less certain without wartime collapse","Middle East remains Ottoman — no Sykes-Picot disaster"],narrative:"Kaiser Wilhelm II, shaken by the scale of mobilisation he's triggering, refuses to give Austria-Hungary his unconditional support. Without German backing, Austria issues a limited ultimatum Serbia can accept.\n\nThe July Crisis becomes the July Climb-Down. A regional Balkan war — 200,000 dead instead of 20 million — shocks Europe into genuine arms reduction.\n\nA proto-League of Nations forms by 1920 with real enforcement power. The Ottoman Empire has more time to modernize. The Middle East's modern borders are drawn by its own people, not British and French diplomats dividing spoils.",prompt:"Create a 5-minute alternate history documentary: 'The Kaiser Blinks.' The German Kaiser at his palace, 1914, reads urgent diplomatic cables — pauses — chooses restraint. Cut to European diplomats at a conference table shaking hands. A small Balkan war erupts and is contained. Map showing stable European borders. By 1920 the League of Nations forms. Cities prospering, no trenches. Show the peaceful 20th century that almost was. Serious documentary, 1910s period-accurate visuals, warm amber palette."},
      {num:3,title:"Britain Stays Neutral",tagline:"What if Britain never entered?",premium:true,ripples:["German-dominated Europe by 1916 — no Nazi successor needed","British Empire weakened — India independent by 1938","United States permanent isolationism","No Balfour Declaration — Israel never established","Anglo-German Cold War replaces US-Soviet Cold War"],narrative:"Britain's Cabinet votes to stay neutral. Without British resources, France faces Germany alone. By 1916, a negotiated peace ends the war with Germany dominant on the continent.\n\nA German-led Europe — not Nazi, but the Kaiser's conservative imperial Germany — emerges. Britain, isolated and exhausted, accelerates its own imperial consolidation. India's independence movement finds an unexpected ally: a Germany willing to destabilise Britain's empire.\n\nThe subcontinent achieves independence in the late 1930s — earlier, but under more chaotic circumstances.",prompt:"Create a 5-minute alternate history documentary: 'Britain Watches.' British Parliament votes for neutrality — MPs divided, shocked. Map showing France and Germany at war while Britain stands aside. German flag over Paris by 1916. Churchill at a window, contemplative. Then: Indian independence 1938, freedom arriving differently. Show Anglo-German rivalry replacing US-Soviet Cold War. Documentary style, Parliament interiors, period maps, serious tone."},
      {num:4,title:"Russia Collapses First",tagline:"What if the Tsar fell in 1914?",premium:true,ripples:["No Soviet Union — democratic Russia emerges in 1914","No communism as global movement — no Mao, no Kim","Germany wins WW1 but remains conservative-imperial","The great ideological war — capitalism vs communism — never happens","China stays a republic — no communist revolution"],narrative:"Russia's pre-existing social fractures trigger a revolution in late 1914 instead of 1917. The Tsar abdicates. A provisional democratic government takes Russia out of the war immediately.\n\nWithout Lenin's sealed train (Germany has no interest in destabilising a Russia already out of the war), the Bolsheviks remain a fringe movement. A democratic Russia — chaotic, large, resource-rich — develops through commerce.\n\nThe 20th century's defining ideological war never happens. Instead: imperial competition between a German-led continental Europe and the Anglo-American Atlantic world.",prompt:"Create a 5-minute alternate history documentary: 'The Early Revolution.' St. Petersburg winter 1914 — massive crowds, Tsar Nicholas signing abdication papers by candlelight. Russian soldiers laying down arms, relief on their faces. Germany rushing west without Eastern Front. Democratic Russia building institutions through the 1920s. The 20th century without communism — different but not utopian. Cold cinematic visuals, dramatic narration."},
      {num:5,title:"Princip Hits the Wrong Target",tagline:"What if he killed a minor official?",premium:true,ripples:["Austria-Hungary reforms — survives as federal state into 1930s","Delayed but smaller world war in 1924 — 3 million not 20 million dead","No Versailles humiliation — Hitler never rises to power","Russian monarchy survives longer, gentle reforms avoid revolution","The 20th century is brutal but not apocalyptic"],narrative:"The Sarajevo plot goes slightly wrong. Princip fires — but shoots Count von Berchtold, Austria's Foreign Minister, instead of the Archduke. Franz Ferdinand survives.\n\nThe assassination of a foreign minister is serious — but not the dynastic crisis the Archduke's death would have been. Austria protests, negotiates, gets concessions from Serbia. No war.\n\nEurope avoids 1914's catastrophe. But the underlying tensions find their release in a different crisis a decade later. A smaller delayed war comes in 1924 — 3 million dead instead of 20 million. Terrible, but survivable.",prompt:"Create a 5-minute alternate history documentary: 'Wrong Target.' Sarajevo street chaos 1914. A gunshot — not the royal car, a diplomat falls instead. Archduke's motorcade escapes. Princip looks horrified. Vienna diplomats negotiate rather than mobilize. Map of Europe with stable borders. Jazz-age prosperity through the 1920s. Then a smaller war in 1924, contained and resolved. Documentary style, bittersweet, period-accurate narration."},
    ]
  },
  { id:"ww2", title:"World War II Begins", short:"The War That Shaped Everything", year:1939, era:"MODERN", region:"Global", cat:"wars", emoji:"💣", color:"#1A1A6E", grad:"linear-gradient(135deg,#0A0A4A,#03030F)",
    desc:"The deadliest conflict in human history — 70-85 million dead, the Holocaust, the atomic bomb, and a world order remade from its ashes.",
    tags:["Holocaust","Nuclear Age","Fascism"],
    scenarios:[
      {num:1,title:"Hitler Dies in 1939",tagline:"What if the Munich assassination succeeded?",premium:false,ripples:["Holocaust never fully executes — 6 million Jewish lives saved","No Operation Barbarossa → USSR never devastated by 27 million deaths","Conservative German Europe vs Anglo-American Atlantic world","Decolonisation happens more slowly without war exhausting empires","Atomic bomb developed but possibly never used"],narrative:"November 8, 1939. Georg Elser's bomb explodes in the Bürgerbräukeller in Munich — but this time, Hitler does not leave 13 minutes early. He is killed instantly.\n\nGermany is in shock. Hermann Göring takes power, but without Hitler's fanatical will, the generals sue for peace by January 1940. The Holocaust, still in early stages, stops. Six million Jews remain alive.\n\nWithout the Eastern Front, there is no Soviet sacrifice of 27 million lives. A conservative German Europe faces a US-British Atlantic alliance. The Cold War still happens — but over ideology, not survival.",prompt:"Create a 5-minute alternate history documentary: 'Munich 1939.' A Munich beer hall November 8 1939. Explosion — Nazi officials fall. Germany in shock. Wehrmacht receiving ceasefire orders, confused but relieved. A Jewish family in Warsaw, lights turning back on, embracing with relief. Map of Europe stabilizing without Nazi expansion. Show the Holocaust that stopped. Dramatic documentary style, period interiors, serious narration, bittersweet tone."},
      {num:2,title:"D-Day Fails",tagline:"What if Normandy was repelled?",premium:false,ripples:["Soviet Union dominates all of Europe to the Rhine","France becomes a communist republic by 1947","US retreats into Western Hemisphere isolationism","NATO never formed — Europe never free from Soviet control","Britain survives but as isolated secondary power"],narrative:"June 6, 1944. Rommel's Panzer reserves, positioned near the beaches this time, counterattack within hours. Allied forces are pushed back into the sea with catastrophic losses.\n\nWithout a Western Front, the Soviet Union alone liberates Europe — and takes everything to the Rhine. France becomes a communist republic. Britain, exhausted and isolated, watches helplessly.\n\nThe Cold War doesn't begin as a contest between equals. It begins as a Soviet-dominated world facing a weakened Anglo-American rump. A darker, more one-sided world than the one we inhabit.",prompt:"Create a 5-minute alternate history documentary: 'The Day That Failed.' Normandy beach June 6 1944 — German Panzer tanks counterattacking within hours. Allied boats hit, soldiers retreating into the sea. Churchill in war room, head bowed in defeat. Map of Europe: red Soviet color flooding west to the Rhine. Eiffel Tower with Soviet red flag. Cold, tragic, somber documentary. Gray palette, grave historical narration about the world that almost was."},
      {num:3,title:"Japan Skips Pearl Harbor",tagline:"What if Japan chose SE Asia only?",premium:true,ripples:["US stays out of WW2 — Nazi Germany wins in Europe","Japan controls all of Pacific and South Asia","Holocaust completes without Allied liberation","World divided: Nazi Europe and Japanese Asia","US develops atomic bomb but the world is already divided"],narrative:"December 1941. Admiral Yamamoto's Pearl Harbor plan is rejected. Japan moves south only — taking Malaya, Singapore — without provoking America directly.\n\nFDR, without a direct attack on American territory, cannot bring Congress into the war. Germany, without US entry, defeats the Soviet Union by 1943. The Holocaust completes without Allied liberation.\n\nA German-Japanese axis divides Eurasia. Britain surrenders in 1944. The darkest timeline: no allied liberation, no Nuremberg trials, no world order built on human rights.",prompt:"Create a 5-minute alternate history documentary: 'The Pivot South.' Japanese Zeroes turning away from Pearl Harbor, flying toward Southeast Asian jungles. Pearl Harbor peaceful — American sailors at breakfast, unaware. US Congress voting against war. Nazi swastika spreading across European map, Japanese rising sun across Asian map. The world divided in darkness by 1945. The Man in the High Castle visual aesthetic. Cold, dark, gravely serious narration."},
      {num:4,title:"Germany Wins Battle of Britain",tagline:"What if the RAF was destroyed?",premium:true,ripples:["Britain occupied — Churchill government in exile in Canada","No American base in Europe — war in Europe unwinnable for Allies","Nuclear standoff between US and Nazi Germany defines postwar world","Holocaust occurs across all of occupied Europe including Britain","Commonwealth nations become the new free world"],narrative:"Summer 1940. The Luftwaffe maintains focus on RAF airfields instead of switching to London. By September, Fighter Command is broken. Operation Sea Lion launches.\n\nLondon falls by Christmas. Churchill is captured. Without Britain as a base, the US cannot project force into Europe. The Atlantic is a German sea.\n\nThe world's most powerful democracy faces nuclear deterrence with Nazi Germany — both sides with atomic weapons by 1950. A standoff built not on competing ideologies but on mutual terror.",prompt:"Create a 5-minute alternate history documentary: 'Operation Sea Lion.' Summer 1940: Spitfires shot down one by one. German bombers uncontested over London. Landing craft crossing the Channel — Dover cliffs visible. Churchill captured on steps of Downing Street. Swastika on Big Ben. Churchill government in exile in Ottawa, Canada. Nuclear standoff between Washington and Berlin in the 1950s. Dunkirk cinematic style meets darkest alternate history."},
      {num:5,title:"Atomic Bomb Never Used",tagline:"What if Truman chose invasion?",premium:true,ripples:["1 million+ Allied deaths in Japanese invasion — far more than atomic bombings","Japan physically destroyed through conventional war — decades slower recovery","Nuclear taboo never exists — Cold War is catastrophically more dangerous","Anti-nuclear movement never exists — no Hiroshima imagery to point to","Korean War: South Korea almost certainly falls to the North"],narrative:"Summer 1945. Truman, haunted by civilian death projections, chooses Operation Downfall over the atomic bomb. The ground invasion of Japan begins November 1945. One million Allied casualties. Five to ten million Japanese killed.\n\nThe bomb exists — but having never been used, its psychological weight is different. When the Soviets test their device in 1950, there is no 'you already crossed that line' dynamic.\n\nThe Cold War nearly becomes hot — three times. Each time, generals on both sides are willing to 'be the first.' The horror of Hiroshima that restrained real leaders does not exist in this world.",prompt:"Create a 5-minute alternate history documentary: 'The Invasion.' Truman at Oval Office desk, choosing the INVASION folder. American landing craft hitting Japanese beaches, massive brutal fighting. Casualty numbers scrolling. A mushroom cloud photo labeled 'NEVER USED — FILE PHOTO.' Soviet nuclear test in Siberia 1950. Cold War without a ceiling — generals with no Hiroshima memory to stop them. Bridge of Spies meets apocalyptic history. Tense, gray, haunting documentary."},
    ]
  },
  { id:"partition", title:"Partition of British India", short:"The Midnight Division", year:1947, era:"CONTEMPORARY", region:"South Asia", cat:"india", emoji:"🇮🇳", color:"#8B5A00", grad:"linear-gradient(135deg,#5A3800,#1A1000)",
    desc:"August 1947: British India divided into two nations overnight. Up to 2 million killed, 15 million displaced, and a nuclear rivalry born that shapes South Asia today.",
    tags:["India","Pakistan","Independence"],
    scenarios:[
      {num:1,title:"United India",tagline:"What if Gandhi's vision prevailed?",premium:false,ripples:["No India-Pakistan wars — no nuclear South Asia standoff","Kashmir never disputed — integrated with Muslim-majority autonomy","United India becomes world's second economy by 2000","No Bangladesh Liberation War of 1971 — no genocide","South Asian integration 50 years ahead of actual trajectory"],narrative:"Mountbatten, persuaded by Gandhi's moral authority, insists on a 5-year transfer of power rather than 6 months. Jinnah, offered Prime Minister of a united secular India, accepts.\n\nA united, federal India of 1952 is the most populous nation on Earth — over 400 million people. No Partition violence. No million dead in communal riots. No 15 million refugees.\n\nBy 2000, a United India — still deeply imperfect — is the world's second-largest economy. No nuclear standoff. No Kashmir insurgency. 1.5 billion people sharing infrastructure, culture, and a single market that makes ASEAN look small.",prompt:"Create a 5-minute alternate history documentary: 'United India.' Red Fort Delhi, August 1947. A single tri-colour flag — massive crowds of Hindus, Muslims and Sikhs celebrating together. Nehru and Jinnah standing side by side, shaking hands. Gandhi watching from the crowd, smiling in white khadi. Map of undivided India glowing gold. Fast-forward montage: united cities, shared railways, thriving civilization through the decades. Warm sunrise colors. Pride, unity, possibility."},
      {num:2,title:"Jinnah Survives to 1970",tagline:"What if Pakistan's founder lived 22 more years?",premium:false,ripples:["Secular democratic Pakistan — Army never takes political dominance","No 1965 or 1971 India-Pakistan wars — or they end far faster","Bangladesh achieves independence through negotiation not genocide","Pakistan nuclear program develops much later without military control","South Asian economic integration 30 years ahead of actual trajectory"],narrative:"Jinnah's tuberculosis is successfully treated. He governs Pakistan until 1965, dying at 88. The Pakistan he builds is secular and democratic — his stated vision, not the Islamist-military hybrid his early death enabled.\n\nWhen the Bengali crisis erupts in East Pakistan, Jinnah's framework accommodates autonomy demands through negotiation. Bangladesh becomes independent in 1970 — without the genocide that killed 3 million in reality.\n\nIndia-Pakistan wars of 1965 and 1971 don't happen. The resources both nations spent on militarisation over 75 years are channelled into development.",prompt:"Create a 5-minute alternate history documentary: 'The Quaid Lives.' Karachi Pakistan 1960 — Jinnah distinguished and elderly at Parliament. Democratic institutions visible: opposition benches, free press, women MPs. Modern Karachi prospering cosmopolitan city. India-Pakistan cricket match 1962, both sets of fans smiling. Open borders, trade caravans crossing. Bangladesh achieving independence through dialogue 1970. What democratic Pakistan looked like. Golden 1960s aesthetic, proud and peaceful."},
      {num:3,title:"Sardar Patel as First PM",tagline:"What if the Iron Man led India?",premium:true,ripples:["Market economy from 1950 — India's GDP equals China's by 2000","Kashmir integrated decisively in 1947 — no decades of territorial conflict","India aligns with the West — different Cold War and development trajectory","License Raj never created — private sector dominant from India's birth","India becomes manufacturing superpower rather than services economy"],narrative:"Sardar Vallabhbhai Patel, not Nehru, becomes India's first Prime Minister. Patel's economic policies are market-oriented — no Soviet-style planning, no License Raj, no public sector dominance over private enterprise.\n\nKashmir is integrated more decisively in 1947. India aligns with the West in the Cold War. Private enterprise is freed from bureaucratic control from birth.\n\nBy 1975, India is where China is today — the world's factory floor. By 2000, India is economically peer with the United States. A materially wealthier India, though Patel's critics note the social safety net Nehru built is largely absent.",prompt:"Create a 5-minute alternate history documentary: 'The Iron PM.' Sardar Patel raising Indian flag on Red Fort, August 1947. His decisive integration of 562 princely states shown on animated map. Market economy in 1950: factories, private enterprise, bustling commerce. India aligning with America in Cold War. Fast-forward: India as manufacturing superpower by 1980. Comparison with our Nehruvian timeline. Strong, direct, historically grounded narration."},
      {num:4,title:"Three Nations Born",tagline:"What if Ambedkar's Dalit state was carved out?",premium:true,ripples:["Third South Asian nation — Dalit homeland — established 1947","India forced to confront caste systemically from the very beginning","Dalit rights advance 40 years faster than in our timeline","Ambedkar becomes head of state — different constitution written","Caste becomes a global human rights issue by 1960 not 1990"],narrative:"The Partition negotiations go further. Dr. B.R. Ambedkar wins international support for a third state — a Dalit homeland in parts of Maharashtra and Karnataka. 60 million people, historically India's most oppressed, receive an independent nation.\n\nIndia, losing both Pakistan and this third entity, is forced to confront the caste question its upper-caste leadership would have deferred for decades. The Dalit success story next door creates irresistible pressure for social reform inside India.\n\nThree South Asian nations: complex, expensive, and full of tensions — but the 200 million Dalits still inside India have living proof that social equality is achievable.",prompt:"Create a 5-minute alternate history documentary: 'Three Nations.' United Nations 1947: three South Asian delegations — Indian, Pakistani, and a third led by Ambedkar. Three flags raised simultaneously, the third a new blue flag. A new capital city rising in the Deccan — workers building with purpose and pride. Schools, hospitals, clean streets. Ambedkar addressing a massive crowd, people weeping with joy and relief. Mandela's Long Walk meets Indian independence. Powerful, emotional, justice-centered."},
      {num:5,title:"Slower Partition — No Violence",tagline:"What if Britain stayed until 1960?",premium:true,ripples:["Partition violence never happens — 2 million lives saved overnight","South Asian confederation with open borders established by 1960","Kashmir integrated through negotiation — no Line of Control ever drawn","Neither India nor Pakistan develops nuclear weapons until 1990s","The subcontinent's most talented people never flee refugee crisis"],narrative:"A slow, negotiated transfer — province by province over 13 years — begins in 1947 but completes only in 1960. The violence of 1947's Partition — the million dead, the 15 million displaced — never happens. Communities migrate gradually over 13 years, retaining their property and their dignity.\n\nBy 1960, a confederation emerges: India and Pakistan as separate nations but within a South Asian economic and defence community — like the EU, but 30 years before the EU existed.\n\nThe resources that both nations spent on three wars and two nuclear programs — channelled instead into roads, hospitals, and schools for one billion people.",prompt:"Create a 5-minute alternate history documentary: 'The Slow Peace.' Round table conference Delhi 1947 — Indian Pakistani and British leaders negotiating calmly over maps. Province by province, flags changing gradually over years. People watching peacefully — not fleeing trains. 1960: India and Pakistan independence ceremonies on the same day, leaders present at both, smiling. Open border trade caravans. Viceroy's House meets diplomatic hope. Measured, dignified, warm visuals."},
    ]
  },
  { id:"moon", title:"Apollo 11 Moon Landing", short:"The Leap That Almost Wasn't", year:1969, era:"CONTEMPORARY", region:"Global", cat:"science", emoji:"🌙", color:"#0A1A3E", grad:"linear-gradient(135deg,#050F28,#01040C)",
    desc:"July 20, 1969. Humanity's greatest achievement. But what if the most audacious mission in history had gone differently?",
    tags:["Space Race","Cold War","NASA"],
    scenarios:[
      {num:1,title:"Astronauts Stranded on the Moon",tagline:"What if the ascent engine failed?",premium:false,ripples:["Nixon reads his prepared 'fate has ordained' speech to a stunned world","Space exploration pauses for an entire decade of grief and review","The Moon becomes humanity's most sacred permanent memorial site","The three men celebrated as history's greatest explorers who gave everything","Safety protocols transform — NASA's culture changes fundamentally"],narrative:"The Eagle has landed. But when Armstrong and Aldrin attempt to fire the ascent engine, nothing happens. The engine that will carry them back to Columbia has failed.\n\nMission Control works for 32 hours. Nothing works. Nixon reads his prepared speech — written before the mission 'just in case' — to a stunned world: 'Fate has ordained that the men who went to the Moon to explore in peace will stay on the Moon to rest in peace.'\n\nThe Moon becomes humanity's most sacred memorial. Space exploration pauses for ten years. When it resumes, everything is different.",prompt:"Create a 5-minute alternate history documentary: 'Stranded on the Moon.' Lunar surface 1969 — Eagle lander, lights slowly dimming. Mission Control Houston — silent, heads bowed. Nixon in Oval Office reading the 'fate has ordained' speech prepared in advance. Earth from space — beautiful, indifferent. Flags at half-mast worldwide. The Moon as eternal memorial. First Man emotional restraint meets cosmic tragedy. Slate blue and silver palette. The most profound 'what if' in human exploration history."},
      {num:2,title:"Soviets Land First",tagline:"What if the cosmonaut beat Armstrong?",premium:false,ripples:["Soviet Union wins the Space Race — the ideological battle decided","US Congress triples NASA budget immediately — race to Mars begins","American scientific community galvanized by unprecedented defeat","Cold War psychological balance shifts dramatically for a decade","Moon base established by both superpowers by 1975 in rivalry"],narrative:"July 12, 1969. Soviet cosmonaut Alexei Leonov descends a ladder onto the lunar surface. The Soviet flag is planted. Pravda runs the headline for 48 hours.\n\nNASA Mission Control watches the Soviet feed in silence. Armstrong and Apollo 11, launching 8 days later, arrives at a Moon already visited. He still lands — the second man on the Moon.\n\nThe defeat galvanizes America. Congress triples NASA's budget. The race to Mars begins immediately. By 1975, both superpowers have permanent Moon bases. The Space Age we were promised — and lost — actually happens.",prompt:"Create a 5-minute alternate history documentary: 'Soviet First.' Moscow July 1969 — Red Square massive screens showing Soviet cosmonaut on lunar surface, hammer and sickle planted. Crowd erupting in tears of triumph. NASA Mission Control watching Soviet feed in stunned silence. Then: American Congress emergency session, NASA budget tripled. Apollo 11 still lands — second flag on Moon. Race to Mars begins 1970. Moon bases by 1975. Soviet golden triumph meeting American resolve. Epic space race documentary."},
      {num:3,title:"Moon Colony by 1985",tagline:"What if Nixon funded the next step?",premium:true,ripples:["Permanent Moon base houses 50 humans by 1980 — continuously occupied","Mars landing by Neil Armstrong in 1985 — the next giant leap","Space industry creates new economic sector pulling US out of 1970s malaise","Climate change discovered earlier from orbital observation platforms","Space-based solar power solves 1973 oil crisis — Middle East loses leverage"],narrative:"Nixon, riding the Apollo 11 wave, makes the boldest political decision in American history: a permanent Moon colony by 1980, Mars by 1990. Congress, caught up in the moment of national triumph, approves.\n\nNASA's budget is ten times larger than it was in reality. By 1975, Moonbase Armstrong houses 12 people. By 1980, 50. By 1985, Neil Armstrong walks on Mars.\n\nThe space industry creates an entirely new economic sector in the 1980s — pulling America out of the stagnation that Vietnam and Watergate caused in real history.",prompt:"Create a 5-minute alternate history documentary: 'The Colony.' Nixon signing the Moonbase Act 1969, NASA engineers cheering. Construction crews on the Moon by 1974 — dome habitats growing on the lunar surface. Moonbase Armstrong with 50 people living and working, 1980. Then: 1985 Mars landing — American flag on red Martian soil. Space industry cities on Earth in 1990. Earth viewed from Mars orbit. The Space Age we were promised. Optimistic, triumphant, forward-looking. Contrasting 1969 NASA footage with the magnificent expansion that followed."},
      {num:4,title:"Moon Landing Never Attempted",tagline:"What if Apollo 1 ended the program?",premium:true,ripples:["Moon remains unvisited by humans — to this very day in our timeline","Space exploration focuses on unmanned missions — more scientific data, less drama","The $25 billion saved redirected to urban development and education","No 'space generation' of engineers and scientists inspired by Moon landing","Global cooperation in space happens earlier — no nationalist space race"],narrative:"January 27, 1967. Apollo 1 fire kills astronauts Grissom, White, and Chaffee. Congress, horrified by the loss, cancels the manned Moon program entirely. Too dangerous, too expensive, too political.\n\nJuly 1969. No special broadcast. People going about ordinary summer lives. The Moon hangs in the sky — untouched, pristine, unclaimed.\n\nWithout the Moon landing's inspiration, a generation of engineers isn't born. But the $25 billion is redirected to education, healthcare, urban development. A different America. Not better, not worse — just different.",prompt:"Create a 5-minute alternate history documentary: 'The Moon We Never Touched.' Apollo 1 fire 1967 — solemn and respectful. Congressional hearings canceling the manned program. July 20 1969: ordinary American summer streets, no special TV broadcast, families going about daily life. The Moon hanging in night sky — beautiful, pristine, forever unvisited. Fast-forward: 1979, 1989, 2009, 2024 — Moon still untouched by human hands. America that invested those billions in its cities instead. Melancholic, thoughtful, asking what we gained and what we lost."},
      {num:5,title:"China Lands First in 1969",tagline:"What if there were three entrants?",premium:true,ripples:["Three-way space race — US, USSR, China — drives unprecedented global investment","China becomes space and tech superpower 50 years ahead of actual schedule","Asian century begins in 1975 not 2000 — very different global economy","Cold War becomes three-polar — fundamentally different geopolitics for all nations","Space becomes Asia-Pacific dominated — technology geography transformed"],narrative:"China, which in reality had its own lunar program that was quietly cancelled, succeeds in this timeline. July 25, 1969: five days after Armstrong, a Chinese taikonaut plants the five-star red flag on the lunar surface.\n\nThree flags on the Moon within a week. The world is stunned. A three-way space race begins — and with it, a three-polar Cold War. US, Soviet, and Chinese spheres of influence reshape every alliance on Earth.\n\nChina becomes a technology superpower in the 1970s instead of the 2000s. The Asian century begins 25 years early.",prompt:"Create a 5-minute alternate history documentary: 'Three Flags on the Moon.' July 25 1969: Chinese lunar lander descending to the surface. Taikonaut in Chinese spacesuit planting five-star flag on the Moon. Three flags in one week — US, Soviet, Chinese. Three mission controls celebrating simultaneously. Map of Earth showing three-polar Cold War spheres. China as 1970s technology superpower. Asian century beginning 25 years early. Use distinct visual palettes for each nation's sequences — American blue, Soviet red, Chinese gold."},
    ]
  },
  { id:"alexander", title:"Alexander the Great Survives", short:"The King Who Lived On", year:323, era:"ANCIENT", region:"Global", cat:"ancient", emoji:"⚔️", color:"#4A3800", grad:"linear-gradient(135deg,#2E2200,#0C0800)",
    desc:"Alexander the Great died at 32 in Babylon — possibly the most consequential early death in all of history. What if he had lived another 40 years?",
    tags:["Ancient","Alexander","Greece"],
    scenarios:[
      {num:1,title:"Alexander Conquers Arabia",tagline:"What if he completed his next campaign?",premium:false,ripples:["Greco-Persian civilization spanning from Greece to the borders of China","Alexandria becomes world capital with 3 million people by 200 BC","Scientific revolution happens in 100 BC not 1600 AD — 1500 years early","Roman Empire never needs to rise — Alexander's empire fills that role","Christianity and Islam emerge in a very different cultural and political context"],narrative:"323 BC. Alexander, instead of dying of fever in Babylon, recovers. His next campaign — Arabia — begins within months.\n\nBy 315 BC, the Arabian Peninsula is Macedonian. By 305, Carthage has fallen. By 290, Alexander is 33 years into his rule, with an empire stretching from Greece to the borders of China.\n\nThe Pax Alexandrina — a Greco-Persian peace covering half the world's population — accelerates science, trade, and philosophy by 500 years. The world of 100 BC looks like our world of 1700 AD.",prompt:"Create a 5-minute alternate history documentary: 'Alexander at 70.' Alexander the Great surviving his Babylon fever, recovering triumphantly. Arabian campaign: armies crossing desert, ancient maps expanding. His empire at maximum — Greece to India, Persia to Carthage. The Pax Alexandrina: scholars from Athens, Persia and India exchanging knowledge in Alexandria's great library. Scientific discoveries cascading — steam power by 100 BC. The world 500 years ahead of schedule. Golden epic ancient visuals, sweeping sense of wonder."},
      {num:2,title:"Greece and India United",tagline:"What if he allied with Chandragupta?",premium:false,ripples:["Greco-Indian civilization — Sanskrit and Greek merge into one tradition","Buddhism spreads west through Greek cultural networks 500 years early","Indian mathematics meets Greek geometry — revolution of knowledge","Trade routes from Athens to Pataliputra fully open for centuries","First truly global civilization by 200 BC — 1800 years ahead of schedule"],narrative:"Alexander, surviving, returns to India. Instead of fighting Chandragupta Maurya, he forms an alliance — recognizing the Mauryan king as an equal ruler of the eastern half of the world.\n\nThe Greco-Mauryan civilization that results is unprecedented: Greek logic and Indian mathematics merge, producing calculus by 200 BC. Buddhist philosophy reaches Greece, influencing Stoicism. Sanskrit and Greek scholars work together in Alexandria.\n\nThe world's first truly global civilization is born in 300 BC — 1,800 years ahead of schedule.",prompt:"Create a 5-minute alternate history documentary: 'East and West United.' Alexander meeting Chandragupta Maurya on the banks of the Indus — two great kings, mutual respect and recognition. Greek and Indian soldiers side by side. Scholars from Athens and Taxila collaborating in a vast library. Sanskrit and Greek scrolls side by side. Buddhist monks and Greek philosophers in genuine dialogue. Indian mathematics meeting Greek geometry — the resulting scientific revolution. Warm golden ancient visuals, profound sense of possibility."},
      {num:3,title:"The Empire That Held Together",tagline:"What if his successors didn't fight?",premium:true,ripples:["No 'Wars of the Diadochi' — empire stays unified for centuries","Single Hellenistic civilization dominates all of Eurasia for 500 years","Roman Republic never becomes necessary — no power vacuum in the west","Christianity emerges within Greek philosophical context from its very birth","Industrial revolution happens in 0 AD not 1750 AD — 1750 years early"],narrative:"Alexander dies at 32 — but in this timeline, he has been wise enough to designate clear succession with genuine constitutional mechanisms. His son, with a council of senior generals bound by oath, maintains the empire's unity.\n\nWithout the devastating Wars of the Diadochi that fragmented Alexander's empire in reality, the Hellenistic world remains unified for 300 more years. Rome never needs to rise.\n\nBy 0 AD, this civilization has the equivalent of our 1700s technology. The question becomes: do they reach the Moon by 500 AD?",prompt:"Create a 5-minute alternate history documentary: 'The Empire Eternal.' Alexander designating clear succession in a solemn ceremony in Babylon. His son ruling with generals as constitutional council. The Hellenistic world map staying whole — no fragmentation. By 200 BC: a unified civilization from Greece to India. By 0 AD: steam-powered ships on the Mediterranean, advanced libraries, early scientific method, cities of a million people. No Roman Empire needed. Grand historical sweep, speculative technology, sense of possibility."},
      {num:4,title:"Alexander Becomes Persian",tagline:"What if he truly went native?",premium:true,ripples:["Persian culture dominates over Greek in the merged civilization","Zoroastrianism becomes the dominant world religion for centuries","Persian language becomes the Latin of antiquity — universal tongue","Western civilization develops on an Eastern philosophical foundation","A fundamentally different moral framework underlies all of modernity"],narrative:"Alexander, surviving, fully embraces Persian culture — not as a conqueror wearing Persian robes for politics, but as a genuine cultural convert. He learns Persian fluently, practices Zoroastrian ceremonies daily, rules as a Persian King of Kings.\n\nHis successors are Persian-Greek, then primarily Persian. Greek language remains scholarly, but Persian becomes the empire's common tongue.\n\nWestern civilization is built on Eastern foundations. The philosophical basis of modernity is Zoroastrian rather than Greek. A fundamentally different world emerges.",prompt:"Create a 5-minute alternate history documentary: 'The Persian King.' Alexander in full Persian royal regalia — crown, robes, attending fire temple ceremonies as a true believer. His court speaks Persian. His children raised as Persians. Greek culture becomes one thread in a Persian-dominant civilization. Map of empire labeled in Persian script. By 200 BC, Persian is the Mediterranean's dominant language. Amber and lapis lazuli color palette. Persian architectural grandeur. What if Western civilization had Eastern foundations?"},
      {num:5,title:"Alexander Reaches the Americas",tagline:"What if he sailed west?",premium:true,ripples:["Old World meets New World 1800 years before Columbus — on very different terms","Native American civilizations encounter Greek science and mathematics early","Disease still spreads but from much smaller initial contact — less catastrophic","Two parallel civilizations develop in contact from 280 BC onwards","The world of 2024 has 1800 more years of cross-cultural exchange"],narrative:"310 BC. Alexander, obsessed with what lies beyond the Pillars of Hercules, commissions a massive fleet. Sailing west from Carthage, after months at sea, his ships reach the Caribbean.\n\nThe encounter is different from Columbus's: Alexander is curious, not primarily acquisitive. He establishes a trading colony. Greek mathematics and navigation spread. Mesoamerican astronomical knowledge flows east.\n\nTwo civilizations in contact from 280 BC have 1,800 more years of exchange. The world of 2024 stands on 1,800 additional years of human cooperation.",prompt:"Create a 5-minute alternate history documentary: 'Alexander's Western Ocean.' 310 BC: ancient Greek warships sailing into the Atlantic from Carthage. Months at sea, storms, ancient navigation by stars. Caribbean beaches: Greek soldiers encountering Taino people — Alexander gesturing for trade, not conquest. Greek writing and Mayan hieroglyphs side by side. Ancient maps showing the new world added to the known world. 1800 years of contact: what both civilizations become together. Epic oceanic ancient adventure, sense of wonder, mutual discovery."},
    ]
  },
  { id:"cuban", title:"Cuban Missile Crisis", short:"13 Days That Nearly Ended Everything", year:1962, era:"CONTEMPORARY", region:"Global", cat:"wars", emoji:"☢️", color:"#3A1000", grad:"linear-gradient(135deg,#280A00,#080200)",
    desc:"October 1962: the closest humanity has ever come to nuclear war. 13 days when a single wrong decision could have ended civilization.",
    tags:["Cold War","Nuclear","Kennedy"],
    scenarios:[
      {num:1,title:"Soviet Submarine Fires",tagline:"What if Arkhipov said yes?",premium:false,ripples:["First nuclear weapon used since Nagasaki — the taboo is broken catastrophically","US immediately launches full nuclear response — 50 million dead in 24 hours","Nuclear winter follows the exchange — global famine kills hundreds of millions","Remaining humanity rebuilds over 50 years primarily in the Southern Hemisphere","The survivors create the first true world government from the ashes"],narrative:"October 27, 1962. Soviet submarine B-59, cut off from communications, under depth charge attack from US destroyers. Captain Savitsky believes war has started. He orders the nuclear torpedo armed.\n\nIn reality, Vasili Arkhipov refused to authorize the launch. He saved the world. In this timeline, he is overruled by the majority.\n\nWithin 24 hours, humanity has exchanged nuclear warheads. Northern Hemisphere civilization ends. The survivors — in the Southern Hemisphere, in bunkers — emerge to rebuild over the next 50 years.",prompt:"Create a 5-minute alternate history documentary: 'Arkhipov Says Yes.' Cramped Soviet submarine interior October 1962, depth charges shaking the hull. Captain ordering nuclear torpedo armed. Arkhipov — face showing the weight of history — saying yes instead of his famous no. Torpedo firing. US carrier detecting explosion. Nuclear war protocol activating. Map showing warhead trajectories. Cities in ruins. Southern Hemisphere survivors. Das Boot claustrophobia meets apocalyptic history. The most important 'no' that became 'yes.'"},
      {num:2,title:"Khrushchev Refuses All Terms",tagline:"What if the Soviet leader held firm?",premium:false,ripples:["Limited nuclear exchange over Cuba — civilization-shaking even if not civilizatio-ending","Both Kennedy and Khrushchev are removed by their own militaries within weeks","Caribbean contaminated with radiation for a generation — Cuba uninhabitable","UN Emergency session creates first real world governance body from trauma","Nuclear weapons partially abolished by 1964 — the near-miss produces real change"],narrative:"October 27, 1962. Khrushchev, pushed by hardliners in Moscow, refuses all Kennedy's demands. The US naval blockade fires on a Soviet submarine. The submarine fires back.\n\nNuclear weapons are used — not city-targeting strategic warheads, but battlefield tactical nuclear weapons over Cuba. The island is destroyed. Radiation spreads through the Caribbean.\n\nThe world is shocked into sense. Both leaders are removed by their own governments. A UN emergency session — with the mushroom cloud photos still on every front page — creates the first real world governance body.",prompt:"Create a 5-minute alternate history documentary: 'October 28.' White House Situation Room October 27 1962 — Kennedy reading Khrushchev's final defiant refusal. DEFCON 1. Naval confrontation over Cuba. A tactical nuclear detonation over the island — not a city, but visible. Mushroom cloud over Caribbean. Both leaders removed by their militaries. UN emergency session: world governments united by shared horror. World governance emerging from nuclear trauma. Institutional dread, cold blues, the crisis that didn't resolve."},
      {num:3,title:"Cuba Brokers Peace Unilaterally",tagline:"What if Castro called Kennedy directly?",premium:true,ripples:["Cuba gains permanent neutral status — the Switzerland of the Americas","Castro becomes unexpected global peace icon — Nobel Peace Prize 1963","Soviet-US relations normalize 20 years earlier than in our timeline","Cuba's independent path becomes model for small nation sovereignty worldwide","Cold War de-escalates in 1963 — détente happens a decade early"],narrative:"October 25, 1962. Fidel Castro, watching the crisis spiral toward catastrophe, makes the most surprising phone call in history — directly to Kennedy, without Moscow's knowledge.\n\nCuba agrees to dismantle the missiles in exchange for a US non-invasion pledge and normalized relations. Khrushchev, furious but facing a fait accompli, accepts the settlement.\n\nCuba is suddenly the world's most consequential small nation — the country that prevented nuclear war through autonomous action. Castro receives the Nobel Peace Prize in 1963.",prompt:"Create a 5-minute alternate history documentary: 'Castro Calls Kennedy.' Havana 1962: Castro in military uniform picking up a direct phone to Washington. Kennedy's face shifting from shock to cautious hope. Secret negotiation: Cuba dismantles missiles independently, surprising both superpowers. Soviet ships turning back, confused. Both superpowers accepting what they didn't control. Castro receiving Nobel Peace Prize 1963. Cuba as permanently neutral nation. Diplomatic thriller style, warm Caribbean colors contrasting Cold War grey."},
      {num:4,title:"Kennedy Accepts Soviet Missiles",tagline:"What if Kennedy blinked first?",premium:true,ripples:["Soviet missiles remain permanently in Cuba — Caribbean geopolitics transformed","Kennedy politically destroyed — Republican landslide in 1964 election","Vietnam War never happens — US foreign policy fundamentally chastened","A more cautious multilateral America emerges from perceived Cuban humiliation","Different but possibly healthier global role for the United States"],narrative:"Kennedy, advised that nuclear war would kill 70 million Americans while the missiles in Cuba change little strategically, formally accepts the Soviet position. Missiles stay in Cuba.\n\nThe announcement destroys Kennedy politically. Republicans call it the greatest capitulation in American history. Goldwater wins 1964 in a landslide.\n\nBut: no Vietnam War. No American overreach for a decade. A more cautious, multilateral America emerges from the Cuban humiliation. A different, possibly healthier, global role for the world's greatest power.",prompt:"Create a 5-minute alternate history documentary: 'Kennedy Accepts.' UN General Assembly 1962: Kennedy announcing formal acceptance of Soviet missiles in Cuba. Half the chamber gasps in shock. American newspapers: 'Kennedy Surrenders.' Republican senators furious. Goldwater landslide 1964. But then: no Vietnam War, 58,000 American lives saved. A more cautious America. Soviet sphere extending to Caribbean permanently. Cuban beaches with Soviet military hardware and palm trees. Complex, nuanced, morally serious documentary."},
      {num:5,title:"The World Unites Against Nuclear War",tagline:"What if October 1962 united humanity?",premium:true,ripples:["Global disarmament treaty signed by 1964 with actual enforcement mechanisms","Nuclear weapons reduced to zero by 1975 — humanity steps back from the brink","UN Security Council reformed with real power — world governance works","Cold War continues but as pure ideological competition — no military threat","The 1970s become a decade of global cooperation rather than proxy warfare"],narrative:"The crisis resolves — barely, as in reality — but this time Kennedy and Khrushchev use the trauma to genuinely transform the world order.\n\nThe near-miss produces the Nuclear Weapons Elimination Treaty of 1963: every nuclear power agrees to disarm over 10 years, with real verification mechanisms. By 1975, no nuclear weapons exist anywhere on Earth.\n\nThe UN Security Council is simultaneously reformed with genuine enforcement power. The Cold War continues — as an ideological competition — but the military threat that nearly ended civilization is removed.",prompt:"Create a 5-minute alternate history documentary: 'The World That Said Never Again.' Kennedy and Khrushchev meeting face-to-face in 1963, shaking hands over a document. UN General Assembly ratifying nuclear disarmament treaty — all nations signing. Weapons being disassembled worldwide, their components repurposed for energy. The world of 1975 without nuclear weapons: still tense, still divided by ideology, but the existential threat removed. A more hopeful Cold War. Show what genuine global cooperation looks like when it's truly motivated by shared survival."},
    ]
  },
];

const CATS = {wars:"⚔️ Wars",india:"🇮🇳 India",science:"🔬 Science",ancient:"🏛️ Ancient"};
const ERAS = ["ALL","ANCIENT","MODERN","CONTEMPORARY"];

export default function App() {
  const [screen, setScreen] = useState("onboard");
  const [slide, setSlide] = useState(0);
  const [tab, setTab] = useState("home");
  const [event, setEvent] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [premium, setPremium] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [plan, setPlan] = useState("yearly");
  const [era, setEra] = useState("ALL");
  const [q, setQ] = useState("");
  const [expandN, setExpandN] = useState(false);
  const [expandR, setExpandR] = useState(false);
  const [expandP, setExpandP] = useState(false);
  const [watched, setWatched] = useState(new Set(["ww1_1","ww1_2","ww2_1"]));

  const markW = (id) => setWatched(p => new Set([...p,id]));
  const canAccess = (s) => !s.premium || premium;
  const watchedList = EVENTS.flatMap(e=>e.scenarios.filter(s=>watched.has(e.id+"_"+s.num)).map(s=>({...s,eventId:e.id,eventTitle:e.short,eventEmoji:e.emoji,eventColor:e.color,eventGrad:e.grad})));

  const s = { display:"flex", flexDirection:"column", background:C.bg, color:C.text, fontFamily:"Georgia,serif", height:640, width:"100%", maxWidth:390, margin:"0 auto", overflow:"hidden", position:"relative" };

  if (screen==="onboard") {
    const slides=[
      {title:"कaश",sub:"What If History Went Differently?",body:"Every turning point in history balanced on a razor's edge. One moment different — the entire world changes.",emoji:"⚡"},
      {title:"5 Timelines",sub:"Per Historical Event",body:"Watch 5 AI-generated alternate history documentaries per event. 5 minutes each. Professional narration. Cinematic quality.",emoji:"🎬"},
      {title:"100 Events",sub:"From Ancient to Modern",body:"From Alexander the Great to COVID-19. India's Partition to the Moon Landing. New events every week.",emoji:"🌍"},
    ];
    const sl=slides[slide];
    return (
      <div style={s}>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",background:`linear-gradient(180deg,${C.bg} 0%,#0D0800 100%)`}}>
          <div style={{fontSize:72,marginBottom:24}}>{sl.emoji}</div>
          <div style={{fontSize:36,fontWeight:900,letterSpacing:6,color:C.gold,marginBottom:8,textAlign:"center"}}>{sl.title}</div>
          <div style={{fontSize:13,color:C.textMuted,letterSpacing:2,marginBottom:24,textAlign:"center",fontFamily:"sans-serif",textTransform:"uppercase"}}>{sl.sub}</div>
          <div style={{fontSize:15,color:C.textSec,lineHeight:1.7,textAlign:"center",fontFamily:"sans-serif",maxWidth:320}}>{sl.body}</div>
          <div style={{display:"flex",gap:8,marginTop:40}}>
            {slides.map((_,i)=><div key={i} style={{width:i===slide?24:8,height:8,borderRadius:4,background:i===slide?C.gold:C.elevated,transition:"all 0.3s"}}/>)}
          </div>
        </div>
        <div style={{padding:"20px 24px 32px",display:"flex",gap:12}}>
          {slide>0&&<button onClick={()=>setSlide(p=>p-1)} style={{flex:1,padding:"13px 0",background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,color:C.textSec,cursor:"pointer",fontFamily:"sans-serif",fontSize:14}}>Back</button>}
          <button onClick={()=>{if(slide<2)setSlide(p=>p+1);else setScreen("home");}} style={{flex:2,padding:"13px 0",background:C.gold,border:"none",borderRadius:8,color:C.bg,cursor:"pointer",fontFamily:"sans-serif",fontSize:14,fontWeight:700,letterSpacing:1}}>
            {slide<2?"CONTINUE →":"START EXPLORING →"}
          </button>
        </div>
      </div>
    );
  }

  if (paywall) {
    const plans=[
      {id:"yearly",name:"Premium Yearly",price:"₹1,499",sub:"₹125/month · best value",badge:"SAVE 37%"},
      {id:"monthly",name:"Premium Monthly",price:"₹199",sub:"per month · flexible"},
      {id:"lifetime",name:"Lifetime Access",price:"₹4,999",sub:"one-time payment · own forever",badge:"BEST DEAL"},
    ];
    return (
      <div style={{...s,overflowY:"auto"}}>
        <div style={{background:`linear-gradient(180deg,rgba(212,168,67,0.15),transparent)`,padding:"52px 24px 24px",textAlign:"center",position:"relative"}}>
          <button onClick={()=>setPaywall(false)} style={{position:"absolute",top:52,left:16,background:"transparent",border:"none",color:C.textMuted,cursor:"pointer",fontSize:20}}>✕</button>
          <div style={{fontSize:40,marginBottom:8}}>✦</div>
          <div style={{fontSize:26,fontWeight:900,letterSpacing:4,color:C.gold}}>KAASH PREMIUM</div>
          <div style={{fontSize:13,color:C.textSec,fontFamily:"sans-serif",marginTop:8,lineHeight:1.6}}>Unlock every alternate timeline<br/>across all of history</div>
        </div>
        <div style={{padding:"0 20px 20px"}}>
          {["🎬 All 5 timelines per event — free users get 2","⚡ Ad-free cinematic experience","📥 Download for offline viewing","🔔 Early access to new events","🌍 5 new events added every week","🇮🇳 India-specific events — Partition, 1962 War, Kargil"].map((f,i)=>(
            <div key={i} style={{background:C.card,borderRadius:8,padding:"12px 14px",marginBottom:8,fontFamily:"sans-serif",fontSize:13,color:C.text,display:"flex",alignItems:"center",gap:10}}>{f}</div>
          ))}
          <div style={{marginTop:16}}>
            {plans.map(p=>(
              <div key={p.id} onClick={()=>setPlan(p.id)} style={{background:plan===p.id?C.goldBg:C.card,border:`${plan===p.id?2:1}px solid ${plan===p.id?C.gold:C.border}`,borderRadius:10,padding:14,marginBottom:10,cursor:"pointer",position:"relative"}}>
                {p.badge&&<div style={{fontSize:9,color:C.gold,letterSpacing:1,fontFamily:"sans-serif",fontWeight:700,marginBottom:4}}>{p.badge}</div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,fontFamily:"sans-serif"}}>{p.name}</div>
                    <div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",marginTop:2}}>{p.sub}</div>
                  </div>
                  <div style={{fontSize:20,fontWeight:900,color:plan===p.id?C.gold:C.text,fontFamily:"sans-serif"}}>{p.price}</div>
                </div>
                {plan===p.id&&<CheckCircle size={16} color={C.gold} style={{position:"absolute",top:10,right:10}}/>}
              </div>
            ))}
          </div>
          <button onClick={()=>{setPremium(true);setPaywall(false);}} style={{width:"100%",padding:"15px 0",background:C.gold,border:"none",borderRadius:8,color:C.bg,fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"sans-serif",letterSpacing:2,marginTop:8}}>UNLOCK PREMIUM</button>
          <div style={{textAlign:"center",fontSize:11,color:C.textMuted,fontFamily:"sans-serif",marginTop:12,lineHeight:1.5}}>Cancel anytime · Secure payment via Razorpay<br/>UPI · Cards · Net Banking · No hidden fees</div>
          <div style={{height:40}}/>
        </div>
      </div>
    );
  }

  if (screen==="player"&&scenario&&event) {
    const sId=event.id+"_"+scenario.num;
    return (
      <div style={{...s,overflowY:"auto"}}>
        <div style={{width:"100%",aspectRatio:"16/9",background:event.grad,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",minHeight:200}}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:60,marginBottom:12}}>{event.emoji}</div>
            <div style={{background:C.goldBg,border:`1px solid ${C.goldDark}`,borderRadius:8,padding:"8px 16px",textAlign:"center"}}>
              <div style={{fontSize:10,color:C.gold,letterSpacing:2,fontFamily:"sans-serif",fontWeight:700}}>AI VIDEO · INVIDEO AI · PLUS PLAN</div>
              <div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",marginTop:2}}>Generate using the prompt in the "AI Prompt" tab below</div>
            </div>
          </div>
          <button onClick={()=>{setScreen("detail");setExpandN(false);setExpandR(false);setExpandP(false);}} style={{position:"absolute",top:44,left:12,background:"rgba(8,8,8,0.8)",border:"none",borderRadius:"50%",width:36,height:36,color:"#fff",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <ArrowLeft size={18} color={C.text}/>
          </button>
          <div style={{position:"absolute",bottom:10,left:16,fontSize:10,color:C.gold,fontFamily:"sans-serif",fontWeight:700,letterSpacing:1}}>TIMELINE {scenario.num} / 5</div>
          <div style={{position:"absolute",top:10,right:12,background:"rgba(230,126,34,0.9)",borderRadius:4,padding:"3px 8px"}}>
            <span style={{fontSize:9,color:"#fff",fontFamily:"sans-serif",fontWeight:700,letterSpacing:1}}>VIDEO PENDING GENERATION</span>
          </div>
        </div>

        <div style={{padding:"16px 20px 0"}}>
          <div style={{fontSize:10,color:C.gold,letterSpacing:1,fontFamily:"sans-serif",fontWeight:700,marginBottom:4}}>{event.short}</div>
          <div style={{fontSize:20,fontWeight:900,lineHeight:1.2,marginBottom:4}}>{scenario.title}</div>
          <div style={{fontSize:13,color:C.textSec,fontStyle:"italic",fontFamily:"sans-serif",marginBottom:16}}>"{scenario.tagline}"</div>

          {!watched.has(sId)&&<button onClick={()=>markW(sId)} style={{width:"100%",padding:"11px 0",background:C.gold,border:"none",borderRadius:8,color:C.bg,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif",letterSpacing:1,marginBottom:16}}>▶ MARK AS WATCHED</button>}

          <div style={{height:1,background:C.border,marginBottom:16}}/>

          {[
            {label:"THE ALTERNATE HISTORY",key:"n",expanded:expandN,toggle:()=>setExpandN(p=>!p),content:<div style={{color:C.textSec,fontSize:13,lineHeight:1.8,fontFamily:"sans-serif"}}>{scenario.narrative.split("\n\n").map((p,i)=><p key={i} style={{marginBottom:12}}>{p}</p>)}</div>},
            {label:"RIPPLE EFFECTS",key:"r",expanded:expandR,toggle:()=>setExpandR(p=>!p),content:<div style={{display:"flex",flexDirection:"column",gap:8}}>{scenario.ripples.map((r,i)=><div key={i} style={{background:C.surface,borderRadius:8,padding:"10px 12px",display:"flex",gap:10}}><div style={{minWidth:22,height:22,background:"rgba(192,57,43,0.2)",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:C.red,fontFamily:"sans-serif"}}>{i+1}</div><span style={{fontSize:12,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.5}}>{r}</span></div>)}</div>},
            {label:"AI VIDEO PROMPT (FOR INVIDEO)",key:"p",expanded:expandP,toggle:()=>setExpandP(p=>!p),content:<div style={{background:C.surface,borderRadius:8,padding:12,fontSize:11,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{scenario.prompt}<br/><br/><span style={{color:C.gold,fontWeight:700}}>→ Paste this into InVideo AI → Select 'Historical Documentary' → 5 minutes → Generate</span></div>},
          ].map(item=>(
            <div key={item.key} style={{marginBottom:16}}>
              <div onClick={item.toggle} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",marginBottom:item.expanded?12:0}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:3,height:18,background:item.key==="r"?C.red:C.gold,borderRadius:2}}/>
                  <span style={{fontSize:11,letterSpacing:2,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>{item.label}</span>
                </div>
                {item.expanded?<ChevronUp size={18} color={C.gold}/>:<ChevronDown size={18} color={C.gold}/>}
              </div>
              {item.expanded&&item.content}
            </div>
          ))}

          <div style={{display:"flex",gap:12,marginBottom:40}}>
            <button style={{flex:1,padding:"11px 0",border:`1px solid ${C.goldDark}`,borderRadius:8,background:"transparent",color:C.gold,cursor:"pointer",fontFamily:"sans-serif",fontSize:12,fontWeight:700,letterSpacing:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Share2 size={14}/>SHARE</button>
            <button style={{flex:1,padding:"11px 0",border:`1px solid ${C.border}`,borderRadius:8,background:"transparent",color:C.textSec,cursor:"pointer",fontFamily:"sans-serif",fontSize:12,fontWeight:700,letterSpacing:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Bookmark size={14}/>SAVE</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen==="detail"&&event) {
    return (
      <div style={{...s,overflowY:"auto"}}>
        <div style={{background:event.grad,minHeight:220,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative"}}>
          <div style={{fontSize:72}}>{event.emoji}</div>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, rgba(0,0,0,0.4), transparent, rgba(7,7,7,1))"}}/>
          <button onClick={()=>setScreen("home")} style={{position:"absolute",top:44,left:12,background:"rgba(8,8,8,0.8)",border:"none",borderRadius:"50%",width:36,height:36,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <ArrowLeft size={18} color={C.text}/>
          </button>
          <div style={{position:"absolute",bottom:16,right:14,background:`${C.red}ee`,borderRadius:4,padding:"4px 10px"}}>
            <span style={{fontSize:9,fontWeight:700,color:"#fff",letterSpacing:1,fontFamily:"sans-serif"}}>WORLD-CHANGING</span>
          </div>
        </div>

        <div style={{padding:"0 22px 0"}}>
          <div style={{fontSize:9,letterSpacing:2,color:event.color,fontFamily:"sans-serif",marginBottom:6,background:`${event.color}22`,display:"inline-block",padding:"3px 8px",borderRadius:3}}>{event.era} ERA</div>
          <div style={{fontSize:22,fontWeight:900,lineHeight:1.2,marginBottom:8}}>{event.title}</div>
          <div style={{display:"flex",gap:16,marginBottom:12}}>
            <span style={{fontSize:12,color:C.gold,fontFamily:"sans-serif"}}>📅 {event.year}</span>
            <span style={{fontSize:12,color:C.textSec,fontFamily:"sans-serif"}}>📍 {event.region}</span>
          </div>
          <div style={{fontSize:13,color:C.textSec,lineHeight:1.7,fontFamily:"sans-serif",marginBottom:14}}>{event.desc}</div>
          <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
            {event.tags.map(t=><span key={t} style={{fontSize:11,color:C.goldLight,background:C.goldBg,borderRadius:3,padding:"3px 8px",fontFamily:"sans-serif"}}>#{t}</span>)}
          </div>
          <div style={{height:1,background:C.border,marginBottom:18}}/>

          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:3,height:20,background:C.gold,borderRadius:2}}/>
            <div>
              <div style={{fontSize:11,letterSpacing:2,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>5 ALTERNATE TIMELINES</div>
              <div style={{fontSize:11,color:C.textMuted,fontFamily:"sans-serif"}}>2 free · 3 premium · 5 minutes each</div>
            </div>
          </div>

          {event.scenarios.map((sc,i)=>{
            const sId=event.id+"_"+sc.num;
            const access=canAccess(sc);
            const isWatched=watched.has(sId);
            return (
              <div key={i} onClick={()=>{if(access){setScenario(sc);setScreen("player");setExpandN(false);setExpandR(false);setExpandP(false);}else setPaywall(true);}} style={{background:C.card,borderRadius:12,marginBottom:10,display:"flex",cursor:"pointer",overflow:"hidden"}}>
                <div style={{width:90,minHeight:80,background:event.grad,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {!access&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center"}}><Lock size={20} color={C.gold}/></div>}
                  <span style={{position:"relative",fontSize:28}}>{event.emoji}</span>
                  <div style={{position:"absolute",top:7,left:7,width:22,height:22,background:sc.premium?C.gold:C.elevated,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:11,fontWeight:900,color:sc.premium?C.bg:C.textSec,fontFamily:"sans-serif"}}>{i+1}</span>
                  </div>
                  {isWatched&&<div style={{position:"absolute",bottom:6,right:6}}><CheckCircle size={14} color={C.green}/></div>}
                </div>
                <div style={{padding:"11px 12px",flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:9,fontWeight:700,letterSpacing:1,color:sc.premium?C.gold:C.green,background:sc.premium?C.goldBg:`${C.green}18`,borderRadius:3,padding:"2px 6px",fontFamily:"sans-serif"}}>{sc.premium?"PREMIUM":"FREE"}</span>
                    <Play size={16} color={access?C.gold:C.textMuted}/>
                  </div>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:2,lineHeight:1.2}}>{sc.title}</div>
                  <div style={{fontSize:11,color:C.textSec,fontStyle:"italic",fontFamily:"sans-serif",marginBottom:6,lineHeight:1.4}}>{sc.tagline}</div>
                  <div style={{fontSize:10,color:C.textMuted,fontFamily:"sans-serif"}}><Clock size={10} style={{display:"inline",verticalAlign:"middle"}}/> 5:00 · InVideo AI · {sc.ripples.length} ripple effects</div>
                </div>
              </div>
            );
          })}

          {!premium&&<div onClick={()=>setPaywall(true)} style={{background:"linear-gradient(135deg,rgba(139,106,20,0.25),rgba(212,168,67,0.08))",border:`1px solid ${C.goldDark}80`,borderRadius:12,padding:18,marginBottom:12,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:14,fontWeight:900,color:C.gold}}>🔓 UNLOCK ALL 5 TIMELINES</div>
              <div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",marginTop:4}}>₹199/month · Cancel anytime · All 100 events</div>
            </div>
            <ChevronRight size={20} color={C.gold}/>
          </div>}
          <div style={{height:32}}/>
        </div>
      </div>
    );
  }

  const filtered = EVENTS.filter(e=>{
    const matchE=era==="ALL"||e.era===era;
    const matchQ=!q||e.title.toLowerCase().includes(q.toLowerCase())||e.tags.some(t=>t.toLowerCase().includes(q.toLowerCase()));
    return matchE&&matchQ;
  });

  const Row = ({title,events:evts})=>(
    <div style={{marginBottom:28}}>
      <div style={{padding:"0 20px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:3,height:16,background:C.gold,borderRadius:2}}/>
        <span style={{fontSize:11,letterSpacing:2,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>{title}</span>
      </div>
      <div style={{display:"flex",gap:12,paddingLeft:20,paddingRight:20,overflowX:"auto",paddingBottom:8,scrollbarWidth:"none"}}>
        {evts.map(e=>(
          <div key={e.id} onClick={()=>{setEvent(e);setScreen("detail");}} style={{flexShrink:0,width:130,cursor:"pointer"}}>
            <div style={{width:130,height:170,background:e.grad,borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",marginBottom:8}}>
              <span style={{fontSize:44,zIndex:1}}>{e.emoji}</span>
              <div style={{position:"absolute",bottom:8,left:8,background:"rgba(8,8,8,0.85)",borderRadius:3,padding:"2px 6px"}}><span style={{fontSize:10,fontWeight:700,color:C.gold,fontFamily:"sans-serif"}}>{e.year}</span></div>
              <div style={{position:"absolute",top:8,right:8,background:`${C.gold}22`,border:`1px solid ${C.goldDark}`,borderRadius:3,padding:"2px 5px"}}><span style={{fontSize:9,color:C.gold,fontFamily:"sans-serif"}}>5 ⑂</span></div>
            </div>
            <div style={{fontSize:12,fontWeight:700,lineHeight:1.3,color:C.text}}>{e.short}</div>
            <div style={{fontSize:10,color:C.textMuted,fontFamily:"sans-serif",marginTop:2}}>{e.region}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const HomeTab=()=>{
    const featured=EVENTS[Math.floor(Date.now()/86400000)%EVENTS.length];
    return (
      <div style={{flex:1,overflowY:"auto",paddingBottom:20}}>
        <div style={{background:featured.grad,minHeight:220,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"0 22px 22px",position:"relative"}}>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(7,7,7,0.5),transparent,rgba(7,7,7,0.85))"}}/>
          <div style={{position:"relative"}}>
            <div style={{fontSize:9,letterSpacing:3,color:C.gold,fontFamily:"sans-serif",fontWeight:700,marginBottom:4}}>★ TIMELINE OF THE WEEK</div>
            <div style={{fontSize:22,fontWeight:900,lineHeight:1.2,marginBottom:4}}>{featured.title}</div>
            <div style={{fontSize:12,color:C.textSec,fontFamily:"sans-serif",marginBottom:14}}>{featured.year} · {featured.region}</div>
            <button onClick={()=>{setEvent(featured);setScreen("detail");}} style={{padding:"10px 18px",background:C.gold,border:"none",borderRadius:6,color:C.bg,fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"sans-serif",letterSpacing:1}}>EXPLORE 5 TIMELINES →</button>
          </div>
        </div>

        <div style={{background:C.surface,display:"flex",justifyContent:"space-around",padding:"12px 16px",marginBottom:20}}>
          {[["100","EVENTS"],["500","TIMELINES"],["5","ERAS"],["5:00","PER VIDEO"]].map(([v,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:900,color:C.gold,fontFamily:"sans-serif"}}>{v}</div>
              <div style={{fontSize:9,letterSpacing:2,color:C.textMuted,fontFamily:"sans-serif"}}>{l}</div>
            </div>
          ))}
        </div>

        {watchedList.length>0&&<Row title="CONTINUE EXPLORING" events={EVENTS.filter(e=>watchedList.some(w=>w.eventId===e.id))}/>}
        <Row title="INDIA'S ALTERNATE HISTORY" events={EVENTS.filter(e=>e.cat==="india"||e.region==="South Asia")}/>
        <Row title="WORLD WARS & CONFLICTS" events={EVENTS.filter(e=>e.cat==="wars")}/>
        <Row title="SCIENTIFIC TURNING POINTS" events={EVENTS.filter(e=>e.cat==="science"||e.id==="moon")}/>
        <Row title="ANCIENT WORLD" events={EVENTS.filter(e=>e.cat==="ancient")}/>
        <Row title="ALL EVENTS" events={EVENTS}/>
      </div>
    );
  };

  const ExploreTab=()=>(
    <div style={{flex:1,overflowY:"auto",padding:"16px 0 20px"}}>
      <div style={{padding:"0 20px 16px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:3,height:20,background:C.gold}}/>
        <div>
          <div style={{fontSize:13,letterSpacing:2,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>BROWSE BY ERA</div>
          <div style={{fontSize:11,color:C.textMuted,fontFamily:"sans-serif"}}>Filter history by time period</div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,padding:"0 20px",overflowX:"auto",marginBottom:20,scrollbarWidth:"none"}}>
        {ERAS.map(e=>(
          <button key={e} onClick={()=>setEra(e)} style={{padding:"7px 14px",borderRadius:4,border:`1px solid ${era===e?C.gold:C.border}`,background:era===e?C.goldBg:"transparent",color:era===e?C.gold:C.textMuted,fontSize:10,letterSpacing:1,cursor:"pointer",fontFamily:"sans-serif",fontWeight:era===e?700:400,whiteSpace:"nowrap",flexShrink:0}}>
            {e}
          </button>
        ))}
      </div>
      <div style={{padding:"0 16px"}}>
        {filtered.map(e=>(
          <div key={e.id} onClick={()=>{setEvent(e);setScreen("detail");}} style={{background:C.card,borderRadius:12,marginBottom:10,display:"flex",cursor:"pointer",overflow:"hidden"}}>
            <div style={{width:100,minHeight:90,background:e.grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,position:"relative"}}>
              <span style={{fontSize:32}}>{e.emoji}</span>
              <div style={{position:"absolute",bottom:7,left:7,background:"rgba(8,8,8,0.85)",borderRadius:3,padding:"2px 5px"}}><span style={{fontSize:10,fontWeight:700,color:C.gold,fontFamily:"sans-serif"}}>{e.year}</span></div>
            </div>
            <div style={{padding:"12px 12px",flex:1}}>
              <div style={{fontSize:9,color:e.color,background:`${e.color}22`,borderRadius:3,padding:"2px 6px",display:"inline-block",marginBottom:6,fontFamily:"sans-serif",fontWeight:700,letterSpacing:1}}>{e.era}</div>
              <div style={{fontSize:13,fontWeight:700,lineHeight:1.3,marginBottom:4}}>{e.title}</div>
              <div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",marginBottom:6,lineHeight:1.4}}>{e.desc.substring(0,60)}...</div>
              <div style={{fontSize:10,color:C.gold,fontFamily:"sans-serif"}}>⑂ 5 alternate timelines · {e.region}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SearchTab=()=>(
    <div style={{flex:1,overflowY:"auto",padding:"16px 16px 20px"}}>
      <div style={{position:"relative",marginBottom:16}}>
        <Search size={16} color={C.gold} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search events, eras, regions..."
          style={{width:"100%",background:C.surface,border:`1px solid ${q?C.gold:C.border}`,borderRadius:8,padding:"11px 12px 11px 38px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"sans-serif"}}/>
      </div>
      {!q&&<div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
        {["WW1","WW2","India","Moon","Alexander","Cuba","Partition","Nuclear"].map(tag=>(
          <button key={tag} onClick={()=>setQ(tag)} style={{padding:"7px 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:20,color:C.textSec,fontSize:12,cursor:"pointer",fontFamily:"sans-serif"}}>#{tag}</button>
        ))}
      </div>}
      {filtered.map(e=>(
        <div key={e.id} onClick={()=>{setEvent(e);setScreen("detail");}} style={{background:C.card,borderRadius:10,marginBottom:8,padding:"12px 14px",cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:28,flexShrink:0}}>{e.emoji}</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,lineHeight:1.3}}>{e.title}</div>
            <div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",marginTop:2}}>{e.year} · {e.region} · 5 timelines</div>
          </div>
          <ChevronRight size={16} color={C.textMuted} style={{marginLeft:"auto",flexShrink:0}}/>
        </div>
      ))}
      {filtered.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.textMuted,fontFamily:"sans-serif",fontSize:13}}>No events found for "{q}"</div>}
    </div>
  );

  const ProfileTab=()=>{
    const pct=Math.round(USER.watched/USER.total*100);
    return (
      <div style={{flex:1,overflowY:"auto",padding:"0 0 20px"}}>
        <div style={{background:"linear-gradient(135deg,rgba(212,168,67,0.12),transparent)",padding:"40px 24px 24px",textAlign:"center"}}>
          <div style={{width:70,height:70,borderRadius:"50%",background:`linear-gradient(135deg,${C.gold},${C.goldDark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 12px"}}>🎓</div>
          <div style={{fontSize:20,fontWeight:900}}>{USER.name}</div>
          <div style={{fontSize:11,color:C.gold,letterSpacing:2,fontFamily:"sans-serif",marginTop:4}}>{USER.level}</div>
          {!premium&&<button onClick={()=>setPaywall(true)} style={{marginTop:12,padding:"8px 20px",background:C.gold,border:"none",borderRadius:6,color:C.bg,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif"}}>UPGRADE TO PREMIUM</button>}
          {premium&&<div style={{marginTop:10,padding:"6px 16px",background:C.goldBg,border:`1px solid ${C.goldDark}`,borderRadius:20,display:"inline-block",fontSize:11,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>✦ PREMIUM MEMBER</div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 16px 20px"}}>
          {[[<Flame size={20} color={C.red}/>,USER.streak,"DAY STREAK"],[<Zap size={20} color={C.gold}/>,USER.xp,"XP EARNED"],[<Star size={20} color={C.gold}/>,USER.watched,"WATCHED"],[<Globe size={20} color={C.blue}/>,USER.badges.length,"BADGES"]].map(([icon,val,label],i)=>(
            <div key={i} style={{background:C.card,borderRadius:10,padding:"14px",textAlign:"center"}}>
              <div style={{marginBottom:6}}>{icon}</div>
              <div style={{fontSize:22,fontWeight:900,color:C.text,fontFamily:"sans-serif"}}>{val}</div>
              <div style={{fontSize:9,letterSpacing:1.5,color:C.textMuted,fontFamily:"sans-serif"}}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{padding:"0 16px 16px"}}>
          <div style={{fontSize:11,letterSpacing:2,color:C.gold,fontFamily:"sans-serif",fontWeight:700,marginBottom:12}}>TIMELINES EXPLORED</div>
          <div style={{background:C.card,borderRadius:10,padding:"14px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:13,fontFamily:"sans-serif"}}>{USER.watched} of {USER.total} timelines</span>
              <span style={{fontSize:13,color:C.gold,fontFamily:"sans-serif",fontWeight:700}}>{pct}%</span>
            </div>
            <div style={{height:6,background:C.elevated,borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${C.gold},${C.goldLight})`,borderRadius:3}}/>
            </div>
          </div>
        </div>
        <div style={{padding:"0 16px"}}>
          <div style={{fontSize:11,letterSpacing:2,color:C.gold,fontFamily:"sans-serif",fontWeight:700,marginBottom:12}}>BADGES EARNED</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {USER.badges.map((b,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.goldDark}`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
                <Award size={14} color={C.gold}/>
                <span style={{fontSize:12,color:C.text,fontFamily:"sans-serif"}}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const tabs=[{id:"home",icon:<Home size={20}/>,label:"Home"},{id:"explore",icon:<Compass size={20}/>,label:"Explore"},{id:"search",icon:<Search size={20}/>,label:"Search"},{id:"profile",icon:<User size={20}/>,label:"Profile"}];

  return (
    <div style={s}>
      <div style={{background:C.surface,padding:"44px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div>
          <span style={{fontSize:22,fontWeight:900,letterSpacing:4,color:C.gold}}>KAASH</span>
          <span style={{fontSize:9,color:C.textMuted,letterSpacing:2,fontFamily:"sans-serif",marginLeft:8}}>कaश</span>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:4,background:C.card,borderRadius:20,padding:"5px 10px"}}>
            <Flame size={14} color={C.red}/><span style={{fontSize:12,fontWeight:700,color:C.text,fontFamily:"sans-serif"}}>{USER.streak}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,background:C.goldBg,border:`1px solid ${C.goldDark}`,borderRadius:20,padding:"5px 10px"}}>
            <Zap size={14} color={C.gold}/><span style={{fontSize:12,fontWeight:700,color:C.gold,fontFamily:"sans-serif"}}>{USER.xp} XP</span>
          </div>
        </div>
      </div>

      {tab==="home"&&<HomeTab/>}
      {tab==="explore"&&<ExploreTab/>}
      {tab==="search"&&<SearchTab/>}
      {tab==="profile"&&<ProfileTab/>}

      <div style={{background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-around",padding:"10px 0 14px",flexShrink:0}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",border:"none",cursor:"pointer",padding:"4px 16px",color:tab===t.id?C.gold:C.textMuted,transition:"color 0.2s"}}>
            {t.icon}
            <span style={{fontSize:10,fontFamily:"sans-serif",fontWeight:tab===t.id?700:400,letterSpacing:0.5}}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
