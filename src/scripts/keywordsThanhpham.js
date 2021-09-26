const autocomplete = require('autocompleter');
const Keywords = require('../../utils/keywords');

var info;
(async () => {
    info = await Keywords.readThanhpham();
    SuggestKeywordsSpecial('tenhang');
    SuggestKeywords('mcu');
    SuggestKeywords('sohopdong');
    SuggestKeywords('chip');
})()

const SuggestKeywords = (name) => {
    var input = document.getElementById(name);
    var arr;
    if (name == 'mcu') arr = info.mcu;
    if (name == 'sohopdong') arr = info.sohopdong;
    if (name == 'chip') arr = info.chip;

    autocomplete({
        input: input,
        fetch: function(text, update) {
            text = text.toLowerCase();
            var suggestions;
            if (text.length == 0) suggestions = arr;
            // you can also use AJAX requests instead of preloaded data
            else suggestions = arr.filter(n => n.toLowerCase().startsWith(text))
            update(suggestions);
        },
        onSelect: function(item) {
            input.value = item;
        },
        render: function(item, currentValue){
            const itemElement = document.createElement("div");
            itemElement.textContent = item;
            return itemElement;
        },
        showOnFocus: true,
        minLength: 0,
        emptyMsg: "No items found",
});
}

const SuggestKeywordsSpecial = (name) => {
    var input = document.getElementById(name);
    var arr = JSON.parse( JSON.stringify(info.tenhang_partnum)); //Only copy values of the 'info' variable
    if (name == 'tenhang') {
        arr = deleteSimilarTenhang(arr); //Show all suggestions in partnum input
    }

    autocomplete({
        input: input,
        fetch: function(text, update) {
            text = text.toLowerCase();
            var suggestions;
            if (text.length == 0) suggestions = arr;
            // you can also use AJAX requests instead of preloaded data
            else suggestions = arr.filter(n => n[name].toLowerCase().startsWith(text))

            update(suggestions);
        },
        onSelect: function(item) {
            document.getElementById('tenhang').value = item.tenhang;
            document.getElementById('partnum').value = item.partnum;
        },
        render: function(item, currentValue){
            const itemElement = document.createElement("div");
            itemElement.textContent = item[name];
            return itemElement;
        },
        minLength: 0,
        showOnFocus: true,
        emptyMsg: "No items found",
});
}

var deleteSimilarTenhang = (arr) => {
    var visited = {}, i = 0;
    while (i < arr.length) {
        while (i < arr.length && visited[arr[i].tenhang] == true) arr.splice(i, 1);
        if (i < arr.length) visited[arr[i].tenhang] = true;
        i++;
    }
    return arr;
}
