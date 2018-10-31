const base = axios.create({
    baseURL: 'https://csocso.online/api/'
});

Vue.prototype.$http=base;

new Vue({
    el:"#app",
    data () {
       return {
           loginError: false,
           loading: true,
           loggedin:false,
           username: null,
           password: null,
           newPlayerName:null,
           waitForNewPlayer: false,
           playerError: false,
           token: null,
           id: null,
           name: null,
           data: null,
           playersShow: false,
           playersHide: true,
           players: []
       }
    },
    created () {
        this.loading=false;

        let token=window.localStorage.getItem("userToken");
        let tokenExpiration=window.localStorage.getItem("userTokenExpiration");

        if (token!="") {
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
                    this.players=response.data;
                    console.log(this.players);
                    this.playersShow=true;
                    this.playersHide=false;
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
                        this.newPlayer="";
                    })
                    .catch(error => {
                        this.waitForNewPlayer=false;
                    });
            }
        },
        deletePlayer (playerID) {
            let headers = {"Authorization":  "Bearer " + this.token};

            this.$http
                .delete("players/".playerID,{headers:headers})
                .then(response => {
                    this.loadAll();
                });
        },
        hidePlayerAlert() {
            this.playerError=false;
        }
    }
});
