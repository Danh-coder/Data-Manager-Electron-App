var reviews = JSON.parse(localStorage.getItem('reviews'));
var submissionCount = localStorage.getItem('submissionCount');

function updateLocalStorage() {
    localStorage.reviews = JSON.stringify(reviews);
    localStorage.submissionCount = submissionCount;
}

function addReview(type) {
    var obj = prepareObj();

    reviews[type].push(obj);
    updateLocalStorage();
    location.reload(); //Reload page
}

function removeReview(type, index) {
    reviews[type].splice(index, 1); //Remove it from the array
    updateLocalStorage();
}