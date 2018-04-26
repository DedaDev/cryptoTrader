var clear = require('clear');
var request = require('request');
let ponude = []

async function main() {
	ponude = []
	let sajtovi = [await tradesatoshi(), await coinexchange(), await cryptopia()]
	for(pogonski in sajtovi){
		for(market in sajtovi[pogonski]){
			for(gonjeni in sajtovi){
				if(gonjeni != pogonski && sajtovi[gonjeni].hasOwnProperty(market)){
					let market1 = sajtovi[pogonski][market]
					let market2 = sajtovi[gonjeni][market] //odavde kreni kad budeš editovao sl put
					if(market1.ask < market2.bid && samecoin(market1.site,market2.site,market) && market1.ask != 0){
						let procenat = Math.round((100*market2.bid)/market1.ask-100)
						if(procenat > 5){
							ponude.push({'procenat' : procenat, 'text' : market + " " + market1.site + " " + market1.ask + " " + market2.site + " " + market2.bid + " " + procenat + "%"})
						}
					}
				}				
			}
		}
	}
	let prikaz = ""
	ponude.sort(function(a, b){return b.procenat-a.procenat});
	for(len in ponude){
		prikaz += ponude[len].text + '\n'
	}
	//console.log(market, market1.site, market1.ask, market2.site, market2.bid, procenat)
	clear();
	console.log(prikaz)
	main()
}

function tradesatoshi(){
	return new Promise(function(resolve,reject){
		request('https://tradesatoshi.com/api/public/getmarketsummaries', function (error, res, body) {
	     	if (!error && res.statusCode == 200) {
		      	let parsedbody = JSON.parse(body);
		      	let returnobj = {};
		      	for(i=0;i<parsedbody.result.length;i++){
		      		returnobj[parsedbody.result[i].market.replace('_','/')] = {'ask': parsedbody.result[i].ask,'bid': parsedbody.result[i].bid, site : "tradesatoshi"}
		      	}
	        	resolve(returnobj);
	        } else {
	        	reject(error);
	        }				
		});
	}).catch((error) => {
	  	console.log('tradesatoshi: ' + error);
	});
}
function coinexchange(){
	return new Promise(function(resolve,reject){
		request('https://www.coinexchange.io/api/v1/getmarkets', function (error, res, body) {
	     	if (!error && res.statusCode == 200) {
		      	let parsedbody = JSON.parse(body);
		      	let returnobj = {};
		      	for(i=0;i<parsedbody.result.length;i++){
		      		if(parsedbody.result[i].Active = true){
		      			returnobj[parsedbody.result[i].MarketID] = parsedbody.result[i].MarketAssetCode + "/" + parsedbody.result[i].BaseCurrencyCode
		      		}
		      	}
	        	resolve(returnobj);
	        } else {
	        	reject(error);
	        }				
		});
	}).then(function(idobj){
		return new Promise(function(resolve,reject){
			request('https://www.coinexchange.io/api/v1/getmarketsummaries', function (error, res, body) {
		     	if (!error && res.statusCode == 200) {
			      	let parsedbody = JSON.parse(body);
			      	let returnobj = {};
			      	for(i=0;i<parsedbody.result.length;i++){
			      		if(parsedbody.result[i].MarketID in idobj){
			      			parsedbody.result[i].name = idobj[parsedbody.result[i].MarketID]
			      			returnobj[parsedbody.result[i].name] = {'ask': parsedbody.result[i].AskPrice,'bid': parsedbody.result[i].BidPrice, site : "coinexchange"}
			      		}
			      	}
		        	resolve(returnobj);
		        } else {
		        	reject(error);
		        }				
			});
		}).catch((error) => {
	  		console.log('coinexchange: ' + error);
		});
	});
}
function cryptopia(){
	return new Promise(function(resolve,reject){
		request('https://www.cryptopia.co.nz/api/GetMarkets', function (error, res, body) {
	     	if (!error && res.statusCode == 200) {
		      	let parsedbody = JSON.parse(body);
		      	let returnobj = {};
		      	for(i=0;i<parsedbody.Data.length;i++){
		      		if(parsedbody.Data[i].Label.split("/")[1] == "BTC"){
		      			returnobj[parsedbody.Data[i].Label] = {'ask': parsedbody.Data[i].AskPrice,'bid': parsedbody.Data[i].BidPrice, site : "cryptopia"}
		      		}
		      	}
	        	resolve(returnobj);
	        } else {
	        	reject(error);
	        }			
		});
	}).catch((error) => {
	  console.log('cryptopia: ' + error);
	});
}
function bittrex(){ //neko lepše vreme kad bude
	return new Promise(function(resolve,reject){
		request('https://bittrex.com/api/v1.1/public/getmarketsummaries', function (error, res, body) {
	     	if (!error && res.statusCode == 200) {
		      	let parsedbody = JSON.parse(body);
		      	let returnobj = {};
		      	for(i=0;i<parsedbody.result.length;i++){
		      		let mkholder = parsedbody.result[i].MarketName.split('-')
		      		let marketname = mkholder[1] + "/" + mkholder[0]
		      		returnobj[marketname] = {'ask': parsedbody.result[i].Ask,'bid': parsedbody.result[i].Bid, site: "bittrex"}
		      	}
	        	resolve(returnobj);
	        } else {
	        	reject(error);
	        }				
		});
	});
}
function hitbtc(){
	return new Promise(function(resolve,reject){
		request('https://api.hitbtc.com/api/2/public/ticker', function (error, res, body) {
	     	if (!error && res.statusCode == 200) {
		      	let parsedbody = JSON.parse(body);
		      	let returnobj = {};
		      	for(i=0;i<parsedbody.result.length;i++){
		      		let mkholder = parsedbody.result[i].MarketName.split('-')
		      		let marketname = mkholder[1] + "/" + mkholder[0]
		      		returnobj[marketname] = {'ask': parsedbody.result[i].Ask,'bid': parsedbody.result[i].Bid, site: "hitbtc"}
		      	}
	        	resolve(returnobj);
	        } else {
	        	reject(error);
	        }				
		});
	});
}
function samecoin(sajt1,sajt2,market){ //proverava da li je isti coin na oba marketa
	let coin = market.split('/')[0]
	let maintenance = {
		"tradesatoshi" : ['VCC','DOT','XVG','BTCS','CLAM'],
		"cryptopia" : ['CRAVE','XGOX'],
		"coinexchange" : ['420G','MOJO','XZC','MBC','ZEIT','KAYI']
	}
	let notsame = {
		"tradesatoshi-coinexchange" : ['AI','ACC'],
		"tradesatoshi-cryptopia" : ['LUX','ACC','BTG','BTM'], // bwk
		"coinexchange-cryptopia" : ['BON','GDC','MARS','ETN','LDC']
	}
	if(sajt1 in maintenance && maintenance[sajt1].includes(coin)){
		return false
	}else if(sajt2 in maintenance && maintenance[sajt2].includes(coin)){
		return false
	}else if(sajt1 + "-" + sajt2 in notsame && notsame[sajt1 + "-" + sajt2].includes(coin)){
		return false
	}else if(sajt2 + "-" + sajt1 in notsame && notsame[sajt2 + "-" + sajt1].includes(coin)){
		return false
	}else{
		return true
	}
}
main()
