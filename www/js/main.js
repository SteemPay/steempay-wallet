/*jslint browser: true*/
/*global SecureLS, $, console, steem, jQuery, document, localStorage, window*/
let ls = new SecureLS({
  encodingType: 'aes'
});

$(document).ready(function() {
  //navigation
  $("#send_button").click(function() {
    $('html,body').animate({
      scrollTop: 0
    }, 'slow');
    pageTransition(-20);
  });
  $("#header_send").click(function() {
    $('html,body').animate({
      scrollTop: 0
    }, 'slow');
    pageTransition(-20);
  });
  $("#back").click(function() {
    pageTransition(7);
  });
  $("#sign_out").click(function() {
    localStorage.clear();
    ls.clear();
    window.location.href = "login.html";
  });
});

//change header on scroll to show balance
$(window).on("scroll", function() {
  if ($(this).scrollTop() >= vw(21)) {
    $("#header-title").css("margin-left", "33vw"); //5vw
    $("#sign_out").fadeOut(500);
    $("#header_balance").fadeIn("slow");
  } else {
    $("#header-title").css("margin-left", "42vw");
    $("#header_balance").fadeOut("fast");
    $("#sign_out").fadeIn("slow");
  }

  if ($(this).scrollTop() >= vw(42)) {
    $("#header_send").fadeIn(500);
  } else {
    $("#header_send").fadeOut("fast");
  }
});

let vm = new Vue({
  el: '#app',
  data: {
    api: 'https://som.cyphersoft.io/',
    loading: false,
    status: 'loading...',
    errorMsg: 'error',
    showUSD: false,
    showErr: false,
    showAll: false,
    showStatus: 'show all',
    showDetails: false,
    user: '',
    avatar: 'img/default-user.png',
    location: '',
    sbd_balance: '0.000',
    sbd_usd: '0.000',
    steem_usd: '0.000',
    steem_balance: '0.000',
    history: [],
    currency: 'SBD',
    to: '',
    amount: '',
    memo: '',
    details: {
      from: '',
      to: '',
      amount: '',
      memo: '',
      tx_id: '',
      tx_href: '',
      date: ''
    }
  },
  methods: {
    validateUser: function(user) {
      if (user === '') {
        return false;
      }
      return new Promise(resolve => {
        this.$http.get(`${this.api}${user}`).then(function(response) {
          resolve(response.body.unknown_user !== user);
        });
      });
    },

    error: function(type, error) {
      if (type === 'transfer') {
        this.errorMsg = error
        this.showErr = true;
        this.loading = false;
      }
    },

    isLoggedIn: function() {
      this.status = 'authenticating...';
      if (localStorage.getItem('logged_in') !== "1") {
        window.location.href = "login.html";
      }
    },

    getUser: function(user) {
      this.loading = true;
      this.status = 'getting user info...'
      try {
        this.$http.get(`${this.api}${user}`).then(function(response) {
          this.avatar = response.body.avatar;
          this.location = response.body.location;
          this.sbd_balance = parseFloat(response.body.balance_sbd);
          this.steem_balance = parseFloat(response.body.balance_steem);
          this.loading = false;
        });
      } catch (error) {
        console.log(error);
        this.status = error;
      }
    },

    getUSD: function(user) {
      try {
        this.$http.get(`${this.api}${user}/value/`).then(function(response) {
          this.sbd_usd = response.body['steem-dollars'].price_usd.toFixed(2);
          this.steem_usd = response.body.steem.price_usd.toFixed(2);
          console.log(response);
        });
      } catch (error) {
        console.log(error);
        this.status = error;
      }
    },

    getHistory: function(user) {
      try {
        this.$http.get(`${this.api}${user}/history`).then(function(response) {
          this.history = response.body;
        });
      } catch (error) {
        console.log(error);
        this.status = error;
      }
    },

    swapCurrency: function() {
      if (this.currency === 'SBD') {
        this.currency = 'STEEM';
      } else {
        this.currency = 'SBD';
      }
    },

    swapUSD: function() {
      this.showUSD = true;
      setTimeout(function(){
        vm.$data.showUSD = false;
      }, 3000);
    },

    toggleHistory: function() {
      this.showAll = !this.showAll;
      this.showAll === true ? this.showStatus = 'show less' : this.showStatus = 'show all';
    },

    historyDetails: function(item) {
      this.details.from = item.from;
      this.details.to = item.to;
      this.details.amount = item.amount;
      item.memo === '' ? this.details.memo = 'no memo' : this.details.memo = item.memo;
      this.details.tx_id = item.trx_id;
      this.details.tx_href = `https://steemd.com/tx/${item.trx_id}`;
      this.details.date = item.timestamp.replace(/T/g, ' ');
      this.showDetails = true;
    },

    transfer: async function(currency) {
      let ls = new SecureLS({
        encodingType: 'aes'
      });
      let wif = ls.get('key');
      let exists = await this.validateUser(this.to);
      let balance = this.currency === 'SBD' ? this.sbd_balance : this.steem_balance;

      this.status = "sending...";
      this.loading = true;
      //api call to check if valid
      isValid = steem.utils.validateAccountName(this.to.toLowerCase());
      if (isValid === null) {
        //hide error if showing
        this.showErr = false;
        //check if user exists, else show error
        if (exists) {
          //check that balance is enough
          if ((parseFloat(this.amount, 10) <= parseFloat(balance, 10)) && (parseFloat(this.amount, 10) >= 0.001)) {
            //initiate transfer
            steem.broadcast.transfer(wif, this.user, this.to.toLowerCase(), `0${this.amount} ${this.currency}`, this.memo, function(err, result) {
              console.log(err, result);
              vm.$data.loading = false;
              //update balance
              vm.$data.currency === 'SBD' ?
                vm.$data.sbd_balance = (parseFloat(vm.$data.sbd_balance, 10) - parseFloat(vm.$data.amount, 10)).toFixed(3) :
                vm.$data.steem_balance = (parseFloat(vm.$data.steem_balance, 10) - parseFloat(vm.$data.amount, 10)).toFixed(3);
              //add history item
              vm.$data.history.unshift({
                'from': vm.$data.user,
                'to': vm.$data.to,
                'amount': `${parseFloat(vm.$data.amount, 10)} ${vm.$data.currency}`,
                'memo': vm.$data.memo
              })
              //clear form and go back to home
              vm.$data.to = '';
              vm.$data.amount = '';
              vm.$data.memo = '';
              //transition back home
              pageTransition(7);
            });
          } else {
            //not enough balance or not sending the minimum amount
            this.error('transfer', 'insufficient funds or not sending minimum (.001)');
          }
        } else {
          //user does not exist
          this.error('transfer', 'user does not exist');
        }
      } else {
        //name is invalid format
        this.error('transfer', isValid.toLowerCase());
      }
    }
  },
  created: function() {
    this.isLoggedIn();
    this.user = localStorage.getItem("user");
    this.getUser(this.user);
    this.getHistory(this.user);
    this.getUSD(this.user);
  }
});
