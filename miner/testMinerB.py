import web3,json
import binascii
from web3 import Web3
import requests,json, time,random
import pandas as pd
import hashlib
from Naked.toolshed.shell import execute_js, muterun_js, run_js
contract_address = "";
node_url ="http://localhost:8545" #https://rinkeby.infura.io/
net_id = 60 #eth network ID
last_block = 0

#C:\Users\themandalore\.windows-build-tools\python27\

public_keys = ["0xe037ec8ec9ec423826750853899394de7f024fee","0xcdd8fa31af8475574b8909f135d510579a8087d3","0xb9dd5afd86547df817da2d0fb89334a6f8edd891","0x230570cd052f40e14c14a81038c6f3aa685d712b","0x3233afa02644ccd048587f8ba6e99b3c00a34dcc"]
private_keys = ["4bdc16637633fa4b4854670fbb83fa254756798009f52a1d3add27fb5f5a8e16","d32132133e03be292495035cf32e0e2ce0227728ff7ec4ef5d47ec95097ceeed","d13dc98a245bd29193d5b41203a1d3a4ae564257d60e00d6f68d120ef6b796c5","4beaa6653cdcacc36e3c400ce286f2aefd59e2642c2f7f29804708a434dd7dbe","78c1c7e40057ea22a36a0185380ce04ba4f333919d1c5e2effaf0ae8d6431f14"]

def generate_random_number():
    return random.randint(1000000,9999999)

def mine(challenge, public_address, difficulty):
	global last_block, contract_address
	x = 0;
	print('starting to mine')
	while True:
		x += 1;
		j = generate_random_number()
		nonce = Web3.toHex(str.encode(str(j)))
		_string = str(challenge).strip() + public_address[2:].strip() + str(nonce)[2:].strip()
		v = Web3.toHex(Web3.sha3(hexstr=_string));
		z= hashlib.new('ripemd160',bytes.fromhex(v[2:])).hexdigest()
		n = "0x" + hashlib.new('sha256',bytes.fromhex(z)).hexdigest()
		hash1 = int(n,16);
		if hash1 % difficulty == 0:
			print('solution found')
			return j;
		if x % 10000 == 0:
			payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_blockNumber"}
			r = requests.post(node_url, data=json.dumps(payload));
			d = jsonParser(r);
			_block = int(d['result'],16)
			if(last_block != _block):
				_challenge,_apiId,_difficulty,_apiString,_granularity = getVariables();
				if challenge != _challenge:
					return 0;

def getAPIvalue(_api):
	_api = _api.replace("'", "")
	json = _api.split('(')[0]
	if('json' in json):
		_api = _api.split('(')[1]
		filter = _api.split(').')[1]
	_api = _api.split(')')[0]
	print('Getting : ',_api)
	try:
		response = requests.request("GET", _api)
	except:
		response = 0;
		print('API ERROR',_api)
	if('json' in json):
		if(len(filter)):
			price =response.json()[filter]
		else:
			price = response.json()
	else:
		price = response
	print(price)
	return int(float(price))

# def getAPIvalue():
# 	url = "https://api.gdax.com/products/BTC-USD/ticker"
# 	response = requests.request("GET", url)
# 	price =response.json()['price']
# 	return int(float(price))

def masterMiner():
	miners_started = 0
	challenge,apiId,difficulty,apiString,granularity = getVariables();
	while True:
		nonce = mine(str(challenge),public_keys[miners_started],difficulty);
		if(nonce > 0):
			#value = max(0,(5000- miners_started*10) * granularity);
			value = max(0,(getAPIvalue(apiString) - miners_started*10) * granularity); #account 2 should always be winner
			arg_string =""+ str(nonce) + " "+ str(apiId) +" " + str(value)+" "+str(contract_address)+" "+str(public_keys[miners_started])+" "+str(private_keys[miners_started])
			print('Arg String', arg_string)
			#success = execute_js('testSubmitter.js',arg_string)
			#print('WE WERE SUCCESSFUL: ', success)
			run_js('testSubmitter.js',arg_string);
			miners_started += 1 
			if(miners_started == 5):
				v = False;
				while(v == False):
					time.sleep(2);
					_challenge,_apiId,_difficulty,_apiString,_granularity= getVariables();
					if challenge == _challenge:
						v = False
						time.sleep(10);
					elif _apiId > 0:
						v = True
						challenge = _challenge;
						apiId = _apiId;
						difficulty = _difficulty;
						apiString = _apiString;
						granularity = _granularity;
				miners_started = 0;
		else:
			challenge,apiId,difficulty,apiString = getVariables(); 
			print('variables grabbed')
	print('Miner Stopping')

def getVariables():
	getAddress();
	payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_call","params":[{"to":contract_address,"data":"0xa22e407a"}, "latest"]}
	tries = 1;
	while tries < 5:
		try:
			r = requests.post(node_url, data=json.dumps(payload));
			val = jsonParser(r);
			val = val['result'];
			_challenge = val[:66]
			val = val[66:]
			_apiId = int(val[:64],16)
			val = val[64:]
			_difficulty = int(val[:64],16);
			val =val[64:]
			val =val[64:]
			_granularity = int(val[:64],16);
			val =val[64:]
			val =val[64:]
			val = val[:-16]
			_apiString =  str(binascii.unhexlify(val.strip()))
			print('String',_challenge,_apiId,_difficulty,_apiString,_granularity)
			return _challenge,_apiId,_difficulty,_apiString,_granularity
		except:
			tries += 1
			print('Oh no...not working')
	return 0,0,0,0,0

def jsonParser(_info):
	my_json = _info.content
	data = json.loads(my_json)
	s = json.dumps(data, indent=4, sort_keys=True)
	return json.loads(s)

def getAddress():
	global last_block, contract_address
	payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_blockNumber"}
	r = requests.post(node_url, data=json.dumps(payload));
	e = jsonParser(r);
	block = int(e['result'],16)
	while(block > last_block):
		print('block',block);
		try:
			payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_getTransactionByBlockNumberAndIndex","params":[hex(block),0]}
			r = requests.post(node_url, data=json.dumps(payload));
			d = jsonParser(r);
			tx = d['result']
			payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_getTransactionReceipt","params":[tx['hash']]}
			r = requests.post(node_url, data=json.dumps(payload));
			d = jsonParser(r);
			tx = d['result']
			_contract_address =tx['contractAddress']
			if len(_contract_address)>0 and tx['logs'][6]['topics'][0] == '0xc2d1449eb0b6547aa426e09d9942a77fa4fc8cd3296305b3163e22452e0bcb8d':
				last_block = int(e['result'],16) 
				block = 0;
				contract_address = _contract_address
				print('New Contract Address',_contract_address)
				return True;
		except:
			pass
		block = block - 1;
	last_block = int(e['result'],16)
	return False;

#getVariables()
masterMiner();
#getAddress();
#getAPIvalue('json(https://api.gdax.com/products/BTC-USD/ticker).price')
