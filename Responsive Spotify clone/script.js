let currentSong = new Audio();
let pause = document.querySelector("#pause");
let play = document.querySelector("#play");

let songs;
let currFolder;

function secondsToMinutesSeconds(totalSeconds) {
  // Ensure totalSeconds is a non-negative integer
  totalSeconds = Math.max(0, Math.floor(totalSeconds));

  // Check if totalSeconds is a valid number
  if (isNaN(totalSeconds)) {
    return "00:00";
  }

  // Calculate minutes and seconds
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

  return minutes + ":" + formattedSeconds;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith("mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Show all the songs in Playlist
  let songUL = document
    .querySelector(".song-lists")
    .getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
        
            <i id="lib-icon" class="fa-solid fa-music"></i>
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                
            </div>
            <div class="play-now">
                <span>Play now</span>
                <i id="lib-icon" class="fa-solid fa-circle-play"></i>
            </div>  
        
        </li>`;
  }

  // Attach an eventlistener to each song
  Array.from(
    document.querySelector(".song-lists").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });


  return songs;
  
}

const playMusic = (track) => {
  currentSong.src = `/${currFolder}/` + track;
  if (pause) {
    currentSong.play();
  }
  play.src = pause.style.display = "unset";
  pause.src = play.style.display = "none";

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};


async function displayAlbums(){
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardcontainer")

  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
      const e = array[index];
      
    if (e.href.includes("/songs")) {
      let folder =e.href.split("/").slice(-2)[0]; 
      //Get the meta data of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();  
      console.log(response);

      cardContainer.innerHTML = cardContainer.innerHTML + `
             <div data-folder="${folder}" class="card">

                        <div class="play-button">
                            <i class="fa-solid fa-play"></i>
                        </div>

                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>

                    </div>`
    }

  }

    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
      e.addEventListener("click", async item=>{
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        playMusic(songs[0]);
        let playBar = document.querySelector(".play-bar");
        playBar.style.visibility = "visible";
    
      });

    });


}

async function main() {
  //Get the list of all the songs.
  await getSongs("songs/ncs"); 

  //Display all the Albums on the page
  displayAlbums()

  // Attach an eventlistener to play , next and previous.
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = pause.style.display = "unset";
      play.src = play.style.display = "none";
    } else {
      currentSong.pause();
      play.src = pause.style.display = "none";
      play.src = play.style.display = "unset";
    }
  });

  pause.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      pause.src = pause.style.display = "unset";
      pause.src = play.style.display = "none";
    } else {
      currentSong.pause();
      pause.src = pause.style.display = "none";
      pause.src = play.style.display = "unset";
    }
  });

// event listener on previous and next 

let currentSongIndex = 0;

function playPreviousSong() {
  currentSongIndex--;
  if (currentSongIndex < 0) {
    currentSongIndex = songs.length - 1;
  }

  console.log("Playing previous song:", songs[currentSongIndex]);
 
  playMusic(songs[currentSongIndex]);
}

document.getElementById("previous").addEventListener("click", function () {
  playPreviousSong();
});

function playNextSong() {
  currentSongIndex++;
  if (currentSongIndex >= songs.length) {
    currentSongIndex = 0;
  }
  playMusic(songs[currentSongIndex]);
}

document.getElementById("next").addEventListener("click", function () {
  playNextSong();
});


  // listener for timeupdate event

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;

    // For circle moves
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add event listener to seek-bar
  document.querySelector(".seek-bar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add event listener on your library

  let cards = document.querySelector(".cardcontainer");

  cards.addEventListener("click", (e) => {
    document.querySelector(".your-lib").style.display = "none";
    document.querySelector(".your-lib2").style.visibility = "visible";
  });

  // Add event listener on hamburger and cross

  let hamburger = document.querySelector("#hamburger");
  let cross = document.querySelector(".cross");

  hamburger.addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "0";
  });

  cross.addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "-100%";
  });

// add the event listeners for previous and next


  // Add a event listener to volume
  document.querySelector(".volume-range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
    currentSong.volume = parseInt(e.target.value) / 100
  });

}

main();


let songList = document.querySelector(".song-lists");
songList.addEventListener("click", (e)=>{
    let playBar = document.querySelector(".play-bar");
    playBar.style.visibility = "visible";
    playBar.style.height = "7vh";
});