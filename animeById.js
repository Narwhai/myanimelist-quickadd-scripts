const notice = (msg) => new Notice(msg, 5000);
const log = (msg) => console.log(msg);

const API_URL = "https://api.myanimelist.net/v2/anime";
const SEARCH_FIELDS_QUERY = "?fields=id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics";

module.exports = {
  entry: start,
  settings: {
    name: "MAL Anime Lookup Script",
    author: ["Christian B. B. Houmann", "Roman Soriano"], 
  },
};

let QuickAdd;

async function start(params) {
  QuickAdd = params;

  const inputId = await QuickAdd.quickAddApi.inputPrompt(
    "Enter anime ID: "
  );
  if (!inputId) {
    notice("No query entered.");
    throw new Error("No query entered.");
  }

  let selectedAnime;

   selectedAnime = await getByAnimeId(inputId);
    
    let animeEndDate;
    if(selectedAnime.end_date == null) {
      animeEndDate = "null";
    } else {
      animeEndDate = selectedAnime.end_date;
    }

    let animeNumEpisodes;
    if(!selectedAnime.num_episodes) {
      animeNumEpisodes = '0';
    } else {
      animeNumEpisodes = selectedAnime.num_episodes;
    }
    
    QuickAdd.variables = {
        ...selectedAnime,
        image: selectedAnime.main_picture.medium,
        startDate: selectedAnime.start_date,
        endDate: animeEndDate,
        genreList: getElementName(selectedAnime.genres),
        studios: getElementName(selectedAnime.studios),
        alternativeTitles: getAltTitles(selectedAnime.alternative_titles),
        numEpisodes: animeNumEpisodes,
        startSeason: selectedAnime.start_season.year + " " + selectedAnime.start_season.season,
        synopsis: selectedAnime.synopsis,
        animeStatus: selectedAnime.status,
        fileName: replaceIllegalFileNameCharactersInString(selectedAnime.title),
    };
}

async function getByAnimeId(id) {
  const res = await apiGet(API_URL, {
    s: id,
  }, 'id');

  if (!res) {
    notice("No results found.");
    throw new Error("No results found.");
  }

  return res;
}

function getElementName(list){
  const arr = Array.from(list);
  let results = [];
  arr.forEach(element => results.push(element.name));
  results = linkifyList(results);
  return results;
}

function linkifyList(list) {
  if (list.length === 0) return "";
  if (list.length === 1) return `[[${list[0]}]]`;

  return list.map((item) => `[[${item.trim()}]]`).join(", ");
}

function getAltTitles(list) {
  let synonymsArr = Array.from(list.synonyms);
  let results = [];
  synonymsArr.forEach(element => results.push(element));
  results.push(list.en);
  results = linkifyList(results);
  return results;
}

function replaceIllegalFileNameCharactersInString(string) {
  return string.replace(/[\\,#%&\{\}\/*<>?$\'\":@]*/g, "");
}

async function apiGet(url, data, type) {
    let finalURL = new URL(url);
    if(type == 'query')
      finalURL.search = data.s;
    else if(type == 'id')
    {
      finalURL.href = finalURL.href + '/' + data.s + SEARCH_FIELDS_QUERY;
    }
      
    const res = await request({
        url: finalURL.href,
        method: "GET",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            "X-MAL-CLIENT-ID": "68a0c0a28660e2e55306c52bf2908eb0",

        },
    });
    
    return JSON.parse(res);
}
