// localStorage variables in general /////////////////////////////////////
var reviews = JSON.parse(localStorage.getItem('reviews')); //Get localStorage objects' values
var lastSubmission = JSON.parse(localStorage.getItem('lastSubmission')); //Get localStorage objects' values
function updateLocalStorage() {
    localStorage.reviews = JSON.stringify(reviews);
    localStorage.lastSubmission = JSON.stringify(lastSubmission);
}

// Reviews processes /////////////////////////////////////
function addReview(key, obj) {
    reviews[key].push(obj);
    updateLocalStorage();
}
function removeReview(key, index) {
    reviews[key].splice(index, 1); //Remove it from the array
    updateLocalStorage();
}
function updateReview(key, index, obj) {
    Object.assign(reviews[key][index], obj); //Edit multiple values of an object
    updateLocalStorage();
}

// Last submission processes ///////////////////////////
function saveLastSubmission(key, obj) {
    lastSubmission[key] = obj;
    updateLocalStorage();
}
function displayLastSubmission(key) {
    var obj = lastSubmission[key];
    var objKeys = Object.keys(obj);
    objKeys.forEach(KEY => {
        const input = document.getElementById(KEY);
        // if (KEY == 'thanhtien') input.placeholder = obj[KEY]; //To update thanhtien's value properly
        if (input) {
            if (KEY == 'thanhtien' || KEY == 'dongia') input.value = numeral(obj[KEY]).format('0,0.0000')
            else if (KEY == 'quantity') input.value = numeral(obj[KEY]).format('0,0')
            else input.value = obj[KEY]; //Paste value 
        }
    })
}