gsap.registerPlugin(ScrollTrigger);
const canvas = document.querySelector('#canvas');
const img    = document.querySelector('#bryceImg');
const pins   = [...document.querySelectorAll('.pin')];
const steps  = [...document.querySelectorAll('.step')];

let BASE = null; // medidas cuando canvas = identidad (x=0,y=0,scale=1)
let activeTween;

// Calcula medidas base sin transformaciones
function computeBase(){
  // Guardar transform actual
  const m = gsap.getProperty(canvas, "transform");
  // Forzar identidad para medir correctamente
  gsap.set(canvas, {x:0, y:0, scale:1});
  const canvasRect = canvas.getBoundingClientRect();
  const imgRect = img.getBoundingClientRect();
  BASE = {
    canvasW: canvasRect.width,
    canvasH: canvasRect.height,
    imgW: imgRect.width,
    imgH: imgRect.height,
    imgLeft: imgRect.left - canvasRect.left,
    imgTop:  imgRect.top  - canvasRect.top
  };
  // Restaurar (si hubiera algo previo)
  gsap.set(canvas, {clearProps:"transform"});
}

// Posiciona pines usando las medidas BASE
function positionPins(){
  if(!BASE) computeBase();
  pins.forEach(pin=>{
    const px = parseFloat(pin.dataset.x), py = parseFloat(pin.dataset.y);
    const x = BASE.imgLeft + (px/100)*BASE.imgW;
    const y = BASE.imgTop  + (py/100)*BASE.imgH;
    pin.style.left = x + 'px';
    pin.style.top  = y + 'px';
  });
}

// Devuelve el translate para centrar (px,py) con un scale dado
function computeTransform(px,py,scale){
  if(!BASE) computeBase();
  const sticky = document.querySelector('.sticky');
  const sRect = sticky.getBoundingClientRect();

  const pointX = BASE.imgLeft + (px/100)*BASE.imgW; // en coord. de canvas base
  const pointY = BASE.imgTop  + (py/100)*BASE.imgH;

  const centerX = sRect.width / 2;
  const centerY = sRect.height / 2;

  const tx = centerX - pointX * scale;
  const ty = centerY - pointY * scale;
  return {tx, ty, scale};
}

function goTo(px,py,scale){
  const t = computeTransform(px,py,scale);
  if (activeTween) activeTween.kill();
  activeTween = gsap.to(canvas, {
    duration: 1.0,
    ease: 'power3.inOut',
    x: t.tx, y: t.ty, scale: t.scale,
    transformOrigin: '0 0',
    overwrite: 'auto'
  });
}

function buildScroll(){
  steps.forEach(step=>{
    const pin = document.querySelector(step.dataset.target);
    const px = parseFloat(pin.dataset.x), py = parseFloat(pin.dataset.y);
    const base = parseFloat(pin.dataset.scale)||2.6;
    const scale = window.matchMedia('(max-width:768px)').matches ? Math.max(2.05, base-0.25) : base;
    ScrollTrigger.create({
      trigger: step,
      start: 'top center',
      end: 'bottom center',
      onEnter:     () => goTo(px,py,scale),
      onEnterBack: () => goTo(px,py,scale)
    });
  });

  // Guardas de borde: al salir del sticky por arriba o por abajo, resetea
  ScrollTrigger.create({
    trigger: document.querySelector('.sticky'),
    start: 'top top',
    end: 'bottom top',
    onLeave:     () => gsap.set(canvas, {x:0,y:0,scale:1}),
    onLeaveBack: () => gsap.set(canvas, {x:0,y:0,scale:1})
  });
}

function init(){
  if (img.complete){
    computeBase();
    positionPins();
    buildScroll();
  } else {
    img.addEventListener('load', ()=>{
      computeBase();
      positionPins();
      buildScroll();
    });
  }
}

ScrollTrigger.addEventListener('refreshInit', ()=>{
  computeBase();
  positionPins();
});
window.addEventListener('resize', ()=>{
  computeBase();
  positionPins();
  ScrollTrigger.refresh();
});

init();
