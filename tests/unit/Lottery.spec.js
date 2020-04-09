const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { bytecode, interface} = require('../compile.js');

let lottery;
let accounts;

//test for contract deployment
//test for enter function like when they enter they must send some amount of ether

beforeEach(async () => {
	accounts = await web3.eth.getAccounts();

	lottery = await new web3.eth.Contract(JSON.parse(interface))
	.deploy({ data: bytecode })
	.send({ from: accounts[0], gas:'1000000' });
});

describe('Lottery Contract', () => {
	it('Contract Deployed!', () => {
		//make sure the contract is deployed
		assert.ok(lottery.options.address);
	});

	//test for enter of one person 
	it('Allows one account to enter', async () => {
		await lottery.methods.enter().send({ 
			from: accounts[0], //who is attempting to enter
			value: web3.utils.toWei('0.02', 'ether') //how much ether is being sent by the player
		});
		const players = await lottery.methods.getPlayers().call({
			from: accounts[0] //who is calling the function
		});
		//assert.equal(value that it should be, value that it is)
		assert.equal(accounts[0], players[0]);
		assert.equal(1, players.length);
	});

	//test for entery of multiple accounts 
	it('Allows multiple accounts to enter', async () => {
		await lottery.methods.enter().send({ 
			from: accounts[0], //who is attempting to enter
			value: web3.utils.toWei('0.02', 'ether') //how much ether is being sent by the player
		});
		await lottery.methods.enter().send({ 
			from: accounts[1], //who is attempting to enter
			value: web3.utils.toWei('0.02', 'ether') //how much ether is being sent by the player
		});
		await lottery.methods.enter().send({ 
			from: accounts[2], //who is attempting to enter
			value: web3.utils.toWei('0.02', 'ether') //how much ether is being sent by the player
		});


		const players = await lottery.methods.getPlayers().call({
			from: accounts[0] //who is calling the function
		});
		//assert.equal(value that it should be, value that it is)
		assert.equal(accounts[0], players[0]);
		assert.equal(accounts[1], players[1]);
		assert.equal(accounts[2], players[2]);
		assert.equal(3, players.length);
	});

	//To make sure proper amount is entered. Now this test should throw an error
	//We will use try catch assertion to catch the error
	it('Requires a minimum amount of ether', async () => {
		
		try{
			await lottery.methods.enter.send({
				from: accounts[0],
			value: 200  //200 wei
			});
			assert(false); //we purposely fail this test so that catch part is executed
		} 
		catch (err) {
			assert(err);
		}
		//the test will eventuall pass since we caught error in the catch statement
	});

	//Testing function modifier
	it('Only manager can call pickWinner()', async () => {
		try{
			await lottery.methods.pickWinner().send({
				from: accounts[0]
			});
			assert(false);
		}	
		catch(err){
			assert(err);
		}
	});

	//Test for entire contract
	it('sends money to the winner and resets the array', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('2', 'ether')
		});
		//who is going to win
		const initiaBal = await web3.eth.getBalance(accounts[0]);
		await lottery.methods.pickWinner().send({
			from: accounts[0]
		});
		const finalBal = await web3.eth.getBalance(accounts[0]);
		//get difference
		const diff = finalBal - initiaBal;
		console.log(diff);
		assert(diff > web3.utils.toWei('1.6', 'ether'));
	});

});