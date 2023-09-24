//import MidiWriter from 'midi-writer-js';
//add comments to all of the code below

(function () {
  "use strict";

  const chords = [
    'C', 'Cm', 'Cdim',
    'Db', 'Dbm', 'Dbdim',
    'D', 'Dm', 'Ddim',
    'Eb', 'Ebm', 'Ebdim',
    'E', 'Em', 'Edim',
    'F', 'Fm', 'Fdim',
    'Gb', 'Gbm', 'Gbdim',
    'G', 'Gm', 'Gdim',
    'Ab', 'Abm', 'Abdim',
    'A', 'Am', 'Adim',
    'Bb', 'Bbm', 'Bbdim',
    'B', 'Bm', 'Bdim'
];

let items=[];//the scale notes
let tracks = [];

//var midiWriterJs = require("midi-writer-js")
const chromaticScale = ["C", "Cb", "D", "Db", "E", "F", "Fb", "G", "Gb", "A", "Ab", "B"];
const doors = document.querySelectorAll(".door");
 //variables for current Key
document.querySelector(".info").textContent = items.join(" ");
document.querySelector("#spinner").addEventListener("click", spin);
document.querySelector("#reseter").addEventListener("click", init);
document.querySelector("#mute").addEventListener("click", mute);

//mute button
function mute(){
  var audio = document.getElementById("audio");
  if(audio.muted === true){
    audio.muted = false;
  }else{
    audio.muted = true;
  }
  
}
//creates the scale, saves it to the items array
function createScale(key, scale){
  
      let i =0;
      while(chords[i]!=key){ 
        i++;
      }
      var scaleIndexes = [(i+1),(i+8)%36,(i+12)%36,(i+16)%36,(i+21)%36,(i+27)%36,(i+33)%36];
      if (scale === "Minor"){
          for(var m =0; m<7;m++){
              items[m]= chords[scaleIndexes[m]];
          } 
       
      }
      else if (scale === "Major"){
         scaleIndexes = [(i),(i+7)%36,(i+13)%36,(i+15)%36,(i+21)%36,(i+28)%36,(i+35)%36];
        for(var m =0; m<7;m++){
          items[m]= chords[scaleIndexes[m]];
        } 
       
      }
      else {
        alert("wtf bro");
      }
      
  }
  //searches for the root in the items array
  function searchScale(root){
    //seach for the root in the items array
    //return the index of the root
    for(let i =0; i<items.length; i++){
      if(items[i]===root){
        return i;
      }
    }
  }
  function searchChromatic(root){
    //seach for the root in the items array
    //return the index of the root
    for(let i =0; i<items.length; i++){
      if(chromaticScale[i]===root){
        return i;
      }
    }
  }
  function play() {
      var audio = document.getElementById("audio");
      
      audio.play(); 
      
      
  }
  //spins the doors, calls init, and plays the audio
  async function spin() {
    const scale = document.getElementById('majMin').value;
    const key = document.getElementById('noteKey').value;
    createScale(key, scale);
    init(false, 1, 2);
    
    for (const door of doors) {
      const boxes = door.querySelector(".boxes");
      const duration = parseInt(boxes.style.transitionDuration);
      play();
      boxes.style.transform = "translateY(0)";
      await new Promise((resolve) => setTimeout(resolve, duration * 100));
    }
    
  
  }
//initialize the doors
  function init(firstInit = true, groups = 1, duration = 1) {
   
    for (const door of doors) {
      if (firstInit) {
        door.dataset.spinned = "0";
      } else if (door.dataset.spinned === "1") {
        return;
      }

      const boxes = door.querySelector(".boxes");
      const boxesClone = boxes.cloneNode(false);

      const pool = ["❓"];
      if (!firstInit) {
        const arr = [];
        for (let n = 0; n < (groups > 0 ? groups : 1); n++) {
          arr.push(...items);
        }
        pool.push(...shuffle(arr));

        boxesClone.addEventListener(
          "transitionstart",
          function () {
            door.dataset.spinned = "1";
            this.querySelectorAll(".box").forEach((box) => {
              box.style.filter = "blur(1px)";
            });
          },
          { once: true }
        );

        boxesClone.addEventListener(
          "transitionend",
          function () {
            this.querySelectorAll(".box").forEach((box, index) => {
              box.style.filter = "blur(0)";
              if (index > 0) this.removeChild(box);
            });
          },
          { once: true }
        );
      }
      // console.log(pool);

      for (let i = pool.length - 1; i >= 0; i--) {
        const box = document.createElement("div");
        box.classList.add("box");
        box.style.width = door.clientWidth + "px";
        box.style.height = door.clientHeight + "px";
        box.textContent = pool[i];
        // get midi for current chord, commented out for now
       // midiToChord(pool[i]);
        playChord(pool[i]);
          
        boxesClone.appendChild(box);
      }
      boxesClone.style.transitionDuration = `${duration > 0 ? duration : 1}s`;
      boxesClone.style.transform = `translateY(-${
        door.clientHeight * (pool.length - 1)
      }px)`;
      door.replaceChild(boxesClone, boxes);
     
    }
  }
//shuffles the array
  function shuffle([...arr]) {
    let m = arr.length;
    while (m) {
      const i = Math.floor(Math.random() * m--);
      [arr[m], arr[i]] = [arr[i], arr[m]];
    }
    return arr;
  }

  const startF = 1000;
  const lpf = new Tone.Filter(startF,"lowpass").toMaster();
  
  const hpf = new Tone.Filter(80,"highpass").connect(lpf);
  var synth = new Tone.Synth().connect(hpf);
  synth.oscillator.type = 'sine'; 

  async function playChord(root){
    //wait 500ms
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if(root.length === 1){
      synth.triggerAttackRelease(chromaticScale[searchChromatic(root)]+"4", "16n");
      await new Promise((resolve) => setTimeout(resolve, 20));
      synth.triggerAttackRelease(chromaticScale[searchChromatic(root)+4]+"4", "16n");
      await new Promise((resolve) => setTimeout(resolve, 20));
      synth.triggerAttackRelease(chromaticScale[searchChromatic(root)+7]+"4", "16n");
    } else if (root.length === 2){
      if (root[1] === "b"){
        synth.triggerAttackRelease(chromaticScale[searchChromatic(root)]+"4", "16n");
        await new Promise((resolve) => setTimeout(resolve, 20));
        synth.triggerAttackRelease(chromaticScale[searchChromatic(root)+4]+"4", "16n");
        await new Promise((resolve) => setTimeout(resolve, 20));
        synth.triggerAttackRelease(chromaticScale[searchChromatic(root)+7]+"4", "16n");
      } else{
        root = root[0];
        synth.triggerAttackRelease(chromaticScale[searchChromatic(root)]+"4", "16n");
        await new Promise((resolve) => setTimeout(resolve, 20));
        synth.triggerAttackRelease(chromaticScale[searchChromatic(root)+3]+"4", "16n");
        await new Promise((resolve) => setTimeout(resolve, 20));
        synth.triggerAttackRelease(chromaticScale[searchChromatic(root)+7]+"4", "16n");
      }
    } else if (root.lenght === 3){
      root = root[0]+root[1];
      synth.triggerAttackRelease(chromaticScale[searchChromatic(root)]+"4", "16n");
      await new Promise((resolve) => setTimeout(resolve, 20));
      synth.triggerAttackRelease(chromaticScale[searchChromatic(root)+3]+"4", "16n");
      await new Promise((resolve) => setTimeout(resolve, 20));
      synth.triggerAttackRelease(chromaticScale[searchChromatic(root)+7]+"4", "16n");
    } else if (root.lenght === 4 ){
      //concat root to first 2 letters
      root = root[0];
      synth.triggerAttackRelease(chromaticScale[searchChromatic(root)]+"4", "16n");
      await new Promise((resolve) => setTimeout(resolve, 20));
      synth.triggerAttackRelease(chromaticScale[searchChromatic(root)+3]+"4", "16n");
      await new Promise((resolve) => setTimeout(resolve, 20));
      synth.triggerAttackRelease(chromaticScale[searchChromatic(root)+6]+"4", "16n");
    }
    else if (root.lenght === 5 ){
      //concat root to first 2 letters
      root = root[0] + root[1];
      synth.triggerAttackRelease(chromaticScale[searchChromatic(root)]+"4", "16n");
      await new Promise((resolve) => setTimeout(resolve, 20));
      synth.triggerAttackRelease(chromaticScale[searchChromatic(root)+3]+"4", "16n");
      await new Promise((resolve) => setTimeout(resolve, 20));
      synth.triggerAttackRelease(chromaticScale[searchChromatic(root)+6]+"4", "16n");
    }
    
  }
  /* Commented out for now, will be used to export midi files
  function exportMidi(){
    var writer = new MidiWriter.Writer(tracks);
    writer.saveMIDI("sounds/midi.mid");
  }
  function randomTime(){
    return "Tn" + Math.floor((Math.random()*16)+1);
  }
  */
  //a function which takes in a note and returns a chord. Commented out for now
  /*
  function midiToChord(strNote){ 
  let status = 0;
  let root = "";
  //switch statement to determine the root of the chord and the status of the chord
  switch(strNote){
    //case for each note all accidentals treated as flats
    case "C":
      root = "C";
      status = 1;
      break;
    case "Db": 
      root = "Db";
      status = 1;
      break;
    case "D":
      root = "D";
      status = 1;
      break;
    case "Eb":
      root = "Eb";
      status = 1;
      break;
    case "E":
      root = "E";
      status = 1;
      break;
    case "F":
      root = "F";
      status = 1;
      break;
    case "Gb":
      root = "Gb";
      status = 1;
      break;
    case "G":
      root = "G";
      status = 1;
      break;
    case "Ab":
      root = "Ab";
      status = 1;
      break;
    case "A":
      root = "A";
      status = 1;
      break;
    case "Bb":
      root = "Bb";
      status = 1;
      break;
    case "B":
      root = "B";
      status = 1;
      break;
    //case for each note with a trailing m indicating minor
    case "Cm":
      root = "C";
      status = 2;
      break;
    case "Dbm":
      root = "Db";
      status = 2;
      break;
    case "Dm":
      root = "D";
      status = 2;
      break;
    case "Ebm":
      root = "Eb";
      status = 2;
      break;
    case "Em":
      root = "E";
      status = 2;
      break;
    case "Fm":
      root = "F";
      status = 2;
      break;
    case "Gbm":
      root = "Gb";
      status = 2;
      break;
    case "Gm":
      root = "G";
      status = 2;
      break;
    case "Abm":
      root = "Ab";
      status = 2;
      break;
    case "Am":
      root = "A";
      status = 2;
      break;
    case "Bbm":
      root = "Bb";
      status = 2;
      break;
    case "Bm":
      root = "B";
      status = 2;
      break;
    //case for each note with a trailing dim indicating diminished
    case "Cdim":
      root = "C";
      status = 3;
      break;
    case "Dbdim":
      root = "Db";
      status = 3;
      break;
    case "Ddim":
      root = "D";
      status = 3;
      break;
    case "Ebdim":
      root = "Eb";
      status = 3;
      break;
    case "Edim":
      root = "E";
      status = 3;
      break;
    case "Fdim":
      root = "F";
      status = 3;
      break;
    case "Gbdim":
      root = "Gb";
      status = 3;
      break;
    case "Gdim":
      root = "G";
      status = 3;
      break;
    case "Abdim":
      root = "Ab";
      status = 3;
      break;
    case "Adim":
      root = "A";
      status = 3;
      break;
    case "Bbdim":
      root = "Bb";
      status = 3;
      break;
    case "Bdim":
      root = "B";
      status = 3;
      break;
    default:
      status = 0;
      break;
    

  
  }
  //switch statement to determine the chord based on the root and status
  switch(status){
    case 1:
      
      for(t of tracks){
      var notes = [items[searchScale(root)]+3,items[searchScale(root+3)]+3,items[searchScale(root+7)]+3,items[searchScale(root)]+4];
      for(n of notes){
        notes.push(new MidiWriter.NoteEvent({pitch: notes, duration: 1, wait: randomTime()}));
      }
      var newTrack = new MidiWriter.Track();
      newTrack.addEvent(notes, function(event, index){ return {sequential: false}; });
      tracks.push(newTrack);
  }

      break;
    case 2:
      //return [root+"4", root+"5", root+"6m"];
      break;
    case 3:
      //return [root+"4", root+"5d", root+"6d"];
      break;
    default:
      //return ["C4", "E4", "G4"];
      break;
  }
  }*/
  init();
 
})();
