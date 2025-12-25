const WEBHOOK = "https://discord.com/api/webhooks/1453549308694761533/SetOKb8qrEWkBsnjybrg81iObq3c854nxd4StFhVk669cODRt5kic6xPSuAdIslrzlav";
const CHAT_WEBHOOK = "https://discord.com/api/webhooks/1452429911716397269/NqoTcCzIuCcBLV3OCrwx77ICr7A3hZSOCWKw5Q7CU96_Ugx9I1vz3BWMX_ZCjhcbXJgU";

/* 🔒 HARD RESET MODALI NA STARCIE */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".modal").forEach(m => m.classList.add("hidden"));
  loadChat(); // ⬅️ WCZYTAJ HISTORIĘ CZATU
});

/* TOAST */
const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");
function notify(t){
  toastText.textContent=t;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),3000);
}

/* MODALS */
function show(id){document.getElementById(id).classList.remove("hidden")}
function hideAll(){document.querySelectorAll(".modal").forEach(m=>m.classList.add("hidden"))}
document.addEventListener("click",e=>{if(e.target.classList.contains("modal")) hideAll()})

/* MENU */
let menuTimer;
function openMenu(){megaMenu.style.display="block"}
function closeMenu(){megaMenu.style.display="none"}
function closeMenuDelayed(){menuTimer=setTimeout(closeMenu,300)}
function cancelClose(){clearTimeout(menuTimer)}

/* NAV */
function openLogin(){hideAll();show("loginModal")}
function openRegister(){hideAll();show("registerModal")}
function openGiveaway(){hideAll();show("giveawayModal")}
function openMatches(){closeMenu();show("matchesModal")}
function openTable(){closeMenu();show("tableModal")}
function openDiscord(){window.open("https://discord.gg/kfh9yNUyYS","_blank")}
function goHome(){window.scrollTo({top:0,behavior:"smooth"})}

/* USERS */
function getUsers(){return JSON.parse(localStorage.getItem("users")||"[]")}
function saveUsers(u){localStorage.setItem("users",JSON.stringify(u))}

/* FAKE LOADING */
function fakeLoading(steps, cb){
  let i = 0;
  show("loadingModal");
  const txt = document.getElementById("loadingText");
  const it = setInterval(()=>{
    txt.textContent = steps[i++];
    if(i >= steps.length){
      clearInterval(it);
      hideAll();
      cb && cb();
    }
  }, 900);
}

/* INIT */
function init(){
  hideAll();
  const s=localStorage.session;
  navAuth.classList.toggle("hidden",!!s);
  navProfile.classList.toggle("hidden",!s);

  if(s){
    const u=getUsers().find(x=>x.login===s);
    navNick.textContent=u.profile.display;
    renderAvatar(navAvatar,u.profile);
    animateCounter();
  }
}
init();

/* AUTH */
function register(){
  const u=getUsers();
  if(u.find(x=>x.login===regUser.value)){notify("Login zajęty");return}

  fakeLoading([
    "Sprawdzanie danych...",
    "Tworzenie konta...",
    "Zabezpieczanie profilu...",
    "Finalizacja..."
  ],()=>{
    u.push({
      login:regUser.value,
      password:regPass.value,
      profile:{
        display:regUser.value,
        bio:"",
        avatar:"",
        color:"#"+Math.random().toString(16).slice(2,8),
        giveaway:false
      }
    });
    saveUsers(u);
    notify("Konto utworzone");
  });
}

function login(){
  const u=getUsers().find(x=>x.login===loginUser.value && x.password===loginPass.value);
  if(!u){notify("Błędne dane");return}

  fakeLoading([
    "Weryfikacja danych...",
    "Logowanie...",
    "Synchronizacja profilu..."
  ],()=>{
    localStorage.session=u.login;
    init();
    notify("Zalogowano");
  });
}

function logout(){
  fakeLoading([
    "Wylogowywanie...",
    "Czyszczenie sesji..."
  ],()=>{
    localStorage.removeItem("session");
    location.reload();
  });
}

/* PROFILE */
function toggleProfileMenu(){profileDropdown.classList.toggle("hidden")}
function openProfile(){
  const u=getUsers().find(x=>x.login===localStorage.session);
  displayName.value=u.profile.display;
  bio.value=u.profile.bio;
  renderAvatar(avatarPreview,u.profile);
  hideAll();show("profileModal");
}

function saveProfile(){
  fakeLoading(["Zapisywanie profilu..."],()=>{
    const users=getUsers();
    const u=users.find(x=>x.login===localStorage.session);
    u.profile.display=displayName.value;
    u.profile.bio=bio.value;
    saveUsers(users);
    navNick.textContent=u.profile.display;
    notify("Profil zapisany");
  });
}

/* AVATAR */
function renderAvatar(el,p){
  if(p.avatar){
    el.style.backgroundImage=`url(${p.avatar})`;
    el.textContent="";
  }else{
    el.style.background=p.color;
    el.style.backgroundImage="";
    el.textContent=p.display[0].toUpperCase();
  }
}

function uploadAvatar(e){
  const f=e.target.files[0];
  if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    fakeLoading(["Zapisywanie avatara..."],()=>{
      const users=getUsers();
      const u=users.find(x=>x.login===localStorage.session);
      u.profile.avatar=r.result;
      saveUsers(users);
      renderAvatar(navAvatar,u.profile);
      renderAvatar(avatarPreview,u.profile);
      notify("Avatar zapisany");
    });
  };
  r.readAsDataURL(f);
}

/* GIVEAWAY */
function tryJoinGiveaway(){
  if(!localStorage.session){notify("Zaloguj się");openLogin();return}
  const u=getUsers().find(x=>x.login===localStorage.session);
  if(u.profile.giveaway){notify("Już wziąłeś udział");return}
  hideAll();show("giveawayFormModal");
}

function submitGiveaway(){
  const users=getUsers();
  const u=users.find(x=>x.login===localStorage.session);
  if(u.profile.giveaway){notify("Już wysłane");return}

  fakeLoading([
    "Odczytywanie zgłoszenia...",
    "Sprawdzanie danych...",
    "Wysyłanie na Discorda..."
  ],()=>{
    fetch(WEBHOOK,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        embeds:[{
          title:"🎁 NOWE ZGŁOSZENIE GIVEAWAY",
          color:5793266,
          fields:[
            {name:"👤 Użytkownik",value:u.profile.display},
            {name:"🆔 Discord",value:`<@${discordId.value}>`},
            {name:"💬 Opinia",value:opinion.value}
          ],
          footer:{text:"MECHTAL Community"}
        }]
      })
    });

    u.profile.giveaway=true;
    saveUsers(users);
    animateCounter();
    notify("Zgłoszenie wysłane");
  });
}

/* COUNTER */
function animateCounter(){
  const count=getUsers().filter(u=>u.profile.giveaway).length;
  let i=0;
  const el=document.getElementById("giveCounter");
  const it=setInterval(()=>{
    el.textContent=i++;
    if(i>count)clearInterval(it);
  },30);
}

/* =========================
   💬 LIVE CHAT (PAMIĘĆ + WEBHOOK)
   ========================= */

function toggleChat(){
  document.getElementById("chatBox").classList.toggle("hidden");
}

function loadChat(){
  const saved = JSON.parse(localStorage.getItem("chatMessages") || "[]");
  const box = document.getElementById("chatMessages");
  box.innerHTML = "";
  saved.forEach(m=>{
    const div=document.createElement("div");
    div.innerHTML=`<b>${m.user}</b> <small>[${m.time}]</small>: ${m.text}`;
    box.appendChild(div);
  });
  box.scrollTop = box.scrollHeight;
}

function saveChatMessage(msg){
  const arr = JSON.parse(localStorage.getItem("chatMessages") || "[]");
  arr.push(msg);
  if(arr.length > 100) arr.shift();
  localStorage.setItem("chatMessages", JSON.stringify(arr));
}

function sendChat(e){
  if(e.key!=="Enter")return;
  if(!localStorage.session){notify("Zaloguj się aby pisać");return}

  const input = e.target;
  const msg = input.value.trim();
  if(!msg) return;

  const time = new Date().toLocaleTimeString().slice(0,5);
  const data = {
    user: localStorage.session,
    text: msg,
    time
  };

  saveChatMessage(data);
  loadChat();

  /* DISCORD WEBHOOK */
  fetch(CHAT_WEBHOOK,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      username: `${localStorage.session} - livechat`,
      content: `-# ${msg}`
    })
  });

  input.value="";
}
