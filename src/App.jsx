import { useState, useEffect, useRef, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLr641k9II7uniS7AF33jRvs8luH7nI40",
  authDomain: "familiago-8841b.firebaseapp.com",
  projectId: "familiago-8841b",
  storageBucket: "familiago-8841b.firebasestorage.app",
  messagingSenderId: "65117579531",
  appId: "1:65117579531:web:26a8fe2caf3d6b257d9a0e",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const DATA_REF = doc(db, "familiago", "data");

const MOVE = new Date(2026, 7, 1);
const USERS = {
  S: { name: "Sandra",   color: "#FF6B6B", light: "#FFF5F5", dark: "#e05555", emoji: "👩" },
  J: { name: "Jeronimo", color: "#4FACFE", light: "#EFF8FF", dark: "#2d8de0", emoji: "🧑" },
};
const CATS = [
  { id: "dok",    label: "Dokumente",       icon: "📄", color: "#EF4444" },
  { id: "schule", label: "Schule & Kinder", icon: "🏫", color: "#F59E0B" },
  { id: "wohn",   label: "Wohnung",         icon: "🏠", color: "#10B981" },
  { id: "ges",    label: "Gesundheit",      icon: "🏥", color: "#3B82F6" },
  { id: "fin",    label: "Finanzen",        icon: "💶", color: "#8B5CF6" },
  { id: "umz",    label: "Umzug",           icon: "📦", color: "#F97316" },
  { id: "vert",   label: "Verträge",        icon: "📋", color: "#06B6D4" },
  { id: "sons",   label: "Sonstiges",       icon: "✨", color: "#6B7280" },
];
const FOLDERS = [
  { id: "wohn",   label: "Wohnung & Miete", icon: "🏠" },
  { id: "schule", label: "Schule & Kinder", icon: "🏫" },
  { id: "beh",    label: "Behörden & NIE",  icon: "📄" },
  { id: "fin",    label: "Finanzen",        icon: "💶" },
  { id: "ang",    label: "Angebote",        icon: "📋" },
  { id: "sons",   label: "Sonstiges",       icon: "📁" },
];
const PRIO = {
  hoch:    { label: "Dringend", color: "#EF4444", bg: "#FEF2F2" },
  mittel:  { label: "Normal",   color: "#F59E0B", bg: "#FFFBEB" },
  niedrig: { label: "Später",   color: "#10B981", bg: "#ECFDF5" },
};
const DEF_TASKS = [
  { id:1,  t:"NIE beantragen – alle Familienmitglieder",     cat:"dok",    prio:"hoch",   owner:"shared", done:false, note:"Número de Identificación de Extranjero", week:null },
  { id:2,  t:"Reisepässe prüfen & erneuern",                 cat:"dok",    prio:"hoch",   owner:"shared", done:false, note:"Mind. 6 Monate über Einreise gültig", week:null },
  { id:3,  t:"Geburtsurkunden Kinder übersetzen",            cat:"dok",    prio:"hoch",   owner:"shared", done:false, note:"Vereidigter Übersetzer nötig", week:null },
  { id:4,  t:"Empadronamiento nach Ankunft",                 cat:"dok",    prio:"mittel", owner:"shared", done:false, note:"Gemeinderegistrierung in Spanien", week:null },
  { id:5,  t:"Abmeldung in Deutschland",                     cat:"dok",    prio:"mittel", owner:"shared", done:false, note:"Einwohnermeldeamt kontaktieren", week:null },
  { id:6,  t:"Schulen in Zielregion recherchieren",          cat:"schule", prio:"hoch",   owner:"shared", done:false, note:"Öffentlich gratis – Liste erstellen", week:null },
  { id:7,  t:"Schulanmeldung (Matrícula escolar)",           cat:"schule", prio:"hoch",   owner:"shared", done:false, note:"Nicht verpassen – oft Mai/Juni!", week:null },
  { id:8,  t:"Schulzeugnisse übersetzen lassen",             cat:"schule", prio:"mittel", owner:"shared", done:false, note:"Für Einschätzung Schuljahr", week:null },
  { id:9,  t:"Spanisch-Kurs für Kinder starten",             cat:"schule", prio:"mittel", owner:"shared", done:false, note:"Lingokids, Duolingo Kids", week:null },
  { id:10, t:"Impfausweise übersetzen/anpassen",             cat:"schule", prio:"mittel", owner:"shared", done:false, note:"Spanisches Impfschema prüfen", week:null },
  { id:11, t:"Wohnung/Haus in Spanien finden",               cat:"wohn",   prio:"hoch",   owner:"shared", done:false, note:"Idealista, Fotocasa, Habitaclia", week:null },
  { id:12, t:"Strom & Gas anmelden",                         cat:"wohn",   prio:"mittel", owner:"shared", done:false, note:"Iberdrola oder Endesa", week:null },
  { id:13, t:"Internet buchen",                              cat:"wohn",   prio:"mittel", owner:"shared", done:false, note:"Digi günstig, Movistar stabil", week:null },
  { id:14, t:"EHIC Krankenversicherungskarte",               cat:"ges",    prio:"hoch",   owner:"shared", done:false, note:"Kostenlos über Krankenkasse", week:null },
  { id:15, t:"Seguridad Social anmelden",                    cat:"ges",    prio:"hoch",   owner:"shared", done:false, note:"Nach Empadronamiento möglich", week:null },
  { id:16, t:"Hausarzt & Kinderarzt finden",                 cat:"ges",    prio:"mittel", owner:"shared", done:false, note:"Centro de Salud", week:null },
  { id:17, t:"Medikamente für Übergangszeit",                cat:"ges",    prio:"mittel", owner:"shared", done:false, note:"Rezepte mitnehmen", week:null },
  { id:18, t:"Spanisches Bankkonto eröffnen",                cat:"fin",    prio:"hoch",   owner:"shared", done:false, note:"BBVA, CaixaBank, Sabadell", week:null },
  { id:19, t:"Steuerberater Doppelbesteuerung",              cat:"fin",    prio:"mittel", owner:"shared", done:false, note:"Besonderheiten bei Umzug im Steuerjahr", week:null },
  { id:20, t:"Umzugsunternehmen beauftragen",                cat:"umz",    prio:"hoch",   owner:"shared", done:false, note:"August = Hochsaison! Früh buchen!", week:null },
  { id:21, t:"Inventar erstellen & aussortieren",            cat:"umz",    prio:"mittel", owner:"shared", done:false, note:"Was kommt mit, was wird verkauft?", week:null },
  { id:22, t:"Wichtige Dokumente persönlich mitnehmen",      cat:"umz",    prio:"hoch",   owner:"shared", done:false, note:"Pässe, NIE NICHT in den Umzugswagen!", week:null },
  { id:23, t:"Mietvertrag DE kündigen",                      cat:"vert",   prio:"hoch",   owner:"shared", done:false, note:"3 Monate Kündigungsfrist – sofort!", week:null },
  { id:24, t:"Strom/Gas/Internet DE kündigen",               cat:"vert",   prio:"mittel", owner:"shared", done:false, note:"Mit Umzugsdatum abstimmen", week:null },
  { id:25, t:"KFZ-Versicherung umstellen",                   cat:"vert",   prio:"mittel", owner:"shared", done:false, note:"Neue spanische Versicherung", week:null },
  { id:26, t:"GEZ abmelden",                                 cat:"vert",   prio:"niedrig",owner:"shared", done:false, note:"Online möglich", week:null },
];

function daysLeft() { return Math.max(0, Math.ceil((MOVE - new Date()) / 864e5)); }
function getISOWeek(d) {
  const date = new Date(d); date.setHours(0,0,0,0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const w1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date - w1) / 864e5 - 3 + (w1.getDay() + 6) % 7) / 7);
}
function getWeeks() {
  const ws = []; const end = new Date(2026, 7, 4);
  let cur = new Date(2026, 4, 11);
  const d = cur.getDay(); cur.setDate(cur.getDate() + (d===0?1:d===1?0:8-d));
  const mo = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug'];
  for (let i = 0; cur < end; i++) {
    const s = new Date(cur), e = new Date(cur); e.setDate(e.getDate()+6);
    ws.push({ id:i, kw:getISOWeek(s), range:`${s.getDate()}. ${mo[s.getMonth()]} – ${e.getDate()}. ${mo[e.getMonth()]}` });
    cur.setDate(cur.getDate()+7);
  }
  return ws;
}
const WEEKS = getWeeks();

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #D6DFF5; font-family: 'Nunito', sans-serif; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #A0AECF; border-radius: 4px; }
  textarea, input, select { font-family: 'Nunito', sans-serif; }
  @keyframes flipIn  { from { transform: perspective(700px) rotateY(-90deg) scale(0.92); opacity:0; } to { transform: perspective(700px) rotateY(0deg) scale(1); opacity:1; } }
  @keyframes flipOut { from { transform: perspective(700px) rotateY(0deg) scale(1); opacity:1; } to { transform: perspective(700px) rotateY(90deg) scale(0.92); opacity:0; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .flip-in  { animation: flipIn  0.45s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
  .flip-out { animation: flipOut 0.35s cubic-bezier(0.55,0.06,0.68,0.19) forwards; }
  .spinner  { animation: spin 1s linear infinite; }
`;

export default function App() {
  const [loaded,  setLoaded]  = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [user,    setUser]    = useState("S");
  const [tab,     setTab]     = useState("home");
  const [tasks,   setTasks]   = useState(DEF_TASKS);
  const [savings, setSavings] = useState({ base:5000, entries:[] });
  const [msgs,    setMsgs]    = useState([{ id:1, from:"J", text:"Hola Sandra! 🇪🇸 Auf nach Spanien!", ts:Date.now()-3600000 }]);
  const [docs,    setDocs]    = useState([]);
  const saveTimer = useRef(null);
  const isRemote  = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(DATA_REF, (snap) => {
      if (snap.exists()) {
        isRemote.current = true;
        const d = snap.data();
        if (d.tasks)   setTasks(d.tasks);
        if (d.savings) setSavings(d.savings);
        if (d.msgs)    setMsgs(d.msgs);
        setTimeout(() => { isRemote.current = false; }, 100);
      }
      setLoaded(true);
    }, () => setLoaded(true));
    return unsub;
  }, []);

  const save = useCallback((t, s, m) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSyncing(true);
      try { await setDoc(DATA_REF, { tasks:t, savings:s, msgs:m }); } catch(e) {}
      setSyncing(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (!loaded || isRemote.current) return;
    save(tasks, savings, msgs);
  }, [tasks, savings, msgs, loaded, save]);

  useEffect(() => {
    try { const d = localStorage.getItem("fg_docs"); if (d) setDocs(JSON.parse(d)); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("fg_docs", JSON.stringify(docs)); } catch {}
  }, [docs]);

  const u          = USERS[user];
  const done       = tasks.filter(t => t.done).length;
  const progress   = tasks.length ? Math.round(done/tasks.length*100) : 0;
  const totalSaved = savings.base + savings.entries.reduce((s,e) => s+(e.amount||0), 0);
  const savePct    = Math.min(100, Math.round(totalSaved/10000*100));
  const days       = daysLeft();
  const urgent     = tasks.filter(t => !t.done && t.prio==="hoch");

  const TABS = [
    { id:"home",  icon:"🏠", label:"Home"   },
    { id:"tasks", icon:"✅", label:"Todos"  },
    { id:"plan",  icon:"📅", label:"Wochen" },
    { id:"money", icon:"💰", label:"Sparen" },
    { id:"chat",  icon:"💬", label:"Chat"   },
    { id:"docs",  icon:"📁", label:"Ordner" },
  ];

  if (!loaded) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", flexDirection:"column", gap:16, background:"#D6DFF5" }}>
      <style>{css}</style>
      <div className="spinner" style={{ width:40, height:40, borderRadius:"50%", border:"4px solid #E2E8F0", borderTopColor:"#4FACFE" }} />
      <div style={{ fontWeight:800, color:"#475569", fontFamily:"Nunito,sans-serif" }}>FamiliaGo wird geladen…</div>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif", background:"#D6DFF5", minHeight:"100vh", maxWidth:480, margin:"0 auto", display:"flex", flexDirection:"column" }}>
      <style>{css}</style>
      <div style={{ background:"#fff", borderBottom:"1px solid #E8EDFF", padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:26 }}>🇪🇸</span>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ fontWeight:800, fontSize:16, color:"#1E293B" }}>FamiliaGo</div>
              {syncing && <div className="spinner" style={{ width:12, height:12, borderRadius:"50%", border:"2px solid #E2E8F0", borderTopColor:"#4FACFE" }} />}
            </div>
            <div style={{ fontSize:11, color:"#94A3B8" }}>☀️ {days} Tage bis August</div>
          </div>
        </div>
        <div style={{ display:"flex", background:"#F1F5F9", borderRadius:30, padding:4, gap:4 }}>
          {["S","J"].map(uid => (
            <button key={uid} onClick={() => setUser(uid)} style={{ background:user===uid?USERS[uid].color:"transparent", color:user===uid?"#fff":"#64748B", border:"none", borderRadius:24, padding:"5px 14px", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"Nunito,sans-serif", transition:"all 0.2s" }}>
              {USERS[uid].emoji} {USERS[uid].name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 90px" }}>
        {tab==="home"  && <HomeTab  tasks={tasks} setTasks={setTasks} urgent={urgent} progress={progress} done={done} totalSaved={totalSaved} savePct={savePct} user={user} setTab={setTab} />}
        {tab==="tasks" && <TasksTab tasks={tasks} setTasks={setTasks} user={user} />}
        {tab==="plan"  && <PlanTab  tasks={tasks} setTasks={setTasks} user={user} />}
        {tab==="money" && <MoneyTab savings={savings} setSavings={setSavings} user={user} totalSaved={totalSaved} savePct={savePct} days={days} />}
        {tab==="chat"  && <ChatTab  msgs={msgs} setMsgs={setMsgs} user={user} />}
        {tab==="docs"  && <DocsTab  docs={docs} setDocs={setDocs} user={user} />}
      </div>

      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"#fff", borderTop:"1px solid #E8EDFF", display:"flex", padding:"8px 4px 20px" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"4px 0" }}>
            <span style={{ fontSize:20 }}>{t.icon}</span>
            <span style={{ fontSize:10, fontWeight:700, color:tab===t.id?u.color:"#94A3B8", fontFamily:"Nunito,sans-serif" }}>{t.label}</span>
            {tab===t.id && <div style={{ width:4, height:4, borderRadius:"50%", background:u.color }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function HomeTab({ tasks, setTasks, urgent, progress, done, totalSaved, savePct, user, setTab }) {
  const u = USERS[user];
  const [saveRevealed, setSaveRevealed] = useState(false);
  const catStats = CATS.map(c => {
    const ct = tasks.filter(t => t.cat===c.id);
    return { ...c, total:ct.length, done:ct.filter(t=>t.done).length, pct:ct.length?Math.round(ct.filter(t=>t.done).length/ct.length*100):0 };
  }).filter(c => c.total>0);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ background:`linear-gradient(135deg,${u.color},${u.dark})`, borderRadius:24, padding:"20px 22px", color:"#fff" }}>
        <div style={{ fontSize:13, opacity:0.85, marginBottom:4 }}>Hola, {u.name}! 👋</div>
        <div style={{ fontWeight:800, fontSize:22, marginBottom:14 }}>Ihr packt das! 💪</div>
        <div style={{ background:"rgba(255,255,255,0.2)", borderRadius:12, height:10, marginBottom:6, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:"#fff", borderRadius:12, transition:"width 0.5s" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
          <span style={{ opacity:0.85 }}>{done} von {tasks.length} Aufgaben</span>
          <span style={{ fontWeight:800 }}>{progress}%</span>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Card style={{ background:"#FFFBEB", cursor:"pointer" }} onClick={() => saveRevealed?setTab("money"):setSaveRevealed(true)}>
          <div style={{ fontSize:11, color:"#92400E", fontWeight:700, marginBottom:6 }}>💰 ERSPARNISSE</div>
          {saveRevealed ? (
            <>
              <div style={{ fontWeight:800, fontSize:20, color:"#1E293B" }}>{totalSaved.toLocaleString("de")}€</div>
              <div style={{ background:"#FDE68A", borderRadius:6, height:6, margin:"8px 0 4px", overflow:"hidden" }}>
                <div style={{ width:`${savePct}%`, height:"100%", background:"#F59E0B", borderRadius:6 }} />
              </div>
              <div style={{ fontSize:11, color:"#92400E" }}>{savePct}% von 10.000€</div>
            </>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"6px 0 2px" }}>
              <span style={{ fontSize:32 }}>💰</span>
              <div style={{ fontSize:11, color:"#B45309", fontWeight:700, marginTop:4 }}>Tippen zum Anzeigen</div>
            </div>
          )}
        </Card>
        <Card style={{ background:"#FFF5F5" }}>
          <div style={{ fontSize:11, color:"#991B1B", fontWeight:700, marginBottom:4 }}>🔥 DRINGEND</div>
          <div style={{ fontWeight:800, fontSize:28, color:"#1E293B" }}>{urgent.length}</div>
          <div style={{ fontSize:11, color:"#991B1B", marginTop:4 }}>Aufgaben offen</div>
        </Card>
      </div>
      {urgent.length>0 && (
        <div>
          <SectionTitle>🚨 Sofort erledigen</SectionTitle>
          {urgent.slice(0,3).map(task => {
            const cat = CATS.find(c=>c.id===task.cat);
            return (
              <div key={task.id} style={{ background:"#fff", borderRadius:14, padding:"12px 14px", marginBottom:8, display:"flex", gap:12, alignItems:"center", border:"1px solid #FEE2E2", cursor:"pointer" }}
                onClick={() => setTasks(ts=>ts.map(t=>t.id===task.id?{...t,done:!t.done}:t))}>
                <div style={{ width:22, height:22, borderRadius:7, border:"2.5px solid #EF4444", background:task.done?"#EF4444":"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {task.done && <span style={{ color:"#fff", fontSize:12 }}>✓</span>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#1E293B" }}>{cat?.icon} {task.t}</div>
                  <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{task.note}</div>
                </div>
              </div>
            );
          })}
          {urgent.length>3 && <div style={{ textAlign:"center", fontSize:12, color:"#EF4444", cursor:"pointer", fontWeight:700 }} onClick={()=>setTab("tasks")}>+{urgent.length-3} weitere →</div>}
        </div>
      )}
      <div>
        <SectionTitle>📊 Bereiche</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {catStats.map(c => (
            <Card key={c.id} style={{ borderLeft:`4px solid ${c.color}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <div style={{ fontWeight:700, fontSize:13, color:"#1E293B" }}>{c.icon} {c.label}</div>
                <div style={{ fontSize:12, fontWeight:800, color:c.color }}>{c.pct}%</div>
              </div>
              <div style={{ background:"#F1F5F9", borderRadius:6, height:6, overflow:"hidden" }}>
                <div style={{ width:`${c.pct}%`, height:"100%", background:c.color, borderRadius:6 }} />
              </div>
              <div style={{ fontSize:11, color:"#94A3B8", marginTop:4 }}>{c.done}/{c.total}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function TasksTab({ tasks, setTasks, user }) {
  const [catF, setCatF] = useState("alle");
  const [showDone, setShowDone] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newT, setNewT] = useState({ t:"", cat:"sons", prio:"mittel", owner:"shared", note:"" });
  const filtered = tasks.filter(t => {
    if (!showDone && t.done) return false;
    if (catF!=="alle" && t.cat!==catF) return false;
    return true;
  }).sort((a,b) => {
    if (a.done!==b.done) return a.done?1:-1;
    return ({hoch:0,mittel:1,niedrig:2}[a.prio])-({hoch:0,mittel:1,niedrig:2}[b.prio]);
  });
  const addTask = () => {
    if (!newT.t.trim()) return;
    setTasks(ts=>[...ts,{...newT,id:Date.now(),done:false,week:null}]);
    setNewT({t:"",cat:"sons",prio:"mittel",owner:"shared",note:""});
    setShowAdd(false);
  };
  return (
    <div>
      {showAdd && (
        <div style={{ background:"#fff", borderRadius:20, padding:"18px 16px", border:"2px solid #E8EDFF", marginBottom:14 }}>
          <div style={{ fontWeight:800, color:"#1E293B", marginBottom:12 }}>➕ Neue Aufgabe</div>
          <input value={newT.t} onChange={e=>setNewT(n=>({...n,t:e.target.value}))} placeholder="Was muss getan werden?" onKeyDown={e=>e.key==="Enter"&&addTask()} autoFocus style={{ width:"100%", border:"1px solid #E2E8F0", borderRadius:10, padding:"10px 12px", fontSize:14, marginBottom:10, outline:"none" }} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
            <select value={newT.cat}   onChange={e=>setNewT(n=>({...n,cat:e.target.value}))}   style={sel}>{CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select>
            <select value={newT.prio}  onChange={e=>setNewT(n=>({...n,prio:e.target.value}))}  style={sel}><option value="hoch">🔥 Dringend</option><option value="mittel">🟡 Normal</option><option value="niedrig">🟢 Später</option></select>
            <select value={newT.owner} onChange={e=>setNewT(n=>({...n,owner:e.target.value}))} style={sel}><option value="shared">👥 Gemeinsam</option><option value="S">👩 Sandra</option><option value="J">🧑 Jeronimo</option></select>
          </div>
          <input value={newT.note} onChange={e=>setNewT(n=>({...n,note:e.target.value}))} placeholder="Notiz (optional)" style={{ width:"100%", border:"1px solid #E2E8F0", borderRadius:10, padding:"8px 12px", fontSize:13, marginBottom:12, outline:"none" }} />
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={addTask}             style={{ flex:1, background:USERS[user].color, color:"#fff", border:"none", borderRadius:12, padding:"10px", fontWeight:800, fontSize:14, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>✓ Hinzufügen</button>
            <button onClick={()=>setShowAdd(false)} style={{ flex:1, background:"#F1F5F9", color:"#64748B", border:"none", borderRadius:12, padding:"10px", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"Nunito,sans-serif" }}>✕ Abbrechen</button>
          </div>
        </div>
      )}
      <div style={{ background:"#fff", borderRadius:16, padding:"12px 14px", marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <span style={{ fontWeight:800, fontSize:14, color:"#1E293B" }}>Filter</span>
          {!showAdd && <button onClick={()=>setShowAdd(true)} style={{ background:USERS[user].color, color:"#fff", border:"none", borderRadius:20, padding:"6px 16px", cursor:"pointer", fontWeight:800, fontSize:13, fontFamily:"Nunito,sans-serif" }}>＋ Neue Aufgabe</button>}
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          <Chip active={catF==="alle"} onClick={()=>setCatF("alle")} color="#64748B">Alle</Chip>
          {CATS.map(c=><Chip key={c.id} active={catF===c.id} onClick={()=>setCatF(c.id)} color={c.color}>{c.icon} {c.label}</Chip>)}
        </div>
        <label style={{ display:"flex", alignItems:"center", gap:6, marginTop:10, fontSize:12, color:"#64748B", cursor:"pointer", fontWeight:600 }}>
          <input type="checkbox" checked={showDone} onChange={e=>setShowDone(e.target.checked)} /> Erledigte anzeigen
        </label>
      </div>
      {filtered.map(task => {
        const cat=CATS.find(c=>c.id===task.cat); const p=PRIO[task.prio]; const isExp=expanded===task.id;
        return (
          <div key={task.id} style={{ background:"#fff", borderRadius:16, marginBottom:8, overflow:"hidden", opacity:task.done?0.6:1, border:`1px solid ${task.done?"#F1F5F9":cat?.color+"33"}` }}>
            <div style={{ display:"flex", gap:12, padding:"12px 14px", cursor:"pointer", alignItems:"flex-start" }} onClick={()=>setExpanded(isExp?null:task.id)}>
              <div onClick={e=>{e.stopPropagation();setTasks(ts=>ts.map(t=>t.id===task.id?{...t,done:!t.done}:t));}}
                style={{ width:22,height:22,borderRadius:7,border:`2.5px solid ${task.done?"#CBD5E1":cat?.color}`,background:task.done?"#CBD5E1":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",marginTop:1 }}>
                {task.done&&<span style={{color:"#fff",fontSize:12,fontWeight:900}}>✓</span>}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:700,fontSize:14,color:task.done?"#94A3B8":"#1E293B",textDecoration:task.done?"line-through":"none",lineHeight:1.3 }}>{cat?.icon} {task.t}</div>
                <div style={{ display:"flex",gap:5,marginTop:5,flexWrap:"wrap" }}>
                  <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:p?.bg,color:p?.color }}>{p?.label}</span>
                  {task.week!==null&&<span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:"#EFF6FF",color:"#3B82F6" }}>KW {WEEKS[task.week]?.kw}</span>}
                  {task.owner!=="shared"&&<span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:USERS[task.owner]?.light,color:USERS[task.owner]?.color }}>{USERS[task.owner]?.name}</span>}
                </div>
              </div>
              <span style={{ color:"#CBD5E1",fontSize:10,marginTop:6 }}>{isExp?"▲":"▼"}</span>
            </div>
            {isExp&&(
              <div style={{ padding:"0 14px 14px 48px",borderTop:"1px solid #F8FAFF" }}>
                {task.note&&<div style={{ fontSize:12,color:"#64748B",marginBottom:8,lineHeight:1.5 }}>💬 {task.note}</div>}
                <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                  <select value={task.owner} onChange={e=>setTasks(ts=>ts.map(t=>t.id===task.id?{...t,owner:e.target.value}:t))} style={{ fontSize:11,border:"1px solid #E2E8F0",borderRadius:8,padding:"4px 8px",color:"#475569",fontFamily:"Nunito,sans-serif" }}>
                    <option value="shared">👥 Gemeinsam</option><option value="S">👩 Sandra</option><option value="J">🧑 Jeronimo</option>
                  </select>
                  <select value={task.week??""} onChange={e=>setTasks(ts=>ts.map(t=>t.id===task.id?{...t,week:e.target.value===""?null:+e.target.value}:t))} style={{ fontSize:11,border:"1px solid #E2E8F0",borderRadius:8,padding:"4px 8px",color:"#475569",fontFamily:"Nunito,sans-serif" }}>
                    <option value="">📅 Woche zuweisen</option>
                    {WEEKS.map(w=><option key={w.id} value={w.id}>KW {w.kw} · {w.range}</option>)}
                  </select>
                  <button onClick={()=>setTasks(ts=>ts.filter(t=>t.id!==task.id))} style={{ fontSize:11,border:"1px solid #FECACA",borderRadius:8,padding:"4px 8px",color:"#EF4444",background:"#FEF2F2",cursor:"pointer",fontFamily:"Nunito,sans-serif",fontWeight:600 }}>🗑️</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PlanTab({ tasks, setTasks, user }) {
  const [selWeek,setSelWeek]=useState(0);
  const week=WEEKS[selWeek];
  const weekTasks=tasks.filter(t=>t.week===selWeek);
  const unassigned=tasks.filter(t=>t.week===null&&!t.done);
  return (
    <div>
      <SectionTitle>📅 Wochenplan bis August</SectionTitle>
      <div style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:14 }}>
        {WEEKS.map(w=>(
          <button key={w.id} onClick={()=>setSelWeek(w.id)} style={{ background:selWeek===w.id?USERS[user].color:"#fff",color:selWeek===w.id?"#fff":"#475569",border:`2px solid ${selWeek===w.id?USERS[user].color:"#E2E8F0"}`,borderRadius:14,padding:"8px 14px",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"Nunito,sans-serif",fontWeight:700,fontSize:13 }}>
            <div>KW {w.kw}</div><div style={{ fontSize:10,opacity:0.8 }}>{w.range.split("–")[0].trim()}</div>
          </button>
        ))}
      </div>
      <div style={{ background:"#fff",borderRadius:20,padding:"16px",marginBottom:14,border:`2px solid ${USERS[user].color}33` }}>
        <div style={{ fontWeight:800,color:"#1E293B",marginBottom:2 }}>KW {week?.kw}</div>
        <div style={{ fontSize:12,color:"#94A3B8",marginBottom:12 }}>📅 {week?.range}</div>
        {weekTasks.length===0?<div style={{ textAlign:"center",color:"#CBD5E1",padding:"20px 0",fontSize:13 }}>Noch keine Aufgaben</div>:weekTasks.map(task=>{
          const cat=CATS.find(c=>c.id===task.cat);
          return (
            <div key={task.id} style={{ display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #F8FAFF",alignItems:"center" }}>
              <div onClick={()=>setTasks(ts=>ts.map(t=>t.id===task.id?{...t,done:!t.done}:t))} style={{ width:20,height:20,borderRadius:6,border:`2px solid ${task.done?"#CBD5E1":cat?.color}`,background:task.done?"#CBD5E1":"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}>
                {task.done&&<span style={{color:"#fff",fontSize:11}}>✓</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:700,color:task.done?"#94A3B8":"#1E293B",textDecoration:task.done?"line-through":"none" }}>{cat?.icon} {task.t}</div>
                {task.owner!=="shared"&&<div style={{ fontSize:10,color:USERS[task.owner]?.color,fontWeight:700 }}>{USERS[task.owner]?.name}</div>}
              </div>
              <button onClick={()=>setTasks(ts=>ts.map(t=>t.id===task.id?{...t,week:null}:t))} style={{ fontSize:10,color:"#94A3B8",background:"none",border:"none",cursor:"pointer" }}>✕</button>
            </div>
          );
        })}
      </div>
      {unassigned.length>0&&(
        <div>
          <SectionTitle>📋 Noch nicht eingeplant</SectionTitle>
          {unassigned.map(task=>{
            const cat=CATS.find(c=>c.id===task.cat);
            return (
              <div key={task.id} style={{ background:"#fff",borderRadius:14,padding:"10px 14px",marginBottom:6,display:"flex",gap:10,alignItems:"center",cursor:"pointer",border:"1px solid #E8EDFF" }} onClick={()=>setTasks(ts=>ts.map(t=>t.id===task.id?{...t,week:selWeek}:t))}>
                <span style={{ fontSize:18 }}>{cat?.icon}</span>
                <div style={{ flex:1 }}><div style={{ fontSize:13,fontWeight:700,color:"#1E293B" }}>{task.t}</div></div>
                <span style={{ fontSize:18,color:USERS[user].color }}>＋</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MoneyTab({ savings, setSavings, user, totalSaved, savePct, days }) {
  const [revealed,setRevealed]=useState(false);
  const [phase,setPhase]=useState("locked");
  const [showAdd,setShowAdd]=useState(false);
  const [entry,setEntry]=useState({amount:"",note:""});
  const remaining=Math.max(0,10000-totalSaved);
  const weeksLeft=Math.ceil(days/7);
  const weeklyNeeded=weeksLeft>0?Math.ceil(remaining/weeksLeft):0;
  const reveal=()=>{setPhase("revealing");setTimeout(()=>{setRevealed(true);setPhase("open");},380);};
  const hide=()=>{setPhase("hiding");setTimeout(()=>{setRevealed(false);setPhase("locked");},360);};
  const addEntry=()=>{
    const amt=parseFloat(entry.amount); if(!amt||amt<=0)return;
    setSavings(s=>({...s,entries:[...s.entries,{id:Date.now(),amount:amt,note:entry.note,date:new Date().toLocaleDateString("de"),by:user}]}));
    setEntry({amount:"",note:""});setShowAdd(false);
  };
  const chartData=[
    {label:"Start",total:savings.base},
    ...savings.entries.map((e,i)=>({label:e.date,total:savings.base+savings.entries.slice(0,i+1).reduce((s,x)=>s+x.amount,0)})),
    ...(totalSaved<10000?[{label:"Ziel Aug",total:10000}]:[]),
  ];
  if(!revealed)return(
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:14 }}>
      <div className={phase==="revealing"?"flip-out":"flip-in"} onClick={reveal} style={{ background:"linear-gradient(135deg,#4F46E5 0%,#7C3AED 55%,#DB2777 100%)",borderRadius:28,padding:"44px 36px",textAlign:"center",cursor:"pointer",color:"#fff",width:"100%",maxWidth:320,boxShadow:"0 20px 60px rgba(79,70,229,0.35)",userSelect:"none" }}>
        <div style={{ fontSize:64,marginBottom:18 }}>🔒</div>
        <div style={{ fontWeight:900,fontSize:24,marginBottom:6 }}>Ersparnisse</div>
        <div style={{ opacity:0.75,fontSize:13,lineHeight:1.6,marginBottom:22 }}>Privat · Nur für Sandra & Jeronimo</div>
        <div style={{ background:"rgba(255,255,255,0.18)",borderRadius:50,padding:"11px 28px",display:"inline-flex",alignItems:"center",gap:8,fontWeight:800,fontSize:14,border:"1px solid rgba(255,255,255,0.25)" }}>Aufdecken →</div>
      </div>
      <div style={{ fontSize:12,color:"#7C8DB5",fontWeight:600 }}>Tippe auf die Karte zum Anzeigen</div>
    </div>
  );
  return(
    <div className={phase==="hiding"?"flip-out":"flip-in"}>
      <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:12 }}>
        <button onClick={hide} style={{ background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:20,padding:"6px 16px",cursor:"pointer",fontSize:12,fontWeight:800,color:"#64748B",fontFamily:"Nunito,sans-serif" }}>🔒 Verbergen</button>
      </div>
      <div style={{ background:"linear-gradient(135deg,#F59E0B,#D97706)",borderRadius:24,padding:"22px 22px",color:"#fff",marginBottom:14 }}>
        <div style={{ fontSize:13,opacity:0.85,marginBottom:4 }}>💰 Unser Sparziel</div>
        <div style={{ fontWeight:900,fontSize:32,marginBottom:2 }}>{totalSaved.toLocaleString("de")}€</div>
        <div style={{ opacity:0.8,fontSize:13,marginBottom:16 }}>von 10.000€ Ziel bis 1. August</div>
        <div style={{ background:"rgba(255,255,255,0.25)",borderRadius:12,height:14,overflow:"hidden",marginBottom:6 }}>
          <div style={{ height:"100%",width:`${savePct}%`,background:"#fff",borderRadius:12,transition:"width 0.5s" }} />
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:13 }}>
          <span style={{ opacity:0.85 }}>Noch {remaining.toLocaleString("de")}€ fehlen</span>
          <span style={{ fontWeight:800 }}>{savePct}%</span>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14 }}>
        <Card style={{ textAlign:"center" }}><div style={{ fontSize:10,color:"#94A3B8",fontWeight:700,marginBottom:4 }}>TAGE</div><div style={{ fontSize:22,fontWeight:900,color:"#1E293B" }}>{days}</div></Card>
        <Card style={{ textAlign:"center" }}><div style={{ fontSize:10,color:"#94A3B8",fontWeight:700,marginBottom:4 }}>WOCHEN</div><div style={{ fontSize:22,fontWeight:900,color:"#1E293B" }}>{weeksLeft}</div></Card>
        <Card style={{ textAlign:"center",background:"#FFFBEB" }}><div style={{ fontSize:10,color:"#92400E",fontWeight:700,marginBottom:4 }}>PRO WOCHE</div><div style={{ fontSize:22,fontWeight:900,color:"#F59E0B" }}>{weeklyNeeded}€</div></Card>
      </div>
      {chartData.length>1&&(
        <Card style={{ marginBottom:14 }}>
          <div style={{ fontWeight:800,color:"#1E293B",marginBottom:12 }}>📈 Spar-Verlauf</div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/><stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="label" tick={{fontSize:10,fill:"#94A3B8"}}/>
              <YAxis tick={{fontSize:10,fill:"#94A3B8"}} domain={[0,10000]}/>
              <Tooltip formatter={v=>[`${v.toLocaleString("de")}€`]}/>
              <Area type="monotone" dataKey="total" stroke="#F59E0B" fill="url(#sg)" strokeWidth={2.5} dot={{fill:"#F59E0B",r:4}}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}
      <Card style={{ marginBottom:14 }}>
        <div style={{ fontWeight:800,color:"#1E293B",marginBottom:10 }}>📋 Einzahlungen</div>
        <div style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #F1F5F9",fontSize:13 }}>
          <span style={{ color:"#64748B" }}>🏦 Startkapital</span>
          <span style={{ fontWeight:800,color:"#10B981" }}>+{savings.base.toLocaleString("de")}€</span>
        </div>
        {savings.entries.map(e=>(
          <div key={e.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #F1F5F9" }}>
            <div><div style={{ fontSize:13,fontWeight:700,color:"#1E293B" }}>{e.note||"Gespart"}</div><div style={{ fontSize:11,color:"#94A3B8" }}>{e.date} · {USERS[e.by]?.name}</div></div>
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              <span style={{ fontWeight:800,color:"#10B981",fontSize:14 }}>+{e.amount.toLocaleString("de")}€</span>
              <button onClick={()=>setSavings(s=>({...s,entries:s.entries.filter(x=>x.id!==e.id)}))} style={{ fontSize:12,color:"#94A3B8",background:"none",border:"none",cursor:"pointer" }}>✕</button>
            </div>
          </div>
        ))}
      </Card>
      {showAdd?(
        <Card>
          <div style={{ fontWeight:800,marginBottom:12,color:"#1E293B" }}>💰 Betrag hinzufügen</div>
          <input type="number" value={entry.amount} onChange={e=>setEntry(n=>({...n,amount:e.target.value}))} placeholder="Betrag in €" style={{ width:"100%",border:"1px solid #E2E8F0",borderRadius:10,padding:"10px 12px",fontSize:15,marginBottom:10,outline:"none",fontFamily:"Nunito,sans-serif" }}/>
          <input value={entry.note} onChange={e=>setEntry(n=>({...n,note:e.target.value}))} placeholder="Notiz (z.B. Mai-Gehalt)" style={{ width:"100%",border:"1px solid #E2E8F0",borderRadius:10,padding:"10px 12px",fontSize:14,marginBottom:12,outline:"none",fontFamily:"Nunito,sans-serif" }}/>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={addEntry} style={{ flex:1,background:"#F59E0B",color:"#fff",border:"none",borderRadius:12,padding:"10px",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"Nunito,sans-serif" }}>Speichern</button>
            <button onClick={()=>setShowAdd(false)} style={{ flex:1,background:"#F1F5F9",color:"#64748B",border:"none",borderRadius:12,padding:"10px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"Nunito,sans-serif" }}>Abbrechen</button>
          </div>
        </Card>
      ):(
        <button onClick={()=>setShowAdd(true)} style={{ width:"100%",background:"#F59E0B",color:"#fff",border:"none",borderRadius:16,padding:"14px",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"Nunito,sans-serif" }}>＋ Betrag hinzufügen</button>
      )}
    </div>
  );
}

function ChatTab({ msgs, setMsgs, user }) {
  const [text,setText]=useState("");
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  const send=()=>{if(!text.trim())return;setMsgs(m=>[...m,{id:Date.now(),from:user,text:text.trim(),ts:Date.now()}]);setText("");};
  const fmt=ts=>{const d=new Date(ts);return `${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`;};
  return(
    <div style={{ display:"flex",flexDirection:"column",height:"calc(100vh - 200px)" }}>
      <div style={{ background:"#fff",borderRadius:20,padding:"12px 16px",marginBottom:12,textAlign:"center" }}>
        <span style={{ fontSize:12,color:"#94A3B8",fontWeight:600 }}>💬 Sandra & Jeronimo · Live-Sync ✅</span>
      </div>
      <div style={{ flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:8,paddingBottom:8 }}>
        {msgs.map(m=>{
          const isMe=m.from===user; const u=USERS[m.from];
          return(
            <div key={m.id} style={{ display:"flex",flexDirection:isMe?"row-reverse":"row",gap:8,alignItems:"flex-end" }}>
              <span style={{ fontSize:20,flexShrink:0 }}>{u.emoji}</span>
              <div style={{ maxWidth:"70%" }}>
                <div style={{ fontSize:10,color:"#94A3B8",fontWeight:700,marginBottom:3,textAlign:isMe?"right":"left" }}>{u.name}</div>
                <div style={{ background:isMe?u.color:"#fff",color:isMe?"#fff":"#1E293B",borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px",fontSize:14,fontWeight:600,lineHeight:1.4,border:isMe?"none":"1px solid #E8EDFF",boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>{m.text}</div>
                <div style={{ fontSize:10,color:"#CBD5E1",marginTop:3,textAlign:isMe?"right":"left" }}>{fmt(m.ts)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>
      <div style={{ display:"flex",gap:8,background:"#fff",borderRadius:20,padding:"8px 8px 8px 14px",border:`2px solid ${USERS[user].color}44`,marginTop:8 }}>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={`Nachricht an ${user==="S"?"Jeronimo":"Sandra"}...`} style={{ flex:1,border:"none",outline:"none",fontSize:14,fontFamily:"Nunito,sans-serif",background:"transparent",color:"#1E293B" }}/>
        <button onClick={send} style={{ background:USERS[user].color,border:"none",borderRadius:14,width:40,height:40,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>➤</button>
      </div>
    </div>
  );
}

function DocsTab({ docs, setDocs, user }) {
  const [openFolder,setOpenFolder]=useState(null);
  const [note,setNote]=useState("");
  const fileRef=useRef(null);
  const folder=FOLDERS.find(f=>f.id===openFolder);
  const handleFile=e=>{
    const file=e.target.files[0]; if(!file)return;
    if(file.size>2*1024*1024){alert("Max 2MB");return;}
    const reader=new FileReader();
    reader.onload=ev=>{setDocs(d=>[...d,{id:Date.now(),name:file.name,folder:openFolder,type:file.type,data:ev.target.result,note,by:user,date:new Date().toLocaleDateString("de")}]);setNote("");};
    reader.readAsDataURL(file); e.target.value="";
  };
  const folderDocs=fid=>docs.filter(d=>d.folder===fid);
  if(!openFolder)return(
    <div>
      <SectionTitle>📁 Dokumente & Angebote</SectionTitle>
      <div style={{ background:"#EFF6FF",borderRadius:14,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#3B82F6",fontWeight:600 }}>💡 Fotos, Screenshots, Angebote – alles hier ablegen!</div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
        {FOLDERS.map(f=>{
          const count=folderDocs(f.id).length;
          return(
            <Card key={f.id} style={{ cursor:"pointer",border:count>0?"2px solid #4FACFE33":"1px solid #F1F5F9" }} onClick={()=>setOpenFolder(f.id)}>
              <div style={{ fontSize:28,marginBottom:6 }}>{f.icon}</div>
              <div style={{ fontWeight:800,fontSize:14,color:"#1E293B",marginBottom:2 }}>{f.label}</div>
              <div style={{ fontSize:12,color:count>0?"#3B82F6":"#94A3B8",fontWeight:600 }}>{count} Datei{count!==1?"en":""}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
  const fd=folderDocs(openFolder);
  return(
    <div>
      <button onClick={()=>setOpenFolder(null)} style={{ background:"none",border:"none",color:"#4FACFE",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:12,fontFamily:"Nunito,sans-serif" }}>← Alle Ordner</button>
      <div style={{ fontWeight:900,fontSize:18,color:"#1E293B",marginBottom:14 }}>{folder?.icon} {folder?.label}</div>
      <div style={{ background:"#fff",borderRadius:16,padding:"14px",marginBottom:14,border:"2px dashed #E2E8F0" }}>
        <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Beschriftung (optional)" style={{ width:"100%",border:"1px solid #E2E8F0",borderRadius:10,padding:"8px 12px",fontSize:13,marginBottom:10,outline:"none",fontFamily:"Nunito,sans-serif" }}/>
        <button onClick={()=>fileRef.current?.click()} style={{ width:"100%",background:USERS[user].color,color:"#fff",border:"none",borderRadius:12,padding:"10px",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"Nunito,sans-serif" }}>📎 Foto / Datei hinzufügen</button>
        <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:"none" }} onChange={handleFile}/>
      </div>
      {fd.length===0?<div style={{ textAlign:"center",color:"#CBD5E1",padding:30,fontSize:13 }}>Noch keine Dateien</div>:fd.map(doc=>(
        <div key={doc.id} style={{ background:"#fff",borderRadius:16,padding:"12px 14px",marginBottom:10,border:"1px solid #F1F5F9" }}>
          <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
            {doc.type?.startsWith("image")?<img src={doc.data} alt={doc.name} style={{ width:60,height:60,borderRadius:10,objectFit:"cover",flexShrink:0 }}/>:<div style={{ width:60,height:60,background:"#FEF2F2",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0 }}>📄</div>}
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontWeight:700,fontSize:13,color:"#1E293B",marginBottom:2 }}>{doc.note||doc.name}</div>
              <div style={{ fontSize:11,color:"#94A3B8" }}>{doc.date} · {USERS[doc.by]?.name}</div>
            </div>
            <button onClick={()=>setDocs(d=>d.filter(x=>x.id!==doc.id))} style={{ color:"#94A3B8",background:"none",border:"none",cursor:"pointer",fontSize:14,flexShrink:0 }}>🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Card({children,style,onClick}){return <div onClick={onClick} style={{ background:"#fff",borderRadius:18,padding:"14px 16px",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",border:"1px solid #F1F5F9",...style }}>{children}</div>;}
function SectionTitle({children}){return <div style={{ fontWeight:800,fontSize:15,color:"#475569",marginBottom:10,marginTop:4 }}>{children}</div>;}
function Chip({children,active,onClick,color}){return <button onClick={onClick} style={{ background:active?(color+"22"):"#F8FAFF",color:active?color:"#64748B",border:`1.5px solid ${active?color+"66":"transparent"}`,borderRadius:20,padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:"Nunito,sans-serif",fontWeight:700,whiteSpace:"nowrap" }}>{children}</button>;}
const sel={border:"1px solid #E2E8F0",borderRadius:10,padding:"8px 10px",fontSize:13,fontFamily:"Nunito,sans-serif"};
