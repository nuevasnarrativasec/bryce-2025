gsap.registerPlugin(ScrollTrigger);
const canvas = document.querySelector('#canvas');
const img    = document.querySelector('#bryceImg');
const pins   = [...document.querySelectorAll('.pin')];
const steps  = [...document.querySelectorAll('.step')];

let BASE = null;
let activeTween;

// Medidas base: SOLO en init y resize (para evitar "flash")
function computeBase(){
  const prev = {
    x: gsap.getProperty(canvas,'x') || 0,
    y: gsap.getProperty(canvas,'y') || 0,
    scale: gsap.getProperty(canvas,'scale') || 1
  };
  gsap.set(canvas, {x:0, y:0, scale:1});
  const c = canvas.getBoundingClientRect();
  const r = img.getBoundingClientRect();
  BASE = {
    canvasW: c.width, canvasH: c.height,
    imgW: r.width, imgH: r.height,
    imgLeft: r.left - c.left,
    imgTop:  r.top  - c.top
  };
  gsap.set(canvas, {x:prev.x, y:prev.y, scale:prev.scale});
}

function positionPins(){
  if(!BASE) return;
  pins.forEach(pin=>{
    const px = parseFloat(pin.dataset.x), py = parseFloat(pin.dataset.y);
    pin.style.left = (BASE.imgLeft + (px/100)*BASE.imgW) + 'px';
    pin.style.top  = (BASE.imgTop  + (py/100)*BASE.imgH) + 'px';
  });
}

function computeTransform(px,py,scale){
  const sticky = document.querySelector('.sticky');
  const s = sticky.getBoundingClientRect();
  const pointX = BASE.imgLeft + (px/100)*BASE.imgW;
  const pointY = BASE.imgTop  + (py/100)*BASE.imgH;
  return { tx: s.width/2  - pointX*scale, ty: s.height/2 - pointY*scale, scale };
}

function goTo(px,py,scale){
  const t = computeTransform(px,py,scale);
  if (activeTween) activeTween.kill();
  activeTween = gsap.to(canvas, {
    duration: 1.0, ease: 'power3.inOut',
    x: t.tx, y: t.ty, scale: t.scale,
    transformOrigin: '0 0', overwrite: 'auto'
  });
}

function buildScroll() {
  steps.forEach(step => {
    const pin = document.querySelector(step.dataset.target);
    const px = parseFloat(pin.dataset.x), py = parseFloat(pin.dataset.y);
    const base = parseFloat(pin.dataset.scale) || 2.6;
    const scale = window.matchMedia('(max-width:768px)').matches ? Math.max(2.05, base - 0.25) : base;
    ScrollTrigger.create({
      trigger: step,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => goTo(px, py, scale),
      onEnterBack: () => goTo(px, py, scale),
      // Prevent abrupt reset by only allowing scale change within step range
      onLeave: () => {}, // Disable reset on leave
      onLeaveBack: () => {} // Disable reset on leave back
    });
  });

  // Adjust the sticky ScrollTrigger to only reset when fully outside
  ScrollTrigger.create({
    trigger: document.querySelector('.sticky'),
    start: 'top top',
    end: 'bottom bottom', // Extend to cover the full sticky range
    onLeave: () => gsap.set(canvas, { x: 0, y: 0, scale: 1 }),
    onLeaveBack: () => gsap.set(canvas, { x: 0, y: 0, scale: 1 })
  });
}

function init(){
  computeBase();
  positionPins();
  buildScroll();
}

if (img.complete) init();
else img.addEventListener('load', init);

// SOLO en resize (evita refrescos durante el scroll)
window.addEventListener('resize', ()=>{
  computeBase();
  positionPins();
  ScrollTrigger.refresh();
});
