var reviews = JSON.parse(localStorage.getItem('reviews')); //Get localStorage objects' values

function updateLocalStorage() {
    localStorage.reviews = JSON.stringify(reviews);
}

function addReview(key) {
    var obj = prepareObj();

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