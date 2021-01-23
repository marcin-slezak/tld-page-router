Library that helps implementing web application with language and localisation support. We follow TLD + /cc-lang/ + translated path

example.com/nl-en/subscription   ]---> url
     |        |       |
     |        |       |____ path
     |        |
     |        |___ path prefix that contain country code and short language code (also know as `localisation prefix`) 
     |
     |_____________  domain

Features:
- manage country and language configuration
- manage language specific url for one page
- simple integration with expressJS router
- simple integration with sitemap.xml library
- front and backend


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


How we should be able define pages:
- the same path for all countries and langs
- different paths per language
- page enabled only for some country
- page enabled only for somelanguages
- page enabled only for some country-lang sets
- use regexp


Netherlands:
    - dutch
    - english
Germany:
    - German
    - English



```js
import tdllr from './tdllr';

// the same url for all countries/langs
tdllr.addPage('HOME').addPath('/');
tdllr.addPage('FAQ').addPath('/faq');

// the same url per country
tdllr.addPage('OUR_CAPITAL').addPathForCountry('de', 'Berlin').urlForCountry('de', 'Amsterdam');


tdllr.addPage('SUBSCRIPTIONS').addPathForLanguage({nl: '/abonamennten', pl: '/subskrypcje', en: '/subscriptions'})


tdllr.addPage('CONTACT').addPathForLocalisationPrefixex({
    'nl-nl': '/abonamennten',
    'pl-pl': '/subskrypcje',
    'nl-en': '/subscriptions'
    })






```






Adn way how we can query data that we need

```js
import tdllr from './tdllr';

tdllr.getPage('SUBSCRIPTIONS').getRouting()
// ['/nl-nl/abonamennten', '/nl-en/subscriptions', '/pl-pl/subskrypcje']

tdllr.getPage('SUBSCRIPTIONS').getDefinition()
// [{
//     localisationPrefix: 'de-de',
//     language: lang
//     country: country
//     url: '/de-de/abonnement'
// }];
tdllr.getPage('SUBSCRIPTIONS').getAlternativePagesFor('de')
// [{
//     localisationPrefix: 'de-de',
//     language: lang
//     country: country
//     url: '/de-de/abonnement'
// }];

tdllr.getEnabledLangs()
tdllr.getEnabledLangsShortCodes()
tdllr.getAllLangsCodes()
tdllr.getAllLangsShortCodes()


tdllr.getLangNadCountryByLocalisationPrefix('nl-en')
// {
//     language: {},
//     country: {},
// }

tdllr.getEnabledLanguagesAvailbeForCountry('de')
// [
//     lang1,
//     lang 2
// ]



```


Middle ware to set locale


```js

app.use(tdllr.setLocale)

res.locale.lang = {LANG}
res.locale.country = {COUNTRY}
res.locale.localisation_prefix = 'nl-nl'


```