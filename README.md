# myanimelist-quickadd-scripts
Scripts that allow Obsidian users to lookup anime/manga metadata leveraging the MyAnimeList API and the [QuickAdd](https://github.com/chhoumann/quickadd) plugin.

They are modified from the [movies](https://github.com/chhoumann/quickadd/blob/master/docs/docs/Examples/Attachments/movies.js) sample script provided in the QuickAdd repo.

anime.js will prompt the user for the anime title to use as the search term. The API will return a list of options, and QuickAdd will list them for the user to select one. Once selected, another API query will be made using the anime_id to fetch the rest of the metadata. manga.js works in the same way, but the endpoint and fields are different. I wanted to have both of these scripts as separate macros in QuickAdd, so I made them separate scripts despite the overlap. animeById can be helpful when the first lookup doesn't return your desired entry. Results are paginated by MAL to a page size of 10, so if there's more than 10 entries, I would need to make a new endpoint call to fetch the next page. This could feasibly be done, but I found that it's rare for the entry I want not to be in the first 10, and it's easier just to find the id from MAL, and then use the animeById script to fetch everything. 

![Example](/docs/ResultNotInLookup.png)

In this case, I was looking for [this](https://myanimelist.net/anime/50864/Ooyukiumi_no_Kaina) entry for "Ooyukiumi no Kaina (Kaina of the Great Snow Sea)". Searching for "Kaina" or "Ooyukiumi" would only return [this entry for a planned sequel movie](https://myanimelist.net/anime/54122/Ooyukiumi_no_Kaina_Movie). So instead, I took the ID that I wanted, in this case 50864 (can be found in the URL: anime/{anime_id}), input that in the animeById script, and was able to retrieve everything with no issues. 

Selecting an entry that has incomplete information will result in errors.

Metadata returned from the API can be accessed using {{VALUE:variable}}. Below is a sample template that stores some elements in the YAML header, and any elements that are linkified (wrapped in braces) are stored outside of that so they are clickable. 

```
---
tags: anime
title: {{VALUE:title}}
poster: {{VALUE:image}}
startDate: {{VALUE:startDate}}
endDate: {{VALUE:endDate}}
source: {{VALUE:source}}
nsfw: {{VALUE:nsfw}}
numEpisodes: {{VALUE:numEpisodes}}
startSeason: {{VALUE:startSeason}}
animeStatus: {{VALUE:animeStatus}}
status:
---

Synopsis:: {{VALUE:synopsis}}

Studios: {{VALUE:studios}}
Alternative Titles:: {{VALUE:alternativeTitles}}
Genres:: {{VALUE:genreList}}
```
