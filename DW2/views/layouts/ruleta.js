document.addEventListener('DOMContentLoaded', () => { //esto asegura que el DOM este cargado antes de ejecutar el script
  const source = document.getElementById('template').innerHTML;

const roulette = document.getElementById("roulette");
const ctx = roulette.getContext("2d");
const resultMoneyDiv = document.getElementById("resultMoney");
const resultNumberDiv = document.getElementById("resultNumber");
const spinBtn = document.getElementById("spin-btn");


const numeros = Array.from({ length: 37 }, (_, i) => i); // 0–36
let girando = false;
let saldo = document.getElementById("ingresos");
let apuestas = [];

//FUNCIONES DE COLOR
function esRojo(n) {
  return [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(n);
}
function esNegro(n) {
  return n !== 0 && !esRojo(n);
}

function RuletaVision() {
  const radio = roulette.width /2;
  const angulo = (2 * Math.PI) / numeros.length;


  numeros.forEach((n, i) => {
    ctx.beginPath();
    ctx.moveTo(radio, radio);
    ctx.fillStyle = n === 0 ? "green" : esRojo(n) ? "red" : "black";
    ctx.arc(radio, radio, radio, i * angulo, (i + 1) * angulo);
    ctx.fill();
  });
}
RuletaVision();

//GIRO DE RULETA 
spinBtn.addEventListener("click", () => {
  if (girando) return;
  girando = true;

  const duracion = Math.random() * 4000 + 2000; // 3–6 s
  const numeroGanador = Math.floor(Math.random() * 37);
  const rotacionFinal = 360 * 10 + (numeroGanador * (360 / 37));

  roulette.style.transition = `transform ${duracion / 1000}s ease-out`;
  roulette.style.transform = `rotate(${rotacionFinal}deg)`;

  //DETERMINAR COLOR GANADOR
    let colorGanador;
    if (numeroGanador === 0) {
      colorGanador = "green";
    } else if (esRojo(numeroGanador)) {
      colorGanador = "red";
    } else {
      colorGanador = "black";
    }

  setTimeout(() => {
    girando = false;
    roulette.style.transition = "none";
    roulette.style.transform = "rotate(0deg)";
    resultNumberDiv.innerHTML = `Número ganador: <span style="color: ${colorGanador}; font-weight: bold;">${numeroGanador}</span>`
  calcularGanancias(numeroGanador, colorGanador);
  setTimeout(reinicio, 20000); //reinicio despues de mostrar resultados, 15s
  }, duracion);  
});

//INICIO TABLA
//NUMERO EN LA TABLA
const listaNumero = Array.from({ length: 37 }, (_, i) => i); // 0 a 36

//DETERMINAR COLOR DE CADA NUMERO
function getColor(num) {
  if (num === 0) return 'green';
  const rojos = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  return rojos.includes(num) ? 'red' : 'black';
}

//ESTADO DE APUESTAS
let bets = new Set(); 

const table = document.getElementById('tablaRuleta');
const clearBtn = document.getElementById('clear-btn');
const numbersList = document.getElementById('numbers-list');
const totalAmount = document.getElementById('total-amount');

//VALOR DE LA FICHA
const valor = document.getElementById('valor-ficha');

//EL 0
const zeroCell = document.createElement('div');
zeroCell.className = `cell ${getColor(0)}`;
zeroCell.textContent = '0';
zeroCell.dataset.number = '0';
zeroCell.addEventListener('click', toggleBet);
table.appendChild(zeroCell);

//TRES FILAS DE NUMEROS
for (let col = 0; col < 12; col++) {
  for (let fila = 0; fila < 3; fila++) {
    const numero = col * 3 + fila + 1;
    if (numero <= 36) {
      const cell = document.createElement('div');
      cell.className = `cell ${getColor(numero)}`;
      cell.textContent = numero;
      cell.dataset.number = numero;
      cell.addEventListener('click', toggleBet);
      table.appendChild(cell);
      
    }
  }
}

//PARA SELECCIONAR APUESTAS
function toggleBet(e) {
  const target = e.target;
  let key;

  if (target.dataset.number !== undefined) {
    key = `num-${target.dataset.number}`;} 

  else if (target.dataset.bet !== undefined) {
    key = `bet-${target.dataset.bet}`;}

  else {return;}

  if (bets.has(key)) {
    bets.delete(key);
    target.classList.remove('selected'); }

    else{
    bets.add(key);
    target.classList.add('selected');}

  actualizarVista();
}

//LIMPIAR TABLA
clearBtn.addEventListener('click', () => {
  bets.clear();
  document.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('selected');
  });
  actualizarVista();
});

//VISTA APUESTAS
function actualizarVista() {
  const lista = Array.from(bets).sort((a, b) => a - b);
  numbersList.textContent = lista.length ? lista.join(', ') : 'No hay apuestas';
}

//INICIO PAGO DE LAS APUESTAS
function calcularGanancias(numeroGanador, colorGanador) {
  const valorFicha = parseInt(valor.value, 10);
  if (isNaN(valorFicha) || valorFicha <= 0) {
    resultMoneyDiv.innerHTML += '<br><span style="color: red; font-weight: bold;">Error: Ingrese un valor valido para la ficha </span>';
    return;  //evita calculos invalidos
  }

  let ganancias = 0;
  let totalApostado= valorFicha * bets.size;
  let cantApuestas=bets.size;
  let multiplicador=1;

  if (cantApuestas === 1) multiplicador=35;
  if (cantApuestas === 2) multiplicador=17;
  if (cantApuestas === 3) multiplicador=11;
  if (cantApuestas === 4) multiplicador=8;
  if (cantApuestas === 6) multiplicador=5;
  if (cantApuestas === 12) multiplicador=2; 

  const apuestasArray = Array.from(bets);
  for (let i=0; i < cantApuestas; i++) { //si es par/impar rojo/negro se sumara valor de la ficha, si es el numero ganador se usara el multiplicador
    const key = apuestasArray[i];
    const apuesta = parseInt(key.split('-')[1], 10) //extrae el numero

    if (apuesta===numeroGanador) ganancias+= valorFicha*multiplicador;
    if (apuesta%2===0 && numeroGanador%2===0) ganancias+=valorFicha;
    if (apuesta%2!==0 && numeroGanador%2!==0) ganancias+=valorFicha;
    if (colorGanador==="red" && esRojo(apuesta)) ganancias+=valorFicha;
    if (colorGanador==="black" && esNegro(apuesta)) ganancias+=valorFicha;
  }

let mensajeGanancias = ''; 
if(ganancias<totalApostado) resultMoneyDiv.innerHTML = `Dinero conseguido: <span style="color: red; font-weight: bold;">${ganancias}</span>`;
if (ganancias>=totalApostado) resultMoneyDiv.innerHTML = `Dinero conseguido: <span style="color: green; font-weight: bold;">${ganancias}</span>`;
}

//reinicio despues de todos los calculos (despues de un giro)
function reinicio (){
  bets.clear();
  document.querySelectorAll('.cell').forEach(cell => {
  cell.classList.remove('selected');
  });
  actualizarVista();
  //Elimina los mensajes
  resultMoneyDiv.innerHTML = '';
  resultNumberDiv.innerHTML = '';
}
}); //
