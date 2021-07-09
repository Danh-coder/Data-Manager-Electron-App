const {dialog} = require('electron');

module.exports = (type, title, message) => {
    const options = {type, title, message};
    dialog.showMessageBox(null, options);
}