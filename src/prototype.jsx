"use client";

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

const CH = {
  social:{l:"Social",i:"📱",tag:"SOC"},
  email:{l:"Email",i:"✉️",tag:"EML"},
  blog:{l:"Blog",i:"📝",tag:"BLG"},
  campaign:{l:"Campaign",i:"🚀",tag:"CMP"},
  pr:{l:"PR",i:"📰",tag:"PR"},
  web:{l:"Web",i:"🌐",tag:"WEB"},
  paid:{l:"Paid",i:"📢",tag:"ADS"},
  shoot:{l:"Shoot",i:"🎬",tag:"🎬"},
  event:{l:"Event",i:"📅",tag:"EVT"},
  strategy:{l:"Strategy",i:"🎯",tag:"STR"},
  report:{l:"Report",i:"📊",tag:"RPT"},
  design:{l:"Design",i:"🎨",tag:"DSN"},
};

const ST = {
  wip:{l:"In Progress",c:"#a1a1aa",bg:"#f4f4f5"},
  review:{l:"Ready for Review",c:"#f59e42",bg:"#fff7ed"},
  input:{l:"Awaiting Client Input",c:"#ef4444",bg:"#fef2f2"},
  approved:{l:"Approved",c:"#22c55e",bg:"#f0fdf4"},
  live:{l:"Live",c:"#3b82f6",bg:"#eff6ff"},
};

const DEFAULT_THEMES = {
  christie:{l:"Agatha Christie Exhibition",c:"#7c3aed",brief:"Major tentpole tied to the London Museum exhibition (Aug–Oct). Coordinated across Ulverscroft and Trade — social series, blog content and trade press outreach spotlighting large-print Christie titles."},
  booklovers:{l:"National Book Lovers Day",c:"#ec4899",brief:"Cross-brand awareness day (9 Aug). Pre-scheduled content across Ulverscroft, uLibrary and The Reading House — must be ready by the 7th."},
  b2s:{l:"Back to School",c:"#06b6d4",brief:"Education-sector push targeting school librarians ahead of the new term. uLibrary-led, with Reading House support."},
  newrelease:{l:"August New Releases",c:"#f97316",brief:"Rolling spotlight on new large-print and audio titles released in August."},
};

const DEFAULT_EVENTS = [
  {id:"k1",title:"Agatha Christie — London Museum",start:"2026-08-01",end:"2026-10-31",areas:["ulverscroft","trade"],notes:"Major tentpole. Social series, blog, trade press.",theme:"christie",venue:"London Museum",links:[{label:"Exhibition site",url:"https://example.com/christie-exhibition"}]},
  {id:"k2",title:"National Book Lovers Day",start:"2026-08-09",end:"2026-08-09",areas:["ulverscroft","readinghouse","ulibrary"],notes:"Cross-brand. Pre-schedule by 7th.",theme:"booklovers",venue:"",links:[]},
  {id:"k3",title:"Spark Expo Australia",start:"2026-08-04",end:"2026-08-06",areas:["ulibrary","trade"],notes:"Trade event. uLibrary demo.",theme:"",venue:"Sydney Exhibition Centre",links:[{label:"Event website",url:"https://example.com/spark-expo"}]},
  {id:"k4",title:"Back to School window",start:"2026-08-17",end:"2026-08-31",areas:["ulibrary","readinghouse"],notes:"Target schools and libraries.",theme:"b2s",venue:"",links:[]},
];

const DEFAULT_STRATEGIES = [
  {id:"s1",name:"Ulverscroft Content Strategy",brands:["ulverscroft"],startDate:"2026-08-01",endDate:"2026-08-31",b2b:"B2C",productFocus:"Large print & audio backlist, new releases",purpose:"Leverage the Agatha Christie exhibition as a tentpole moment to reach library authorities and general readers.",goal:"Grow engaged readership and strengthen library authority relationships ahead of Q4 renewals.",kpis:["Social engagement +15% vs July","Email open rate >30%","Blog traffic +20%"],audience:"Library authorities, general readers (50+), visually impaired readers",tone:"Warm, accessible, trusted.",message:"The world's best stories, made accessible to everyone.",channels:"Instagram, Facebook, X, Kit, Website blog",frequency:"3–4 posts per week",cta:"Browse the catalogue",budget:"",hashtags:"#Ulverscroft #LargePrint"},
  {id:"s2",name:"uLibrary Growth Strategy",brands:["ulibrary"],startDate:"2026-08-01",endDate:"2026-08-31",b2b:"Both",productFocus:"Digital library subscriptions, Book Club",purpose:"Drive retention through Book Club engagement while opening a new education-sector channel.",goal:"Grow school/library sign-ups and lift subscriber retention above 85%.",kpis:["Newsletter opens >35%","Back to School: 50 trial sign-ups","Retention >85%"],audience:"School librarians, education buyers, digital subscribers",tone:"Modern, digital-first, practical.",message:"The digital library that readers actually use.",channels:"LinkedIn, Instagram, Kit, Landing pages",frequency:"2 posts per week + monthly newsletter",cta:"Start a free trial",budget:"£350",hashtags:"#uLibrary #BackToSchool"},
  {id:"s3",name:"The Reading House — Community Strategy",brands:["readinghouse"],startDate:"2026-08-01",endDate:"2026-08-31",b2b:"B2C",productFocus:"In-store experience, local events",purpose:"Build consistent social presence with behind-the-scenes content to drive footfall.",goal:"Increase local awareness and repeat footfall through community-first content.",kpis:["Social following +200","Email list +50","Reel views avg >1k"],audience:"Local readers, gift buyers, community book lovers",tone:"Friendly, personal, cosy.",message:"Your local bookshop, with something for everyone.",channels:"Instagram, TikTok, Facebook, Kit",frequency:"4–5 posts per week",cta:"Visit us in store",budget:"",hashtags:"#ReadingHouse #ShopLocal"},
  {id:"s4",name:"Trade — Autumn Catalogue Push",brands:["trade"],startDate:"2026-08-01",endDate:"2026-09-30",b2b:"B2B",productFocus:"Autumn catalogue, Christie large-print range",purpose:"Distribute the autumn catalogue and pitch the Christie exhibition angle to trade press.",goal:"Land trade press coverage and generate new partner enquiries.",kpis:["1 feature in The Bookseller","Catalogue to all partners","2 new enquiries"],audience:"Audible, Bolinda, W.F. Howes, trade press",tone:"Professional, concise, industry-fluent.",message:"The partner publishers choose for accessible formats.",channels:"Email (direct), Trade press",frequency:"Monthly",cta:"Request the catalogue",budget:"",hashtags:""},
];

const DEFAULT_MONTH_SUMMARY = {
  enabled:true,
  text:"Leverage the Agatha Christie exhibition as a tentpole across Ulverscroft and Trade. Drive uLibrary retention through Book Club engagement. Build consistent social presence for The Reading House.",
};

const DEFAULT_ITEMS = [
  {id:1,date:"2026-08-03",area:"ulverscroft",ch:"social",title:"Shadow of the Wind – carousel",state:"approved",platform:"IG / FB",notes:"Cover art + pull quotes",theme:"newrelease",url:"",comments:[],history:[]},
  {id:2,date:"2026-08-05",area:"ulibrary",ch:"email",title:"August Book Club newsletter",state:"review",platform:"Kit",notes:"Black History Month feature",theme:"",url:"",comments:[],history:[]},
  {id:3,date:"2026-08-06",area:"ulibrary",ch:"social",title:"Library of the Month announcement",state:"input",platform:"IG / LinkedIn",notes:"Need title confirmation from Daniel",theme:"",url:"",comments:[{id:"c1",author:"Rate Team",ts:"2026-08-05T10:12:00Z",text:"Can you confirm the library name before we schedule this?"}],history:[{id:"h1",ts:"2026-08-05T10:12:00Z",from:"review",to:"input",by:"Rate Team"}]},
  {id:4,date:"2026-08-07",area:"ulverscroft",ch:"social",title:"Christie LP spotlight",state:"review",platform:"IG / X",notes:"Large print editions tie-in",theme:"christie",url:"",comments:[],history:[]},
  {id:5,date:"2026-08-07",area:"ulverscroft",ch:"blog",title:"Christie — reading guide",state:"wip",platform:"Website",notes:"Curated LP Christie titles",theme:"christie",url:"",comments:[],history:[]},
  {id:6,date:"2026-08-09",area:"readinghouse",ch:"social",title:"Book Lovers Day — staff picks reel",state:"review",platform:"IG / TikTok",notes:"Team picks filmed in-store",theme:"booklovers",url:"",comments:[],history:[]},
  {id:7,date:"2026-08-09",area:"ulverscroft",ch:"email",title:"Book Lovers Day — reader email",state:"wip",platform:"Kit",notes:"Curated list + offer code",theme:"booklovers",url:"",comments:[],history:[]},
  {id:8,date:"2026-08-11",area:"ulibrary",ch:"email",title:"uLibrary Monthly Update",state:"wip",platform:"Kit",notes:"Usage stats, retention",theme:"",url:"",comments:[],history:[]},
  {id:9,date:"2026-08-13",area:"trade",ch:"email",title:"Trade catalogue — Autumn titles",state:"approved",platform:"Email",notes:"Sent to Audible, Bolinda",theme:"",url:"",comments:[],history:[]},
  {id:10,date:"2026-08-18",area:"ulverscroft",ch:"social",title:"Land by Maggie O'Farrell",state:"wip",platform:"IG / FB",notes:"Review quote post",theme:"newrelease",url:"",comments:[],history:[]},
  {id:11,date:"2026-08-25",area:"ulibrary",ch:"campaign",title:"Back to School — outreach",state:"review",platform:"Email + LP",notes:"School librarians, free trial",theme:"b2s",url:"",comments:[],history:[]},
  {id:12,date:"2026-08-28",area:"ulverscroft",ch:"email",title:"Book of the Week — Honesty",state:"review",platform:"Kit",notes:"Carried from July series",theme:"",url:"",comments:[],history:[]},
];

/* ══════════════════════════════════════════════
   STORAGE
   ══════════════════════════════════════════════ */
const STORAGE_KEY = "rate-portal-ulverscroft";

async function saveAll(data) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) { console.error("Save failed", e); }
}

async function loadAll() {
  try {
    const r = window.localStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) : null;
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
function nextStrId(list,prefix){let n=list.length+1;while(list.some(x=>x.id===`${prefix}${n}`))n++;return `${prefix}${n}`;}
function fmtTs(ts){ try { return new Date(ts).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}); } catch(e){ return ts; } }

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
function SDot({s}) {
  const v = ST[s]; if(!v) return null;
  return (<span title={v.l} style={{width:7,height:7,borderRadius:"50%",background:v.c,flexShrink:0}}/>);
}
function TTag({t, themes}) {
  if (!t) return null; const v = (themes||DEFAULT_THEMES)[t]; if(!v) return null;
  return (<span style={{display:"inline-flex",alignItems:"center",gap:4,background:v.c+"10",color:v.c,padding:"2px 8px",borderRadius:6,fontSize:9,fontWeight:600,border:`1px dashed ${v.c}30`}}><span style={{width:4,height:4,borderRadius:"50%",background:v.c}}/>{v.l}</span>);
}
function TypeTag({ch, size}) {
  const v = CH[ch]; if(!v) return null;
  return (<span title={v.l} style={{display:"inline-flex",alignItems:"center",fontSize:size||13,lineHeight:1,flexShrink:0}}>{v.i}</span>);
}
function Eyebrow({children}) {
  return (<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{width:20,height:2,background:R.lime,borderRadius:1}}/><span style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:R.dark}}>{children}</span></div>);
}

/* ══════════════════════════════════════════════
   LINKED CONTENT LIST (reusable)
   ══════════════════════════════════════════════ */
function LinkedContentList({items, areas, onSelect, title}) {
  if (!items || !items.length) return null;
  return (
    <div style={{marginTop:10}}>
      <div style={{fontSize:9,fontWeight:700,color:R.dark,marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>{title||"Linked content"}</div>
      {items.map(li=>(
        <button key={li.id} onClick={()=>onSelect(li)} style={{display:"flex",width:"100%",alignItems:"center",gap:7,padding:"7px 10px",background:R.grey,border:"none",borderRadius:8,marginBottom:4,fontSize:11,color:R.black,cursor:"pointer",textAlign:"left"}}>
          <TypeTag ch={li.ch}/>
          <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{li.title}</span>
          <ATag a={li.area} areas={areas} sm/>
          <SDot s={li.state}/>
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MODAL WRAPPER
   ══════════════════════════════════════════════ */
function Modal({open, onClose, title, children, wide}) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:R.white,borderRadius:16,width:"100%",maxWidth:wide?640:480,maxHeight:"85vh",overflow:"auto",padding:24}} onClick={e=>e.stopPropagation()}>
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
  const [f, setF] = useState(item || {title:"",date:"2026-08-15",area:Object.keys(areas)[0],ch:"social",state:"wip",platform:"",notes:"",theme:"",url:"",comments:[],history:[]});
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
        <Field label="Activity Type">
          <select style={selectStyle} value={f.ch} onChange={e=>upd("ch",e.target.value)}>
            {Object.entries(CH).map(([k,v])=>(<option key={k} value={k}>{v.l}</option>))}
          </select>
        </Field>
      </div>
      <Field label="Platform"><input style={inputStyle} value={f.platform} onChange={e=>upd("platform",e.target.value)} placeholder="e.g. IG / Facebook"/></Field>
      <Field label="Notes"><textarea style={{...inputStyle,minHeight:60,resize:"vertical"}} value={f.notes} onChange={e=>upd("notes",e.target.value)}/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Theme / Campaign (optional)">
          <select style={selectStyle} value={f.theme||""} onChange={e=>upd("theme",e.target.value)}>
            <option value="">None</option>
            {Object.entries(themes).map(([k,v])=>(<option key={k} value={k}>{v.l}</option>))}
          </select>
        </Field>
        <Field label="Output URL"><input style={inputStyle} value={f.url||""} onChange={e=>upd("url",e.target.value)} placeholder="https://..."/></Field>
      </div>
      <div style={{display:"flex",gap:8,marginTop:16}}>
        <button onClick={()=>onSave({...f,comments:f.comments||[],history:f.history||[]})} style={{flex:1,background:R.lime,color:R.black,border:"none",borderRadius:10,padding:"10px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>{item?"Save Changes":"Add Item"}</button>
        <button onClick={onCancel} style={{padding:"10px 16px",background:R.white,color:R.dark,border:`1px solid ${R.mid}`,borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>Cancel</button>
        {item && onDelete && (<button onClick={()=>onDelete(item.id)} style={{padding:"10px 16px",background:R.white,color:"#ef4444",border:"1px solid #ef4444",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>Delete</button>)}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CHANNEL DROPDOWN
   ══════════════════════════════════════════════ */
const TYPE_FILTER_OPTIONS = [...Object.entries(CH).map(([k,c])=>({k,label:c.l,icon:c.i})), {k:"keydates",label:"Key Dates",icon:"📅"}];

function ChDrop({value, onChange}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const toggle = (k) => onChange(value.includes(k) ? value.filter(x=>x!==k) : [...value,k]);
  const label = value.length===0 ? "All types" : value.length===1 ? (TYPE_FILTER_OPTIONS.find(o=>o.k===value[0])||{}).label : `${value.length} types`;
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(!open)} style={{padding:"5px 12px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",background:R.white,color:value.length?R.black:R.dark,border:`1px solid ${R.mid}`,display:"flex",alignItems:"center",gap:4}}>
        {label} <span style={{fontSize:8,marginLeft:2}}>▾</span>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"100%",right:0,marginTop:4,zIndex:50,background:R.white,borderRadius:12,border:`1px solid ${R.mid}`,boxShadow:"0 8px 24px rgba(0,0,0,.1)",overflow:"hidden",minWidth:190,maxHeight:300,overflowY:"auto"}}>
          <button onClick={()=>onChange([])} style={{display:"block",width:"100%",padding:"8px 14px",border:"none",borderBottom:`1px solid ${R.mid}`,cursor:"pointer",background:value.length===0?R.grey:R.white,fontSize:11,fontWeight:700,color:R.black,textAlign:"left"}}>All types</button>
          {TYPE_FILTER_OPTIONS.map(o=>(
            <label key={o.k} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 14px",cursor:"pointer",background:value.includes(o.k)?R.grey:R.white,fontSize:11,fontWeight:500,color:R.black}}>
              <input type="checkbox" checked={value.includes(o.k)} onChange={()=>toggle(o.k)} style={{margin:0}}/>
              <span>{o.icon}</span><span>{o.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   STRATEGY FORM (add + edit)
   ══════════════════════════════════════════════ */
function StrategyForm({strategy, areas, onSave, onDelete, onCancel}) {
  const [f, setF] = useState(strategy || {name:"",brands:[],startDate:"2026-08-01",endDate:"2026-08-31",b2b:"B2C",productFocus:"",purpose:"",goal:"",kpis:[],audience:"",tone:"",message:"",channels:"",frequency:"",cta:"",budget:"",hashtags:""});
  const upd = (k,v) => setF(p=>({...p,[k]:v}));
  const toggleBrand = (k) => setF(p=>({...p,brands:p.brands.includes(k)?p.brands.filter(b=>b!==k):[...p.brands,k]}));

  return (
    <div>
      <Field label="Campaign / Strategy Name"><input style={inputStyle} value={f.name} onChange={e=>upd("name",e.target.value)} placeholder="e.g. Q3 Content Strategy"/></Field>
      <Field label="Brand(s)">
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {Object.entries(areas).map(([k,a])=>(
            <button key={k} type="button" onClick={()=>toggleBrand(k)} style={{padding:"5px 10px",borderRadius:8,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,background:f.brands.includes(k)?a.color+"14":R.white,color:f.brands.includes(k)?a.color:R.dark,border:`1px solid ${f.brands.includes(k)?a.color+"40":R.mid}`}}><Dot c={a.color} s={6}/>{a.label}</button>
          ))}
        </div>
      </Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Start Date"><input type="date" style={inputStyle} value={f.startDate} onChange={e=>upd("startDate",e.target.value)}/></Field>
        <Field label="End Date"><input type="date" style={inputStyle} value={f.endDate} onChange={e=>upd("endDate",e.target.value)}/></Field>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="B2B or B2C">
          <select style={selectStyle} value={f.b2b} onChange={e=>upd("b2b",e.target.value)}>
            <option value="B2B">B2B</option><option value="B2C">B2C</option><option value="Both">Both</option>
          </select>
        </Field>
        <Field label="Product / Service Focus"><input style={inputStyle} value={f.productFocus} onChange={e=>upd("productFocus",e.target.value)}/></Field>
      </div>
      <Field label="Purpose"><textarea style={{...inputStyle,minHeight:50,resize:"vertical"}} value={f.purpose} onChange={e=>upd("purpose",e.target.value)} placeholder="Why this campaign/strategy exists"/></Field>
      <Field label="Ultimate Goal"><textarea style={{...inputStyle,minHeight:50,resize:"vertical"}} value={f.goal} onChange={e=>upd("goal",e.target.value)} placeholder="The business outcome we're driving"/></Field>
      <Field label="KPIs (one per line)"><textarea style={{...inputStyle,minHeight:60,resize:"vertical"}} value={(f.kpis||[]).join("\n")} onChange={e=>upd("kpis",e.target.value.split("\n"))}/></Field>
      <Field label="Target Audience"><textarea style={{...inputStyle,minHeight:50,resize:"vertical"}} value={f.audience} onChange={e=>upd("audience",e.target.value)}/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Campaign Tone"><input style={inputStyle} value={f.tone} onChange={e=>upd("tone",e.target.value)}/></Field>
        <Field label="Frequency"><input style={inputStyle} value={f.frequency} onChange={e=>upd("frequency",e.target.value)} placeholder="e.g. 2 posts per week"/></Field>
      </div>
      <Field label="Key Message"><textarea style={{...inputStyle,minHeight:50,resize:"vertical"}} value={f.message} onChange={e=>upd("message",e.target.value)}/></Field>
      <Field label="Channels"><input style={inputStyle} value={f.channels} onChange={e=>upd("channels",e.target.value)} placeholder="e.g. Instagram, Kit, Website blog"/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="CTA"><input style={inputStyle} value={f.cta} onChange={e=>upd("cta",e.target.value)}/></Field>
        <Field label="Budget (ad spend)"><input style={inputStyle} value={f.budget} onChange={e=>upd("budget",e.target.value)} placeholder="e.g. £350"/></Field>
      </div>
      <Field label="Hashtags"><input style={inputStyle} value={f.hashtags} onChange={e=>upd("hashtags",e.target.value)}/></Field>
      <div style={{display:"flex",gap:8,marginTop:16}}>
        <button onClick={()=>onSave({...f,kpis:(f.kpis||[]).filter(k=>k.trim())})} style={{flex:1,background:R.lime,color:R.black,border:"none",borderRadius:10,padding:"10px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>{strategy?"Save Changes":"Add Strategy"}</button>
        <button onClick={onCancel} style={{padding:"10px 16px",background:R.white,color:R.dark,border:`1px solid ${R.mid}`,borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>Cancel</button>
        {strategy && onDelete && (<button onClick={()=>onDelete(strategy.id)} style={{padding:"10px 16px",background:R.white,color:"#ef4444",border:"1px solid #ef4444",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>Delete</button>)}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STRATEGY VIEW
   ══════════════════════════════════════════════ */
function StrategyView({strategies, areas, fArea, admin, monthSummary, onToggleSummary, onEditSummary, onOpenForm}) {
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState(monthSummary.text);
  const visible = strategies.filter(s => !fArea || s.brands.includes(fArea));

  return (
    <div style={{maxWidth:760}}>
      {admin && (
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12,gap:8}}>
          <label style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:R.dark,fontWeight:600}}>
            <input type="checkbox" checked={monthSummary.enabled} onChange={e=>onToggleSummary(e.target.checked)}/> Show "This Month" summary
          </label>
          <button onClick={()=>onOpenForm(null)} style={{background:R.lime,color:R.black,border:"none",borderRadius:8,padding:"6px 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ New Strategy</button>
        </div>
      )}
      {monthSummary.enabled && (
        <div style={{background:R.black,borderRadius:16,padding:"20px 24px",marginBottom:24,color:R.white}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <Eyebrow>This Month</Eyebrow>
            {admin && !editingSummary && (<button onClick={()=>{setSummaryDraft(monthSummary.text);setEditingSummary(true);}} style={{background:"rgba(255,255,255,.15)",color:R.white,border:"none",borderRadius:6,padding:"3px 9px",fontSize:9,fontWeight:600,cursor:"pointer"}}>Edit</button>)}
          </div>
          {editingSummary ? (
            <div>
              <textarea style={{...inputStyle,minHeight:70,resize:"vertical",background:"#222",color:R.white,border:"1px solid #444"}} value={summaryDraft} onChange={e=>setSummaryDraft(e.target.value)}/>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={()=>{onEditSummary(summaryDraft);setEditingSummary(false);}} style={{background:R.lime,color:R.black,border:"none",borderRadius:8,padding:"6px 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Save</button>
                <button onClick={()=>setEditingSummary(false)} style={{background:"rgba(255,255,255,.1)",color:R.white,border:"none",borderRadius:8,padding:"6px 14px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Cancel</button>
              </div>
            </div>
          ) : (
            <p style={{fontSize:13,lineHeight:1.7,margin:0,color:"#bbb"}}>{monthSummary.text}</p>
          )}
        </div>
      )}
      {visible.length===0 && (<div style={{fontSize:12,color:R.dark,padding:24,textAlign:"center",background:R.white,borderRadius:12,border:`1px solid ${R.mid}`}}>No strategies for this brand yet.</div>)}
      {visible.map(s=>{
        const primary = areas[s.brands[0]] || {color:R.dark};
        const rows = [
          ["Product Focus",s.productFocus],["Purpose",s.purpose],["Ultimate Goal",s.goal],
          ["Audience",s.audience],["Tone",s.tone],["Key Message",s.message],["Channels",s.channels],
          ["Frequency",s.frequency],["CTA",s.cta],["Budget",s.budget],["Hashtags",s.hashtags],
        ].filter(([,v])=>v);
        return (
          <div key={s.id} style={{background:R.white,borderRadius:16,marginBottom:16,border:`1px solid ${R.mid}`,overflow:"hidden"}}>
            <div style={{background:primary.color,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:R.white,marginBottom:4}}>{s.name}</div>
                <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                  {s.brands.map(b=>(<span key={b} style={{fontSize:9,fontWeight:700,color:R.white,background:"rgba(255,255,255,.22)",padding:"1px 7px",borderRadius:5}}>{(areas[b]||{}).short||b}</span>))}
                  <span style={{fontSize:9,fontWeight:700,color:R.white,background:"rgba(255,255,255,.22)",padding:"1px 7px",borderRadius:5}}>{s.b2b}</span>
                  <span style={{fontSize:9,color:"rgba(255,255,255,.8)"}}>{s.startDate} – {s.endDate}</span>
                </div>
              </div>
              {admin && (<button onClick={()=>onOpenForm(s)} style={{background:"rgba(255,255,255,.2)",color:R.white,border:"none",borderRadius:6,padding:"4px 10px",fontSize:10,fontWeight:600,cursor:"pointer"}}>Edit</button>)}
            </div>
            <div style={{padding:"18px 20px"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <tbody>
                  {rows.map(([l,v])=>(
                    <tr key={l}><td style={{fontWeight:700,color:R.black,padding:"8px 16px 8px 0",verticalAlign:"top",width:130,borderBottom:`1px solid ${R.grey}`}}>{l}</td><td style={{color:R.dark,padding:"8px 0",lineHeight:1.6,borderBottom:`1px solid ${R.grey}`}}>{v}</td></tr>
                  ))}
                  {s.kpis && s.kpis.length>0 && (
                    <tr><td style={{fontWeight:700,color:R.black,padding:"8px 16px 8px 0",verticalAlign:"top"}}>KPIs</td><td style={{padding:"8px 0"}}>{s.kpis.map((k,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,fontSize:12,color:R.dark}}><Dot c={primary.color} s={6}/>{k}</div>))}</td></tr>
                  )}
                </tbody>
              </table>
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
function KeyDatesView({events, areas, onSelect}) {
  const sorted = [...events].sort((a,b)=>new Date(a.start)-new Date(b.start));
  let lastMonthKey = null;
  return (
    <div style={{maxWidth:680}}>
      <Eyebrow>Key Dates</Eyebrow>
      <h2 style={{fontSize:22,fontWeight:800,color:R.black,margin:"0 0 20px",letterSpacing:-.5}}>What's coming up.</h2>
      {sorted.map((ev,idx)=>{
        const s=new Date(ev.start),e=new Date(ev.end),same=ev.start===ev.end;
        const monthKey = `${s.getFullYear()}-${s.getMonth()}`;
        const showHeader = monthKey !== lastMonthKey;
        lastMonthKey = monthKey;
        return (
          <div key={ev.id}>
            {showHeader && (
              <div style={{fontSize:12,fontWeight:800,color:R.black,textTransform:"uppercase",letterSpacing:.8,margin:idx===0?"0 0 4px":"20px 0 4px"}}>{s.toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</div>
            )}
            <button onClick={()=>onSelect(ev)} style={{display:"flex",gap:14,padding:"16px 0",borderBottom:`1px solid ${R.mid}`,width:"100%",background:"none",border:"none",borderBottomStyle:"solid",cursor:"pointer",textAlign:"left"}}>
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
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════
   KEY DATE / EVENT DETAIL PANEL
   ══════════════════════════════════════════════ */
function EventPanel({event, items, areas, themes, onClose, onSelectItem}) {
  if (!event) return null;
  const theme = event.theme ? themes[event.theme] : null;
  const linked = event.theme ? items.filter(i=>i.theme===event.theme) : [];
  const s=new Date(event.start), e=new Date(event.end), same=event.start===event.end;

  return (
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:360,background:R.white,borderLeft:`1px solid ${R.mid}`,boxShadow:"-8px 0 32px rgba(0,0,0,.08)",zIndex:100,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 20px 12px",borderBottom:`1px solid ${R.mid}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <span style={{fontSize:9,fontWeight:700,color:R.dark,textTransform:"uppercase",letterSpacing:.5}}>Key Date</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:R.dark,padding:0,lineHeight:1}}>×</button>
        </div>
        <h3 style={{fontSize:15,fontWeight:700,color:R.black,margin:"6px 0 0",lineHeight:1.3}}>{event.title}</h3>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"16px 20px"}}>
        <div style={{fontSize:12,color:R.dark,marginBottom:14}}>
          {same?s.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}):`${s.toLocaleDateString("en-GB",{day:"numeric",month:"long"})} – ${e.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}`}
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14}}>{event.areas.map(a=>(<ATag key={a} a={a} areas={areas}/>))}</div>
        <div style={{marginBottom:14}}>
          <div style={{fontWeight:700,color:R.black,marginBottom:4,fontSize:11,textTransform:"uppercase",letterSpacing:.5}}>Notes</div>
          <div style={{fontSize:12,color:R.dark,lineHeight:1.6}}>{event.notes}</div>
        </div>
        {event.venue && (
          <div style={{marginBottom:14}}>
            <div style={{fontWeight:700,color:R.black,marginBottom:4,fontSize:11,textTransform:"uppercase",letterSpacing:.5}}>Venue</div>
            <div style={{fontSize:12,color:R.dark}}>{event.venue}</div>
          </div>
        )}
        {event.links && event.links.length>0 && (
          <div style={{marginBottom:14}}>
            <div style={{fontWeight:700,color:R.black,marginBottom:4,fontSize:11,textTransform:"uppercase",letterSpacing:.5}}>External Links</div>
            {event.links.map((l,i)=>(<div key={i}><a href={l.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:R.lime==="#c8e63e"?"#7c9a1e":R.dark}}>{l.label}</a></div>))}
          </div>
        )}
        {theme && (
          <div style={{marginBottom:6}}>
            <TTag t={event.theme} themes={themes}/>
            <p style={{fontSize:11,color:R.dark,lineHeight:1.6,marginTop:8}}>{theme.brief}</p>
          </div>
        )}
        <LinkedContentList items={linked} areas={areas} onSelect={onSelectItem}/>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   APPROVALS
   ══════════════════════════════════════════════ */
function ApprovalsView({items, areas, themes, onSelect}) {
  const rv=items.filter(i=>i.state==="review"), ip=items.filter(i=>i.state==="input");
  return (
    <div style={{maxWidth:680}}>
      {ip.length>0&&(
        <div style={{marginBottom:28}}>
          <Eyebrow>Action Required</Eyebrow>
          <h3 style={{fontSize:15,fontWeight:700,color:"#ef4444",margin:"0 0 12px"}}>Awaiting your input ({ip.length})</h3>
          {ip.map(item=>(
            <button key={item.id} onClick={()=>onSelect(item)} style={{display:"flex",width:"100%",alignItems:"center",gap:10,background:"#fef2f2",borderRadius:12,padding:"14px 16px",marginBottom:8,borderLeft:"3px solid #ef4444",cursor:"pointer",textAlign:"left"}}>
              <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:R.black}}>{item.title}</div><div style={{fontSize:10,color:R.dark,marginTop:2}}>{item.notes}</div></div>
              <ATag a={item.area} areas={areas} sm/>
            </button>
          ))}
        </div>
      )}
      <Eyebrow>Review</Eyebrow>
      <h3 style={{fontSize:15,fontWeight:700,color:R.black,margin:"0 0 12px"}}>Ready for sign-off ({rv.length})</h3>
      {rv.length===0&&(<div style={{fontSize:12,color:R.dark,padding:24,textAlign:"center",background:R.white,borderRadius:12}}>All caught up — nothing to review.</div>)}
      {rv.map(item=>(
        <button key={item.id} onClick={()=>onSelect(item)} style={{display:"block",width:"100%",background:R.white,borderRadius:12,padding:"16px 18px",marginBottom:10,border:`1px solid ${R.mid}`,borderLeft:`3px solid ${(areas[item.area]||{}).color||R.dark}`,cursor:"pointer",textAlign:"left"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:R.black,marginBottom:4}}>{item.title}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}><ATag a={item.area} areas={areas} sm/><TypeTag ch={item.ch}/><TTag t={item.theme} themes={themes}/></div>
            </div>
            <span style={{fontSize:10,color:R.dark,whiteSpace:"nowrap"}}>{new Date(item.date).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</span>
          </div>
          <div style={{fontSize:11,color:R.dark,marginBottom:4}}><strong>Platform:</strong> {item.platform}</div>
          <div style={{fontSize:11,color:R.dark}}><strong>Notes:</strong> {item.notes}</div>
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SIDE PANEL
   ══════════════════════════════════════════════ */
function Panel({item, items, events, areas, themes, admin, onClose, onApprove, onEdit, onAddComment, onSelectLinked, onSelectEvent, backTo, onBack}) {
  const [actionMode, setActionMode] = useState(null); // null | "approve" | "reject"
  const [draft, setDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const scrollRef = useRef(null);

  useEffect(()=>{ setActionMode(null); setDraft(""); setCommentDraft(""); if(scrollRef.current) scrollRef.current.scrollTop = 0; }, [item?.id]);

  if(!item) return null;
  const a = (areas||{})[item.area]||{color:R.dark};
  const linked = item.theme ? items.filter(i=>i.theme===item.theme&&i.id!==item.id) : [];
  const relatedEvent = item.theme ? (events||[]).find(e=>e.theme===item.theme) : null;
  const comments = item.comments || [];
  const history = item.history || [];

  function submitAction() {
    onApprove(item.id, actionMode==="approve"?"approved":"input", draft.trim());
    setActionMode(null); setDraft("");
  }
  function submitComment() {
    if (!commentDraft.trim()) return;
    onAddComment(item.id, commentDraft.trim());
    setCommentDraft("");
  }

  return (
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:360,background:R.white,borderLeft:`1px solid ${R.mid}`,boxShadow:"-8px 0 32px rgba(0,0,0,.08)",zIndex:100,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 20px 12px",borderBottom:`1px solid ${R.mid}`}}>
        {backTo && (
          <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",padding:0,marginBottom:8,fontSize:11,fontWeight:600,color:R.dark}}>← Back to {backTo}</button>
        )}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
            <ATag a={item.area} areas={areas}/>
            <span style={{fontSize:10,color:R.dark,display:"flex",alignItems:"center",gap:4}}><TypeTag ch={item.ch}/> {(CH[item.ch]||{}).l}</span>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:R.dark,padding:0,lineHeight:1}}>×</button>
        </div>
        <h3 style={{fontSize:15,fontWeight:700,color:R.black,margin:0,lineHeight:1.3}}>{item.title}</h3>
      </div>
      <div ref={scrollRef} style={{flex:1,overflow:"auto",padding:"16px 20px"}}>
        <div style={{marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
          <SBadge s={item.state}/>
          {admin&&(<button onClick={()=>onEdit(item)} style={{fontSize:10,color:R.dark,background:R.grey,border:"none",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontWeight:600}}>Edit</button>)}
        </div>
        {[["Date",new Date(item.date).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})],["Platform",item.platform],["Notes",item.notes]].map(([l,v])=>(
          <div key={l} style={{fontSize:12,color:R.dark,marginBottom:10}}><div style={{fontWeight:700,color:R.black,marginBottom:2,fontSize:11,textTransform:"uppercase",letterSpacing:.5}}>{l}</div><div style={{lineHeight:1.6}}>{v}</div></div>
        ))}
        {item.theme&&(
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              <TTag t={item.theme} themes={themes}/>
              {relatedEvent && (<button onClick={()=>onSelectEvent(relatedEvent)} style={{fontSize:9,color:R.dark,background:R.grey,border:"none",borderRadius:6,padding:"2px 7px",cursor:"pointer",fontWeight:600}}>View key date →</button>)}
            </div>
            <LinkedContentList items={linked} areas={areas} onSelect={onSelectLinked}/>
          </div>
        )}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:9,fontWeight:700,color:R.dark,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Output link</div>
          {item.url?(<a href={item.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:a.color,wordBreak:"break-all"}}>{item.url}</a>):(<span style={{fontSize:11,color:"#ccc",fontStyle:"italic"}}>Not yet published</span>)}
        </div>

        {item.state==="review" && actionMode===null && (
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button onClick={()=>setActionMode("approve")} style={{flex:1,background:R.lime,color:R.black,border:"none",borderRadius:10,padding:"12px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>Approve</button>
            <button onClick={()=>setActionMode("reject")} style={{flex:1,background:R.white,color:"#ef4444",border:"1px solid #ef4444",borderRadius:10,padding:"12px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>Request Changes</button>
          </div>
        )}
        {actionMode!==null && (
          <div style={{marginTop:12,background:R.grey,borderRadius:10,padding:12}}>
            <div style={{fontSize:10,fontWeight:700,color:R.black,marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>
              {actionMode==="approve"?"Comment (optional)":"What needs to change? (required)"}
            </div>
            <textarea autoFocus style={{...inputStyle,minHeight:60,resize:"vertical",background:R.white}} value={draft} onChange={e=>setDraft(e.target.value)} placeholder={actionMode==="approve"?"Looks great...":"Explain what needs changing..."}/>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <button onClick={submitAction} disabled={actionMode==="reject"&&!draft.trim()} style={{flex:1,background:(actionMode==="reject"&&!draft.trim())?R.mid:R.lime,color:R.black,border:"none",borderRadius:8,padding:"9px 0",fontSize:11,fontWeight:700,cursor:(actionMode==="reject"&&!draft.trim())?"not-allowed":"pointer"}}>{actionMode==="approve"?"Confirm Approval":"Submit"}</button>
              <button onClick={()=>{setActionMode(null);setDraft("");}} style={{padding:"9px 14px",background:R.white,color:R.dark,border:`1px solid ${R.mid}`,borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        )}
        {item.state==="input"&&actionMode===null&&(<div style={{background:"#fef2f2",borderRadius:10,padding:14,marginTop:12,fontSize:11,color:"#ef4444",fontWeight:600}}>We're waiting on your input for this item</div>)}
        {item.state==="approved"&&(<div style={{background:"#f0fdf4",borderRadius:10,padding:14,marginTop:12,fontSize:11,color:"#22c55e",fontWeight:600}}>Approved</div>)}

        <div style={{marginTop:24,paddingTop:16,borderTop:`1px solid ${R.mid}`}}>
          <div style={{fontSize:9,fontWeight:700,color:R.dark,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Comments ({comments.length})</div>
          {comments.length===0 && (<div style={{fontSize:11,color:"#ccc",fontStyle:"italic",marginBottom:10}}>No comments yet</div>)}
          {comments.map(c=>(
            <div key={c.id} style={{marginBottom:10,background:R.grey,borderRadius:8,padding:"8px 10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:10,fontWeight:700,color:R.black}}>{c.author}</span>
                <span style={{fontSize:9,color:R.dark}}>{fmtTs(c.ts)}</span>
              </div>
              <div style={{fontSize:11,color:R.dark,lineHeight:1.5}}>{c.text}</div>
            </div>
          ))}
          <div style={{display:"flex",gap:6,marginTop:8}}>
            <input style={{...inputStyle,flex:1}} value={commentDraft} onChange={e=>setCommentDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")submitComment();}} placeholder={admin?"Comment as Rate Team...":"Comment as Client..."}/>
            <button onClick={submitComment} style={{background:R.black,color:R.white,border:"none",borderRadius:8,padding:"0 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Send</button>
          </div>
        </div>

        {history.length>0 && (
          <div style={{marginTop:20,paddingTop:16,borderTop:`1px solid ${R.mid}`}}>
            <div style={{fontSize:9,fontWeight:700,color:R.dark,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Activity</div>
            {[...history].reverse().map(h=>(
              <div key={h.id} style={{fontSize:10,color:R.dark,marginBottom:6,lineHeight:1.5}}>
                <strong style={{color:R.black}}>{h.by}</strong> moved this from <em>{(ST[h.from]||{}).l||h.from}</em> to <em>{(ST[h.to]||{}).l||h.to}</em> — {fmtTs(h.ts)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CALENDAR
   ══════════════════════════════════════════════ */
function CalView({items, events, areas, fArea, fTypes, fStates, onSelect, sel, admin, onAdd, onSelectEvent}) {
  const g=mkGrid(2026,7), today="2026-08-06";
  const [hoverId, setHoverId] = useState(null);
  const showKeyDates = fTypes.length===0 || fTypes.includes("keydates");
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
          const di=items.filter(it=>it.date===ds&&(!fArea||it.area===fArea)&&(fTypes.length===0||fTypes.includes(it.ch))&&(fStates.length===0||fStates.includes(it.state)));
          const dEvents = showKeyDates ? events.filter(ev=>ev.start===ds&&(!fArea||ev.areas.includes(fArea))) : [];
          return (
            <div key={i} style={{minHeight:96,background:isT?"#f5f3ff":R.white,borderRadius:10,padding:4,border:isT?`2px solid ${R.lime}`:`1px solid ${R.mid}`}}>
              <div style={{fontSize:11,fontWeight:isT?800:400,color:isT?R.black:R.dark,paddingLeft:2,marginBottom:3}}>{day}</div>
              {dEvents.map(ev=>{
                const spansDays = ev.end !== ev.start;
                return (
                  <button key={`ev-${ev.id}`} onClick={()=>onSelectEvent(ev)} title={spansDays?`${ev.title} (through ${new Date(ev.end).toLocaleDateString("en-GB",{day:"numeric",month:"short"})})`:ev.title} style={{display:"flex",alignItems:"center",gap:4,width:"100%",background:R.black,color:R.white,borderRadius:4,padding:"3px 5px",marginBottom:2,fontSize:9,fontWeight:700,border:"none",cursor:"pointer",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
                    <span style={{flexShrink:0}}>📅</span><span style={{overflow:"hidden",textOverflow:"ellipsis",flex:1}}>{ev.title}</span>
                    {spansDays && <span style={{flexShrink:0,opacity:.6}}>→</span>}
                  </button>
                );
              })}
              {di.map(item=>{
                const wip=item.state==="wip",rev=item.state==="review",inp=item.state==="input";
                const needsAttn = rev||inp;
                const ac=(areas[item.area]||{color:R.dark}).color;
                const hovered = hoverId===item.id;
                const typeInfo = CH[item.ch]||{i:"•",l:item.ch};
                const stateInfo = ST[item.state]||{};
                return (
                  <button key={item.id} onClick={()=>onSelect(sel?.id===item.id?null:item)}
                    onMouseEnter={()=>setHoverId(item.id)} onMouseLeave={()=>setHoverId(h=>h===item.id?null:h)}
                    style={{
                    position:"relative",
                    display:"flex",alignItems:"center",gap:4,background:wip?R.grey:ac+"0c",
                    borderLeft:wip?`3px dashed ${ac}`:`3px solid ${ac}`,borderRadius:4,padding:"3px 5px 3px 6px",cursor:"pointer",
                    boxShadow:sel?.id===item.id?`0 0 0 1.5px ${ac} inset`:"none",
                    fontSize:9,color:wip?R.dark:R.black,textAlign:"left",width:"100%",
                    fontWeight:500,lineHeight:1.2,marginBottom:2,
                    overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",
                  }}>
                    <span style={{fontSize:11,lineHeight:1,flexShrink:0}}>{typeInfo.i}</span>
                    <span style={{overflow:"hidden",textOverflow:"ellipsis",flex:1}}>{item.title}</span>
                    {needsAttn && (<span title={rev?"Ready for review":"Awaiting client input"} style={{flexShrink:0,width:6,height:6,borderRadius:"50%",background:rev?"#f59e42":"#ef4444"}}/>)}
                    {hovered && (
                      <div style={{position:"absolute",top:"100%",left:0,marginTop:3,zIndex:60,background:R.black,color:R.white,padding:"8px 10px",borderRadius:8,minWidth:170,maxWidth:230,boxShadow:"0 8px 20px rgba(0,0,0,.3)",pointerEvents:"none"}}>
                        <div style={{fontSize:11,fontWeight:700,marginBottom:4,whiteSpace:"normal",lineHeight:1.3}}>{item.title}</div>
                        <div style={{fontSize:9,opacity:.75,marginBottom:3}}>{typeInfo.i} {typeInfo.l}{item.platform?` · ${item.platform}`:""}</div>
                        <div style={{fontSize:9,fontWeight:700,color:stateInfo.c||"#fff"}}>{stateInfo.l||item.state}</div>
                      </div>
                    )}
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
  const [strategies, setStrategies] = useState(DEFAULT_STRATEGIES);
  const [monthSummary, setMonthSummary] = useState(DEFAULT_MONTH_SUMMARY);
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [areas] = useState(DEFAULT_AREAS);
  const [themes] = useState(DEFAULT_THEMES);

  const [tab, setTab] = useState("calendar");
  const [fArea, setFA] = useState(null);
  const [fTypes, setFTypes] = useState([]);
  const [fStates, setFStates] = useState([]);
  const [sel, setSel] = useState(null);
  const [selStack, setSelStack] = useState([]);
  const [selEvent, setSelEvent] = useState(null);
  const [modal, setModal] = useState(null); // null | "add" | {editing: item} | "addStrategy" | {editingStrategy: s}

  // Load data
  useEffect(() => {
    (async () => {
      const data = await loadAll();
      if (data) {
        if (data.items) setItems(data.items);
        if (data.strategies) setStrategies(data.strategies);
        if (data.monthSummary) setMonthSummary(data.monthSummary);
        if (data.events) setEvents(data.events);
      }
      setLoading(false);
    })();
  }, []);

  // Save on changes
  const save = useCallback(async (patch) => {
    await saveAll({ items, strategies, monthSummary, events, ...patch });
  }, [items, strategies, monthSummary, events]);

  function updateItems(newItems) { setItems(newItems); save({items:newItems}); }
  function updateStrategies(ns) { setStrategies(ns); save({strategies:ns}); }
  function updateMonthSummary(ns) { setMonthSummary(ns); save({monthSummary:ns}); }

  function approve(id, ns, commentText) {
    const author = admin ? "Rate Team" : "Client";
    const ni = items.map(i => {
      if (i.id !== id) return i;
      const histEntry = {id:`h${Date.now()}`, ts:new Date().toISOString(), from:i.state, to:ns, by:author};
      const newComments = commentText ? [...(i.comments||[]), {id:`c${Date.now()}`, author, ts:new Date().toISOString(), text:commentText}] : (i.comments||[]);
      return {...i, state:ns, history:[...(i.history||[]), histEntry], comments:newComments};
    });
    updateItems(ni);
    if (sel?.id===id) setSel(ni.find(i=>i.id===id));
  }

  function addComment(id, text) {
    const author = admin ? "Rate Team" : "Client";
    const ni = items.map(i => i.id===id ? {...i, comments:[...(i.comments||[]), {id:`c${Date.now()}`, author, ts:new Date().toISOString(), text}]} : i);
    updateItems(ni);
    if (sel?.id===id) setSel(ni.find(i=>i.id===id));
  }

  function handleSaveItem(formData) {
    if (modal && modal.editing) {
      const ni = items.map(i => i.id===modal.editing.id ? {...formData, id:modal.editing.id} : i);
      updateItems(ni);
      setSel({...formData, id:modal.editing.id});
    } else {
      const ni = [...items, {...formData, id:nextId(items), comments:[], history:[]}];
      updateItems(ni);
    }
    setModal(null);
  }

  function handleDeleteItem(id) {
    updateItems(items.filter(i=>i.id!==id));
    closePanel();
    setModal(null);
  }

  function handleSaveStrategy(formData) {
    if (modal && modal.editingStrategy) {
      updateStrategies(strategies.map(s => s.id===modal.editingStrategy.id ? {...formData, id:modal.editingStrategy.id} : s));
    } else {
      updateStrategies([...strategies, {...formData, id:nextStrId(strategies,"s")}]);
    }
    setModal(null);
  }

  function handleDeleteStrategy(id) {
    updateStrategies(strategies.filter(s=>s.id!==id));
    setModal(null);
  }

  function openItem(it) { setSelEvent(null); setSelStack([]); setSel(it); }
  function selectLinked(li) { setSelEvent(null); setSelStack(s => sel ? [...s, sel] : s); setSel(li); }
  function panelBack() { setSelStack(s => { if(!s.length) return s; setSel(s[s.length-1]); return s.slice(0,-1); }); }
  function closePanel() { setSel(null); setSelStack([]); }
  function selectEventFromItem(ev) { setSel(null); setSelStack([]); setSelEvent(ev); }
  function toggleFState(k) { setFStates(s => s.includes(k) ? s.filter(x=>x!==k) : [...s,k]); }

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
            <button key={t.k} onClick={()=>{setTab(t.k);closePanel();setSelEvent(null);}} style={{
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
        <div style={{background:R.white,padding:"10px 24px",borderBottom:tab==="calendar"?"none":`1px solid ${R.mid}`,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <button onClick={()=>setFA(null)} style={{padding:"5px 12px",borderRadius:8,fontSize:10,fontWeight:700,cursor:"pointer",background:!fArea?R.black:R.white,color:!fArea?R.white:R.dark,border:`1px solid ${!fArea?R.black:R.mid}`}}>All brands</button>
          {Object.entries(areas).map(([k,a])=>(
            <button key={k} onClick={()=>setFA(fArea===k?null:k)} style={{padding:"5px 12px",borderRadius:8,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,background:fArea===k?a.color+"14":R.white,color:fArea===k?a.color:R.dark,border:`1px solid ${fArea===k?a.color+"40":R.mid}`}}><Dot c={a.color} s={6}/>{a.label}</button>
          ))}
          {tab==="calendar"&&(<><div style={{flex:1}}/><ChDrop value={fTypes} onChange={setFTypes}/></>)}
        </div>
      )}
      {tab==="calendar"&&(
        <div style={{background:R.white,padding:"0 24px 10px",borderBottom:`1px solid ${R.mid}`,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <button onClick={()=>setFStates([])} style={{padding:"4px 10px",borderRadius:8,fontSize:9,fontWeight:700,cursor:"pointer",background:!fStates.length?R.black:R.white,color:!fStates.length?R.white:R.dark,border:`1px solid ${!fStates.length?R.black:R.mid}`}}>All statuses</button>
          {Object.entries(ST).map(([k,v])=>(
            <button key={k} onClick={()=>toggleFState(k)} style={{padding:"4px 10px",borderRadius:8,fontSize:9,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,background:fStates.includes(k)?v.c+"14":R.white,color:fStates.includes(k)?v.c:R.dark,border:`1px solid ${fStates.includes(k)?v.c+"40":R.mid}`}}><Dot c={v.c} s={6}/>{v.l}</button>
          ))}
        </div>
      )}

      {/* CONTENT */}
      <div style={{padding:"20px 24px 48px",marginRight:(sel||selEvent)?360:0,transition:"margin-right .2s"}}>
        {tab==="strategy"&&(<StrategyView strategies={strategies} areas={areas} fArea={fArea} admin={admin} monthSummary={monthSummary} onToggleSummary={(v)=>updateMonthSummary({...monthSummary,enabled:v})} onEditSummary={(text)=>updateMonthSummary({...monthSummary,text})} onOpenForm={(s)=>setModal(s?{editingStrategy:s}:"addStrategy")}/>)}
        {tab==="dates"&&(<KeyDatesView events={events} areas={areas} onSelect={(ev)=>{closePanel();setSelEvent(ev);}}/>)}
        {tab==="calendar"&&(<CalView items={items} events={events} areas={areas} fArea={fArea} fTypes={fTypes} fStates={fStates} onSelect={(it)=>{setSelEvent(null);openItem(it);}} onSelectEvent={(ev)=>{closePanel();setSelEvent(ev);}} sel={sel} admin={admin} onAdd={()=>setModal("add")}/>)}
        {tab==="approvals"&&(<ApprovalsView items={items} areas={areas} themes={themes} onSelect={(it)=>{setSelEvent(null);openItem(it);}}/>)}
        {tab==="reporting"&&(<ReportingView/>)}
      </div>

      {/* SIDE PANELS */}
      <Panel item={sel} items={items} events={events} areas={areas} themes={themes} admin={admin} onClose={closePanel} onApprove={approve} onEdit={(it)=>setModal({editing:it})} onAddComment={addComment} onSelectLinked={selectLinked} onSelectEvent={selectEventFromItem} backTo={selStack.length?selStack[selStack.length-1].title:null} onBack={panelBack}/>
      <EventPanel event={selEvent} items={items} areas={areas} themes={themes} onClose={()=>setSelEvent(null)} onSelectItem={(it)=>{setSelEvent(null);openItem(it);}}/>

      {/* MODALS */}
      <Modal open={modal==="add"} onClose={()=>setModal(null)} title="Add Content Item">
        <ItemForm areas={areas} themes={themes} onSave={handleSaveItem} onCancel={()=>setModal(null)}/>
      </Modal>
      <Modal open={modal&&modal.editing} onClose={()=>setModal(null)} title="Edit Item">
        {modal&&modal.editing&&(<ItemForm item={modal.editing} areas={areas} themes={themes} onSave={handleSaveItem} onDelete={handleDeleteItem} onCancel={()=>setModal(null)}/>)}
      </Modal>
      <Modal open={modal==="addStrategy"} onClose={()=>setModal(null)} title="New Strategy" wide>
        <StrategyForm areas={areas} onSave={handleSaveStrategy} onCancel={()=>setModal(null)}/>
      </Modal>
      <Modal open={modal&&modal.editingStrategy} onClose={()=>setModal(null)} title="Edit Strategy" wide>
        {modal&&modal.editingStrategy&&(<StrategyForm strategy={modal.editingStrategy} areas={areas} onSave={handleSaveStrategy} onDelete={handleDeleteStrategy} onCancel={()=>setModal(null)}/>)}
      </Modal>
    </div>
  );
}
