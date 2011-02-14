/**
* @license
* Currently under the MIT license, as follows:

Copyright (C) 2011 by Steven Littiebrant

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/** 
I request (but do not require) that this comment block be included with any 
non-minified form of this code.  Or something similar.

--- Developer Info: 

PHP date formatting: http://php.net/manual/en/function.date.php
    
Users of this chunk of code are encouraged to contact me in some way to let 
me know it is in use, but are not required to do so.  Information for how to 
do so should be available at GitHub, under username "Groxx", project "PHPharse", 
currently located here: https://github.com/Groxx/PHPharse

--- Usage:
Date.PHParse(date string, format string); // => date instance
var d = new Date();
d.PHPhormat(format string); // => formatted date string
*/
(function(){
	if (!Date.PHParse){
		
		// -----------------------------------------------
		// Date-string parsing code
		// -----------------------------------------------
		
		Date.PHParse = (function(){ 
			// this piece of ugliness courtesy of
			// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
			if (!Array.prototype.indexOf)
			{
				Array.prototype.indexOf = function(searchElement /*, fromIndex */)
				{
					"use strict";
					if (this === void 0 || this === null)
						throw new TypeError();
					var t = Object(this);
					var len = t.length >>> 0;
					if (len === 0)
						return -1;
					var n = 0;
					if (arguments.length > 0)
					{
						n = Number(arguments[1]);
						if (n !== n)
							n = 0;
						else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
							n = (n > 0 || -1) * Math.floor(Math.abs(n));
					}
					if (n >= len)
						return -1;
					var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
					for (; k < len; k++)
					{
						if (k in t && t[k] === searchElement)
						return k;
					}
					return -1;
				};
			}
			
			// TODO: shortening the namespaced things can save me almost 3,000 characters
			// off a final shrunken size of 14,000.  Worth it?  Costs a couple hundred to expand...
			var named = {
				days: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
				,shortDays: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
				,months: ["January","February","March","April","May","June"
							,"July","August","September","October","November","December"]
				,shortMonths: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
				,shortTimezones: {
					// from http://en.wikipedia.org/wiki/List_of_time_zone_abbreviations on Jan 6, 2011
					ACDT:10.5,ACST:9.5,ACT:8,ADT:-3,AEDT:11,AEST:10
					,AFT:4.5,AKDT:-8,AKST:-9,AMST:5,AMT:4,ART:-3
					,AST:3,AST:4,AST:3,AST:-4,AWDT:9,AWST:8
					,AZOST:-1,AZT:4,BDT:8,BIOT:6,BIT:-12,BOT:-4
					,BRT:-3,BST:6,BST:1,BTT:6,CAT:2,CCT:6.5
					,CDT:-5,CEDT:2,CEST:2,CET:1,CHAST:12.75,CIST:-8
					,CKT:-10,CLST:-3,CLT:-4,COST:-4,COT:-5,CST:-6
					,CST:8,CVT:-1,CXT:7,ChST:10,DST:0,DFT:1
					,EAST:-6,EAT:3,ECT:-4,ECT:-5,EDT:-4,EEDT:3
					,EEST:3,EET:2,EST:-5,FJT:12,FKST:-3,FKT:-4
					,GALT:-6,GET:4,GFT:-3,GILT:12,GIT:-9,GMT:0
					,GST:-2,GYT:-4,HADT:-9,HAST:-10,HKT:8,HMT:5
					,HST:-10,IRKT:8,IRST:3.5,IST:5.5,IST:1,IST:2
					,JST:9,KRAT:7,KST:9,LHST:10.5,LINT:14,MAGT:11
					,MDT:-6,MIT:-9.5,MSD:4,MSK:3,MST:8,MST:-7
					,MST:6.5,MUT:4,NDT:-2.5,NFT:11.5,NPT:5.75,NST:-3.5
					,NT:-3.5,OMST:6,PDT:-7,PETT:12,PHOT:13,PKT:5
					,PST:-8,PST:8,RET:4,SAMT:4,SAST:2,SBT:11
					,SCT:4,SLT:5.5,SST:-11,SST:8,TAHT:-10,THA:7
					,UTC:0,UYST:-2,UYT:-3,VET:-4.5,VLAT:10,WAT:1
					,WEDT:1,WEST:1,WET:0,YAKT:9,YEKT:5
				}
				,timezones: {
					// compatibility with http://php.net/manual/en/function.date.php
					// which lists "UTC","GMT" as options in the example.
					UTC:0,GMT:0
					// from http://en.wikipedia.org/wiki/List_of_tz_database_time_zones
					,"Africa/Abidjan": 0,"Africa/Accra": 0,"Africa/Addis_Ababa": 3
					,"Africa/Algiers": 1,"Africa/Asmara": 3,"Africa/Bamako": 0
					,"Africa/Bangui": 1,"Africa/Banjul": 0,"Africa/Bissau": 0
					,"Africa/Blantyre": 2,"Africa/Brazzaville": 1,"Africa/Bujumbura": 2
					,"Africa/Cairo": 2,"Africa/Casablanca": 0,"Africa/Ceuta": 1
					,"Africa/Conakry": 0,"Africa/Dakar": 0,"Africa/Dar_es_Salaam": 3
					,"Africa/Djibouti": 3,"Africa/Douala": 1,"Africa/El_Aaiun": 0
					,"Africa/Freetown": 0,"Africa/Gaborone": 2,"Africa/Harare": 2
					,"Africa/Johannesburg": 2,"Africa/Kampala": 3,"Africa/Khartoum": 3
					,"Africa/Kigali": 2,"Africa/Kinshasa": 1,"Africa/Lagos": 1
					,"Africa/Libreville": 1,"Africa/Lome": 0,"Africa/Luanda": 1
					,"Africa/Lubumbashi": 2,"Africa/Lusaka": 2,"Africa/Malabo": 1
					,"Africa/Maputo": 2,"Africa/Maseru": 2,"Africa/Mbabane": 2
					,"Africa/Mogadishu": 3,"Africa/Monrovia": 0,"Africa/Nairobi": 3
					,"Africa/Ndjamena": 1,"Africa/Niamey": 1,"Africa/Nouakchott": 0
					,"Africa/Ouagadougou": 0,"Africa/Porto-Novo": 1,"Africa/Sao_Tome": 0
					,"Africa/Tripoli": 2,"Africa/Tunis": 1,"Africa/Windhoek": 1
					,"America/Adak": -10,"America/Anchorage": -9,"America/Anguilla": -4
					,"America/Antigua": -4,"America/Araguaina": -3,"America/Argentina/Buenos_Aires": -3
					,"America/Argentina/Catamarca": -3,"America/Argentina/Cordoba": -3,"America/Argentina/Jujuy": -3
					,"America/Argentina/La_Rioja": -3,"America/Argentina/Mendoza": -3,"America/Argentina/Rio_Gallegos": -3
					,"America/Argentina/Salta": -3,"America/Argentina/San_Juan": -3,"America/Argentina/San_Luis": -4
					,"America/Argentina/Tucuman": -3,"America/Argentina/Ushuaia": -3,"America/Aruba": -4
					,"America/Asuncion": -4,"America/Atikokan": -5,"America/Bahia": -3
					,"America/Barbados": -4,"America/Belem": -3,"America/Belize": -6
					,"America/Blanc-Sablon": -4,"America/Boa_Vista": -4,"America/Bogota": -5
					,"America/Boise": -7,"America/Cambridge_Bay": -7,"America/Campo_Grande": -4
					,"America/Cancun": -6,"America/Caracas": -4.5,"America/Cayenne": -3
					,"America/Cayman": -5,"America/Chicago": -6,"America/Chihuahua": -7
					,"America/Costa_Rica": -6,"America/Cuiaba": -4,"America/Curacao": -4
					,"America/Danmarkshavn": 0,"America/Dawson": -8,"America/Dawson_Creek": -7
					,"America/Denver": -7,"America/Detroit": -5,"America/Dominica": -4
					,"America/Edmonton": -7,"America/Eirunepe": -4,"America/El_Salvador": -6
					,"America/Fortaleza": -3,"America/Glace_Bay": -4,"America/Godthab": -3
					,"America/Goose_Bay": -4,"America/Grand_Turk": -5,"America/Grenada": -4
					,"America/Guadeloupe": -4,"America/Guatemala": -6,"America/Guayaquil": -5
					,"America/Guyana": -4,"America/Halifax": -4,"America/Havana": -5
					,"America/Hermosillo": -7,"America/Indiana/Indianapolis": -5,"America/Indiana/Knox": -6
					,"America/Indiana/Marengo": -5,"America/Indiana/Petersburg": -5,"America/Indiana/Tell_City": -6
					,"America/Indiana/Vevay": -5,"America/Indiana/Vincennes": -5,"America/Indiana/Winamac": -5
					,"America/Inuvik": -7,"America/Iqaluit": -5,"America/Jamaica": -5
					,"America/Juneau": -9,"America/Kentucky/Louisville": -5,"America/Kentucky/Monticello": -5
					,"America/La_Paz": -4,"America/Lima": -5,"America/Los_Angeles": -8
					,"America/Maceio": -3,"America/Managua": -6,"America/Manaus": -4
					,"America/Marigot": -4,"America/Martinique": -4,"America/Matamoros": -6
					,"America/Mazatlan": -7,"America/Menominee": -6,"America/Merida": -6
					,"America/Mexico_City": -6,"America/Miquelon": -3,"America/Moncton": -4
					,"America/Monterrey": -6,"America/Montevideo": -3,"America/Montreal": -5
					,"America/Montserrat": -4,"America/Nassau": -5,"America/New_York": -5
					,"America/Nipigon": -5,"America/Nome": -9,"America/Noronha": -2
					,"America/North_Dakota/Center": -6,"America/North_Dakota/New_Salem": -6,"America/Ojinaga": -7
					,"America/Panama": -5,"America/Pangnirtung": -5,"America/Paramaribo": -3
					,"America/Phoenix": -7,"America/Port-au-Prince": -5,"America/Port_of_Spain": -4
					,"America/Porto_Velho": -4,"America/Puerto_Rico": -4,"America/Rainy_River": -6
					,"America/Rankin_Inlet": -6,"America/Recife": -3,"America/Regina": -6
					,"America/Resolute": -5,"America/Rio_Branco": -4,"America/Santa_Isabel": -8
					,"America/Santarem": -3,"America/Santiago": -4,"America/Santo_Domingo": -4
					,"America/Sao_Paulo": -3,"America/Scoresbysund": -1,"America/Shiprock": -7
					,"America/St_Barthelemy": -4,"America/St_Johns": -3.5,"America/St_Kitts": -4
					,"America/St_Lucia": -4,"America/St_Thomas": -4,"America/St_Vincent": -4
					,"America/Swift_Current": -6,"America/Tegucigalpa": -6,"America/Thule": -4
					,"America/Thunder_Bay": -5,"America/Tijuana": -8,"America/Toronto": -5
					,"America/Tortola": -4,"America/Vancouver": -8,"America/Whitehorse": -8
					,"America/Winnipeg": -6,"America/Yakutat": -9,"America/Yellowknife": -7
					,"Antarctica/Casey": 8,"Antarctica/Davis": 7,"Antarctica/DumontDUrville": 10
					,"Antarctica/Mawson": 6,"Antarctica/McMurdo": 12,"Antarctica/Palmer": -4
					,"Antarctica/Rothera": -3,"Antarctica/South_Pole": 12,"Antarctica/Syowa": 3
					,"Antarctica/Vostok": 0,"Arctic/Longyearbyen": 1,"Asia/Aden": 3
					,"Asia/Almaty": 6,"Asia/Amman": 2,"Asia/Anadyr": 11
					,"Asia/Aqtau": 5,"Asia/Aqtobe": 5,"Asia/Ashgabat": 5
					,"Asia/Baghdad": 3,"Asia/Bahrain": 3,"Asia/Baku": 4
					,"Asia/Bangkok": 7,"Asia/Beirut": 2,"Asia/Bishkek": 6
					,"Asia/Brunei": 8,"Asia/Choibalsan": 8,"Asia/Chongqing": 8
					,"Asia/Colombo": 5.5,"Asia/Damascus": 2,"Asia/Dhaka": 6
					,"Asia/Dili": 9,"Asia/Dubai": 4,"Asia/Dushanbe": 5
					,"Asia/Gaza": 2,"Asia/Harbin": 8,"Asia/Ho_Chi_Minh": 7
					,"Asia/Hong_Kong": 8,"Asia/Hovd": 7,"Asia/Irkutsk": 8
					,"Asia/Jakarta": 7,"Asia/Jayapura": 9,"Asia/Jerusalem": 2
					,"Asia/Kabul": 4.5,"Asia/Kamchatka": 11,"Asia/Karachi": 6
					,"Asia/Kashgar": 8,"Asia/Kathmandu": 5.75,"Asia/Kolkata": 5.5
					,"Asia/Krasnoyarsk": 7,"Asia/Kuala_Lumpur": 8,"Asia/Kuching": 8
					,"Asia/Kuwait": 3,"Asia/Macau": 8,"Asia/Magadan": 11
					,"Asia/Makassar": 8,"Asia/Manila": 8,"Asia/Muscat": 4
					,"Asia/Nicosia": 2,"Asia/Novokuznetsk": 6,"Asia/Novosibirsk": 6
					,"Asia/Omsk": 6,"Asia/Oral": 5,"Asia/Phnom_Penh": 7
					,"Asia/Pontianak": 7,"Asia/Pyongyang": 9,"Asia/Qatar": 3
					,"Asia/Qyzylorda": 6,"Asia/Rangoon": 6.5,"Asia/Riyadh": 3
					,"Asia/Sakhalin": 10,"Asia/Samarkand": 5,"Asia/Seoul": 9
					,"Asia/Shanghai": 8,"Asia/Singapore": 8,"Asia/Taipei": 8
					,"Asia/Tashkent": 5,"Asia/Tbilisi": 4,"Asia/Tehran": 3.5
					,"Asia/Thimphu": 6,"Asia/Tokyo": 9,"Asia/Ulaanbaatar": 8
					,"Asia/Urumqi": 8,"Asia/Vientiane": 7,"Asia/Vladivostok": 10
					,"Asia/Yakutsk": 9,"Asia/Yekaterinburg": 5,"Asia/Yerevan": 4
					,"Atlantic/Azores": -1,"Atlantic/Bermuda": -4,"Atlantic/Canary": 0
					,"Atlantic/Cape_Verde": -1,"Atlantic/Faroe": 0,"Atlantic/Madeira": 0
					,"Atlantic/Reykjavik": 0,"Atlantic/South_Georgia": -2,"Atlantic/St_Helena": 0
					,"Atlantic/Stanley": -4,"Australia/Adelaide": 9.5,"Australia/Brisbane": 10
					,"Australia/Broken_Hill": 9.5,"Australia/Currie": 10,"Australia/Darwin": 9.5
					,"Australia/Eucla": 8.75,"Australia/Hobart": 10,"Australia/Lindeman": 10
					,"Australia/Lord_Howe": 10.5,"Australia/Melbourne": 10,"Australia/Perth": 8
					,"Australia/Sydney": 10,"Europe/Amsterdam": 1,"Europe/Andorra": 1
					,"Europe/Athens": 2,"Europe/Belgrade": 1,"Europe/Berlin": 1
					,"Europe/Bratislava": 1,"Europe/Brussels": 1,"Europe/Bucharest": 2
					,"Europe/Budapest": 1,"Europe/Chisinau": 2,"Europe/Copenhagen": 1
					,"Europe/Dublin": 0,"Europe/Gibraltar": 1,"Europe/Guernsey": 0
					,"Europe/Helsinki": 2,"Europe/Isle_of_Man": 0,"Europe/Istanbul": 2
					,"Europe/Jersey": 0,"Europe/Kaliningrad": 2,"Europe/Kiev": 2
					,"Europe/Lisbon": 0,"Europe/Ljubljana": 1,"Europe/London": 0
					,"Europe/Luxembourg": 1,"Europe/Madrid": 1,"Europe/Malta": 1
					,"Europe/Mariehamn": 2,"Europe/Minsk": 2,"Europe/Monaco": 1
					,"Europe/Moscow": 3,"Europe/Oslo": 1,"Europe/Paris": 1
					,"Europe/Podgorica": 1,"Europe/Prague": 1,"Europe/Riga": 2
					,"Europe/Rome": 1,"Europe/Samara": 3,"Europe/San_Marino": 1
					,"Europe/Sarajevo": 1,"Europe/Simferopol": 2,"Europe/Skopje": 1
					,"Europe/Sofia": 2,"Europe/Stockholm": 1,"Europe/Tallinn": 2
					,"Europe/Tirane": 1,"Europe/Uzhgorod": 2,"Europe/Vaduz": 1
					,"Europe/Vatican": 1,"Europe/Vienna": 1,"Europe/Vilnius": 2
					,"Europe/Volgograd": 3,"Europe/Warsaw": 1,"Europe/Zagreb": 1
					,"Europe/Zaporozhye": 2,"Europe/Zurich": 1,"Indian/Antananarivo": 3
					,"Indian/Chagos": 6,"Indian/Christmas": 7,"Indian/Cocos": 6.5
					,"Indian/Comoro": 3,"Indian/Kerguelen": 5,"Indian/Mahe": 4
					,"Indian/Maldives": 5,"Indian/Mauritius": 4,"Indian/Mayotte": 3
					,"Indian/Reunion": 4,"Pacific/Apia": -11,"Pacific/Auckland": 12
					,"Pacific/Chatham": 12.75,"Pacific/Easter": -6,"Pacific/Efate": 11
					,"Pacific/Enderbury": 13,"Pacific/Fakaofo": -10,"Pacific/Fiji": 12
					,"Pacific/Funafuti": 12,"Pacific/Galapagos": -6,"Pacific/Gambier": -9
					,"Pacific/Guadalcanal": 11,"Pacific/Guam": 10,"Pacific/Honolulu": -10
					,"Pacific/Johnston": -10,"Pacific/Kiritimati": 14,"Pacific/Kosrae": 11
					,"Pacific/Kwajalein": 12,"Pacific/Majuro": 12,"Pacific/Marquesas": -9.5
					,"Pacific/Midway": -11,"Pacific/Nauru": 12,"Pacific/Niue": -11
					,"Pacific/Norfolk": 11.5,"Pacific/Noumea": 11,"Pacific/Pago_Pago": -11
					,"Pacific/Palau": 9,"Pacific/Pitcairn": -8,"Pacific/Ponape": 11
					,"Pacific/Port_Moresby": 10,"Pacific/Rarotonga": -10,"Pacific/Saipan": 10
					,"Pacific/Tahiti": -10,"Pacific/Tarawa": 12,"Pacific/Tongatapu": 13
					,"Pacific/Truk": 10,"Pacific/Wake": 12,"Pacific/Wallis": 12
					// I do not intend to support more.
					// All summer time zones simply add +1 (everywhere.  should this account for non-summer-time countries?).
				}
			};
			var internalReg = {
				negative: /^-/
				,digits4: /[\d]4/
			};
			// Regular expressions which parse the specified format character & return those values
			var reg = {
				// day
				 d: /^(0[1-9])|([1-3][\d])/
				,D: new RegExp("^" + named.shortDays.join("|"))
				,j: /^([1-3][\d])|([1-9])/
				,l: new RegExp("^" + named.days.join("|"))
				,N: /^[1-7]/
				,S: /^st|nd|rd|th/
				,w: /^[0-6]/
				,z: /^(36[0-6])|(3[0-5][\d])|([1-2][\d]{2})|([1-9][\d])|([\d])/
				
				// week
				,W: /^(0[1-9])|(4[0-3])|([1-3][\d])/
				
				// month
				,F: new RegExp("^" + named.months.join("|"))
				,m: /^(0[1-9])|(1[0-2])/
				,M: new RegExp("^" + named.shortMonths.join("|"))
				,n: /^(1[12])|([1-9])/
				,t: /^(3[01])|([12][\d])|([1-9])/
				
				// year
				,L: /^[01]/
				,o: /^[\d]{4}/
				,Y: /^[\d]{4}/
				,y: /^[\d]{2}/ // note that the ISO-8601 allows more than 4 digits, _if agreed upon_.  I don't, in PHP formatting.
				
				// time
				,a: /^am|pm/
				,A: /^AM|PM/
				,B: /^[\d]{3}/
				,g: /^(1[12])|([1-9])/
				,G: /^(2[0-3])|([01][\d])/
				,h: /^(1[0-2])|(0[1-9])/
				,H: /^(2[0-3])|([01][\d])/
				,i: /^[0-5][\d]/
				,s: /^[0-5][\d]/
				,u: /^(0)|([1-9][\d]{1,5})/
				
				// timezone
				,e: new RegExp("^" + (function(){
					var arr = [];
					for(zone in named.timezones){
						if (!(named.timezones.hasOwnProperty(zone))) continue;
						arr.push(zone);
					}
					return arr.join("|");
				})()) // huge
				,I: /^[01]/
				,O: /^([+-]2[0-3][0-5][\d])|([+-][01][\d][0-5][\d])/
				,P: /^([+-]2[0-3]:[0-5][\d])|([+-][01][\d]:[0-5][\d])/
				,T: new RegExp("^" + (function(){
					var arr = [];
					for(zone in named.shortTimezones){
						if (!(named.shortTimezones.hasOwnProperty(zone))) continue;
						arr.push(zone);
					}
					return arr.join("|");
				})())
				,Z: /^(-43200)|(-43[01][\d]{2})|(-4[0-2][\d]{3})|(-[1-3][\d]{4})|(-[1-9][\d]{0,3})|(-0)|(0)|(50400)|(50[0-3][\d]{2})|(4[\d]{4})|([1-9][\d]{0,3})/ // handles -43200 through 50400 without exceeding either bound.  Super-extra-special bonus: handles "-0" intelligently!
			}
			// Get an integer from a regex, and update the string being parsed.
			var toInt = function(regex){
				return function(mutableString){
					var x = regex.exec(mutableString[0])[0];
					mutableString[0] = mutableString[0].substr(x.length);
					return parseInt(x,10);
				};
			};
			// Functions to return the actual values to construct a date
			var funcs = {
				// Day
				d: toInt(reg.d)
				,D: function(mutableString){
					var x = reg.D.exec(mutableString[0])[0];
					mutableString[0] = mutableString[0].substr(x.length);
					return named.shortDays.indexOf(x);
				}
				,j: toInt(reg.j)
				,l: function(mutableString){
					var x = reg.l.exec(mutableString[0])[0];
					mutableString[0] = mutableString[0].substr(x.length);
					return named.days.indexOf(x);
				}
				,N: function(mutableString){
					return toInt(reg.N)(mutableString)-1;
				}
				,S: function(mutableString){
					var x = reg.S.exec(mutableString[0])[0];
					mutableString[0] = mutableString[0].substr(x.length);
					return null;
				}
				,w: toInt(reg.w)
				,z: toInt(reg.z)
				
				// Week
				,W: toInt(reg.W)
				
				// Month
				,F: function(mutableString){
					var x = reg.F.exec(mutableString[0])[0];
					mutableString[0] = mutableString[0].substr(x.length);
					return named.months.indexOf(x);
				}
				,m: function(mutableString){
					return toInt(reg.m)(mutableString)-1;
				}
				,M: function(mutableString){
					var x = reg.M.exec(mutableString[0])[0];
					mutableString[0] = mutableString[0].substr(x.length);
					return named.shortMonths.indexOf(x);
				}
				,n: toInt(reg.n)
				,t: toInt(reg.t)
				
				// Year
				,L: toInt(reg.L)
				,o: toInt(reg.Y)
				,Y: toInt(reg.Y)
				,y: function(mutableString){
					// CAUTION: this favors this year or in the past ONLY.
					var year = toInt(reg.Y)(mutableString);
					if (year+2000 > new DateTime().getFullYear())
						return year+1900;
					else
						return year+2000;
				}
				
				// Time
				,a: function(mutableString){
					var x = reg.a.exec(mutableString[0])[0];
					mutableString[0] = mutableString[0].substr(x.length);
					return (x=="am" ? 0 : 12);
				}
				,A: function(mutableString){
					var x = reg.a.exec(mutableString[0])[0];
					mutableString[0] = mutableString[0].substr(x.length);
					return (x=="AM" ? 0 : 12);
				}
				,B: function(mutableString){
					// huh.  decimal-based time of day. (no "official" support for decimals)
					// TODO: handle.  milliseconds based on UTC.
					// see:  http://en.wikipedia.org/wiki/Swatch_Internet_Time
					var beats = toInt(reg.B)(mutableString);
					var ms = (beats/1000)*(1000*60*60*24);
					return (ms%1>=0.5 ? Math.ceil(ms) : Math.floor(ms));
				}
				,g: toInt(reg.g)
				,G: toInt(reg.G)
				,h: toInt(reg.h)
				,H: toInt(reg.H)
				,i: toInt(reg.i)
				,s: toInt(reg.s)
				,u: function(mutableString){
					var us = toInt(reg.u)(mutableString)/1000;
					return (us%1>=0.5 ? Math.ceil(us) : Math.floor(us));
				}
				
				// Timezone
				,e: function(mutableString) {
					// returns second offset from UTC
					var x = reg.e.exec(mutableString[0])[0];
					mutableString[0] = mutableString[0].substr(x.length);
					return named.timezones[x]*60*60;
				}
				,I: function(mutableString) {
					// returns hour offset if in DST.  
					// Assumes it is applied intelligently; do not use if the timezone / country does not have DST at this time!
					return toInt(reg.I)(mutableString);
				}
				,O: function(mutableString){
					// returns second offset from UTC
					var x = reg.O.exec(mutableString[0])[0];
					mutableString[0] = mutableString[0].substr(x.length);
					
					var neg = internalReg.negative.test(x);
					var num = internalReg.digits4.match(x)[0]; // get digits
					var hours = parseInt(num[0] + num[1], 10);
					var minutes = parseInt(num[2] + num[3], 10);
					
					// reverse negativity; +0200 means subtract 2 hours to get UTC.
					return ((neg ? 1 : -1) * (60*hours + minutes))*60;
				}
				,P: function(mutableString){
					// returns second offset from UTC
					// same as O, but strips the ":".
					
					var x = reg.P.exec(mutableString[0])[0];
					mutableString[0] = mutableString[0].substr(x.length);
					
					var neg = internalReg.negative.test(x);
					x = x.replace(":","");
					var num = internalReg.digits4.match(x)[0]; // get digits
					var hours = parseInt(num[0] + num[1], 10);
					var minutes = parseInt(num[2] + num[3], 10);
					
					// turn that frown upside down; +0200 means subtract 2 hours to get UTC.
					return ((neg ? 1 : -1) * (60*hours + minutes))*60;
				}
				,T: function(mutableString) {
					// returns second offset from UTC
					var x = reg.T.exec(mutableString[0])[0];
					mutableString[0] = mutableString[0].substr(x.length);
					return named.shortTimezones[x]*60*60;
				}
				,Z: toInt(reg.Z)
				
				// Standards
				,c: function(mutableString){
					// ISO 8601 date format
					// built-in date will handle it.
					return new Date(mutableString[0]);
				}
				,r: function(mutableString){
					// RFC 2822 (email) date format
					// built-in date will handle it.
					return new Date(mutableString[0]);
				}
				,U: function(mutableString){
					// seconds since the Unix Epoch.
					// built-in date will handle it.
					return new Date(parseInt(mutableString[0], 10)*10);
				}
			};
			var funcTypes = {
				d: "day"
				,D: "day of week"
				,j: "day"
				,l: "day of week"
				,N: "day of week"
				,S: null
				,w: "day of week"
				,z: "day of year"
				
				,W: "week of year"
				
				,F: "month"
				,m: "month"
				,M: "month"
				,n: "month"
				,t: null
				
				,L: null
				,o: "year"
				,Y: "year"
				,y: "year"
				
				,a: "hour offset"
				,A: "hour offset"
				,B: "date"
				,g: "hour"
				,G: "hour 24"
				,h: "hour"
				,H: "hour 24"
				,i: "minute"
				,s: "second"
				,u: "millisecond"
				
				,e: "timezone"
				,I: "hour offset"
				,O: "timezone"
				,P: "timezone"
				,T: "timezone"
				,Z: "timezone"
				
				,c: "date"
				,r: "date"
				,U: "date"
			};
			
			return function(value, format){
				// step through format string, building array of funcs to process.
				// when encounter !control character, add a function to strip it.
				// when encounter a \ character, add a function to strip it and ignore the next character.
				var mutableString = [value];
				var steps = [];
				var fields = [];
				var length = format.length;
				for(var i = 0; i < length; i++){
					if (funcs[format.charAt(i)]){
						steps.push(funcs[format.charAt(i)]);
						fields.push(funcTypes[format.charAt(i)]);
					} else {
						if (format.charAt(i) == "\\"){
							steps.push(function(){
								mutableString[0] = mutableString[0].substr(1);
							});
							fields.push(null);
							i++;
						} else {
							steps.push(function(){
								mutableString[0] = mutableString[0].substr(1);
							});
							fields.push(null);
						}
					}
				}
				var timeStruct = {
					year:0
					,month:0
					,day:0
					,hour:0
					,minute:0
					,second:0
					,millisecond:0
				};
				var isTimezoned = false;
				length = steps.length;
				for(var i = 0; i < length; i++){
					// TODO: Day of week, day of year, and week: hard to handle in parsing.  
					// TODO: Store them for later, and apply if no values have been set for others?
					switch (fields[i]){
						case "year": timeStruct.year = steps[i](mutableString); break;
						case "month": timeStruct.month = steps[i](mutableString); break;
						case "day": timeStruct.day = steps[i](mutableString); break;
						case "day of week": steps[i](mutableString); break; // TODO: handle?
						case "day of year": steps[i](mutableString); break; // TODO: handle?
						case "week": steps[i](mutableString); break; // TODO: handle?
						case "hour 24":
						case "hour offset": 
						case "hour": timeStruct.hour += steps[i](mutableString); break;
						case "minute offset": 
						case "minute": timeStruct.minute += steps[i](mutableString); break;
						case "second offset": 
						case "second": timeStruct.second += steps[i](mutableString); break;
						case "millisecond": timeStruct.millisecond += steps[i](mutableString); break;
						case "timezone":
							isTimezoned = true;
							timeStruct.second += steps[i](mutableString);
							break;
						case "date": 
							return steps[i](mutableString); // finished.
							break;
						default: steps[i](mutableString); break;
					}
				}
				var result;
				if (isTimezoned){
					result = new Date(Date.UTC(timeStruct.year, timeStruct.month, timeStruct.day, timeStruct.hour, timeStruct.minute, timeStruct.second, timeStruct.millisecond));
				} else {
					result = new Date(timeStruct.year, timeStruct.month, timeStruct.day, timeStruct.hour, timeStruct.minute, timeStruct.second, timeStruct.millisecond);
				}
				return result;
			};
		})();
		
		// -----------------------------------------------
		// Date-string building code
		// -----------------------------------------------
		
		Date.prototype.PHPhormat = (function(){
			var mod = function(num, by){
				// JavaScript's mod operator retains the original sign - annoying :/
				num = num % by;
				if (num < 0){
					num = num + by;
				}
				return num;
			};
			var named = {
				days: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
				,shortDays: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
				,months: ["January","February","March","April","May","June","July","August","September","October","November","December"]
				,shortMonths: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
				,ordinal:["st","nd","rd","th"]
			};
			var pad = function(val, length){
				var str = val.toString();
				while (str.length < length){
					str = "0" + str;
				}
				return str;
			};
			// Note for people reading this:
			// tested against PHP 5.3.3: year-emitting formats emit the exact year, without regard to length.  ie, "-23" is valid output, but not input.
			// I could handle this.  But I'm not.  For string-creation, human-readable accuracy is probably preferable to re-parsability.
			var tokens = {
				// Day
				d: function(date){
					// day of month, 01-31
					return pad(date.getDate(),2);
				}
				,D: function(date){
					// short name of day of week
					return named.shortDays[date.getDay()];
				}
				,j: function(date){
					// day of month, 1-31
					return date.getDate();
				}
				,l: function(date){
					// long name of day of week
					return named.days[date.getDay()];
				}
				,N: function(date){
					// day of week, 1-7, starting on monday
					return mod(date.getDay()-1,7);
				}
				,S: function(date){
					// ordinal value of number ("st", "nd", "rd", "th")
					var dayOfMonth = date.getDate()-1;
					if (dayOfMonth > 9 && dayOfMonth < 19){
						return named.ordinal[3];
					}
					if (dayOfMonth%10 > 3){
						dayOfMonth = 3;
					}
					return named.ordinal[dayOfMonth%10]
				}
				,w: function(date){
					// day of week, 0-6, starting on sunday
					return date.getDay();
				}
				,z: function(date){
					// returns day-of-year, 0-365
					var yearStart = new Date(date.getTime());
					yearStart.setDate(1);
					yearStart.setMonth(0);
					return (date.getTime() - yearStart.getTime())/(1000*60*60*24);
				}
				
				// Week
				// TODO: hmm.  Too cryptic for my tastes.  
				// Try my method: get distance from first week of the year.
				// 	ie, find start of year, find difference from Monday, find day from first Monday.
				// If prior to first Monday, get difference from first week of last year (cannot be prior to first Monday, will not recurse further.).
				,W: (function(){
					// adapted from http://www.merlyn.demon.co.uk/weekcalc.htm
					// copied from EXT, and changed variable names and comments.
					var millisecondsPerDay = 1000*60*60*24;
					var millisecondsPerWeek = 7 * millisecondsPerDay;
					
					return function(date) {
						// Get an absolute day number from the Unix Epoch (any Thursday, really).  Method offsets weeks by 3 days, so go ahead 3.
						var dayFromEpoch = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / millisecondsPerDay;
						// Get an absolute week number from that date
						var weekFromEpoch = Math.floor(dayFromEpoch / 7);
						// Subtract the week value of the first week of the year.
						return weekFromEpoch - Math.floor(Date.UTC(new Date(weekFromEpoch * millisecondsPerWeek).getUTCFullYear(), 0, 1) / millisecondsPerWeek);
					};
				})()
				
				// Month
				,F: function(date){
					// returns long month name
					return named.months[date.getMonth()];
				}
				,m: function(date){
					// returns number of month, 01-12
					return pad(date.getMonth()+1,2);
				}
				,M: function(date){
					// returns short month name
					return named.shortMonths[date.getMonth()];
				}
				,n: function(date){
					// returns number of month, 1-12
					return date.getMonth()+1;
				}
				,t: function(date){
					// Returns number of days in the month, 28-31
					var start = new Date(date.getTime());
					var end = new Date(date.getTime());
					start.setDate(1);
					end.setMonth(end.getMonth()+1);
					end.setDate(1);
					return parseInt((end.getTime()-start.getTime())/(1000*60*60*24),10);
				}
				
				// Year
				,L: function(date){
					// returns 1 if leap year, 0 otherwise.
					var year = date.getFullYear();
					return (mod(year,400)==0||(mod(year,4)==0 && mod(year,100)!=0));
				}
				,o: function(date){
					// returns full-length year (only difference from Y is in parsing)
					// php docs say 4 digits, but php puts out exact full string.
					return date.getFullYear();
				}
				,Y: function(date){
					// returns full-length year
					// php docs say 4 digits, but php puts out exact full string.
					return date.getFullYear();
				}
				,y: function(date){
					// returns 2 digit year.
					// If negative, includes the negative sign (possibly emitting 3 characters)
					// php docs say 2 digits, but it matches this behavior.
					return date.getFullYear()%100; // note: % keeps negative value.
				}
				
				// Time
				,a: function(date){
					return (date.getHour() < 12 ? "am" : "pm");
				}
				,A: function(date){
					return (date.getHour() < 12 ? "AM" : "PM");
				}
				,B: function(date){ // stupid Swatch time has a stupid character like "B"
					// milliseconds today / milliseconds per day * 1000.
					var start = new Date(date.getTime()); // stupid Swatch time calculation needs another date object.
					start.setUTCHours(-1); // stupid Swatch time uses UTC+0100.
					start.setUTCMinutes(0); // stupid Swatch time calculation needs 0 minutes.
					start.setUTCSeconds(0); // stupid Swatch time calculation needs 0 seconds.
					start.setUTCMilliseconds(0); // stupid Swatch time calculation needs 0 milliseconds.
					return pad( // stupid Swatch time needs padding.
						mod( // stupid Swatch time can't use JavaScript's stupid mod operator that preserves negative values.
							parseInt( // stupid Swatch time calculation can't handle decimals.
								( // stupid Swatch time calculation makes JavaScript look like Lisp.
									( // stupid Swatch time calculation makes JavaScript look like Lisp.
										date.getTime()-start.getTime() // stupid Swatch time calculation needs subtraction.
									)/(1000*60*60*24) // stupid Swatch time is based on the proportion of the day that's passed.
								)*1000 // stupid Swatch time calculation gives decimals between 0 and 1.
							,10) // stupid Swatch time calculation CAN'T HANDLE THE DECIMAL!
						,1000) // stupid Swatch time only goes to 999.
					,3); // stupid Swatch time needs to have 3 digits at all times.
				} // stupid Swatch time calculation finished.  Finally.  Not a moment too soon.
				,g: function(date){
					// returns hours, 1-12
					return mod(date.getHours(), 12)+1;
				}
				,G: function(date){
					// returns hours, 0-23
					return date.getHours();
				}
				,h: function(date){
					// returns hours, 01-12
					return pad(mod(date.getHours(), 12)+1,2);
				}
				,H: function(date){
					// returns hours, 00-23
					return pad(date.getHours(),2);
				}
				,i: function(date){
					// returns minutes, 00-59
					return pad(date.getMinutes());
				}
				,s: function(date){
					// returns seconds, 00-59
					return pad(date.getSeconds());
				}
				,u: function(date){
					// returns microseconds, 0-999999
					return date.getMilliseconds()*1000;
				}
				
				// Timezone
				,e: function(date){
					// no such thing as a reverse timezone lookup.  Everything is UTC.
					return "UTC";
				}
				,I: function(date){
					// Daylight Savings Time hour offset
					// I have no frickin' clue how to handle this.  DST is a blight upon programmers.
					// Oh yea: don't.
					return 0;
				}
				,O: function(date){
					// returns timezone offset, +0200 and similar
					var offset = date.getTimezoneOffset()*(-1);
					// +/- + padded hours + padded minutes
					return (offset<0 ? "-" : "+")+(pad(Math.abs(parseInt(offset/60,10)),2))+(pad(Math.abs(parseInt(offset%60,10)),2));
				}
				,P: function(date){
					// returns timezone offset, +02:00 and similar
					var offset = date.getTimezoneOffset()*(-1);
					// +/- + padded hours + : + padded minutes
					return (offset<0 ? "-" : "+")+(pad(Math.abs(parseInt(offset/60,10)),2))+":"+(pad(Math.abs(parseInt(offset%60,10)),2));
				}
				,T: function(date){
					// no such thing as a reverse timezone lookup.  Everything is UTC.
					return "UTC";
				}
				,Z: function(date){
					// returns timezone offset in seconds.
					return date.getTimezoneOffset()*60;
				}
				
				// Full date
				,U: function(date){
					// returns seconds since Unix Epoch.
					return parseInt(date.getTime()/1000,10);
				}
			};
			// Standard formats
			tokens.c = function(date){
				// ISO 8601 date format
				// 2004-02-12T15:19:21+00:00
				return tokens.Y(date) + "-" + tokens.m(date) + "-" + tokens.d(date) + "T" + tokens.H(date) + ":" + tokens.i(date) + ":" + tokens.s(date) + tokens.O(date);
			};
			tokens.r = function(date){
				// RFC 2822 (email) date format
				// Thu, 02 Dec 2000 16:01:07 +0200
				return tokens.D(date) + ", " + tokens.d(date) + " " + tokens.M(date) + " " + tokens.Y(date) + " " + tokens.H(date) + ":" + tokens.i(date) + ":" + tokens.s(date) + " " + tokens.P(date);
			};
			
			return function(format){
				// step through format string, building array of funcs to process.
				// when encounter !control character, add a function to strip it.
				// when encounter a \ character, add a function to strip it and ignore the next character.
				var steps = [];
				var length = format.length;
				for(var i = 0; i < length; i++){
					if (tokens[format.charAt(i)]){
						steps.push(tokens[format.charAt(i)]);
					} else {
						if (format.charAt(i) == "\\" && i+1 < length){
							steps.push((function(c){
								return function(){return c;};
							})(format.charAt(i+1)));
							i++;
						} else {
							steps.push((function(c){
								return function(){return c;};
							})(format.charAt(i)));
						}
					}
				}
				var str = "";
				length = steps.length;
				for(var i = 0; i < length; i++){
					str += steps[i](this);
				}
				return str;
			};
		})();
	}
})();