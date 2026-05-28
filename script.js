document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSx0LfEILechHBVKVEjuWA57E18yXF9xTXfcLPXCY75dGSZvNf2lLaiy6Rrgu9XW6FVkQ57cmE9ewCV/pub?output=csv';

    function loadData() {
        const cached = localStorage.getItem('songs_data');
        if (cached) {
            renderSongs(JSON.parse(cached));
        }
        
        fetch(csvUrl)
            .then(r => r.text())
            .then(text => {
                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (res) => {
                        localStorage.setItem('songs_data', JSON.stringify(res.data));
                        renderSongs(res.data);
                    }
                });
            })
            .catch(() => {
                console.log("Offline mode: mampiasa cache.");
                // Raha nisy cache dia efa naseho teo ambony, fa raha mbola tsy naseho dia averina eto
                if (cached) {
                    renderSongs(JSON.parse(cached));
                }
            });
    }

    function renderSongs(songs) {
        const list = document.getElementById('songs-list');
        if(!list) return;
        list.innerHTML = '';
        songs.forEach(s => {
            let div = document.createElement('div');
            // Ataovy azo antoka fa mifanaraka amin'ny lohatenin'ny tsanganana ao amin'ny Google Sheets-nao ny hoe 'title'
            div.textContent = s.title || "Tsy misy lohateny"; 
            list.appendChild(div);
        });
    }

    loadData();
});
