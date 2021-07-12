const autocomplete = require('autocompleter');
const Excel = require('../../utils/editExcel');

var info;
(async () => {
    info = await Excel.readKeywordsThanhpham();
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

    autocomplete({
        input: input,
        fetch: function(text, update) {
            text = text.toLowerCase();
            var suggestions;
            if (text.length = 0) suggestions = arr;
            // you can also use AJAX requests instead of preloaded data
            else suggestions = arr.filter(n => n.label.toLowerCase().startsWith(text))
            update(suggestions);
        },
        onSelect: function(item) {
            input.value = item.label;
        },
        showOnFocus: true,
        minLength: 0,
        emptyMsg: "No items found",
});
}
