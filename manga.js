const notice = (msg) => new Notice(msg, 5000);
const log = (msg) => console.log(msg);

const API_URL = "https://api.myanimelist.net/v2/manga";
const SEARCH_FIELDS_QUERY = "?fields=id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_volumes,num_chapters,authors{first_name,last_name},pictures,background,related_manga,related_manga,recommendations,serialization{name}";

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

  const query = await QuickAdd.quickAddApi.inputPrompt(
    "Enter manga title: "
  );
  if (!query) {
    notice("No query entered.");
    throw new Error("No query entered.");
  }

  let selectedManga;

    const results = await getByQuery(query);
    const choice = await QuickAdd.quickAddApi.suggester(
        results.map(formatTitleForSuggestion),
        results
    );
    if (!choice) {
        notice("No choice selected.");
        throw new Error("No choice selected.");
    }

    selectedManga = await getByMangaId(choice.node.id);
    
    let mangaEndDate;
    if(selectedManga.end_date == null) {
      mangaEndDate = "null";
    } else {
      mangaEndDate = selectedManga.end_date;
    }

    let mangaNumChapters;
    if(!selectedManga.num_chapters) {
      mangaNumChapters = '0';
    } else {
      mangaNumChapters = selectedManga.num_chapters;
    }
    
    let mangaAuthors = getMangaAuthors(selectedManga.authors);

    QuickAdd.variables = {
        ...selectedManga,
        image: selectedManga.main_picture.medium,
        startDate: selectedManga.start_date,
        endDate: mangaEndDate,
        genreList: getElementName(selectedManga.genres),
        alternativeTitles: getAltTitles(selectedManga.alternative_titles),
        numChapters: mangaNumChapters,
        synopsis: selectedManga.synopsis,
        mangaStatus: selectedManga.status,
        authors: mangaAuthors,
        fileName: replaceIllegalFileNameCharactersInString(selectedManga.title),
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

async function getByMangaId(id) {
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

function getMangaAuthors(list) {
    console.log(list);
    const arr = Array.from(list);
    let results = [];
    arr.forEach(element => {
        console.log(element);
        let fullName = '[[' + element.node.first_name + ' ' + element.node.last_name + ']]' + ' (' + element.role + ')';
        console.log(fullName);
        results.push(fullName);
    });
    // results = linkifyAuthors(results, roles);
    console.log(results);
    results = results.map((item) => `${item.trim()}`).join(", ");
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
  if(synonymsArr.length > 0)
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
