<template>
    <div>
        <div class="jumbotron">
        <b-container class="">
          <b-row>
            <b-col md="3">
               <b-form>
                 <h4>Want to try your luck?</h4>
                 <p>Give it a shot!</p>
                <label for="text-password">Enter the amount</label>
                <b-input type="number" id="amount" aria-describedby="amount" v-model="amount" placeholder="Enter the value in ether"></b-input>
                <span class="text-muted"><small><i>Amount >= 0.01 ether</i></small></span>
                <div class="d-flex justify-content-end flex-column">
                  <b-button variant="primary" size="sm" class="mt-2 mb-2 text-white" @click.prevent="bet()" :disabled="userAccount==manager">Bet the Amount <b-spinner label="Loading..." small v-show="loading==true"></b-spinner></b-button> 
                  <b-badge variant="danger" v-if="userAccount==manager"><small>Manager Account & User Account cannot be same</small></b-badge>
                </div>
              </b-form>
              <hr>
              <b-form class="mt-4">
                 <b-button block variant="success" @click.prevent="getWinner()" :disabled="userAccount!=manager && players.length==0">Pick a Winner <b-spinner label="Loading..." small v-show="loading2==true"></b-spinner></b-button> 
              </b-form>
            </b-col>
            <b-col cols="6" md="5">
              <h4>Lottery pool</h4>
              <p>Total Amount in the pool: ETH <b-badge  variant="success">{{balance}}</b-badge></p>
              <b-alert variant="primary" show><small><b-icon icon="star-fill" variant="warning"></b-icon> Previous Winner <br>
              <b-avatar :src="`https://api.adorable.io/avatars/250/${lastWinner}`"></b-avatar>
              {{ lastWinner }}</small> </b-alert>
              <h6>Players</h6>
              <p>There are currently {{players.length}} players competing to win {{ balance }} ETH </p>
              <b-list-group>
                <b-list-group-item class="d-flex justify-content-between align-items-center" v-for="(player, index) in players" :key="index">
                  <b-avatar :src="`https://api.adorable.io/avatars/250/${player}`"></b-avatar>
                  <small>{{player}}</small>
                </b-list-group-item>
              </b-list-group>
            </b-col>
            <b-col cols="6" md="4">Contract Details
              <b-card>
                <p>Your Current balance is <br>ETH: <b-badge  variant="success">{{userBalance}}</b-badge> </p>
                <p>Your Account Address is: 
                    <b-alert :variant="userAccount!=manager ? 'success' : 'danger' " show>{{ userAccount }}
                      <br><b-badge variant="danger" v-if="userAccount==manager"><small>Manager Account & User Account cannot be same</small></b-badge>
                    </b-alert>
                </p>
                <hr>  
                <p>This Contract is managed by 
                  <b-alert variant="primary" show><small> {{ manager }}</small> </b-alert>
                </p>
              </b-card>
            </b-col>
          </b-row>
        </b-container>
        </div>
    </div>
</template>
<script>
import lottery from '../lottery'
import web3 from '../web3'
export default {
  name: 'Home',
  components: {
  },
  data(){
    return {
      manager: '',
      userBalance: '',
      userAccount: '',
      balance: '',
      players: [],
      amount: '',
      lastWinner: '',
      error: false,
      loading: false,
      loading2: false
    }
  },
  async created(){
    this.getLastWinner()
    //Contract Manager
    const manager = await lottery.methods.manager().call()
    this.manager = manager
    
    //Players
    this.getPlayers()

    //Contract Balance
    // web3.eth.getBalance(lottery.options.address).then(bal => {
    //     this.balance = web3.utils.fromWei(bal, 'ether')
    // })
    this.getContractBalance()
    //User Account
    const accounts = await web3.eth.getAccounts()
    this.userAccount = accounts[0]
    console.log(this.userAccount)

    //User Balance
    const cbal = await web3.eth.getBalance(this.userAccount)
    this.userBalance = web3.utils.fromWei(cbal, 'ether')
    console.log(this.userBalance)
  },
  watch:{
    userAccount: function(oldVal, newVal){
      window.ethereum.on('accountsChanged', () => {
        //change the account address
        web3.eth.getAccounts().then(acc => {
          this.userAccount = acc[0]
          console.log('[ACCOUNT CHANGED]', this.userAccount)
          //change the account balance
          web3.eth.getBalance(this.userAccount).then(bal => {
            this.userBalance = web3.utils.fromWei(bal, 'ether')
            console.log('[Balance CHANGED]', this.userBalance)
          })
          this.$toast('Account Changed', {
                  timeout: 1000,
                  type: 'success'
          });
        })
      })
    },
  },
  methods:{
    async bet(){
      this.loading = true
      if(this.players.includes(this.userAccount)){
        console.log('Account Present')
       this.$toast('Already placed a bet!', {
                 timeout: 1000,
                 type: 'warning'
        });
        this.amount = ''
      } else {
        console.log('ok to go')
        await lottery.methods.enter().send({
          from: this.userAccount,
          value: web3.utils.toWei(this.amount, 'ether')
        });
        await this.getContractBalance()
        await this.getPlayers()
        this.$toast('Successfully placed the bet', {
                 timeout: 1000,
                 type: 'success'
        });
        console.log('Done')
      }
      this.loading = false
    },
    getContractBalance(){
      web3.eth.getBalance(lottery.options.address).then(bal => {
          return this.balance = web3.utils.fromWei(bal, 'ether')
      })
    },
    getPlayers(){
      lottery.methods.getPlayers().call().then(p => {
        this.players = p
        console.log(this.players)
      })
      return this.players
    },
    getLastWinner(){
      lottery.methods.lastWinner().call().then(l => {
        this.lastWinner = l
        console.log(this.lastWinner)
      })
    },
    async getWinner(){
      this.loading2 = true
      await lottery.methods.pickWinner().send({
        from: this.userAccount
      })
      this.$toast('Voila! We have a winner', {
                  timeout: 2000,
                  type: 'success'
      });
      this.loading2 = false
      this.getLastWinner()
      await this.getContractBalance()
      await this.getPlayers()
    },
  }
}
</script>