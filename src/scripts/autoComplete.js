const autocomplete = require('autocompleter');
const {readKeywords, findPairKeywords, removeKeyword, addKeywordLinhkien, addKeywordThanhpham} = require('../../utils/database');

var info;
(async () => {
    info = await readKeywords();
    trigger();
})()

//Add keyword after adding a review
const addKeyword = async (type) => {
    var obj = prepareObj();
    if (type == 'linhkien') await ipcRenderer.send('addKeyword-linhkien', obj);
    if (type == 'thanhpham') await ipcRenderer.send('addKeyword-thanhpham', obj);
    // if (type == 'linhkien') await addKeywordLinhkien(obj);
    // if (type == 'thanhpham') await addKeywordThanhpham(obj);
    location.reload();
}

const SuggestKeywords = (name, atRemoveKeywordPage = false) => {
    var input = document.getElementById(name);
    var arr;
    if (name == 'tenhang') arr = info.tenhang;
    if (name == 'partnum' || name == 'nameinp') arr = info.partnum;
    if (name == 'chip') arr = info.chip;
    if (name == 'mcu') arr = info.mcu;
    if (name == 'sohopdong' || name == 'shdinp') arr = info.sohopdong;
    if (name == 'sanpham') arr = info.sanpham;
    if (name == 'cty') arr = info.cty;
    if (name == 'dvtinh') arr = info.dvtinh;

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
            if (atRemoveKeywordPage) document.getElementById(`${name}Result`).innerHTML = item;
        },
        render: function(item, currentValue){
            const itemElement = document.createElement("div");
            itemElement.textContent = item;
            return itemElement;
        },
        minLength: 0,
        showOnFocus: true,
        emptyMsg: "No items found",
});
}

const SuggestKeywordsSpecial = (name) => {
    var input = document.getElementById(name);
    var arr = JSON.parse(JSON.stringify(info.tenhang_partnum)); //Only copy values of the 'info' variable
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