document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const toggleViewLink = document.getElementById('toggle-view');
    
    const loadingContainer = document.getElementById('loading-container');
    const loadingStatus = document.getElementById('loading-status');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const loadingDetails = document.getElementById('loading-details');

    let allSongs = [];
    let authors = [];
    let currentSongs = []; 

    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSx0LfEILechHBVKVEjuWA57E18yXF9xTXfcLPXCY75dGSZvNf2lLaiy6Rrgu9XW6FVkQ57cmE9ewCV/pub?output=csv';

    // 1. Jerevana ny cache (Offline First)
    const cachedData = localStorage.getItem('songs_data');
    if (cachedData) {
        allSongs = JSON.parse(cachedData);
        authors = [...new Set(allSongs.map(song => song.author))];
        hideLoading();
        renderHomePage(allSongs);
    }

    // Fampitandremana raha toa ka ela loatra ny fisintomana
    const internetTimeout = setTimeout(() => {
        if (!cachedData && loadingStatus) {
            loadingStatus.textContent = "Misy olana ny fidirana amin'ny internet...";
            loadingStatus.style.color = "red";
        }
    }, 5000);

    // 2. Fisintomana miaraka amin'ny fandrefesana ny lanjany
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            
            clearTimeout(internetTimeout);
            const reader = response.body.getReader();
            let receivedLength = 0;
            let chunks = [];

            return new Promise((resolve, reject) => {
                function read() {
                    reader.read().then(({done, value}) => {
                        if (done) {
                            resolve({ chunks, receivedLength });
                            return;
                        }
                        chunks.push(value);
                        receivedLength += value.length;

                        const kBytes = (receivedLength / 1024).toFixed(1);
                        if (loadingDetails) {
                            loadingDetails.textContent = "Efa voasintona: " + kBytes + " KB";
                        }
                        if (progressBarFill) {
                            let simulatedPercent = Math.min(95, (receivedLength / 50000) * 100);
                            progressBarFill.style.width = simulatedPercent + "%";
                        }

                        read();
                    }).catch(reject);
                }
                read();
            });
        })
        .then(({ chunks, receivedLength }) => {
            let chunksAll = new Uint8Array(receivedLength);
            let position = 0;
            for(let chunk of chunks) {
                chunksAll.set(chunk, position);
                position += chunk.length;
            }
            const csvText = new TextDecoder("utf-8").decode(chunksAll);

            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    allSongs = results.data; 
                    localStorage.setItem('songs_data', JSON.stringify(allSongs));
                    authors = [...new Set(allSongs.map(song => song.author))];
                    
                    if (progressBarFill) progressBarFill.style.width = "100%";
                    
                    setTimeout(() => {
                        hideLoading();
                        renderHomePage(allSongs);
                    }, 300);
                }
            });
        })
        .catch(err => {
            clearTimeout(internetTimeout);
            console.log("Offline mode na nisy olana:", err);
            if (cachedData) {
                hideLoading();
                renderHomePage(allSongs);
            } else {
                if (loadingStatus) {
                    loadingStatus.textContent = "Tsy afaka mampiditra hira. Hamarino ny internet.";
                    loadingStatus.style.color = "red";
                }
            }
        });

    function hideLoading() {
        if (loadingContainer) loadingContainer.style.display = 'none';
    }

    function renderHomePage(songsToRender) {
        currentSongs = songsToRender;
        appContainer.innerHTML = `
            <header>
                <h1>Mizmor Shir Chadash</h1>
                <input type="text" id="search-input" class="search-bar" placeholder="Mikaroka lohatenin-kira...">
            </header>
            <ul id="song-list" class="song-list"></ul>
        `;
        const searchInput = document.getElementById('search-input');
        const songList = document.getElementById('song-list');

        renderSongList(currentSongs, songList);
        if(toggleViewLink) toggleViewLink.textContent = "Mpamoron-kira";

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredSongs = allSongs.filter(song =>
                (song.title && song.title.toLowerCase().includes(searchTerm)) ||
                (song.text && song.text.toLowerCase().includes(searchTerm))
            );
            renderSongList(filteredSongs, songList);
        });
    }

    function renderSongList(songs, container) {
        container.innerHTML = '';
        if (songs.length === 0) {
            container.innerHTML = '<li style="text-align:center; color:#333; background:none; box-shadow:none;">Tsy misy hira hita.</li>';
        } else {
            songs.forEach((song, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="song-title-list">${song.title || 'Tsy misy lohateny'}</span>`;
                li.addEventListener('click', () => renderSongDetails(song, index));
                container.appendChild(li);
            });
        }
    }

    function renderSongDetails(song, index) {
        appContainer.innerHTML = `
            <div class="song-details-container">
                <header class="sticky-header">
                    <div class="song-navigation">
                        <button id="prev-song" class="nav-button">Teo aloha</button>
                        <button id="back-to-list" class="nav-button">Hira rehetra</button>
                        <button id="next-song" class="nav-button">Manaraka</button>
                    </div>
                </header>
                <div class="song-details">
                    <h2>${song.title || 'Tsy misy lohateny'}</h2>
                    <p><strong>Mpamorona:</strong> ${song.author || 'Tsy fantatra'}</p>
                    <p><strong>Fanalahidy:</strong> ${song.key || '-'}</p>
                    <pre>${song.text || ''}</pre>
                </div>
            </div>
        `;
        
        document.getElementById('prev-song').addEventListener('click', () => {
            const newIndex = (index - 1 + currentSongs.length) % currentSongs.length;
            renderSongDetails(currentSongs[newIndex], newIndex);
        });

        document.getElementById('next-song').addEventListener('click', () => {
            const newIndex = (index + 1) % currentSongs.length;
            renderSongDetails(currentSongs[newIndex], newIndex);
        });

        document.getElementById('back-to-list').addEventListener('click', () => {
            renderHomePage(currentSongs);
        });
        window.scrollTo(0,0);
    }

    function renderAuthorPage() {
        appContainer.innerHTML = `
            <header>
                <h1>Chalan Mizmor Shir</h1>
                <input type="text" id="search-input" class="search-bar" placeholder="Mikaroka anaran'ny mpamorona...">
            </header>
            <ul id="author-list" class="author-list"></ul>
        `;
        const authorList = document.getElementById('author-list');
        authors.sort().forEach(author => {
            if(author) {
                const li = document.createElement('li');
                li.innerHTML = `<span class="author-name">${author}</span>`;
                li.addEventListener('click', () => {
                    const filtered = allSongs.filter(s => s.author === author);
                    renderHomePage(filtered);
                });
                authorList.appendChild(li);
            }
        });
        if(toggleViewLink) toggleViewLink.textContent = "Lohatenin-kira";
    }

    if(toggleViewLink) {
        toggleViewLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (toggleViewLink.textContent === "Mpamoron-kira") {
                renderAuthorPage();
            } else {
                renderHomePage(allSongs);
            }
        });
    }
});
