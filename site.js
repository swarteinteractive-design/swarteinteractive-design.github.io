// Swarte Interactive — menu, scroll reveal, bouncing-ball scene
(function(){
  // studio intro video (home page, when arriving from outside the site)
  var intro=document.getElementById('intro');
  if(intro&&document.documentElement.classList.contains('intro-on')){
    var v=intro.querySelector('video'),skip=intro.querySelector('.intro-skip'),snd=intro.querySelector('.intro-sound'),done=false;
    var tall=window.innerHeight>window.innerWidth*1.1;
    v.src='intro/intro-'+(tall?'portrait':'landscape')+'.mp4';
    function finish(){if(done)return;done=true;
      intro.classList.add('out');try{v.pause()}catch(e){}
      setTimeout(function(){document.documentElement.classList.remove('intro-on');intro.remove()},700)}
    v.addEventListener('ended',finish);v.addEventListener('error',finish);
    skip.addEventListener('click',finish);
    document.addEventListener('keydown',function(e){if(e.key==='Escape')finish()});
    snd.addEventListener('click',function(){v.muted=false;snd.hidden=true;if(v.currentTime>4.5){}});
    // try with sound first; browsers usually block that, so fall back to muted with a "Sound on" button
    var p=v.play();
    if(p&&p.catch)p.catch(function(){v.muted=true;snd.hidden=false;v.play().catch(finish)});
    setTimeout(finish,9000); // safety: never block the site
  }
  // mobile menu
  var btn=document.querySelector('.menu-btn'),tabs=document.querySelector('.tabs');
  if(btn&&tabs){btn.addEventListener('click',function(){var o=tabs.classList.toggle('open');btn.setAttribute('aria-expanded',o)})}

  // reveal on scroll
  var els=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
    els.forEach(function(el){io.observe(el)});
  }else{els.forEach(function(el){el.classList.add('in')})}

  // year
  var y=document.getElementById('yr');if(y)y.textContent=new Date().getFullYear();

  // studio scene: slanted shards (logo angle) drifting upward
  document.querySelectorAll('canvas[data-scene="shards"]').forEach(function(cv){
    var ctx=cv.getContext('2d'),W,H,dpr=Math.min(window.devicePixelRatio||1,2),items=[],mx=0,my=0,last=0;
    var still=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function rnd(a,b){return a+Math.random()*(b-a)}
    function size(){var r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      items=[];var n=Math.round(W*H/26000);for(var i=0;i<n;i++)items.push(mk(rnd(0,H)))}
    function mk(y){var z=rnd(.3,1);return{x:rnd(0,W),y:y,w:rnd(18,90)*z,h:rnd(3,8)*z,z:z,v:rnd(6,18)*z,c:Math.random()<.65?'255,122,0':'255,255,255',a:rnd(.08,.45)*z}}
    window.addEventListener('pointermove',function(e){mx=(e.clientX/window.innerWidth-.5);my=(e.clientY/window.innerHeight-.5)});
    function frame(ts){var dt=Math.min(.05,(ts-last)/1000||0);last=ts;if(still)dt=0;
      ctx.clearRect(0,0,W,H);
      items.forEach(function(it,i){it.y-=it.v*dt;if(it.y<-20){items[i]=mk(H+20)}
        var x=it.x+mx*40*it.z,y=it.y+my*30*it.z,k=.84;
        ctx.fillStyle='rgba('+it.c+','+it.a+')';ctx.beginPath();
        ctx.moveTo(x+it.h*k,y);ctx.lineTo(x+it.w+it.h*k,y);ctx.lineTo(x+it.w,y+it.h);ctx.lineTo(x,y+it.h);ctx.closePath();ctx.fill()});
      if(!still)requestAnimationFrame(frame)}
    size();window.addEventListener('resize',function(){clearTimeout(cv._t);cv._t=setTimeout(size,150)});requestAnimationFrame(frame);
  });

  // bouncing scene: balls hop from platform to platform while the world slowly climbs
  document.querySelectorAll('canvas[data-scene="dark"],canvas[data-scene="light"]').forEach(function(cv){
    var ctx=cv.getContext('2d'),W=0,H=0,dpr=Math.min(window.devicePixelRatio||1,2);
    var light=cv.dataset.scene==='light';
    var still=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var COLORS=light?['#ffffff','#fff3b0','#ffd2e8']:['#ff7a00','#ff9a0a','#ffffff','#ff5a00','#ffb24d'];
    var pads=[],balls=[],stars=[],last=0,speed=22;
    function rnd(a,b){return a+Math.random()*(b-a)}
    function size(){
      var r=cv.getBoundingClientRect();W=r.width;H=r.height;
      cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      init();
    }
    function minX(){return cv.dataset.left?W*parseFloat(cv.dataset.left):0}
    function newPad(y){return{x:rnd(minX()+20,W-130),y:y,w:rnd(70,130),c:COLORS[Math.floor(Math.random()*COLORS.length)],a:rnd(.35,.8)}}
    function init(){
      pads=[];balls=[];stars=[];
      var gap=Math.max(60,H/9);
      for(var y=H-20;y>-gap;y-=gap)pads.push(newPad(y+rnd(-12,12)));
      var n=W<720?3:5;
      for(var i=0;i<n;i++){
        var p=pads[Math.floor(rnd(1,pads.length-2))];
        balls.push({from:p,to:pick(p),t:Math.random(),dur:rnd(.9,1.3),r:rnd(9,16),c:COLORS[i%COLORS.length],trail:[]});
      }
      for(var s=0;s<70;s++)stars.push({x:Math.random()*W,y:Math.random()*H,r:rnd(.4,1.6),p:Math.random()*6});
    }
    function pick(p){
      var c=pads.filter(function(q){return q!==p&&q.y<p.y+40&&q.y>p.y-H*.32&&Math.abs(q.x-p.x)<W*.35&&q.y>20});
      if(!c.length)c=pads.filter(function(q){return q!==p&&q.y>40&&q.y<H-40});
      return c[Math.floor(Math.random()*c.length)]||p;
    }
    function pos(b){
      var a=b.from,z=b.to,t=b.t;
      var x=a.x+a.w/2+(z.x+z.w/2-a.x-a.w/2)*t;
      var y=a.y+(z.y-a.y)*t-Math.sin(Math.PI*t)*(70+Math.max(0,a.y-z.y)*.6);
      return{x:x,y:y-b.r};
    }
    function frame(ts){
      var dt=Math.min(.05,(ts-last)/1000||0);last=ts;
      if(still)dt=0;
      ctx.clearRect(0,0,W,H);
      // stars
      stars.forEach(function(s){s.y+=speed*.3*dt;if(s.y>H)s.y=0;var a=.25+.25*Math.sin(ts/700+s.p);ctx.globalAlpha=light?a*.6:a;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill()});
      ctx.globalAlpha=1;
      // pads scroll down
      pads.forEach(function(p){p.y+=speed*dt});
      pads.forEach(function(p,i){if(p.y>H+30){var top=Math.min.apply(null,pads.map(function(q){return q.y}));var np=newPad(top-Math.max(60,H/9));pads[i]=np;balls.forEach(function(b){if(b.from===p)b.from=np;if(b.to===p){b.to=pick(b.from)}})}});
      pads.forEach(function(p){
        ctx.globalAlpha=p.a;ctx.fillStyle=p.c;
        ctx.shadowColor=p.c;ctx.shadowBlur=light?0:14;
        rr(p.x,p.y,p.w,9,5);ctx.fill();
      });
      ctx.shadowBlur=0;ctx.globalAlpha=1;
      // balls
      balls.forEach(function(b){
        b.t+=dt/b.dur;
        if(b.t>=1){b.t=0;b.from=b.to;b.to=pick(b.from);b.dur=rnd(.9,1.3)}
        var q=pos(b);
        b.trail.push(q);if(b.trail.length>16)b.trail.shift();
        for(var i=0;i<b.trail.length;i++){var t=b.trail[i],k=i/b.trail.length;ctx.globalAlpha=k*.35;ctx.fillStyle=b.c;ctx.beginPath();ctx.arc(t.x,t.y,b.r*k,0,7);ctx.fill()}
        ctx.globalAlpha=1;
        var squash=b.t<.08||b.t>.92?1.18:1;
        var g=ctx.createRadialGradient(q.x-b.r*.35,q.y-b.r*.4,b.r*.1,q.x,q.y,b.r);
        g.addColorStop(0,'#fff');g.addColorStop(.35,b.c);g.addColorStop(1,shade(b.c));
        ctx.fillStyle=g;ctx.shadowColor=b.c;ctx.shadowBlur=light?8:24;
        ctx.beginPath();ctx.ellipse(q.x,q.y+(squash>1?b.r*.12:0),b.r*squash,b.r/squash,0,0,7);ctx.fill();
        ctx.shadowBlur=0;
      });
      if(!still)requestAnimationFrame(frame);
    }
    function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
    function shade(h){var n=parseInt(h.slice(1),16),r=(n>>16)*.6,g=((n>>8)&255)*.6,b=(n&255)*.6;return'rgb('+(r|0)+','+(g|0)+','+(b|0)+')'}
    size();window.addEventListener('resize',function(){clearTimeout(cv._t);cv._t=setTimeout(size,150)});
    requestAnimationFrame(frame);
    if(still){/* draw one frame */}
  });
})();
