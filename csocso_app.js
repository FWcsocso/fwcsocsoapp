const base = axios.create({
    baseURL: 'https://csocso.online/api/'
});

Vue.prototype.$http=base;

new Vue({
    el:"#app",
    data () {
       return {
           error:null,
           loading: false,
           loggedin:false,
           username: null,
           password: null,
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
        let token=window.localStorage.getItem("userToken");
        let tokenExpiration=window.localStorage.getItem("userTokenExpiration");

        console.log(this.loggedin);
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
                    this.error = true
                })
                .finally(() => this.loading = false)
        },
        /*játékosok lekérése */
        loadAll(){
            let headers = {"Authorization":  "Bearer " + this.token};
            this.$http
                .get('players',{headers:headers})
                .then(response => {
                    /*response*/
                    /*a visszakapott JSON objektum ami egy tömb*/
                    /*view-ba v-for-ral feldolgozni*/
                    this.players=response.data;
                    this.playersShow=true;
                    this.playersHide=false;
                });

        }
    }
});
