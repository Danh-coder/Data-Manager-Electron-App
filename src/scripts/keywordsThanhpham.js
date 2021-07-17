const autocomplete = require('autocompleter');
const Keywords = require('../../utils/keywords');

var info;
(async () => {
    info = await Keywords.readThanhpham();
    SuggestKeywords('tenhang');
    SuggestKeywords('mcu');
    SuggestKeywords('sohopdong');
    SuggestKeywords('chip');
})()

const SuggestKeywords = (name) => {
    var input = document.getElementById(name);
    var arr;
    if (name == 'tenhang') arr = info.tenhang;
    if (name == 'mcu') arr = info.mcu;
    if (name == 'sohopdong') arr = info.sohopdong;
    if (name == 'chip') arr = info.chip;

    console.log(arr);

    autocomplete({
        input: input,
        fetch: function(text, update) {
            text = text.toLowerCase();
            var suggestions;
            if (text.length = 0) suggestions = arr;
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
