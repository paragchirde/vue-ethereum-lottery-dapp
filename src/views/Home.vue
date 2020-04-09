<template>
  <div class="home">
    <div class="jumbotron text-center">
      <img alt="Vue logo" src="../assets/logo.png">
      <p>This Contract is managed by <code>{{ manager }}</code></p>
      <b-button variant="primary" size="sm" class="mt-2 mb-2 text-white" to="/lottery">Try Now</b-button> 
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import lottery from '../lottery'
export default {
  name: 'Home',
  components: {
  },
  data(){
    return {
      manager: ''
    }
  },
  async created(){
    const manager = await lottery.methods.manager().call()
    this.manager = manager
  }
}
</script>
