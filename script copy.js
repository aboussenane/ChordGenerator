import MidiWriter from 'midi-writer-js';
(function () {
  "use strict";

  var chords = [
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
var items=[];

const scale = document.getElementById('majMin').value;
const key = document.getElementById('noteKey').value; //variables for current Key
  document.querySelector(".info").textContent = items.join(" ");

  const doors = document.querySelectorAll(".door");
  document.querySelector("#spinner").addEventListener("click", spin);
  document.querySelector("#reseter").addEventListener("click", init);
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
       // alert(str);
      }
      else if (scale === "Major"){
         scaleIndexes = [(i),(i+7)%36,(i+13)%36,(i+15)%36,(i+21)%36,(i+28)%36,(i+35)%36];
         for(var m =0; m<7;m++){
          items[m]= chords[scaleIndexes[m]];
      } 
       // alert(str);
      }
      else {
        alert("wtf bro");
      }
      
    }
    function play() {
      var audio = document.getElementById("audio");
      
      audio.play();
      
      
    }
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
    
    // Start with a new track
    const track = new MidiWriter.Track();

    // Define an instrument (optional):
    track.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1}));

    // Add some notes:
    const note = new MidiWriter.NoteEvent({pitch: ['C4', 'D4', 'E4'], duration: '4'});
    track.addEvent(note);

    // Generate a data URI
    const write = new MidiWriter.Writer(track);
    console.log(write.dataUri());
  }

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
        boxesClone.appendChild(box);
      }
      boxesClone.style.transitionDuration = `${duration > 0 ? duration : 1}s`;
      boxesClone.style.transform = `translateY(-${
        door.clientHeight * (pool.length - 1)
      }px)`;
      door.replaceChild(boxesClone, boxes);
      // console.log(door);
    }
  }

  function shuffle([...arr]) {
    let m = arr.length;
    while (m) {
      const i = Math.floor(Math.random() * m--);
      [arr[m], arr[i]] = [arr[i], arr[m]];
    }
    return arr;
  }
  
  init();
})();
