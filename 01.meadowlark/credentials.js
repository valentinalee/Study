module.exports = {
    cookieSecret: '34f8600ea2e61f938d2d4512e14dc9665580e8fc', //把你的cookie 秘钥放在这里
    gmail:{user:'',password:''},
    mongo:{development:{connectionString:'mongodb://localhost/meadowlark'},production:{connectionString:'mongodb://localhost/meadowlark'}},
    WeatherUnderground:{ApiKey:''},
    authProviders:{
    	facebook:{development:{appId:'aaa',appSecret:'aaa'},production:{appId:'aaaa',appSecret:'aaa'}},
    	google:{development:{clientID:'aaa',clientSecret:'aaa'},production:{clientID:'aaaa',clientSecret:'aaa'}}
	}
};