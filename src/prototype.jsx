"use client";

import { useState, useMemo, useRef, useEffect } from "react";

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
  video:{l:"Video",i:"🎥",tag:"VID"},
  print:{l:"Print",i:"🖨️",tag:"PRT"},
  casestudy:{l:"Case Study",i:"📖",tag:"CS"},
  copywriting_request:{l:"Copywriting Request",i:"✍️",tag:"CPW"},
  research_request:{l:"Research Request",i:"🔍",tag:"RSCH"},
  creative_request:{l:"Creative Request",i:"🖼️",tag:"CRE"},
  admin_request:{l:"Admin Request",i:"🗂️",tag:"ADM"},
  advisory_request:{l:"Advisory Request",i:"💬",tag:"ADV"},
  general_request:{l:"General Request",i:"❓",tag:"GEN"},
};

// Converted from a Request Inbox entry — see REQUEST_TYPES below.
const REQUEST_ITEM_TYPES = ["copywriting_request","research_request","creative_request","admin_request","advisory_request","general_request"];

const ST = {
  todo:{l:"To Do",c:"#94a3b8",bg:"#f8fafc"},
  wip:{l:"In Progress",c:"#a1a1aa",bg:"#f4f4f5"},
  review:{l:"Ready for Review",c:"#f59e42",bg:"#fff7ed"},
  input:{l:"Awaiting Client Input",c:"#ef4444",bg:"#fef2f2"},
  approved:{l:"Approved",c:"#22c55e",bg:"#f0fdf4"},
  live:{l:"Live",c:"#3b82f6",bg:"#eff6ff"},
};

function needsClientAction(item) {
  return item.state==="input" || (item.checklist||[]).some(c=>c.ownerType==="client"&&!c.done);
}

/* ══════════════════════════════════════════════
   TYPE-SPECIFIC FORM FIELDS
   Each activity type declares its own extra fields + whether it
   runs on a single date or a date range. Values live in item.fields{}.
   ══════════════════════════════════════════════ */
const TYPE_FIELDS = {
  social:{dateMode:"single",dateLabel:"Publish Date",fields:[
    {key:"platforms",label:"Platform(s)",type:"multiselect",allOption:"All",options:["All","Instagram","Facebook","X","TikTok","LinkedIn","YouTube","Pinterest"]},
    {key:"postType",label:"Post Type",type:"select",options:["Single image","Carousel","Reel / Video","Story"]},
    {key:"caption",label:"Caption",type:"textarea",large:true},
    {key:"hashtags",label:"Hashtags",type:"text"},
    {key:"scheduledTime",label:"Scheduled Time",type:"time"},
    {key:"taggedAccounts",label:"Tagged Accounts",type:"text"},
  ]},
  email:{dateMode:"single",fields:[
    {key:"subjectLine",label:"Subject Line",type:"text"},
    {key:"previewText",label:"Preview Text",type:"text"},
    {key:"segment",label:"Segment",type:"text"},
    {key:"sendTime",label:"Send Time",type:"time"},
    {key:"previewLink",label:"Preview Link",type:"text",placeholder:"https://..."},
  ]},
  blog:{dateMode:"single",fields:[
    {key:"slug",label:"Slug",type:"text",placeholder:"/blog/..."},
    {key:"author",label:"Author",type:"text"},
    {key:"metaTitle",label:"Meta Title",type:"text"},
    {key:"metaDescription",label:"Meta Description",type:"textarea"},
    {key:"category",label:"Category",type:"text"},
    {key:"seoKeywords",label:"SEO Keywords",type:"text"},
    {key:"draftLink",label:"Draft Link",type:"text",placeholder:"Google Doc / CMS URL"},
    {key:"wordCount",label:"Word Count",type:"number"},
  ]},
  campaign:{dateMode:"range",fields:[
    {key:"objective",label:"Objective",type:"text"},
    {key:"channelsInvolved",label:"Channels Involved",type:"text"},
    {key:"landingPage",label:"Landing Page",type:"text"},
    {key:"budget",label:"Budget",type:"currency"},
  ]},
  paid:{dateMode:"range",fields:[
    {key:"adPlatform",label:"Ad Platform",type:"select",options:["Meta","Google","LinkedIn","TikTok"]},
    {key:"adType",label:"Ad Type",type:"text"},
    {key:"headline",label:"Headline",type:"text"},
    {key:"primaryText",label:"Primary Text",type:"textarea"},
    {key:"cta",label:"CTA",type:"text"},
    {key:"targeting",label:"Targeting",type:"textarea"},
    {key:"budget",label:"Budget",type:"currency"},
    {key:"resultsImpressions",label:"Impressions (when live)",type:"number"},
    {key:"resultsClicks",label:"Clicks (when live)",type:"number"},
    {key:"resultsCtr",label:"CTR % (when live)",type:"text"},
  ]},
  pr:{dateMode:"single",fields:[
    {key:"targetPublication",label:"Target Publication",type:"text"},
    {key:"journalist",label:"Journalist",type:"text"},
    {key:"pitchAngle",label:"Pitch Angle",type:"textarea"},
    {key:"coverageType",label:"Coverage Type",type:"select",options:["Feature","News","Interview","Review","Mention"]},
    {key:"pitchStatus",label:"Pitch Status",type:"select",options:["Drafted","Sent","Followed up","Accepted","Declined"]},
    {key:"followUpDate",label:"Follow-up Date",type:"date"},
    {key:"draftLink",label:"Draft Link",type:"text",placeholder:"Google Doc / press release URL"},
  ]},
  web:{dateMode:"single",fields:[
    {key:"pageType",label:"Page Type",type:"text"},
    {key:"siteSection",label:"Site Section",type:"text"},
    {key:"developer",label:"Developer",type:"text"},
    {key:"goLiveDate",label:"Go-live Date",type:"date"},
    {key:"wireframe",label:"Wireframe Link",type:"text"},
  ]},
  shoot:{dateMode:"single",fields:[
    {key:"shootType",label:"Shoot Type",type:"text"},
    {key:"location",label:"Location",type:"text"},
    {key:"crew",label:"Crew",type:"text"},
    {key:"talent",label:"Talent",type:"text"},
    {key:"equipment",label:"Equipment",type:"textarea"},
    {key:"shotList",label:"Shot List",type:"textarea"},
    {key:"daySchedule",label:"Day Schedule",type:"textarea",placeholder:"Timeline for the day"},
    {key:"propsWardrobe",label:"Props / Wardrobe",type:"textarea"},
  ]},
  event:{dateMode:"range",fields:[
    {key:"eventType",label:"Event Type",type:"text"},
    {key:"venue",label:"Venue",type:"text"},
    {key:"attendees",label:"Attendees",type:"text"},
    {key:"registrationStatus",label:"Registration Status",type:"select",options:["Not registered","Confirmed","Cancelled"]},
    {key:"collateral",label:"Collateral",type:"textarea"},
    {key:"travelAccommodation",label:"Travel / Accommodation",type:"textarea"},
    {key:"budget",label:"Budget",type:"currency"},
    {key:"standDesignNeeded",label:"Stand Design Needed",type:"checkbox"},
    {key:"postEventLeads",label:"Post-event Leads",type:"number"},
    {key:"postEventFollowUp",label:"Post-event Follow-up",type:"textarea"},
  ]},
  strategy:{dateMode:"single",fields:[
    {key:"deliverableType",label:"Deliverable Type",type:"text"},
    {key:"format",label:"Format",type:"text"},
    {key:"approvalRequired",label:"Approval Required",type:"checkbox"},
  ]},
  design:{dateMode:"single",fields:[
    {key:"designType",label:"Design Type",type:"text"},
    {key:"format",label:"Format",type:"text"},
    {key:"designer",label:"Designer",type:"text"},
    {key:"brief",label:"Brief",type:"textarea"},
    {key:"printSpecs",label:"Print Specs",type:"textarea"},
  ]},
  report:{dateMode:"range",fields:[
    {key:"reportPeriod",label:"Report Period",type:"text"},
    {key:"channelsCovered",label:"Channels Covered",type:"text"},
  ]},
  video:{dateMode:"single",fields:[
    {key:"videoType",label:"Video Type",type:"text"},
    {key:"duration",label:"Duration",type:"text"},
    {key:"script",label:"Script",type:"textarea"},
  ]},
  print:{dateMode:"single",fields:[
    {key:"printType",label:"Print Type",type:"text"},
    {key:"dimensions",label:"Dimensions",type:"text"},
    {key:"paper",label:"Paper",type:"text"},
    {key:"quantity",label:"Quantity",type:"number"},
    {key:"printer",label:"Printer",type:"text"},
    {key:"proofDate",label:"Proof Date",type:"date"},
  ]},
  casestudy:{dateMode:"single",fields:[
    {key:"subject",label:"Subject",type:"text"},
    {key:"author",label:"Author",type:"text"},
    {key:"format",label:"Format",type:"text"},
    {key:"keyStats",label:"Key Stats",type:"textarea"},
    {key:"clientQuote",label:"Client Quote",type:"textarea"},
  ]},
};

// Ad-hoc request types (Request Inbox → "Convert to Activity") share one
// field set — the request-specific context that doesn't fit the universal
// item fields (title/notes/checklist/etc.), carried over from the request.
const REQUEST_TYPE_FIELDS = [
  {key:"requestedBy",label:"Requested By",type:"text"},
  {key:"dateReceived",label:"Date Received",type:"date"},
  {key:"source",label:"Source",type:"select",options:["Email","Call","Meeting","Portal","Other"]},
  {key:"originalMessage",label:"Original Message",type:"textarea"},
  {key:"estimatedHours",label:"Estimated Time (hrs)",type:"number"},
  {key:"inScope",label:"In Scope?",type:"select",options:["Yes","No","Review"]},
  {key:"deliverableFormat",label:"Deliverable Format",type:"text"},
];
for (const t of REQUEST_ITEM_TYPES) TYPE_FIELDS[t] = {dateMode:"single",dateLabel:"Deadline",fields:REQUEST_TYPE_FIELDS};

const DEFAULT_THEMES = {
  christie:{l:"Agatha Christie Exhibition",c:"#7c3aed",brief:"Major tentpole tied to the London Museum exhibition (Aug–Oct). Coordinated across Ulverscroft and Trade — social series, blog content and trade press outreach spotlighting large-print Christie titles."},
  booklovers:{l:"National Book Lovers Day",c:"#ec4899",brief:"Cross-brand awareness day (9 Aug). Pre-scheduled content across Ulverscroft, uLibrary and The Reading House — must be ready by the 7th."},
  b2s:{l:"Back to School",c:"#06b6d4",brief:"Education-sector push targeting school librarians ahead of the new term. uLibrary-led, with Reading House support."},
  newrelease:{l:"August New Releases",c:"#f97316",brief:"Rolling spotlight on new large-print and audio titles released in August."},
};

/* ══════════════════════════════════════════════
   DELIVERABLES / ONGOING PROJECTS
   ══════════════════════════════════════════════ */
const DELIVERABLE_STATUS = {
  on_hold:{l:"On Hold",c:"#71717a"},
  in_planning:{l:"In Planning",c:"#3b82f6"},
  in_progress:{l:"In Progress",c:"#22c55e"},
  complete:{l:"Complete",c:"#8b5cf6"},
};

/* ══════════════════════════════════════════════
   API
   All content is stored in Supabase; loaded in one shot from /api/portal and
   persisted through the per-entity route handlers under src/app/api/.
   ══════════════════════════════════════════════ */
async function api(path, options) {
  const res = await fetch(path, {
    method: options?.method || "GET",
    headers: options?.body ? { "Content-Type": "application/json" } : undefined,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

/* ══════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════ */
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MN_FULL=["January","February","March","April","May","June","July","August","September","October","November","December"];
function todayISO(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function mkGrid(y,m){const f=new Date(y,m,1),l=new Date(y,m+1,0);let s=f.getDay()===0?6:f.getDay()-1;const d=[];for(let i=0;i<s;i++)d.push(null);for(let i=1;i<=l.getDate();i++)d.push(i);while(d.length%7)d.push(null);return d;}
function fd(y,m,d){return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;}
function fmtTs(ts){ try { return new Date(ts).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}); } catch(e){ return ts; } }

// Seeds the Add Item form when converting a Request Inbox entry to an activity item.
function buildPrefillFromRequest(r, areas) {
  return {
    title: r.title,
    date: r.deadline || todayISO(),
    endDate: "",
    area: r.brand || Object.keys(areas)[0],
    ch: r.requestType,
    state: "todo",
    platform: "",
    notes: r.description || "",
    theme: "",
    url: "",
    comments: [], history: [],
    checklist: (r.requirementsChecklist||[]).map(c=>({...c})),
    attachments: [], linkedItemIds: [],
    fields: {
      requestedBy: r.requestedByName || "",
      dateReceived: r.dateReceived || "",
      source: r.source || "",
      originalMessage: r.originalMessage || "",
      estimatedHours: r.estimatedHours ?? "",
      inScope: r.inScope ? r.inScope.charAt(0).toUpperCase()+r.inScope.slice(1) : "",
      deliverableFormat: r.deliverableFormat || "",
    },
  };
}

/* ══════════════════════════════════════════════
   MICRO COMPONENTS
   ══════════════════════════════════════════════ */
function Dot({c, s = 8}) {
  return (<span style={{display:"inline-block",width:s,height:s,borderRadius:"50%",background:c,flexShrink:0}}/>);
}
function ATag({a, areas, sm}) {
  const v = (areas||DEFAULT_AREAS)[a]; if(!v) return null;
  return (<span style={{display:"inline-flex",alignItems:"center",gap:3,background:v.color+"14",color:v.color,padding:sm?"2px 7px":"3px 9px",borderRadius:6,fontSize:sm?10:11,fontWeight:700,letterSpacing:.3}}><Dot c={v.color} s={5}/>{v.short}</span>);
}
function SBadge({s}) {
  const v = ST[s]; if(!v) return null;
  return (<span style={{display:"inline-flex",alignItems:"center",gap:5,background:v.bg,color:v.c,padding:"4px 11px",borderRadius:8,fontSize:11,fontWeight:700}}><span style={{width:7,height:7,borderRadius:"50%",background:v.c}}/>{v.l}</span>);
}
function SDot({s}) {
  const v = ST[s]; if(!v) return null;
  return (<span title={v.l} style={{width:7,height:7,borderRadius:"50%",background:v.c,flexShrink:0}}/>);
}
function TTag({t, themes}) {
  if (!t) return null; const v = (themes||DEFAULT_THEMES)[t]; if(!v) return null;
  return (<span style={{display:"inline-flex",alignItems:"center",gap:4,background:v.c+"12",color:v.c,padding:"3px 9px",borderRadius:6,fontSize:10,fontWeight:700,border:`1px dashed ${v.c}40`}}><span style={{width:4,height:4,borderRadius:"50%",background:v.c}}/>{v.l}</span>);
}
function TypeTag({ch, size}) {
  const v = CH[ch]; if(!v) return null;
  return (<span title={v.l} style={{display:"inline-flex",alignItems:"center",fontSize:size||13,lineHeight:1,flexShrink:0}}>{v.i}</span>);
}
function Eyebrow({children}) {
  return (<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{width:20,height:2,background:R.lime,borderRadius:1}}/><span style={{fontSize:11,fontWeight:800,letterSpacing:1.3,textTransform:"uppercase",color:"#52525b"}}>{children}</span></div>);
}

/* ══════════════════════════════════════════════
   LINKED CONTENT LIST (reusable)
   ══════════════════════════════════════════════ */
function LinkedContentList({items, areas, onSelect, title}) {
  if (!items || !items.length) return null;
  return (
    <div style={{marginTop:10}}>
      <div style={{fontSize:10,fontWeight:700,color:"#52525b",marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>{title||"Linked content"}</div>
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
   ATTACHMENT PREVIEW (image thumbnail, falls back to a link)
   ══════════════════════════════════════════════ */
function AttachmentPreview({attachment, accentColor}) {
  const [broken, setBroken] = useState(false);
  if (!broken) {
    return (
      <a href={attachment.url} target="_blank" rel="noreferrer" style={{display:"block",marginBottom:8,borderRadius:10,overflow:"hidden",border:`1px solid ${R.mid}`}}>
        <img src={attachment.url} alt={attachment.name} onError={()=>setBroken(true)} style={{display:"block",width:"100%",maxHeight:180,objectFit:"cover",background:R.grey}}/>
        <div style={{padding:"6px 10px",fontSize:10,color:R.dark,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{attachment.name}</div>
      </a>
    );
  }
  return (
    <div style={{display:"flex",alignItems:"center",gap:7,padding:"6px 8px",background:R.grey,borderRadius:8,marginBottom:8}}>
      <span style={{fontSize:13,flexShrink:0}}>📎</span>
      <a href={attachment.url} target="_blank" rel="noreferrer" style={{flex:1,fontSize:11,color:accentColor,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{attachment.name}</a>
    </div>
  );
}

/* ══════════════════════════════════════════════
   REQUIREMENTS CHECKLIST
   ══════════════════════════════════════════════ */
function ChecklistSection({checklist, admin, onToggle, onAdd, onRemove}) {
  const [text, setText] = useState("");
  const [ownerType, setOwnerType] = useState("rate");
  const [ownerName, setOwnerName] = useState("");

  function submit() {
    if (!text.trim()) return;
    onAdd(text.trim(), ownerType, ownerName.trim() || (ownerType==="rate" ? "Rate Team" : "Client"));
    setText(""); setOwnerName("");
  }

  const done = checklist.filter(c=>c.done).length;

  return (
    <div style={{marginBottom:16}}>
      <div style={{fontSize:10,fontWeight:700,color:"#52525b",marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>
        Checklist{checklist.length>0 && ` (${done}/${checklist.length})`}
      </div>
      {checklist.length===0 && (<div style={{fontSize:11,color:R.dark,fontStyle:"italic",marginBottom:8}}>No requirements yet</div>)}
      {checklist.map(c=>{
        const canToggle = admin ? c.ownerType==="rate" : c.ownerType==="client";
        const pending = c.ownerType==="client" && !c.done;
        return (
          <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:8,marginBottom:4,background:pending?"#fef2f2":R.grey}}>
            <button onClick={()=>canToggle && onToggle(c.id)} disabled={!canToggle} title={canToggle?"Mark done":"Only the owner can toggle this"} style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${c.done?"#22c55e":R.mid}`,background:c.done?"#22c55e":R.white,cursor:canToggle?"pointer":"default",flexShrink:0,padding:0,color:R.white,fontSize:10,lineHeight:"14px",fontWeight:800}}>{c.done?"✓":""}</button>
            <span style={{flex:1,fontSize:11,color:c.done?R.dark:R.black,textDecoration:c.done?"line-through":"none"}}>{c.text}</span>
            <span style={{fontSize:9,fontWeight:700,color:c.ownerType==="client"?"#7c3aed":R.dark,background:c.ownerType==="client"?"#7c3aed14":R.mid,padding:"2px 6px",borderRadius:5,flexShrink:0}}>{c.ownerName}</span>
            {admin && (<button onClick={()=>onRemove(c.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#a1a1aa",fontSize:14,padding:0,flexShrink:0}}>×</button>)}
          </div>
        );
      })}
      {admin && (
        <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
          <input style={{...inputStyle,flex:"1 1 130px"}} value={text} onChange={e=>setText(e.target.value)} placeholder="New requirement..." onKeyDown={e=>{if(e.key==="Enter")submit();}}/>
          <select style={{...selectStyle,width:72}} value={ownerType} onChange={e=>setOwnerType(e.target.value)}>
            <option value="rate">Rate</option>
            <option value="client">Client</option>
          </select>
          <input style={{...inputStyle,width:84}} value={ownerName} onChange={e=>setOwnerName(e.target.value)} placeholder="Name"/>
          <button onClick={submit} style={{background:R.black,color:R.white,border:"none",borderRadius:8,padding:"0 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Add</button>
        </div>
      )}
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
   FORM PANEL (right-side drawer for add/edit item)
   ══════════════════════════════════════════════ */
function FormPanel({open, onClose, title, children}) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:400,background:R.white,borderLeft:`1px solid ${R.mid}`,boxShadow:"-8px 0 32px rgba(0,0,0,.14)",zIndex:150,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 20px",borderBottom:`1px solid ${R.mid}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <h2 style={{fontSize:15,fontWeight:800,margin:0,color:R.black}}>{title}</h2>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:R.dark,padding:0,lineHeight:1}}>×</button>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"20px"}}>
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
      <div style={{fontSize:11,fontWeight:700,color:"#52525b",marginBottom:5,textTransform:"uppercase",letterSpacing:.4}}>{label}</div>
      {children}
    </div>
  );
}
const inputStyle = {width:"100%",padding:"9px 11px",borderRadius:8,border:`1px solid ${R.mid}`,fontSize:13,fontFamily:"inherit",boxSizing:"border-box"};
const selectStyle = {...inputStyle, background:R.white};

/* ══════════════════════════════════════════════
   TYPE-SPECIFIC FIELD RENDERER
   ══════════════════════════════════════════════ */
function MultiSelectInput({field, value, onChange}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const selected = value || [];
  function toggle(o) {
    if (field.allOption && o===field.allOption) { onChange(selected.includes(o) ? [] : [o]); return; }
    const withoutAll = selected.filter(x=>x!==field.allOption);
    onChange(withoutAll.includes(o) ? withoutAll.filter(x=>x!==o) : [...withoutAll, o]);
  }
  const label = selected.length===0 ? "Select..." : selected.join(", ");
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button type="button" onClick={()=>setOpen(!open)} style={{...selectStyle,textAlign:"left",cursor:"pointer",color:selected.length?R.black:"#9ca3af",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",display:"flex",justifyContent:"space-between",alignItems:"center",gap:6}}>
        <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{label}</span><span style={{fontSize:9,flexShrink:0}}>▾</span>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,zIndex:50,background:R.white,borderRadius:10,border:`1px solid ${R.mid}`,boxShadow:"0 8px 24px rgba(0,0,0,.12)",overflow:"hidden",maxHeight:220,overflowY:"auto"}}>
          {field.options.map(o=>(
            <label key={o} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 12px",cursor:"pointer",background:selected.includes(o)?R.grey:R.white,fontSize:12,color:R.black}}>
              <input type="checkbox" checked={selected.includes(o)} onChange={()=>toggle(o)} style={{margin:0}}/>
              <span>{o}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function TypeFieldInput({field, value, onChange}) {
  const v = value ?? (field.type==="checkbox" ? false : "");
  if (field.type==="multiselect") return (<MultiSelectInput field={field} value={value} onChange={onChange}/>);
  if (field.type==="textarea") return (<textarea style={{...inputStyle,minHeight:field.large?130:50,fontSize:field.large?13:12,lineHeight:1.5,resize:"vertical"}} value={v} onChange={e=>onChange(e.target.value)} placeholder={field.placeholder}/>);
  if (field.type==="select") return (
    <select style={selectStyle} value={v} onChange={e=>onChange(e.target.value)}>
      <option value="">Select...</option>
      {field.options.map(o=>(<option key={o} value={o}>{o}</option>))}
    </select>
  );
  if (field.type==="checkbox") return (
    <label style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:R.black,padding:"7px 0"}}>
      <input type="checkbox" checked={!!v} onChange={e=>onChange(e.target.checked)}/> Yes
    </label>
  );
  if (field.type==="number") return (<input type="number" style={inputStyle} value={v} onChange={e=>onChange(e.target.value)} placeholder={field.placeholder}/>);
  if (field.type==="date") return (<input type="date" style={inputStyle} value={v} onChange={e=>onChange(e.target.value)}/>);
  if (field.type==="time") return (<input type="time" style={inputStyle} value={v} onChange={e=>onChange(e.target.value)}/>);
  if (field.type==="currency") return (<input type="text" style={inputStyle} value={v} onChange={e=>onChange(e.target.value)} placeholder={field.placeholder||"£"}/>);
  return (<input type="text" style={inputStyle} value={v} onChange={e=>onChange(e.target.value)} placeholder={field.placeholder}/>);
}

function TypeFieldsForm({ch, values, onChange}) {
  const config = TYPE_FIELDS[ch];
  if (!config || !config.fields.length) return null;
  return (
    <>
      {config.fields.map(f=>(
        <Field key={f.key} label={f.label}>
          <TypeFieldInput field={f} value={values[f.key]} onChange={(v)=>onChange(f.key,v)}/>
        </Field>
      ))}
    </>
  );
}

function TypeFieldsDisplay({ch, values}) {
  const config = TYPE_FIELDS[ch];
  if (!config) return null;
  const entries = config.fields.filter(f=>{
    const v = (values||{})[f.key];
    if (f.type==="checkbox") return !!v;
    if (f.type==="multiselect") return Array.isArray(v) && v.length>0;
    return v!==undefined && v!==null && v!=="";
  });
  if (!entries.length) return null;
  return (
    <>
      {entries.map(f=>(
        <div key={f.key} style={{fontSize:13,color:"#3f3f46",marginBottom:10}}>
          <div style={{fontWeight:700,color:R.black,marginBottom:2,fontSize:10,textTransform:"uppercase",letterSpacing:.5}}>{f.label}</div>
          <div style={{lineHeight:1.6,whiteSpace:"pre-wrap"}}>{f.type==="checkbox" ? "Yes" : f.type==="multiselect" ? values[f.key].join(", ") : values[f.key]}</div>
        </div>
      ))}
    </>
  );
}

/* ══════════════════════════════════════════════
   ITEM FORM (add + edit)
   ══════════════════════════════════════════════ */
function ItemForm({item, prefill, areas, themes, items, defaultDate, defaultArea, onSave, onDelete, onCancel}) {
  const [f, setF] = useState(item || prefill || {title:"",date:defaultDate||todayISO(),endDate:"",area:defaultArea||Object.keys(areas)[0],ch:"social",state:"todo",platform:"",notes:"",theme:"",url:"",comments:[],history:[],checklist:[],attachments:[],linkedItemIds:[],fields:{}});
  const upd = (k,v) => setF(p=>({...p,[k]:v}));
  const updField = (k,v) => setF(p=>({...p,fields:{...(p.fields||{}),[k]:v}}));

  const [attName, setAttName] = useState("");
  const [attUrl, setAttUrl] = useState("");
  function addAttachment() {
    if (!attName.trim() || !attUrl.trim()) return;
    upd("attachments", [...(f.attachments||[]), {id:`att${Date.now()}`, name:attName.trim(), url:attUrl.trim()}]);
    setAttName(""); setAttUrl("");
  }
  function removeAttachment(id) { upd("attachments", (f.attachments||[]).filter(a=>a.id!==id)); }

  const [linkSearch, setLinkSearch] = useState("");
  const allItems = items || [];
  const linkedIds = f.linkedItemIds || [];
  const linkedItems = allItems.filter(i=>linkedIds.includes(i.id));
  const linkMatches = linkSearch.trim() ? allItems.filter(i => i.id!==(item&&item.id) && !linkedIds.includes(i.id) && i.title.toLowerCase().includes(linkSearch.trim().toLowerCase())).slice(0,6) : [];
  function addLink(id) { upd("linkedItemIds", [...linkedIds, id]); setLinkSearch(""); }
  function removeLink(id) { upd("linkedItemIds", linkedIds.filter(x=>x!==id)); }

  const typeConfig = TYPE_FIELDS[f.ch];
  const isRange = typeConfig && typeConfig.dateMode==="range";

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <span style={{fontSize:10,fontWeight:700,color:R.dark,textTransform:"uppercase",letterSpacing:.5}}>Activity Type</span>
        <select value={f.ch} onChange={e=>upd("ch",e.target.value)} style={{fontSize:12,fontWeight:700,color:R.black,padding:"6px 10px",borderRadius:20,border:`1px solid ${R.mid}`,background:R.grey,cursor:"pointer"}}>
          {Object.entries(CH).map(([k,v])=>(<option key={k} value={k}>{v.i} {v.l}</option>))}
        </select>
      </div>
      <Field label="Title"><input style={inputStyle} value={f.title} onChange={e=>upd("title",e.target.value)} placeholder="e.g. Christie LP spotlight"/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Brand">
          <select style={selectStyle} value={f.area} onChange={e=>upd("area",e.target.value)}>
            {Object.entries(areas).map(([k,v])=>(<option key={k} value={k}>{v.label}</option>))}
          </select>
        </Field>
        <Field label="Status">
          <select style={selectStyle} value={f.state} onChange={e=>upd("state",e.target.value)}>
            {Object.entries(ST).map(([k,v])=>(<option key={k} value={k}>{v.l}</option>))}
          </select>
        </Field>
      </div>
      {isRange ? (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Start Date"><input type="date" style={inputStyle} value={f.date} onChange={e=>upd("date",e.target.value)}/></Field>
          <Field label="End Date"><input type="date" style={inputStyle} value={f.endDate||""} onChange={e=>upd("endDate",e.target.value)}/></Field>
        </div>
      ) : (
        <Field label={(typeConfig&&typeConfig.dateLabel)||"Date"}><input type="date" style={inputStyle} value={f.date} onChange={e=>upd("date",e.target.value)}/></Field>
      )}
      <TypeFieldsForm ch={f.ch} values={f.fields||{}} onChange={updField}/>

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

      <Field label="Attachments">
        {(f.attachments||[]).map(a=>(
          <div key={a.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",background:R.grey,borderRadius:8,marginBottom:4}}>
            <span style={{fontSize:13,flexShrink:0}}>📎</span>
            <a href={a.url} target="_blank" rel="noreferrer" style={{flex:1,fontSize:11,color:R.black,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.name}</a>
            <button type="button" onClick={()=>removeAttachment(a.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#a1a1aa",fontSize:14,flexShrink:0}}>×</button>
          </div>
        ))}
        <div style={{display:"flex",gap:6}}>
          <input style={{...inputStyle,flex:1}} value={attName} onChange={e=>setAttName(e.target.value)} placeholder="File name"/>
          <input style={{...inputStyle,flex:2}} value={attUrl} onChange={e=>setAttUrl(e.target.value)} placeholder="Link (Drive, Dropbox...)"/>
          <button type="button" onClick={addAttachment} style={{background:R.black,color:R.white,border:"none",borderRadius:8,padding:"0 12px",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>Add</button>
        </div>
      </Field>

      <Field label="Linked Content">
        {linkedItems.map(li=>(
          <div key={li.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",background:R.grey,borderRadius:8,marginBottom:4}}>
            <TypeTag ch={li.ch}/>
            <span style={{flex:1,fontSize:11,color:R.black,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{li.title}</span>
            <button type="button" onClick={()=>removeLink(li.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#a1a1aa",fontSize:14,flexShrink:0}}>×</button>
          </div>
        ))}
        <div style={{position:"relative"}}>
          <input style={inputStyle} value={linkSearch} onChange={e=>setLinkSearch(e.target.value)} placeholder="Search items to link..."/>
          {linkMatches.length>0 && (
            <div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:4,zIndex:10,background:R.white,border:`1px solid ${R.mid}`,borderRadius:8,boxShadow:"0 8px 20px rgba(0,0,0,.12)",overflow:"hidden"}}>
              {linkMatches.map(m=>(
                <button key={m.id} type="button" onClick={()=>addLink(m.id)} style={{display:"block",width:"100%",textAlign:"left",padding:"8px 10px",border:"none",background:R.white,cursor:"pointer",fontSize:11}}>{(CH[m.ch]||{}).i} {m.title}</button>
              ))}
            </div>
          )}
        </div>
      </Field>

      <div style={{display:"flex",gap:8,marginTop:16}}>
        <button onClick={()=>onSave({...f,comments:f.comments||[],history:f.history||[],checklist:f.checklist||[],attachments:f.attachments||[],linkedItemIds:f.linkedItemIds||[],fields:f.fields||{}})} style={{flex:1,background:R.lime,color:R.black,border:"none",borderRadius:10,padding:"10px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>{item?"Save Changes":"Add Item"}</button>
        <button onClick={onCancel} style={{padding:"10px 16px",background:R.white,color:R.dark,border:`1px solid ${R.mid}`,borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>Cancel</button>
        {item && onDelete && (<button onClick={()=>onDelete(item.id)} style={{padding:"10px 16px",background:R.white,color:"#ef4444",border:"1px solid #ef4444",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>Delete</button>)}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   TOGGLE SWITCH
   ══════════════════════════════════════════════ */
function ToggleSwitch({on, onChange}) {
  return (
    <button type="button" onClick={onChange} style={{width:34,height:20,borderRadius:10,border:"none",cursor:"pointer",background:on?"#3b82f6":R.mid,position:"relative",flexShrink:0,padding:0}}>
      <span style={{position:"absolute",top:2,left:on?16:2,width:16,height:16,borderRadius:"50%",background:R.white,transition:"left .15s",boxShadow:"0 1px 2px rgba(0,0,0,.25)"}}/>
    </button>
  );
}

/* ══════════════════════════════════════════════
   FILTER SETTINGS (type + status, cog panel)
   ══════════════════════════════════════════════ */
const TYPE_FILTER_OPTIONS = [...Object.entries(CH).map(([k,c])=>({k,label:c.l,icon:c.i})), {k:"keydates",label:"Key Dates",icon:"📅"}];

function FilterSettings({fTypes, setFTypes, fStates, setFStates}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const toggleType = (k) => setFTypes(fTypes.includes(k) ? fTypes.filter(x=>x!==k) : [...fTypes,k]);
  const toggleState = (k) => setFStates(fStates.includes(k) ? fStates.filter(x=>x!==k) : [...fStates,k]);
  const activeCount = fTypes.length + fStates.length;
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(!open)} style={{padding:"6px 12px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",background:activeCount?R.black:R.white,color:activeCount?R.white:R.dark,border:`1px solid ${activeCount?R.black:R.mid}`,display:"flex",alignItems:"center",gap:6}}>
        <span aria-hidden>⚙</span> Filters{activeCount>0 && (<span style={{background:R.lime,color:R.black,fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:10}}>{activeCount}</span>)}
      </button>
      {open&&(
        <div style={{position:"absolute",top:"100%",right:0,marginTop:6,zIndex:50,background:R.white,borderRadius:14,border:`1px solid ${R.mid}`,boxShadow:"0 12px 32px rgba(0,0,0,.15)",overflow:"hidden",width:280,maxHeight:420,display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${R.mid}`}}>
            <span style={{fontSize:12,fontWeight:800,color:R.black}}>Filters</span>
            {activeCount>0 && (<button onClick={()=>{setFTypes([]);setFStates([]);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,fontWeight:700,color:R.dark}}>Clear all</button>)}
          </div>
          <div style={{overflowY:"auto",padding:"8px 0"}}>
            <div style={{padding:"6px 16px",fontSize:9,fontWeight:800,color:R.dark,textTransform:"uppercase",letterSpacing:.6}}>Activity Type</div>
            {TYPE_FILTER_OPTIONS.map(o=>(
              <div key={o.k} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 16px",fontSize:12,color:R.black}}>
                <span style={{width:16,textAlign:"center",flexShrink:0}}>{o.icon}</span>
                <span style={{flex:1}}>{o.label}</span>
                <ToggleSwitch on={fTypes.includes(o.k)} onChange={()=>toggleType(o.k)}/>
              </div>
            ))}
            <div style={{padding:"10px 16px 6px",fontSize:9,fontWeight:800,color:R.dark,textTransform:"uppercase",letterSpacing:.6,borderTop:`1px solid ${R.mid}`,marginTop:4}}>Status</div>
            {Object.entries(ST).map(([k,v])=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 16px",fontSize:12,color:R.black}}>
                <span style={{width:16,display:"flex",justifyContent:"center",flexShrink:0}}><Dot c={v.c} s={9}/></span>
                <span style={{flex:1}}>{v.l}</span>
                <ToggleSwitch on={fStates.includes(k)} onChange={()=>toggleState(k)}/>
              </div>
            ))}
          </div>
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
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <tbody>
                  {rows.map(([l,v])=>(
                    <tr key={l}><td style={{fontWeight:700,color:R.black,padding:"9px 16px 9px 0",verticalAlign:"top",width:130,borderBottom:`1px solid ${R.grey}`}}>{l}</td><td style={{color:"#3f3f46",padding:"9px 0",lineHeight:1.6,borderBottom:`1px solid ${R.grey}`}}>{v}</td></tr>
                  ))}
                  {s.kpis && s.kpis.length>0 && (
                    <tr><td style={{fontWeight:700,color:R.black,padding:"9px 16px 9px 0",verticalAlign:"top"}}>KPIs</td><td style={{padding:"9px 0"}}>{s.kpis.map((k,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,fontSize:13,color:"#3f3f46"}}><Dot c={primary.color} s={6}/>{k}</div>))}</td></tr>
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
function KeyDatesView({events, areas, onSelect, admin, planningDates, showPlanningReference, onToggleShowPlanningReference}) {
  const sorted = [...events].sort((a,b)=>new Date(a.start)-new Date(b.start));
  let lastMonthKey = null;
  const showReferencePanel = admin || showPlanningReference;
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:32,alignItems:"flex-start"}}>
      <div style={{maxWidth:680,flex:"10 1 400px",minWidth:0}}>
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
      {showReferencePanel && (
        <PlanningReferencePanel admin={admin} dates={planningDates} visible={showPlanningReference} onToggleVisible={onToggleShowPlanningReference}/>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   PLANNING REFERENCE PANEL
   Admin's evergreen bank of industry/awareness dates for content planning.
   Visibility to the client is a per-client toggle, admin-only.
   ══════════════════════════════════════════════ */
function PlanningReferencePanel({admin, dates, visible, onToggleVisible}) {
  const byMonth = {};
  for (const d of dates) { (byMonth[d.month] ||= []).push(d); }
  const months = Object.keys(byMonth).map(Number).sort((a,b)=>a-b);
  const year = dates[0]?.year;

  return (
    <div style={{width:320,flexShrink:0,position:"sticky",top:20}}>
      <div style={{background:R.white,border:`1px solid ${R.mid}`,borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"16px 18px",borderBottom:`1px solid ${R.mid}`}}>
          <Eyebrow>Planning Reference{year?` · ${year}`:""}</Eyebrow>
          <div style={{fontSize:13,color:R.dark,lineHeight:1.5}}>Industry & awareness dates for content planning.</div>
          {admin && (
            <label style={{display:"flex",alignItems:"center",gap:7,marginTop:10,fontSize:11,fontWeight:600,color:R.black,cursor:"pointer"}}>
              <input type="checkbox" checked={visible} onChange={e=>onToggleVisible(e.target.checked)}/> Visible to client
            </label>
          )}
          {admin && !visible && (
            <div style={{marginTop:8,fontSize:10,color:"#b45309",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:6,padding:"5px 8px"}}>Only you can see this — the client can't.</div>
          )}
        </div>
        <div style={{maxHeight:560,overflowY:"auto",padding:"6px 18px 14px"}}>
          {months.map(m=>(
            <div key={m}>
              <div style={{fontSize:11,fontWeight:800,color:R.black,textTransform:"uppercase",letterSpacing:.8,margin:"14px 0 6px"}}>{MN_FULL[m-1]}</div>
              {byMonth[m].map(d=>(
                <div key={d.id} style={{padding:"8px 0",borderBottom:`1px solid ${R.grey}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"baseline"}}>
                    <div style={{fontSize:12,fontWeight:700,color:R.black,lineHeight:1.4}}>{d.title}</div>
                    {d.dateLabel && (<div style={{fontSize:10,color:R.dark,whiteSpace:"nowrap",flexShrink:0}}>{d.dateLabel}</div>)}
                  </div>
                  {d.description && (<div style={{fontSize:11,color:R.dark,lineHeight:1.5,marginTop:2}}>{d.description}</div>)}
                </div>
              ))}
            </div>
          ))}
          {!months.length && (<div style={{fontSize:12,color:R.dark,padding:"14px 0"}}>No reference dates yet.</div>)}
        </div>
      </div>
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
          <span style={{fontSize:10,fontWeight:700,color:"#52525b",textTransform:"uppercase",letterSpacing:.5}}>Key Date</span>
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
  const rv=items.filter(i=>i.state==="review"), ip=items.filter(needsClientAction);
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
          {item.ch==="social" && item.platform && (<div style={{fontSize:11,color:R.dark,marginBottom:4}}><strong>Platform:</strong> {item.platform}</div>)}
          <div style={{fontSize:11,color:R.dark}}><strong>Notes:</strong> {item.notes}</div>
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   SIDE PANEL
   ══════════════════════════════════════════════ */
function Panel({item, items, events, areas, themes, admin, onClose, onApprove, onEdit, onAddComment, onSelectLinked, onSelectEvent, backTo, onBack, onAddChecklist, onToggleChecklist, onRemoveChecklist}) {
  const [actionMode, setActionMode] = useState(null); // null | "approve" | "reject"
  const [draft, setDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const scrollRef = useRef(null);

  useEffect(()=>{ setActionMode(null); setDraft(""); setCommentDraft(""); if(scrollRef.current) scrollRef.current.scrollTop = 0; }, [item?.id]);

  if(!item) return null;
  const a = (areas||{})[item.area]||{color:R.dark};
  const themeLinked = item.theme ? items.filter(i=>i.theme===item.theme&&i.id!==item.id) : [];
  const directLinked = items.filter(i=>(item.linkedItemIds||[]).includes(i.id));
  const linked = [...directLinked, ...themeLinked.filter(i=>!directLinked.some(d=>d.id===i.id))];
  const relatedEvent = item.theme ? (events||[]).find(e=>e.theme===item.theme) : null;
  const comments = item.comments || [];
  const history = item.history || [];
  const attachments = item.attachments || [];
  const dateValue = item.endDate && item.endDate!==item.date
    ? `${new Date(item.date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})} – ${new Date(item.endDate).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}`
    : new Date(item.date).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const dateFieldLabel = (TYPE_FIELDS[item.ch]||{}).dateLabel || "Date";
  const fieldRows = [[dateFieldLabel,dateValue]];
  if (item.ch==="social" && item.platform) fieldRows.push(["Platform",item.platform]);
  fieldRows.push(["Notes",item.notes]);

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
        {fieldRows.map(([l,v])=>(
          <div key={l} style={{fontSize:13,color:"#3f3f46",marginBottom:10}}><div style={{fontWeight:700,color:R.black,marginBottom:2,fontSize:10,textTransform:"uppercase",letterSpacing:.5}}>{l}</div><div style={{lineHeight:1.6}}>{v}</div></div>
        ))}
        <TypeFieldsDisplay ch={item.ch} values={item.fields||{}}/>
        {attachments.length>0 && (
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:700,color:"#52525b",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Attachments</div>
            {attachments.map(att=>(<AttachmentPreview key={att.id} attachment={att} accentColor={a.color}/>))}
          </div>
        )}
        {(item.theme || linked.length>0)&&(
          <div style={{marginBottom:16}}>
            {item.theme&&(
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                <TTag t={item.theme} themes={themes}/>
                {relatedEvent && (<button onClick={()=>onSelectEvent(relatedEvent)} style={{fontSize:9,color:R.dark,background:R.grey,border:"none",borderRadius:6,padding:"2px 7px",cursor:"pointer",fontWeight:600}}>View key date →</button>)}
              </div>
            )}
            <LinkedContentList items={linked} areas={areas} onSelect={onSelectLinked}/>
          </div>
        )}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:"#52525b",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Output link</div>
          {item.url?(<a href={item.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:a.color,wordBreak:"break-all"}}>{item.url}</a>):(<span style={{fontSize:11,color:R.dark,fontStyle:"italic"}}>Not yet published</span>)}
        </div>

        <ChecklistSection checklist={item.checklist||[]} admin={admin} onToggle={(clId)=>onToggleChecklist(item.id,clId)} onAdd={(text,ownerType,ownerName)=>onAddChecklist(item.id,text,ownerType,ownerName)} onRemove={(clId)=>onRemoveChecklist(item.id,clId)}/>

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
          <div style={{fontSize:10,fontWeight:700,color:"#52525b",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Comments ({comments.length})</div>
          {comments.length===0 && (<div style={{fontSize:11,color:R.dark,fontStyle:"italic",marginBottom:10}}>No comments yet</div>)}
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
            <div style={{fontSize:10,fontWeight:700,color:"#52525b",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Activity</div>
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
function CalView({items, events, areas, fArea, fTypes, fStates, onSelect, sel, admin, onAdd, onAddOnDate, onSelectEvent, month, year, onPrevMonth, onNextMonth, onToday}) {
  const g=mkGrid(year,month), today=todayISO();
  const [hoverId, setHoverId] = useState(null);
  const showKeyDates = fTypes.length===0 || fTypes.includes("keydates");
  const navBtnStyle = {width:28,height:28,borderRadius:8,border:`1px solid ${R.mid}`,background:R.white,color:R.black,fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"};
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={onPrevMonth} aria-label="Previous month" style={navBtnStyle}>‹</button>
          <div style={{fontSize:16,fontWeight:800,color:R.black,minWidth:160,textAlign:"center"}}>{MN_FULL[month]} {year}</div>
          <button onClick={onNextMonth} aria-label="Next month" style={navBtnStyle}>›</button>
          <button onClick={onToday} style={{...navBtnStyle,width:"auto",padding:"0 12px",fontSize:11,fontWeight:700}}>Today</button>
        </div>
        {admin&&(<button onClick={onAdd} style={{background:R.lime,color:R.black,border:"none",borderRadius:8,padding:"8px 16px",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Add item</button>)}
      </div>
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
      <div style={{minWidth:700}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:2}}>
        {DAYS.map(d=>(<div key={d} style={{textAlign:"center",fontSize:12,fontWeight:700,color:R.dark,padding:"6px 0",textTransform:"uppercase",letterSpacing:.5}}>{d}</div>))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {g.map((day,i)=>{
          if(!day) return (<div key={i} style={{minHeight:100,background:"#f0f0f0",borderRadius:10}}/>);
          const col = i % 7;
          const ds=fd(year,month,day),isT=ds===today;
          const di=items.filter(it=>it.date===ds&&(!fArea||it.area===fArea)&&(fTypes.length===0||fTypes.includes(it.ch))&&(fStates.length===0||fStates.includes(it.state)));
          const dEvents = showKeyDates ? events.filter(ev=>ev.start===ds&&(!fArea||ev.areas.includes(fArea))) : [];
          return (
            <div key={i} style={{minHeight:100,background:isT?"#f5f3ff":R.white,borderRadius:10,padding:4,border:isT?`2px solid ${R.lime}`:`1px solid ${R.mid}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3,paddingLeft:2}}>
                {admin ? (
                  <button onClick={()=>onAddOnDate(ds)} title="Add item on this date" style={{display:"flex",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:0,fontSize:12,fontWeight:isT?800:500,color:isT?R.black:R.dark}}>
                    {day}<span style={{fontSize:12,color:"#8ab316",fontWeight:800}}>+</span>
                  </button>
                ) : (
                  <span style={{fontSize:12,fontWeight:isT?800:400,color:isT?R.black:R.dark}}>{day}</span>
                )}
              </div>
              {dEvents.map(ev=>{
                const spansDays = ev.end !== ev.start;
                return (
                  <button key={`ev-${ev.id}`} onClick={()=>onSelectEvent(ev)} title={spansDays?`${ev.title} (through ${new Date(ev.end).toLocaleDateString("en-GB",{day:"numeric",month:"short"})})`:ev.title} style={{display:"flex",alignItems:"center",gap:4,width:"100%",background:R.black,color:R.white,borderRadius:4,padding:"4px 6px",marginBottom:2,fontSize:10,fontWeight:700,border:"none",cursor:"pointer",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
                    <span style={{flexShrink:0}}>📅</span><span style={{overflow:"hidden",textOverflow:"ellipsis",flex:1}}>{ev.title}</span>
                    {spansDays && <span style={{flexShrink:0,opacity:.6}}>→</span>}
                  </button>
                );
              })}
              {di.map(item=>{
                const wip=item.state==="wip"||item.state==="todo",rev=item.state==="review",clientAction=needsClientAction(item);
                const needsAttn = rev||clientAction;
                const ac=(areas[item.area]||{color:R.dark}).color;
                const hovered = hoverId===item.id;
                const typeInfo = CH[item.ch]||{i:"•",l:item.ch};
                const stateInfo = ST[item.state]||{};
                return (
                  <button key={item.id} onClick={()=>onSelect(sel?.id===item.id?null:item)}
                    onMouseEnter={()=>setHoverId(item.id)} onMouseLeave={()=>setHoverId(h=>h===item.id?null:h)}
                    style={{
                    position:"relative",
                    display:"flex",alignItems:"center",gap:5,background:wip?R.grey:ac+"0c",
                    borderLeft:wip?`3px dashed ${ac}`:`3px solid ${ac}`,borderRadius:4,padding:"4px 6px 4px 7px",cursor:"pointer",
                    boxShadow:sel?.id===item.id?`0 0 0 1.5px ${ac} inset`:"none",
                    fontSize:10.5,color:wip?R.dark:R.black,textAlign:"left",width:"100%",
                    fontWeight:500,lineHeight:1.25,marginBottom:2,
                    overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",
                  }}>
                    <span style={{fontSize:12,lineHeight:1,flexShrink:0}}>{typeInfo.i}</span>
                    <span style={{overflow:"hidden",textOverflow:"ellipsis",flex:1}}>{item.title}</span>
                    {item.endDate && item.endDate!==item.date && (<span style={{flexShrink:0,opacity:.5,fontSize:9}}>→</span>)}
                    {needsAttn && (<span title={rev?"Ready for review":"Awaiting client input"} style={{flexShrink:0,width:6,height:6,borderRadius:"50%",background:rev?"#f59e42":"#ef4444"}}/>)}
                    {hovered && (
                      <div style={{position:"absolute",top:"100%",...(col>=5?{right:0}:{left:0}),marginTop:3,zIndex:60,background:R.black,color:R.white,padding:"10px 12px",borderRadius:8,minWidth:190,maxWidth:250,boxShadow:"0 8px 20px rgba(0,0,0,.35)",pointerEvents:"none"}}>
                        <div style={{fontSize:12,fontWeight:700,marginBottom:6,whiteSpace:"normal",lineHeight:1.35}}>{item.title}</div>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                          <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,background:"rgba(255,255,255,.15)",padding:"2px 8px",borderRadius:6}}>{typeInfo.i} {typeInfo.l}</span>
                          {(item.ch==="social"&&item.platform) && (<span style={{fontSize:10,opacity:.75}}>{item.platform}</span>)}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,color:stateInfo.c||"#fff"}}><span style={{width:6,height:6,borderRadius:"50%",background:stateInfo.c||"#fff",flexShrink:0}}/>{stateInfo.l||item.state}</div>
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
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   REPORTING — shared helpers
   ══════════════════════════════════════════════ */
const removeBtnStyle = {background:"none",border:"none",cursor:"pointer",color:"#a1a1aa",fontSize:15,padding:0,flexShrink:0};
const addBtnStyle = {background:"none",border:`1px dashed ${R.mid}`,borderRadius:8,padding:"7px 12px",fontSize:11,fontWeight:700,color:R.dark,cursor:"pointer"};
function linesToText(lines){ return (lines||[]).join("\n"); }
function textToLines(text){ return text.split("\n").map(l=>l.trim()).filter(Boolean); }

function BulletList({text, muted}) {
  const lines = textToLines(text);
  if (!lines.length) return null;
  return (
    <ul style={{margin:0,paddingLeft:18,fontSize:13,color:muted?R.dark:"#3f3f46",lineHeight:1.7}}>
      {lines.map((l,i)=>(<li key={i}>{l}</li>))}
    </ul>
  );
}

function HeroStats({stats, editable, onChange}) {
  const upd = (i,k,v) => onChange(stats.map((s,idx)=>idx===i?{...s,[k]:v}:s));
  const add = () => onChange([...stats, {label:"",value:"",change:"",dir:"up"}]);
  const remove = (i) => onChange(stats.filter((_,idx)=>idx!==i));
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:28,marginTop:8}}>
      {stats.map((s,i)=>(
        <div key={i} style={{minWidth:130}}>
          {editable ? (
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <input style={{...inputStyle,fontSize:20,fontWeight:800}} value={s.value} onChange={e=>upd(i,"value",e.target.value)} placeholder="21K"/>
              <input style={{...inputStyle,fontSize:11}} value={s.label} onChange={e=>upd(i,"label",e.target.value)} placeholder="What this measures"/>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <select style={{...selectStyle,width:56,fontSize:11,padding:"6px 4px"}} value={s.dir} onChange={e=>upd(i,"dir",e.target.value)}>
                  <option value="up">↑</option><option value="down">↓</option>
                </select>
                <input style={{...inputStyle,fontSize:11}} value={s.change} onChange={e=>upd(i,"change",e.target.value)} placeholder="3.9% vs prev"/>
                <button onClick={()=>remove(i)} style={removeBtnStyle}>×</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{fontSize:28,fontWeight:800,color:R.black,letterSpacing:-.5}}>{s.value}</div>
              {s.label && <div style={{fontSize:10,color:R.dark,marginTop:2,fontWeight:600}}>{s.label}</div>}
              <div style={{fontSize:11,fontWeight:700,color:s.dir==="down"?"#dc2626":"#16a34a",marginTop:6}}>{s.dir==="down"?"↓":"↑"} {s.change}</div>
            </div>
          )}
        </div>
      ))}
      {editable && (<button onClick={add} style={{...addBtnStyle,alignSelf:"flex-start"}}>+ Add stat</button>)}
    </div>
  );
}

function EditableTable({rows, columns, editable, onChange}) {
  const upd = (i,key,val) => onChange(rows.map((r,idx)=>idx===i?{...r,[key]:val}:r));
  const add = () => onChange([...rows, columns.reduce((o,c)=>({...o,[c.key]:""}),{})]);
  const remove = (i) => onChange(rows.filter((_,idx)=>idx!==i));
  if (!editable && !rows.length) return null;
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:editable?520:0}}>
        <thead>
          <tr>
            {columns.map(c=>(<th key={c.key} style={{textAlign:"left",padding:"7px 10px",background:"#27272a",color:R.white,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.4}}>{c.label}</th>))}
            {editable && <th style={{background:"#27272a"}}/>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} style={{borderBottom:`1px solid ${R.mid}`}}>
              {columns.map(c=>(
                <td key={c.key} style={{padding:editable?"4px 6px":"8px 10px"}}>
                  {editable ? (<input style={{...inputStyle,fontSize:12,padding:"5px 7px"}} value={r[c.key]||""} onChange={e=>upd(i,c.key,e.target.value)}/>) : (<span style={{color:"#3f3f46"}}>{r[c.key]}</span>)}
                </td>
              ))}
              {editable && (<td style={{padding:"4px 6px"}}><button onClick={()=>remove(i)} style={removeBtnStyle}>×</button></td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {editable && (<button onClick={add} style={{...addBtnStyle,marginTop:8}}>+ Add row</button>)}
    </div>
  );
}

function SocialGroupsEditor({groups, areas, editable, onChange}) {
  const updGroup = (i,k,v) => onChange(groups.map((g,idx)=>idx===i?{...g,[k]:v}:g));
  const updMetrics = (i,metrics) => updGroup(i,"metrics",metrics);
  const addGroup = () => onChange([...groups, {id:`sg${Date.now()}`,brand:Object.keys(areas)[0],platform:"",metrics:[]}]);
  const removeGroup = (i) => onChange(groups.filter((_,idx)=>idx!==i));

  if (!editable && !groups.length) return null;

  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
      {groups.map((g,i)=>{
        const a = areas[g.brand] || {label:g.brand,color:R.dark};
        return (
          <div key={g.id} style={{background:R.grey,borderRadius:12,padding:16}}>
            {editable ? (
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <select style={{...selectStyle,fontSize:12}} value={g.brand} onChange={e=>updGroup(i,"brand",e.target.value)}>
                  {Object.entries(areas).map(([k,v])=>(<option key={k} value={k}>{v.label}</option>))}
                </select>
                <input style={{...inputStyle,fontSize:12}} value={g.platform} onChange={e=>updGroup(i,"platform",e.target.value)} placeholder="Platform e.g. Facebook"/>
                <button onClick={()=>removeGroup(i)} style={removeBtnStyle}>×</button>
              </div>
            ) : (
              <div style={{fontSize:14,fontWeight:800,color:R.black,marginBottom:10}}>{a.label} <span style={{color:R.dark,fontWeight:600}}>// {g.platform}</span></div>
            )}
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <tbody>
                {g.metrics.map((m,mi)=>(
                  <tr key={mi} style={{borderBottom:`1px solid ${R.mid}`}}>
                    {editable ? (
                      <>
                        <td style={{padding:"4px 4px 4px 0"}}><input style={{...inputStyle,fontSize:12,padding:"5px 7px"}} value={m.label} onChange={e=>updMetrics(i,g.metrics.map((x,xi)=>xi===mi?{...x,label:e.target.value}:x))} placeholder="Metric"/></td>
                        <td style={{padding:"4px 0"}}><input style={{...inputStyle,fontSize:12,padding:"5px 7px"}} value={m.value} onChange={e=>updMetrics(i,g.metrics.map((x,xi)=>xi===mi?{...x,value:e.target.value}:x))} placeholder="Value"/></td>
                        <td style={{width:24}}><button onClick={()=>updMetrics(i,g.metrics.filter((_,xi)=>xi!==mi))} style={removeBtnStyle}>×</button></td>
                      </>
                    ) : (
                      <><td style={{padding:"7px 0",fontWeight:700,color:R.black,width:"55%"}}>{m.label}</td><td style={{padding:"7px 0",color:"#3f3f46"}}>{m.value}</td></>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {editable && (<button onClick={()=>updMetrics(i,[...g.metrics,{label:"",value:""}])} style={{...addBtnStyle,marginTop:8,width:"100%"}}>+ Add metric</button>)}
          </div>
        );
      })}
      {editable && (<button onClick={addGroup} style={{...addBtnStyle,minHeight:80}}>+ Add platform / brand group</button>)}
    </div>
  );
}

/* ══════════════════════════════════════════════
   DELIVERABLES / ONGOING PROJECTS TRACKER
   ══════════════════════════════════════════════ */
function DeliverablesTracker({deliverables, areas, admin, onAdd, onUpdate, onRemove}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({title:"",description:"",status:"in_planning",statusNote:"",area:""});

  function submit() {
    if (!draft.title.trim()) return;
    onAdd(draft);
    setDraft({title:"",description:"",status:"in_planning",statusNote:"",area:""});
    setAdding(false);
  }

  return (
    <div style={{marginBottom:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <Eyebrow>Ongoing Projects &amp; Activity</Eyebrow>
        {admin && !adding && (<button onClick={()=>setAdding(true)} style={{background:R.black,color:R.white,border:"none",borderRadius:8,padding:"6px 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ New Project</button>)}
      </div>
      {adding && (
        <div style={{background:R.white,border:`1px solid ${R.mid}`,borderRadius:12,padding:16,marginBottom:16}}>
          <Field label="Title"><input style={inputStyle} value={draft.title} onChange={e=>setDraft(p=>({...p,title:e.target.value}))} placeholder="e.g. CRM Data Investigation"/></Field>
          <Field label="Description"><textarea style={{...inputStyle,minHeight:60,resize:"vertical"}} value={draft.description} onChange={e=>setDraft(p=>({...p,description:e.target.value}))}/></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="Status">
              <select style={selectStyle} value={draft.status} onChange={e=>setDraft(p=>({...p,status:e.target.value}))}>
                {Object.entries(DELIVERABLE_STATUS).map(([k,v])=>(<option key={k} value={k}>{v.l}</option>))}
              </select>
            </Field>
            <Field label="Brand (optional)">
              <select style={selectStyle} value={draft.area} onChange={e=>setDraft(p=>({...p,area:e.target.value}))}>
                <option value="">All / whole account</option>
                {Object.entries(areas).map(([k,v])=>(<option key={k} value={k}>{v.label}</option>))}
              </select>
            </Field>
          </div>
          <Field label="Status note"><input style={inputStyle} value={draft.statusNote} onChange={e=>setDraft(p=>({...p,statusNote:e.target.value}))} placeholder="e.g. Waiting for Lisa to return from annual leave"/></Field>
          <div style={{display:"flex",gap:8}}>
            <button onClick={submit} style={{flex:1,background:R.lime,color:R.black,border:"none",borderRadius:10,padding:"9px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>Add Project</button>
            <button onClick={()=>setAdding(false)} style={{padding:"9px 16px",background:R.white,color:R.dark,border:`1px solid ${R.mid}`,borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}
      {deliverables.length===0 && !adding && (<div style={{fontSize:12,color:R.dark,padding:20,textAlign:"center",background:R.grey,borderRadius:12}}>No ongoing projects tracked yet.</div>)}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
        {deliverables.map(d=>{
          const st = DELIVERABLE_STATUS[d.status]||{};
          return (
            <div key={d.id} style={{background:R.grey,borderRadius:12,padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6}}>
                <div style={{fontSize:14,fontWeight:800,color:R.black}}>{d.title}</div>
                {admin && (<button onClick={()=>onRemove(d.id)} style={removeBtnStyle}>×</button>)}
              </div>
              {d.area && (<div style={{marginBottom:6}}><ATag a={d.area} areas={areas} sm/></div>)}
              <div style={{fontSize:12,color:"#3f3f46",lineHeight:1.6,marginBottom:10}}>{d.description}</div>
              {admin ? (
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <select style={{...selectStyle,fontSize:11,padding:"5px 7px",width:"auto"}} value={d.status} onChange={e=>onUpdate(d.id,{status:e.target.value})}>
                    {Object.entries(DELIVERABLE_STATUS).map(([k,v])=>(<option key={k} value={k}>{v.l}</option>))}
                  </select>
                  <input style={{...inputStyle,fontSize:11,padding:"5px 7px"}} value={d.statusNote} onChange={e=>onUpdate(d.id,{statusNote:e.target.value})} placeholder="Status note"/>
                </div>
              ) : (
                <div style={{fontSize:11,fontWeight:700,color:st.c}}>{st.l}{d.statusNote?`: ${d.statusNote}`:""}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   REQUEST INBOX (admin only — never shown to the client)
   ══════════════════════════════════════════════ */
const URGENCY = {
  low:{l:"Low",c:"#71717a"},
  normal:{l:"Normal",c:"#3b82f6"},
  high:{l:"High",c:"#f59e42"},
  asap:{l:"ASAP",c:"#ef4444"},
};
const IN_SCOPE = {
  yes:{l:"In Scope",c:"#22c55e"},
  no:{l:"Out of Scope",c:"#ef4444"},
  review:{l:"Needs Review",c:"#f59e42"},
};
const REQUEST_STATUS = {
  new:{l:"New",c:"#3b82f6"},
  triaged:{l:"Triaged",c:"#f59e42"},
  converted:{l:"Converted",c:"#22c55e"},
  declined:{l:"Declined",c:"#71717a"},
};

function ContactsManager({contacts, onAdd, onRemove}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({name:"",email:"",role:""});
  function submit() {
    if (!draft.name.trim()) return;
    onAdd(draft);
    setDraft({name:"",email:"",role:""});
    setAdding(false);
  }
  return (
    <div style={{background:R.white,border:`1px solid ${R.mid}`,borderRadius:12,padding:16,marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:adding||contacts.length?10:0}}>
        <div style={{fontSize:11,fontWeight:800,color:R.black,textTransform:"uppercase",letterSpacing:.6}}>Client Contacts</div>
        {!adding && (<button onClick={()=>setAdding(true)} style={{background:"none",border:"none",color:R.black,fontSize:11,fontWeight:700,cursor:"pointer",textDecoration:"underline"}}>+ Add contact</button>)}
      </div>
      {contacts.map(c=>(
        <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${R.grey}`}}>
          <div style={{flex:1,fontSize:12,color:R.black}}><strong>{c.name}</strong>{c.role?` · ${c.role}`:""}{c.email?` · ${c.email}`:""}</div>
          <button onClick={()=>onRemove(c.id)} style={removeBtnStyle}>×</button>
        </div>
      ))}
      {adding && (
        <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
          <input style={{...inputStyle,flex:"1 1 140px"}} value={draft.name} onChange={e=>setDraft(p=>({...p,name:e.target.value}))} placeholder="Name"/>
          <input style={{...inputStyle,flex:"1 1 100px"}} value={draft.role} onChange={e=>setDraft(p=>({...p,role:e.target.value}))} placeholder="Role"/>
          <input style={{...inputStyle,flex:"1 1 160px"}} value={draft.email} onChange={e=>setDraft(p=>({...p,email:e.target.value}))} placeholder="Email"/>
          <button onClick={submit} style={{background:R.black,color:R.white,border:"none",borderRadius:8,padding:"0 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Add</button>
          <button onClick={()=>setAdding(false)} style={{background:R.white,color:R.dark,border:`1px solid ${R.mid}`,borderRadius:8,padding:"0 14px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Cancel</button>
        </div>
      )}
      {!contacts.length && !adding && (<div style={{fontSize:11,color:R.dark,marginTop:8}}>No contacts yet — add the people who send you requests.</div>)}
    </div>
  );
}

function RequestForm({contacts, areas, onSave, onCancel}) {
  const [f, setF] = useState({
    title:"", requestedByContactId:"", requestedByName:"", dateReceived:todayISO(), source:"Email",
    originalMessage:"", description:"", brand:"", requestType:"general_request", deadline:"",
    urgency:"normal", estimatedHours:"", inScope:"review", deliverableFormat:"", requirementsChecklist:[], status:"new",
  });
  const upd = (k,v) => setF(p=>({...p,[k]:v}));
  const [taskDraft, setTaskDraft] = useState("");
  function addTask() {
    if (!taskDraft.trim()) return;
    upd("requirementsChecklist", [...f.requirementsChecklist, {id:`rc${Date.now()}`, text:taskDraft.trim(), done:false}]);
    setTaskDraft("");
  }
  function removeTask(id) { upd("requirementsChecklist", f.requirementsChecklist.filter(t=>t.id!==id)); }

  function submit() {
    if (!f.title.trim()) return;
    const contact = contacts.find(c=>c.id===f.requestedByContactId);
    onSave({...f, requestedByName: contact ? contact.name : f.requestedByName, estimatedHours: f.estimatedHours===""?null:Number(f.estimatedHours)});
  }

  return (
    <div>
      <Field label="Title"><input style={inputStyle} value={f.title} onChange={e=>upd("title",e.target.value)} placeholder="e.g. RBMedia company bio"/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Requested By">
          <select style={selectStyle} value={f.requestedByContactId} onChange={e=>upd("requestedByContactId",e.target.value)}>
            <option value="">Type a name instead...</option>
            {contacts.map(c=>(<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </Field>
        <Field label="Date Received"><input type="date" style={inputStyle} value={f.dateReceived} onChange={e=>upd("dateReceived",e.target.value)}/></Field>
      </div>
      {!f.requestedByContactId && (<Field label="Name"><input style={inputStyle} value={f.requestedByName} onChange={e=>upd("requestedByName",e.target.value)} placeholder="Requester's name"/></Field>)}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Source">
          <select style={selectStyle} value={f.source} onChange={e=>upd("source",e.target.value)}>
            {["Email","Call","Meeting","Portal","Other"].map(s=>(<option key={s} value={s}>{s}</option>))}
          </select>
        </Field>
        <Field label="Request Type">
          <select style={selectStyle} value={f.requestType} onChange={e=>upd("requestType",e.target.value)}>
            {REQUEST_ITEM_TYPES.map(t=>(<option key={t} value={t}>{CH[t].l}</option>))}
          </select>
        </Field>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Brand">
          <select style={selectStyle} value={f.brand} onChange={e=>upd("brand",e.target.value)}>
            <option value="">Not sure yet</option>
            {Object.entries(areas).map(([k,v])=>(<option key={k} value={k}>{v.label}</option>))}
          </select>
        </Field>
        <Field label="Deadline (if stated)"><input type="date" style={inputStyle} value={f.deadline} onChange={e=>upd("deadline",e.target.value)}/></Field>
      </div>
      <Field label="Original Message"><textarea style={{...inputStyle,minHeight:70,resize:"vertical"}} value={f.originalMessage} onChange={e=>upd("originalMessage",e.target.value)} placeholder="Paste the email or message..."/></Field>
      <Field label="Description — what's being asked"><textarea style={{...inputStyle,minHeight:70,resize:"vertical"}} value={f.description} onChange={e=>upd("description",e.target.value)}/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Urgency">
          <select style={selectStyle} value={f.urgency} onChange={e=>upd("urgency",e.target.value)}>
            {Object.entries(URGENCY).map(([k,v])=>(<option key={k} value={k}>{v.l}</option>))}
          </select>
        </Field>
        <Field label="Estimated Time (hrs)"><input type="number" step="0.5" style={inputStyle} value={f.estimatedHours} onChange={e=>upd("estimatedHours",e.target.value)}/></Field>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="In Scope?">
          <select style={selectStyle} value={f.inScope} onChange={e=>upd("inScope",e.target.value)}>
            {Object.entries(IN_SCOPE).map(([k,v])=>(<option key={k} value={k}>{v.l}</option>))}
          </select>
        </Field>
        <Field label="Deliverable Format"><input style={inputStyle} value={f.deliverableFormat} onChange={e=>upd("deliverableFormat",e.target.value)} placeholder="e.g. 250-word bio"/></Field>
      </div>
      <Field label="Requirements Checklist">
        {f.requirementsChecklist.map(t=>(
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",background:R.grey,borderRadius:8,marginBottom:4}}>
            <span style={{flex:1,fontSize:11,color:R.black}}>{t.text}</span>
            <button type="button" onClick={()=>removeTask(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#a1a1aa",fontSize:14,flexShrink:0}}>×</button>
          </div>
        ))}
        <div style={{display:"flex",gap:6}}>
          <input style={{...inputStyle,flex:1}} value={taskDraft} onChange={e=>setTaskDraft(e.target.value)} placeholder="e.g. Draft bio" onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addTask();}}}/>
          <button type="button" onClick={addTask} style={{background:R.black,color:R.white,border:"none",borderRadius:8,padding:"0 12px",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>Add</button>
        </div>
      </Field>
      <div style={{display:"flex",gap:8,marginTop:16}}>
        <button onClick={submit} style={{flex:1,background:R.lime,color:R.black,border:"none",borderRadius:10,padding:"10px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>Log Request</button>
        <button onClick={onCancel} style={{padding:"10px 16px",background:R.white,color:R.dark,border:`1px solid ${R.mid}`,borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>Cancel</button>
      </div>
    </div>
  );
}

function RequestCard({r, areas, onUpdate, onConvert, onDecline}) {
  const urg = URGENCY[r.urgency]||URGENCY.normal;
  const scope = IN_SCOPE[r.inScope]||IN_SCOPE.review;
  return (
    <div style={{background:R.white,border:`1px solid ${R.mid}`,borderRadius:12,padding:16,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:8}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:R.black,marginBottom:3}}>{r.title}</div>
          <div style={{fontSize:11,color:R.dark}}>{r.requestedByName||"Unknown requester"} · {new Date(r.dateReceived).toLocaleDateString("en-GB",{day:"numeric",month:"short"})} · {r.source}</div>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0,flexWrap:"wrap",justifyContent:"flex-end"}}>
          <span style={{fontSize:10,fontWeight:700,color:urg.c,background:urg.c+"14",padding:"3px 8px",borderRadius:6}}>{urg.l}</span>
          <span style={{fontSize:10,fontWeight:700,color:scope.c,background:scope.c+"14",padding:"3px 8px",borderRadius:6}}>{scope.l}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
        <TypeTag ch={r.requestType} size={14}/>
        <span style={{fontSize:11,color:R.dark}}>{CH[r.requestType]?.l}</span>
        {r.brand && (<ATag a={r.brand} areas={areas} sm/>)}
        {r.deadline && (<span style={{fontSize:10,color:"#b45309",background:"#fffbeb",padding:"3px 8px",borderRadius:6,fontWeight:700}}>Due {new Date(r.deadline).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</span>)}
        {r.estimatedHours!=null && (<span style={{fontSize:10,color:R.dark,background:R.grey,padding:"3px 8px",borderRadius:6,fontWeight:700}}>~{r.estimatedHours}h</span>)}
      </div>
      {r.description && (<div style={{fontSize:12,color:"#3f3f46",lineHeight:1.6,marginBottom:10}}>{r.description}</div>)}
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <select style={{...selectStyle,fontSize:11,padding:"5px 7px",width:"auto"}} value={r.status} onChange={e=>onUpdate(r.id,{status:e.target.value})}>
          {Object.entries(REQUEST_STATUS).map(([k,v])=>(<option key={k} value={k}>{v.l}</option>))}
        </select>
        {r.status!=="converted" && r.status!=="declined" && (
          <>
            <button onClick={()=>onConvert(r)} style={{background:R.lime,color:R.black,border:"none",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Convert to Activity →</button>
            <button onClick={()=>onDecline(r.id)} style={{background:R.white,color:R.dark,border:`1px solid ${R.mid}`,borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Decline</button>
          </>
        )}
        {r.status==="converted" && (<span style={{fontSize:11,color:"#22c55e",fontWeight:700}}>✓ Converted to activity item</span>)}
      </div>
    </div>
  );
}

function RequestInboxView({requests, contacts, areas, sowSummary, onUpdateSowSummary, onAddContact, onRemoveContact, onCreateRequest, onUpdateRequest, onConvert, onDecline}) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("open");
  const [editingSow, setEditingSow] = useState(false);
  const [sowDraft, setSowDraft] = useState(sowSummary);

  const filtered = requests.filter(r => filter==="all" ? true : filter==="open" ? (r.status==="new"||r.status==="triaged") : r.status===filter);

  return (
    <div style={{maxWidth:820}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <Eyebrow>Request Inbox</Eyebrow>
          <h2 style={{fontSize:22,fontWeight:800,color:R.black,margin:0,letterSpacing:-.5}}>Ad-hoc requests, triaged before they hit the calendar.</h2>
        </div>
        {!showForm && (<button onClick={()=>setShowForm(true)} style={{background:R.black,color:R.white,border:"none",borderRadius:10,padding:"10px 16px",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>+ Log Request</button>)}
      </div>

      <div style={{background:R.black,borderRadius:14,padding:18,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:10,fontWeight:800,color:"#a3e635",textTransform:"uppercase",letterSpacing:1}}>SOW Summary — scope reference</span>
          {!editingSow && (<button onClick={()=>{setSowDraft(sowSummary);setEditingSow(true);}} style={{background:"rgba(255,255,255,.15)",color:R.white,border:"none",borderRadius:6,padding:"3px 9px",fontSize:9,fontWeight:600,cursor:"pointer"}}>Edit</button>)}
        </div>
        {editingSow ? (
          <div>
            <textarea style={{width:"100%",minHeight:70,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.2)",borderRadius:8,color:R.white,fontSize:13,padding:10,resize:"vertical",boxSizing:"border-box"}} value={sowDraft} onChange={e=>setSowDraft(e.target.value)}/>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <button onClick={()=>{onUpdateSowSummary(sowDraft);setEditingSow(false);}} style={{background:R.lime,color:R.black,border:"none",borderRadius:6,padding:"6px 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Save</button>
              <button onClick={()=>setEditingSow(false)} style={{background:"rgba(255,255,255,.1)",color:R.white,border:"none",borderRadius:6,padding:"6px 14px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        ) : (
          <p style={{fontSize:13,lineHeight:1.7,margin:0,color:"#bbb"}}>{sowSummary || "No SOW summary yet — add what's covered by the retainer so scope checks have something to reference."}</p>
        )}
      </div>

      <ContactsManager contacts={contacts} onAdd={onAddContact} onRemove={onRemoveContact}/>

      {showForm && (
        <div style={{background:R.grey,borderRadius:14,padding:18,marginBottom:20}}>
          <RequestForm contacts={contacts} areas={areas} onSave={(draft)=>{onCreateRequest(draft);setShowForm(false);}} onCancel={()=>setShowForm(false)}/>
        </div>
      )}

      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {[{k:"open",l:"Open"},{k:"all",l:"All"},{k:"new",l:"New"},{k:"triaged",l:"Triaged"},{k:"converted",l:"Converted"},{k:"declined",l:"Declined"}].map(t=>(
          <button key={t.k} onClick={()=>setFilter(t.k)} style={{padding:"5px 12px",borderRadius:8,fontSize:10,fontWeight:700,cursor:"pointer",background:filter===t.k?R.black:R.white,color:filter===t.k?R.white:R.dark,border:`1px solid ${filter===t.k?R.black:R.mid}`}}>{t.l}</button>
        ))}
      </div>

      {!filtered.length && (<div style={{fontSize:12,color:R.dark,padding:20,textAlign:"center",background:R.grey,borderRadius:12}}>No requests here.</div>)}
      {filtered.map(r=>(<RequestCard key={r.id} r={r} areas={areas} onUpdate={onUpdateRequest} onConvert={onConvert} onDecline={onDecline}/>))}
    </div>
  );
}

/* ══════════════════════════════════════════════
   REPORTING
   ══════════════════════════════════════════════ */
function ReportSectionHeading({children}) {
  return (<h3 style={{fontSize:15,fontWeight:800,color:R.black,margin:"0 0 14px",paddingBottom:8,borderBottom:`2px solid ${R.black}`}}>{children}</h3>);
}

const REPORT_ACQ_COLS = [
  {key:"channel",label:"Channel"},{key:"totalUsers",label:"Total Users"},{key:"newUsers",label:"New Users"},
  {key:"returning",label:"Returning"},{key:"avgEngagement",label:"Avg Engagement"},{key:"pctTotal",label:"% of Total"},
];
const REPORT_PAGES_COLS = [
  {key:"page",label:"Page"},{key:"views",label:"Views"},{key:"pctTotal",label:"% Total"},
  {key:"users",label:"Users"},{key:"avgEngagement",label:"Avg Engagement"},
];

/* ══════════════════════════════════════════════
   REPORT — editor (admin) + display (client), same component
   ══════════════════════════════════════════════ */
function ReportBody({report, areas, editable, onChange}) {
  const upd = (k,v) => onChange({...report,[k]:v});
  const updSummary = (k,v) => upd("summary",{...report.summary,[k]:v});
  const updWebsite = (k,v) => upd("website",{...report.website,[k]:v});
  const updContent = (k,v) => upd("content",{...report.content,[k]:v});

  return (
    <div>
      <div style={{marginBottom:36}}>
        <ReportSectionHeading>Summary</ReportSectionHeading>
        {editable ? (
          <textarea style={{...inputStyle,minHeight:120,resize:"vertical",lineHeight:1.6}} value={report.summary.narrative} onChange={e=>updSummary("narrative",e.target.value)} placeholder="Overview narrative — separate paragraphs with a blank line"/>
        ) : (
          report.summary.narrative.split("\n\n").map((p,i)=>(<p key={i} style={{fontSize:13,color:"#3f3f46",lineHeight:1.7,marginBottom:12}}>{p}</p>))
        )}
        <HeroStats stats={report.summary.stats} editable={editable} onChange={s=>updSummary("stats",s)}/>
      </div>

      <div style={{marginBottom:36}}>
        <ReportSectionHeading>Social Media</ReportSectionHeading>
        <SocialGroupsEditor groups={report.socialGroups} areas={areas} editable={editable} onChange={g=>upd("socialGroups",g)}/>
        <div style={{marginTop:16}}>
          {editable ? (
            <Field label="Social Analysis (one point per line)"><textarea style={{...inputStyle,minHeight:80,resize:"vertical"}} value={report.socialAnalysis} onChange={e=>upd("socialAnalysis",e.target.value)}/></Field>
          ) : (
            <>
              <div style={{fontSize:11,fontWeight:700,color:"#52525b",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Social Analysis</div>
              <BulletList text={report.socialAnalysis}/>
            </>
          )}
        </div>
      </div>

      <div style={{marginBottom:36}}>
        <ReportSectionHeading>Website Performance</ReportSectionHeading>
        <HeroStats stats={report.website.stats} editable={editable} onChange={s=>updWebsite("stats",s)}/>
        <div style={{fontSize:12,fontWeight:800,color:R.black,margin:"20px 0 8px"}}>User Acquisition by Channel</div>
        <EditableTable rows={report.website.acquisition} columns={REPORT_ACQ_COLS} editable={editable} onChange={r=>updWebsite("acquisition",r)}/>
        <div style={{fontSize:12,fontWeight:800,color:R.black,margin:"20px 0 8px"}}>Top Pages by Views</div>
        <EditableTable rows={report.website.topPages} columns={REPORT_PAGES_COLS} editable={editable} onChange={r=>updWebsite("topPages",r)}/>
        <div style={{marginTop:16}}>
          {editable ? (
            <Field label="Also of note (one point per line)"><textarea style={{...inputStyle,minHeight:70,resize:"vertical"}} value={report.website.notes} onChange={e=>updWebsite("notes",e.target.value)}/></Field>
          ) : (report.website.notes && (
            <>
              <div style={{fontSize:11,fontWeight:700,color:"#52525b",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Also of Note</div>
              <BulletList text={report.website.notes}/>
            </>
          ))}
        </div>
      </div>

      <div style={{marginBottom:36}}>
        <ReportSectionHeading>Content &amp; Activity</ReportSectionHeading>
        <div style={{display:"grid",gridTemplateColumns:editable?"1fr":"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
          <div>
            {editable ? (
              <Field label="Campaigns &amp; Content (one point per line)"><textarea style={{...inputStyle,minHeight:100,resize:"vertical"}} value={report.content.campaignsContent} onChange={e=>updContent("campaignsContent",e.target.value)}/></Field>
            ) : (
              <>
                <div style={{fontSize:12,fontWeight:800,color:R.black,marginBottom:8}}>Campaigns &amp; Content</div>
                <BulletList text={report.content.campaignsContent}/>
              </>
            )}
          </div>
          <div>
            {editable ? (
              <Field label="Assets Created / Pending (one point per line)"><textarea style={{...inputStyle,minHeight:80,resize:"vertical"}} value={report.content.assetsCreated} onChange={e=>updContent("assetsCreated",e.target.value)}/></Field>
            ) : (report.content.assetsCreated && (
              <>
                <div style={{fontSize:12,fontWeight:800,color:R.black,marginBottom:8}}>Assets Created</div>
                <div style={{fontSize:11,color:R.dark,marginBottom:6,fontStyle:"italic"}}>Pending sign-off and scheduling:</div>
                <BulletList text={report.content.assetsCreated}/>
              </>
            ))}
          </div>
        </div>
      </div>

      <div>
        <ReportSectionHeading>Ongoing Projects &amp; Activity</ReportSectionHeading>
        {(!report.projectsSnapshot || report.projectsSnapshot.length===0) ? (
          <div style={{fontSize:12,color:R.dark,fontStyle:"italic"}}>No projects were tracked at the time this report was generated.</div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
            {report.projectsSnapshot.map(d=>{
              const st = DELIVERABLE_STATUS[d.status]||{};
              return (
                <div key={d.id} style={{background:R.grey,borderRadius:12,padding:16}}>
                  <div style={{fontSize:13,fontWeight:800,color:R.black,marginBottom:6}}>{d.title}</div>
                  <div style={{fontSize:12,color:"#3f3f46",lineHeight:1.6,marginBottom:10}}>{d.description}</div>
                  <div style={{fontSize:11,fontWeight:700,color:st.c}}>{st.l}{d.statusNote?`: ${d.statusNote}`:""}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   REPORTING
   ══════════════════════════════════════════════ */
function ReportingView({reports, deliverables, areas, admin, onCreateDraft, onUpdateReport, onPublishReport, onAddDeliverable, onUpdateDeliverable, onRemoveDeliverable}) {
  const [openId, setOpenId] = useState(null);
  const sorted = [...reports].sort((a,b)=> (b.year-a.year) || (b.month-a.month));
  const visible = admin ? sorted : sorted.filter(r=>r.status==="published");
  const open = reports.find(r=>r.id===openId);

  const today = new Date();
  const curKey = `${today.getFullYear()}-${today.getMonth()}`;
  const hasCurrentDraft = reports.some(r=>`${r.year}-${r.month}`===curKey);
  const isMonthEndOrLater = true; // simulated: in a live app this would check today's date is on/after the last day of the month

  if (open) {
    return (
      <div style={{maxWidth:820}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <button onClick={()=>setOpenId(null)} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",padding:0,fontSize:12,fontWeight:700,color:R.dark}}>← All reports</button>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:6,background:open.status==="published"?"#f0fdf4":"#fff7ed",color:open.status==="published"?"#16a34a":"#f59e42"}}>{open.status==="published"?"Published":"Draft"}</span>
            {admin && open.status==="draft" && (<button onClick={()=>onPublishReport(open.id)} style={{background:R.lime,color:R.black,border:"none",borderRadius:8,padding:"7px 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Publish to client</button>)}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,fontWeight:700,color:R.lime==="#c8e63e"?"#8ab316":R.dark,textTransform:"uppercase",letterSpacing:1}}>Ulverscroft Group</div>
          <h2 style={{fontSize:24,fontWeight:800,color:R.black,margin:"2px 0 0",letterSpacing:-.5}}>{MN_FULL[open.month]} {open.year} Report</h2>
        </div>
        <ReportBody report={open} areas={areas} editable={admin && open.status==="draft"} onChange={(r)=>onUpdateReport(open.id,r)}/>
      </div>
    );
  }

  return (
    <div style={{maxWidth:820}}>
      {admin && !hasCurrentDraft && isMonthEndOrLater && (
        <div style={{background:R.black,borderRadius:14,padding:"18px 22px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:R.white}}>{MN_FULL[today.getMonth()]} {today.getFullYear()} report not started</div>
            <div style={{fontSize:11,color:"#999",marginTop:2}}>Auto-draft pulls in current projects — metrics still need entering.</div>
          </div>
          <button onClick={onCreateDraft} style={{background:R.lime,color:R.black,border:"none",borderRadius:8,padding:"9px 16px",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>+ Generate Draft</button>
        </div>
      )}
      <Eyebrow>Monthly Reports</Eyebrow>
      {visible.length===0 && (<div style={{fontSize:12,color:R.dark,padding:24,textAlign:"center",background:R.white,borderRadius:12,border:`1px solid ${R.mid}`,marginBottom:24}}>No reports {admin?"yet":"published yet"}.</div>)}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:32}}>
        {visible.map(r=>(
          <button key={r.id} onClick={()=>setOpenId(r.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:R.white,border:`1px solid ${R.mid}`,borderRadius:12,padding:"14px 18px",cursor:"pointer",textAlign:"left"}}>
            <span style={{fontSize:13,fontWeight:700,color:R.black}}>{MN_FULL[r.month]} {r.year}</span>
            <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:6,background:r.status==="published"?"#f0fdf4":"#fff7ed",color:r.status==="published"?"#16a34a":"#f59e42"}}>{r.status==="published"?"Published":"Draft"}</span>
          </button>
        ))}
      </div>
      <DeliverablesTracker deliverables={deliverables} areas={areas} admin={admin} onAdd={onAddDeliverable} onUpdate={onUpdateDeliverable} onRemove={onRemoveDeliverable}/>
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

  const [loginError, setLoginError] = useState("");

  const [items, setItems] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [monthSummary, setMonthSummary] = useState({enabled:false, text:""});
  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [areas, setAreas] = useState({});
  const [themes, setThemes] = useState({});
  const [planningDates, setPlanningDates] = useState([]);
  const [showPlanningReference, setShowPlanningReference] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sowSummary, setSowSummary] = useState("");

  const [tab, setTab] = useState("calendar");
  const [fArea, setFA] = useState(null);
  const [fTypes, setFTypes] = useState([]);
  const [fStates, setFStates] = useState([]);
  const [sel, setSel] = useState(null);
  const [selStack, setSelStack] = useState([]);
  const [selEvent, setSelEvent] = useState(null);
  const [modal, setModal] = useState(null); // null | "add" | {editing: item} | {creatingFromRequest: request} | "addStrategy" | {editingStrategy: s}
  const [addDefaults, setAddDefaults] = useState(null); // {date} to prefill the Add Item form
  const [calDate, setCalDate] = useState(() => { const d = new Date(); return {year:d.getFullYear(), month:d.getMonth()}; });

  // Load data
  useEffect(() => {
    (async () => {
      try {
        const data = await api("/api/portal");
        setAdmin(data.admin);
        setAreas(data.areas);
        setThemes(data.themes);
        setItems(data.items);
        setStrategies(data.strategies);
        setMonthSummary(data.monthSummary);
        setEvents(data.events);
        setReports(data.reports);
        setDeliverables(data.deliverables);
        setPlanningDates(data.planningDates);
        setShowPlanningReference(data.showPlanningReference);
        setContacts(data.contacts);
        setRequests(data.requests);
        setSowSummary(data.sowSummary);
      } catch (e) {
        console.error("Failed to load portal data", e);
      }
      setLoading(false);
    })();
  }, []);

  async function handleLoginSubmit() {
    setLoginError("");
    try {
      await api("/api/admin/login", {method:"POST", body:{passcode:adminInput}});
      setAdmin(true);
      setShowLogin(false);
      setAdminInput("");
      const data = await api("/api/portal"); // re-fetch so draft reports + admin-only data become visible
      setReports(data.reports);
      setContacts(data.contacts);
      setRequests(data.requests);
      setSowSummary(data.sowSummary);
    } catch (e) {
      setLoginError("Incorrect passcode");
    }
  }
  async function handleLogout() {
    await api("/api/admin/logout", {method:"POST"}).catch(()=>{});
    setAdmin(false);
    setReports(rs => rs.filter(r=>r.status==="published"));
    setContacts([]);
    setRequests([]);
    setSowSummary("");
    if (tab==="requests") setTab("calendar");
  }

  function patchItemLocal(id, patch) { setItems(prev => prev.map(i => i.id===id ? {...i, ...patch} : i)); }
  async function persistItemPatch(id, patch) {
    try {
      const updated = await api(`/api/items/${id}`, {method:"PATCH", body:patch});
      setItems(prev => prev.map(i => i.id===id ? updated : i));
      if (sel?.id===id) setSel(updated);
    } catch (e) { console.error("Failed to save item", e); }
  }

  function approve(id, ns, commentText) {
    const author = admin ? "Rate Team" : "Client";
    const target = items.find(i=>i.id===id);
    if (!target) return;
    const histEntry = {id:`h${Date.now()}`, ts:new Date().toISOString(), from:target.state, to:ns, by:author};
    const newComments = commentText ? [...(target.comments||[]), {id:`c${Date.now()}`, author, ts:new Date().toISOString(), text:commentText}] : (target.comments||[]);
    const patch = {state:ns, history:[...(target.history||[]), histEntry], comments:newComments};
    patchItemLocal(id, patch);
    if (sel?.id===id) setSel(s=>({...s, ...patch}));
    persistItemPatch(id, patch);
  }

  function addComment(id, text) {
    const author = admin ? "Rate Team" : "Client";
    const target = items.find(i=>i.id===id);
    if (!target) return;
    const patch = {comments:[...(target.comments||[]), {id:`c${Date.now()}`, author, ts:new Date().toISOString(), text}]};
    patchItemLocal(id, patch);
    if (sel?.id===id) setSel(s=>({...s, ...patch}));
    persistItemPatch(id, patch);
  }

  function addChecklistItem(id, text, ownerType, ownerName) {
    const target = items.find(i=>i.id===id);
    if (!target) return;
    const patch = {checklist:[...(target.checklist||[]), {id:`cl${Date.now()}`, text, ownerType, ownerName, done:false}]};
    patchItemLocal(id, patch);
    if (sel?.id===id) setSel(s=>({...s, ...patch}));
    persistItemPatch(id, patch);
  }
  function toggleChecklistItem(id, clId) {
    const target = items.find(i=>i.id===id);
    if (!target) return;
    const patch = {checklist:(target.checklist||[]).map(c=>c.id===clId?{...c,done:!c.done}:c)};
    patchItemLocal(id, patch);
    if (sel?.id===id) setSel(s=>({...s, ...patch}));
    persistItemPatch(id, patch);
  }
  function removeChecklistItem(id, clId) {
    const target = items.find(i=>i.id===id);
    if (!target) return;
    const patch = {checklist:(target.checklist||[]).filter(c=>c.id!==clId)};
    patchItemLocal(id, patch);
    if (sel?.id===id) setSel(s=>({...s, ...patch}));
    persistItemPatch(id, patch);
  }

  async function handleSaveItem(formData) {
    const convertingRequestId = modal?.creatingFromRequest?.id;
    setModal(null);
    setAddDefaults(null);
    if (modal && modal.editing) {
      const id = modal.editing.id;
      patchItemLocal(id, formData);
      setSel({...formData, id});
      await persistItemPatch(id, formData);
    } else {
      try {
        const created = await api("/api/items", {method:"POST", body:formData});
        setItems(prev => [...prev, created]);
        if (convertingRequestId) await updateRequest(convertingRequestId, {status:"converted", convertedItemId:created.id});
      } catch (e) { console.error("Failed to create item", e); }
    }
  }

  async function handleDeleteItem(id) {
    setItems(prev => prev.filter(i=>i.id!==id));
    closePanel();
    setModal(null);
    try { await api(`/api/items/${id}`, {method:"DELETE"}); }
    catch (e) { console.error("Failed to delete item", e); }
  }

  async function handleSaveStrategy(formData) {
    setModal(null);
    if (modal && modal.editingStrategy) {
      const id = modal.editingStrategy.id;
      setStrategies(prev => prev.map(s=>s.id===id?{...formData,id}:s));
      try {
        const updated = await api(`/api/strategies/${id}`, {method:"PATCH", body:formData});
        setStrategies(prev => prev.map(s=>s.id===id?updated:s));
      } catch (e) { console.error("Failed to save strategy", e); }
    } else {
      try {
        const created = await api("/api/strategies", {method:"POST", body:formData});
        setStrategies(prev => [...prev, created]);
      } catch (e) { console.error("Failed to create strategy", e); }
    }
  }

  async function handleDeleteStrategy(id) {
    setStrategies(prev => prev.filter(s=>s.id!==id));
    setModal(null);
    try { await api(`/api/strategies/${id}`, {method:"DELETE"}); }
    catch (e) { console.error("Failed to delete strategy", e); }
  }

  async function updateMonthSummary(ns) {
    setMonthSummary(ns);
    try {
      const updated = await api("/api/month-summary", {method:"PATCH", body:ns});
      setMonthSummary(updated);
    } catch (e) { console.error("Failed to save month summary", e); }
  }

  async function updateShowPlanningReference(v) {
    setShowPlanningReference(v);
    try {
      const updated = await api("/api/settings", {method:"PATCH", body:{showPlanningReference:v}});
      setShowPlanningReference(updated.showPlanningReference);
    } catch (e) { console.error("Failed to save setting", e); }
  }

  async function updateSowSummary(text) {
    setSowSummary(text);
    try {
      const updated = await api("/api/settings", {method:"PATCH", body:{sowSummary:text}});
      setSowSummary(updated.sowSummary);
    } catch (e) { console.error("Failed to save SOW summary", e); }
  }

  async function addContact(draft) {
    try {
      const created = await api("/api/contacts", {method:"POST", body:draft});
      setContacts(prev => [...prev, created]);
    } catch (e) { console.error("Failed to add contact", e); }
  }
  async function removeContact(id) {
    setContacts(prev => prev.filter(c=>c.id!==id));
    try { await api(`/api/contacts/${id}`, {method:"DELETE"}); }
    catch (e) { console.error("Failed to remove contact", e); }
  }

  async function createRequest(draft) {
    try {
      const created = await api("/api/requests", {method:"POST", body:draft});
      setRequests(prev => [created, ...prev]);
    } catch (e) { console.error("Failed to log request", e); }
  }
  async function updateRequest(id, patch) {
    setRequests(prev => prev.map(r=>r.id===id?{...r,...patch}:r));
    try {
      const updated = await api(`/api/requests/${id}`, {method:"PATCH", body:patch});
      setRequests(prev => prev.map(r=>r.id===id?updated:r));
    } catch (e) { console.error("Failed to update request", e); }
  }
  function declineRequest(id) { updateRequest(id, {status:"declined"}); }
  function convertRequestToItem(request) { setModal({creatingFromRequest:request}); }

  async function addDeliverable(draft) {
    try {
      const created = await api("/api/deliverables", {method:"POST", body:draft});
      setDeliverables(prev => [...prev, created]);
    } catch (e) { console.error("Failed to add deliverable", e); }
  }
  async function updateDeliverable(id, patch) {
    setDeliverables(prev => prev.map(d=>d.id===id?{...d,...patch}:d));
    try {
      const updated = await api(`/api/deliverables/${id}`, {method:"PATCH", body:patch});
      setDeliverables(prev => prev.map(d=>d.id===id?updated:d));
    } catch (e) { console.error("Failed to update deliverable", e); }
  }
  async function removeDeliverable(id) {
    setDeliverables(prev => prev.filter(d=>d.id!==id));
    try { await api(`/api/deliverables/${id}`, {method:"DELETE"}); }
    catch (e) { console.error("Failed to remove deliverable", e); }
  }

  async function createDraftReport() {
    try {
      const created = await api("/api/reports", {method:"POST"});
      setReports(prev => [...prev, created]);
    } catch (e) { console.error("Failed to create draft report", e); }
  }
  async function updateReport(id, updated) {
    setReports(prev => prev.map(r=>r.id===id?updated:r));
    try {
      const saved = await api(`/api/reports/${id}`, {method:"PATCH", body:updated});
      setReports(prev => prev.map(r=>r.id===id?saved:r));
    } catch (e) { console.error("Failed to save report", e); }
  }
  async function publishReport(id) {
    setReports(prev => prev.map(r=>r.id===id?{...r, status:"published"}:r));
    try {
      const saved = await api(`/api/reports/${id}`, {method:"PATCH", body:{status:"published"}});
      setReports(prev => prev.map(r=>r.id===id?saved:r));
    } catch (e) { console.error("Failed to publish report", e); }
  }

  function openItem(it) { setSelEvent(null); setSelStack([]); setSel(it); }
  function selectLinked(li) { setSelEvent(null); setSelStack(s => sel ? [...s, sel] : s); setSel(li); }
  function panelBack() { setSelStack(s => { if(!s.length) return s; setSel(s[s.length-1]); return s.slice(0,-1); }); }
  function closePanel() { setSel(null); setSelStack([]); }
  function selectEventFromItem(ev) { setSel(null); setSelStack([]); setSelEvent(ev); }
  function openAddForDate(date) { setAddDefaults({date}); setModal("add"); }
  function closeAddModal() { setModal(null); setAddDefaults(null); }
  function prevMonth() { setCalDate(({year,month}) => month===0 ? {year:year-1,month:11} : {year,month:month-1}); }
  function nextMonth() { setCalDate(({year,month}) => month===11 ? {year:year+1,month:0} : {year,month:month+1}); }
  function goToday() { const d = new Date(); setCalDate({year:d.getFullYear(), month:d.getMonth()}); }

  const rc = useMemo(()=>items.filter(i=>i.state==="review").length,[items]);
  const ic = useMemo(()=>items.filter(needsClientAction).length,[items]);

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
            <button onClick={()=>{if(admin){handleLogout();}else{setShowLogin(!showLogin);setLoginError("");}}} style={{background:"#222",borderRadius:8,padding:"5px 12px",border:"none",cursor:"pointer"}}>
              <span style={{fontSize:13,fontWeight:900,color:R.white,letterSpacing:2}}>RATE</span>
            </button>
          </div>
        </div>
        {/* Admin login */}
        {showLogin&&!admin&&(
          <div style={{paddingBottom:12}}>
            <div style={{display:"flex",gap:8}}>
              <input type="password" placeholder="Admin code" value={adminInput} onChange={e=>setAdminInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleLoginSubmit();}} style={{...inputStyle,width:140,fontSize:11,background:"#222",color:R.white,border:"1px solid #444"}}/>
              <button onClick={handleLoginSubmit} style={{background:R.lime,color:R.black,border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Go</button>
            </div>
            {loginError&&(<div style={{fontSize:10,color:"#f87171",marginTop:6}}>{loginError}</div>)}
          </div>
        )}
        {/* Tabs */}
        <div style={{display:"flex",gap:0,overflowX:"auto"}}>
          {[{k:"strategy",l:"Strategy"},{k:"dates",l:"Key Dates"},{k:"calendar",l:"Calendar"},{k:"approvals",l:"Approvals",count:rc+ic},{k:"reporting",l:"Reporting"},...(admin?[{k:"requests",l:"Requests",count:requests.filter(r=>r.status==="new").length}]:[])].map(t=>(
            <button key={t.k} onClick={()=>{setTab(t.k);closePanel();setSelEvent(null);}} style={{
              background:"none",border:"none",cursor:"pointer",padding:"14px 20px",fontSize:15,fontWeight:700,
              color:tab===t.k?R.lime:R.white,borderBottom:tab===t.k?`3px solid ${R.lime}`:"3px solid transparent",
              display:"flex",alignItems:"center",gap:7,whiteSpace:"nowrap",
            }}>
              {t.l}
              {t.count>0&&(<span style={{background:"#ef4444",color:R.white,fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10,minWidth:18,textAlign:"center"}}>{t.count}</span>)}
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
          {tab==="calendar"&&(<><div style={{flex:1}}/><FilterSettings fTypes={fTypes} setFTypes={setFTypes} fStates={fStates} setFStates={setFStates}/></>)}
        </div>
      )}

      {/* CONTENT */}
      <div style={{padding:"20px 24px 48px",marginRight:(sel||selEvent)?360:0,transition:"margin-right .2s"}}>
        {tab==="strategy"&&(<StrategyView strategies={strategies} areas={areas} fArea={fArea} admin={admin} monthSummary={monthSummary} onToggleSummary={(v)=>updateMonthSummary({...monthSummary,enabled:v})} onEditSummary={(text)=>updateMonthSummary({...monthSummary,text})} onOpenForm={(s)=>setModal(s?{editingStrategy:s}:"addStrategy")}/>)}
        {tab==="dates"&&(<KeyDatesView events={events} areas={areas} onSelect={(ev)=>{closePanel();setSelEvent(ev);}} admin={admin} planningDates={planningDates} showPlanningReference={showPlanningReference} onToggleShowPlanningReference={updateShowPlanningReference}/>)}
        {tab==="calendar"&&(<CalView items={items} events={events} areas={areas} fArea={fArea} fTypes={fTypes} fStates={fStates} onSelect={(it)=>{setSelEvent(null);openItem(it);}} onSelectEvent={(ev)=>{closePanel();setSelEvent(ev);}} sel={sel} admin={admin} onAdd={()=>openAddForDate(todayISO())} onAddOnDate={openAddForDate} month={calDate.month} year={calDate.year} onPrevMonth={prevMonth} onNextMonth={nextMonth} onToday={goToday}/>)}
        {tab==="approvals"&&(<ApprovalsView items={items} areas={areas} themes={themes} onSelect={(it)=>{setSelEvent(null);openItem(it);}}/>)}
        {tab==="reporting"&&(<ReportingView reports={reports} deliverables={deliverables} areas={areas} admin={admin} onCreateDraft={createDraftReport} onUpdateReport={updateReport} onPublishReport={publishReport} onAddDeliverable={addDeliverable} onUpdateDeliverable={updateDeliverable} onRemoveDeliverable={removeDeliverable}/>)}
        {tab==="requests"&&admin&&(<RequestInboxView requests={requests} contacts={contacts} areas={areas} sowSummary={sowSummary} onUpdateSowSummary={updateSowSummary} onAddContact={addContact} onRemoveContact={removeContact} onCreateRequest={createRequest} onUpdateRequest={updateRequest} onConvert={convertRequestToItem} onDecline={declineRequest}/>)}
      </div>

      {/* SIDE PANELS */}
      <Panel item={sel} items={items} events={events} areas={areas} themes={themes} admin={admin} onClose={closePanel} onApprove={approve} onEdit={(it)=>setModal({editing:it})} onAddComment={addComment} onSelectLinked={selectLinked} onSelectEvent={selectEventFromItem} backTo={selStack.length?selStack[selStack.length-1].title:null} onBack={panelBack} onAddChecklist={addChecklistItem} onToggleChecklist={toggleChecklistItem} onRemoveChecklist={removeChecklistItem}/>
      <EventPanel event={selEvent} items={items} areas={areas} themes={themes} onClose={()=>setSelEvent(null)} onSelectItem={(it)=>{setSelEvent(null);openItem(it);}}/>

      {/* MODALS */}
      <FormPanel open={modal==="add"} onClose={closeAddModal} title="Add Content Item">
        <ItemForm areas={areas} themes={themes} items={items} defaultDate={addDefaults?.date} defaultArea={fArea} onSave={handleSaveItem} onCancel={closeAddModal}/>
      </FormPanel>
      <FormPanel open={modal&&modal.editing} onClose={()=>setModal(null)} title="Edit Item">
        {modal&&modal.editing&&(<ItemForm item={modal.editing} areas={areas} themes={themes} items={items} onSave={handleSaveItem} onDelete={handleDeleteItem} onCancel={()=>setModal(null)}/>)}
      </FormPanel>
      <FormPanel open={modal&&modal.creatingFromRequest} onClose={()=>setModal(null)} title="Convert Request to Activity">
        {modal&&modal.creatingFromRequest&&(<ItemForm prefill={buildPrefillFromRequest(modal.creatingFromRequest, areas)} areas={areas} themes={themes} items={items} onSave={handleSaveItem} onCancel={()=>setModal(null)}/>)}
      </FormPanel>
      <Modal open={modal==="addStrategy"} onClose={()=>setModal(null)} title="New Strategy" wide>
        <StrategyForm areas={areas} onSave={handleSaveStrategy} onCancel={()=>setModal(null)}/>
      </Modal>
      <Modal open={modal&&modal.editingStrategy} onClose={()=>setModal(null)} title="Edit Strategy" wide>
        {modal&&modal.editingStrategy&&(<StrategyForm strategy={modal.editingStrategy} areas={areas} onSave={handleSaveStrategy} onDelete={handleDeleteStrategy} onCancel={()=>setModal(null)}/>)}
      </Modal>
    </div>
  );
}
