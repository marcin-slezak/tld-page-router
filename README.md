Library that helps implementing inetrnalization for expressJs routing following Geberal Top Level Domain (gTLD). It's not a universal library but a tool that fits into specific case:

- we have a web application that was implemented for one country using Country Coude Top Level Domain (ccTLD)
- web application is going global so we need to prepare for new countries and languages
- our decision is to migrate application from ccTLD to gTLD
- we should be able to switch between old and urls's schema really quickly (config switch)
- new url schema:

```
example.com/nl-en/subscription   ]---> url
     |        |       |
     |        |       |____ path
     |        |
     |        |___ path prefix that contain country code and short language code (also know as `localisation prefix`) 
     |
     |_____________  domain
```

Features:
- manage country and language configuration
- manage language specific urls for one page
- simple integration with expressJS router
- simple integration with sitemap.xml library
- working on frontend and backend


Example configuration


```js
import {tdllrFactory} from 'tdl-lang-router';

const tdllr = tdllrFactory();

tdllr.setTopLevelDomain('bluemovement.com');
tdllr.setTopLevelProtocol('https://');

tdllr.addCountry({
    code: 'de',
    name: 'Germany',
    country_level_domain: 'bluemovement.de'
});

tdllr.addCountry({
    code: 'nl',
    name: 'Netherlands',
    country_level_domain: 'bluemovement.nl'
});

tdllr.addCountry({
    code: 'pl',
    name: 'Poland',
    country_level_domain: 'bluemovement.pl',
    disabled: true
});

tdllr.addLanguage({
    code: 'nl'
    full_code: 'nl-nl',
    connected_countries: ['nl']
});


tdllr.addLanguage({
    code: 'de'
    full_code: 'de-de',
    connected_countries: ['de']
});

tdllr.addLanguage({
    code: 'en'
    full_code: 'en-US',
    connected_countries: ['nl', 'de', 'pl']
});

export default tdllr;

```


How we should be able define pages urls:
- the same path for all countries and langs
- path for country
- path for languages
- path for localisation prefixes


```js
import tdllr from './tdllr';

// set the same path for all countries and langs
tdllr.addPage('HOME').addPath('/');
tdllr.addPage('FAQ').addPath('/faq');

// set path for country
tdllr.addPage('OUR_CAPITAL')
  .addPathForCountry('de', 'Berlin')
  .addPathForCountry('nl', 'Amsterdam');

// set path for languages
tdllr.addPage('SUBSCRIPTIONS')
  .addPathForLanguage({
      nl: '/abonamennten',
      pl: '/subskrypcje',
      en: '/subscriptions'
  });

// set path for localisation prefixes
tdllr.addPage('CONTACT')
  .addPathForLocalisationPrefixes({
    'nl-nl': '/abonamennten',
    'pl-pl': '/subskrypcje',
    'nl-en': '/subscriptions'
  });

```


And the most important part, queries! We should provide methods that will give us simple way
to get all data that we need, in one common schema.

```js
import tdllr from './tdllr';

// Query to get available urls that can be reused directly by expressJS routing
tdllr.getPage('SUBSCRIPTIONS').getRouting()
// Result:
//   [
//     '/nl-nl/abonamennten',
//     '/nl-en/subscriptions',
//     '/pl-pl/subskrypcje'
//   ]

// Query toget all urls for specific page
tdllr.getPage('SUBSCRIPTIONS').getDefinition()
// Results:
// [{
//     url: '/de-de/abonnement',
//     localisationPrefix: 'de-de',
//     language: {shortCode: 'de', longCode: 'de-de'},
//     country: {code: 'de', name: 'Germany'}
// }];

// Query to get all alternative url for specific page, useful to widget where you allow
// to switch between languages
tdllr.getPage('SUBSCRIPTIONS').getAlternativePagesFor('country': 'de', lang: 'de');

// Other queries:

```


Library provide middleware for expressJS that will allow to detect lang and country from url. Lang and country attributes in res.locals will contain complete config objects.