const notice = (msg) => new Notice(msg, 5000);
const log = (msg) => console.log(msg);

const API_KEY_OPTION = "MyAnimeList API Key";
const API_URL = "https://api.myanimelist.net/v2/anime";
const SEARCH_FIELDS_QUERY = "?fields=id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics";

module.exports = {
  entry: start,
  settings: {
    name: "MAL Anime Lookup Script",
    author: ["Christian B. B. Houmann", "Roman Soriano"], 
    options: {
      [API_KEY_OPTION]: {
        type: "text",
        defaultValue: "",
        placeholder: "MyAnimeList API Key",
      },
    },
  },
};

let QuickAdd;
let Settings;

async function start(params, settings) {
  QuickAdd = params;
  Settings = settings;

  const query = await QuickAdd.quickAddApi.inputPrompt(
    "Enter anime title: "
  );
  if (!query) {
    notice("No query entered.");
    throw new Error("No query entered.");
  }

  let selectedAnime;

  const results = await getByQuery(query);

  const choice = await QuickAdd.quickAddApi.suggester(
    results.map(formatTitleForSuggestion),
    results
  );
  if (!choice) {
    notice("No choice selected.");
    throw new Error("No choice selected.");
  }

  selectedAnime = await getByAnimeId(choice.node.id);
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

  let animeImage;
  if(selectedAnime.main_picture == null) {
    animeImage = null;
  } else {
    animeImage = selectedAnime.main_picture.medium;
  }

  QuickAdd.variables = {
    ...selectedAnime,
    malID: selectedAnime.id,
    image: animeImage,
    startDate: selectedAnime.start_date,
    endDate: animeEndDate,
    genreList: getElementNameProperties(selectedAnime.genres),
    studios: getElementNameProperties(selectedAnime.studios),
    alternativeTitles: getAltTitles(selectedAnime.alternative_titles),
    title: replaceIllegalFileNameCharactersInString(selectedAnime.title),
    numEpisodes: animeNumEpisodes,
    startSeason: selectedAnime.start_season.year + " " + selectedAnime.start_season.season,
    synopsis: selectedAnime.synopsis,
    animeStatus: selectedAnime.status,
    source: selectedAnime.source,
    nsfw: selectedAnime.nsfw,
    fileName: replaceIllegalFileNameCharactersInString(selectedAnime.title),
  };
}

function formatTitleForSuggestion(resultItem) {
  return `${resultItem.node.title}`;
}

async function getByQuery(query) {
  query = "q=" + query;
  const searchResults = await apiGet(API_URL, {
    s: query,
  }, 'query');

  if (!searchResults.data || !searchResults.data.length) {
    notice("No results found.");
    throw new Error("No results found.");
  }

  return searchResults.data;
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

function getGenreList(list) {
  const arr = Array.from(list);
  let results = [];
  arr.forEach(element => results.push(element.name));
  results = commaList(results);
  return results;
}

function getElementNameProperties(list) {
  if (list === undefined) return "";
  if (list.length === 0) return "";
  const arr = Array.from(list);
  let results = [];
  arr.forEach(element => results.push(element.name));
  results = linkifyListProperties(results);
  return results;
}

function getElementName(list){
  const arr = Array.from(list);
  let results = [];
  arr.forEach(element => results.push(element.name));
  results = linkifyList(results);
  return results;
}

function linkifyListProperties(list) {
  if (list.length === 0) return "";
  if (list.length === 1) return `\n  - \"[[${list[0]}]]\"`;

  return list.map((item) => `\n  - \"[[${item.trim()}]]\"`).join("");
}

function linkifyList(list) {
  if (list.length === 0) return "";
  if (list.length === 1) return `[[${list[0]}]]`;

  return list.map((item) => `[[${item.trim()}]]`).join(", ");
}

function commaList(list) {
  if (list.length === 0) return "";
  if (list.length === 1) return `${list[0]}`;

  return list.map((item) => `${item.trim()}`).join(", ");
}

function getAltTitles(list) {
  let synonymsArr = Array.from(list.synonyms);
  let results = [];
  synonymsArr.forEach(element => results.push(element));
  results.push(replaceIllegalFileNameCharactersInString(list.en));
  results = commaList(results);
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
      "X-MAL-CLIENT-ID": Settings[API_KEY_OPTION],
    },
  });
  return JSON.parse(res);
}
