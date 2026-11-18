(function(){
'use strict';
var LANG='fr';
try{var sv=localStorage.getItem('mosaic-lang');if(sv==='en'||sv==='fr')LANG=sv;}catch(e){}
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function t(fr,en){return LANG==='fr'?fr:en;}
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function fmt(n){return n.toLocaleString(LANG==='fr'?'fr-FR':'en-US');}

/* ============ Skeleton player ============ */
var HAND=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
var FPS=14;
function Player(canvas,opts){
  this.c=canvas;this.ctx=canvas.getContext('2d');this.opts=opts||{};
  this.key=null;this.t0=0;this.speed=1;this.running=false;this.done=false;
  var self=this;
  this.resize=function(){var d=window.devicePixelRatio||1,w=canvas.clientWidth;if(!w)return;canvas.width=w*d;canvas.height=w*d;self.draw(self.last||0);};
  window.addEventListener('resize',this.resize);
  this.loop=this.loop.bind(this);
}
Player.prototype.bounds=function(frames){
  var x0=9,x1=-9,y0=9,y1=-9;
  function add(p){if(!p)return;if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1];}
  frames.forEach(function(f){
    if(f.p){[0,11,12,13,14,15,16].forEach(function(i){add(f.p[i]);});}
    (f.l||[]).forEach(add);(f.r||[]).forEach(add);
  });
  var w=x1-x0,h=y1-y0,s=Math.max(w,h)*1.25;
  return {cx:(x0+x1)/2,cy:(y0+y1)/2+h*.05,s:s};
};
Player.prototype.play=function(key,speed,onEnd){
  var data=window.MOSAIC_SIGNS&&window.MOSAIC_SIGNS[key];if(!data)return;
  this.key=key;this.frames=data.frames;this.b=this.bounds(this.frames);
  this.speed=speed||1;this.onEnd=onEnd;this.t0=performance.now();this.done=false;this.last=0;
  this.resize();
  if(RM){this.last=this.frames.length-1;this.draw(this.last);if(onEnd)onEnd();return;}
  if(!this.running){this.running=true;requestAnimationFrame(this.loop);}
};
Player.prototype.loop=function(now){
  if(!this.key){this.running=false;return;}
  var pos=Math.max(0,(now-this.t0)/1000*FPS*this.speed),n=this.frames.length;
  if(this.opts.loop){
    var hold=this.opts.hold||10;var cyc=n+hold;var m=pos%cyc;this.last=Math.min(m,n-1);
    if(pos>=cyc&&!this._fired){this._fired=1;}
  }else{
    this.last=Math.min(pos,n-1);
    if(pos>=n-1&&!this.done){this.done=true;if(this.onEnd)this.onEnd();}
  }
  this.draw(this.last);
  if(this.opts.loop||!this.done)requestAnimationFrame(this.loop);else this.running=false;
};
Player.prototype.lerpPts=function(a,b,k){
  if(!a&&!b)return null;if(!a||!b)return a||b;
  return a.map(function(p,i){return [p[0]+(b[i][0]-p[0])*k,p[1]+(b[i][1]-p[1])*k];});
};
Player.prototype.draw=function(pos){
  var c=this.c,g=this.ctx;if(!this.frames||!c.width)return;
  g.clearRect(0,0,c.width,c.height);
  var i=Math.floor(pos),k=pos-i,A=this.frames[i],B=this.frames[Math.min(i+1,this.frames.length-1)];
  var P=this.lerpPts(A.p,B.p,k),L=this.lerpPts(A.l,B.l,k),R=this.lerpPts(A.r,B.r,k);
  var b=this.b,W=c.width;
  function X(p){return W/2+((p[0]-b.cx)/b.s)*W;}
  function Y(p){return W/2+((p[1]-b.cy)/b.s)*W;}
  var u=W/520;
  g.lineCap='round';g.lineJoin='round';
  var body=this.opts.body||'#7C8FF0',hand=this.opts.hand||'#F4A62A';
  if(P){
    g.strokeStyle=body;g.lineWidth=7*u;g.beginPath();
    [[11,12],[11,13],[13,15],[12,14],[14,16]].forEach(function(e){g.moveTo(X(P[e[0]]),Y(P[e[0]]));g.lineTo(X(P[e[1]]),Y(P[e[1]]));});
    g.stroke();
    var n=P[0],r=Math.abs(X(P[7])-X(P[8]))*.62||W*.07;
    g.lineWidth=5*u;g.beginPath();g.arc(X(n),Y(n)-r*.1,r,0,6.2832);g.stroke();
    g.lineWidth=6*u;g.beginPath();g.moveTo(X(n),Y(n)-r*.1+r);g.lineTo((X(P[11])+X(P[12]))/2,(Y(P[11])+Y(P[12]))/2);g.stroke();g.fillStyle=body;[11,12,13,14].forEach(function(j){g.beginPath();g.arc(X(P[j]),Y(P[j]),5*u,0,6.2832);g.fill();});
  }
  function drawHand(H){
    if(!H)return;g.strokeStyle=hand;g.lineWidth=4*u;g.beginPath();
    HAND.forEach(function(e){g.moveTo(X(H[e[0]]),Y(H[e[0]]));g.lineTo(X(H[e[1]]),Y(H[e[1]]));});g.stroke();
    g.fillStyle='#fff';H.forEach(function(p){g.beginPath();g.arc(X(p),Y(p),3.2*u,0,6.2832);g.fill();});
  }
  drawHand(L);drawHand(R);
};

/* ============ Sign vocabulary ============ */
var SIGNS={
  merci:{pict:'🙏',fr:'Merci',en:'Thank you',hFr:'Pour dire merci à l\'agent, sans écrire un mot.',hEn:'To thank the officer without writing a word.'},
  au_revoir:{pict:'👋',fr:'Au revoir',en:'Goodbye',hFr:'Pour clore l\'échange.',hEn:'To close the exchange.'},
  sil_vous_plait:{pict:'🤲',fr:'S\'il vous plaît',en:'Please',hFr:'Pour demander poliment de l\'aide ou un document.',hEn:'To politely ask for help or a document.'},
  pardon:{pict:'🙇',fr:'Pardon',en:'Sorry / Excuse me',hFr:'Pour attirer l\'attention ou s\'excuser.',hEn:'To get attention or apologise.'}
};

/* ============ Hero ============ */
var hero=new Player($('#heroCanvas'),{loop:true,hold:12});
var heroKeys=['merci','sil_vous_plait','au_revoir'],hi=0;
function heroNext(){
  var k=heroKeys[hi%heroKeys.length];hi++;
  hero.play(k,1);
  $('#heroWord').textContent=SIGNS[k][LANG];
  hero.opts.loop=true;
  clearTimeout(heroNext.t);
  var dur=(window.MOSAIC_SIGNS[k].frames.length+12)/FPS*1000*2;
  heroNext.t=setTimeout(heroNext,RM?4000:dur);
}

/* ============ Language ============ */
function applyLang(){
  document.documentElement.lang=LANG;
  $$('[data-set-lang]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.setLang===LANG);});
  document.title=LANG==='fr'?'MOSAIC — La langue des signes sénégalaise, enfin comprise':'MOSAIC — Senegalese Sign Language, finally understood';
  var h=$('#heroWord');if(h&&heroKeys[(hi-1)%heroKeys.length])h.textContent=SIGNS[heroKeys[(hi-1+heroKeys.length)%heroKeys.length]][LANG];
  renderAll();
}
$$('[data-set-lang]').forEach(function(b){b.addEventListener('click',function(){LANG=b.dataset.setLang;try{localStorage.setItem('mosaic-lang',LANG);}catch(e){}applyLang();});});

/* ============ Stats count-up ============ */
function countUp(){
  $$('[data-count]').forEach(function(el){
    var end=parseFloat(el.dataset.count),dec=parseInt(el.dataset.dec||0,10),pre=el.dataset.prefix||'',suf=el.dataset.suffix||'';
    function show(v){el.textContent=pre+(dec?v.toFixed(dec).replace('.',LANG==='fr'?',':'.'):Math.round(v))+suf;}
    if(RM){show(end);return;}
    var t0=performance.now();
    (function step(n){var k=Math.min((n-t0)/1200,1);show(end*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step);else{el.dataset.done=1;}})(t0);
  });
}
// build static display for stat 3 handled by bilingual spans; counting uses plain text except stat 3
(function(){
  var st=$('#stats');if(!st)return;
  var el3=$('[data-dec]',st);if(el3){el3.removeAttribute('data-count');}
  var started=false;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!started){started=true;countUp();}});},{threshold:.4});
  io.observe(st);
})();

/* ============ Simulator ============ */
var step=0,canRead=true,lipGuess=false,capOn=false,choice=null;
var simPlayer=null;
var GL='▚▞▟▙▛▜◢◣◤◥◐◑◒◓◧◨◩◪';
function scramble(s){return s.replace(/[A-Za-zÀ-ÿ]/g,function(ch){return GL.charAt(ch.charCodeAt(0)%GL.length);});}
function txt(s){return canRead?esc(s):'<span class="glyph" aria-label="'+t('texte illisible pour vous','text you cannot read')+'">'+esc(scramble(s))+'</span>';}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
var CLERK='<svg width="86" height="104" viewBox="0 0 86 104" aria-hidden="true"><circle cx="43" cy="26" r="20" fill="#C9D2E8"/><rect x="14" y="52" width="58" height="52" rx="16" fill="#7C8FF0"/><rect x="35" y="30" width="16" height="5" rx="2.5" fill="#0F1B2D"/></svg>';
function renderTabs(){
  var names=[t('1. Écouter','1. Listen'),t('2. Lire','2. Read'),t('3. Répondre','3. Reply')];
  [0,1,2].forEach(function(i){var b=$('#tab'+i);b.textContent=names[i];b.setAttribute('aria-selected',i===step);});
  $('#readLabel').textContent=canRead?t('Je sais lire le français','I can read French'):t('Je ne lis pas le français','I cannot read French');
}
function renderSim(){
  renderTabs();
  var body=$('#simBody'),h='';
  if(step===0){
    h='<div class="cols"><div><div class="clerk">'+CLERK+'<div class="bubble mute"><div>'+t('L\'agent vous parle…','The officer is speaking to you…')+'</div><div class="wave" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div></div></div>'
      +'<p class="muted-note">'+t('Vous voyez ses lèvres bouger. Vous n\'entendez aucun son. Tout le monde derrière vous attend.','You see his lips move. You hear no sound. Everyone behind you is waiting.')+'</p></div>'
      +'<div><button class="btn sun" id="lipBtn" type="button">'+t('Essayer de lire sur ses lèvres','Try to lip-read')+'</button>'
      +'<div class="verdict" id="lipOut" style="'+(lipGuess?'':'display:none')+'"><strong>'+t('Vous devinez :','You guess:')+'</strong> « … '+t('jour … pap… … ? … carte … ? … revenir … demain ?','day … pap… … ? … card … ? … come back … tomorrow ?')+' »<br>'+t('Beaucoup de sons se ressemblent sur les lèvres. Vous avez compris des morceaux, pas la phrase. Revenir demain, ou apporter quel papier ?','Many sounds look alike on the lips. You caught pieces, not the sentence. Come back tomorrow, or bring which paper?')+'</div></div></div>';
  }else if(step===1){
    var form=t('Demande d\'extrait d\'acte de naissance','Birth certificate extract request');
    var inst=t('Veuillez renseigner l\'état civil du déclarant et joindre la photocopie légalisée d\'une pièce d\'identité en cours de validité.','Please fill in the declarant\'s civil status and attach a certified photocopy of a valid identity document.');
    var capText=t('Revenez demain avec le livret de famille et deux timbres fiscaux.','Come back tomorrow with the family record book and two tax stamps.');
    h='<div class="cols"><div><div class="paperform"><h4>'+txt(form)+'</h4><p>'+txt(inst)+'</p><div class="line"></div><div class="line"></div></div></div>'
      +'<div><p class="muted-note" style="margin-top:0">'+t('L\'agent vous tend le formulaire et ne sait pas le signer. Vous essayez les sous-titres automatiques sur son téléphone.','The officer hands you the form and cannot sign it. You try automatic captions on his phone.')+'</p>'
      +'<button class="btn sun" id="capBtn" type="button">'+(capOn?t('Masquer les sous-titres','Hide captions'):t('Activer les sous-titres','Turn on captions'))+'</button>'
      +'<div class="caption" aria-live="polite">'+(capOn?txt(capText):'')+'</div>'
      +'<div class="verdict'+(canRead?' ok':'')+'" style="'+(capOn?'':'display:none')+'">'+(canRead?t('Vous lisez, mais le vocabulaire administratif est une deuxième langue : chaque phrase demande un effort et un doute.','You can read, but administrative vocabulary is a second language: every sentence takes effort and doubt.'):t('Les sous-titres sont du texte. Pour vous, ce sont des dessins sans sens : l\'outil censé vous aider ne vous aide pas.','Captions are text. To you they are meaningless shapes: the tool meant to help you does not.'))+'</div></div></div>';
  }else{
    h='<div class="choices" role="group" aria-label="'+t('Que faites-vous ?','What do you do?')+'">'
      +[['write',t('Écrire sur un papier','Write on paper')],['mime',t('Mimer','Mime it')],['mosaic','MOSAIC']].map(function(o){return '<button type="button" data-ch="'+o[0]+'" aria-pressed="'+(choice===o[0])+'">'+o[1]+'</button>';}).join('')+'</div>'
      +'<div id="chOut"></div>';
  }
  body.innerHTML=h;
  if(step===0){var lb=$('#lipBtn');if(lb)lb.onclick=function(){lipGuess=true;$('#lipOut').style.display='block';};}
  if(step===1){var cb=$('#capBtn');if(cb)cb.onclick=function(){capOn=!capOn;renderSim();};}
  if(step===2){$$('[data-ch]',body).forEach(function(b){b.onclick=function(){choice=b.dataset.ch;renderSim();};});renderChoice();}
}
function renderChoice(){
  var out=$('#chOut');if(!out||!choice)return;
  if(choice==='write'){
    out.innerHTML='<div class="verdict">'+(canRead?t('Vous écrivez avec peine, en français approximatif. L\'agent lit une phrase pleine d\'erreurs et la prend pour une personne peu instruite. Le malentendu s\'installe.','You write with difficulty, in approximate French. The officer reads a sentence full of mistakes and takes you for uneducated. The misunderstanding sets in.'):t('Vous ne savez pas écrire. Le stylo reste en l\'air. Il faut revenir avec quelqu\'un qui entend.','You cannot write. The pen stays in the air. You must come back with someone who can hear.'))+'</div>';
  }else if(choice==='mime'){
    out.innerHTML='<div class="verdict">'+t('Vous mimez ce que vous voulez. L\'agent devine « un problème de santé ? » et vous oriente vers le mauvais service. Votre demande n\'a pas été comprise, seulement devinée.','You mime what you want. The officer guesses “a health problem?” and sends you to the wrong department. Your request was not understood, only guessed.')+'</div>';
  }else{
    out.innerHTML='<div class="cols"><div class="mini"><canvas id="simCanvas" role="img" aria-label="'+t('Vous signez','You sign')+'"></canvas><div class="cap">'+t('Vous signez dans votre langue, devant la caméra.','You sign in your own language, facing the camera.')+'</div></div>'
      +'<div><div class="result" style="margin-top:0"><div class="lbl" style="color:#9FB0C8">'+t('L\'agent voit et entend :','The officer sees and hears:')+'</div><div class="big" id="sPhrase"></div></div>'
      +'<div class="result"><div class="lbl" style="color:#9FB0C8">'+t('Sa réponse vous revient en signes et en image :','His reply comes back to you in signs and pictures:')+'</div><div class="pict" aria-hidden="true">🙏</div><div class="big" style="font-size:1.4rem">'+t('Merci. Votre dossier est enregistré.','Thank you. Your file is registered.')+'</div></div>'
      +'<div class="verdict ok">'+t('Vous avez parlé, on vous a compris, vous avez compris la réponse. Sans lire, sans accompagnant.','You spoke, you were understood, you understood the answer. Without reading, without a companion.')+'</div></div></div>';
    $('#sPhrase').textContent=SIGNS.sil_vous_plait[LANG]+' · '+SIGNS.merci[LANG];
    simPlayer=new Player($('#simCanvas'),{loop:true,hold:14});simPlayer.play('sil_vous_plait',1);
  }
}
$$('#simTabs [role=tab]').forEach(function(b){b.addEventListener('click',function(){step=+b.dataset.step;renderSim();});b.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){var n=(step+(e.key==='ArrowRight'?1:2))%3;step=n;renderSim();$('#tab'+n).focus();}});});
$('#canRead').addEventListener('change',function(e){canRead=e.target.checked;renderSim();});

/* ============ Comparison ============ */
var persona='noread';
var SOL=[
 {k:'cap',fr:'Sous-titres et applications de texte',en:'Captions and text apps',dFr:'Supposent que la personne lit.',dEn:'Assume the person reads.',u:{reads:[2,3],noread:[0,3]}},
 {k:'note',fr:'Notes écrites, SMS, formulaires',en:'Written notes, SMS, forms',dFr:'Le français écrit est une deuxième langue.',dEn:'Written French is a second language.',u:{reads:[2,3],noread:[0,3]}},
 {k:'int',fr:'Interprète humain',en:'Human interpreter',dFr:'La meilleure compréhension, mais rare, à réserver, coûteux.',dEn:'Best understanding, but scarce, must be booked, costly.',u:{reads:[3,1],noread:[3,1]}},
 {k:'mos',me:1,fr:'MOSAIC',en:'MOSAIC',dFr:'Répond en signes et en images. Vocabulaire limité au départ, interprète humain en recours.',dEn:'Replies in signs and pictures. Limited vocabulary at first, human interpreter as fallback.',u:{reads:[2,3],noread:[2,3]}}
];
function levelName(n){return [t('Nulle','None'),t('Faible','Low'),t('Partielle','Partial'),t('Bonne','Good')][n];}
function renderCmp(){
  $$('[data-persona]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.persona===persona);});
  $('#cmp').innerHTML=SOL.map(function(s){
    var v=s.u[persona],c=v[0],a=v[1];
    // availability: interpreter low
    var avail=s.k==='int'?1:(s.me?2:3);
    return '<div class="row'+(s.me?' me':'')+'"><div><h3>'+t(s.fr,s.en)+'</h3><small>'+t(s.dFr,s.dEn)+'</small></div>'
      +'<div><div class="axis">'+t('Comprendre et être compris','Understand and be understood')+'</div><div class="meter l'+c+(c===0?' bad':'')+'" aria-hidden="true"><i></i><i></i><i></i></div><div class="lbl">'+levelName(c)+'</div></div>'
      +'<div><div class="axis">'+t('Disponible au guichet','Available at the counter')+'</div><div class="meter l'+avail+(avail===1?' bad':'')+'" aria-hidden="true"><i></i><i></i><i></i></div><div class="lbl">'+levelName(avail)+'</div></div></div>';
  }).join('');
}
$$('[data-persona]').forEach(function(b){b.addEventListener('click',function(){persona=b.dataset.persona;renderCmp();});});

/* ============ Demo ============ */
var cur='merci';var demo=new Player($('#demoCanvas'),{loop:false});
function renderDemo(){
  var wrap=$('#signBtns');wrap.innerHTML='';
  Object.keys(SIGNS).forEach(function(k){var b=document.createElement('button');b.type='button';b.textContent=SIGNS[k][LANG];b.setAttribute('aria-pressed',k===cur);b.onclick=function(){cur=k;renderDemo();playDemo();};wrap.appendChild(b);});
  var s=SIGNS[cur];$('#dPict').textContent=s.pict;$('#dText').textContent=s[LANG];$('#dHint').textContent=LANG==='fr'?s.hFr:s.hEn;
}
function playDemo(){demo.play(cur,parseFloat($('#speed').value));}
$('#replay').onclick=playDemo;$('#speed').oninput=playDemo;
$('#speak').onclick=function(){try{var u=new SpeechSynthesisUtterance(SIGNS[cur][LANG]);u.lang=LANG==='fr'?'fr-FR':'en-US';speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}};

/* ============ Pipeline ============ */
var PIPE=[
 {fr:['Caméra','Un téléphone ou une tablette au guichet. La personne signe ; aucune vidéo n\'est conservée.'],en:['Camera','A phone or tablet at the counter. The person signs; no video is kept.']},
 {fr:['Squelette','Mains, corps et visage deviennent 543 points par image. On ne garde que ces points.'],en:['Skeleton','Hands, body and face become 543 points per frame. Only these points are kept.']},
 {fr:['Modèle','Un réseau de neurones lit la séquence de points et reconnaît le signe. Il est conçu pour tourner sur le téléphone, même sans connexion.'],en:['Model','A neural network reads the point sequence and recognises the sign. It is designed to run on the phone, even offline.']},
 {fr:['Réponse','Texte pour l\'agent, voix, et pictogrammes pour la personne sourde qui ne lit pas. À terme, la réponse de l\'agent revient en signes (avatar 3D).'],en:['Reply','Text for the officer, voice, and pictograms for the Deaf person who cannot read. In time, the officer\'s reply returns in signs (3D avatar).']},
 {fr:['Interprète','Quand le sujet est grave (santé, police, école), un interprète humain prend le relais à distance.'],en:['Interpreter','When the matter is serious (health, police, school), a human interpreter steps in remotely.']}
];
var pipeSel=0;
function renderPipe(){
  $('#pipe').innerHTML=PIPE.map(function(p,i){var d=p[LANG];return '<button type="button" data-p="'+i+'" aria-pressed="'+(i===pipeSel)+'"><b>'+(i+1)+'. '+d[0]+'</b></button>';}).join('');
  $('#pipeDetail').innerHTML='<h3>'+PIPE[pipeSel][LANG][0]+'</h3><p style="margin:0">'+PIPE[pipeSel][LANG][1]+'</p>';
  $$('[data-p]').forEach(function(b){b.onclick=function(){pipeSel=+b.dataset.p;renderPipe();};});
}

/* ============ Roadmap ============ */
var ROAD=[
 {s:'now',fr:['Phase 0 · Données','En cours','Cartographie des données existantes (fait), vocabulaire de départ de 60 signes en 9 catégories (fait), outil de collecte (fait). À faire : validation du vocabulaire par la communauté sourde, protocole de tournage avec consentement et compensation, 3 à 5 signeurs pour 900 à 1 500 clips.'],en:['Phase 0 · Data','In progress','Mapping of existing data (done), starter vocabulary of 60 signs in 9 categories (done), collection tool (done). To do: vocabulary validated by the Deaf community, filming protocol with consent and compensation, 3 to 5 signers for 900 to 1,500 clips.']},
 {s:'done',fr:['Phase 1 · Reconnaissance','Prototype validé sur l\'ASL','Signes isolés, un seul signeur : la chaîne de la webcam à la prédiction fonctionne. Validée sur la langue des signes américaine en attendant les données LSS.'],en:['Phase 1 · Recognition','Prototype validated on ASL','Isolated signs, one signer: the pipeline from webcam to prediction works. Validated on American Sign Language while LSS data is pending.']},
 {s:'next',fr:['Phase 2 · Plusieurs signeurs','À venir','Plus de signeurs, plus de variété de morphologie, de vitesse et de style. Vocabulaire élargi par vagues, validées avec la communauté.'],en:['Phase 2 · Many signers','Next','More signers, more variety in build, speed and style. Vocabulary widened in waves, validated with the community.']},
 {s:'next',fr:['Phase 3 · Voix et application mobile','À venir','Synthèse vocale en français, application Android et iOS qui fonctionne hors-ligne, extension navigateur. Un seul modèle pour toutes les cibles.'],en:['Phase 3 · Voice and mobile app','Next','French text-to-speech, Android and iOS app working offline, browser extension. One model for every target.']},
 {s:'next',fr:['Phase 4 · Phrases continues','Plus tard','Passer des signes isolés aux phrases. La LSS a sa propre grammaire : ce travail se fait avec des linguistes et des signeurs natifs.'],en:['Phase 4 · Continuous sentences','Later','Moving from isolated signs to sentences. LSS has its own grammar: this work is done with linguists and native signers.']},
 {s:'next',fr:['Phase 5 · Avatar 3D','Plus tard','Du texte ou de la voix vers un avatar qui signe, pour que la réponse de l\'agent revienne en langue des signes. Un visualiseur 3D de captures réelles existe déjà.'],en:['Phase 5 · 3D avatar','Later','From text or voice to an avatar that signs, so the officer\'s reply comes back in sign language. A 3D viewer of real captures already exists.']}
];
var roadOpen=0;
function renderRoad(){
  $('#road').innerHTML=ROAD.map(function(p,i){var d=p[LANG];return '<details class="ph" data-r="'+i+'"'+(i===roadOpen?' open':'')+'><summary><span>'+d[0]+'</span><span class="badge '+p.s+'">'+d[1]+'</span></summary><div class="body">'+d[2]+'</div></details>';}).join('');
  $$('details.ph').forEach(function(d){d.addEventListener('toggle',function(){if(d.open)roadOpen=+d.dataset.r;});});
}

/* ============ Business ============ */
function renderBiz(){
  var c=+$('#sCounters').value,l=+$('#sLicense').value,s=+$('#sSubs').value;
  var inst=c*l,ind=s*10*12,tot=inst+ind;
  $('#oCounters').textContent=c;$('#oLicense').textContent='$'+fmt(l);$('#oSubs').textContent=fmt(s);
  $('#oTotal').textContent='$'+fmt(tot)+t(' / an',' / year');
  var pi=tot?inst/tot*100:0;$('#splitA').style.width=pi+'%';$('#splitB').style.width=(100-pi)+'%';$('#splitB').style.width=tot?(100-pi)+'%':'0%';
  $('#oSplit').textContent=t('Licences : $','Licenses: $')+fmt(inst)+' · '+t('Abonnements : $','Subscriptions: $')+fmt(ind);
}
['sCounters','sLicense','sSubs'].forEach(function(id){$('#'+id).addEventListener('input',renderBiz);});

/* ============ Budget ============ */
var BUD=[
 {v:45000,fr:['Jeu de données et IA','Captation vidéo et annotation avec des signeurs natifs et des interprètes FENASSEN ; ingénierie ML et calcul d\'entraînement.'],en:['Dataset and AI','Native-signer video capture and annotation with FENASSEN interpreters; ML engineering and training compute.']},
 {v:12000,fr:['Matériel du pilote','Borne, tablette, caméra, fixation et connectivité pour le premier guichet au Centre Verbo-Tonal.'],en:['Pilot hardware','Kiosk, tablet, camera, mounting and connectivity for the first counter at the Centre Verbo-Tonal.']},
 {v:60000,fr:['Équipe et opérations (6 mois)','Salaires d\'une équipe d\'ingénierie et de coordination à Dakar aux tarifs locaux, plus gestion de projet.'],en:['Team and operations (6 months)','Salaries for a Dakar-based engineering and coordination team at local rates, plus project management.']},
 {v:18000,fr:['Formation, conformité, imprévus','Ateliers de co-conception avec les interprètes FENASSEN, formation du personnel, revue vie privée et juridique.'],en:['Training, compliance, contingency','Co-design workshops with FENASSEN interpreters, staff training, privacy and legal review.']}
];
var budSel=0;
function renderBudget(){
  var tot=BUD.reduce(function(a,b){return a+b.v;},0);
  $('#budget').innerHTML='<h3>'+t('Répartition de la phase 1','Phase 1 breakdown')+' · $'+fmt(tot)+'</h3>'
    +BUD.map(function(b,i){return '<button type="button" class="bar" data-b="'+i+'" aria-pressed="'+(i===budSel)+'"><span class="t"><span>'+b[LANG][0]+'</span><span>$'+fmt(b.v)+'</span></span><span class="b" style="display:block"><i style="width:'+(b.v/tot*100)+'%"></i></span></button>';}).join('')
    +'<div class="bar-detail" aria-live="polite">'+BUD[budSel][LANG][1]+'</div>';
  $$('[data-b]').forEach(function(b){b.onclick=function(){budSel=+b.dataset.b;renderBudget();};});
}

/* ============ Contact ============ */
$('#msgForm').addEventListener('submit',function(e){
  e.preventDefault();var f=e.target;
  var msg=(LANG==='fr'?'À : mohamed19.diallo@ucad.edu.sn\nObjet : MOSAIC — prise de contact\n\n':'To: mohamed19.diallo@ucad.edu.sn\nSubject: MOSAIC — getting in touch\n\n')+f.m.value+'\n\n— '+f.n.value+(f.o.value?' ('+f.o.value+')':'');
  var ok=function(){$('#toast').textContent=t('Message copié. Collez-le dans votre email.','Message copied. Paste it in your email.');};
  var ko=function(){$('#toast').textContent=t('La copie est bloquée ici. Écrivez directement à mohamed19.diallo@ucad.edu.sn.','Copying is blocked here. Write directly to mohamed19.diallo@ucad.edu.sn.');};
  try{navigator.clipboard.writeText(msg).then(ok,ko);}catch(err){ko();}
});

function renderAll(){renderSim();renderCmp();renderDemo();renderPipe();renderRoad();renderBiz();renderBudget();}
applyLang();
heroNext();
playDemo();
// demo autoplay once visible
})();
