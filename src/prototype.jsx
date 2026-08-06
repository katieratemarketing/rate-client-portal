import { useState, useMemo, useRef, useEffect, useCallback } from "react";

/* ══════════════════════════════════════════════
   TOKENS
   ══════════════════════════════════════════════ */
const R = { black:"#0f0f0f", white:"#ffffff", grey:"#f5f5f5", mid:"#e4e4e7", dark:"#71717a", lime:"#c8e63e", bg:"#fafafa" };

const DEFAULT_AREAS = {
  ulverscroft:{label:"Ulverscroft",color:"#1e4d91",short:"ULV"},
  ulibrary:{label:"uLibrary",color:"#5a9de6",short:"uLIB"},
  readinghouse:{label:"The Reading House",color:"#9b1b1b",short:"TRH"},
  trade:{label:"Trade",color:"#6b7280",short:"TRD"},
};

const CH = {social:{l:"Social",i:"📱"},email:{l:"Email",i:"✉️"},blog:{l:"Blog",i:"📝"},campaign:{l:"Campaign",i:"🚀"},pr:{l:"PR",i:"📰"},web:{l:"Web",i:"🌐"}};

const ST = {
  wip:{l:"In Progress",c:"#a1a1aa",bg:"#f4f4f5"},
  review:{l:"Ready for Review",c:"#f59e42",bg:"#fff7ed"},
  input:{l:"Awaiting Client Input",c:"#ef4444",bg:"#fef2f2"},
  approved:{l:"Approved",c:"#22c55e",bg:"#f0fdf4"},
  live:{l:"Live",c:"#3b82f6",bg:"#eff6ff"},
};

const DEFAULT_THEMES = {
  christie:{l:"Agatha Christie Exhibition",c:"#7c3aed"},
  booklovers:{l:"National Book Lovers Day",c:"#ec4899"},
  b2s:{l:"Back to School",c:"#06b6d4"},
  newrelease:{l:"August New Releases",c:"#f97316"},
};

const DEFAULT_EVENTS = [
  {id:"k1",title:"Agatha Christie — London Museum",start:"2026-08-01",end:"2026-10-31",areas:["ulverscroft","trade"],notes:"Major tentpole. Social series, blog, trade press."},
  {id:"k2",title:"National Book Lovers Day",start:"2026-08-09",end:"2026-08-09",areas:["ulverscroft","readinghouse","ulibrary"],notes:"Cross-brand. Pre-schedule by 7th."},
  {id:"k3",title:"Spark Expo Australia",start:"2026-08-04",end:"2026-08-06",areas:["ulibrary","trade"],notes:"Trade event. uLibrary demo."},
  {id:"k4",title:"Back to School window",start:"2026-08-17",end:"2026-08-31",areas:["ulibrary","readinghouse"],notes:"Target schools and libraries."},
];

const DEFAULT_STRAT = {
  ulverscroft:{focus:"Leverage the Agatha Christie exhibition as a tentpole moment. Spotlight new releases through weekly social features.",audience:"Library authorities, general readers (50+), visually impaired readers",kpis:["Social engagement +15% vs July","Email open rate >30%","Blog traffic +20%"],channels:"Instagram, Facebook, X, Kit, Website blog",tone:"Warm, accessible, trusted.",msg:"The world's best stories, made accessible to everyone."},
  ulibrary:{focus:"Drive retention through Book Club engagement. Launch Back to School campaign targeting education sector.",audience:"School librarians, education buyers, digital subscribers",kpis:["Newsletter opens >35%","Back to School: 50 trial sign-ups","Retention >85%"],channels:"LinkedIn, Instagram, Kit, Landing pages",tone:"Modern, digital-first, practical.",msg:"The digital library that readers actually use."},
  readinghouse:{focus:"Build consistent social presence with behind-the-scenes content. Monthly digest for footfall.",audience:"Local readers, gift buyers, community book lovers",kpis:["Social following +200","Email list +50","Reel views avg >1k"],channels:"Instagram, TikTok, Facebook, Kit",tone:"Friendly, personal, cosy.",msg:"Your local bookshop, with something for everyone."},
  trade:{focus:"Autumn catalogue distribution. Pitch Christie exhibition angle to The Bookseller.",audience:"Audible, Bolinda, W.F. Howes, trade press",kpis:["1 feature in The Bookseller","Catalogue to all partners","2 new enquiries"],channels:"Email (direct), Trade press",tone:"Professional, concise, industry-fluent.",msg:"The partner publishers choose for accessible formats."},
};

const DEFAULT_ITEMS = [
  {id:1,date:"2026-08-03",area:"ulverscroft",ch:"social",title:"Shadow of the Wind – carousel",state:"approved",platform:"IG / FB",notes:"Cover art + pull quotes",theme:"newrelease",url:""},
  {id:2,date:"2026-08-05",area:"ulibrary",ch:"email",title:"August Book Club newsletter",state:"review",platform:"Kit",notes:"Black History Month feature",theme:"",url:""},
  {id:3,date:"2026-08-06",area:"ulibrary",ch:"social",title:"Library of the Month announcement",state:"input",platform:"IG / LinkedIn",notes:"Need title confirmation from Daniel",theme:"",url:""},
  {id:4,date:"2026-08-07",area:"ulverscroft",ch:"social",title:"Christie LP spotlight",state:"review",platform:"IG / X",notes:"Large print editions tie-in",theme:"christie",url:""},
  {id:5,date:"2026-08-07",area:"ulverscroft",ch:"blog",title:"Christie — reading guide",state:"wip",platform:"Website",notes:"Curated LP Christie titles",theme:"christie",url:""},
  {id:6,date:"2026-08-09",area:"readinghouse",ch:"social",title:"Book Lovers Day — staff picks reel",state:"review",platform:"IG / TikTok",notes:"Team picks filmed in-store",theme:"booklovers",url:""},
  {id:7,date:"2026-08-09",area:"ulverscroft",ch:"email",title:"Book Lovers Day — reader email",state:"wip",platform:"Kit",notes:"Curated list + offer code",theme:"booklovers",url:""},
  {id:8,date:"2026-08-11",area:"ulibrary",ch:"email",title:"uLibrary Monthly Update",state:"wip",platform:"Kit",notes:"Usage stats, retention",theme:"",url:""},
  {id:9,date:"2026-08-13",area:"trade",ch:"email",title:"Trade catalogue — Autumn titles",state:"approved",platform:"Email",notes:"Sent to Audible, Bolinda",theme:"",url:""},
  {id:10,date:"2026-08-18",area:"ulverscroft",ch:"social",title:"Land by Maggie O'Farrell",state:"wip",platform:"IG / FB",notes:"Review quote post",theme:"newrelease",url:""},
  {id:11,date:"2026-08-25",area:"ulibrary",ch:"campaign",title:"Back to School — outreach",state:"review",platform:"Email + LP",notes:"School librarians, free trial",theme:"b2s",url:""},
  {id:12,date:"2026-08-28",area:"ulverscroft",ch:"email",title:"Book of the Week — Honesty",state:"review",platform:"Kit",notes:"Carried from July series",theme:"",url:""},
];

/* ══════════════════════════════════════════════
   STORAGE (shared = true → single source of truth)
   ══════════════════════════════════════════════ */
const STORAGE_KEY = "rate-portal-ulverscroft";

async function saveAll(data) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(data), true); } catch(e) { console.error("Save failed", e); }
}

async function loadAll() {
  try {
    const r = await window.storage.get(STORAGE_KEY, true);
    return r ? JSON.parse(r.value) : null;
  } catch(e) { return null; }
}

/* ══════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════ */
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function mkGrid(y,m){const f=new Date(y,m,1),l=new Date(y,m+1,0);let s=f.getDay()===0?6:f.getDay()-1;const d=[];for(let i=0;i<s;i++)d.push(null);for(let i=1;i<=l.getDate();i++)d.push(i);while(d.length%7)d.push(null);return d;}
function fd(y,m,d){return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;}
function nextId(items){return items.length?Math.max(...items.map(i=>i.id))+1:1;}

/* ══════════════════════════════════════════════
   MICRO COMPONENTS
   ══════════════════════════════════════════════ */
function Dot({c, s = 8}) {
  return (<span style={{display:"inline-block",width:s,height:s,borderRadius:"50%",background:c,flexShrink:0}}/>);
}
function ATag({a, areas, sm}) {
  const v = (areas||DEFAULT_AREAS)[a]; if(!v) return null;
  return (<span style={{display:"inline-flex",alignItems:"center",gap:3,background:v.color+"12",color:v.color,padding:sm?"1px 6px":"2px 8px",borderRadius:6,fontSize:sm?9:10,fontWeight:700,letterSpacing:.3}}><Dot c={v.color} s={5}/>{v.short}</span>);
}
function SBadge({s}) {
  const v = ST[s]; if(!v) return null;
  return (<span style={{display:"inline-flex",alignItems:"center",gap:5,background:v.bg,color:v.c,padding:"3px 10px",borderRadius:8,fontSize:10,fontWeight:600}}><span style={{width:7,height:7,borderRadius:"50%",background:v.c}}/>{v.l}</span>);
}
function TTag({t, themes}) {
  if (!t) return null; const v = (themes||DEFAULT_THEMES)[t]; if(!v) return null;
  return (<span style={{display:"inline-flex",alignItems:"center",gap:4,background:v.c+"10",color:v.c,padding:"2px 8px",borderRadius:6,fontSize:9,fontWeight:600,border:`1px dashed ${v.c}30`}}><span style={{width:4,height:4,borderRadius:"50%",background:v.c}}/>{v.l}</span>);
}
function Eyebrow({children}) {
  return (<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{width:20,height:2,background:R.lime,borderRadius:1}}/><span style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:R.dark}}>{children}</span></div>);
}

/* ══════════════════════════════════════════════
   MODAL WRAPPER
   ══════════════════════════════════════════════ */
function Modal({open, onClose, title, children}) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:R.white,borderRadius:16,width:"100%",maxWidth:480,maxHeight:"85vh",overflow:"auto",padding:24}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 style={{fontSize:16,fontWeight:800,margin:0,color:R.black}}>{title}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:R.dark}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   FORM FIELD
   ══════════════════════════════════════════════ */
function Field({label, children}) {
  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:10,fontWeight:700,color:R.dark,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{label}</div>
      {children}
    </div>
  );
}
const inputStyle = {width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${R.mid}`,fontSize:12,fontFamily:"inherit",boxSizing:"border-box"};
const selectStyle = {...inputStyle, background:R.white};

/* ══════════════════════════════════════════════
   ITEM FORM (add + edit)
   ══════════════════════════════════════════════ */
function ItemForm({item, areas, themes, onSave, onDelete, onCancel}) {
  const [f, setF] = useState(item || {title:"",date:"2026-08-15",area:Object.keys(areas)[0],ch:"social",state:"wip",platform:"",notes:"",theme:"",url:""});
  const upd = (k,v) => setF(p=>({...p,[k]:v}));

  return (
    <div>
      <Field label="Title"><input style={inputStyle} value={f.title} onChange={e=>upd("title",e.target.value)} placeholder="e.g. Christie LP spotlight"/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Date"><input type="date" style={inputStyle} value={f.date} onChange={e=>upd("date",e.target.value)}/></Field>
        <Field label="Status">
          <select style={selectStyle} value={f.state} onChange={e=>upd("state",e.target.value)}>
            {Object.entries(ST).map(([k,v])=>(<option key={k} value={k}>{v.l}</option>))}
          </select>
        </Field>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Brand">
          <select style={selectStyle} value={f.area} onChange={e=>upd("area",e.target.value)}>
            {Object.entries(areas).map(([k,v])=>(<option key={k} value={k}>{v.label}</option>))}
          </select>
        </Field>
        <Field label="Channel">
          <select style={selectStyle} value={f.ch} onChange={e=>upd("ch",e.target.value)}>
            {Object.entries(CH).map(([k,v])=>(<option key={k} value={k}>{v.l}</option>))}
          </select>
        </Field>
      </div>
      <Field label="Platform"><input style={inputStyle} value={f.platform} onChange={e=>upd("platform",e.target.value)} placeholder="e.g. IG / Facebook"/></Field>
      <Field label="Notes"><textarea style={{...inputStyle,minHeight:60,resize:"vertical"}} value={f.notes} onChange={e=>upd("notes",e.target.value)}/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Theme (optional)">
          <select style={selectStyle} value={f.theme||""} onChange={e=>upd("theme",e.target.value)}>
            <option value="">None</option>
            {Object.entries(themes).map(([k,v])=>(<option key={k} value={k}>{v.l}</option>))}
          </select>
        </Field>
        <Field label="Output URL"><input style={inputStyle} value={f.url||""} onChange={e=>upd("url",e.target.value)} placeholder="https://..."/></Field>
      </div>
      <div style={{display:"flex",gap:8,marginTop:16}}>
        <button onClick={()=>onSave(f)} style={{flex:1,background:R.lime,color:R.black,border:"none",borderRadius:10,padding:"10px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>{item?"Save Changes":"Add Item"}</button>
        <button onClick={onCancel} style={{padding:"10px 16px",background:R.white,color:R.dark,border:`1px solid ${R.mid}`,borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>Cancel</button>
        {item && onDelete && (<button onClick={()=>onDelete(item.id)} style={{padding:"10px 16px",background:R.white,color:"#ef4444",border:"1px solid #ef4444",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>Delete</button>)}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CHANNEL DROPDOWN
   ══════════════════════════════════════════════ */
function ChDrop({value, onChange}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const label = value ? `${CH[value].i} ${CH[value].l}` : "All channels";
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(!open)} style={{padding:"5px 12px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",background:R.white,color:value?R.black:R.dark,border:`1px solid ${R.mid}`,display:"flex",alignItems:"center",gap:4}}>
        {label} <span style={{fontSize:8,marginLeft:2}}>▾</span>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"100%",left:0,marginTop:4,zIndex:50,background:R.white,borderRadius:12,border:`1px solid ${R.mid}`,boxShadow:"0 8px 24px rgba(0,0,0,.1)",overflow:"hidden",minWidth:160}}>
          <button onClick={()=>{onChange(null);setOpen(false);}} style={{display:"block",width:"100%",padding:"8px 14px",border:"none",cursor:"pointer",background:!value?R.grey:R.white,fontSize:11,fontWeight:600,color:R.black,textAlign:"left"}}>All channels</button>
          {Object.entries(CH).map(([k,c])=>(
            <button key={k} onClick={()=>{onChange(k);setOpen(false);}} style={{display:"block",width:"100%",padding:"8px 14px",border:"none",cursor:"pointer",background:value===k?R.grey:R.white,fontSize:11,fontWeight:500,color:R.black,textAlign:"left"}}>{c.i}  {c.l}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   STRATEGY VIEW
   ══════════════════════════════════════════════ */
function StrategyView({strat, areas, fArea, admin, onEditStrat}) {
  const areaKeys = fArea ? [fArea] : Object.keys(strat);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState(null);

  function startEdit(ak) {
    setEditing(ak);
    setEditData({...strat[ak], kpis: [...strat[ak].kpis]});
  }
  function saveEdit() {
    onEditStrat(editing, editData);
    setEditing(null);
  }

  return (
    <div style={{maxWidth:720}}>
      <div style={{background:R.black,borderRadius:16,padding:"20px 24px",marginBottom:24,color:R.white}}>
        <Eyebrow>This Month</Eyebrow>
        <p style={{fontSize:13,lineHeight:1.7,margin:0,color:"#bbb"}}>
          Leverage the Agatha Christie exhibition as a tentpole across Ulverscroft and Trade. Drive uLibrary retention through Book Club engagement. Build consistent social presence for The Reading House.
        </p>
      </div>
      {areaKeys.map(ak=>{
        const a=areas[ak],s=strat[ak]; if(!a||!s) return null;
        const isEditing = editing === ak;
        return (
          <div key={ak} style={{background:R.white,borderRadius:16,marginBottom:16,border:`1px solid ${R.mid}`,overflow:"hidden"}}>
            <div style={{background:a.color,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:15,fontWeight:800,color:R.white}}>{a.label}</span>
              {admin&&!isEditing&&(<button onClick={()=>startEdit(ak)} style={{background:"rgba(255,255,255,.2)",color:R.white,border:"none",borderRadius:6,padding:"4px 10px",fontSize:10,fontWeight:600,cursor:"pointer"}}>Edit</button>)}
            </div>
            <div style={{padding:"18px 20px"}}>
              {isEditing ? (
                <div>
                  {[["focus","Focus"],["audience","Audience"],["tone","Tone"],["msg","Key Message"],["channels","Channels"]].map(([k,l])=>(
                    <Field key={k} label={l}><textarea style={{...inputStyle,minHeight:k==="focus"?60:36,resize:"vertical"}} value={editData[k]} onChange={e=>setEditData(p=>({...p,[k]:e.target.value}))}/></Field>
                  ))}
                  <Field label="KPIs (one per line)">
                    <textarea style={{...inputStyle,minHeight:60,resize:"vertical"}} value={editData.kpis.join("\n")} onChange={e=>setEditData(p=>({...p,kpis:e.target.value.split("\n")}))}/>
                  </Field>
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <button onClick={saveEdit} style={{background:R.lime,color:R.black,border:"none",borderRadius:8,padding:"8px 16px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Save</button>
                    <button onClick={()=>setEditing(null)} style={{background:R.white,color:R.dark,border:`1px solid ${R.mid}`,borderRadius:8,padding:"8px 16px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Cancel</button>
                  </div>
                </div>
              ) : (
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <tbody>
                    {[["Focus",s.focus],["Audience",s.audience],["Tone",s.tone],["Key Message",s.msg],["Channels",s.channels]].map(([l,v])=>(
                      <tr key={l}><td style={{fontWeight:700,color:R.black,padding:"8px 16px 8px 0",verticalAlign:"top",width:110,borderBottom:`1px solid ${R.grey}`}}>{l}</td><td style={{color:R.dark,padding:"8px 0",lineHeight:1.6,borderBottom:`1px solid ${R.grey}`}}>{v}</td></tr>
                    ))}
                    <tr><td style={{fontWeight:700,color:R.black,padding:"8px 16px 8px 0",verticalAlign:"top"}}>KPIs</td><td style={{padding:"8px 0"}}>{s.kpis.map((k,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,fontSize:12,color:R.dark}}><Dot c={a.color} s={6}/>{k}</div>))}</td></tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════
   KEY DATES
   ══════════════════════════════════════════════ */
function KeyDatesView({events, areas}) {
  return (
    <div style={{maxWidth:680}}>
      <Eyebrow>Key Dates</Eyebrow>
      <h2 style={{fontSize:22,fontWeight:800,color:R.black,margin:"0 0 20px",letterSpacing:-.5}}>What's coming up.</h2>
      {[...events].sort((a,b)=>new Date(a.start)-new Date(b.start)).map(ev=>{
        const s=new Date(ev.start),e=new Date(ev.end),same=ev.start===ev.end;
        return (
          <div key={ev.id} style={{display:"flex",gap:14,padding:"16px 0",borderBottom:`1px solid ${R.mid}`}}>
            <div style={{minWidth:50,background:R.black,color:R.white,borderRadius:10,padding:"8px 10px",textAlign:"center",alignSelf:"flex-start"}}>
              <div style={{fontSize:8,fontWeight:600,opacity:.5,letterSpacing:.5}}>{same?DAYS[(s.getDay()||7)-1].toUpperCase():"FROM"}</div>
              <div style={{fontSize:20,fontWeight:800}}>{s.getDate()}</div>
              <div style={{fontSize:8,opacity:.5}}>{MN[s.getMonth()]}</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:R.black,marginBottom:4}}>{ev.title}</div>
              <div style={{fontSize:10,color:R.dark,marginBottom:6}}>{same?s.toLocaleDateString("en-GB",{day:"numeric",month:"long"}):`${s.toLocaleDateString("en-GB",{day:"numeric",month:"short"})} – ${e.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}`}</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>{ev.areas.map(a=>(<ATag key={a} a={a} areas={areas} sm/>))}</div>
              <div style={{fontSize:11,color:R.dark,lineHeight:1.5}}>{ev.notes}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════
   APPROVALS
   ══════════════════════════════════════════════ */
function ApprovalsView({items, areas, themes, onApprove}) {
  const rv=items.filter(i=>i.state==="review"), ip=items.filter(i=>i.state==="input");
  return (
    <div style={{maxWidth:680}}>
      {ip.length>0&&(
        <div style={{marginBottom:28}}>
          <Eyebrow>Action Required</Eyebrow>
          <h3 style={{fontSize:15,fontWeight:700,color:"#ef4444",margin:"0 0 12px"}}>Awaiting your input ({ip.length})</h3>
          {ip.map(item=>(
            <div key={item.id} style={{background:"#fef2f2",borderRadius:12,padding:"14px 16px",marginBottom:8,borderLeft:"3px solid #ef4444",display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:R.black}}>{item.title}</div><div style={{fontSize:10,color:R.dark,marginTop:2}}>{item.notes}</div></div>
              <ATag a={item.area} areas={areas} sm/>
            </div>
          ))}
        </div>
      )}
      <Eyebrow>Review</Eyebrow>
      <h3 style={{fontSize:15,fontWeight:700,color:R.black,margin:"0 0 12px"}}>Ready for sign-off ({rv.length})</h3>
      {rv.length===0&&(<div style={{fontSize:12,color:R.dark,padding:24,textAlign:"center",background:R.white,borderRadius:12}}>All caught up — nothing to review.</div>)}
      {rv.map(item=>(
        <div key={item.id} style={{background:R.white,borderRadius:12,padding:"16px 18px",marginBottom:10,border:`1px solid ${R.mid}`,borderLeft:`3px solid ${(areas[item.area]||{}).color||R.dark}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:R.black,marginBottom:4}}>{item.title}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}><ATag a={item.area} areas={areas} sm/><span style={{fontSize:10,color:R.dark}}>{(CH[item.ch]||{}).i} {(CH[item.ch]||{}).l}</span><TTag t={item.theme} themes={themes}/></div>
            </div>
            <span style={{fontSize:10,color:R.dark,whiteSpace:"nowrap"}}>{new Date(item.date).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</span>
          </div>
          <div style={{fontSize:11,color:R.dark,marginBottom:4}}><strong>Platform:</strong> {item.platform}</div>
          <div style={{fontSize:11,color:R.dark,marginBottom:12}}><strong>Notes:</strong> {item.notes}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>onApprove(item.id,"approved")} style={{background:R.lime,color:R.black,border:"none",borderRadius:8,padding:"8px 16px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Approve</button>
            <button onClick={()=>onApprove(item.id,"input")} style={{background:R.white,color:"#ef4444",border:"1px solid #ef4444",borderRadius:8,padding:"8px 16px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Request Changes</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SIDE PANEL
   ══════════════════════════════════════════════ */
function Panel({item, items, areas, themes, admin, onClose, onApprove, onEdit}) {
  if(!item) return null;
  const a = (areas||{})[item.area]||{color:R.dark};
  const linked = item.theme ? items.filter(i=>i.theme===item.theme&&i.id!==item.id) : [];

  return (
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:360,background:R.white,borderLeft:`1px solid ${R.mid}`,boxShadow:"-8px 0 32px rgba(0,0,0,.08)",zIndex:100,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 20px 12px",borderBottom:`1px solid ${R.mid}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
            <ATag a={item.area} areas={areas}/>
            <span style={{fontSize:10,color:R.dark}}>{(CH[item.ch]||{}).i} {(CH[item.ch]||{}).l}</span>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:R.dark,padding:0,lineHeight:1}}>×</button>
        </div>
        <h3 style={{fontSize:15,fontWeight:700,color:R.black,margin:0,lineHeight:1.3}}>{item.title}</h3>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"16px 20px"}}>
        <div style={{marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
          <SBadge s={item.state}/>
          {admin&&(<button onClick={()=>onEdit(item)} style={{fontSize:10,color:R.dark,background:R.grey,border:"none",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontWeight:600}}>Edit</button>)}
        </div>
        {[["Date",new Date(item.date).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})],["Platform",item.platform],["Notes",item.notes]].map(([l,v])=>(
          <div key={l} style={{fontSize:12,color:R.dark,marginBottom:10}}><div style={{fontWeight:700,color:R.black,marginBottom:2,fontSize:11,textTransform:"uppercase",letterSpacing:.5}}>{l}</div><div style={{lineHeight:1.6}}>{v}</div></div>
        ))}
        {item.theme&&(
          <div style={{marginBottom:16}}>
            <TTag t={item.theme} themes={themes}/>
            {linked.length>0&&(
              <div style={{marginTop:10}}>
                <div style={{fontSize:9,fontWeight:700,color:R.dark,marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>Linked content</div>
                {linked.map(li=>(
                  <div key={li.id} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 10px",background:R.grey,borderRadius:8,marginBottom:4,fontSize:11,color:R.black}}>
                    <span>{(CH[li.ch]||{}).i}</span>
                    <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{li.title}</span>
                    <ATag a={li.area} areas={areas} sm/>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,fontWeight:700,color:R.dark,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Output link</div>
          {item.url?(<a href={item.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:a.color,wordBreak:"break-all"}}>{item.url}</a>):(<span style={{fontSize:11,color:"#ccc",fontStyle:"italic"}}>Not yet published</span>)}
        </div>
        {item.state==="review"&&(
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button onClick={()=>onApprove(item.id,"approved")} style={{flex:1,background:R.lime,color:R.black,border:"none",borderRadius:10,padding:"12px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>Approve</button>
            <button onClick={()=>onApprove(item.id,"input")} style={{flex:1,background:R.white,color:"#ef4444",border:"1px solid #ef4444",borderRadius:10,padding:"12px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>Request Changes</button>
          </div>
        )}
        {item.state==="input"&&(<div style={{background:"#fef2f2",borderRadius:10,padding:14,marginTop:12,fontSize:11,color:"#ef4444",fontWeight:600}}>We're waiting on your input for this item</div>)}
        {item.state==="approved"&&(<div style={{background:"#f0fdf4",borderRadius:10,padding:14,marginTop:12,fontSize:11,color:"#22c55e",fontWeight:600}}>Approved</div>)}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CALENDAR
   ══════════════════════════════════════════════ */
function CalView({items, areas, fArea, fCh, onSelect, sel, admin, onAdd}) {
  const g=mkGrid(2026,7), today="2026-08-06";
  return (
    <div>
      {admin&&(
        <div style={{marginBottom:12}}>
          <button onClick={onAdd} style={{background:R.lime,color:R.black,border:"none",borderRadius:8,padding:"8px 16px",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Add item</button>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:2}}>
        {DAYS.map(d=>(<div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,color:R.dark,padding:"6px 0",textTransform:"uppercase",letterSpacing:.5}}>{d}</div>))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {g.map((day,i)=>{
          if(!day) return (<div key={i} style={{minHeight:96,background:"#f0f0f0",borderRadius:10}}/>);
          const ds=fd(2026,7,day),isT=ds===today;
          const di=items.filter(it=>it.date===ds&&(!fArea||it.area===fArea)&&(!fCh||it.ch===fCh));
          return (
            <div key={i} style={{minHeight:96,background:isT?"#f5f3ff":R.white,borderRadius:10,padding:4,border:isT?`2px solid ${R.lime}`:`1px solid ${R.mid}`,overflow:"hidden"}}>
              <div style={{fontSize:11,fontWeight:isT?800:400,color:isT?R.black:R.dark,paddingLeft:2,marginBottom:3}}>{day}</div>
              {di.map(item=>{
                const wip=item.state==="wip",rev=item.state==="review",inp=item.state==="input";
                const ac=(areas[item.area]||{color:R.dark}).color;
                const itemBg=rev?"#fff8ee":inp?"#fef2f2":wip?"#f4f4f5":ac+"0c";
                const itemBorder=rev?"#f59e42":inp?"#ef4444":wip?"#d4d4d8":ac;
                return (
                  <button key={item.id} onClick={()=>onSelect(sel?.id===item.id?null:item)} style={{
                    display:"flex",alignItems:"center",gap:3,background:itemBg,
                    borderLeft:`3px solid ${itemBorder}`,borderRadius:4,padding:"3px 4px",cursor:"pointer",
                    border:sel?.id===item.id?`1.5px solid ${ac}`:`1px solid ${rev?"#f5d9a8":inp?"#fcc":"transparent"}`,
                    borderLeftWidth:3,borderLeftColor:itemBorder,
                    fontSize:9,color:wip?"#a1a1aa":R.black,textAlign:"left",width:"100%",
                    fontWeight:500,lineHeight:1.2,marginBottom:2,opacity:wip?.5:1,
                    overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",
                  }}>
                    <span style={{overflow:"hidden",textOverflow:"ellipsis",flex:1}}>{item.title}</span>
                    {rev&&(<span style={{flexShrink:0,fontSize:7,fontWeight:800,background:"#f59e42",color:R.white,padding:"1px 4px",borderRadius:3,letterSpacing:.3}}>REVIEW</span>)}
                    {inp&&(<span style={{flexShrink:0,fontSize:7,fontWeight:800,background:"#ef4444",color:R.white,padding:"1px 4px",borderRadius:3,letterSpacing:.3}}>ACTION</span>)}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   REPORTING
   ══════════════════════════════════════════════ */
function ReportingView() {
  return (
    <div style={{maxWidth:680}}>
      <div style={{background:R.white,borderRadius:16,padding:36,textAlign:"center",border:`1px solid ${R.mid}`}}>
        <div style={{width:48,height:48,borderRadius:"50%",background:R.lime+"30",margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{width:16,height:16,borderRadius:"50%",background:R.lime}}/></div>
        <h3 style={{fontSize:17,fontWeight:800,color:R.black,marginBottom:6}}>August Report</h3>
        <p style={{fontSize:12,color:R.dark,marginBottom:20}}>Available from 1 September</p>
        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
          {["July 2026","June 2026"].map(m=>(<span key={m} style={{fontSize:11,color:R.dark,background:R.grey,padding:"6px 12px",borderRadius:8,cursor:"pointer"}}>{m}</span>))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PORTAL
   ══════════════════════════════════════════════ */
export default function Portal() {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [strat, setStrat] = useState(DEFAULT_STRAT);
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [areas] = useState(DEFAULT_AREAS);
  const [themes] = useState(DEFAULT_THEMES);

  const [tab, setTab] = useState("calendar");
  const [fArea, setFA] = useState(null);
  const [fCh, setFC] = useState(null);
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(null); // null | "add" | {editing: item}

  // Load data
  useEffect(() => {
    (async () => {
      const data = await loadAll();
      if (data) {
        if (data.items) setItems(data.items);
        if (data.strat) setStrat(data.strat);
        if (data.events) setEvents(data.events);
      }
      setLoading(false);
    })();
  }, []);

  // Save on changes
  const save = useCallback(async (newItems, newStrat, newEvents) => {
    await saveAll({ items: newItems||items, strat: newStrat||strat, events: newEvents||events });
  }, [items, strat, events]);

  function updateItems(newItems) { setItems(newItems); save(newItems, null, null); }
  function updateStrat(newStrat) { setStrat(newStrat); save(null, newStrat, null); }

  function approve(id, ns) {
    const ni = items.map(i => i.id===id ? {...i, state:ns} : i);
    updateItems(ni);
    if (sel?.id===id) setSel(p=>({...p, state:ns}));
  }

  function handleSaveItem(formData) {
    if (modal && modal.editing) {
      const ni = items.map(i => i.id===modal.editing.id ? {...formData, id:modal.editing.id} : i);
      updateItems(ni);
      setSel({...formData, id:modal.editing.id});
    } else {
      const ni = [...items, {...formData, id:nextId(items)}];
      updateItems(ni);
    }
    setModal(null);
  }

  function handleDeleteItem(id) {
    updateItems(items.filter(i=>i.id!==id));
    setSel(null);
    setModal(null);
  }

  function handleEditStrat(areaKey, data) {
    const ns = {...strat, [areaKey]: data};
    updateStrat(ns);
  }

  const rc = useMemo(()=>items.filter(i=>i.state==="review").length,[items]);
  const ic = useMemo(()=>items.filter(i=>i.state==="input").length,[items]);

  if (loading) return (<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"'Manrope',sans-serif",color:R.dark}}>Loading...</div>);

  const showFilters = tab==="calendar"||tab==="strategy";

  return (
    <div style={{fontFamily:"'Manrope',-apple-system,sans-serif",background:R.bg,minHeight:"100vh"}}>
      {/* HEADER */}
      <div style={{background:R.black,padding:"18px 24px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:800,margin:0,color:R.white,letterSpacing:-.5}}>Ulverscroft Group</h1>
            <div style={{fontSize:10,color:"#555",marginTop:2}}>August 2026</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {admin&&(<span style={{fontSize:9,fontWeight:700,color:"#f59e42",background:"#f59e4218",padding:"3px 8px",borderRadius:4}}>ADMIN</span>)}
            <button onClick={()=>{if(admin){setAdmin(false);}else{setShowLogin(!showLogin);}}} style={{background:"#222",borderRadius:8,padding:"5px 12px",border:"none",cursor:"pointer"}}>
              <span style={{fontSize:13,fontWeight:900,color:R.white,letterSpacing:2}}>RATE</span>
            </button>
          </div>
        </div>
        {/* Admin login */}
        {showLogin&&!admin&&(
          <div style={{display:"flex",gap:8,paddingBottom:12}}>
            <input type="password" placeholder="Admin code" value={adminInput} onChange={e=>setAdminInput(e.target.value)} style={{...inputStyle,width:140,fontSize:11,background:"#222",color:R.white,border:"1px solid #444"}}/>
            <button onClick={()=>{if(adminInput==="rate2026"){setAdmin(true);setShowLogin(false);setAdminInput("");}}} style={{background:R.lime,color:R.black,border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Go</button>
          </div>
        )}
        {/* Tabs */}
        <div style={{display:"flex",gap:0,overflowX:"auto"}}>
          {[{k:"strategy",l:"Strategy"},{k:"dates",l:"Key Dates"},{k:"calendar",l:"Calendar"},{k:"approvals",l:"Approvals",count:rc+ic},{k:"reporting",l:"Reporting"}].map(t=>(
            <button key={t.k} onClick={()=>{setTab(t.k);setSel(null);}} style={{
              background:"none",border:"none",cursor:"pointer",padding:"10px 16px",fontSize:11,fontWeight:600,
              color:tab===t.k?R.lime:"#666",borderBottom:tab===t.k?`2px solid ${R.lime}`:"2px solid transparent",
              display:"flex",alignItems:"center",gap:5,
            }}>
              {t.l}
              {t.count>0&&(<span style={{background:"#ef4444",color:R.white,fontSize:9,fontWeight:700,padding:"0 5px",borderRadius:10,minWidth:16,textAlign:"center"}}>{t.count}</span>)}
            </button>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      {showFilters&&(
        <div style={{background:R.white,padding:"10px 24px",borderBottom:`1px solid ${R.mid}`,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <button onClick={()=>setFA(null)} style={{padding:"5px 12px",borderRadius:8,fontSize:10,fontWeight:700,cursor:"pointer",background:!fArea?R.black:R.white,color:!fArea?R.white:R.dark,border:`1px solid ${!fArea?R.black:R.mid}`}}>All brands</button>
          {Object.entries(areas).map(([k,a])=>(
            <button key={k} onClick={()=>setFA(fArea===k?null:k)} style={{padding:"5px 12px",borderRadius:8,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,background:fArea===k?a.color+"14":R.white,color:fArea===k?a.color:R.dark,border:`1px solid ${fArea===k?a.color+"40":R.mid}`}}><Dot c={a.color} s={6}/>{a.label}</button>
          ))}
          {tab==="calendar"&&(<><div style={{flex:1}}/><ChDrop value={fCh} onChange={setFC}/></>)}
        </div>
      )}

      {/* CONTENT */}
      <div style={{padding:"20px 24px 48px",marginRight:sel?360:0,transition:"margin-right .2s"}}>
        {tab==="strategy"&&(<StrategyView strat={strat} areas={areas} fArea={fArea} admin={admin} onEditStrat={handleEditStrat}/>)}
        {tab==="dates"&&(<KeyDatesView events={events} areas={areas}/>)}
        {tab==="calendar"&&(<CalView items={items} areas={areas} fArea={fArea} fCh={fCh} onSelect={setSel} sel={sel} admin={admin} onAdd={()=>setModal("add")}/>)}
        {tab==="approvals"&&(<ApprovalsView items={items} areas={areas} themes={themes} onApprove={approve}/>)}
        {tab==="reporting"&&(<ReportingView/>)}
      </div>

      {/* SIDE PANEL */}
      <Panel item={sel} items={items} areas={areas} themes={themes} admin={admin} onClose={()=>setSel(null)} onApprove={approve} onEdit={(it)=>setModal({editing:it})}/>

      {/* MODALS */}
      <Modal open={modal==="add"} onClose={()=>setModal(null)} title="Add Content Item">
        <ItemForm areas={areas} themes={themes} onSave={handleSaveItem} onCancel={()=>setModal(null)}/>
      </Modal>
      <Modal open={modal&&modal.editing} onClose={()=>setModal(null)} title="Edit Item">
        {modal&&modal.editing&&(<ItemForm item={modal.editing} areas={areas} themes={themes} onSave={handleSaveItem} onDelete={handleDeleteItem} onCancel={()=>setModal(null)}/>)}
      </Modal>
    </div>
  );
}
