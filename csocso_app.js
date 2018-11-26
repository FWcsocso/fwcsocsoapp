var x = new Date(1538397843).toDateString();

console.log(x);

let pusher = new Pusher('4ad6eb1f6c5815e676c4', {
    cluster: 'eu',
    encrypted: true,
   /* app_id: '546789'*/
});

let channel = pusher.subscribe('csocso');

channel.bind('game.updated', function (data) {
    
});

channel.bind('game.ended', function (data) {
    
});

channel.bind('game.started', function (data) {
    
});


const base = axios.create({
    baseURL: 'https://csocso.online/api/'
});

Vue.prototype.$http=base;

new Vue({    
    el:"#app",
    data () {
       return {
           showLoginModal: false,
           loginError: false,
           loading: true,
           loggedin:false,
           username: null,
           password: null,
           newPlayerName:null,
           modifiedPlayerName:null,
           waitForNewPlayer: false,
           playerError: false,
           token: null,
           id: null,
           name: null,
           data: null,
           playersShow: false,
           playersHide: true,
           gamesShow: false,
           gamesHide: true,
           showCurrentGame: true,
           hideCurrentGame: false,           
           players: [],
           games: [],
           playersInGame: []
       }
    },
    created () {        
        this.loading=false;

        let token=window.localStorage.getItem("userToken");
        let tokenExpiration=window.localStorage.getItem("userTokenExpiration");

        if (token!=null) {
            this.loggedin=true;
            this.token=token;            
        }
    },
    methods: {
        /*kijelentkezés*/
        logout () {
            window.localStorage.removeItem("userToken");
            window.localStorage.removeItem("userTokenExpiration");

            this.token=null;
            this.loggedin=false;
            this.players=null;
            this.playersHide=true;
            this.playersShow=false;
        },
        /*bejelentkezés*/
        login () {
            this.$http
                .post('auth',{
                    "username":this.username,
                    "password": this.password
                })
                .then(response => {
                    window.localStorage.setItem("userToken",response.data.token);
                    window.localStorage.setItem("userTokenExpiration",response.data.token_expiration);

                    let token=window.localStorage.getItem("userToken");
                    this.token=token;
                    this.loggedin=true;        
                })
                .catch(error => {
                    this.loginError=true;
                });

        },
        /*játékosok lekérése */
        loadAll(){        
            $(".menu").removeClass("menu-show");
            $(".menu-icon-wrapper").removeClass("menu-icon-wrapper-active");
            $(".menu").addClass("menu-hide");

            let headers = {"Authorization":  "Bearer " + this.token};
                
            this.$http
                .get('players',{headers:headers})
                .then(response => {                    
                    /*response*/
                    /*a visszakapott JSON objektum ami egy tömb*/
                    /*view-ba v-for-ral feldolgozni*/
                    response.data.forEach(function (player) {                        
                        Vue.set(player,"edit",false);                        
                    });
                    this.players=response.data;                
                    this.playersShow=true;
                    this.playersHide=false;
                    this.gamesShow=false;
                    this.gamesHide=true;
                    this.showCurrentGame=false;
                    this.hideCurrentGame=true;
                });

        },
        newPlayer() {
            let headers = {"Authorization":  "Bearer " + this.token, "ContentType": "application/json"};
            let data = {"name": this.newPlayerName};

            if (this.newPlayerName==null) {
                this.playerError=true;
            } else {
                this.waitForNewPlayer=true;

                this.$http
                    .post('players',data,{headers:headers})
                    .then(response => {
                        //új játékos berakása
                        //a players tömbbe
                        this.players.push(response.data);
                        this.waitForNewPlayer=false;
                        this.newPlayerName="";
                    })
                    .catch(error => {
                        this.waitForNewPlayer=false;
                    });
            }
        },
        deletePlayer (playerID) {        
            let headers = {"Authorization":  "Bearer " + this.token};
            let deleteUrl = "players/"+playerID;
            this.$http
                .delete(deleteUrl,{headers:headers})
                .then(response => {
                    this.loadAll();
                });
        },
        modifyPlayer (playerID) {
            let tempName=null;

            this.players.find(function (element){
                if (element.id==playerID) {
                    element.edit=true;                    
                    tempName=element.name;                                        
                } else {
                    element.edit=false;
                }
            });

            this.modifiedPlayerName=tempName;
        }, 
        savePlayer (playerID) {
            this.players.find(function (element){
                if (element.id==playerID) {
                    element.edit=false;
                }
            });

            let modifyUrl="players/"+playerID;

            let headers = {"Authorization":  "Bearer " + this.token, "ContentType": "application/json"};
            let data = {"name": this.modifiedPlayerName};        

            this.$http
                .put(modifyUrl,data,{headers:headers})
                .then(response => {
                    this.loadAll();
                    this.modifiedPlayerName=null;
                });
        },

        /*utolsó 50 játék megjelenítése*/
        loadGames () {
            $(".menu").removeClass("menu-show");
            $(".menu-icon-wrapper").removeClass("menu-icon-wrapper-active");
            $(".menu").addClass("menu-hide");

            let loadUrl="game/latest";
            let headers = {"Authorization":  "Bearer " + this.token, "ContentType": "application/json"};        

            this.$http
                .get(loadUrl,{headers:headers})
                .then(response=> {                
                    this.games=response.data;

                    response.data.forEach(function (games) {                                            
                        if (games.left.players===null) games.left.players="-";                            
                        if (games.right.players===null) games.right.players="-";                        

                        const date = new Date(games.saved_at).toDateString();

                        /*let year = d.getFullYear();
                        let month=d.getMonth();
                        let day=d.getDate();

                        if (month<10) month="0"+month;                        
                        if (day<10) day="0"+day;

                        let myOwnDate=year+"."+month+"."+day+".";

                        games.saved_at=myOwnDate;*/
                    });

                    this.playersInGame=response.data;                     

                    this.gamesShow=true;
                    this.gamesHide=false;   
                    this.playersShow=false;
                    this.playersHide=true;     
                    this.showCurrentGame=false;
                    this.hideCurrentGame=true;          
                });
        },
        /*loadGame (gameId) {
            let loadUrl="game/"+gameId;
            let headers = {"Authorization":  "Bearer " + this.token, "ContentType": "application/json"};

            this.$http
                .get(loadUrl,{headers:headers})
                .then(response=> {                    
                    console.log(response.data);
                });
        },*/
        /*"főképernyő", jelenlegi mérkőzés*/
        currentGame() {            
            $(".menu").removeClass("menu-show");
            $(".menu-icon-wrapper").removeClass("menu-icon-wrapper-active");
            $(".menu").addClass("menu-hide");

            this.gamesShow=false;
            this.gamesHide=true;   
            this.playersShow=false;
            this.playersHide=true;
            this.showCurrentGame=true;
            this.hideCurrentGame=false;            
        },
        hidePlayerAlert() {
            this.playerError=false;
        }
    }
});
