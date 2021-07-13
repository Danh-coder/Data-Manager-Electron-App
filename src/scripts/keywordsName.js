const autocomplete = require('autocompleter');
const Excel = require('../../utils/editExcel');

var info;
(async () => {
    info = await Excel.readKeywordsLinhkien();
    SuggestKeywords('nameinp');
})()

const SuggestKeywords = (name) => {
    var input = document.getElementById(name);
    var arr;
    if (name == 'nameinp') arr = info.tenhang;

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
            processName();
        },
        minLength: 0,
        showOnFocus: true,
        emptyMsg: "No items found",
        disableAutoSelect: true
});
}
