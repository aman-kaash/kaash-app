import { useState, useEffect } from "react";
// ─── FIREBASE CONFIG (same as main app) ─────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBv0ZkzCXD1laS_ijbtMW4VN0Yp3MeW-LU",
  authDomain: "kaash-app.firebaseapp.com",
  projectId: "kaash-app",
  storageBucket: "kaash-app.firebasestorage.app",
  messagingSenderId: "404911023324",
  appId: "1:404911023324:web:83304f9f85bb260e180019"
};
// Firebase is loaded DYNAMICALLY to avoid a Firebase v10 + Vite production
// bug ("Cannot access 'X' before initialization") caused by circular
// module references when Firebase is bundled synchronously with app code.
let fb = null;
let fbLoadingPromise = null;
function loadFirebase() {
  if (fbLoadingPromise) return fbLoadingPromise;
  fbLoadingPromise = Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
    import("firebase/firestore"),
    import("firebase/storage"),
  ]).then(([appMod, authMod, fsMod, stMod]) => {
    const fbApp = appMod.getApps().length ? appMod.getApps()[0] : appMod.initializeApp(firebaseConfig);
    fb = {
      auth: authMod.getAuth(fbApp),
      db: fsMod.getFirestore(fbApp),
      storage: stMod.getStorage(fbApp),
      googleProvider: new authMod.GoogleAuthProvider(),
      doc: fsMod.doc, setDoc: fsMod.setDoc, getDoc: fsMod.getDoc,
      collection: fsMod.collection, getDocs: fsMod.getDocs,
      storageRef: stMod.ref, uploadBytesResumable: stMod.uploadBytesResumable,
      getDownloadURL: stMod.getDownloadURL, deleteObject: stMod.deleteObject,
      signInWithRedirect: authMod.signInWithRedirect,
      getRedirectResult: authMod.getRedirectResult,
      signOut: authMod.signOut,
      onAuthStateChanged: authMod.onAuthStateChanged,
    };
    return fb;
  });
  return fbLoadingPromise;
}

// Hook: returns the loaded firebase instance, or null until ready.
// Components should render a loading state while this is null.
function useFirebase() {
  const [instance, setInstance] = useState(fb);
  useEffect(() => {
    if (fb) { setInstance(fb); return; }
    let cancelled = false;
    loadFirebase().then((loaded) => { if (!cancelled) setInstance(loaded); });
    return () => { cancelled = true; };
  }, []);
  return instance;
}

// ─── ADMIN EMAIL — CHANGE THIS TO YOUR GMAIL ────────────────────────
// Replace the line below with your actual Gmail address
const ADMIN_EMAIL = "aman.ruling@gmail.com";

// ─── COLOURS ────────────────────────────────────────────────────────
const C = {
  bg:"#0A0A0A", surface:"#111", card:"#181818", border:"#252525",
  gold:"#E8B84B", goldBg:"rgba(232,184,75,0.1)",
  green:"#4CAF50", greenBg:"rgba(76,175,80,0.1)",
  red:"#E53935", redBg:"rgba(229,57,53,0.1)",
  blue:"#2196F3", blueBg:"rgba(33,150,243,0.1)",
  text:"#F0EBE0", textSec:"#888", textMuted:"#555",
};

// Hardcoded events list (matches main app)
const EVENT_LIST = [
  {id:"ww1",title:"Assassination of Archduke Franz Ferdinand",emoji:"🔫"},
  {id:"ww2",title:"World War II Begins",emoji:"💣"},
  {id:"partition",title:"Partition of British India",emoji:"🇮🇳"},
  {id:"moon",title:"Apollo 11 Moon Landing",emoji:"🌙"},
  {id:"alexander",title:"Alexander the Great Survives",emoji:"⚔️"},
  {id:"cuban",title:"Cuban Missile Crisis",emoji:"☢️"},
];

// ─── ADMIN PANEL ─────────────────────────────────────────────────────
export default function Admin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");

  const firebase = useFirebase();

  useEffect(() => {
    if (!firebase) return;
    let unsub = () => {};
    firebase.getRedirectResult(firebase.auth).then(result => {
      if (result?.user) {
        if (result.user.email === ADMIN_EMAIL) {
          setUser(result.user);
          setIsAdmin(true);
        } else {
          firebase.signOut(firebase.auth);
          alert("Access denied. This panel is for KAASH admin only.");
        }
      }
    }).catch(console.error);

    unsub = firebase.onAuthStateChanged(firebase.auth, u => {
      if (u && u.email === ADMIN_EMAIL) {
        setUser(u); setIsAdmin(true);
      } else {
        setUser(null); setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [firebase]);

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg,color:C.gold,fontSize:18,fontWeight:700,letterSpacing:3}}>
      KAASH ADMIN
    </div>
  );

  if (!isAdmin) return <AdminLogin />;

  const tabs = [
    {id:"dashboard",label:"📊 Dashboard"},
    {id:"upload",label:"🎬 Upload Video"},
    {id:"content",label:"📁 Content"},
    {id:"users",label:"👥 Users"},
    {id:"export",label:"📤 Export"},
    {id:"new_event",label:"✚ New Event"},
    {id:"suggestions",label:"💡 Suggestions"},
    {id:"payments",label:"💰 Payments"},
    {id:"edit_scenario",label:"✏️ Edit Scenario"},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text}}>
      {/* Top Bar */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:18,fontWeight:900,letterSpacing:4,color:C.gold}}>KAASH</span>
          <span style={{fontSize:11,color:C.textSec,background:C.card,padding:"3px 10px",borderRadius:12,letterSpacing:1}}>ADMIN</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:12,color:C.textSec}}>{user?.email}</span>
          <button onClick={()=>firebase.signOut(firebase.auth)} style={{padding:"6px 14px",background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,color:C.textSec,cursor:"pointer",fontSize:12}}>Sign Out</button>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",display:"flex",gap:4,overflowX:"auto"}}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"12px 16px",background:"transparent",border:"none",borderBottom:`2px solid ${tab===t.id?C.gold:"transparent"}`,color:tab===t.id?C.gold:C.textSec,cursor:"pointer",fontSize:13,fontWeight:tab===t.id?700:400,whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{padding:"24px",maxWidth:1100,margin:"0 auto"}}>
        {tab==="dashboard" && <Dashboard />}
        {tab==="upload" && <UploadVideo />}
        {tab==="content" && <ContentManager />}
        {tab==="users" && <UsersList />}
        {tab==="export" && <ExportData />}
        {tab==="new_event" && <CreateEvent />}
        {tab==="edit_scenario" && <EditScenario />}
        {tab==="suggestions" && <Suggestions />}
        {tab==="payments" && <PaymentsTab />}
      </div>
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────
function AdminLogin() {
  const firebase = useFirebase();
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg,padding:24}}>
      <div style={{fontSize:32,fontWeight:900,letterSpacing:6,color:C.gold,marginBottom:6}}>KAASH</div>
      <div style={{fontSize:12,color:C.textSec,letterSpacing:3,marginBottom:48}}>ADMIN PANEL</div>
      <div style={{background:C.surface,borderRadius:12,padding:32,width:"100%",maxWidth:380,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Admin Access Only</div>
        <div style={{fontSize:13,color:C.textSec,lineHeight:1.6,marginBottom:24}}>This panel is restricted to the KAASH admin account. Sign in with the registered admin Gmail.</div>
        <button onClick={async ()=>{ const f = firebase || await loadFirebase(); f.signInWithRedirect(f.auth, f.googleProvider); }}
          style={{width:"100%",padding:"13px 0",background:"#fff",border:"none",borderRadius:8,color:"#222",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
          <span style={{fontSize:18,fontWeight:900,color:"#4285F4"}}>G</span> Sign in with Google
        </button>
        <div style={{marginTop:16,fontSize:11,color:C.textMuted,textAlign:"center"}}>Only {ADMIN_EMAIL} can access this panel</div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────
function Dashboard() {
  const firebase = useFirebase();
  const [stats, setStats] = useState({users:0,premium:0,events:0,videos:0,recentUsers:[]});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebase) return;
    const load = async () => {
      try {
        const [usersSnap, paymentsSnap] = await Promise.all([
          firebase.getDocs(firebase.collection(firebase.db,"users")),
          firebase.getDocs(firebase.collection(firebase.db,"payments")).catch(()=>({forEach:()=>{},size:0})),
        ]);
        let premium = 0, recentUsers = [];
        usersSnap.forEach(d => {
          const data = d.data();
          if (data.isPremium) premium++;
          recentUsers.push({email:data.email||"—",name:data.name||"—",joined:data.signedUpAt||data.lastSeen||"—",premium:data.isPremium||false});
        });
        recentUsers.sort((a,b) => b.joined.localeCompare(a.joined));

        let totalRevenue = 0, monthlyRevenue = 0, fyRevenue = 0;
        const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString();
        const now = new Date();
        // Indian financial year: April 1 to March 31
        const fyStart = new Date(now.getMonth()>=3 ? now.getFullYear() : now.getFullYear()-1, 3, 1).toISOString();
        paymentsSnap.forEach && paymentsSnap.forEach(d => {
          const data = d.data();
          const amt = data.amount||data.baseAmount||0;
          totalRevenue += amt;
          if(data.paidAt > thirtyDaysAgo) monthlyRevenue += amt;
          if(data.paidAt >= fyStart) fyRevenue += amt;
        });

        setStats({users:usersSnap.size, premium, events:EVENT_LIST.length, videos:0,
          totalRevenue, monthlyRevenue, fyRevenue, recentUsers:recentUsers.slice(0,10)});
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [firebase]);

  const StatCard = ({label,value,sub,color}) => (
    <div style={{background:C.card,borderRadius:12,padding:"20px 24px",border:`1px solid ${C.border}`,flex:1,minWidth:160}}>
      <div style={{fontSize:32,fontWeight:900,color:color||C.gold,fontFamily:"monospace"}}>{loading?"—":value}</div>
      <div style={{fontSize:13,fontWeight:600,marginTop:4}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:C.textSec,marginTop:2}}>{sub}</div>}
    </div>
  );

  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:20}}>Dashboard</h2>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:20}}>
        <StatCard label="Total Users" value={stats.users} sub="All time signups" color={C.blue}/>
        <StatCard label="Premium Subscribers" value={stats.premium} sub="Active paying users" color={C.gold}/>
        <StatCard label="This FY Revenue" value={`₹${(stats.fyRevenue||0).toLocaleString("en-IN")}`} sub="Current financial year" color={C.green}/>
        <StatCard label="Last 30 Days" value={`₹${(stats.monthlyRevenue||0).toLocaleString("en-IN")}`} sub="Rolling 30-day revenue" color={C.gold}/>
      </div>

      {/* TAX THRESHOLD ALERTS */}
      {!loading && (() => {
        const fy = stats.fyRevenue || 0;
        const gstLimit = 2000000; // ₹20 lakh
        const pct = Math.min(100, Math.round((fy/gstLimit)*100));
        const isWarning = fy >= 1500000; // ₹15 lakh
        const isDanger  = fy >= 1800000; // ₹18 lakh
        const isCrossed = fy >= 2000000; // ₹20 lakh
        const color = isCrossed?"#E53935":isDanger?"#FF6F00":isWarning?"#F9A825":"#4CAF50";
        const bgCol = isCrossed?"rgba(229,57,53,0.1)":isDanger?"rgba(255,111,0,0.1)":isWarning?"rgba(249,168,37,0.1)":"rgba(76,175,80,0.08)";
        // Also compute income tax estimate: 6% of FY revenue × 30%
        const taxableIncome = Math.round(fy * 0.06);
        const estimatedTax = Math.round(taxableIncome * 0.30);
        const advanceTaxDue = new Date().getMonth() >= 11 || (new Date().getMonth() === 2 && new Date().getDate() <= 15);
        return (
          <div style={{marginBottom:20}}>
            {/* GST Alert */}
            <div style={{background:bgCol,border:`1px solid ${color}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:700,color}}>
                  {isCrossed?"🔴 GST REGISTRATION REQUIRED":isDanger?"🟠 GST THRESHOLD APPROACHING":isWarning?"🟡 WATCH YOUR REVENUE":"🟢 GST NOT REQUIRED"}
                </div>
                <div style={{fontSize:12,fontWeight:700,color,fontFamily:"monospace"}}>₹{fy.toLocaleString("en-IN")} / ₹20,00,000</div>
              </div>
              <div style={{height:6,background:"rgba(255,255,255,0.1)",borderRadius:3,marginBottom:8,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3,transition:"width 0.5s"}}/>
              </div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",fontFamily:"sans-serif",lineHeight:1.6}}>
                {isCrossed
                  ?"⚠️ Revenue has crossed ₹20 lakh. GST registration is now mandatory. Consult your CA immediately and register at gst.gov.in. You must start charging 18% GST on subscriptions."
                  :isDanger
                  ?"Revenue is ₹"+(gstLimit-fy).toLocaleString("en-IN")+" away from the ₹20 lakh GST threshold. Start preparing: get your PAN ready, choose a CA, and begin the registration process. It takes 7-14 days."
                  :isWarning
                  ?"Revenue is tracking above ₹15 lakh this financial year. Monitor closely. GST registration triggers at ₹20 lakh — still "+(gstLimit-fy).toLocaleString("en-IN")+" away."
                  :"No GST required. Threshold is ₹20 lakh per financial year. You are "+(gstLimit-fy).toLocaleString("en-IN")+" below it. Prices shown to users are final — no tax added."}
              </div>
            </div>
            {/* Income Tax Alert */}
            <div style={{background:"rgba(33,150,243,0.08)",border:"1px solid rgba(33,150,243,0.3)",borderRadius:12,padding:"14px 16px"}}>
              <div style={{fontSize:13,fontWeight:700,color:C.blue,marginBottom:6}}>📊 INCOME TAX ESTIMATE (Section 44AD)</div>
              <div style={{fontSize:11,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.7}}>
                Current FY app revenue: <strong style={{color:C.text}}>₹{fy.toLocaleString("en-IN")}</strong><br/>
                Taxable income (6% of revenue, digital receipts): <strong style={{color:C.text}}>₹{taxableIncome.toLocaleString("en-IN")}</strong><br/>
                Estimated income tax @ 30% slab: <strong style={{color:C.gold}}>₹{estimatedTax.toLocaleString("en-IN")}</strong><br/>
                {advanceTaxDue
                  ? <span style={{color:"#FF6F00",fontWeight:700}}>⚠️ Advance tax due by March 15. Pay via income tax portal (incometax.gov.in). Use Challan 280, Self-Assessment Tax.</span>
                  : <span>Advance tax due date: <strong>March 15</strong>. Pay the above amount by then via incometax.gov.in → Pay Tax → Challan 280.</span>
                }
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:14}}>Recent Users</div>
        {loading ? <div style={{padding:20,color:C.textSec,fontSize:13}}>Loading...</div> :
          stats.recentUsers.length === 0 ? <div style={{padding:20,color:C.textSec,fontSize:13}}>No users yet. Share the app link to get your first users.</div> :
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:C.surface}}>
                {["Name","Email","Joined","Plan"].map(h=><th key={h} style={{padding:"10px 20px",textAlign:"left",fontSize:11,color:C.textSec,letterSpacing:1,fontWeight:600}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((u,i)=>(
                <tr key={i} style={{borderTop:`1px solid ${C.border}`}}>
                  <td style={{padding:"12px 20px",fontSize:13}}>{u.name}</td>
                  <td style={{padding:"12px 20px",fontSize:13,color:C.textSec}}>{u.email}</td>
                  <td style={{padding:"12px 20px",fontSize:12,color:C.textSec}}>{u.joined?.slice(0,10)||"—"}</td>
                  <td style={{padding:"12px 20px"}}><span style={{fontSize:11,padding:"3px 10px",borderRadius:12,background:u.premium?C.goldBg:C.surface,color:u.premium?C.gold:C.textSec,fontWeight:700}}>{u.premium?"AD-FREE":"FREE"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}

// ─── VIDEO UPLOAD ─────────────────────────────────────────────────────
function UploadVideo() {
  const firebase = useFirebase();
  const [selectedEvent, setSelectedEvent] = useState("");
  const [scenarioNum, setScenarioNum] = useState(1);
  const [lang, setLang] = useState("EN");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) { setStatus("❌ Please select a video file (MP4 recommended)"); return; }
    if (f.size > 500 * 1024 * 1024) { setStatus("❌ File too large. Max 500MB per video."); return; }
    setFile(f); setStatus(`✓ ${f.name} (${(f.size/1024/1024).toFixed(1)}MB) ready to upload`);
  };

  const upload = async () => {
    if (!firebase) { setStatus("❌ Still loading, please wait a moment and try again"); return; }
    if (!selectedEvent || !file) { setStatus("❌ Select an event and a video file first"); return; }
    setUploading(true); setProgress(0);
    try {
      const langSuffix = lang === "HI" ? "_hi" : "_en";
      const fileName = `${selectedEvent}_s${scenarioNum}${langSuffix}.mp4`;
      const storageRef = firebase.storageRef(firebase.storage, `videos/${fileName}`);
      const uploadTask = firebase.uploadBytesResumable(storageRef, file);

      uploadTask.on("state_changed",
        (snap) => setProgress(Math.round(snap.bytesTransferred/snap.totalBytes*100)),
        (err) => { setStatus(`❌ Upload failed: ${err.message}`); setUploading(false); },
        async () => {
          const url = await firebase.getDownloadURL(uploadTask.snapshot.ref);
          const fieldName = lang === "HI" ? "videoUrl_hi" : "videoUrl_en";
          await firebase.setDoc(firebase.doc(firebase.db,"events",selectedEvent,"scenarios",`s${scenarioNum}`),
            {[fieldName]:url, num:scenarioNum, updatedAt:new Date().toISOString()},
            {merge:true}
          );
          await firebase.setDoc(firebase.doc(firebase.db,"events",selectedEvent),
            {hasVideos:true, updatedAt:new Date().toISOString()},
            {merge:true}
          );
          setStatus(`✅ Uploaded successfully! Video is now live in the app.`);
          setFile(null); setProgress(0); setUploading(false);
        }
      );
    } catch(e) { setStatus(`❌ Error: ${e.message}`); setUploading(false); }
  };

  return (
    <div style={{maxWidth:600}}>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:6}}>Upload Video</h2>
      <p style={{color:C.textSec,fontSize:13,marginBottom:24}}>Upload a video to a specific event scenario. It goes live immediately.</p>

      <div style={{background:C.card,borderRadius:12,padding:24,border:`1px solid ${C.border}`,marginBottom:16}}>
        <div style={{marginBottom:16}}>
          <label style={{fontSize:12,color:C.textSec,letterSpacing:1,display:"block",marginBottom:6}}>EVENT</label>
          <select value={selectedEvent} onChange={e=>setSelectedEvent(e.target.value)}
            style={{width:"100%",padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none"}}>
            <option value="">— Select event —</option>
            {EVENT_LIST.map(e=><option key={e.id} value={e.id}>{e.emoji} {e.title}</option>)}
          </select>
        </div>

        <div style={{display:"flex",gap:12,marginBottom:16}}>
          <div style={{flex:1}}>
            <label style={{fontSize:12,color:C.textSec,letterSpacing:1,display:"block",marginBottom:6}}>SCENARIO NUMBER</label>
            <select value={scenarioNum} onChange={e=>setScenarioNum(Number(e.target.value))}
              style={{width:"100%",padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none"}}>
              {[1,2,3,4,5].map(n=><option key={n} value={n}>Scenario {n}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <label style={{fontSize:12,color:C.textSec,letterSpacing:1,display:"block",marginBottom:6}}>LANGUAGE</label>
            <select value={lang} onChange={e=>setLang(e.target.value)}
              style={{width:"100%",padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none"}}>
              <option value="EN">🇬🇧 English</option>
              <option value="HI">🇮🇳 Hindi</option>
            </select>
          </div>
        </div>

        <div onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}}
          onDragOver={e=>{e.preventDefault();setDragOver(true);}}
          onDragLeave={()=>setDragOver(false)}
          style={{border:`2px dashed ${dragOver?C.gold:C.border}`,borderRadius:10,padding:"32px 20px",textAlign:"center",cursor:"pointer",background:dragOver?C.goldBg:"transparent",transition:"all 0.2s"}}
          onClick={()=>document.getElementById("vidFile").click()}>
          <input id="vidFile" type="file" accept="video/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
          <div style={{fontSize:32,marginBottom:8}}>🎬</div>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{file ? file.name : "Drop video here or click to select"}</div>
          <div style={{fontSize:12,color:C.textSec}}>MP4 recommended · Max 500MB · 1080p preferred</div>
        </div>

        {status && <div style={{marginTop:12,padding:"10px 14px",background:status.startsWith("✅")?C.greenBg:status.startsWith("❌")?C.redBg:C.surface,borderRadius:8,fontSize:13,color:status.startsWith("✅")?C.green:status.startsWith("❌")?C.red:C.text}}>{status}</div>}

        {uploading && (
          <div style={{marginTop:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:C.textSec}}>Uploading...</span><span style={{fontSize:12,color:C.gold,fontWeight:700}}>{progress}%</span></div>
            <div style={{height:6,background:C.surface,borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${progress}%`,background:C.gold,borderRadius:3,transition:"width 0.3s"}}/>
            </div>
          </div>
        )}

        <button onClick={upload} disabled={!selectedEvent||!file||uploading}
          style={{marginTop:16,width:"100%",padding:"13px 0",background:(!selectedEvent||!file||uploading)?C.surface:C.gold,border:"none",borderRadius:8,color:(!selectedEvent||!file||uploading)?C.textMuted:C.bg,fontSize:14,fontWeight:700,cursor:(!selectedEvent||!file||uploading)?"not-allowed":"pointer",letterSpacing:1}}>
          {uploading?`UPLOADING... ${progress}%`:"⬆ UPLOAD VIDEO"}
        </button>
      </div>

      <div style={{background:C.goldBg,border:`1px solid rgba(232,184,75,0.3)`,borderRadius:10,padding:"14px 16px"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.gold,marginBottom:6}}>💡 How this works</div>
        <div style={{fontSize:12,color:C.textSec,lineHeight:1.7}}>
          1. Generate video using InVideo AI with the prompt from your content files<br/>
          2. Download the MP4 from InVideo (1080p)<br/>
          3. Select event + scenario + language here<br/>
          4. Upload — it goes straight to Firebase Storage and links to your app<br/>
          5. Video is live immediately — no re-deployment needed
        </div>
      </div>
    </div>
  );
}

// ─── CONTENT MANAGER ──────────────────────────────────────────────────
function ContentManager() {
  const firebase = useFirebase();
  const [videoStatus, setVideoStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");

  useEffect(() => {
    if (!firebase) return;
    const load = async () => {
      const status = {};
      for (const ev of EVENT_LIST) {
        status[ev.id] = {};
        for (let s = 1; s <= 5; s++) {
          try {
            const snap = await firebase.getDoc(firebase.doc(firebase.db,"events",ev.id,"scenarios",`s${s}`));
            if (snap.exists()) {
              const d = snap.data();
              status[ev.id][s] = { en: !!d.videoUrl_en, hi: !!d.videoUrl_hi, urls: {en:d.videoUrl_en, hi:d.videoUrl_hi} };
            } else { status[ev.id][s] = {en:false, hi:false}; }
          } catch(e) { status[ev.id][s] = {en:false, hi:false}; }
        }
      }
      setVideoStatus(status); setLoading(false);
    };
    load();
  }, [firebase]);

  const deleteVideo = async (eventId, sNum, lang) => {
    const key = `${eventId}_s${sNum}_${lang}`;
    setDeleting(key);
    try {
      const fileName = `${eventId}_s${sNum}_${lang==="EN"?"_en":"_hi"}.mp4`;
      try { await firebase.deleteObject(firebase.storageRef(firebase.storage, `videos/${fileName}`)); } catch(e) {}
      const fieldName = lang==="EN" ? "videoUrl_en" : "videoUrl_hi";
      await firebase.setDoc(firebase.doc(firebase.db,"events",eventId,"scenarios",`s${sNum}`), {[fieldName]:null}, {merge:true});
      setVideoStatus(prev => ({...prev, [eventId]: {...prev[eventId], [sNum]: {...prev[eventId][sNum], [lang.toLowerCase()]:false}}}));
    } catch(e) { alert("Delete failed: " + e.message); }
    setDeleting("");
  };

  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:6}}>Content Manager</h2>
      <p style={{color:C.textSec,fontSize:13,marginBottom:24}}>See which videos are uploaded for each event and scenario.</p>
      {loading ? <div style={{color:C.textSec}}>Loading content status...</div> :
        EVENT_LIST.map(ev => (
          <div key={ev.id} style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,marginBottom:16,overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>{ev.emoji}</span>
              <span style={{fontSize:14,fontWeight:700}}>{ev.title}</span>
            </div>
            <div style={{padding:"12px 20px"}}>
              {[1,2,3,4,5].map(s => {
                const vs = videoStatus[ev.id]?.[s] || {en:false,hi:false};
                return (
                  <div key={s} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:s<5?`1px solid ${C.border}`:undefined}}>
                    <div style={{width:28,height:28,borderRadius:4,background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.textSec,flexShrink:0}}>S{s}</div>
                    <div style={{flex:1,fontSize:13}}>Scenario {s}</div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:vs.en?C.greenBg:C.redBg,color:vs.en?C.green:C.red,fontWeight:700}}>EN {vs.en?"✓":"✗"}</span>
                      <span style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:vs.hi?C.greenBg:C.redBg,color:vs.hi?C.green:C.red,fontWeight:700}}>HI {vs.hi?"✓":"✗"}</span>
                      {vs.en && <button onClick={()=>deleteVideo(ev.id,s,"EN")} disabled={!!deleting}
                        style={{fontSize:10,padding:"3px 8px",background:C.redBg,border:`1px solid ${C.red}`,borderRadius:4,color:C.red,cursor:"pointer"}}>
                        {deleting===`${ev.id}_s${s}_EN`?"...":"Del EN"}
                      </button>}
                      {vs.hi && <button onClick={()=>deleteVideo(ev.id,s,"HI")} disabled={!!deleting}
                        style={{fontSize:10,padding:"3px 8px",background:C.redBg,border:`1px solid ${C.red}`,borderRadius:4,color:C.red,cursor:"pointer"}}>
                        {deleting===`${ev.id}_s${s}_HI`?"...":"Del HI"}
                      </button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ─── USERS LIST ───────────────────────────────────────────────────────
function UsersList() {
  const firebase = useFirebase();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!firebase) return;
    firebase.getDocs(firebase.collection(firebase.db,"users")).then(snap => {
      const list = [];
      snap.forEach(d => list.push({id:d.id,...d.data()}));
      list.sort((a,b) => (b.signedUpAt||b.lastSeen||"").localeCompare(a.signedUpAt||a.lastSeen||""));
      setUsers(list); setLoading(false);
    }).catch(e => { console.error(e); setLoading(false); });
  }, [firebase]);

  const filtered = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Users</h2>
          <p style={{color:C.textSec,fontSize:13}}>{loading?"Loading...":` ${users.length} total users · ${users.filter(u=>u.isPremium).length} premium`}</p>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email..."
          style={{padding:"8px 12px",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none",width:240}}/>
      </div>

      {loading ? <div style={{color:C.textSec}}>Loading users...</div> :
        users.length === 0 ? <div style={{color:C.textSec,background:C.card,borderRadius:12,padding:24,textAlign:"center"}}>No users yet. Share kaash-app.vercel.app to get your first users.</div> :
        <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:C.surface}}>
                {["Name","Email","Signed Up","Last Seen","Plan"].map(h=>(
                  <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11,color:C.textSec,letterSpacing:1,fontWeight:600}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u,i) => (
                <tr key={i} style={{borderTop:`1px solid ${C.border}`}}>
                  <td style={{padding:"12px 16px",fontSize:13}}>{u.name||"—"}</td>
                  <td style={{padding:"12px 16px",fontSize:12,color:C.textSec}}>{u.email||"—"}</td>
                  <td style={{padding:"12px 16px",fontSize:12,color:C.textSec}}>{u.signedUpAt?.slice(0,10)||"—"}</td>
                  <td style={{padding:"12px 16px",fontSize:12,color:C.textSec}}>{u.lastSeen?.slice(0,10)||"—"}</td>
                  <td style={{padding:"12px 16px"}}>
                    <span style={{fontSize:11,padding:"3px 10px",borderRadius:12,background:u.isPremium?C.goldBg:C.surface,color:u.isPremium?C.gold:C.textSec,fontWeight:700}}>
                      {u.isPremium?"AD-FREE":"FREE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{padding:20,color:C.textSec,textAlign:"center",fontSize:13}}>No results for "{search}"</div>}
        </div>
      }
    </div>
  );
}

// ─── EXPORT DATA ──────────────────────────────────────────────────────
function ExportData() {
  const firebase = useFirebase();
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState("");

  const exportCSV = async () => {
    if (!firebase) { setStatus("❌ Still loading, please wait a moment and try again"); return; }
    setExporting(true); setStatus("Fetching data...");
    try {
      const snap = await firebase.getDocs(firebase.collection(firebase.db,"users"));
      const rows = [["User ID","Name","Email","Signed Up","Last Seen","Premium","Watch Count"]];
      snap.forEach(d => {
        const u = d.data();
        rows.push([d.id, u.name||"", u.email||"", u.signedUpAt?.slice(0,10)||"", u.lastSeen?.slice(0,10)||"", u.isPremium?"Yes":"No", u.watchCount||0]);
      });
      const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], {type:"text/csv"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `kaash-users-${new Date().toISOString().slice(0,10)}.csv`; a.click();
      URL.revokeObjectURL(url);
      setStatus(`✅ Downloaded ${snap.size} users`);
    } catch(e) { setStatus(`❌ Export failed: ${e.message}`); }
    setExporting(false);
  };

  return (
    <div style={{maxWidth:500}}>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:6}}>Export Data</h2>
      <p style={{color:C.textSec,fontSize:13,marginBottom:24}}>Download your user data for analysis in Excel or Google Sheets.</p>

      <div style={{background:C.card,borderRadius:12,padding:24,border:`1px solid ${C.border}`,marginBottom:16}}>
        <div style={{fontSize:15,fontWeight:700,marginBottom:12}}>📊 Users CSV</div>
        <div style={{fontSize:13,color:C.textSec,lineHeight:1.7,marginBottom:20}}>
          Exports a CSV with columns:<br/>
          User ID · Name · Email · Signed Up · Last Seen · Premium (Yes/No) · Watch Count
        </div>
        <button onClick={exportCSV} disabled={exporting}
          style={{width:"100%",padding:"13px 0",background:exporting?C.surface:C.gold,border:"none",borderRadius:8,color:exporting?C.textMuted:C.bg,fontSize:14,fontWeight:700,cursor:exporting?"not-allowed":"pointer",letterSpacing:1}}>
          {exporting?"EXPORTING...":"⬇ DOWNLOAD USERS CSV"}
        </button>
        {status && <div style={{marginTop:12,padding:"10px 14px",background:status.startsWith("✅")?C.greenBg:status.startsWith("❌")?C.redBg:C.surface,borderRadius:8,fontSize:13,color:status.startsWith("✅")?C.green:status.startsWith("❌")?C.red:C.text}}>{status}</div>}
      </div>

      <div style={{background:C.goldBg,border:`1px solid rgba(232,184,75,0.3)`,borderRadius:10,padding:"14px 16px"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.gold,marginBottom:6}}>💡 Usage tip</div>
        <div style={{fontSize:12,color:C.textSec,lineHeight:1.7}}>
          Open the CSV in Google Sheets for easy analysis.<br/>
          Filter by Premium column to see paying users.<br/>
          Sort by Signed Up for cohort analysis.
        </div>
      </div>
    </div>
  );
}

// ─── CREATE NEW EVENT ─────────────────────────────────────────────────
function CreateEvent() {
  const firebase = useFirebase();
  const ERAS = ["ANCIENT","MEDIEVAL","MODERN","CONTEMPORARY"];
  const CATS = ["wars","india","science","ancient","culture","economics"];
  const GRADS = [
    {name:"Dark Red",val:"linear-gradient(135deg,#7A2A1E,#2A1410)"},
    {name:"Deep Blue",val:"linear-gradient(135deg,#2E4468,#141E30)"},
    {name:"Amber Gold",val:"linear-gradient(135deg,#A0651A,#3A2408)"},
    {name:"Space Blue",val:"linear-gradient(135deg,#3E5A7E,#161E2C)"},
    {name:"Bronze",val:"linear-gradient(135deg,#8A6E2E,#2E2410)"},
    {name:"Dark Orange",val:"linear-gradient(135deg,#9E5E28,#2E1A0A)"},
    {name:"Forest",val:"linear-gradient(135deg,#2E5A2E,#0A1F0A)"},
    {name:"Purple",val:"linear-gradient(135deg,#5A2E7A,#1A0A2E)"},
  ];

  const [form, setForm] = useState({
    title:"", short:"", year:"", era:"MODERN", region:"",
    cat:"wars", emoji:"📜", desc:"", tags:"", grad:GRADS[0].val
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const set = (key,val) => setForm(p=>({...p,[key]:val}));

  const generateId = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"").slice(0,30);

  const save = async () => {
    if(!firebase) { setStatus("❌ Still loading, please wait a moment and try again"); return; }
    if(!form.title||!form.year||!form.region||!form.desc) {
      setStatus("❌ Title, year, region and description are required"); return;
    }
    setSaving(true); setStatus("");
    try {
      const id = generateId(form.title);
      const eventData = {
        id, title:form.title, short:form.short||form.title.slice(0,40),
        year:parseInt(form.year), era:form.era, region:form.region,
        cat:form.cat, emoji:form.emoji, grad:form.grad,
        desc:form.desc, tags:form.tags.split(",").map(t=>t.trim()).filter(Boolean),
        createdAt:new Date().toISOString()
      };
      await firebase.setDoc(firebase.doc(firebase.db,"events",id), eventData);
      setStatus(`✅ Event "${form.title}" created with ID: ${id}\n\nNow go to "Edit Scenario" tab to add scenario details, then "Upload Video" to add videos.`);
      setForm({title:"",short:"",year:"",era:"MODERN",region:"",cat:"wars",emoji:"📜",desc:"",tags:"",grad:GRADS[0].val});
    } catch(e) { setStatus(`❌ Failed: ${e.message}`); }
    setSaving(false);
  };

  const Input = ({label,placeholder,value,onChange,type="text",textarea=false}) => (
    <div style={{marginBottom:14}}>
      <label style={{fontSize:11,color:C.textSec,letterSpacing:1,display:"block",marginBottom:5}}>{label}</label>
      {textarea
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3}
            style={{width:"100%",padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none",resize:"vertical",fontFamily:"sans-serif"}}/>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
            style={{width:"100%",padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none"}}/>
      }
    </div>
  );

  return (
    <div style={{maxWidth:640}}>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:6}}>Create New Event</h2>
      <p style={{color:C.textSec,fontSize:13,marginBottom:24}}>Add a new historical event. It will appear in the app immediately after saving.</p>

      <div style={{background:C.card,borderRadius:12,padding:24,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",gap:12}}>
          <div style={{flex:3}}><Input label="EVENT TITLE (full)" placeholder="e.g. Battle of Plassey, 1757" value={form.title} onChange={v=>set("title",v)}/></div>
          <div style={{flex:1}}><Input label="EMOJI" placeholder="🏛️" value={form.emoji} onChange={v=>set("emoji",v)}/></div>
        </div>

        <Input label="SHORT DISPLAY TITLE (shown on cards)" placeholder="e.g. The Battle That Gave Britain India" value={form.short} onChange={v=>set("short",v)}/>

        <div style={{display:"flex",gap:12}}>
          <div style={{flex:1}}><Input label="YEAR" placeholder="1757" type="number" value={form.year} onChange={v=>set("year",v)}/></div>
          <div style={{flex:2}}><Input label="REGION" placeholder="e.g. South Asia" value={form.region} onChange={v=>set("region",v)}/></div>
        </div>

        <div style={{display:"flex",gap:12,marginBottom:14}}>
          <div style={{flex:1}}>
            <label style={{fontSize:11,color:C.textSec,letterSpacing:1,display:"block",marginBottom:5}}>ERA</label>
            <select value={form.era} onChange={e=>set("era",e.target.value)} style={{width:"100%",padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none"}}>
              {ERAS.map(e=><option key={e}>{e}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <label style={{fontSize:11,color:C.textSec,letterSpacing:1,display:"block",marginBottom:5}}>CATEGORY</label>
            <select value={form.cat} onChange={e=>set("cat",e.target.value)} style={{width:"100%",padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none"}}>
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <Input label="DESCRIPTION (2-3 sentences shown on event page)" placeholder="Brief description of the historical event and why it matters..." value={form.desc} onChange={v=>set("desc",v)} textarea/>

        <Input label="TAGS (comma-separated)" placeholder="e.g. India, British Empire, Colonialism" value={form.tags} onChange={v=>set("tags",v)}/>

        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:C.textSec,letterSpacing:1,display:"block",marginBottom:5}}>CARD COLOUR THEME</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {GRADS.map(g=>(
              <div key={g.val} onClick={()=>set("grad",g.val)}
                style={{width:60,height:36,borderRadius:6,background:g.val,cursor:"pointer",border:`${form.grad===g.val?3:1}px solid ${form.grad===g.val?C.gold:C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {form.grad===g.val&&<span style={{fontSize:14}}>✓</span>}
              </div>
            ))}
          </div>
          <div style={{marginTop:6,height:40,borderRadius:8,background:form.grad,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:20}}>{form.emoji||"📜"}</span>
          </div>
        </div>

        {status&&<div style={{marginBottom:14,padding:"12px 14px",background:status.startsWith("✅")?C.greenBg:status.startsWith("❌")?C.redBg:C.surface,borderRadius:8,fontSize:13,color:status.startsWith("✅")?C.green:status.startsWith("❌")?C.red:C.text,whiteSpace:"pre-line"}}>{status}</div>}

        <button onClick={save} disabled={saving}
          style={{width:"100%",padding:"13px 0",background:saving?C.surface:C.gold,border:"none",borderRadius:8,color:saving?C.textMuted:C.bg,fontSize:14,fontWeight:700,cursor:saving?"not-allowed":"pointer",letterSpacing:1}}>
          {saving?"SAVING...":"✚ CREATE EVENT"}
        </button>

        <div style={{marginTop:16,padding:"12px 14px",background:C.goldBg,borderRadius:8,fontSize:12,color:C.textSec,lineHeight:1.7}}>
          <strong style={{color:C.gold}}>After creating an event:</strong><br/>
          1. Go to <strong>Edit Scenario</strong> tab → add titles, narratives and ripple effects for all 5 scenarios<br/>
          2. Go to <strong>Upload Video</strong> tab → upload the MP4 videos<br/>
          3. The event and videos appear in the app automatically — no redeployment needed
        </div>
      </div>
    </div>
  );
}

// ─── EDIT SCENARIO DETAILS ────────────────────────────────────────────
function EditScenario() {
  const firebase = useFirebase();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [scenarioNum, setScenarioNum] = useState(1);
  const [form, setForm] = useState({title:"",tagline:"",narrative:"",ripples:["","","","",""]});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  // Load all events from Firestore (both hardcoded and new ones)
  useEffect(()=>{
    if (!firebase) return;
    const load = async () => {
      try {
        const snap = await firebase.getDocs(firebase.collection(firebase.db,"events"));
        const list = snap.docs.map(d=>({id:d.id,...d.data()}));
        // Merge with hardcoded list (hardcoded ones may not be in Firestore yet)
        const ids = new Set(list.map(e=>e.id));
        EVENT_LIST.forEach(e=>{ if(!ids.has(e.id)) list.push(e); });
        list.sort((a,b)=>(a.title||"").localeCompare(b.title||""));
        setEvents(list);
      } catch(e){ setEvents(EVENT_LIST); }
    };
    load();
  },[firebase]);

  // Load existing scenario data when event/num changes
  useEffect(()=>{
    if(!selectedEvent || !firebase) return;
    setLoading(true);
    firebase.getDoc(firebase.doc(firebase.db,"events",selectedEvent,"scenarios",`s${scenarioNum}`)).then(snap=>{
      if(snap.exists()){
        const d=snap.data();
        setForm({
          title:d.title||"",tagline:d.tagline||"",narrative:d.narrative||"",
          ripples:d.ripples&&d.ripples.length===5?d.ripples:["","","","",""]
        });
      } else {
        setForm({title:"",tagline:"",narrative:"",ripples:["","","","",""]});
      }
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[selectedEvent,scenarioNum,firebase]);

  const setR = (i,v) => setForm(p=>({...p,ripples:p.ripples.map((r,idx)=>idx===i?v:r)}));

  const save = async () => {
    if(!firebase) { setStatus("❌ Still loading, please wait a moment and try again"); return; }
    if(!selectedEvent||!form.title||!form.tagline) { setStatus("❌ Select event, and fill in title and tagline"); return; }
    setSaving(true); setStatus("");
    try {
      await firebase.setDoc(firebase.doc(firebase.db,"events",selectedEvent,"scenarios",`s${scenarioNum}`),{
        num:scenarioNum, title:form.title, tagline:form.tagline,
        narrative:form.narrative, ripples:form.ripples.filter(r=>r.trim()),
        updatedAt:new Date().toISOString()
      },{merge:true});
      setStatus(`✅ Scenario ${scenarioNum} saved. Visible in app immediately.`);
    } catch(e){ setStatus(`❌ Save failed: ${e.message}`); }
    setSaving(false);
  };

  const Textarea = ({label,placeholder,value,onChange,rows=3}) => (
    <div style={{marginBottom:14}}>
      <label style={{fontSize:11,color:C.textSec,letterSpacing:1,display:"block",marginBottom:5}}>{label}</label>
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{width:"100%",padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none",resize:"vertical",fontFamily:"sans-serif"}}/>
    </div>
  );

  return (
    <div style={{maxWidth:640}}>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:6}}>Edit Scenario Details</h2>
      <p style={{color:C.textSec,fontSize:13,marginBottom:24}}>Add or edit the title, narrative and ripple effects for any scenario.</p>

      <div style={{background:C.card,borderRadius:12,padding:24,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",gap:12,marginBottom:20}}>
          <div style={{flex:3}}>
            <label style={{fontSize:11,color:C.textSec,letterSpacing:1,display:"block",marginBottom:5}}>EVENT</label>
            <select value={selectedEvent} onChange={e=>setSelectedEvent(e.target.value)}
              style={{width:"100%",padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none"}}>
              <option value="">— Select event —</option>
              {events.map(e=><option key={e.id} value={e.id}>{e.emoji||"📜"} {e.title}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <label style={{fontSize:11,color:C.textSec,letterSpacing:1,display:"block",marginBottom:5}}>SCENARIO</label>
            <select value={scenarioNum} onChange={e=>setScenarioNum(Number(e.target.value))}
              style={{width:"100%",padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none"}}>
              {[1,2,3,4,5].map(n=><option key={n} value={n}>Scenario {n}</option>)}
            </select>
          </div>
        </div>

        {loading ? <div style={{color:C.textSec,textAlign:"center",padding:20}}>Loading...</div> : selectedEvent ? (
          <>
            <Textarea label="SCENARIO TITLE" placeholder='e.g. "The Archduke Lives"' value={form.title} onChange={v=>setForm(p=>({...p,title:v}))} rows={1}/>
            <Textarea label="TAGLINE (What if...? question)" placeholder={`e.g. "What if Princip's pistol misfired?"`} value={form.tagline} onChange={v=>setForm(p=>({...p,tagline:v}))} rows={1}/>
            <Textarea label="NARRATIVE (the full alternate history story, 3 paragraphs)" placeholder="Write the alternate history narrative here..." value={form.narrative} onChange={v=>setForm(p=>({...p,narrative:v}))} rows={8}/>

            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,color:C.textSec,letterSpacing:1,display:"block",marginBottom:5}}>RIPPLE EFFECTS (5 consequences of this alternate history)</label>
              {form.ripples.map((r,i)=>(
                <input key={i} value={r} onChange={e=>setR(i,e.target.value)}
                  placeholder={`Ripple ${i+1}: e.g. "No WW1 → No Nazi Germany"`}
                  style={{width:"100%",padding:"9px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,outline:"none",marginBottom:8}}/>
              ))}
            </div>

            {status&&<div style={{marginBottom:14,padding:"12px 14px",background:status.startsWith("✅")?C.greenBg:C.redBg,borderRadius:8,fontSize:13,color:status.startsWith("✅")?C.green:C.red}}>{status}</div>}

            <button onClick={save} disabled={saving}
              style={{width:"100%",padding:"13px 0",background:saving?C.surface:C.gold,border:"none",borderRadius:8,color:saving?C.textMuted:C.bg,fontSize:14,fontWeight:700,cursor:saving?"not-allowed":"pointer",letterSpacing:1}}>
              {saving?"SAVING...":"💾 SAVE SCENARIO"}
            </button>
          </>
        ) : <div style={{color:C.textSec,textAlign:"center",padding:"20px 0",fontSize:13}}>Select an event above to edit its scenarios</div>}
      </div>
    </div>
  );
}

// ─── SUGGESTIONS (from users) ─────────────────────────────────────────
function Suggestions() {
  const firebase = useFirebase();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");

  useEffect(()=>{
    if (!firebase) return;
    firebase.getDocs(firebase.collection(firebase.db,"suggestions")).then(snap=>{
      const list = [];
      snap.forEach(d => list.push({id:d.id,...d.data()}));
      list.sort((a,b)=>(b.count||0)-(a.count||0));
      setSuggestions(list); setLoading(false);
    }).catch(e=>{ console.error(e); setLoading(false); });
  },[firebase]);

  const setStatus = async (id, status) => {
    if (!firebase) return;
    setUpdating(id);
    await firebase.setDoc(firebase.doc(firebase.db,"suggestions",id),{status},{merge:true});
    setSuggestions(prev=>prev.map(s=>s.id===id?{...s,status}:s));
    setUpdating("");
  };

  const statusColors = {
    pending:{bg:"rgba(33,150,243,0.1)",color:"#2196F3",label:"Pending"},
    planned:{bg:"rgba(232,184,75,0.1)",color:"#E8B84B",label:"Planned"},
    done:{bg:"rgba(76,175,80,0.1)",color:"#4CAF50",label:"Done"},
    rejected:{bg:"rgba(229,57,53,0.1)",color:"#E53935",label:"Rejected"},
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>User Suggestions</h2>
          <p style={{color:C.textSec,fontSize:13}}>{loading?"Loading...":` ${suggestions.length} suggestions · sorted by most requested`}</p>
        </div>
      </div>

      {loading ? <div style={{color:C.textSec,padding:20}}>Loading suggestions...</div> :
        suggestions.length===0 ? (
          <div style={{background:C.card,borderRadius:12,padding:32,textAlign:"center",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:32,marginBottom:12}}>💡</div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>No suggestions yet</div>
            <div style={{fontSize:13,color:C.textSec,fontFamily:"sans-serif"}}>When users search for something that doesn't exist and tap "Suggest it", it appears here.</div>
          </div>
        ) : (
          <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:C.surface}}>
                  {["Suggestion","Requests","First Asked","Last Asked","Status","Action"].map(h=>(
                    <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11,color:C.textSec,letterSpacing:1,fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suggestions.map((s,i)=>{
                  const sc = statusColors[s.status||"pending"];
                  return (
                    <tr key={i} style={{borderTop:`1px solid ${C.border}`}}>
                      <td style={{padding:"12px 16px",fontSize:14,fontWeight:600}}>{s.query}</td>
                      <td style={{padding:"12px 16px",fontSize:13,fontWeight:700,color:C.gold}}>{s.count||1}</td>
                      <td style={{padding:"12px 16px",fontSize:12,color:C.textSec}}>{s.createdAt?.slice(0,10)||"—"}</td>
                      <td style={{padding:"12px 16px",fontSize:12,color:C.textSec}}>{s.lastRequested?.slice(0,10)||"—"}</td>
                      <td style={{padding:"12px 16px"}}>
                        <span style={{fontSize:11,padding:"3px 10px",borderRadius:12,background:sc.bg,color:sc.color,fontWeight:700}}>{sc.label}</span>
                      </td>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",gap:6}}>
                          {["planned","done","rejected"].map(st=>(
                            <button key={st} onClick={()=>setStatus(s.id,st)} disabled={s.status===st||!!updating}
                              style={{fontSize:10,padding:"3px 8px",background:statusColors[st].bg,border:`1px solid ${statusColors[st].color}`,borderRadius:4,color:statusColors[st].color,cursor:s.status===st?"default":"pointer",opacity:s.status===st?0.5:1}}>
                              {updating===s.id?"...":st.charAt(0).toUpperCase()+st.slice(1)}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      }

      <div style={{marginTop:16,background:C.goldBg,border:`1px solid rgba(232,184,75,0.3)`,borderRadius:10,padding:"14px 16px"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.gold,marginBottom:6}}>💡 How this works</div>
        <div style={{fontSize:12,color:C.textSec,lineHeight:1.7}}>
          When a user searches for something not in the app, they see a "Suggest it" button.<br/>
          Their suggestion appears here. The count shows how many users requested the same thing.<br/>
          Mark as <strong>Planned</strong> when you decide to make it, <strong>Done</strong> when it's live, <strong>Rejected</strong> if you won't do it.
        </div>
      </div>
    </div>
  );
}

// ─── PAYMENTS TAB ─────────────────────────────────────────────────────
function PaymentsTab() {
  const firebase = useFirebase();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({base:0,gst:0,total:0,monthly:0,yearly:0});

  useEffect(()=>{
    if (!firebase) return;
    firebase.getDocs(firebase.collection(firebase.db,"payments")).then(snap=>{
      const list = [];
      let base=0,monthly=0,yearly=0;
      snap.forEach(d=>{
        const data={id:d.id,...d.data()};
        list.push(data);
        base += (data.amount||data.baseAmount||0);
        if(data.plan==="monthly") monthly++;
        else if(data.plan==="yearly") yearly++;
      });
      list.sort((a,b)=>(b.paidAt||"").localeCompare(a.paidAt||""));
      setPayments(list);
      setTotals({base,monthly,yearly});
      setLoading(false);
    }).catch(e=>{ console.error(e); setLoading(false); });
  },[firebase]);

  const exportPaymentsCSV = () => {
    const rows=[["Payment ID","User Email","Plan","Base (₹)","GST (₹)","Total (₹)","Paid At","Order ID"]];
    payments.forEach(p=>{
      rows.push([p.razorpayPaymentId||p.id, p.email||"—", p.plan||"—",
        p.baseAmount||0, p.gstAmount||0, p.totalAmount||0,
        p.paidAt?.slice(0,10)||"—", p.razorpayOrderId||"—"]);
    });
    const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download=`kaash-payments-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>Payments</h2>
          <p style={{color:C.textSec,fontSize:13}}>{loading?"Loading...": `${payments.length} transactions · ₹${totals.base.toFixed(2)} revenue (excl. GST)`}</p>
        </div>
        {payments.length>0&&<button onClick={exportPaymentsCSV} style={{padding:"8px 14px",background:C.goldBg,border:`1px solid ${C.gold}`,borderRadius:8,color:C.gold,cursor:"pointer",fontSize:12,fontWeight:700}}>⬇ Export CSV</button>}
      </div>

      {/* Revenue Summary */}
      {!loading&&payments.length>0&&(
        <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          {[
            {label:"Total Revenue",value:`₹${totals.base.toLocaleString("en-IN")}`,sub:"All time app revenue",c:C.green},
            {label:"Income Tax Est.",value:`₹${Math.round(totals.base*0.06*0.30).toLocaleString("en-IN")}`,sub:"6% taxable × 30% slab",c:C.gold},
            {label:"Net Earnings",value:`₹${Math.round(totals.base*0.982).toLocaleString("en-IN")}`,sub:"After ~1.8% effective tax",c:C.blue},
            {label:"Monthly Subs",value:totals.monthly,sub:"₹49/month each",c:C.textSec},
            {label:"Yearly Subs",value:totals.yearly,sub:"₹499/year each",c:C.textSec},
          ].map((s,i)=>(
            <div key={i} style={{background:C.card,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`,flex:1,minWidth:130}}>
              <div style={{fontSize:18,fontWeight:900,color:s.c,fontFamily:"monospace"}}>{s.value}</div>
              <div style={{fontSize:12,fontWeight:600,marginTop:2}}>{s.label}</div>
              <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {loading?<div style={{color:C.textSec}}>Loading...</div>:
        payments.length===0?(
          <div style={{background:C.card,borderRadius:12,padding:32,textAlign:"center",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:32,marginBottom:12}}>💰</div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>No payments yet</div>
            <div style={{fontSize:13,color:C.textSec,fontFamily:"sans-serif",lineHeight:1.6}}>Once Razorpay is connected and users subscribe, all transactions appear here with full tax breakdown.</div>
          </div>
        ):(
          <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:C.surface}}>
                  {["Date","Email","Plan","Amount (₹)","Financial Year","Payment ID"].map(h=>(
                    <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,color:C.textSec,letterSpacing:1,fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p,i)=>(
                  <tr key={i} style={{borderTop:`1px solid ${C.border}`}}>
                    <td style={{padding:"11px 14px",fontSize:12,color:C.textSec}}>{p.paidAt?.slice(0,10)||"—"}</td>
                    <td style={{padding:"11px 14px",fontSize:12}}>{p.email||"—"}</td>
                    <td style={{padding:"11px 14px"}}>
                      <span style={{fontSize:11,padding:"3px 8px",borderRadius:10,background:p.plan==="yearly"?C.goldBg:C.surface,color:p.plan==="yearly"?C.gold:C.textSec,fontWeight:700}}>
                        {p.plan==="yearly"?"YEARLY":"MONTHLY"}
                      </span>
                    </td>
                    <td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:C.green}}>₹{(p.amount||p.baseAmount||0).toLocaleString("en-IN")}</td>
                    <td style={{padding:"11px 14px",fontSize:12,color:C.textSec}}>{p.financialYear||"—"}</td>
                    <td style={{padding:"11px 14px",fontSize:10,color:C.textMuted,fontFamily:"monospace"}}>{(p.razorpayPaymentId||p.id||"—").slice(0,20)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      <div style={{marginTop:16,background:"rgba(33,150,243,0.08)",border:"1px solid rgba(33,150,243,0.3)",borderRadius:10,padding:"14px 16px"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.blue,marginBottom:6}}>📋 Tax filing note</div>
        <div style={{fontSize:12,color:C.textSec,lineHeight:1.7}}>
          <strong style={{color:C.text}}>GST:</strong> Not collected — app revenue is below the ₹20 lakh annual threshold. No GST number required yet.<br/>
          <strong style={{color:C.text}}>Income Tax:</strong> Declare app revenue under Section 44AD (business income). Only 6% is taxable. Pay advance tax by March 15 each year via incometax.gov.in → Challan 280.<br/>
          <strong style={{color:C.text}}>ITR Form:</strong> Switch from ITR-1 to ITR-4 (Sugam) from the year you first earn from KAASH.<br/>
          <strong style={{color:C.text}}>Bank:</strong> Razorpay settlements go to your personal savings account — fully legal below ₹20 lakh revenue.
        </div>
      </div>
    </div>
  );
}
