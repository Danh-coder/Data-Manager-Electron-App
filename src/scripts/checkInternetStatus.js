var pressed = true;
window.onload = ()=>{
    function offline() {
        if (pressed) {
            pressed = false;

            const Dialogs = require('dialogs');
            const dialogs = Dialogs();
            dialogs.alert("You're offline. Please turn on wifi and try again", ok => {
                pressed = true;
            })
        }
    }
    function checkOnlineStatus() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://jsonplaceholder.typicode.com/posts", true);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) console.log('online');
            else offline();
        }
        xhr.onerror = () => offline();
        xhr.send();
    }    
    
    setInterval(()=>{ //this setInterval function call ajax frequently after 1000ms
        checkOnlineStatus();
    }, 1000); //1000ms 
}