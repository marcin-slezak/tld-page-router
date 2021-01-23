const { tdlPageRouterFactory, PATH_CONFIG_TYPE } = require('./index');
describe('configuration', () => {
    test('factory method return object', () => {
        const pageRouter = tdlPageRouterFactory();
        expect(pageRouter).toBeTruthy();
    });

    test('set top level domain', () => {
        const pageRouter = tdlPageRouterFactory();
        pageRouter.setTopLevelDomain('example.com');
        expect(pageRouter.topLevelDomain).toBe('example.com');
    });

    test('set top level protocol', () => {
        const pageRouter = tdlPageRouterFactory();
        pageRouter.setTopLevelProtocol('https://');
        expect(pageRouter.topLevelProtocol).toBe('https://');
    });

    test('get country that does not exist', () => {
        const pageRouter = tdlPageRouterFactory();
        const country = {
            code: 'de',
            name: 'Germany'
        };
        pageRouter.addCountry(country);
        expect(pageRouter.getCountryByCode('nl')).toBeFalsy();
    });

    test('get country that exists', () => {
        const pageRouter = tdlPageRouterFactory();
        const country = {
            code: 'de',
            name: 'Germany',
        };
        pageRouter.addCountry(country);
        expect(pageRouter.getCountryByCode('de')).toHaveProperty('name', 'Germany');
    });

    test('get language that does not exist', () => {
        const pageRouter = tdlPageRouterFactory();
        const language = {
            shortCode: 'nl',
            fullCode: 'nl-nl'
        };
        pageRouter.addLanguage(language);
        expect(pageRouter.getlanguageByShortCode('en')).toBeFalsy();
    });

    test('get language that does exist', () => {
        const pageRouter = tdlPageRouterFactory();
        const language = {
            shortCode: 'nl',
            fullCode: 'nl-nl'
        };
        pageRouter.addLanguage(language);
        expect(pageRouter.getlanguageByShortCode('nl')).toMatchObject(language);
    });

    test('add relation between country and language that can not be fulfilled', () => {
        const pageRouter = tdlPageRouterFactory();
        const language = {
            shortCode: 'nl',
            fullCode: 'nl-nl',
            connectedCountries: ['nl']
        };
        expect(() => {
            pageRouter.addLanguage(language);
        }).toThrow();
    });
});

describe('page', () => {
    const getRouter = () => {
        const pageRouter = tdlPageRouterFactory();
        const countryDe = {
            code: 'de',
            name: 'Germany'
        };
        const countryNl = {
            code: 'nl',
            name: 'Netherlands'
        };
        const languageNl = {
            shortCode: 'nl',
            fullCode: 'nl-nl',
            connectedCountries: ['nl']
        };
        const languageDe = {
            shortCode: 'de',
            fullCode: 'de-de',
            connectedCountries: ['de']
        };
        const languageEn = {
            shortCode: 'en',
            fullCode: 'en-us',
            connectedCountries: ['nl']
        };
        pageRouter.addCountry(countryNl);
        pageRouter.addCountry(countryDe);
        pageRouter.addLanguage(languageNl);
        pageRouter.addLanguage(languageDe);
        pageRouter.addLanguage(languageEn);
        return { pageRouter };
    };

    test('add Page an get it back', () => {
        const { pageRouter } = getRouter();
        pageRouter.addPage('HOME');
        expect(pageRouter.getPage('HOME')).toMatchObject({
            id: 'HOME',
        })
    });

    test('addPath', () => {
        const { pageRouter } = getRouter();
        pageRouter.addPage('HOME').addPath('/');
        expect(pageRouter.getPage('HOME')).toMatchObject({
            config: [{
                path: '/'
            }]
        })
    });

    describe('addPathForCountry', () => {
        test('sucessful', () => {
            const { pageRouter } = getRouter();
            pageRouter.addPage('HOME').addPathForCountry('de', '/berlin');
            expect(pageRouter.getPage('HOME')).toMatchObject({
                config: [{
                    path: '/berlin',
                    countryCode: 'de',
                }]
            })
        });
        test('country does not exist', () => {
            const { pageRouter } = getRouter();
            expect(() => {
                pageRouter.addPage('HOME').addPathForCountry('fr', '/berlin');
            }).toThrow();
        });
    });

    describe('addPathsForLanguages', () => {
        test('sucessful', () => {
            const { pageRouter } = getRouter();
            pageRouter.addPage('HOME').addPathsForLanguages({ nl: '/abonamennten', en: '/subscriptions' });
            expect(pageRouter.getPage('HOME')).toMatchObject({
                config: [{
                    pathsForLanguages: { nl: '/abonamennten', en: '/subscriptions' },
                }]
            })
        });
        test('country does not exist', () => {
            const { pageRouter } = getRouter();
            expect(() => {
                pageRouter.addPage('HOME').addPathsForLanguages({ nl: '/abonamennten', pl: '/subscriptions' });
            }).toThrow();
        });
    });

    describe('addPathForLocalisationPrefixes', () => {
        test('sucessful', () => {
            const { pageRouter } = getRouter();
            pageRouter.addPage('HOME').addPathForLocalisationPrefixes({
                'nl-nl': '/abonamennten',
                'nl-en': '/subscriptions'
            });
            expect(pageRouter.getPage('HOME')).toMatchObject({
                config: [{
                    pathsForLocalisationPrefixes: {
                        'nl-nl': '/abonamennten',
                        'nl-en': '/subscriptions'
                    },
                }]
            })
        });
        test('country does not exist', () => {
            const { pageRouter } = getRouter();
            expect(() => {
                pageRouter.addPage('HOME').addPathForLocalisationPrefixes({
                    'fr-fr': '/abonamennten',
                    'nl-en': '/subscriptions'
                });
            }).toThrow();
        });
    });
    describe('getPage', () => {
        test('does not exist', () => {
            const { pageRouter } = getRouter();

            expect(() => {
                pageRouter.getPage("SOME_PAGE_THAT_DOES_NOT_EXIST");
            }).toThrow();
        });
        test('urls generated from addPathForLocalisationPrefixes', () => {
            const { pageRouter } = getRouter();
            pageRouter.addPage('HOME').addPathForLocalisationPrefixes({
                'nl-nl': '/abonamennten',
                'nl-en': '/subscriptions'
            });
            const page = pageRouter.getPage('HOME');
            expect(page).toMatchObject({
                endpoints: [{
                    url: '/nl-nl/abonamennten',
                    language: {
                        shortCode: 'nl',
                        fullCode: 'nl-nl'
                    },
                    country: {
                        code: 'nl',
                        name: 'Netherlands'
                    }
                },
                {
                    url: '/nl-en/subscriptions'
                }]
            });

            expect(page.getUrls()).toMatchObject(['/nl-nl/abonamennten', '/nl-en/subscriptions']);
        });
    })

});