# myanimelist-quickadd-scripts
Scripts that allow Obsidian users to lookup anime/manga metadata leveraging the
MyAnimeList API and the [QuickAdd](https://github.com/chhoumann/quickadd) plugin.

They are modified from the 
[movies](https://github.com/chhoumann/quickadd/blob/master/docs/docs/Examples/Attachments/movies.js)
sample script provided in the QuickAdd repo.

## Setup

### Client ID

You will first need to create a MyAnimeList Client ID. 
Login to MAL and navigate to [this](https://myanimelist.net/apiconfig) URL.
Click on "CreateID" towards the bottom right, 
fill out the form,
and click submit. 
The Client ID you receive will need to be added to your script configuration 
on setup.

### QuickAdd

First, save the scripts to some folder in your vault. 

Install QuickAdd if you haven't already,
and open the settings.
Click "Manage Macros".
At the bottom, 
enter a name for your macro,
and click "Add Macro".
Click "configure" on your newly created macro,
search for the script you'd like to add in the "User Scripts" box,
then click Add.

![Add Script]("./docs/ConfigureMacro-1.png")

Click the gear icon where your script was just added to,
and you will be prompted for your Client ID. 
Close it once you've entered it.

Click "Template", 
and then click the gear icon once it's added. 
Select the path to your template,
and you can toggle the "File Name Format" option,
and fill the "File Name" field with the following to autoname the note:
{{VALUE:fileName}}.
You can also configure a default folder to save the newly created notes as well.

![TemplateConfig]("./docs/ConfigureTemplate.png)

Once you're done,
go back to the main QuickAdd settings page. 
Change the dropdown next to the "Add Choice" button to "Macro",
and type in a name. 
Click "Add Choice".

![Add Choice]("./docs/EnableMacro.png")

Click the gear icon on the newly added choice,
select the macro you created from the dropdown,
then close the pop up. 

![Select Macro]("./docs/MacroSelect.png")

Click the lightning bolt icon next to your Macro choice.

![MacroChoice]("./docs/EnableMacro2.png")

Close the settings, and open the command pallete. 
Search for your QuickAdd macro:

![QuickAdd]("./docs/QuickAddCommand.png")

### Scripts

anime.js will prompt the user for the anime title to use as the search term. 
The API will return a list of options,
and QuickAdd will list them for the user to select one. 
Once selected, another API query will be made using the anime_id 
to fetch the rest of the metadata. 

![Enter Title]("./docs/Enter-Title.png")

![Select Option]("./docs/Options.png")

manga.js works in the same way, 
but the endpoint and fields are different.
I wanted to have both of these scripts as separate macros in QuickAdd,
so I made them separate scripts despite the overlap. 

animeById can be helpful when the first lookup doesn't return your desired entry.
Results are paginated by MAL to a page size of 10,
so if there's more than 10 entries,
I, would need to make a new endpoint call to fetch the next page.
This could feasibly be done,
but I found that it's rare for the entry I want not to be in the first 10,
and it's easier just to find the id from MAL,
and then use the animeById script to fetch everything. 

Truthfully, I've only ever needed to use this one. 
In this case, I was looking for [this](https://myanimelist.net/anime/50864/Ooyukiumi_no_Kaina) 
entry for "Ooyukiumi no Kaina (Kaina of the Great Snow Sea)".
Searching for "Kaina" or "Ooyukiumi" would only return [this entry for a planned sequel movie](https://myanimelist.net/anime/54122/Ooyukiumi_no_Kaina_Movie).
So instead,
I took the ID that I wanted, 
in this case 50864 (can be found in the URL: anime/{anime_id}),
input that in the animeById script,
and was able to retrieve everything with no issues. 

Selecting an entry that has incomplete information will prompt for input 
to avoid throwing errors. 

Metadata returned from the API can be accessed using {{VALUE:variable}}.
I have included templates for both Anime and Manga entries 
that are slightly modified from what I use.
The manga template contains the authors in Dataview properties 
because there is usually additional information to distinguish between
the artist and the writer.

