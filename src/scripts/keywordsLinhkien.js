const autocomplete = require('autocompleter');
const Keywords = require('../../utils/keywords');

var info;
(async () => {
    info = await Keywords.readLinhkien();
    SuggestKeywords('tenhang');
    SuggestKeywords('partnum');
    SuggestKeywords('sohopdong');
    SuggestKeywords('sanpham');
    SuggestKeywords('cty');
    SuggestKeywords('dvtinh');
})()

const SuggestKeywords = (name) => {
    var input = document.getElementById(name);
    var arr;
    if (name == 'tenhang') arr = info.tenhang;
    if (name == 'partnum') arr = info.partnum;
    if (name == 'sohopdong') arr = info.sohopdong;
    if (name == 'sanpham') arr = info.sanpham;
    if (name == 'cty') arr = info.cty;
    if (name == 'dvtinh') arr = info.dvtinh;

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
        minLength: 0,
        showOnFocus: true,
        emptyMsg: "No items found",
});
}
