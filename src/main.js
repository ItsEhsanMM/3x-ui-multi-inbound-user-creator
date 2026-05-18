const baseUrl = import.meta.env.VITE_PANEL_BASE;
const subBase =import.meta.env.VITE_SUB_BASE;
const inboundIds = import.meta.env.VITE_INBOUND_IDS
    ?.split(",")
    .map(id => Number(id.trim()))
    .filter(Boolean);


class ThreeXUiAPI {
    constructor(baseUrl, token){
        this.baseUrl = baseUrl.replace(/\/$/,'');
        this.headers = {
            "Content-Type":"application/json",
            "Authorization":"Bearer "+token
        };
    }

    async request(url, method="GET", body=null){
        const res = await fetch(this.baseUrl+url,{
            method,
            headers:this.headers,
            body: body ? JSON.stringify(body):null
        });
        return res.json();
    }

    getInbounds(){return this.request("/panel/api/inbounds/list");}
    getStatus(){return this.request("/panel/api/server/status");}
    getOnline(){return this.request("/panel/api/inbounds/onlines","POST");}

    addClient(inboundId, payload){
        return this.request("/panel/api/inbounds/addClient","POST",{
            id:inboundId,
            settings: JSON.stringify(payload)
        });
    }


}

let api = null;
const BASE_URL = baseUrl;

function initAPI(token){
    api = new ThreeXUiAPI(BASE_URL, token);
}

function saveToken(){
    const token = document.getElementById("token-input").value.trim();

    if(!token){
        alert("توکن را وارد کنید");
        return;
    }

    localStorage.setItem("xui_token", token);

    document.getElementById("auth-modal").style.display = "none";

    initAPI(token);

    bootstrapApp();
}

function bootstrapApp(){
    loadInbounds();
    loadStats();
    loadOnline();

    setInterval(loadStats,3000);
    setInterval(loadOnline,5000);
}
// ---------------- UI ----------------

function generateEmail(){
    const c="abcdefghijklmnopqrstuvwxyz0123456789";
    let s="user_";
    for(let i=0;i<8;i++) s+=c[Math.random()*c.length|0];
    document.getElementById("client-email").value=s;
}

function formatBytes(b){
    if(!b||isNaN(b))return"0B";
    const k=1024,i=Math.log(b)/Math.log(k)|0;
    return (b/Math.pow(k,i)).toFixed(1)+" "+["B","KB","MB","GB"][i];
}

// -------- inbound UI ----------
async function loadInbounds(){

    const res = await api.getInbounds();
    const box = document.getElementById("inbound-box");
    const table = document.getElementById("inbounds-table-body");

    box.innerHTML="";
    table.innerHTML="";

    res.obj.forEach(i=>{

        // table
        table.innerHTML+=`
        <tr>
            <td>${i.id}</td>
            <td>${i.remark}</td>
            <td>${formatBytes(i.up+i.down)}</td>
        </tr>`;

        // checkbox list
        const div=document.createElement("div");
        div.className="inbound-item";
        div.innerHTML=`
            <span>${i.remark}</span>
            <input type="checkbox" value="${i.id}">
        `;
        box.appendChild(div);
    });
}



// -------- stats ----------
async function loadStats(){
    const s=await api.getStatus();
    const o=s.obj||{};

    document.getElementById("cpu-usage").innerText=
        Math.round(o.cpu||0)+"%";

    const mem=(o.mem?.current||0)/(o.mem?.total||1)*100;
    document.getElementById("ram-usage").innerText=
        Math.round(mem)+"%";

    document.getElementById("net-up").innerText=
        formatBytes(o.netIO.up||0);

            document.getElementById("net-down").innerText=
        formatBytes(o.netIO.down||0);
}

async function loadOnline(){
    const r=await api.getOnline();
    document.getElementById("online-count").innerText=
        r.obj?.length||0;
}

// -------- modal ----------
function openModal(link){
    document.getElementById("modal").style.display="flex";
    document.getElementById("sub-link").value=link;
}

function closeModal(){
    document.getElementById("modal").style.display="none";
}

function copySub(){
    const i=document.getElementById("sub-link");
    i.select();
    navigator.clipboard.writeText(i)
}

// -------- form ----------
document.getElementById("add-client-form")
.addEventListener("submit",async e=>{
    e.preventDefault();

    const email=document.getElementById("client-email").value;
    const gb=+document.getElementById("client-volume").value||0;
    // From here you can adjust inbounds
    const ids=[...inboundIds];

    if(!ids.length) return alert("select inbound");

    const uuid=crypto.randomUUID();
    const subId=crypto.randomUUID().slice(0,12);

    for(const id of ids){
        await api.addClient(id,{
            clients:[{
                id:uuid,
                email,
                subId,
                totalGB:gb*1024**3,
                enable:true
            }]
        });
    }

    const sub= `${subBase}/${subId}`;

    openModal(sub ||"NO LINK");
});

// -------- init ----------
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("xui_token");

    if(token){
        initAPI(token);
        document.getElementById("auth-modal").style.display = "none";
        bootstrapApp();
    } else {
        document.getElementById("auth-modal").style.display = "flex";
    }
});

window.saveToken = saveToken;
window.generateEmail = generateEmail;
window.openModal = openModal;
window.closeModal = closeModal;
window.copySub = copySub;