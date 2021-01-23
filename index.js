const PATH_CONFIG_TYPE = {
    ALL_THE_SAME: 'ALL_THE_SAME',
    THE_SAME_FOR_COUNTRY: 'THE_SAME_FOR_COUNTRY',
    PATHS_FOR_LANGUAGE: 'PATHS_FOR_LANGUAGE',
    PATHS_FOR_LOCALISATION_PREFIXES: 'PATHS_FOR_LOCALISATION_PREFIXES',
}; 

class TdlPageRouter {

    constructor(){
        this.countries = [];
        this.languages = [];
        this.pages = [];
    }

    langAndCountryToLocalisationPrefix({countryCode, languageShortCode}){
        return `${countryCode}-${languageShortCode}`;
    }

    localisationPrefixToLangAndCountry(localisationPrefix){
        const [countryCode, languageShortCode] = localisationPrefix.split('-');
        if(!this.countries.some(country => country.code === countryCode)){
            throw new Error(`Could not found country from localisation prefix ${localisationPrefix}`)
        }
        if(!this.languages.some(language => language.shortCode === languageShortCode)){
            throw new Error(`Could not found language from localisation prefix ${localisationPrefix}`)
        }
        return {countryCode, languageShortCode};
    }
    
    setTopLevelDomain(domain){
        this.topLevelDomain = domain;
    }

    setTopLevelProtocol(protocol){
        this.topLevelProtocol = protocol;
    }

    addCountry(country){
        if(!country){
            throw new Error('Country definition not found')
        }

        if(!country.code){
            throw new Error('Country code not found')
        }

        if(this.countries.some(c => c.code === country.code)){
            throw new Error('That country was already declared');
        }

        this.countries.push(country);
    }

    getCountryByCode(requestedCountryCode){
        if(!requestedCountryCode){
            throw new Error('We need a country code to find a catry');
        }
        return this.countries.find(country => country.code === requestedCountryCode);
    }

    addLanguage(language){
        if(!language){
            throw new Error('Language definition not found')
        }

        if(!language.shortCode){
            throw new Error('Language shortCode not found')
        }
        if(!language.fullCode){
            throw new Error('Language fullCode not found')
        }

        if(language.connectedCountries){
            language.connectedCountries.forEach(requestedCountryCode => {
                if(!this.countries.some(country => country.code === requestedCountryCode)){
                    throw new Error(`We could not found country ${requestedCountryCode} provided in connectedCountries attribute`);
                }
            });
        }

        this.languages.push(language);
    }

    getlanguageByShortCode(requestedLanguageShortCode){
        if(!requestedLanguageShortCode){
            throw new Error('We need a language short code to find a language');
        }
        return this.languages.find(language => language.shortCode === requestedLanguageShortCode);
    }

    addPage(pageId){
        if(!pageId){
            throw new Error('Page id is required');
        }
        const page = {
            id: pageId,
            config: []
        };
        this.pages.push(page);
        const context = this;
        return {
            addPath: (path) => {
                page.config.push({
                    type: PATH_CONFIG_TYPE.ALL_THE_SAME,
                    path
                })
            },
            addPathForCountry: (countryCode, path) => { 1307
                if(!this.countries.some(country => country.code === countryCode)){
                    throw new Error('Country not found');
                }
                page.config.push({
                    type: PATH_CONFIG_TYPE.THE_SAME_FOR_COUNTRY,
                    path,
                    countryCode
                })
            },
            addPathsForLanguages: pathsForLanguages => {
                Object.keys(pathsForLanguages).forEach(shortLangCode => {
                    if(!this.languages.some(lang => lang.shortCode === shortLangCode)){
                        throw new Error('Language not found')
                    }
                })
                page.config.push({
                    type: PATH_CONFIG_TYPE.PATHS_FOR_LANGUAGE,
                    pathsForLanguages
                })
            },
            addPathForLocalisationPrefixes: pathsForLocalisationPrefixes => {
                Object.entries(pathsForLocalisationPrefixes).forEach(([localisationPrefix]) => {
                    this.localisationPrefixToLangAndCountry(localisationPrefix);
                })
                page.config.push({
                    type: PATH_CONFIG_TYPE.PATHS_FOR_LOCALISATION_PREFIXES,
                    pathsForLocalisationPrefixes
                })
            }
        }
    }

    getPage(pageId){
        if(!pageId){
            throw new Error('Page id is required');
        }
        const page = this.pages.find(page => page.id === pageId);
        if(!page){
            throw new Error('Page not found');
        }

        const endpoints = [];

        page.config.forEach(config => {
            if(config.type === PATH_CONFIG_TYPE.PATHS_FOR_LOCALISATION_PREFIXES){
                Object.entries(config.pathsForLocalisationPrefixes).forEach(([localisationPrefix, path]) => {
                    const {languageShortCode, countryCode} = this.localisationPrefixToLangAndCountry(localisationPrefix);
                    endpoints.push({
                        url: `/${localisationPrefix}${path}`,
                        language: this.getlanguageByShortCode(languageShortCode),
                        country: this.getCountryByCode(countryCode)
                    })
                })
            }
        });

        return {
            ...page,
            endpoints,
            getUrls: () => endpoints.map(endpoint => endpoint.url)
        };
    }

}

const tdlPageRouterFactory = () => new TdlPageRouter();

module.exports = {tdlPageRouterFactory};


